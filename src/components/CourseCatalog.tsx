import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Course, User, Role, LearningDNA } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Compass,
  Wrench,
  Gamepad2,
  Palette,
  BrainCircuit,
  Globe2,
  Briefcase,
  Video,
  Bot,
  Search,
  Rocket,
  Clock,
  Users,
  BookOpen,
  RotateCcw,
  Flame,
  Zap,
  GraduationCap,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Award,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Monitor,
  Camera,
  Cpu,
  Target,
  Smile,
  ShieldCheck,
  Building,
  TrendingUp,
  FileCode,
  Laptop
} from 'lucide-react';

interface CourseCatalogProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  currentUser?: User | null;
  onOpenAuth?: (role?: Role) => void;
}

// -------------------------------------------------------------
// CONFIGURATIONS FOR DISCOVERY ENGINE
// -------------------------------------------------------------

export interface InterestOption {
  id: string;
  titleAr: string;
  subtitleAr: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  categories: string[];
  keywords: string[];
}

export const INTEREST_OPTIONS: InterestOption[] = [
  {
    id: 'ai',
    titleAr: 'الذكاء الاصطناعي والابتكار',
    subtitleAr: 'ChatGPT, Midjourney, AI Tools, Prompt Engineering, Automation',
    icon: Bot,
    color: 'text-violet-400',
    gradient: 'from-violet-600 to-indigo-600',
    categories: ['ai'],
    keywords: ['ai', 'chatgpt', 'midjourney', 'prompt', 'automation', 'ذكاء اصطناعي', 'أتمتة', 'توليد']
  },
  {
    id: 'gaming_coding',
    titleAr: 'الألعاب والتكود البرمجي',
    subtitleAr: 'Scratch, Python, Game Dev, Mobile Apps, Algorithms',
    icon: Gamepad2,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600',
    categories: ['programming'],
    keywords: ['game', 'scratch', 'python', 'coding', 'programming', 'برمجة', 'ألعاب', 'تطبيقات', 'كود']
  },
  {
    id: 'robotics_assembly',
    titleAr: 'الروبوتات والفك والتركيب',
    subtitleAr: 'LEGO Robotics, Mechanics, Motors, Sensors',
    icon: Wrench,
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    categories: ['robotics'],
    keywords: ['robotics', 'lego', 'mechanics', 'motors', 'روبوت', 'ميكانيكا', 'تركيب', 'مكعبات']
  },
  {
    id: 'electronics_hardware',
    titleAr: 'الإلكترونيات والدوائر الذكية',
    subtitleAr: 'Arduino, ESP32, Breadboards, Sensors, Smart Home IoT',
    icon: Zap,
    color: 'text-purple-400',
    gradient: 'from-purple-600 to-fuchsia-600',
    categories: ['electronics'],
    keywords: ['arduino', 'esp32', 'electronics', 'circuits', 'iot', 'أردوينو', 'دوائر', 'إلكترونيات']
  },
  {
    id: 'design_graphics',
    titleAr: 'الرسم والتصميم الجرافيكي',
    subtitleAr: 'Photoshop, Illustrator, Canva, UI/UX, Fine Arts',
    icon: Palette,
    color: 'text-pink-400',
    gradient: 'from-pink-500 to-rose-600',
    categories: ['arts'],
    keywords: ['design', 'photoshop', 'illustrator', 'canva', 'ui', 'ux', 'تصميم', 'جرافيك', 'رسم', 'فن']
  },
  {
    id: 'photography_video',
    titleAr: 'التصوير والمونتاج وصناعة السينما',
    subtitleAr: 'CapCut Pro, Video Editing, Mobile Cinematography, AI Video',
    icon: Camera,
    color: 'text-red-400',
    gradient: 'from-red-500 to-rose-600',
    categories: ['ai', 'arts'],
    keywords: ['video', 'capcut', 'editing', 'camera', 'مونتاج', 'فيديو', 'تصوير', 'سينما']
  },
  {
    id: 'content_creation',
    titleAr: 'صناعة المحتوى والريلز',
    subtitleAr: 'Social Media Content, Reels, YouTube, Digital Storytelling',
    icon: Video,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-amber-600',
    categories: ['ai', 'business'],
    keywords: ['content', 'reels', 'youtube', 'social', 'محتوى', 'ريلز', 'سوشيال']
  },
  {
    id: 'languages_english',
    titleAr: 'اللغات والتواصل والقيادة',
    subtitleAr: 'English Conversation, Presentation, Leadership, Soft Skills',
    icon: Globe2,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
    categories: ['english'],
    keywords: ['english', 'speaking', 'grammar', 'communication', 'إنجليزي', 'لغات', 'تواصل', 'محادثة']
  },
  {
    id: 'math_iq',
    titleAr: 'الحساب الذهني والذكاء IQ',
    subtitleAr: 'Abacus, Mental Math, Logic Puzzles, Problem Solving',
    icon: Cpu,
    color: 'text-sky-400',
    gradient: 'from-sky-500 to-blue-600',
    categories: ['stem'],
    keywords: ['math', 'abacus', 'iq', 'logic', 'حساب', 'ذهني', 'ذكاء', 'منطق']
  },
  {
    id: 'business_marketing',
    titleAr: 'البيزنس والتسويق الإلكتروني',
    subtitleAr: 'Digital Marketing, Social Media Ads, Sales, Entrepreneurship',
    icon: Briefcase,
    color: 'text-emerald-500',
    gradient: 'from-emerald-600 to-green-700',
    categories: ['business'],
    keywords: ['business', 'marketing', 'ads', 'facebook', 'بيزنس', 'تسويق', 'إعلانات', 'تجارة']
  },
  {
    id: 'computer_workplace',
    titleAr: 'أساسيات الكمبيوتر والعمل الرقمي',
    subtitleAr: 'Windows, Word, Excel, PowerPoint, Google Workspace, Fast Typing',
    icon: Laptop,
    color: 'text-indigo-400',
    gradient: 'from-indigo-500 to-blue-700',
    categories: ['diploma'],
    keywords: ['computer', 'excel', 'word', 'office', 'windows', 'كمبيوتر', 'إكسل', 'وورد', 'أوفيس', 'مكتب']
  },
  {
    id: 'personal_growth',
    titleAr: 'تطوير الذات والمهارات الحياتية',
    subtitleAr: 'Time Management, Productivity, Mindset, Future Readiness',
    icon: Rocket,
    color: 'text-amber-300',
    gradient: 'from-amber-400 to-yellow-600',
    categories: ['diploma', 'english'],
    keywords: ['growth', 'skills', 'productivity', 'تطوير', 'إنتاجية', 'مهارات']
  }
];

export interface LearningPathTemplate {
  id: string;
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  descriptionAr: string;
  targetUserAr: string;
  estimatedWeeks: number;
  stages: {
    number: string;
    titleAr: string;
    subtitleAr: string;
    courseCode?: string;
  }[];
  colorGradient: string;
}

export const PATH_TEMPLATES: LearningPathTemplate[] = [
  {
    id: 'path-ai-specialist',
    titleAr: 'مسار خبير الذكاء الاصطناعي والتطبيقات Smart AI Path',
    titleEn: 'AI & Automation Master Track',
    badgeAr: 'مسار الذكاء الاصطناعي الأول',
    descriptionAr: 'من التأسيس في مفاهيم وتوليد AI إلى أتمتة الأعمال وبناء الوكلاء الذكيين وتطبيقات الذكاء الاصطناعي.',
    targetUserAr: 'لكل من يريد ركوب ثورة الذكاء الاصطناعي والتفوق في عمله أو دراسته.',
    estimatedWeeks: 12,
    stages: [
      { number: '01', titleAr: 'AI Mastery Diploma', subtitleAr: 'إعدادي هندسة الذكاء الاصطناعي — التأسيس والتوليد' },
      { number: '02', titleAr: 'AI Content & Video Creation', subtitleAr: 'صناعة المحتوى والمونتاج وتوليد الفيديو بـ CapCut & AI' },
      { number: '03', titleAr: 'AI Business Automation', subtitleAr: 'أتمتة مهام الشركات والربط الذكي بالـ APIs' },
      { number: '04', titleAr: 'AI Developer Applications', subtitleAr: 'بناء وتطوير تطبيقات ومساعدين ذكيين ببرمجة Python & AI' }
    ],
    colorGradient: 'from-violet-600 via-indigo-600 to-blue-700'
  },
  {
    id: 'path-digital-employee',
    titleAr: 'مسار الموظف الرقمي والعمل الذكي Digital Workplace Path',
    titleEn: 'Digital Employee & Professional Workplace',
    badgeAr: 'مسار التأسيس وسوق العمل',
    descriptionAr: 'الانتقال السريع من الصفر في الكمبيوتر والأوفيس إلى إتقان أدوات Google السحابية وأدوات إنتاجية الذكاء الاصطناعي.',
    targetUserAr: 'للمبتدئين والموظفين والخريجين الراغبين في التأسيس القوي وسرعة الحصول على عمل.',
    estimatedWeeks: 8,
    stages: [
      { number: '01', titleAr: 'Digital Employee Diploma', subtitleAr: 'تأسيس الويندوز وأوفيس والكتابة السريعة والأيميل السحابي' },
      { number: '02', titleAr: 'Google Workspace & Cloud Mastery', subtitleAr: 'إدارة الملفات والنماذج وجداول البيانات التفاعلية' },
      { number: '03', titleAr: 'AI Productivity for Office', subtitleAr: 'مضاعفة إنتاجية العمل المكتبي بأدوات الذكاء الاصطناعي' },
      { number: '04', titleAr: 'Specialized Path Choice', subtitleAr: 'الانتقال للجرافيك أو التسويق الرقمي أو الذكاء الاصطناعي' }
    ],
    colorGradient: 'from-indigo-600 via-blue-600 to-cyan-700'
  },
  {
    id: 'path-junior-coder',
    titleAr: 'مسار المبرمج الصغير وصانع الألعاب Young Programmer Path',
    titleEn: 'Junior Game Coder & AI Explorer',
    badgeAr: 'مسار البرمجة للأطفال والناشئين',
    descriptionAr: 'رحلة تفاعلية تبدأ ببرمجة البلوكات المرئية وتركيب الألعاب إلى الرؤية الحاسوبية وتطبيقات أندرويد.',
    targetUserAr: 'للأطفال والناشئين من سن 6 إلى 14 سنة الشغوفين بالألعاب والتكنولوجيا.',
    estimatedWeeks: 12,
    stages: [
      { number: '01', titleAr: 'المبرمج الصغير (Scratch & Pictoblox)', subtitleAr: 'أساسيات المنطق البرمجي وصناعة 10+ ألعاب تفاعلية' },
      { number: '02', titleAr: 'مبرمج المستقبل (App Inventor & AI)', subtitleAr: 'تطوير تطبيقات الموبايل الحقيقية والتعرف على الوجوه' },
      { number: '03', titleAr: 'Python & Game Physics', subtitleAr: 'الانتقال للأكواد المكتوبة والفيزياء البرمجية' },
      { number: '04', titleAr: 'AI Animated Drawings & Art', subtitleAr: 'تحريك الرسومات وتوليد القصص بالذكاء الاصطناعي' }
    ],
    colorGradient: 'from-cyan-600 via-blue-600 to-indigo-700'
  },
  {
    id: 'path-future-engineer',
    titleAr: 'مسار مهندس المستقبل والروبوتات Robotics & Hardware Engineer',
    titleEn: 'Junior Robotics & IoT Maker',
    badgeAr: 'مسار الهندسة والإلكترونيات',
    descriptionAr: 'بناء الأجهزة الفيزيائية الملموسة من تركيب قطع LEGO الروبوتية وصولاً للأردوينو والإنترنت الذكي ESP32.',
    targetUserAr: 'للأطفال والشباب محبي الفك والتركيب والتجارب الهندسية العملية.',
    estimatedWeeks: 12,
    stages: [
      { number: '01', titleAr: 'المهندس الصغير (LEGO Robotics)', subtitleAr: 'الميكانيكا، التروس، المحركات وحساسات الألوان' },
      { number: '02', titleAr: 'مهندس المستقبل (Arduino & Electronics)', subtitleAr: 'توصيل اللوحات، المقاومات وكتابة أكواد C++' },
      { number: '03', titleAr: 'Autonomous Robot Arena', subtitleAr: 'بناء سيارة روبوت ذاتية القيادة لتفادي العوائق' },
      { number: '04', titleAr: 'Smart Home IoT (ESP32)', subtitleAr: 'ربط الاختراعات بالواي فاي والتحكم بالموبايل' }
    ],
    colorGradient: 'from-amber-500 via-orange-600 to-red-600'
  },
  {
    id: 'path-creative-designer',
    titleAr: 'مسار المبدع الرقمي والغرافيك Creative Designer & Content',
    titleEn: 'Digital Art, Graphics & Media Master',
    badgeAr: 'مسار التصميم والفنون الرقمية',
    descriptionAr: 'من الهويات البصرية والشعارات ببرامج أدوية إلى المونتاج الاحترافي CapCut وصناعة الأفلام بالـAI.',
    targetUserAr: 'للموهوبين في الرسم، التصميم البصري وصناعة الفيديوهات والمحتوى.',
    estimatedWeeks: 10,
    stages: [
      { number: '01', titleAr: 'دبلومة الجرافيك الشاملة (Graphics Master)', subtitleAr: 'Photoshop + Illustrator + InDesign والهويات البصرية' },
      { number: '02', titleAr: 'CapCut Pro & Mobile Cinematography', subtitleAr: 'المونتاج الديناميكي وصناعة الريلز والفيديوهات القصيرة' },
      { number: '03', titleAr: 'AI Animation & Generative Art', subtitleAr: 'توليد الصور والشخصيات وتحريك الأنيميشن بالـAI' },
      { number: '04', titleAr: 'Digital Marketing & Social Showcase', subtitleAr: 'إطلاق الحملات وتسويق الأعمال أونلاين' }
    ],
    colorGradient: 'from-pink-600 via-rose-600 to-purple-700'
  }
];

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  onSelectCourse,
  currentUser,
  onOpenAuth
}) => {
  const { isArabic, dir, t, getLocalized } = useLanguage();

  // Navigation Refs
  const discoveryWizardRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const allCoursesSectionRef = useRef<HTMLDivElement>(null);

  // Search state for All Courses
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Wizard active step (1 to 7)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [wizardCompleted, setWizardCompleted] = useState<boolean>(false);

  // Wizard answers state
  const [dna, setDna] = useState<LearningDNA>(() => {
    const saved = localStorage.getItem('smarttech_learning_dna');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved DNA:', e);
      }
    }
    return {
      userType: '',
      age: 12,
      interests: [],
      computerExperience: '',
      aiExperience: '',
      goals: [],
      learningStyles: []
    };
  });

  useEffect(() => {
    if (dna.interests.length > 0 || dna.userType) {
      localStorage.setItem('smarttech_learning_dna', JSON.stringify(dna));
    }
  }, [dna]);

  // Scroll helper
  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStartDiscovery = () => {
    setCurrentStep(1);
    scrollToRef(discoveryWizardRef);
  };

  const handleToggleInterest = (id: string) => {
    setDna((prev) => {
      const exists = prev.interests.includes(id);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((i) => i !== id) : [...prev.interests, id]
      };
    });
  };

  const handleToggleGoal = (goal: string) => {
    setDna((prev) => {
      const exists = prev.goals.includes(goal);
      return {
        ...prev,
        goals: exists ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal]
      };
    });
  };

  const handleToggleStyle = (style: string) => {
    setDna((prev) => {
      const exists = prev.learningStyles.includes(style);
      return {
        ...prev,
        learningStyles: exists ? prev.learningStyles.filter((s) => s !== style) : [...prev.learningStyles, style]
      };
    });
  };

  const handleFinishWizard = () => {
    setWizardCompleted(true);
    setTimeout(() => {
      scrollToRef(resultsRef);
    }, 100);
  };

  const handleResetWizard = () => {
    setCurrentStep(1);
    setWizardCompleted(false);
    scrollToRef(discoveryWizardRef);
  };

  // -------------------------------------------------------------
  // RECOMMENDATION SCORING ENGINE (#4 & #9)
  // -------------------------------------------------------------
  const scoredCourses = useMemo(() => {
    return courses.map((course) => {
      let score = 0;
      const courseText = `${course.titleAr} ${course.titleEn} ${course.descriptionAr} ${course.skills.join(' ')} ${course.category}`.toLowerCase();

      // 1. Direct Interest Match (+5 points per match)
      dna.interests.forEach((interestId) => {
        const option = INTEREST_OPTIONS.find((o) => o.id === interestId);
        if (option) {
          if (option.categories.includes(course.category)) {
            score += 5;
          }
          option.keywords.forEach((kw) => {
            if (courseText.includes(kw.toLowerCase())) {
              score += 2;
            }
          });
        }
      });

      // 2. Age Suitability Match (+4 points)
      if (dna.age) {
        if (dna.age >= course.ageMin && dna.age <= course.ageMax) {
          score += 4;
        } else if (Math.abs(dna.age - course.ageMin) <= 2) {
          score += 2;
        }
      }

      // 3. Goal Match (+4 points)
      dna.goals.forEach((goal) => {
        if (goal.includes('AI') && (course.category === 'ai' || courseText.includes('ai'))) score += 4;
        if (goal.includes('سوق العمل') && (course.category === 'diploma' || course.category === 'business')) score += 4;
        if (goal.includes('البرمجة') && course.category === 'programming') score += 4;
        if (goal.includes('طفل') && (course.ageMax <= 12)) score += 4;
        if (goal.includes('Freelance') && (course.category === 'arts' || course.category === 'ai')) score += 3;
      });

      // 4. Market Priority Boost (#4)
      // AI Priority Boost
      if (dna.interests.includes('ai') || dna.goals.some((g) => g.includes('AI'))) {
        if (course.id === 'c-ai-mastery' || course.category === 'ai') {
          score += 6;
        }
      }

      // Digital Employee Priority Boost
      if (dna.computerExperience === 'very_beginner' || dna.computerExperience === 'beginner') {
        if (course.id === 'c-digital-emp' || course.category === 'diploma') {
          score += 8; // High priority for foundational computer skills!
        }
      }

      // 5. Featured Boost
      if (course.featured) score += 2;

      // Calculate percentage match relative to max potential score
      const maxPossible = 30;
      const percentage = Math.min(99, Math.max(65, Math.round((score / maxPossible) * 100)));

      return {
        course,
        score,
        percentage
      };
    }).sort((a, b) => b.score - a.score);
  }, [courses, dna]);

  // Top recommended courses
  const topRecommendedCourses = useMemo(() => {
    return scoredCourses.slice(0, 6).map((sc) => sc);
  }, [scoredCourses]);

  // All Courses Search Filter (Ensures ALL courses stay visible!)
  const allCoursesFiltered = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase().trim();
    return courses.filter((c) => {
      const matchTitle = c.titleAr.toLowerCase().includes(q) || c.titleEn.toLowerCase().includes(q);
      const matchDesc = c.descriptionAr.toLowerCase().includes(q);
      const matchSkill = c.skills.some((s) => s.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchSkill;
    });
  }, [courses, searchQuery]);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 dir-rtl text-right overflow-hidden relative min-h-screen">
      {/* Background Lighting Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">

        {/* ------------------------------------------------------------- */}
        {/* HERO SECTION — THE HOOK (#1)                                  */}
        {/* ------------------------------------------------------------- */}
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-8 sm:p-12 border border-slate-800 shadow-2xl overflow-hidden text-center space-y-6">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/30 text-red-400 font-black text-xs shadow-md mx-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>محرك الاكتشاف والتوجيه الذكي — SmartTech Learning Discovery Engine</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight max-w-4xl mx-auto"
          >
            اكتشف شغفك… <span className="bg-gradient-to-r from-red-500 via-amber-400 to-amber-200 bg-clip-text text-transparent">وابنِ مستقبلك</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            مش لازم تكون عارف تبدأ منين. جاوب على شوية أسئلة بسيطة، وإحنا هنساعدك تكتشف الكورسات والمسارات الأنسب ليك.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={handleStartDiscovery}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-amber-400 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-red-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-5 h-5 text-amber-200" />
              <span>اكتشف شغفي ✨</span>
            </button>

            <button
              onClick={() => scrollToRef(allCoursesSectionRef)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-slate-400" />
              <span>استكشف كل الكورسات</span>
            </button>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE DISCOVERY WIZARD (#2 & #3)                         */}
        {/* ------------------------------------------------------------- */}
        <div ref={discoveryWizardRef} className="scroll-mt-20">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
            {/* Header / Step Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-400">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">رحلة اكتشاف شغفك التعلمي</h2>
                  <p className="text-xs text-slate-400">أجب عن الخطوات للوصول لخطة دراسية ومسارات شخصية دقيقة</p>
                </div>
              </div>

              {/* Progress Steps Indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                  <button
                    key={step}
                    onClick={() => setCurrentStep(step)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition ${
                      currentStep === step
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                        : currentStep > step
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-950 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </button>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {/* STEP 1: مين أنت؟ */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center sm:text-right space-y-1">
                    <span className="text-xs text-amber-400 font-extrabold">الخطوة 1 من 7</span>
                    <h3 className="text-2xl font-black text-white">مين أنت؟</h3>
                    <p className="text-xs text-slate-400">حدد صفاتك الأساسية لنستعرض لك الفئة العمرية ونوعية الكورسات الأنسب</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: 'child', label: 'طفل (5–11 سنة)', desc: 'أبحث عن ألعاب وروبوتات وحساب ذهني', icon: Smile, defaultAge: 8 },
                      { id: 'student', label: 'طالب مدرسي (12–18 سنة)', desc: 'أريد تعلم البرمجة والذكاء الاصطناعي والتصوير', icon: GraduationCap, defaultAge: 14 },
                      { id: 'youth', label: 'شاب / طالب جامعي', desc: 'أجهز نفسي لسوق العمل والفرص الجديدة', icon: Users, defaultAge: 20 },
                      { id: 'employee', label: 'موظف / مهني', desc: 'أريد مضاعفة إنتاجيتي في الأوفيس والـAI', icon: Briefcase, defaultAge: 28 },
                      { id: 'graduate', label: 'خريج جديد', desc: 'أريد دبلومة مكثفة للعمل الفوري', icon: Award, defaultAge: 23 },
                      { id: 'parent', label: 'ولي أمر يبحث لطفله', desc: 'أبحث عن أفضل مسار تعليمي لبناء مستقبل ابني', icon: ShieldCheck, defaultAge: 9 }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = dna.userType === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setDna((p) => ({ ...p, userType: item.id, age: item.defaultAge }))}
                          className={`p-5 rounded-2xl text-right transition border cursor-pointer flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-br from-red-950/60 to-slate-900 border-red-500 shadow-xl shadow-red-900/20 ring-1 ring-red-500'
                              : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon className={`w-6 h-6 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-red-500" />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white">{item.label}</h4>
                            <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: سنك كام؟ */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center sm:text-right space-y-1">
                    <span className="text-xs text-amber-400 font-extrabold">الخطوة 2 من 7</span>
                    <h3 className="text-2xl font-black text-white">سنك كام سنة؟</h3>
                    <p className="text-xs text-slate-400">العمر يساعدنا في فلترة الاشتراطات والشريحة المناسبة للكورس</p>
                  </div>

                  <div className="max-w-xl mx-auto p-8 bg-slate-950 border border-slate-800 rounded-3xl text-center space-y-6">
                    <div className="text-5xl font-black text-amber-400">
                      {dna.age || 12} <span className="text-lg text-slate-400 font-bold">سنة</span>
                    </div>

                    <input
                      type="range"
                      min={5}
                      max={60}
                      value={dna.age || 12}
                      onChange={(e) => setDna((p) => ({ ...p, age: parseInt(e.target.value) }))}
                      className="w-full accent-red-600 h-3 bg-slate-800 rounded-lg cursor-pointer"
                    />

                    <div className="flex justify-between text-xs text-slate-500 font-bold">
                      <span>5 سنوات (أطفال)</span>
                      <span>15 سنة (ناشئين)</span>
                      <span>25 سنة (شباب)</span>
                      <span>40+ سنة (كبار)</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {[6, 9, 12, 15, 18, 22, 30].map((quickAge) => (
                        <button
                          key={quickAge}
                          onClick={() => setDna((p) => ({ ...p, age: quickAge }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            dna.age === quickAge
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {quickAge} سنة
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: إيه أكتر حاجات بتحبها؟ (Multi-select) */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center sm:text-right space-y-1">
                    <span className="text-xs text-amber-400 font-extrabold">الخطوة 3 من 7 — متعدد الخيارات</span>
                    <h3 className="text-2xl font-black text-white">إيه أكتر حاجات بتحبها ومهتم بيها؟</h3>
                    <p className="text-xs text-slate-400">يمكنك اختيار أكثر من اهتمام (1، 2، 3 أو أكثر)</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {INTEREST_OPTIONS.map((item) => {
                      const Icon = item.icon;
                      const isSelected = dna.interests.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleToggleInterest(item.id)}
                          className={`p-4 rounded-2xl text-right transition border cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-br from-red-950/70 to-slate-900 border-red-500 shadow-lg ring-1 ring-red-500'
                              : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl shrink-0 bg-slate-900 border border-slate-800 ${item.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-extrabold text-sm text-white">{item.titleAr}</h4>
                              {isSelected && <Check className="w-4 h-4 text-red-400" />}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.subtitleAr}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: خبرتك في الكمبيوتر */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center sm:text-right space-y-1">
                    <span className="text-xs text-amber-400 font-extrabold">الخطوة 4 من 7</span>
                    <h3 className="text-2xl font-black text-white">خبرتك في الكمبيوتر عاملة إزاي؟</h3>
                    <p className="text-xs text-slate-400">تساعدنا في تحديد مستوى الكورس وما إذا كنت بحاجة لدبلومة الموظف الرقمي للتأسيس</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: 'very_beginner', label: 'مبتدئ جدًا', desc: 'لسه بتعلم أساسيات التشغيل والكيبورد والماوس' },
                      { id: 'beginner', label: 'مبتدئ', desc: 'بعرف أفتح الويندوز والإنترنت لكن محتاج أساسيات أقوى' },
                      { id: 'intermediate', label: 'متوسط', desc: 'بعرف أستخدم Word وExcel والتصفح المكتبي بوضوح' },
                      { id: 'good', label: 'جيد', desc: 'بستخدم الكمبيوتر في الدراسة أو الشغل بانتظام' },
                      { id: 'advanced', label: 'متقدم', desc: 'عندي خبرة تقنية وبرمجية سابقة' },
                      { id: 'developer', label: 'Developer / Technical', desc: 'عندي خبرة احترافية في التكنولوجيا والبرمجة' }
                    ].map((item) => {
                      const isSelected = dna.computerExperience === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setDna((p) => ({ ...p, computerExperience: item.id }))}
                          className={`p-5 rounded-2xl text-right transition border cursor-pointer flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500 shadow-xl ring-1 ring-indigo-500'
                              : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Laptop className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                            {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white">{item.label}</h4>
                            <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 5: خبرتك في الذكاء الاصطناعي */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center sm:text-right space-y-1">
                    <span className="text-xs text-amber-400 font-extrabold">الخطوة 5 من 7</span>
                    <h3 className="text-2xl font-black text-white">خبرتك في الذكاء الاصطناعي إيه؟</h3>
                    <p className="text-xs text-slate-400">تساعدنا في تحديد ما إذا كنت تحتاج AI Mastery للتأسيس أم مسار متقدم كـ Automation أو AI Developer</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: 'none', label: 'لم أستخدم AI من قبل', desc: 'أريد البدء من الصفر تمامًا' },
                      { id: 'basic', label: 'جربت ChatGPT وأدوات بسيطة', desc: 'استخدمته للأسئلة أو الترجمة العامة' },
                      { id: 'frequent', label: 'بستخدم AI بشكل متكرر', desc: 'أستخدمه في المذاكرة أو كتابة الإيميلات والعمل' },
                      { id: 'content', label: 'بعمل Content ورسوم بالـAI', desc: 'أستخدم أدوات توليد الصور والمحتوى والمونتاج' },
                      { id: 'automation', label: 'عندي خبرة في Automation', desc: 'ربط الخدمات وأتمتة مهام العمل' },
                      { id: 'ai_dev', label: 'Developer / Technical AI', desc: 'أريد تطوير تطبيقات ونماذج ذكية مخصصة' }
                    ].map((item) => {
                      const isSelected = dna.aiExperience === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setDna((p) => ({ ...p, aiExperience: item.id }))}
                          className={`p-5 rounded-2xl text-right transition border cursor-pointer flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-br from-violet-950/80 to-slate-900 border-violet-500 shadow-xl ring-1 ring-violet-500'
                              : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Bot className={`w-5 h-5 ${isSelected ? 'text-violet-400' : 'text-slate-500'}`} />
                            {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white">{item.label}</h4>
                            <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 6: إيه هدفك الرئيسي؟ (Multi-select) */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center sm:text-right space-y-1">
                    <span className="text-xs text-amber-400 font-extrabold">الخطوة 6 من 7 — متعدد الخيارات</span>
                    <h3 className="text-2xl font-black text-white">إيه هدفك الرئيسي من التعلم؟</h3>
                    <p className="text-xs text-slate-400">يمكنك اختيار أكثر من هدف للدمج بين المسارات</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      'أتعلم مهارة جديدة ومفيدة',
                      'أطور نفسي ومهاراتي',
                      'أجهز نفسي لسوق العمل والوظائف',
                      'أغير مجالي الوظيفي (Career Change)',
                      'أشتغل Freelancer حر أونلاين',
                      'أعمل المشروع أو البيزنس الخاص بي',
                      'أطور إنتاجيتي في شغلي الحالي',
                      'احتراف أدوات الذكاء الاصطناعي',
                      'تأسيس الكمبيوتر والمهارات الرقمية',
                      'أتعلم البرمجة من الصفر',
                      'أعمل محتوى وفيديوهات احترافية',
                      'أطور مهارات وقدرات طفلي'
                    ].map((goal) => {
                      const isSelected = dna.goals.includes(goal);
                      return (
                        <button
                          key={goal}
                          onClick={() => handleToggleGoal(goal)}
                          className={`p-4 rounded-xl text-right transition border text-xs font-extrabold flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                          }`}
                        >
                          <span>{goal}</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 7: بتحب تتعلم إزاي؟ */}
              {currentStep === 7 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center sm:text-right space-y-1">
                    <span className="text-xs text-amber-400 font-extrabold">الخطوة 7 من 7 — الخطوة الأخيرة!</span>
                    <h3 className="text-2xl font-black text-white">بتحب تتعلم وتطبق إزاي؟</h3>
                    <p className="text-xs text-slate-400">طريقة التعلم المفضلة لديك تناسب طريقة الشرح في معمل سمارتك</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { id: 'projects', label: '🛠️ مشاريع عملية حقيقية' },
                      { id: 'games', label: '🎮 ألعاب وتحديات برمجية' },
                      { id: 'lab', label: '🧪 تطبيق مباشر في السنتر/المعمل' },
                      { id: 'videos', label: '🎥 فيديوهات تفاعلية قصيرة' },
                      { id: 'challenges', label: '🏆 مسابقات وتحديات تنافسية' },
                      { id: 'balanced', label: '📘 نظرية وتطبيق متوازن' },
                      { id: 'realworld', label: '💼 مشاريع واقعية لسوق العمل' }
                    ].map((style) => {
                      const isSelected = dna.learningStyles.includes(style.id);
                      return (
                        <button
                          key={style.id}
                          onClick={() => handleToggleStyle(style.id)}
                          className={`p-4 rounded-xl text-right transition border text-xs font-extrabold flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-red-950/60 border-red-500 text-white'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                          }`}
                        >
                          <span>{style.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-red-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-slate-800 flex justify-center">
                    <button
                      onClick={handleFinishWizard}
                      className="px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-amber-400 text-white font-black text-sm shadow-xl shadow-red-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-amber-200" />
                      <span>عرض نتائج الاكتشاف والمسارات الموصى بها 🔥</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Next/Prev buttons inside Wizard */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold disabled:opacity-30 cursor-pointer flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              {currentStep < 7 ? (
                <button
                  onClick={() => setCurrentStep((s) => Math.min(7, s + 1))}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RECOMMENDATION ENGINE OUTPUT DASHBOARD (#4)                   */}
        {/* ------------------------------------------------------------- */}
        {(wizardCompleted || dna.interests.length > 0) && (
          <div ref={resultsRef} className="space-y-12 scroll-mt-20">

            {/* DNA Card & Rationale */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>نتائج البوصلة التعليمية الخاصة بك (Learning DNA)</span>
                </div>
                <h3 className="text-2xl font-black text-white">تحليل شخصيتك واهتماماتك جاهز!</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  بناءً على اختيارك للاهتمامات: ({dna.interests.map((i) => INTEREST_OPTIONS.find((o) => o.id === i)?.titleAr).filter(Boolean).join(' + ') || 'عام'})، وعمرك ({dna.age} سنة)، ومستواك في الكمبيوتر ({dna.computerExperience || 'مبتدئ'}) والـAI ({dna.aiExperience || 'مبتدئ'}).
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 text-[11px] font-bold">
                    العمر: {dna.age} سنة
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-[11px] font-bold">
                    الاهتمامات: {dna.interests.length} تم تحديدها
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-300 text-[11px] font-bold">
                    الأهداف: {dna.goals.length} أهداف
                  </span>
                </div>
              </div>

              <button
                onClick={handleResetWizard}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition shrink-0 cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>تعديل إجابات الاكتشاف</span>
              </button>
            </div>

            {/* FOUNDATIONAL PATH RECOMMENDATION (DIGITAL EMPLOYEE / AI MASTERY) */}
            {dna.computerExperience === 'very_beginner' || dna.computerExperience === 'beginner' ? (
              <div className="p-6 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-black text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>توصية التأسيس الهامة جداً</span>
                </div>
                <h4 className="text-lg font-black text-white">نوصيك ببدء مرحلتك الأولى بدبلومة الموظف الرقمي (Digital Employee)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  نظرًا لأن مستواك في الكمبيوتر مبتدئ، هذه الدبلومة هي الأساس الذهبي لتتعلم الويندوز، الأوفيس، البريد السحابي، والكتابة السريعة قبل الانتقال للكورسات المتقدمة.
                </p>
              </div>
            ) : null}

            {/* RECOMMENDED LEARNING PATHS (3–5 PATHS) (#4) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-400 font-extrabold">المسارات الأنسب لشخصيتك</span>
                  <h3 className="text-2xl font-black text-white">المسارات التعليمية الموصى بها (Recommended Paths)</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PATH_TEMPLATES.map((path) => (
                  <div
                    key={path.id}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-6 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-red-400 text-[11px] font-black inline-block">
                        {path.badgeAr}
                      </span>
                      <h4 className="text-lg font-black text-white">{path.titleAr}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{path.descriptionAr}</p>

                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] text-amber-400 font-bold block">مراحل المسار المرتبة:</span>
                        {path.stages.map((stage) => (
                          <div key={stage.number} className="flex items-start gap-2 text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                            <span className="font-black text-amber-400 shrink-0">{stage.number}</span>
                            <div>
                              <p className="font-extrabold text-slate-200">{stage.titleAr}</p>
                              <p className="text-[10px] text-slate-400">{stage.subtitleAr}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => scrollToRef(allCoursesSectionRef)}
                      className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>استكشف كورسات هذا المسار</span>
                      <ChevronLeft className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RECOMMENDED COURSES (TOP MATCHES 6–8 COURSES) (#4) */}
            <div className="space-y-6">
              <div>
                <span className="text-xs text-red-400 font-extrabold">الكورسات الأكثر تطابقاً مع مدخلاتك</span>
                <h3 className="text-2xl font-black text-white">الكورسات الموصى بها لك (Top Matching Courses)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topRecommendedCourses.map(({ course, percentage }) => (
                  <div
                    key={course.id}
                    className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-red-500/40 transition overflow-hidden shadow-xl flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image & Match Badge */}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={course.image}
                          alt={getLocalized(course, 'title')}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/90 border border-amber-500/40 text-amber-400 font-black text-xs shadow-lg backdrop-blur-md flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isArabic ? `تطابق ${percentage}%` : `${percentage}% Match`}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold">
                            {isArabic ? `سن ${course.ageMin}–${course.ageMax} سنة` : `Age ${course.ageMin}–${course.ageMax} Yrs`}
                          </span>
                          <span className="font-bold text-amber-400">{getLocalized(course, 'level')}</span>
                        </div>

                        <h4 className="font-black text-base text-white line-clamp-1">{getLocalized(course, 'title')}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{getLocalized(course, 'description')}</p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {course.skills.slice(0, 3).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] font-bold border border-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer / CTA */}
                    <div className="p-5 pt-0 space-y-3">
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-500 block">{isArabic ? 'عرض الصيف' : 'Summer Offer'}</span>
                          <span className="text-sm font-black text-amber-400">{course.discountPrice} {course.currency || 'EGP'}</span>
                        </div>
                        <button
                          onClick={() => onSelectCourse(course)}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                        >
                          {isArabic ? 'التفاصيل والحجز' : 'Details & Enroll'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ALL COURSES CATALOG (NO COURSES HIDDEN!) (#5)                 */}
        {/* ------------------------------------------------------------- */}
        <div ref={allCoursesSectionRef} className="space-y-8 scroll-mt-20 border-t border-slate-800 pt-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-extrabold text-xs inline-block">
                الكتالوج الشامل
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">جميع كورسات المنصة ({allCoursesFiltered.length})</h2>
              <p className="text-xs text-slate-400">جميع الكورسات متاحة بالكامل ومجانية الاستكشاف دون أي حجب أو قيود</p>
            </div>

            {/* Clean Simple Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute top-3.5 right-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث عن كورس أو مهارة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* UNIFORM RESPONSIVE GRID (Desktop 4 Cols, Tablet 2 Cols, Mobile 1 Col) (#5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allCoursesFiltered.map((course) => (
              <div
                key={course.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition overflow-hidden shadow-lg flex flex-col justify-between group"
              >
                <div>
                  {/* Aspect Ratio Image Container */}
                  <div className="relative aspect-video overflow-hidden bg-slate-950">
                    <img
                      src={course.image}
                      alt={getLocalized(course, 'title')}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-700 text-amber-400 font-extrabold text-[10px]">
                      {getLocalized(course, 'level')}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{isArabic ? `سن ${course.ageMin}–${course.ageMax} سنة` : `Age ${course.ageMin}–${course.ageMax}`}</span>
                      <span>{isArabic ? `${course.durationWeeks} أسابيع` : `${course.durationWeeks} Wks`}</span>
                    </div>

                    <h3 className="font-extrabold text-sm text-white line-clamp-1">{getLocalized(course, 'title')}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{getLocalized(course, 'description')}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {course.skills.slice(0, 3).map((sk) => (
                        <span key={sk} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] border border-slate-800">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Price & CTA */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">{isArabic ? 'سعر الحجز' : 'Price'}</span>
                      <span className="text-xs font-black text-amber-400">{course.discountPrice} {course.currency || 'EGP'}</span>
                    </div>
                    <button
                      onClick={() => onSelectCourse(course)}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      {isArabic ? 'عرض التفاصيل' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
