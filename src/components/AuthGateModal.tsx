import React from 'react';
import { Lock, Sparkles, X, UserPlus, LogIn, BookOpen, ShieldAlert } from 'lucide-react';
import { Role } from '../types';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (preferredRole?: Role) => void;
  title?: string;
  description?: string;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  title = 'محتوى تعليمي محمي بكلمة مرور / تسجيل دخول',
  description = 'للوصول إلى الدروس التفاعلية، ورش العمل، المجموعات، والامتحانات، يرجى تسجيل الدخول أو إنشاء حساب جديد في منصة سمارتك.'
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
            بوابة تسجيل الدخول - Guest Gate
          </span>
          <h3 className="text-2xl font-black text-white">{title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> ما الذي ستحصل عليه عند الانضمام؟
          </h4>
          <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside font-semibold">
            <li>مختبرات محاكاة تفاعلية (Scratch, Arduino, Robotics, AI Kids Lab)</li>
            <li>متابعة نسبة إنجاز المهارات ونقاط الـ XP والشارات</li>
            <li>بطاقة كود QR المخصصة لتسجيل الحضور الذكي</li>
            <li>التواصل المباشر مع المدربين وأولياء الأمور</li>
          </ul>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-5 h-5" /> تسجيل الدخول لحسابك الحالي
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAuth(Role.STUDENT);
              }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-400" /> تسجيل كطالب
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth(Role.PARENT);
              }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" /> تسجيل ولي أمر
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth(Role.TEACHER);
              }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" /> تقديم كمدرب
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-bold transition cursor-pointer"
          >
            متابعة التصفح كزائر في الصفحات العامة
          </button>
        </div>
      </div>
    </div>
  );
};
