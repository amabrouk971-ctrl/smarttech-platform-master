import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Play, Gamepad2, Sparkles, Bot, Zap, Cpu, Code2, Shield, Rocket, User, Users, Compass, Search
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { User as AuthUser, Role } from '../types';
import { Course } from '../types';
import { INITIAL_LEARNING_PATHS } from '../data/seedData';

// Lazy loaded heavy components
const LearningPathsMap = lazy(() => import('../components/LearningPathsMap').then(m => ({ default: m.LearningPathsMap })));
const LearningRoadmap = lazy(() => import('../components/LearningRoadmap').then(m => ({ default: m.LearningRoadmap })));
const CourseCatalog = lazy(() => import('../components/CourseCatalog').then(m => ({ default: m.CourseCatalog })));
const BranchesSection = lazy(() => import('../components/BranchesSection').then(m => ({ default: m.BranchesSection })));
const YouTubeAdBanner = lazy(() => import('../components/YouTubeAdBanner').then(m => ({ default: m.YouTubeAdBanner })));
const FeaturedVideoSection = lazy(() => import('../components/FeaturedVideoSection').then(m => ({ default: m.FeaturedVideoSection })));

interface HomePageProps {
  currentUser: AuthUser | null;
  courses: Course[];
  onStartLearning: () => void;
  onExplorePaths: () => void;
  onSelectCourse: (course: Course) => void;
  onOpenAuth: () => void;
  setActiveTab: (tab: string) => void;
  setActiveLabId: (labId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  courses,
  onStartLearning,
  onExplorePaths,
  onSelectCourse,
  onOpenAuth,
  setActiveTab,
  setActiveLabId
}) => {
  const { isArabic, t, dir } = useLanguage();
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className={`w-full bg-slate-50 dark:bg-slate-950 overflow-hidden ${dir === 'rtl' ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* 3D Premium Hero Section */}
      <motion.section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950"
        style={{ y: yHero, opacity: opacityHero }}
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Subtle Dynamic Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          {/* Abstract glowing orbs */}
          <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-red-500/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 w-full">
          {/* Hero Text */}
          <div className="flex-1 space-y-8 text-center lg:text-start pt-20 lg:pt-0">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 backdrop-blur-md"
             >
                <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">SmartTech Academy v2.4</span>
             </motion.div>

             <motion.h1 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.1 }}
               className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]"
             >
               {isArabic ? (
                 <>تعلم. ابتكر. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">اصنع المستقبل.</span></>
               ) : (
                 <>Learn. Build. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Create the Future.</span></>
               )}
             </motion.h1>

             <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto lg:mx-0"
             >
               {isArabic 
                ? "منصة تعليمية متكاملة للبرمجة، الروبوتات، والذكاء الاصطناعي. حول شغف طفلك بالتكنولوجيا إلى مهارات حقيقية." 
                : "A premium educational platform for Coding, Robotics, and AI. Turn your child's passion into real-world skills."}
             </motion.p>

             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
             >
                <button 
                  onClick={() => setActiveTab('courses')}
                  className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isArabic ? 'استكشف الكورسات' : 'Explore Courses'}
                  <ArrowRight className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
                </button>
                <button 
                  onClick={onExplorePaths}
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-5 h-5 text-red-500" />
                  {isArabic ? 'اكتشف مسارك' : 'Find Your Path'}
                </button>
             </motion.div>
          </div>

          {/* 3D Visual Hero Graphic */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="flex-1 w-full h-[500px] hidden lg:block relative"
             style={{ perspective: '1000px' }}
          >
             <div className="relative w-full h-full animate-float-slow" style={{ transformStyle: 'preserve-3d' }}>
                {/* Main Glass Card */}
                <div 
                   className="absolute inset-0 m-auto w-80 h-[400px] rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-700 hover:rotate-0"
                   style={{ transform: 'rotateY(-15deg) rotateX(5deg)' }}
                >
                   <div className="flex justify-between items-center">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
                       <Code2 className="w-6 h-6 text-white" />
                     </div>
                     <span className="px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full">ACTIVE</span>
                   </div>
                   
                   <div className="space-y-4">
                     <div className="h-2 w-1/3 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                     <div className="h-2 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                     <div className="h-2 w-2/3 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                     <div className="mt-8 p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-white/50 dark:border-slate-700">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                         <div>
                           <p className="text-xs font-bold text-slate-900 dark:text-white">AI Processing</p>
                           <p className="text-[10px] text-slate-500">Neural Network Active</p>
                         </div>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Floating Elements */}
                <motion.div 
                  initial={{ z: 50 }}
                  animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-20 right-10 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/20 backdrop-blur-md rounded-2xl border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center shadow-lg"
                >
                  <Cpu className="w-10 h-10 text-blue-500" />
                </motion.div>
                
                <motion.div 
                  initial={{ z: 80 }}
                  animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-20 left-10 w-20 h-20 bg-amber-500/10 dark:bg-amber-500/20 backdrop-blur-md rounded-2xl border border-amber-500/20 dark:border-amber-500/30 flex items-center justify-center shadow-lg"
                >
                  <Zap className="w-8 h-8 text-amber-500" />
                </motion.div>
             </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Embedded YouTube Advertisement Banner */}
      <Suspense fallback={null}>
        <YouTubeAdBanner currentUser={currentUser} />
      </Suspense>

      {/* Featured YouTube Video & Marketing Media Section */}
      <Suspense fallback={null}>
        <FeaturedVideoSection 
          isAdmin={currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN}
          userRole={currentUser?.role}
          courses={courses}
        />
      </Suspense>

      {/* Interactive Labs Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">{isArabic ? 'المعامل التفاعلية' : 'Interactive Labs'}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{isArabic ? 'جرب بنفسك قبل أن تبدأ. بيئات عمل حقيقية للبرمجة والروبوتات داخل المتصفح.' : 'Try it yourself before you start. Real coding and robotics environments right in your browser.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'scratch', icon: Gamepad2, titleAr: 'برمجة سكراتش', titleEn: 'Scratch Coding', descAr: 'برمجة بصرية ممتعة', descEn: 'Visual block programming', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50/50 dark:bg-amber-950/20' },
              { id: 'arduino', icon: Zap, titleAr: 'محاكي أردوينو', titleEn: 'Arduino Simulator', descAr: 'تصميم الدوائر الإلكترونية', descEn: 'Circuit design & code', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
              { id: 'robotics', icon: Bot, titleAr: 'روبوتات', titleEn: 'Robotics Lab', descAr: 'تحكم في الروبوتات الذكية', descEn: 'Control smart robots', color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50/50 dark:bg-blue-950/20' },
              { id: 'ai', icon: Sparkles, titleAr: 'مختبر الذكاء الاصطناعي', titleEn: 'AI Sandbox', descAr: 'اكتشف قدرات نماذج AI', descEn: 'Explore AI models', color: 'from-red-400 to-pink-500', bg: 'bg-red-50/50 dark:bg-red-950/20' }
            ].map((lab, idx) => {
              const Icon = lab.icon;
              return (
                <motion.button
                  key={lab.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  onClick={() => {
                    setActiveLabId(lab.id);
                    setActiveTab('labs');
                  }}
                  className={`relative group p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-transparent overflow-hidden text-start shadow-sm hover:shadow-2xl transition-all duration-300 ${lab.bg} dark:bg-slate-900 cursor-pointer`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lab.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2">{isArabic ? lab.titleAr : lab.titleEn}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{isArabic ? lab.descAr : lab.descEn}</p>
                </motion.button>
              )
            })}
          </div>
          
          <div className="flex justify-center mt-8">
            <button
               onClick={() => setActiveTab('labs')}
               className="px-8 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
            >
               {isArabic ? 'فتح جميع المختبرات 🚀' : 'Open All Labs 🚀'}
            </button>
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{isArabic ? 'الكورسات المميزة' : 'Featured Courses'}</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{isArabic ? 'ابدأ رحلة التعلم مع أفضل كورسات التكنولوجيا' : 'Start your learning journey with our top tech courses'}</p>
            </div>
            <button 
              onClick={() => setActiveTab('courses')}
              className="text-red-600 font-bold hover:text-red-700 flex items-center gap-2 group cursor-pointer"
            >
              {isArabic ? 'عرض كل الكورسات' : 'View All Courses'}
              <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-white dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-red-500/50 transition-all shadow-sm hover:shadow-xl cursor-pointer"
                onClick={() => onSelectCourse(course)}
              >
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                   {course.bannerUrl ? (
                     <img src={course.bannerUrl} alt={course.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                       <Code2 className="w-12 h-12 text-slate-300 dark:text-slate-600 group-hover:scale-110 transition-transform duration-500" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                   
                   {/* Badges */}
                   <div className="absolute top-4 right-4 flex flex-col gap-2">
                     <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                       {course.ageRange}
                     </span>
                   </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {isArabic ? course.titleAr : course.titleEn}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {isArabic ? course.descAr : course.descEn}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                       {course.level}
                     </span>
                     {course.price > 0 ? (
                       <span className="font-black text-red-600 dark:text-red-400">
                         {course.price} EGP
                       </span>
                     ) : (
                       <span className="font-black text-emerald-600 dark:text-emerald-400">
                         {isArabic ? 'مجاني' : 'FREE'}
                       </span>
                     )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lazy Loaded Heavy Sections */}
      <Suspense fallback={<div className="h-48 flex items-center justify-center text-slate-400"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <LearningPathsMap paths={INITIAL_LEARNING_PATHS} onSelectPath={() => setActiveTab('courses')} />
      </Suspense>

      <Suspense fallback={null}>
        <LearningRoadmap courses={courses} currentUser={currentUser} onSelectCourse={onSelectCourse} />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-400"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <CourseCatalog courses={courses} onSelectCourse={onSelectCourse} currentUser={currentUser} onOpenAuth={onOpenAuth} />
      </Suspense>

      <Suspense fallback={null}>
        <BranchesSection />
      </Suspense>
      
    </div>
  );
};
