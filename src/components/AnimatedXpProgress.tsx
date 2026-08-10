import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Award, Zap, Trophy, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnimatedXpProgressProps {
  currentXp: number;
  maxXpForLevel?: number;
  level: number;
  levelTitle?: string;
  showDetails?: boolean;
}

export const AnimatedXpProgress: React.FC<AnimatedXpProgressProps> = ({
  currentXp,
  maxXpForLevel = 1000,
  level,
  levelTitle = 'مبرمج المستقبل المستكشف',
  showDetails = true
}) => {
  const percentage = Math.min(100, Math.max(0, (currentXp % maxXpForLevel) / (maxXpForLevel / 100)));

  return (
    <div className="space-y-3 w-full dir-rtl text-right">
      {showDetails && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-black text-sm shadow-sm"
            >
              <Trophy className="w-4 h-4" />
            </motion.div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                المستوى {level}
              </span>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                {levelTitle}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-3 py-1 rounded-full">
            <Flame className="w-4 h-4 text-red-600 animate-bounce" />
            <span className="text-xs font-black text-red-600 dark:text-red-400 font-mono">
              {currentXp} XP
            </span>
          </div>
        </div>
      )}

      {/* Animated Framer Motion Progress Bar */}
      <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-300/50 dark:border-slate-700/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }} // Spring bounce ease
          className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500 rounded-full relative overflow-hidden shadow-md shadow-red-500/30"
        >
          {/* Shimmer Light Bar Effect */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute top-0 left-0 w-1/3 h-full bg-white/40 skew-x-12"
          />
        </motion.div>
      </div>

      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
        <span>المستوى التالي عند {(Math.floor(currentXp / maxXpForLevel) + 1) * maxXpForLevel} XP</span>
        <span className="font-mono text-red-600 font-extrabold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

// Floating XP Popup Notification Component
export interface XpGainEvent {
  id: string;
  amount: number;
  reason: string;
}

export const FloatingXpGainToast: React.FC<{ events: XpGainEvent[]; onDismiss: (id: string) => void }> = ({
  events,
  onDismiss
}) => {
  return (
    <div className="fixed top-20 left-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {events.map((ev) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: 50, scale: 0.5, rotate: -5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onAnimationComplete={() => {
              setTimeout(() => onDismiss(ev.id), 2500);
            }}
            className="bg-slate-900 text-white border-2 border-amber-400 p-4 rounded-2xl shadow-2xl flex items-center gap-3 dir-rtl text-right pointer-events-auto min-w-[240px]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/40">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <span className="text-amber-400 font-black text-base flex items-center gap-1">
                +{ev.amount} XP! 🎉
              </span>
              <p className="text-xs text-slate-300 font-semibold">{ev.reason}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
