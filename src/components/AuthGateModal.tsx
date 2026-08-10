import React from 'react';
import { Lock, Sparkles, X, UserPlus, LogIn, BookOpen, ShieldAlert } from 'lucide-react';
import { Role } from '../types';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (preferredRole?: Role) => void;
  onBookCourse?: () => void;
  title?: string;
  description?: string;
  isNotEnrolledUser?: boolean;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onBookCourse,
  title = 'سجّل الدخول للوصول إلى المحتوى',
  description = 'هذا المحتوى متاح للطلاب المسجلين فقط.',
  isNotEnrolledUser = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-right">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 font-bold text-[10px] uppercase tracking-wider inline-block">
            {isNotEnrolledUser ? 'محتوى محمي للطلاب المسجلين' : 'بوابة الأمان والوصول - SmartTech Gate'}
          </span>
          <h3 className="text-2xl font-black text-white">{title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-semibold">{description}</p>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> ميزات الاشتراك الفعّال مع سمارتك:
          </h4>
          <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside font-semibold">
            <li>الوصول الكامل إلى الفيديوهات، العروض التقديمية وملفات PDF</li>
            <li>مختبرات محاكاة تفاعلية وتحديات البرمجة والذكاء الاصطناعي</li>
            <li>مشاريع التخرج والامتحانات وتقييمات المدرب المباشرة</li>
            <li>شهادة إتمام موثقة برقم تسلسلي وكود QR للتحقق</li>
          </ul>
        </div>

        {isNotEnrolledUser ? (
          <div className="space-y-3 pt-2">
            {onBookCourse && (
              <button
                onClick={() => {
                  onClose();
                  onBookCourse();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-5 h-5" /> احجز الكورس الآن وافتح المحتوى
              </button>
            )}
            <a
              href="https://wa.me/201021020202?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%AA%D9%81%D8%B9%D9%8A%D9%84%20%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%D9%8A%20%D9%81%D9%8A%20%D8%A7%D9%84%D9%83%D9%88%D8%B1%D8%B3"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer block text-center"
            >
              💬 تواصل مع الإدارة عبر WhatsApp للتفعيل المباشر
            </a>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-5 h-5" /> تسجيل الدخول [ Sign In ]
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth(Role.STUDENT);
                }}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-400" /> إنشاء حساب جديد
              </button>
              {onBookCourse && (
                <button
                  onClick={() => {
                    onClose();
                    onBookCourse();
                  }}
                  className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl border border-emerald-600 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-white" /> احجز الكورس
                </button>
              )}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-bold transition cursor-pointer"
          >
            العودة للكورس ومتابعة التصفح العام
          </button>
        </div>
      </div>
    </div>
  );
};
