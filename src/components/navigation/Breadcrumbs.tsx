import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface BreadcrumbItem {
  id: string;
  labelAr: string;
  labelEn: string;
}

interface BreadcrumbsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  additionalPath?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  activeTab,
  setActiveTab,
  additionalPath
}) => {
  const { isArabic } = useLanguage();

  if (activeTab === 'home') return null;

  const tabLabels: Record<string, { ar: string; en: string }> = {
    roadmap: { ar: 'خارطة الطريق التعليمية 🚀', en: 'Roadmap' },
    paths: { ar: 'المسارات التخصصية 🎯', en: 'Learning Paths' },
    courses: { ar: 'الكورسات والأسعار 📚', en: 'Courses & Pricing' },
    media: { ar: 'الميديا والمنشورات 🎬', en: 'Media & Posts' },
    exams: { ar: 'الامتحانات والتحديات 📝', en: 'Exams & Quizzes' },
    projects: { ar: 'معرض المشاريع 📁', en: 'My Projects' },
    labs: { ar: 'المختبرات التفاعلية 🧩', en: 'Interactive Labs' },
    gamezone: { ar: 'منطقة الألعاب Game Zone 🎮', en: 'Game Zone' },
    store: { ar: 'متجر الهدايا والعروض 🎁', en: 'Store & Offers' },
    branches: { ar: 'الفروع والتواصل 📍', en: 'Branches & Contact' },
    verify: { ar: 'التحقق من الشهادات 📜', en: 'Verify Certificate' },
    dashboard: { ar: 'لوحة التحكم 👤', en: 'Dashboard' }
  };

  const currentInfo = tabLabels[activeTab] || { ar: activeTab, en: activeTab };

  return (
    <div className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 py-2.5 px-4 sm:px-8 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 overflow-x-auto">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-1 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-red-600" />
          <span>{isArabic ? 'الرئيسية' : 'Home'}</span>
        </button>

        <ChevronLeft className={`w-3.5 h-3.5 text-slate-400 ${isArabic ? '' : 'rotate-180'}`} />

        <button
          onClick={() => setActiveTab(activeTab)}
          className={`font-extrabold ${!additionalPath ? 'text-red-600 dark:text-red-400' : 'hover:text-slate-900 dark:hover:text-white transition cursor-pointer'}`}
        >
          {isArabic ? currentInfo.ar : currentInfo.en}
        </button>

        {additionalPath && (
          <>
            <ChevronLeft className={`w-3.5 h-3.5 text-slate-400 ${isArabic ? '' : 'rotate-180'}`} />
            <span className="text-red-600 dark:text-red-400 font-extrabold">{additionalPath}</span>
          </>
        )}
      </div>
    </div>
  );
};
