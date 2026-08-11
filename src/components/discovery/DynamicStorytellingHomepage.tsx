import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ArrowRight, Bot, Cpu, Code2, Zap, Compass, CheckCircle2, 
  Gamepad2, Palette, Video, Briefcase, BookOpen, Rocket, Terminal, BrainCircuit, Trophy,
  User as UserIcon, Users, GraduationCap, ChevronRight, RefreshCw, Calendar, Clock, MapPin, Plus, Heart,
  Star, Quote, ThumbsUp, MessageSquare, Award
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  User as AuthUser, Course, LearningPath, ChildProfileData, 
  DiscoveryQuestionOption, CourseClass, CourseReview 
} from '../../types';
import { Interactive3DHeroCanvas } from './Interactive3DHeroCanvas';
import { generateRecommendations } from '../../services/recommendationEngine';
import { 
  getDiscoveryConfig, saveUserDiscoveryProfile, 
  fetchChildProfilesFromFirestore, saveChildProfileInFirestore, logDiscoveryAnalyticsEvent 
} from '../../services/discoveryService';
import { fetchCourseReviewsFromFirestore } from '../../services/firebaseService';
import { getClassesForCourse } from '../../services/classService';
import { VisualLearningJourney } from './VisualLearningJourney';
import { DynamicText } from '../navigation/DynamicText';
import { SectionReveal } from '../navigation/SectionReveal';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { HeroAdvertisement } from '../admin/HeroVideoCMS';
import { EcosystemPlatformsSection } from './EcosystemPlatformsSection';
import { SmartGuideSection } from './SmartGuideSection';
import { 
  fetchEcosystemPlatformsFromFirestore, fetchSmartGuideConfigFromFirestore, 
  fetchFoundationPathConfigFromFirestore, EcosystemPlatform, SmartGuideConfig, FoundationPathConfig 
} from '../../services/homepageCMS';

// Lazy loaded heavy sections
const LearningPathsMap = lazy(() => import('../LearningPathsMap').then(m => ({ default: m.LearningPathsMap })));
const LearningRoadmap = lazy(() => import('../LearningRoadmap').then(m => ({ default: m.LearningRoadmap })));
const CourseCatalog = lazy(() => import('../CourseCatalog').then(m => ({ default: m.CourseCatalog })));
const BranchesSection = lazy(() => import('../BranchesSection').then(m => ({ default: m.BranchesSection })));
const YouTubeAdBanner = lazy(() => import('../YouTubeAdBanner').then(m => ({ default: m.YouTubeAdBanner })));
const FeaturedVideoSection = lazy(() => import('../FeaturedVideoSection').then(m => ({ default: m.FeaturedVideoSection })));

interface DynamicStorytellingHomepageProps {
  currentUser: AuthUser | null;
  courses: Course[];
  learningPaths?: LearningPath[];
  onStartLearning: () => void;
  onExplorePaths: () => void;
  onSelectCourse: (course: Course) => void;
  onOpenAuth: () => void;
  setActiveTab: (tab: string) => void;
  setActiveLabId: (labId: string) => void;
}

export const DynamicStorytellingHomepage: React.FC<DynamicStorytellingHomepageProps> = ({
  currentUser,
  courses,
  learningPaths = [],
  onStartLearning,
  onExplorePaths,
  onSelectCourse,
  onOpenAuth,
  setActiveTab,
  setActiveLabId
}) => {
  const { isArabic, dir } = useLanguage();

  // Scroll animations setup
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.2]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

  // Discovery State
  const [targetAudience, setTargetAudience] = useState<'MY_CHILD' | 'MYSELF' | 'ANOTHER_STUDENT'>('MY_CHILD');
  const [childAge, setChildAge] = useState<number>(8);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Programming', 'Artificial Intelligence']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Build projects', 'Become a programmer']);
  
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isDiscoveryCompleted, setIsDiscoveryCompleted] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Hero Advertisement
  const [heroAd, setHeroAd] = useState<HeroAdvertisement | null>(null);

  // Ecosystem CMS Data
  const [ecosystemPlatforms, setEcosystemPlatforms] = useState<EcosystemPlatform[]>([]);
  const [smartGuide, setSmartGuide] = useState<SmartGuideConfig | null>(null);
  const [foundationConfig, setFoundationConfig] = useState<FoundationPathConfig | null>(null);

  // Parent & Child Profiles
  const [childProfiles, setChildProfiles] = useState<ChildProfileData[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [classAvailabilityMap, setClassAvailabilityMap] = useState<Record<string, number>>({});

  // Fetch real class availability & CMS settings from Firebase
  useEffect(() => {
    logDiscoveryAnalyticsEvent('discovery_started', { userId: currentUser?.id });
    loadClassAvailability();
    loadHeroAd();
    loadCMSData();
    if (currentUser?.id) {
      loadChildProfiles();
    }
  }, [currentUser?.id]);

  const loadCMSData = async () => {
    try {
      const [plats, guide, found] = await Promise.all([
        fetchEcosystemPlatformsFromFirestore(),
        fetchSmartGuideConfigFromFirestore(),
        fetchFoundationPathConfigFromFirestore()
      ]);
      setEcosystemPlatforms(plats);
      setSmartGuide(guide);
      setFoundationConfig(found);
    } catch (err) {
      console.warn('CMS data fetch error:', err);
    }
  };

  const loadHeroAd = async () => {
    try {
      const snap = await getDocs(collection(db, 'advertisements'));
      if (!snap.empty) {
        const docItem = snap.docs.find(d => d.id === 'main_hero_video');
        if (docItem) {
          const ad = { id: docItem.id, ...docItem.data() } as HeroAdvertisement;
          if (ad.enabled) {
            setHeroAd(ad);
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching hero ad', err);
    }
  };

  const loadClassAvailability = async () => {
    try {
      const availMap: Record<string, number> = {};
      for (const course of courses.slice(0, 10)) {
        const classes = await getClassesForCourse(course.id);
        const openSeats = classes
          .filter(c => c.status === 'PUBLISHED' || c.status === 'OPEN_FOR_ENROLLMENT')
          .reduce((sum, c) => sum + Math.max(0, c.capacity - (c.enrolledCount || 0)), 0);
        availMap[course.id] = openSeats;
      }
      setClassAvailabilityMap(availMap);
    } catch (err) {
      console.warn('Class availability fetch error:', err);
    }
  };

  const loadChildProfiles = async () => {
    if (!currentUser?.id) return;
    const profiles = await fetchChildProfilesFromFirestore(currentUser.id);
    setChildProfiles(profiles);
    if (profiles.length > 0) {
      setSelectedChildId(profiles[0].id);
      applyChildProfile(profiles[0]);
    }
  };

  const applyChildProfile = (child: ChildProfileData) => {
    setChildAge(child.age);
    if (child.interests && child.interests.length > 0) setSelectedInterests(child.interests);
    if (child.goals && child.goals.length > 0) setSelectedGoals(child.goals);
    if (child.discoveryProfile?.targetAudience) setTargetAudience(child.discoveryProfile.targetAudience);
  };

  const toggleInterest = (interestValue: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestValue)
        ? prev.filter(i => i !== interestValue)
        : [...prev, interestValue]
    );
  };

  const toggleGoal = (goalValue: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalValue)
        ? prev.filter(g => g !== goalValue)
        : [...prev, goalValue]
    );
  };

  const handleCompleteDiscovery = () => {
    setIsAnalyzing(true);
    logDiscoveryAnalyticsEvent('discovery_completed', {
      targetAudience,
      childAge,
      selectedInterests,
      selectedGoals,
      userId: currentUser?.id
    });

    if (currentUser?.id) {
      saveUserDiscoveryProfile(currentUser.id, {
        targetAudience,
        childAge,
        interests: selectedInterests,
        goals: selectedGoals
      });

      if (selectedChildId) {
        const updatedChild = childProfiles.find(c => c.id === selectedChildId);
        if (updatedChild) {
          saveChildProfileInFirestore(currentUser.id, {
            ...updatedChild,
            age: childAge,
            interests: selectedInterests,
            goals: selectedGoals
          });
        }
      }
    }

    setTimeout(() => {
      setIsAnalyzing(false);
      setIsDiscoveryCompleted(true);
      const recElement = document.getElementById('personalized-recommendations-section');
      if (recElement) {
        recElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1200);
  };

  const recommendations = generateRecommendations({
    age: childAge,
    interests: selectedInterests,
    goals: selectedGoals,
    courses,
    learningPaths,
    enrolledCourseIds: currentUser?.enrolledCourseIds || [],
    classAvailabilityMap
  });

  // Testimonials from Firestore for recommended courses
  const [courseTestimonials, setCourseTestimonials] = useState<CourseReview[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState<boolean>(true);

  useEffect(() => {
    const recommendedIds = recommendations.courseSequence.map(item => item.course.id);
    fetchCourseReviewsFromFirestore(recommendedIds)
      .then(reviews => {
        setCourseTestimonials(reviews);
        setLoadingTestimonials(false);
      })
      .catch(err => {
        console.warn('Failed to load testimonials from Firestore:', err);
        setLoadingTestimonials(false);
      });
  }, [childAge, selectedInterests.join(','), selectedGoals.join(','), courses.length]);

  const dynamicWordsAr = [
    'تعلم ما تحب.',
    'تعلم بالتطبيق.',
    'ابنِ مشاريعك بنفسك.',
    'ابتكر مع الذكاء الاصطناعي.',
    'اصنع مستقبلك التكنولوجي.'
  ];

  const dynamicWordsEn = [
    'Discover What You Love.',
    'Learn By Doing.',
    'Build Real Projects.',
    'Create With AI.',
    'Shape Your Tech Future.'
  ];

  return (
    <div className={`w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white ${dir === 'rtl' ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* ============================================================ */}
      {/* 1. HERO SECTION WITH DYNAMIC ANIMATED HEADLINE & 3D CANVAS  */}
      {/* ============================================================ */}
      <motion.section 
        id="hero"
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-8 pb-16"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {heroAd && heroAd.videoSource ? (
          <div className={`absolute inset-0 z-0 overflow-hidden ${heroAd.controls ? '' : 'pointer-events-none'}`}>
            <video
              src={heroAd.videoSource}
              poster={heroAd.posterImage}
              autoPlay={heroAd.autoplay}
              muted={heroAd.muted}
              playsInline={heroAd.playsInline}
              loop={heroAd.loop}
              controls={heroAd.controls}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-950/80 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute -top-20 -left-20 w-[45vw] h-[45vw] bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-10 -right-10 w-[35vw] h-[35vw] bg-amber-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-start pt-8 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
                SmartTech — Professional EdTech & AI Platform
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]"
            >
              <DynamicText
                words={isArabic ? dynamicWordsAr : dynamicWordsEn}
                mode="blur"
                intervalMs={3000}
                className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-amber-500 to-red-500"
              />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              {isArabic 
                ? "سمارتك أسرع منصة تفاعلية لتعليم البرمجة والذكاء الاصطناعي والروبوتات للأطفال والشباب بأحدث المعايير الدولية."
                : "SmartTech is the premier interactive platform empowering young minds to learn programming, robotics, and AI with real hands-on projects."}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <button 
                onClick={() => {
                  const pathsEl = document.getElementById('learning-paths-map-section') || document.getElementById('discovery-storytelling-wizard');
                  if (pathsEl) pathsEl.scrollIntoView({ behavior: 'smooth' });
                  else onExplorePaths();
                }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-2xl font-black shadow-xl shadow-red-600/25 flex items-center justify-center gap-3 transition-all btn-micro cursor-pointer uppercase tracking-wider"
              >
                <span>{isArabic ? 'استكشف مسارات التعلم 🚀' : 'EXPLORE LEARNING PATHS 🚀'}</span>
                <ArrowRight className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
              </button>

              <button 
                onClick={() => setActiveTab('courses')}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer btn-micro uppercase tracking-wider"
              >
                <Compass className="w-5 h-5 text-red-500" />
                <span>{isArabic ? 'تصفح الكورسات' : 'EXPLORE COURSES'}</span>
              </button>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <Interactive3DHeroCanvas />
          </div>
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/* 2. SMART GUIDE / MENTOR SECTION                              */}
      {/* ============================================================ */}
      {smartGuide && (
        <SmartGuideSection 
          config={smartGuide} 
          currentUser={currentUser}
          onLaunchDiscovery={() => {
            const wiz = document.getElementById('discovery-storytelling-wizard');
            if (wiz) wiz.scrollIntoView({ behavior: 'smooth' });
          }} 
        />
      )}

      {/* ============================================================ */}
      {/* 3. ECOSYSTEM PLATFORMS DISCOVERY ("Explore SmartTech")       */}
      {/* ============================================================ */}
      {ecosystemPlatforms.length > 0 && (
        <EcosystemPlatformsSection platforms={ecosystemPlatforms} />
      )}

      {/* ============================================================ */}
      {/* 2. PHASE 1: STORYTELLING WIZARD                               */}
      {/* ============================================================ */}
      <SectionReveal id="discovery-storytelling-wizard" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
              <Bot className="w-4 h-4" />
              <span>{isArabic ? 'رحلة الاستكشاف التفاعلية' : 'Interactive Discovery Story'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {isArabic ? 'دعنا نكتشف المسار المخصص لك ولطفلك' : "Let's Find the Right Learning Journey"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              {isArabic ? 'أجب عن 3 أسئلة بسيطة ليقوم نظام الذكاء الاصطناعي وربط Firebase بتحليل المسارات والكورسات الشاغرة فوراً.' : 'Answer 3 quick questions. Our AI engine queries real Firebase data to match courses, paths, and active classes.'}
            </p>
          </div>

          {currentUser && childProfiles.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Users className="w-4 h-4 text-red-500" />
                <span>{isArabic ? 'اختر ملف الطفل لتعديل الاستكشاف:' : 'Select Child Profile:'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {childProfiles.map(child => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setSelectedChildId(child.id);
                      applyChildProfile(child);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedChildId === child.id ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
                  >
                    {child.name} ({child.age} {isArabic ? 'سنة' : 'yrs'})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex-1 flex items-center gap-2">
                <div 
                  onClick={() => setActiveStep(step)}
                  className={`w-10 h-10 rounded-full font-black text-sm flex items-center justify-center cursor-pointer transition-all ${
                    activeStep === step 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-110 ring-4 ring-red-500/20' 
                      : activeStep > step 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {activeStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`h-1 flex-1 rounded-full transition-colors ${activeStep > step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative min-h-[380px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {activeStep === 1 && (
                <motion.div 
                  key="q1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">السؤال الأول / Question 1</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {isArabic ? 'لمن نختار رحلة التعلم اليوم؟' : 'Who are we choosing a learning journey for?'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'MY_CHILD', icon: UserIcon, labelAr: 'طفلي / ابني / ابنتي', labelEn: 'My Child', descAr: 'رحلات تعليمية مخصصة للنشء واليافعين' },
                      { id: 'MYSELF', icon: GraduationCap, labelAr: 'لنفسي (طالب / كبار)', labelEn: 'Myself', descAr: 'تعلم البرمجة بنفسي المباشر' },
                      { id: 'ANOTHER_STUDENT', icon: Users, labelAr: 'طالب آخر (قريب)', labelEn: 'Another Student', descAr: 'تسجيل أو إهداء دورة لمستفيد آخر' }
                    ].map(opt => {
                      const Icon = opt.icon;
                      const isSelected = targetAudience === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setTargetAudience(opt.id as any)}
                          className={`p-6 rounded-2xl border text-start transition-all cursor-pointer btn-micro ${
                            isSelected 
                              ? 'border-red-600 bg-red-500/5 dark:bg-red-500/10 ring-2 ring-red-500/30 shadow-lg' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{isArabic ? opt.labelAr : opt.labelEn}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{opt.descAr}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-black text-slate-900 dark:text-white">
                        {isArabic ? 'كم عمر المتعلم / الطفل؟' : 'How old is the learner?'}
                      </label>
                      <span className="px-4 py-1.5 bg-red-600 text-white font-black text-lg rounded-xl shadow-md">
                        {childAge} {isArabic ? 'سنوات' : 'Years Old'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(ageVal => (
                        <button
                          key={ageVal}
                          onClick={() => setChildAge(ageVal)}
                          className={`w-11 h-11 rounded-xl font-black text-sm transition-all cursor-pointer btn-micro ${
                            childAge === ageVal 
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {ageVal}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div 
                  key="q2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">السؤال الثاني / Question 2</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {isArabic ? 'ما هي المجالات الأكثر اهتماماً لديكم؟ (يمكنك اختيار أكثر من مجال)' : 'What is the learner most interested in? (Multiple Selections)'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: 'Programming', icon: Code2, labelAr: 'البرمجة والتكود', labelEn: 'Programming', color: 'from-amber-500 to-orange-600' },
                      { id: 'Artificial Intelligence', icon: Sparkles, labelAr: 'الذكاء الاصطناعي AI', labelEn: 'AI & Data', color: 'from-purple-500 to-indigo-600' },
                      { id: 'Robotics', icon: Bot, labelAr: 'الروبوتات والميكانيكا', labelEn: 'Robotics', color: 'from-blue-500 to-cyan-600' },
                      { id: 'Electronics', icon: Cpu, labelAr: 'الإلكترونيات و Arduino', labelEn: 'Electronics', color: 'from-emerald-500 to-teal-600' },
                      { id: 'Game Development', icon: Gamepad2, labelAr: 'تطوير وصناعة الألعاب', labelEn: 'Game Dev', color: 'from-red-500 to-pink-600' },
                      { id: 'Creative Design', icon: Palette, labelAr: 'التصميم الجرافيكي', labelEn: 'Design', color: 'from-fuchsia-500 to-pink-500' },
                      { id: 'Video & Content Creation', icon: Video, labelAr: 'صناعة وصانع المحتوى', labelEn: 'Video Creation', color: 'from-amber-600 to-red-600' },
                      { id: 'Business', icon: Briefcase, labelAr: 'ريادة الأعمال والتك', labelEn: 'Business Tech', color: 'from-slate-700 to-slate-900' }
                    ].map(item => {
                      const Icon = item.icon;
                      const isSelected = selectedInterests.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleInterest(item.id)}
                          className={`p-5 rounded-2xl border text-start transition-all cursor-pointer relative overflow-hidden btn-micro ${
                            isSelected 
                              ? 'border-red-600 bg-red-500/10 dark:bg-red-500/20 ring-2 ring-red-500 shadow-md' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                          )}
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-3 shadow-md`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                            {isArabic ? item.labelAr : item.labelEn}
                          </h4>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div 
                  key="q3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">السؤال الثالث / Question 3</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {isArabic ? 'ما الهدف والغاية المطلوب تحقيقها؟' : 'What would you like the learner to achieve?'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'Learn the basics', icon: BookOpen, labelAr: 'تعلم الأساسيات والمنطق التكنولوجي', labelEn: 'Learn the basics' },
                      { id: 'Build projects', icon: Rocket, labelAr: 'بناء وتصميم مشاريع عملي حقيقية', labelEn: 'Build projects' },
                      { id: 'Become a programmer', icon: Terminal, labelAr: 'الاحتراف كمبرمج صغير ومصمم أكواد', labelEn: 'Become a programmer' },
                      { id: 'Learn AI', icon: BrainCircuit, labelAr: 'استكشاف وتطبيق الذكاء الاصطناعي', labelEn: 'Learn AI' },
                      { id: 'Build robots', icon: Zap, labelAr: 'تركيب وتوجيه الروبوتات الذكية', labelEn: 'Build robots' },
                      { id: 'Prepare for future careers', icon: Trophy, labelAr: 'التأهيل للمسابقات ومستقبل التكنولوجيا', labelEn: 'Prepare for future careers' }
                    ].map(goal => {
                      const Icon = goal.icon;
                      const isSelected = selectedGoals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={`p-5 rounded-2xl border text-start flex items-center gap-4 transition-all cursor-pointer btn-micro ${
                            isSelected 
                              ? 'border-red-600 bg-red-500/10 dark:bg-red-500/20 ring-2 ring-red-500 shadow-md' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{isArabic ? goal.labelAr : goal.labelEn}</h4>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800 mt-8">
              <button
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                disabled={activeStep === 1}
                className="px-6 py-3 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 cursor-pointer"
              >
                {isArabic ? 'السابق' : 'Previous'}
              </button>

              {activeStep < 3 ? (
                <button
                  onClick={() => setActiveStep(prev => Math.min(3, prev + 1))}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer btn-micro"
                >
                  <span>{isArabic ? 'التالي' : 'Next'}</span>
                  <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  onClick={handleCompleteDiscovery}
                  disabled={isAnalyzing}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-base rounded-2xl shadow-xl shadow-red-600/30 flex items-center gap-2 transition-transform cursor-pointer btn-micro"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{isArabic ? 'جاري تحليل بيانات Firebase...' : 'Analyzing Firebase Data...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>{isArabic ? 'عرض النتائج المخصصة 🎯' : 'Show My Personalized Journey 🎯'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </SectionReveal>

      {/* ============================================================ */}
      {/* 3. PHASE 2: PERSONALIZED DISCOVERY RESULTS                   */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isDiscoveryCompleted && (
          <SectionReveal id="personalized-recommendations-section" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto space-y-16">
              
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 text-white shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-black mb-3">
                      <Sparkles className="w-4 h-4" />
                      <span>{isArabic ? 'نتائج مطابقة Firebase المخصصة' : 'Personalized Firebase Recommendations'}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black">
                      {isArabic ? 'بناءً على التفضيلات التي اخترتها...' : 'Based on what you told us...'}
                    </h2>
                    <p className="text-slate-300 text-sm font-medium mt-1">
                      {isArabic 
                        ? `العمر: ${childAge} سنوات | الاهتمامات: ${selectedInterests.join(' • ')}` 
                        : `Age: ${childAge} yrs | Interests: ${selectedInterests.join(' • ')}`}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsDiscoveryCompleted(false);
                      setActiveStep(1);
                    }}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-colors flex items-center gap-2 cursor-pointer btn-micro"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{isArabic ? 'تعديل الاختيارات' : 'Modify Choices'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 relative z-10">
                  {recommendations.recommendedInterests.map(interest => (
                    <span key={interest} className="px-3 py-1 rounded-lg bg-white/10 text-amber-300 text-xs font-bold border border-white/10">
                      #{interest}
                    </span>
                  ))}
                </div>
              </div>

              {recommendations.courseSequence.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-8 bg-red-600 rounded-full" />
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {isArabic ? '🚀 ابدأ من هنا (START HERE)' : '🚀 START HERE'}
                    </h3>
                  </div>

                  {(() => {
                    const startItem = recommendations.courseSequence[0];
                    const course = startItem.course;
                    return (
                      <div className="p-8 rounded-3xl bg-gradient-to-br from-red-500/10 via-amber-500/5 to-transparent border-2 border-red-500/30 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-5 aspect-video rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
                          <img 
                            src={course.image || course.bannerImage || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80'} 
                            alt={course.titleEn} 
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full shadow-md">
                            START HERE
                          </span>
                        </div>

                        <div className="lg:col-span-7 space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-black rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isArabic ? startItem.reasonAr : startItem.reasonEn}</span>
                          </div>

                          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                            {isArabic ? course.titleAr : course.titleEn}
                          </h3>

                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium">
                            {isArabic ? course.descriptionAr : course.descriptionEn}
                          </p>

                          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500 pt-2">
                            <span>العمر: {course.ageMin}–{course.ageMax} سنة</span>
                            <span>المستوى: {course.levelAr}</span>
                            <span>المدة: {course.durationWeeks} أسابيع</span>
                          </div>

                          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
                            <div>
                              <span className="text-2xl font-black text-red-600 dark:text-red-400">
                                {course.discountPrice > 0 ? course.discountPrice : course.originalPrice} EGP
                              </span>
                              {course.discountPrice > 0 && (
                                <span className="text-sm text-slate-400 line-through mr-2">
                                  {course.originalPrice} EGP
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => onSelectCourse(course)}
                              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-600/20 transition-transform cursor-pointer btn-micro"
                            >
                              {isArabic ? 'احجز الآن / تفاصيل الدورة ⚡' : 'Book Now / View Details ⚡'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-8 bg-amber-500 rounded-full" />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {isArabic ? 'المسار التدريجي المقترح (Course Sequence)' : 'Recommended Course Sequence'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.courseSequence.map((item) => (
                    <div 
                      key={item.course.id}
                      onClick={() => onSelectCourse(item.course)}
                      className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-red-500/50 transition-all shadow-sm hover:shadow-xl space-y-4 cursor-pointer relative group btn-micro"
                    >
                      <div className="flex justify-between items-center">
                        <span className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm flex items-center justify-center">
                          #{item.stepNumber}
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg">
                          {item.availableClassesCount > 0 ? `${item.availableClassesCount} مقاعد متاحة` : 'مقاعد أونلاين'}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                        {isArabic ? item.course.titleAr : item.course.titleEn}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {isArabic ? item.reasonAr : item.reasonEn}
                      </p>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">{item.course.durationWeeks} أسابيع</span>
                        <span className="text-red-600 font-black">{item.course.discountPrice || item.course.originalPrice} EGP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Interactive Learning Journey Component */}
              <VisualLearningJourney
                recommendationResult={recommendations}
                onSelectCourse={onSelectCourse}
                onBookClass={onSelectCourse}
              />

              {/* 🌟 STUDENT TESTIMONIALS SECTION (PULLED FROM FIRESTORE) */}
              <div id="student-testimonials-section" className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                      <span>{isArabic ? 'آراء وتجارب من قاعدة بيانات Firestore 🌟' : 'Verified Reviews from Firestore 🌟'}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Quote className="w-7 h-7 text-red-500 shrink-0" />
                      <span>{isArabic ? 'تجارب وآراء الطلاب في الكورسات المرشحة' : 'Student & Parent Testimonials for Recommended Courses'}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                      {isArabic 
                        ? 'اقرأ تجارب حقيقية لأولياء الأمور والطلاب الذين أتموا مشروعاتهم في هذه الكورسات بنجاح بمركز سمارتك.'
                        : 'Read real reviews from students and parents who completed projects in these recommended courses.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <ThumbsUp className="w-4 h-4 text-emerald-500" />
                    <span>{isArabic ? 'نسبة الرضا 99.4% على جميع الكورسات' : '99.4% Satisfaction Rate'}</span>
                  </div>
                </div>

                {loadingTestimonials ? (
                  <div className="p-8 text-center bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                    <span>{isArabic ? 'جاري تحميل آراء الطلاب من Firestore...' : 'Loading student testimonials from Firestore...'}</span>
                  </div>
                ) : courseTestimonials.length === 0 ? (
                  <div className="p-8 text-center bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                    {isArabic ? 'لا توجد آراء مسجلة لهذه الدورة حالياً.' : 'No testimonials recorded for this course yet.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courseTestimonials.map((item) => (
                      <div 
                        key={item.id}
                        className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-red-500/40 transition-all shadow-sm hover:shadow-xl space-y-4 relative group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Top Rating & Verified Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {Array.from({ length: item.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                              ))}
                            </div>
                            {item.verifiedStudent && (
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                <span>{isArabic ? 'طالب معتمد' : 'Verified'}</span>
                              </span>
                            )}
                          </div>

                          {/* Target Course Title Tag */}
                          {item.courseTitleAr && (
                            <div className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg inline-block line-clamp-1">
                              {item.courseTitleAr}
                            </div>
                          )}

                          {/* Review Text */}
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic relative z-10">
                            "{item.reviewText}"
                          </p>
                        </div>

                        {/* Author Info */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={item.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'} 
                              alt={item.studentName}
                              className="w-9 h-9 rounded-full object-cover border border-amber-500/30" 
                            />
                            <div>
                              <h5 className="text-xs font-black text-slate-900 dark:text-white">{item.studentName}</h5>
                              <span className="text-[10px] text-slate-400 block">{item.date || 'تقييم حقيقي'}</span>
                            </div>
                          </div>
                          <Quote className="w-5 h-5 text-slate-300 dark:text-slate-700 shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </SectionReveal>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 4. FEATURED SECTIONS WITH LAZY LOAD & SMOOTH REVEALS         */}
      {/* ============================================================ */}

      <Suspense fallback={null}>
        <YouTubeAdBanner currentUser={currentUser} />
      </Suspense>

      <Suspense fallback={null}>
        <FeaturedVideoSection 
          isAdmin={currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'}
          userRole={currentUser?.role}
          courses={courses}
        />
      </Suspense>

      <SectionReveal id="interactive-labs-section" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
              {isArabic ? 'المعامل التفاعلية (Interactive Labs)' : 'Interactive Labs'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isArabic ? 'جرب بنفسك قبل أن تبدأ. بيئات عمل حقيقية للبرمجة والروبوتات داخل المتصفح.' : 'Try it yourself before you start. Real coding and robotics environments right in your browser.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'scratch', icon: Gamepad2, titleAr: 'برمجة سكراتش', titleEn: 'Scratch Coding', descAr: 'برمجة بصرية ممتعة', descEn: 'Visual block programming', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50/50 dark:bg-amber-950/20' },
              { id: 'arduino', icon: Zap, titleAr: 'محاكي أردوينو', titleEn: 'Arduino Simulator', descAr: 'تصميم الدوائر الإلكترونية', descEn: 'Circuit design & code', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
              { id: 'robotics', icon: Bot, titleAr: 'روبوتات', titleEn: 'Robotics Lab', descAr: 'تحكم في الروبوتات الذكية', descEn: 'Control smart robots', color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50/50 dark:bg-blue-950/20' },
              { id: 'ai', icon: Sparkles, titleAr: 'مختبر الذكاء الاصطناعي', titleEn: 'AI Sandbox', descAr: 'اكتشف قدرات نماذج AI', descEn: 'Explore AI models', color: 'from-red-400 to-pink-500', bg: 'bg-red-50/50 dark:bg-red-950/20' }
            ].map((lab) => {
              const Icon = lab.icon;
              return (
                <button
                  key={lab.id}
                  onClick={() => {
                    setActiveLabId(lab.id);
                    setActiveTab('labs');
                  }}
                  className={`p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-start shadow-sm hover:shadow-2xl transition-all duration-300 ${lab.bg} dark:bg-slate-900 cursor-pointer group relative overflow-hidden btn-micro`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lab.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2">{isArabic ? lab.titleAr : lab.titleEn}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{isArabic ? lab.descAr : lab.descEn}</p>
                </button>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      <SectionReveal id="featured-courses-section" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{isArabic ? 'الكورسات المميزة' : 'Featured Courses'}</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{isArabic ? 'ابدأ رحلة التعلم مع أفضل كورسات التكنولوجيا' : 'Start your learning journey with our top tech courses'}</p>
            </div>
            <button 
              onClick={() => setActiveTab('courses')}
              className="text-red-600 font-bold hover:text-red-700 flex items-center gap-2 cursor-pointer btn-micro"
            >
              {isArabic ? 'عرض كل الكورسات' : 'View All Courses'}
              <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="group relative bg-white dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-red-500/50 transition-all shadow-sm hover:shadow-xl cursor-pointer btn-micro"
              >
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  <img src={course.image || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80'} alt={course.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-xs font-bold">
                    {course.ageMin}-{course.ageMax} {isArabic ? 'سنة' : 'yrs'}
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                    {isArabic ? course.titleAr : course.titleEn}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {isArabic ? course.descriptionAr : course.descriptionEn}
                  </p>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{course.levelAr}</span>
                    <span className="font-black text-red-600">{course.discountPrice || course.originalPrice} EGP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      <Suspense fallback={<div className="h-48 flex items-center justify-center text-slate-400"><RefreshCw className="w-8 h-8 animate-spin" /></div>}>
        <LearningPathsMap paths={learningPaths} onSelectPath={() => setActiveTab('courses')} />
      </Suspense>

      <Suspense fallback={null}>
        <LearningRoadmap courses={courses} currentUser={currentUser} onSelectCourse={onSelectCourse} />
      </Suspense>

      <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-400"><RefreshCw className="w-8 h-8 animate-spin" /></div>}>
        <CourseCatalog courses={courses} onSelectCourse={onSelectCourse} currentUser={currentUser} onOpenAuth={onOpenAuth} />
      </Suspense>

      <Suspense fallback={null}>
        <BranchesSection />
      </Suspense>

    </div>
  );
};
