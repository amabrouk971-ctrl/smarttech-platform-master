import React from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles, ArrowRight, Volume2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SmartGuideConfig } from '../../services/homepageCMS';
import { User } from '../../types';

interface SmartGuideSectionProps {
  config: SmartGuideConfig;
  currentUser?: User | null;
  onLaunchDiscovery: () => void;
}

export const SmartGuideSection: React.FC<SmartGuideSectionProps> = ({ config, currentUser, onLaunchDiscovery }) => {
  const { isArabic } = useLanguage();

  if (!config.enabled) return null;

  // Dynamically source photo from the authenticated signed-in user's profile avatar
  const userAvatar = currentUser?.avatar || (currentUser as any)?.photoURL;
  const activePhoto = userAvatar || config.photoUrl;
  const activeName = currentUser ? (currentUser.displayName || currentUser.name) : (isArabic ? config.nameAr : config.nameEn);

  const handleSpeakGreeting = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = isArabic ? config.voiceTextAr : config.voiceTextEn;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isArabic ? 'ar-SA' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 relative bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-slate-100 dark:to-slate-900 border border-red-500/20 shadow-xl flex flex-col md:flex-row items-center gap-8">
          
          {/* Avatar / Photo - Dynamically associated with signed-in user profile photo */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-red-500 shadow-2xl relative">
              <img 
                src={activePhoto} 
                alt={activeName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
              <Bot className="w-4 h-4" />
            </div>
          </div>

          {/* Guide Text & Voice Controls */}
          <div className="flex-1 space-y-3 text-center md:text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isArabic ? 'الموجه الذكي والمرشد التعليمي' : 'Smart Guide & Educational Mentor'}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
              <span>{activeName}</span>
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </h3>

            <p className="text-slate-600 dark:text-slate-300 font-medium text-sm sm:text-base leading-relaxed">
              {isArabic ? config.introductionAr : config.introductionEn}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <button
                onClick={handleSpeakGreeting}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer"
                title={isArabic ? 'استمع للترحيب الصوتي' : 'Listen to Voice Greeting'}
              >
                <Volume2 className="w-4 h-4 text-red-500" />
                <span>{isArabic ? 'استمع للتوجيه الصوتي 🔊' : 'Voice Greeting 🔊'}</span>
              </button>

              <button
                onClick={onLaunchDiscovery}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer btn-micro"
              >
                <span>{isArabic ? config.ctaTextAr : config.ctaTextEn}</span>
                <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
