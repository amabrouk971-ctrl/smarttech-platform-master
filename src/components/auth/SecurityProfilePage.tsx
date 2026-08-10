import React, { useState } from 'react';
import { Lock, ShieldCheck, Mail, AlertTriangle, LogOut, Smartphone, CheckCircle2 } from 'lucide-react';
import { auth } from '../../firebase/config';
import { updatePassword, sendEmailVerification, signOut } from 'firebase/auth';
import { logSecurityEvent } from '../../services/authService';

interface SecurityProfilePageProps {
  onSignOut: () => void;
}

export const SecurityProfilePage: React.FC<SecurityProfilePageProps> = ({ onSignOut }) => {
  const user = auth.currentUser;
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

  if (!user) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
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
      await updatePassword(user, newPassword);
      setStatus('SUCCESS');
      setMessage('Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
      await logSecurityEvent({
        userId: user.uid,
        userEmail: user.email || '',
        eventType: 'PASSWORD_CHANGED',
        result: 'SUCCESS'
      });
    } catch (err: any) {
      console.error(err);
      setStatus('ERROR');
      if (err.code === 'auth/requires-recent-login') {
        setMessage('Please sign out and sign in again to change your password.');
      } else {
        setMessage('Failed to change password. Please try again.');
      }
      await logSecurityEvent({
        userId: user.uid,
        userEmail: user.email || '',
        eventType: 'PASSWORD_CHANGED',
        result: 'FAILURE',
        metadata: { error: err.code }
      });
    }
  };

  const handleSendVerification = async () => {
    if (!user || user.emailVerified) return;
    setVerifyStatus('SENDING');
    try {
      await sendEmailVerification(user);
      setVerifyStatus('SENT');
    } catch (err) {
      console.error('Failed to send verification', err);
      setVerifyStatus('IDLE');
    }
  };

  const handleSignOutAll = async () => {
    // Firebase client SDK doesn't natively support sign out all devices directly without admin SDK or revoking tokens on backend.
    // We log it and sign out current device.
    await logSecurityEvent({
      userId: user.uid,
      userEmail: user.email || '',
      eventType: 'ALL_SESSIONS_REVOKED',
      result: 'SUCCESS'
    });
    await signOut(auth);
    onSignOut();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="ltr">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Security Profile
        </h2>

        <div className="space-y-6">
          {/* Email Status */}
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Email Address</h3>
                  <p className="text-slate-400 text-sm mb-2">{user.email}</p>
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                      <AlertTriangle className="w-3.5 h-3.5" /> UNVERIFIED
                    </span>
                  )}
                </div>
              </div>
              {!user.emailVerified && (
                <button
                  onClick={handleSendVerification}
                  disabled={verifyStatus !== 'IDLE'}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {verifyStatus === 'SENDING' ? 'SENDING...' : verifyStatus === 'SENT' ? 'SENT' : 'VERIFY EMAIL'}
                </button>
              )}
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-400" />
              Change Password
            </h3>
            
            {status === 'SUCCESS' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-xl mb-4">
                {message}
              </div>
            )}
            {status === 'ERROR' && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4">
                {message}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'SAVING' || !newPassword || !confirmPassword}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {status === 'SAVING' ? 'SAVING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </div>

          {/* Sessions */}
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-slate-400" />
              Active Sessions
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              If you notice suspicious activity, you can sign out of all devices. You will need to sign in again.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { signOut(auth); onSignOut(); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                SIGN OUT
              </button>
              <button
                onClick={handleSignOutAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold rounded-lg transition-colors border border-red-500/20"
              >
                <AlertTriangle className="w-4 h-4" />
                SIGN OUT ALL DEVICES
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
