import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { auth } from '../../firebase/config';
import { confirmPasswordReset } from 'firebase/auth';
import { logSecurityEvent } from '../../services/authService';

interface ResetPasswordPageProps {
  oobCode: string;
  onNavigateToSignIn: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ oobCode, onNavigateToSignIn }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('ERROR');
      setMessage('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 8) {
      setStatus('ERROR');
      setMessage('Password must be at least 8 characters.');
      return;
    }

    setStatus('SAVING');
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('SUCCESS');
      setMessage('Your password has been reset successfully.');
      await logSecurityEvent({
        userId: 'UNKNOWN',
        eventType: 'PASSWORD_RESET_COMPLETED',
        result: 'SUCCESS'
      });
    } catch (err: any) {
      console.error(err);
      setStatus('ERROR');
      // Generic error message as requested
      setMessage('Your password reset link is invalid or has expired.');
      await logSecurityEvent({
        userId: 'UNKNOWN',
        eventType: 'PASSWORD_RESET_COMPLETED',
        result: 'FAILURE',
        metadata: { error: err.code }
      });
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden" dir="ltr">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-2xl font-black text-white mb-2">Create New Password</h2>
        <p className="text-slate-400 text-sm">Please enter your new password below.</p>
      </div>

      {status === 'SUCCESS' ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-emerald-400 font-bold">{message}</p>
          <button
            onClick={onNavigateToSignIn}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all uppercase"
          >
            SIGN IN
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {status === 'ERROR' && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 px-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-12 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 p-0.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 px-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-12 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3.5 p-0.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'SAVING'}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            {status === 'SAVING' ? 'SAVING...' : 'RESET PASSWORD'}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={onNavigateToSignIn}
              className="text-xs font-bold text-slate-400 hover:text-white uppercase transition-colors"
            >
              CANCEL
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
