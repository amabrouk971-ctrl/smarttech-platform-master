import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, CheckCircle2, Lock, Play, ArrowLeft, ArrowRight, 
  HelpCircle, ChevronDown, ChevronUp, UserCheck, Award, Zap, 
  Calendar, Users, BookOpen, Layers, Trophy, MapPin 
} from 'lucide-react';
import { 
  Course, LearningPath, RecommendedCourseSequenceItem, RecommendationResult 
} from '../../types';

interface VisualLearningJourneyProps {
  recommendationResult: RecommendationResult;
  onSelectCourse?: (course: Course) => void;
  onBookClass?: (course: Course) => void;
  onSelectPath?: (path: LearningPath) => void;
}

export const VisualLearningJourney: React.FC<VisualLearningJourneyProps> = ({
  recommendationResult,
  onSelectCourse,
  onBookClass,
  onSelectPath
}) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'JOURNEY' | 'PATHS'>('JOURNEY');

  const {
    courseSequence = [],
    recommendedPaths = [],
    selectedAge,
    selectedInterests = [],
    bestMatch,
    foundationIncluded
  } = recommendationResult;

  const currentSequenceItem = courseSequence[selectedNodeIndex] || courseSequence[0];
  const currentCourse = currentSequenceItem?.course;

  return (
    <div className="w-full space-y-8 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              خارطة الطريق التكيفية الذكية AI
            </span>
            {foundationIncluded && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                أساس الموظف الرقمي مدرج 🎓
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            رحلتك التعليمية الموصى بها لعمر ({selectedAge}) سنة
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            تسلسل الكورسات والمسارات التخصصية المصممة ديناميكياً لتناسب اهتماماتك
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('JOURNEY')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'JOURNEY'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            التسلسل الزمني المتكيف
          </button>
          <button
            onClick={() => setActiveTab('PATHS')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'PATHS'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            المسارات التخصصية ({recommendedPaths.length})
          </button>
        </div>
      </div>

      {activeTab === 'JOURNEY' ? (
        <div className="space-y-8">
          {/* Desktop Interactive Horizontal Node Map */}
          <div className="hidden lg:block relative py-6 px-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-x-auto">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-12 right-12 h-1 bg-slate-800 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-12 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 -translate-y-1/2 transition-all duration-500 z-0"
              style={{
                width: `${((selectedNodeIndex) / Math.max(courseSequence.length - 1, 1)) * 90}%`
              }}
            />

            <div className="relative z-10 flex items-center justify-between gap-4 min-w-[700px]">
              {courseSequence.map((item, idx) => {
                const isSelected = selectedNodeIndex === idx;
                const isFirst = idx === 0;
                const isDigitalEmp = item.course.id === 'digital-employee' || item.course.id === 'digital-employee-101';

                return (
                  <button
                    key={item.course.id}
                    onClick={() => setSelectedNodeIndex(idx)}
                    className="flex flex-col items-center group cursor-pointer focus:outline-none"
                  >
                    {/* Node Circle */}
                    <div className="relative mb-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all shadow-xl ${
                          isSelected
                            ? 'bg-gradient-to-br from-red-500 to-amber-500 text-white ring-4 ring-amber-500/40 shadow-amber-500/20 scale-110'
                            : isFirst
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-2 border-blue-400'
                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {isFirst ? (
                          <Award className="w-6 h-6 text-amber-300 animate-pulse" />
                        ) : (
                          <span>0{item.stepNumber}</span>
                        )}
                      </motion.div>

                      {/* YOU ARE HERE Badge */}
                      {isSelected && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-amber-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> أنت هنا
                        </div>
                      )}
                    </div>

                    {/* Step Title Label */}
                    <div className="text-center max-w-[130px]">
                      <span className={`block text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                        {item.course.titleAr}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {isDigitalEmp ? 'التأسيس الإجباري' : `الخطوة ${item.stepNumber}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical Journey Steps */}
          <div className="lg:hidden space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              اختر الخطوة لعرض التفاصيل
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {courseSequence.map((item, idx) => {
                const isSelected = selectedNodeIndex === idx;
                return (
                  <button
                    key={item.course.id}
                    onClick={() => setSelectedNodeIndex(idx)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-red-600/30 to-amber-600/30 border-amber-500 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black bg-slate-800 px-2 py-0.5 rounded-lg text-amber-400">
                        {idx === 0 ? 'البداية' : `خطوة ${item.stepNumber}`}
                      </span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                    </div>
                    <span className="text-xs font-bold line-clamp-2">{item.course.titleAr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Step Detailed View Card */}
          {currentCourse && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCourse.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden"
              >
                {/* Background Accent Glow */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-red-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Image & Badges */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-800 shadow-xl group">
                      <img 
                        src={currentCourse.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'} 
                        alt={currentCourse.titleAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900/90 backdrop-blur-md text-amber-400 border border-slate-700">
                          {currentCourse.levelAr || 'تأسيسي'}
                        </span>
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/90 text-slate-950 font-black">
                          خصم خاص: {currentCourse.discountPrice} ج.م
                        </span>
                      </div>
                    </div>

                    {/* Class Availability & Mode */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                        <span className="block text-[10px] text-slate-400">المجموعات المتاحة</span>
                        <span className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                          <Users className="w-4 h-4" />
                          {currentSequenceItem.availableClassesCount > 0 
                            ? `${currentSequenceItem.availableClassesCount} أماكن شاعرة` 
                            : 'مكتمل المقاعد'}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                        <span className="block text-[10px] text-slate-400">نمط الدراسة</span>
                        <span className="text-sm font-black text-blue-400 flex items-center justify-center gap-1 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                          {currentCourse.mode === 'Hybrid' ? 'حضوري + أونلاين' : currentCourse.mode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Course Info & Rationale */}
                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30">
                          الخطوة 0{currentSequenceItem.stepNumber} في المسار
                        </span>
                        {currentSequenceItem.isStartHere && (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> نقطة الانطلاق الأولى
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        {currentCourse.titleAr}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-mono">{currentCourse.titleEn}</p>
                    </div>

                    {/* WHY THIS COURSE? RATIONALE BOX */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        لماذا هذا الكورس في خطتك؟ (AI Recommendation)
                      </div>
                      <p className="text-sm font-bold leading-relaxed text-slate-200">
                        "{currentSequenceItem.reasonAr}"
                      </p>
                    </div>

                    {/* Outcomes / Skills */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        المهارات المكتسبة والمخرجات العملية
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentCourse.skills?.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800">
                      <button
                        onClick={() => onBookClass ? onBookClass(currentCourse) : onSelectCourse?.(currentCourse)}
                        className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white font-black text-sm hover:brightness-110 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-5 h-5" />
                        احجز مكانك في المجموعات القادمة
                      </button>

                      {onSelectCourse && (
                        <button
                          onClick={() => onSelectCourse(currentCourse)}
                          className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                          تفاصيل المحتوى والمنهج
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      ) : (
        /* Alternative Specialization Paths Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedPaths.map((path, idx) => (
            <div 
              key={path.id}
              className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-800 text-amber-400 border border-slate-700">
                    المسار التخصصي #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {path.estimatedWeeks} أسبوعاً
                  </span>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                  {path.titleAr}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {path.descriptionAr}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold">شارة التخرج:</span>
                  <span className="font-black text-amber-400">{path.badgeReward}</span>
                </div>

                <button
                  onClick={() => onSelectPath?.(path)}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  استكشف تفاصيل هذا المسار
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
