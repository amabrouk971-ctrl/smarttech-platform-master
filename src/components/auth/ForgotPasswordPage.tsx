import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { sendResetEmail, logSecurityEvent } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';

interface ForgotPasswordPageProps {
  onNavigateBack: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateBack }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');
  const { isArabic } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('SENDING');
    setMessage(isArabic ? 'جاري إرسال الرابط...' : 'Sending...');
    
    try {
      await sendResetEmail(email);
      await logSecurityEvent({
        userId: email,
        eventType: 'PASSWORD_RESET_REQUEST',
        result: 'SUCCESS'
      });
      setStatus('SUCCESS');
      setMessage('If an account exists for this email, a password reset link has been sent.');
    } catch (err: any) {
      await logSecurityEvent({
        userId: email,
        eventType: 'PASSWORD_RESET_REQUEST',
        result: 'FAILURE',
        metadata: { error: err.message }
      });
      setStatus('SUCCESS'); // Generic success to prevent enumeration
      setMessage('If an account exists for this email, a password reset link has been sent.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
      
      <button 
        onClick={onNavigateBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-8"
      >
        {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {isArabic ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
      </button>

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-2xl font-black text-white mb-2">Reset your password</h2>
        <p className="text-slate-400 text-sm">
          أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
        </p>
      </div>

      {(status === 'SUCCESS' || status === 'ERROR') && (
        <div className={`p-4 rounded-xl mb-6 text-sm text-center font-bold ${status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message}
        </div>
      )}

      {status !== 'SUCCESS' && (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 px-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-10 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="name@example.com"
                dir="ltr"
              />
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'SENDING'}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            {status === 'SENDING' ? 'SENDING...' : 'SEND RESET LINK'}
          </button>
        </form>
      )}
    </div>
  );
};
