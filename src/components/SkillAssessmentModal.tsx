import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Bot, Award, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SkillAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPath: (pathId: string) => void;
}

export const SkillAssessmentModal: React.FC<SkillAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSelectPath
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [age, setAge] = useState(9);
  const [interests, setInterests] = useState('ألعاب الكمبيوتر والروبوتات');
  const [experience, setExperience] = useState('لا توجد خبرة سابقة');

  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);

  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');

    try {
      const response = await fetch('/api/ai/assess-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, interests, previousExperience: experience })
      });

      const data = await response.json();
      setAssessmentResult(data);
      setStep('result');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      setAssessmentResult({
        recommendedPathId: age < 9 ? 'junior-programmer' : 'future-engineer',
        levelTitle: 'برمجيات واستكشاف الذكاء الاصطناعي',
        assessmentSummary: 'بناءً على عمرك واهتماماتك، ننصحك بالبدء فوراً في مسار التطبيق والبرمجة التفاعلية بـ Scratch وArduino!'
      });
      setStep('result');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl text-right">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-slate-900 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' && (
          <form onSubmit={handleSubmitAssessment} className="space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs border border-amber-500/30 flex items-center gap-1 w-fit">
                <Sparkles className="w-3.5 h-3.5" /> AI Skill Advisor
              </span>
              <h3 className="text-2xl font-black">تحديد المستوى والمسار بـ AI</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أدخل بعض المعلومات السريعة عن الطفل ليقوم الذكاء الاصطناعي باقتراح الكورس والمسار الأنسب له!
              </p>
            </div>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">عمر الطفل (بالسنوات):</label>
                <input
                  type="number"
                  min={5}
                  max={18}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">أكثر ما يحبه الطفل:</label>
                <select
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                >
                  <option>ألعاب الكمبيوتر وصناعتها 🎮</option>
                  <option>تركيب السيارات والروبوتات 🤖</option>
                  <option>الرسم والتصميم الجرافيكي 🎨</option>
                  <option>الذكاء الاصطناعي وصناعة المحتوى 🧠</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">الخبرات البرمجية السابقة:</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                >
                  <option>لا توجد خبرة سابقة (مبتدئ تماماً)</option>
                  <option>تعلم Scratch من قبل</option>
                  <option>درس Python أو Arduino بسطاء</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-700 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-lg transition cursor-pointer"
            >
              تحليل الميول واقتراح المسار 🚀
            </button>
          </form>
        )}

        {step === 'loading' && (
          <div className="py-12 text-center space-y-4">
            <Bot className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
            <h4 className="text-lg font-black">جاري تحليل بيانات وميول الطفل بـ AI...</h4>
          </div>
        )}

        {step === 'result' && assessmentResult && (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                المسار الأنسب للطفل:
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {assessmentResult.levelTitle}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 leading-relaxed font-medium">
              {assessmentResult.assessmentSummary}
            </p>

            <button
              onClick={() => {
                onSelectPath(assessmentResult.recommendedPathId);
                onClose();
              }}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-2xl shadow transition cursor-pointer"
            >
              عرض تفاصيل المسار المقترح الآن
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
