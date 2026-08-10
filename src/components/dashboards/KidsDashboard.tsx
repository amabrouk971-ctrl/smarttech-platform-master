import React, { useState } from 'react';
import {
  Gamepad2,
  Award,
  Trophy,
  Sparkles,
  Bot,
  Zap,
  Play,
  Code2,
  CheckCircle2,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedXpProgress } from '../AnimatedXpProgress';
import { StudentQrCard } from '../StudentQrCard';
import { BirthdayBanner } from '../BirthdayBanner';
import { ZiziniaCheckInQrGenerator } from '../ZiziniaCheckInQrGenerator';

interface KidsDashboardProps {
  xpPoints: number;
  unlockedBadges: string[];
  onOpenLab: (labId: string) => void;
  studentName?: string;
  studentId?: string;
  onAwardXp?: (amount: number) => void;
}

export const KidsDashboard: React.FC<KidsDashboardProps> = ({
  xpPoints,
  unlockedBadges,
  onOpenLab,
  studentName = 'أحمد محمد',
  studentId = 'ST-2026-901',
  onAwardXp
}) => {
  const [showQrModal, setShowQrModal] = useState(false);

  const missions = [
    {
      id: 'm1',
      titleAr: 'بناء حركة الكائن في Scratch',
      lab: 'scratch',
      xp: 100,
      completed: true
    },
    {
      id: 'm2',
      titleAr: 'توصيل LED بحساس Ultrasonic',
      lab: 'arduino',
      xp: 150,
      completed: false
    },
    {
      id: 'm3',
      titleAr: 'تدريب نموذج رؤية الذكاء الاصطناعي',
      lab: 'ai',
      xp: 180,
      completed: false
    },
    {
      id: 'm4',
      titleAr: 'اجتياز حلبة الروبوت وتفادي العوائق',
      lab: 'robotics',
      xp: 200,
      completed: false
    }
  ];

  return (
    <div className="space-y-8 dir-rtl text-right">
      {/* Automated Birthday Banner */}
      <BirthdayBanner
        userName={studentName}
        onClaimBonus={(amount) => {
          if (onAwardXp) onAwardXp(amount);
        }}
      />

      {/* Kids Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-red-600/20 relative overflow-hidden flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <span className="px-3 py-1 rounded-full bg-white/20 font-black text-xs uppercase tracking-wider">
            🎮 Kids Explorer Mode
          </span>
          <h2 className="text-2xl sm:text-4xl font-black">أهلاً بك يا بطل سمارتك، {studentName}! 🚀</h2>
          <p className="text-xs sm:text-sm text-red-100 font-bold max-w-xl">
            واصل تنفيذ المهام التفاعلية في المختبرات، واجمع نقاط الـ XP لفتح أوسمة جديدة والارتقاء بالمستوى!
          </p>

          <button
            onClick={() => setShowQrModal(!showQrModal)}
            className="mt-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 rounded-xl text-xs font-extrabold border border-amber-400/30 transition flex items-center gap-2 cursor-pointer shadow"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>عرض كود QR الحضور بفرع زيزينيا 📍</span>
          </button>
        </div>

        {/* Level Badge Card with Animated Framer Motion XP Progress */}
        <div className="bg-slate-950/90 backdrop-blur border border-white/20 p-5 rounded-2xl text-center space-y-3 z-10 shrink-0 min-w-[260px]">
          <AnimatedXpProgress
            currentXp={xpPoints}
            level={Math.floor(xpPoints / 1000) + 1}
            levelTitle="طالب بطل بـ SmartTech"
            showDetails={true}
          />
        </div>
      </div>

      {/* Zizinia Student Check-In QR Modal & Generator Section */}
      {showQrModal && (
        <div className="p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md rounded-3xl border border-red-500/30 shadow-2xl space-y-4 max-w-lg mx-auto">
          <div className="flex justify-between items-center text-white pb-2 border-b border-slate-800">
            <h3 className="font-black text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-400" /> كود الحضور والتوثيق اليومي بفرع زيزينيا
            </h3>
            <button onClick={() => setShowQrModal(false)} className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer">
              إغلاق ✕
            </button>
          </div>
          <ZiziniaCheckInQrGenerator
            studentName={studentName}
            studentId={studentId}
            onAwardXp={onAwardXp}
          />
        </div>
      )}

      {/* Quick Launch Interactive Labs */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-red-600" /> المختبرات التفاعلية المتاحة للعب والتعلم:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'scratch', title: 'Scratch Coding Lab', icon: Code2, color: 'from-amber-500 to-orange-600', xp: '+100 XP' },
            { id: 'arduino', title: 'Arduino Simulator', icon: Zap, color: 'from-amber-600 to-red-600', xp: '+150 XP' },
            { id: 'robotics', title: 'Virtual Robotics Arena', icon: Bot, color: 'from-blue-600 to-indigo-600', xp: '+200 XP' },
            { id: 'ai', title: 'AI Creator Vision Lab', icon: Sparkles, color: 'from-purple-600 to-pink-600', xp: '+180 XP' }
          ].map((lab) => {
            const Icon = lab.icon;
            return (
              <button
                key={lab.id}
                onClick={() => onOpenLab(lab.id)}
                className={`p-5 rounded-2xl bg-gradient-to-tr ${lab.color} text-white shadow-lg hover:scale-105 transition-all text-right flex flex-col justify-between h-40 cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-8 h-8 text-white" />
                  <span className="px-2 py-0.5 bg-black/30 rounded text-[10px] font-bold">
                    {lab.xp}
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-base leading-tight mb-1">{lab.title}</h4>
                  <span className="text-xs text-white/90 font-bold flex items-center gap-1">
                    افتح المختبر الآن 🟢
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Physical Branch Zizinia Check-In QR Section */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-red-600" /> كود تأكيد الحضور المعملي بفرع زيزينيا (الإسكندرية):
        </h3>
        <ZiziniaCheckInQrGenerator
          studentName={studentName}
          studentId={studentId}
          onAwardXp={onAwardXp}
        />
      </div>

      {/* Missions Checklist */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
          مهامك الأسبوعية المطلوبة (Missions Checklist):
        </h3>

        <div className="space-y-3">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                m.completed
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {m.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                ) : (
                  <span className="w-6 h-6 rounded-full border-2 border-slate-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">{m.titleAr}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    مكافأة: +{m.xp} XP
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onOpenLab(m.lab);
                  if (onAwardXp) onAwardXp(m.xp);
                }}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition cursor-pointer"
              >
                {m.completed ? 'إعادة اللعب 🔄' : 'ابدأ المهمة 🚀'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
