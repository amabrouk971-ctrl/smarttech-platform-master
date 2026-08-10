import React, { useState } from 'react';
import { Sparkles, Camera, Cpu, CheckCircle2, RefreshCw, Award, Image, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface AiKidsLabProps {
  onAwardXp?: (amount: number) => void;
}

export const AiKidsLab: React.FC<AiKidsLabProps> = ({ onAwardXp }) => {
  const [samples, setSamples] = useState<{ openHand: number; fist: number }>({
    openHand: 4,
    fist: 5
  });

  const [isTraining, setIsTraining] = useState(false);
  const [epochProgress, setEpochProgress] = useState(0);
  const [modelTrained, setModelTrained] = useState(false);
  const [activeTest, setActiveTest] = useState<'openHand' | 'fist'>('openHand');

  // AI Prompt Art Generator State
  const [promptInput, setPromptInput] = useState('روبوت ذكي يلعب كرة القدم في المستقبل');
  const [generatedArtUrl, setGeneratedArtUrl] = useState<string | null>(null);
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);

  const handleCaptureSample = (type: 'openHand' | 'fist') => {
    setSamples((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const handleTrainModel = () => {
    setIsTraining(true);
    setEpochProgress(0);
    setModelTrained(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setEpochProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsTraining(false);
        setModelTrained(true);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        if (onAwardXp) onAwardXp(180);
      }
    }, 200);
  };

  const handleGenerateArt = () => {
    if (!promptInput.trim()) return;
    setIsGeneratingArt(true);
    setGeneratedArtUrl(null);

    setTimeout(() => {
      setIsGeneratingArt(false);
      setGeneratedArtUrl(
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
      );
    }, 1500);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl dir-rtl text-right">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-red-500" /> SmartTech AI Creator & Vision Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            درب نموذج الذكاء الاصطناعي الخاص بك على إيماءات اليد واكتشف كيف يفكر الحاسوب!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 1: Data Collection */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              1
            </span>
            <span>جمع عينات البيانات (Data Collection)</span>
          </div>

          <div className="space-y-3">
            {/* Open Hand Class */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Class A: اليد المفتوحة ✋</span>
                <span className="text-[11px] text-slate-400">{samples.openHand} عينات ملتقطة</span>
              </div>
              <button
                onClick={() => handleCaptureSample('openHand')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" /> التقاط
              </button>
            </div>

            {/* Fist Class */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Class B: قبضة اليد ✊</span>
                <span className="text-[11px] text-slate-400">{samples.fist} عينات ملتقطة</span>
              </div>
              <button
                onClick={() => handleCaptureSample('fist')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" /> التقاط
              </button>
            </div>
          </div>

          <button
            onClick={handleTrainModel}
            disabled={isTraining}
            className="w-full py-3 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Cpu className="w-5 h-5" /> تدريب نموذج الـ AI الآن (Train AI)
          </button>
        </div>

        {/* Step 2: Training & Testing */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                2
              </span>
              <span>تدريب واختبار النموذج (Model Training & Testing)</span>
            </div>

            {/* Epoch Training Progress */}
            {isTraining && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>جاري تدريب الشبكة العصبية (Neural Network Epochs)...</span>
                  <span className="text-amber-400">{epochProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-amber-400 h-full transition-all duration-200"
                    style={{ width: `${epochProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Model Test Panel */}
            {modelTrained && (
              <div className="space-y-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-emerald-400 block">
                  ✓ تم تدريب النموذج بنجاح! اختر عينة لاختبار دقة التصنيف:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTest('openHand')}
                    className={`p-2 rounded-lg text-xs font-bold border transition ${
                      activeTest === 'openHand'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    اختبار ✋ يد مفتوحة
                  </button>

                  <button
                    onClick={() => setActiveTest('fist')}
                    className={`p-2 rounded-lg text-xs font-bold border transition ${
                      activeTest === 'fist'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    اختبار ✊ قبضة يد
                  </button>
                </div>

                {/* Prediction Bar */}
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>نتيجة النماذج (Prediction Confidence):</span>
                    <span className="text-emerald-400">98.4%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div className="bg-emerald-500 h-full rounded-full w-[98.4%]" />
                  </div>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    التصنيف المتوقع: {activeTest === 'openHand' ? 'Class A (اليد المفتوحة)' : 'Class B (قبضة اليد)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {modelTrained && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> نموذج AI عملي مكتمل!
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Award className="w-4 h-4" /> +180 XP
              </span>
            </div>
          )}
        </div>

        {/* Step 3: Prompt Engineering & Generative AI Art Studio */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                3
              </span>
              <span>مختبر توليد الصور بـ AI Prompt</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">اكتب وصف الصورة (Prompt):</label>
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="صف الصورة التي تريد توليدها..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                onClick={handleGenerateArt}
                disabled={isGeneratingArt}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wand2 className="w-4 h-4" /> توليد الفن بالذكاء الاصطناعي ✨
              </button>
            </div>

            {/* Preview Box */}
            <div className="mt-3 h-32 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
              {isGeneratingArt ? (
                <div className="text-xs text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" /> جاري رسم اللوحة بالـ AI...
                </div>
              ) : generatedArtUrl ? (
                <img src={generatedArtUrl} alt="AI Art" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-500">سوف تظهر اللوحة المولدة هنا</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
