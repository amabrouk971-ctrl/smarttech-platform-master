import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Navigation, X, Check, Compass, Play, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceNavigationWidgetProps {
  activeTab?: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth?: () => void;
}

export const VoiceNavigationWidget: React.FC<VoiceNavigationWidgetProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth
}) => {
  const { isArabic } = useLanguage();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastAction, setLastAction] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasSupport, setHasSupport] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSupport(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = isArabic ? 'ar-SA' : 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        processVoiceCommand(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Keep active or restart gracefully
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Could not initialize SpeechRecognition:', err);
      setHasSupport(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isArabic]);

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isArabic ? 'ar-SA' : 'en-US';
      
      // Select Arabic voice if available
      const voices = window.speechSynthesis.getVoices();
      if (isArabic) {
        const arVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arVoice) utterance.voice = arVoice;
      } else {
        const enVoice = voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = (rawText: string) => {
    if (!rawText) return;
    const text = rawText.toLowerCase().trim();

    // 1. Home / الرئيسية
    if (text.includes('رئيسية') || text.includes('الرئيسية') || text.includes('home') || text.includes('الرئيسيه')) {
      setActiveTab('home');
      const msg = isArabic ? 'تم الانتقال إلى الصفحة الرئيسية بنجاح' : 'Navigated to Home page';
      setLastAction(msg);
      speakResponse(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Courses / الكورسات
    if (text.includes('كورس') || text.includes('كورسات') || text.includes('دورات') || text.includes('دورة') || text.includes('courses') || text.includes('course')) {
      setActiveTab('courses');
      const msg = isArabic ? 'تم فتح صفحة الكورسات والدورات التدريبية' : 'Opened Courses catalog';
      setLastAction(msg);
      speakResponse(msg);
      return;
    }

    // 3. Learning Paths / المسارات
    if (text.includes('مسار') || text.includes('مسارات') || text.includes('خريطة') || text.includes('paths') || text.includes('path')) {
      setActiveTab('paths');
      const msg = isArabic ? 'تم الانتقال إلى مسارات التعلم المعتمدة' : 'Navigated to Learning Paths';
      setLastAction(msg);
      speakResponse(msg);
      return;
    }

    // 4. Videos / الفيديوهات
    if (text.includes('فيديو') || text.includes('فيديوهات') || text.includes('شاهد') || text.includes('شروحات') || text.includes('videos') || text.includes('video')) {
      setActiveTab('home');
      setTimeout(() => {
        const videoSec = document.getElementById('featured-videos-section') || document.querySelector('section.bg-slate-950');
        if (videoSec) {
          videoSec.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      const msg = isArabic ? 'جاري التمرير إلى فيديوهات الأكاديمية الرسمية' : 'Scrolling to official academy videos';
      setLastAction(msg);
      speakResponse(msg);
      return;
    }

    // 5. Accounting / المحاسبة
    if (text.includes('محاسبة') || text.includes('المحاسبة') || text.includes('مالية') || text.includes('accounting') || text.includes('financial')) {
      setActiveTab('home');
      setTimeout(() => {
        const ecoSec = document.getElementById('ecosystem-platforms-section');
        if (ecoSec) {
          ecoSec.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      const msg = isArabic ? 'تم الانتقال إلى منصة المحاسبة والأكاديميات المالية' : 'Navigated to Financial Accounting section';
      setLastAction(msg);
      speakResponse(msg);
      return;
    }

    // 6. Center / السنتر / المقر
    if (text.includes('سنتر') || text.includes('مقر') || text.includes('معامل') || text.includes('المركز') || text.includes('center')) {
      setActiveTab('smarttech_center');
      const msg = isArabic ? 'تم فتح تفاصيل السنتر والمقرات المعملية' : 'Opened SmartTech Center details';
      setLastAction(msg);
      speakResponse(msg);
      return;
    }

    // 7. Login / تسجيل الدخول
    if (text.includes('دخول') || text.includes('تسجيل') || text.includes('حسابي') || text.includes('login') || text.includes('sign in')) {
      if (onOpenAuth) onOpenAuth();
      const msg = isArabic ? 'جاري فتح نافذة تسجيل الدخول' : 'Opening login window';
      setLastAction(msg);
      speakResponse(msg);
      return;
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      speakResponse(isArabic ? 'تم إيقاف الملاحة الصوتية' : 'Voice navigation stopped');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setIsOpen(true);
        speakResponse(isArabic ? 'الملاحة الصوتية مفعلة. تحدث الآن بالنقر أو بأوامرك الصوتية.' : 'Voice navigation active. Speak your command now.');
      } catch (err) {
        console.warn('Start listening failed:', err);
      }
    }
  };

  return (
    <div className="fixed bottom-24 left-6 z-40 dir-rtl text-right">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-3 w-80 sm:w-96 bg-slate-900/95 border-2 border-red-500/40 backdrop-blur-xl rounded-3xl p-5 shadow-2xl text-white space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
                <span className="font-black text-xs text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'الملاحة بالأوامر الصوتية' : 'Voice Navigation System'}</span>
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                {isListening
                  ? (isArabic ? '🎙️ جاري الاستماع صوتياً... قل مثلاً: "الكورسات"، "الفيديوهات"، "الرئيسية"، "المحاسبة"، "تسجيل الدخول"' : '🎙️ Listening... Say e.g. "Courses", "Videos", "Home", "Accounting"')
                  : (isArabic ? 'اضغط على المايك لبدء التوجيه الصوتي والتنقل بدون لمس.' : 'Click mic to start voice navigation without touching.')}
              </p>

              {transcript && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">"{transcript}"</span>
                </div>
              )}

              {lastAction && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{lastAction}</span>
                </div>
              )}
            </div>

            {/* Quick Voice Command Buttons */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-extrabold text-slate-400 block mb-2">أوامر سريعة بنقرة أو صوت:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'الرئيسية 🏠', action: () => processVoiceCommand('الرئيسية') },
                  { label: 'الكورسات 📚', action: () => processVoiceCommand('الكورسات') },
                  { label: 'الفيديوهات 🎥', action: () => processVoiceCommand('فيديوهات') },
                  { label: 'المحاسبة 💼', action: () => processVoiceCommand('المحاسبة') }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-200 text-center cursor-pointer transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          if (!isOpen) setIsOpen(true);
          toggleListening();
        }}
        className={`px-4 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2.5 shadow-2xl transition-all cursor-pointer border ${
          isListening
            ? 'bg-red-600 text-white border-red-400 ring-4 ring-red-500/30 animate-pulse'
            : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700 shadow-slate-950/50'
        }`}
        title={isArabic ? 'تفعيل الملاحة بالصوت 🎙️' : 'Voice Navigation 🎙️'}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isListening ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>
          {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
        </div>
        <div className="text-right hidden sm:block">
          <span className="block text-[11px] font-black leading-tight">
            {isListening ? (isArabic ? 'الملاحة الصوتية تعمل 🔊' : 'Voice Nav Active 🔊') : (isArabic ? 'الملاحة بالأوامر الصوتية' : 'Voice Navigation')}
          </span>
          <span className="block text-[9px] text-slate-400 font-medium">
            {isListening ? (isArabic ? 'جاري الاستماع...' : 'Listening...') : (isArabic ? 'انقر لتفعيل المايك 🎙️' : 'Click to Speak 🎙️')}
          </span>
        </div>
      </button>
    </div>
  );
};
