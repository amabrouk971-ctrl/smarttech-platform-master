import React, { useState } from 'react';
import { Bot, Play, RotateCcw, Cpu, Sparkles, CheckCircle2, Award, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface RoboticsSimulatorProps {
  onAwardXp?: (amount: number) => void;
}

export const RoboticsSimulator: React.FC<RoboticsSimulatorProps> = ({ onAwardXp }) => {
  const [robotConfig, setRobotConfig] = useState({
    chassis: '4WD Steel Chassis',
    wheels: 'Off-road High-Grip Wheels',
    microcontroller: 'Arduino Uno R3',
    sensors: ['Ultrasonic HC-SR04', 'IR Line Tracker'],
    hasCamera: true
  });

  const [robotPos, setRobotPos] = useState({ x: 20, y: 120, rotation: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [missionPassed, setMissionPassed] = useState(false);

  const startSimulation = () => {
    setIsRunning(true);
    setMissionPassed(false);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < 12) {
        setRobotPos((prev) => ({ ...prev, x: prev.x + 18 }));
      } else if (step < 18) {
        setRobotPos((prev) => ({ ...prev, y: prev.y + 12, rotation: 90 }));
      } else if (step < 28) {
        setRobotPos((prev) => ({ ...prev, x: prev.x + 18, rotation: 0 }));
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setMissionPassed(true);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        if (onAwardXp) onAwardXp(200);
      }
    }, 200);
  };

  const resetSimulation = () => {
    setRobotPos({ x: 20, y: 120, rotation: 0 });
    setIsRunning(false);
    setMissionPassed(false);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl dir-rtl text-right">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-blue-400" /> Virtual Robotics Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            صمم هيكل الروبوت، أضف الحساسات والمحركات، واختبر الروبوت في حلبة تفادي العوائق وتتبع الخط!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetSimulation}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> إعادة ضبط
          </button>
          <button
            onClick={startSimulation}
            disabled={isRunning}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" /> تشغيل تجربة الروبوت 🤖
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Robot Configurator */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            مواصفات هيكل الروبوت (Robot Specs):
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">المتحكم الرئيسي:</label>
              <select
                value={robotConfig.microcontroller}
                onChange={(e) => setRobotConfig({ ...robotConfig, microcontroller: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-bold"
              >
                <option>Arduino Uno R3</option>
                <option>ESP32 Dual-Core WiFi</option>
                <option>Raspberry Pi Robotics</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">المحركات والعجلات:</label>
              <select
                value={robotConfig.wheels}
                onChange={(e) => setRobotConfig({ ...robotConfig, wheels: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-bold"
              >
                <option>Off-road High-Grip Wheels</option>
                <option>Mecanum Omni Wheels</option>
                <option>Tracked Tank Rubber Belt</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="block text-slate-400 mb-2 font-bold">الحساسات والكاميرا:</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked readOnly className="accent-blue-500" />
                  <span className="text-slate-200">حساس قياس المسافة Ultrasonic</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked readOnly className="accent-blue-500" />
                  <span className="text-slate-200">مستشعر الأشعة تحت الحمراء IR Line Follower</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={robotConfig.hasCamera}
                    onChange={(e) => setRobotConfig({ ...robotConfig, hasCamera: e.target.checked })}
                    className="accent-blue-500"
                  />
                  <span className="text-slate-200">كاميرا الذكاء الاصطناعي للرؤية الحاسوبية</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2D Arena Simulation Stage */}
        <div className="lg:col-span-8 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[420px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2 mb-3">
            <span>حلبة السباق والاختبار الميداني (Robot Testing Track)</span>
            <span className="text-emerald-400 font-bold">هدف الحلبة: تفادي العقبة الحمراء والوصول للنهاية</span>
          </div>

          {/* Virtual Arena Canvas */}
          <div className="relative flex-1 bg-slate-900 rounded-xl border-2 border-dashed border-slate-800 overflow-hidden min-h-[300px]">
            {/* Track Line */}
            <div className="absolute top-1/2 right-0 left-0 h-2 bg-blue-500/20 -translate-y-1/2" />

            {/* Obstacle Box */}
            <div className="absolute top-[100px] left-[180px] w-12 h-16 bg-red-600/80 border-2 border-red-400 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-600/30">
              عقبة 🧱
            </div>

            {/* Finish Line */}
            <div className="absolute top-10 bottom-10 right-8 w-10 bg-gradient-to-b from-emerald-500 via-amber-400 to-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-xs [writing-mode:vertical-lr]">
              FINISH 🏁
            </div>

            {/* Simulated Physical Robot */}
            <motion.div
              animate={{
                x: robotPos.x,
                y: robotPos.y,
                rotate: robotPos.rotation
              }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute left-4 top-10 p-3 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-xl shadow-blue-500/40 border-2 border-white/20 flex items-center gap-1.5 text-white"
            >
              <Bot className="w-8 h-8 text-white" />
              <div className="text-[10px] font-bold">
                <div>Robot-01</div>
                <div className="text-amber-300 font-mono">OK</div>
              </div>
            </motion.div>
          </div>

          {/* Mission Result Toast */}
          {missionPassed && (
            <div className="mt-3 p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> اجتاز الروبوت التحدي وتفادَى العقبة بنجاح!
              </span>
              <span className="text-amber-400 font-black flex items-center gap-1">
                <Award className="w-4 h-4" /> +200 XP
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
