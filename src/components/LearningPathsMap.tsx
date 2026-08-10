import React, { useState } from 'react';
import { LearningPath } from '../types';
import {
  Code,
  Cpu,
  Bot,
  Zap,
  Sparkles,
  CheckCircle2,
  Award,
  ChevronLeft,
  Wrench,
  Gamepad2,
  Brain,
  Palette,
  Calculator,
  Compass,
  ArrowRight,
  Star,
  Layers,
  Clock,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LearningPathsMapProps {
  paths: LearningPath[];
  onSelectPath?: (pathId: string) => void;
}

export const LearningPathsMap: React.FC<LearningPathsMapProps> = ({
  paths,
  onSelectPath
}) => {
  const [activeInterestFilter, setActiveInterestFilter] = useState<
    'all' | 'assembly_engineering' | 'gaming_programming' | 'ai_shared' | 'creative_design' | 'math_iq'
  >('all');

  const [selectedPathId, setSelectedPathId] = useState<string>('junior-engineer');

  // Filter paths based on active interest
  const filteredPaths = paths.filter((p) => {
    if (activeInterestFilter === 'all') return true;
    if (activeInterestFilter === 'ai_shared') return p.personalityType === 'ai_shared' || p.id === 'ai-creator';
    return p.personalityType === activeInterestFilter;
  });

  const selectedPath =
    paths.find((p) => p.id === selectedPathId) ||
    filteredPaths[0] ||
    paths[0];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white dir-rtl text-right overflow-hidden relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 animate-spin-slow" /> خريطة المسارات التعليمية المبتكرة
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            اختر المسار الأنسب لشغف وشخصية طفلك 🚀
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            تختلف مهارات وشغف الأطفال؛ بعضهم يبدع في <strong className="text-amber-400">الفك والتركيب الهيكلي</strong>، وآخرون يعشقون <strong className="text-blue-400">عوالم الألعاب والبرمجة</strong>، بينما يجمع <strong className="text-emerald-400">مسار الذكاء الاصطناعي</strong> بينهم لبناء المستقبل.
          </p>
        </div>

        {/* Child Personality & Passion Selector Quiz/Filter */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm font-black text-amber-400">
              <Compass className="w-5 h-5" />
              <span>مُستكشف شغف الطفل (Child Passion Finder):</span>
            </div>
            <span className="text-xs text-slate-400 font-sans">اختر أسلوب طفلك المفضل لعرض المسارات الموصى بها</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <button
              onClick={() => setActiveInterestFilter('all')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                activeInterestFilter === 'all'
                  ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30 scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Star className="w-5 h-5 text-amber-300" />
              <span>جميع المسارات</span>
            </button>

            <button
              onClick={() => {
                setActiveInterestFilter('assembly_engineering');
                setSelectedPathId('junior-engineer');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
                activeInterestFilter === 'assembly_engineering'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-5 h-5 text-emerald-400" />
              <span>يحب الفك والتركيب 🛠️</span>
            </button>

            <button
              onClick={() => {
                setActiveInterestFilter('gaming_programming');
                setSelectedPathId('junior-programmer');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
                activeInterestFilter === 'gaming_programming'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Gamepad2 className="w-5 h-5 text-blue-400" />
              <span>يحب ألعاب الفيديو 🎮</span>
            </button>

            <button
              onClick={() => {
                setActiveInterestFilter('ai_shared');
                setSelectedPathId('ai-creator');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
                activeInterestFilter === 'ai_shared'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30 scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Brain className="w-5 h-5 text-amber-400" />
              <span>مسار الذكاء الاصطناعي 🧠</span>
            </button>

            <button
              onClick={() => {
                setActiveInterestFilter('creative_design');
                setSelectedPathId('digital-artist');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
                activeInterestFilter === 'creative_design'
                  ? 'bg-pink-600 border-pink-400 text-white shadow-lg shadow-pink-600/30 scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Palette className="w-5 h-5 text-pink-400" />
              <span>يحب الرسم والإبداع 🎨</span>
            </button>

            <button
              onClick={() => {
                setActiveInterestFilter('math_iq');
                setSelectedPathId('mental-math-iq');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
                activeInterestFilter === 'math_iq'
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30 scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-5 h-5 text-cyan-400" />
              <span>يحب الألغاز والأرقام 🧮</span>
            </button>
          </div>
        </div>

        {/* Visual Path Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPaths.map((p) => {
            const isSelected = p.id === selectedPath.id;
            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedPathId(p.id)}
                className={`relative rounded-3xl border overflow-hidden cursor-pointer transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'border-2 border-red-500 bg-slate-950 shadow-2xl shadow-red-600/20 ring-2 ring-red-500/50'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                {/* Image Header with Overlay */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={p.image || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'}
                    alt={p.titleAr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Age Range Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-slate-950/90 border border-slate-700 rounded-full text-amber-400 font-extrabold text-[11px] backdrop-blur-md flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {p.ageRange}
                  </div>

                  {/* Shared/Personality Label */}
                  {p.personalityLabelAr && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-red-600/90 text-white rounded-lg font-black text-[10px] backdrop-blur-md shadow-md">
                      {p.personalityLabelAr}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-black text-base sm:text-lg text-white group-hover:text-red-400 transition-colors">
                      {p.titleAr}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {p.descriptionAr}
                    </p>
                  </div>

                  {/* Stats Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1 font-bold text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-blue-400" /> {p.stages.length} مراحل تعليمية
                    </span>
                    <span className="text-amber-400 font-black text-[11px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      🏆 {p.badgeReward}
                    </span>
                  </div>
                </div>

                {/* Selected Indicator Ribbon */}
                {isSelected && (
                  <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-[11px] text-center py-1.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> المسار النشط والمعاين حالياً
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Active Selected Path Interactive Roadmap Details */}
        <AnimatePresence mode="wait">
          {selectedPath && (
            <motion.div
              key={selectedPath.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden"
            >
              {/* Top Banner Header */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-b border-slate-800 pb-8">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-red-600 text-white rounded-lg font-black text-xs shadow-md">
                      {selectedPath.ageRange}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg font-bold text-xs">
                      مدة المسار: {selectedPath.estimatedWeeks} أسابيع تدريبية
                    </span>
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg font-bold text-xs">
                      🏆 شارة التخرج: {selectedPath.badgeReward}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    {selectedPath.titleAr}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                    {selectedPath.descriptionAr}
                  </p>

                  <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center gap-3 text-xs text-amber-300 font-bold">
                    <Target className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>مناسب خصيصاً لـ: {selectedPath.targetAudienceAr}</span>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-700 shadow-xl relative">
                    <img
                      src={selectedPath.image || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'}
                      alt={selectedPath.titleAr}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  </div>

                  <button
                    onClick={() => onSelectPath?.(selectedPath.id)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <span>الانضمام والتسجيل في هذا المسار</span>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stages Visual Roadmap Timeline */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> مراحل وخطوات خريطة الطريق (Curriculum Milestones):
                  </h4>
                  <span className="text-xs text-slate-400 font-sans">
                    {selectedPath.stages.length} محطات تدريبية عمليا
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedPath.stages.map((stage, sIdx) => (
                    <div
                      key={stage.id}
                      className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all relative group"
                    >
                      <div className="space-y-3">
                        {/* Number & Stage Label */}
                        <div className="flex items-center justify-between">
                          <span className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 font-black text-xs flex items-center justify-center">
                            0{sIdx + 1}
                          </span>
                          <span className="text-[10px] text-amber-400 font-black tracking-wider uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            المرحلة {sIdx + 1}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors">
                          {stage.titleAr}
                        </h5>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {stage.descriptionAr}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-800">
                        {/* Skills */}
                        <div className="flex flex-wrap gap-1">
                          {stage.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 font-bold text-[10px] border border-slate-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Project Outcome Badge */}
                        {stage.projectOutcomeAr && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>مخرج المشروع: {stage.projectOutcomeAr}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Call to Action */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-black text-base text-white">هل تحتاج مساعدة في تحديد المستوى أو الفرع المناسب لطفلك؟</h4>
                  <p className="text-xs text-slate-400">تحدث مع مستشارنا التعليمي بالأكاديمية أو احجز جلسة تقييم مجانية بالمقر الرئيسي بزيزينيا الإسكندرية.</p>
                </div>
                <button
                  onClick={() => onSelectPath?.(selectedPath.id)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>تأكيد تسجيل الطفل بالمسار</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parent Comparison Guide Table */}
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="space-y-2 text-center sm:text-right">
            <h3 className="text-xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
              <Compass className="w-5 h-5 text-red-500" /> دليل أولياء الأمور لتحديد المسار الموصى به:
            </h3>
            <p className="text-xs text-slate-400">
              قارن بين اهتمامات طفلك واكتشف النتيجة التطبيقية الحقيقية التي سيخرج بها بعد إتمام المسار!
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-black">
                  <th className="p-3">شغف واهتمام الطفل الحالي</th>
                  <th className="p-3">المسار الموصى به</th>
                  <th className="p-3">العمر المناسب</th>
                  <th className="p-3">المشروع التطبيقي والتخرج</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3 font-bold text-emerald-400 flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> فك الألعاب، التركيب، المكعبات والهندسة
                  </td>
                  <td className="p-3 font-bold text-white">مسار الهندسة والروبوتات (LEGO Robotics)</td>
                  <td className="p-3">5 - 10 سنوات</td>
                  <td className="p-3 text-slate-400">بناء روبوت متحرك يتفادي العوائق وتتبع الخطوط</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3 font-bold text-blue-400 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" /> إمضاء الوقت في لعب الكمبيوتر والشاشات
                  </td>
                  <td className="p-3 font-bold text-white">مسار البرمجة وتطوير الألعاب (Scratch)</td>
                  <td className="p-3">6 - 12 سنة</td>
                  <td className="p-3 text-slate-400">صناعة ألعاب فيديو كاملة ونشرها على المنصة</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3 font-bold text-amber-400 flex items-center gap-2">
                    <Brain className="w-4 h-4" /> الفضول تجاه المستقبل وكيف تفكر الآلات
                  </td>
                  <td className="p-3 font-bold text-white">مسار الذكاء الاصطناعي (AI Creator) — مشترك</td>
                  <td className="p-3">8 - 16 سنة</td>
                  <td className="p-3 text-slate-400">تدريب نموذج التعرف على الوجوه وبناء بوت ذكي</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3 font-bold text-purple-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> توصيل الأسلاك والكهرباء والدوائر
                  </td>
                  <td className="p-3 font-bold text-white">مسار الإلكترونيات والأردوينو (Arduino IoT)</td>
                  <td className="p-3">9 - 16 سنة</td>
                  <td className="p-3 text-slate-400">اختراع نظام منزل ذكي يتم التحكم به عبر المحمول</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="p-3 font-bold text-pink-400 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> الرسم والألوان والتشكيل الجرافيكي
                  </td>
                  <td className="p-3 font-bold text-white">مسار الرسم الرقمي والـ 3D Animation</td>
                  <td className="p-3">7 - 15 سنة</td>
                  <td className="p-3 text-slate-400">إنتاج مشهد كرتوني متحرك ورسم مجسمات 3D</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

