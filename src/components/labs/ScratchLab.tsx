import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Bot,
  Code2,
  Volume2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface ScratchLabProps {
  onAwardXp?: (amount: number) => void;
}

export const ScratchLab: React.FC<ScratchLabProps> = ({ onAwardXp }) => {
  // Preset block templates
  const availableBlocks = [
    { id: 'b1', cat: 'events', label: 'عند النقر على العلم الأخضر 🟢', type: 'event', color: 'bg-amber-500' },
    { id: 'b2', cat: 'motion', label: 'تحرك 10 خطوات للأمام 🏃‍♂️', type: 'motion', color: 'bg-blue-600' },
    { id: 'b3', cat: 'motion', label: 'استدر 90 درجة لليمين ↪️', type: 'motion', color: 'bg-blue-600' },
    { id: 'b4', cat: 'looks', label: 'قل "أهلاً بكم في سمارتك!" لمدة ثانيتين 💬', type: 'looks', color: 'bg-purple-600' },
    { id: 'b5', cat: 'sound', label: 'شغّل صوت التهنئة 🎉', type: 'sound', color: 'bg-pink-600' },
    { id: 'b6', cat: 'ai', label: 'التعرف على ابتسامة الوجه بـ AI 🤖', type: 'ai', color: 'bg-emerald-600' },
    { id: 'b7', cat: 'control', label: 'كرر 5 مرات [ Repeat Loop ] 🔄', type: 'control', color: 'bg-amber-600' }
  ];

  const [activeCodeScript, setActiveCodeScript] = useState<typeof availableBlocks>([
    availableBlocks[0],
    availableBlocks[1],
    availableBlocks[3]
  ]);

  const [spriteState, setSpriteState] = useState({
    posX: 0,
    posY: 0,
    rotation: 0,
    speechBubble: '',
    isPlaying: false
  });

  const [missionDone, setMissionDone] = useState(false);

  const addBlockToScript = (block: (typeof availableBlocks)[0]) => {
    setActiveCodeScript((prev) => [...prev, block]);
  };

  const removeBlock = (index: number) => {
    setActiveCodeScript((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRunCode = () => {
    setSpriteState((prev) => ({ ...prev, isPlaying: true, speechBubble: '' }));

    let currentX = 0;
    let currentRot = 0;

    activeCodeScript.forEach((block, idx) => {
      setTimeout(() => {
        if (block.cat === 'motion') {
          if (block.id === 'b2') currentX += 40;
          if (block.id === 'b3') currentRot += 90;
        } else if (block.cat === 'looks') {
          setSpriteState((prev) => ({ ...prev, speechBubble: 'أهلاً بكم في سمارتك! 🤖✨' }));
        } else if (block.cat === 'ai') {
          setSpriteState((prev) => ({ ...prev, speechBubble: 'تم التعرف على الوجه المبتسم بنجاح! 📸' }));
        }

        setSpriteState((prev) => ({
          ...prev,
          posX: currentX,
          rotation: currentRot
        }));

        if (idx === activeCodeScript.length - 1) {
          setTimeout(() => {
            setSpriteState((prev) => ({ ...prev, isPlaying: false }));
            setMissionDone(true);
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            if (onAwardXp) onAwardXp(100);
          }, 1000);
        }
      }, idx * 800);
    });
  };

  const handleReset = () => {
    setSpriteState({ posX: 0, posY: 0, rotation: 0, speechBubble: '', isPlaying: false });
    setMissionDone(false);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl dir-rtl text-right">
      {/* Lab Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Code2 className="w-7 h-7 text-amber-400" /> Scratch & Block Coding Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            اسحب الكتل البرمجية، ركب التسلسل المنطقي، وشغّل المحاكاة الحية للشخصية!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> إعادة ضبط
          </button>
          <button
            onClick={handleRunCode}
            disabled={spriteState.isPlaying}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" /> تشغيل الكود 🟢
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Palette */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            مكتبة الكتل البرمجية (اختر للإضافة):
          </h3>
          <div className="space-y-2">
            {availableBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => addBlockToScript(block)}
                className={`w-full text-right p-3 rounded-xl ${block.color} hover:opacity-90 text-white font-bold text-xs shadow transition flex items-center justify-between cursor-pointer`}
              >
                <span>{block.label}</span>
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded uppercase">
                  {block.cat}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Canvas Workspace */}
        <div className="lg:col-span-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col min-h-[360px]">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>مساحة تركيب الكود (Workspace):</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {activeCodeScript.length} كتل
            </span>
          </h3>

          <div className="flex-1 space-y-2 border-2 border-dashed border-slate-800 rounded-xl p-3 bg-slate-900/50 overflow-y-auto">
            {activeCodeScript.map((block, idx) => (
              <motion.div
                key={`${block.id}-${idx}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-xl ${block.color} text-white font-bold text-xs shadow flex items-center justify-between group cursor-pointer`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{block.label}</span>
                </div>
                <button
                  onClick={() => removeBlock(idx)}
                  className="text-white/60 hover:text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition"
                >
                  حذف ✕
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Sprite Preview Stage */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden min-h-[360px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
            <span>مسرح المحاكاة الحية (Stage)</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              جاهز
            </span>
          </div>

          {/* Interactive Mascot Canvas Stage */}
          <div className="relative flex-1 my-4 bg-gradient-to-b from-sky-950/40 via-slate-900 to-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden">
            {/* Speech Bubble */}
            {spriteState.speechBubble && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-6 bg-white text-slate-900 p-3 rounded-2xl rounded-bl-none text-xs font-black shadow-xl z-20"
              >
                {spriteState.speechBubble}
              </motion.div>
            )}

            {/* SmartBot Sprite Animation */}
            <motion.div
              animate={{
                x: spriteState.posX,
                rotate: spriteState.rotation
              }}
              transition={{ type: 'spring', stiffness: 120 }}
              className="relative p-4 bg-gradient-to-tr from-red-600 to-amber-500 rounded-3xl shadow-2xl shadow-red-500/40 border-2 border-white/20"
            >
              <Bot className="w-16 h-16 text-white" />
            </motion.div>
          </div>

          {/* Mission Success Toast */}
          {missionDone && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> تمت المهمة بنجاح!
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <Award className="w-4 h-4" /> +100 XP
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
