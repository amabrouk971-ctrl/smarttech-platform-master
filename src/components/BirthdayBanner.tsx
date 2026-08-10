import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, X, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BirthdayBannerProps {
  userName: string;
  onClaimBonus: (xpAmount: number) => void;
}

export const BirthdayBanner: React.FC<BirthdayBannerProps> = ({ userName, onClaimBonus }) => {
  const [claimed, setClaimed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Trigger celebratory confetti burst on birthday check
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
  }, []);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-amber-300/40 relative overflow-hidden my-4 dir-rtl text-right">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 left-3 p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
            🎂
          </div>
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] border border-white/30 uppercase tracking-wider">
              SmartTech Birthday Greeting
            </span>
            <h4 className="text-lg font-black leading-snug">
              عيد ميلاد سعيد يا بطل، {userName}! 🎉
            </h4>
            <p className="text-xs text-white/90 font-medium">
              عائلة SmartTech تتمنى لك سنة مليئة بالابتكارات والاختراعات الرائعة!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (!claimed) {
              setClaimed(true);
              onClaimBonus(100);
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
          }}
          disabled={claimed}
          className={`px-6 py-2.5 rounded-xl font-black text-xs transition shadow-lg shrink-0 cursor-pointer flex items-center gap-2 ${
            claimed
              ? 'bg-emerald-500 text-white cursor-default'
              : 'bg-slate-950 hover:bg-slate-900 text-amber-300 border border-amber-400/40'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>{claimed ? 'تم استلام هادية +100 XP! 🎁' : 'استلم هدية عيد الميلاد (+100 XP) 🎁'}</span>
        </button>
      </div>
    </div>
  );
};
