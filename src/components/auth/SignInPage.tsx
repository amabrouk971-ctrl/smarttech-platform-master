import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { auth, googleProvider } from '../../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { fetchAuthSettings, logSecurityEvent } from '../../services/authService';
import { AuthSettings } from '../../types';

interface SignInPageProps {
  onSignInSuccess: () => void;
  onNavigateToForgot: () => void;
  onNavigateToRegister: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSignInSuccess, onNavigateToForgot, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AuthSettings | null>(null);

  useEffect(() => {
    fetchAuthSettings().then(setSettings);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await logSecurityEvent({
        userId: cred.user.uid,
        userEmail: cred.user.email || '',
        eventType: 'SIGN_IN',
        result: 'SUCCESS'
      });
      onSignInSuccess();
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password.');
      await logSecurityEvent({
        userId: email,
        userEmail: email,
        eventType: 'SIGN_IN',
        result: 'FAILURE',
        metadata: { error: err.code }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await logSecurityEvent({
        userId: cred.user.uid,
        userEmail: cred.user.email || '',
        eventType: 'SIGN_IN',
        result: 'SUCCESS',
        metadata: { provider: 'google.com' }
      });
      onSignInSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Failed to sign in with Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/20 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h2>
        <p className="text-slate-400 text-sm">مرحباً بك مجدداً في أكاديمية سمارتك</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4 relative z-10" dir="rtl">
        {settings?.enableEmailPassword !== false && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 px-1">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-10 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="name@example.com"
                />
                <Mail className="absolute right-3 top-3.5 w-5 h-5 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 px-1">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-12 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-3 top-3.5 w-5 h-5 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 p-0.5 text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? "HIDE PASSWORD" : "SHOW PASSWORD"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onNavigateToForgot}
                className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                FORGOT PASSWORD?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'SIGN IN'}
            </button>
          </>
        )}

        {settings?.enableGoogle !== false && (
          <div className="pt-2 space-y-4">
            {settings?.enableEmailPassword !== false && (
              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-xs font-bold text-slate-500">أو</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>
            )}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              CONTINUE WITH GOOGLE
            </button>
          </div>
        )}
      </form>

      <div className="mt-8 text-center relative z-10">
        <p className="text-sm text-slate-400">
          ليس لديك حساب؟{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-white font-bold hover:text-red-400 transition-colors uppercase"
          >
            CREATE ACCOUNT
          </button>
        </p>
      </div>
    </div>
  );
};
