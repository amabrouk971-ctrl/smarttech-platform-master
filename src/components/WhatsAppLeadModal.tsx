import React, { useState } from 'react';
import { MessageSquare, Phone, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Course } from '../types';
import { createLeadInFirestore } from '../services/leadService';

interface WhatsAppLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
  pathTitle?: string;
}

export const WhatsAppLeadModal: React.FC<WhatsAppLeadModalProps> = ({
  isOpen,
  onClose,
  course,
  pathTitle
}) => {
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [childAge, setChildAge] = useState<number>(course?.ageMin || 9);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !phone) return;

    setIsSubmitting(true);

    try {
      // 1. Save lead to Firestore
      await createLeadInFirestore({
        parentName,
        studentName: studentName || 'طالب جديد',
        phone,
        whatsappNumber: phone,
        childAge,
        selectedCourses: course ? [course.id] : [],
        selectedCourseTitles: course ? [course.titleAr] : [],
        selectedPathTitle: pathTitle || 'استفسار عن كورس',
        source: 'COURSE_CATALOG_INQUIRY'
      });

      // 2. Open WhatsApp link
      const msg = `أهلاً سمارتك أكاديمي 👋\nأنا ولي الأمر: ${parentName}\nأستفسر بخصوص الكورس: ${course?.titleAr || pathTitle || 'الكورسات المتاحة'}\nاسم الطالب: ${studentName || 'طفلي'} (${childAge} سنة)\nرقم الواتساب: ${phone}`;
      const url = `https://wa.me/201021481525?text=${encodeURIComponent(msg)}`;

      window.open(url, '_blank');
      onClose();
    } catch (err) {
      console.error('Error submitting WhatsApp lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl dir-rtl text-right">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-base text-white">استفسار وتسجيل عبر الواتساب المباشر</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        {course && (
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-amber-400">الكورس المطلوب:</span>
            <p className="font-extrabold text-sm text-white">{course.titleAr}</p>
            <p className="text-xs text-emerald-400 font-bold">{course.discountPrice || course.originalPrice} EGP</p>
          </div>
        )}

        <form onSubmit={handleSubmitInquiry} className="space-y-4 text-xs font-bold text-slate-300">
          <div>
            <label className="block mb-1">اسم ولي الأمر *</label>
            <input
              type="text"
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="أدخل اسم حضرتك"
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1">اسم الطالب (الطفل)</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="اسم الطفل"
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1">رقم الموبايل والواتساب *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010XXXXXXXX"
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            <span>إرسال الاستفسار والتحويل للواتساب 📱</span>
          </button>
        </form>
      </div>
    </div>
  );
};
