import React, { useState } from 'react';
import { Compass, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, MessageSquare, Zap, Shield, Phone, User, BookOpen } from 'lucide-react';
import { Course, LearningPath } from '../types';
import { createLeadInFirestore } from '../services/leadService';

interface ChildPathSelectionWizardProps {
  courses: Course[];
  paths?: LearningPath[];
  onClose?: () => void;
}

export const ChildPathSelectionWizard: React.FC<ChildPathSelectionWizardProps> = ({
  courses,
  paths = [],
  onClose
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [childAge, setChildAge] = useState<number>(8);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['programming']);
  const [selectedPathId, setSelectedPathId] = useState<string>('junior-programmer');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const interestOptions = [
    { id: 'programming', label: 'تطوير البرمجيات والألعاب 🎮', icon: '💻' },
    { id: 'robotics', label: 'الروبوتات والذكاء الاصطناعي 🤖', icon: '🦾' },
    { id: 'electronics', label: 'الإلكترونيات والإنترنت الذكي (IoT) ⚡', icon: '🔌' },
    { id: 'design', label: 'التصميم والتطبيقات والمستقبل 🚀', icon: '🎨' }
  ];

  const handleToggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  // Filter recommended courses based on age & interests
  const recommendedCourses = courses.filter((c) => {
    const matchesAge = childAge >= (c.ageMin || 6) && childAge <= (c.ageMax || 18);
    const matchesInterest = selectedInterests.includes(c.category || 'programming');
    return matchesAge || matchesInterest;
  });

  const handleSubmitWizard = async () => {
    if (!parentName || !phone || !studentName) {
      alert('يرجى كتابة اسم ولي الأمر، اسم الطفل، ورقم الموبايل للتواصل.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCourseObjs = courses.filter((c) => selectedCourseIds.includes(c.id));
      const selectedCourseTitles = selectedCourseObjs.map((c) => c.titleAr);

      const leadData = {
        parentName,
        studentName,
        phone,
        whatsappNumber: phone,
        childAge,
        selectedPath: selectedPathId,
        selectedPathTitle: selectedPathId === 'junior-programmer' ? 'مسار المبرمج الصغير (Junior Programmer)' : 'مسار مهندس الذكاء الاصطناعي والأنظمة المدمجة',
        selectedCourses: selectedCourseIds,
        selectedCourseTitles,
        interests: selectedInterests,
        notes: `مستوى الخبرة: ${experienceLevel}`,
        source: 'PARENT_PATH_WIZARD'
      };

      // 1. Save Lead to Firestore
      const createdLead = await createLeadInFirestore(leadData);

      setIsSubmitted(true);

      // 2. Open WhatsApp Direct Message
      const waMsg = `أهلاً سمارتك أكاديمي 👋\nأنا ولي الأمر: ${parentName}\nأرغب في تسجيل طفلي: ${studentName} (${childAge} سنة)\nالمسار المقترح: ${leadData.selectedPathTitle}\nالكورسات: ${selectedCourseTitles.join('، ') || 'المسار الشامل'}\nرقم الموبايل: ${phone}`;
      const waUrl = `https://wa.me/201021481525?text=${encodeURIComponent(waMsg)}`;

      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);
    } catch (err) {
      console.error('Error submitting wizard lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-800 space-y-8 dir-rtl text-right shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-600 to-amber-500 rounded-2xl text-white shadow-lg shadow-red-600/30">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
              GUIDED PARENT EXPERIENCE • SMARTTECH ACADEMY
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              معالج اختيار المسار التعليمي المخصص لطفلك 🎯
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, title: 'سن وتفاصيل الطفل' },
          { num: 2, title: 'الاهتمامات والمهارات' },
          { num: 3, title: 'المسار والكورسات المقترحة' },
          { num: 4, title: 'إرسال الطلب عبر الواتساب' }
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-2xl border text-center transition ${
              step === s.num
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-black'
                : step > s.num
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="text-[10px] block opacity-80">الخطوة {s.num}</span>
            <span className="text-xs font-bold truncate block">{s.title}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Child Details & Parent Contact */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white">الخطوة 1: أدخل بيانات طفلك ووسيلة التواصل</h3>
            <p className="text-xs text-slate-400">
              نحن نحدد المسار الأنسب طبقاً للسن والشغف والقدرات التطبيقية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-300">
            <div>
              <label className="block mb-1 text-white">اسم ولي الأمر *</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="أدخل اسم ولي الأمر"
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-white">اسم الطفل المستكشف *</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="أدخل اسم الطفل"
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-white">رقم الموبايل والواتساب للتواصل *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white focus:border-amber-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block mb-1 text-white">عمر الطفل ({childAge} سنوات)</label>
              <input
                type="range"
                min="6"
                max="18"
                value={childAge}
                onChange={(e) => setChildAge(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>6 سنوات (Scratch)</span>
                <span>12 سنة (Arduino/AI)</span>
                <span>18 سنة (Master Coder)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => {
                if (!parentName || !studentName || !phone) {
                  alert('يرجى كتابة جميع البيانات المطلوبة للانتقال للخطوة التالية.');
                  return;
                }
                setStep(2);
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>الانتقال لتحديد الاهتمامات</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Interests & Goals */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white">الخطوة 2: ما هي المجالات الأكثر جاذبية لطفلك؟</h3>
            <p className="text-xs text-slate-400">
              اختر مهارة واحدة أو أكثر لترشيح الكورسات الميدانية والتطبيقية المناسبة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {interestOptions.map((opt) => {
              const isSelected = selectedInterests.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => handleToggleInterest(opt.id)}
                  className={`p-5 rounded-2xl border text-right transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xl block">{opt.icon}</span>
                    <span className="font-extrabold text-sm block">{opt.label}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              رجوع
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow transition flex items-center gap-2 cursor-pointer"
            >
              <span>عرض المسارات والكورسات المقترحة 🚀</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Recommended Path & Courses */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white">الخطوة 3: المسارات والكورسات المرشحة لطفلك ({childAge} سنة)</h3>
            <p className="text-xs text-slate-400">
              قم باختيار الكورسات التطبيقية التي يرغب طفلك في التسجيل بها.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedCourses.map((c) => {
              const isSelected = selectedCourseIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCourseIds(selectedCourseIds.filter((id) => id !== c.id));
                    } else {
                      setSelectedCourseIds([...selectedCourseIds, c.id]);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 relative ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-xl'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px]">
                      {c.ageMin}-{c.ageMax} سنة • {c.sessionsCount || 12} جلسة
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                  </div>

                  <h4 className="font-black text-sm text-white">{c.titleAr}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{c.descriptionAr}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold">
                    <span className="text-emerald-400">{c.discountPrice || c.originalPrice} EGP</span>
                    <span className="text-slate-500 underline">اضغط للاختيار</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-slate-900 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              رجوع
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2 cursor-pointer"
            >
              <span>تأكيد الاختيار ومتابعة الحجز</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & WhatsApp Lead Submit */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white">الخطوة الأخيرة: مراجعة الطلب والإرسال المباشر</h3>
            <p className="text-xs text-slate-400">
              سيتم حفظ بيانات الطلب واستقبال استفسارك مباشرة عبر الواتساب الرسمي لأكاديمية سمارتك.
            </p>
          </div>

          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs font-bold text-slate-200">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">ولي الأمر:</span>
              <span className="text-white">{parentName} ({phone})</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">الطفل المستكشف:</span>
              <span className="text-amber-400">{studentName} ({childAge} سنوات)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">عدد الكورسات المختارة:</span>
              <span className="text-emerald-400">{selectedCourseIds.length} كورس</span>
            </div>
          </div>

          <button
            onClick={handleSubmitWizard}
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            <span>{isSubmitting ? 'جاري تجهيز الطلب...' : 'إرسال الطلب والتحدث المباشر عبر الواتساب 📱'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
