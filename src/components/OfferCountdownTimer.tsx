import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface OfferCountdownTimerProps {
  endAtIso: string;
  onExpire?: () => void;
  compact?: boolean;
}

export const OfferCountdownTimer: React.FC<OfferCountdownTimerProps> = ({
  endAtIso,
  onExpire,
  compact = false
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const nowMs = Date.now(); // Using server / standard system time
      const targetMs = new Date(endAtIso).getTime();
      const diffMs = targetMs - nowMs;

      if (diffMs <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endAtIso]);

  if (timeLeft.isExpired) {
    return (
      <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" /> انتهى العرض
      </div>
    );
  }

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold font-mono dir-ltr">
        <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
        <span>
          {timeLeft.days > 0 && `${pad(timeLeft.days)}d `}
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-amber-500/30 shadow-lg space-y-2">
      <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>ينتهي العرض خلال:</span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center font-mono dir-ltr">
        <div className="bg-slate-800 p-2 rounded-xl border border-slate-700">
          <span className="block text-lg font-black text-amber-400">{pad(timeLeft.days)}</span>
          <span className="text-[9px] text-slate-400 font-sans font-bold">أيام</span>
        </div>
        <div className="bg-slate-800 p-2 rounded-xl border border-slate-700">
          <span className="block text-lg font-black text-white">{pad(timeLeft.hours)}</span>
          <span className="text-[9px] text-slate-400 font-sans font-bold">ساعات</span>
        </div>
        <div className="bg-slate-800 p-2 rounded-xl border border-slate-700">
          <span className="block text-lg font-black text-white">{pad(timeLeft.minutes)}</span>
          <span className="text-[9px] text-slate-400 font-sans font-bold">دقائق</span>
        </div>
        <div className="bg-slate-800 p-2 rounded-xl border border-slate-700">
          <span className="block text-lg font-black text-rose-400">{pad(timeLeft.seconds)}</span>
          <span className="text-[9px] text-slate-400 font-sans font-bold">ثواني</span>
        </div>
      </div>
    </div>
  );
};
