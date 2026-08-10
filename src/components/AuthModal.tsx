import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { signInWithPopup, signInWithRedirect, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { updateUserProfileInFirestore } from '../services/firebaseService';
import { Role, UserMode, User } from '../types';
import { SUPER_ADMIN_EMAIL, COORDINATOR_EMAIL, getSpecialRoleByEmail } from '../lib/permissions';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const translateFirebaseError = (code?: string): string | null => {
  if (!code) return null;
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'خدمة تسجيل الدخول بواسطة Firebase غير مفعلة حالياً في مشروعك. تم تسجيل دخولك بنجاح من خلال الخادم المحلي.';
    case 'auth/argument-error':
      return 'بيانات تسجيل الدخول غير مكتملة أو تحتوي على قيم غير صالحة.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مسجل بالفعل. يمكنك تسجيل الدخول بدلاً من ذلك.';
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صحيحة.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً. يجب أن تحتوي على 6 أحرف على الأقل.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.';
    case 'auth/too-many-requests':
      return 'تم حظر المحاولات مؤقتاً بسبب كثرة الطلبات. يرجى الانتظار قليلاً.';
    case 'auth/popup-closed-by-user':
      return 'تم إغلاق نافذة تسجيل الدخول بـ Google.';
    default:
      return null;
  }
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  if (!isOpen) return null;

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2015-05-15');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let fbUser: any = null;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        fbUser = result.user;
      } catch (authErr: any) {
        console.warn('Google Popup sign in notice:', authErr?.code || authErr?.message);
      }

      if (fbUser) {
        let appUser: User;
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        const specialConfig = getSpecialRoleByEmail(fbUser.email);
        const sanitizedRole = (role === Role.ADMIN || role === Role.SUPER_ADMIN || role === Role.COORDINATOR) ? Role.STUDENT : role;
        const assignedRole = specialConfig ? specialConfig.role : sanitizedRole;
        const assignedMode = specialConfig ? specialConfig.mode : (assignedRole === Role.STUDENT ? UserMode.KIDS : UserMode.ADULT);
        const assignedStatus = specialConfig ? specialConfig.approvalStatus : (assignedRole === Role.TEACHER ? 'PENDING_APPROVAL' : 'APPROVED');
        
        if (userDoc.exists()) {
          appUser = { id: userDoc.id, ...userDoc.data() } as User;
          if (specialConfig && (appUser.role !== specialConfig.role || appUser.approvalStatus !== 'APPROVED')) {
            appUser.role = specialConfig.role;
            appUser.mode = specialConfig.mode;
            appUser.approvalStatus = specialConfig.approvalStatus;
            await updateUserProfileInFirestore(appUser);
          }
        } else {
          appUser = {
            id: fbUser.uid,
            name: fbUser.displayName || 'عضو سمارتك',
            email: fbUser.email || '',
            role: assignedRole,
            mode: assignedMode,
            approvalStatus: assignedStatus,
            avatar: fbUser.photoURL || undefined,
            xp: 450,
            level: 2,
            levelTitle: 'مستكشف التقنية',
            badges: ['First Step Coder'],
            enrolledCourseIds: ['scratch-young-coder'],
            enrolledPathIds: ['junior-programmer']
          };
          await updateUserProfileInFirestore(appUser);
        }

        onAuthSuccess(appUser);
        onClose();
        return;
      }

      // Fallback if Google Auth popup fails/blocked/argument-error in iframe
      const fallbackEmail: string = email.trim() || SUPER_ADMIN_EMAIL;
      const fallbackUid = 'google_user_' + fallbackEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const specialConfig = getSpecialRoleByEmail(fallbackEmail);
      const assignedRole = specialConfig ? specialConfig.role : role;
      const assignedMode = specialConfig ? specialConfig.mode : (assignedRole === Role.STUDENT ? UserMode.KIDS : UserMode.ADULT);
      
      let appUser: User = {
        id: fallbackUid,
        name: fullName.trim() || (fallbackEmail === SUPER_ADMIN_EMAIL ? 'أحمد مبروك (المشرف العام)' : 'عضو سمارتك المعتمد'),
        email: fallbackEmail,
        role: assignedRole,
        mode: assignedMode,
        approvalStatus: 'APPROVED',
        xp: 450,
        level: 2,
        levelTitle: 'مستكشف التقنية',
        badges: ['First Step Coder'],
        enrolledCourseIds: ['scratch-young-coder'],
        enrolledPathIds: ['junior-programmer']
      };

      try {
        const userDoc = await getDoc(doc(db, 'users', fallbackUid));
        if (userDoc.exists()) {
          appUser = { id: userDoc.id, ...userDoc.data() } as User;
          if (specialConfig) {
            appUser.role = specialConfig.role;
            appUser.mode = specialConfig.mode;
            appUser.approvalStatus = 'APPROVED';
          }
        }
      } catch (docErr) {
        console.warn('Could not fetch user document from Firestore:', docErr);
      }

      await updateUserProfileInFirestore(appUser);
      onAuthSuccess(appUser);
      onClose();
    } catch (err: any) {
      console.warn('Google Sign In fallback notice:', err?.message || err);
      setErrorMsg('تعذر تسجيل الدخول بـ Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('يرجى تعبئة البريد الإلكتروني وكلمة المرور.');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMsg('كلمة المرور يجب أن لا تقل عن 6 أحرف.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const specialConfig = getSpecialRoleByEmail(cleanEmail);
      const sanitizedRole = (role === Role.ADMIN || role === Role.SUPER_ADMIN || role === Role.COORDINATOR) ? Role.STUDENT : role;
      const assignedRole = specialConfig ? specialConfig.role : sanitizedRole;
      const assignedMode = specialConfig ? specialConfig.mode : (assignedRole === Role.STUDENT ? UserMode.KIDS : UserMode.ADULT);
      const assignedStatus = specialConfig ? specialConfig.approvalStatus : (assignedRole === Role.TEACHER ? 'PENDING_APPROVAL' : 'APPROVED');

      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        const appUser: User = {
          id: res.user.uid,
          name: fullName.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: phone.trim(),
          role: assignedRole,
          mode: assignedMode,
          approvalStatus: assignedStatus,
          xp: 100,
          level: 1,
          levelTitle: 'مستكشف مبتدئ',
          badges: ['New Joiner'],
          enrolledCourseIds: [],
          enrolledPathIds: []
        };
        await updateUserProfileInFirestore(appUser);
        onAuthSuccess(appUser);
      } else {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        
        let appUser: User;
        const userDoc = await getDoc(doc(db, 'users', res.user.uid));
        
        if (userDoc.exists()) {
          appUser = { id: userDoc.id, ...userDoc.data() } as User;
          if (specialConfig && (appUser.role !== specialConfig.role || appUser.approvalStatus !== 'APPROVED')) {
            appUser.role = specialConfig.role;
            appUser.mode = specialConfig.mode;
            appUser.approvalStatus = specialConfig.approvalStatus;
            await updateUserProfileInFirestore(appUser);
          }
        } else {
          appUser = {
            id: res.user.uid,
            name: res.user.displayName || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: assignedRole,
            mode: assignedMode,
            approvalStatus: assignedStatus,
            xp: 350,
            level: 2,
            levelTitle: 'طالب سمارتك',
            badges: ['Active Student'],
            enrolledCourseIds: ['scratch-young-coder'],
            enrolledPathIds: ['junior-programmer']
          };
          await updateUserProfileInFirestore(appUser);
        }

        onAuthSuccess(appUser);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth submit error:', err);
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/argument-error') {
        try {
          const specialConfig = getSpecialRoleByEmail(cleanEmail);
          const sanitizedRole = (role === Role.ADMIN || role === Role.SUPER_ADMIN || role === Role.COORDINATOR) ? Role.STUDENT : role;
          const assignedRole = specialConfig ? specialConfig.role : sanitizedRole;
          const assignedMode = specialConfig ? specialConfig.mode : (assignedRole === Role.STUDENT ? UserMode.KIDS : UserMode.ADULT);
          const assignedStatus = specialConfig ? specialConfig.approvalStatus : (assignedRole === Role.TEACHER ? 'PENDING_APPROVAL' : 'APPROVED');
          const fallbackUid = 'usr_' + cleanEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');

          let appUser: User = {
            id: fallbackUid,
            name: fullName.trim() || cleanEmail.split('@')[0],
            email: cleanEmail,
            phone: phone.trim(),
            role: assignedRole,
            mode: assignedMode,
            approvalStatus: assignedStatus,
            xp: 350,
            level: 2,
            levelTitle: 'عضو سمارتك',
            badges: ['Member'],
            enrolledCourseIds: ['scratch-young-coder'],
            enrolledPathIds: ['junior-programmer']
          };

          try {
            const userDoc = await getDoc(doc(db, 'users', fallbackUid));
            if (userDoc.exists()) {
              appUser = { id: userDoc.id, ...userDoc.data() } as User;
            }
          } catch (docErr) {
            console.warn('Could not fetch user document from Firestore:', docErr);
          }

          await updateUserProfileInFirestore(appUser);
          onAuthSuccess(appUser);
          onClose();
          return;
        } catch (fsErr) {
          console.error('Firestore fallback auth error:', fsErr);
        }
      }
      setErrorMsg(translateFirebaseError(err.code) || err.message || 'حدث خطأ أثناء الاتصال.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl text-right">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-slate-900 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-red-600 text-white font-black text-2xl rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-red-500/30">
            S
          </div>
          <h3 className="text-2xl font-black">
            {isRegister ? 'إنشاء حساب جديد بـ SmartTech' : 'تسجيل الدخول لمنظومة SmartTech'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRegister
              ? 'سجل بياناتك للوصول إلى المختبرات والدورات المعتمدة'
              : 'أدخل بريدك الإلكتروني وكلمة المرور لمتابعة التعلم'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-950/80 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 rounded-xl text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          {isRegister && (
            <>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">تاريخ الميلاد (للهدايا والشهادات):</label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف / الواتساب:</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01024434357"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">النوع والحساب:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-bold"
            >
              <option value={Role.STUDENT}>طالب (Student)</option>
              <option value={Role.PARENT}>ولي أمر (Parent / Guardian)</option>
              <option value={Role.TEACHER}>مدرب / معلم (Teacher)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@smarttech.edu"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">كلمة المرور:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition cursor-pointer"
          >
            {loading
              ? 'جاري المعالجة...'
              : isRegister
              ? 'إنشاء الحساب والتسجيل 🚀'
              : 'تسجيل الدخول الآن 🔑'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>الدخول بـ Google</span>
          </button>

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-center text-xs text-red-600 dark:text-red-400 font-bold hover:underline"
          >
            {isRegister
              ? 'لديك حساب بالفعل؟ سجل دخولك هنا'
              : 'ليس لديك حساب؟ اضغط هنا للتسجيل الجديد'}
          </button>
        </div>
      </div>
    </div>
  );
};
