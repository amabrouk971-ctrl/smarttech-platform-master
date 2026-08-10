import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isArabic: boolean;
  dir: 'rtl' | 'ltr';
  t: (key: string, fallback?: string) => string;
  getLocalized: <T extends Record<string, any>>(item: T | null | undefined, field: string) => any;
}

const translations: Record<string, { ar: string; en: string }> = {
  // Navigation Links
  home: { ar: 'الرئيسية', en: 'Home' },
  roadmap: { ar: 'خارطة الطريق 🚀', en: 'Roadmap 🚀' },
  paths: { ar: 'المسارات', en: 'Learning Paths' },
  courses: { ar: 'الكورسات والأسعار', en: 'Courses & Pricing' },
  exams: { ar: 'الامتحانات والتحديات 📝', en: 'Exams & Quizzes 📝' },
  projects: { ar: 'مشاريعي 📁', en: 'My Projects 📁' },
  labs: { ar: 'المختبرات التفاعلية', en: 'Interactive Labs' },
  gamezone: { ar: 'Game Zone', en: 'Game Zone' },
  store: { ar: 'متجر سمارتك', en: 'Store' },
  branches: { ar: 'الفروع', en: 'Branches' },
  verify: { ar: 'التحقق من الشهادات', en: 'Certificates' },

  // Top Bar & Controls
  assessmentBtn: { ar: 'تحديد مستوى الطفل بـ AI', en: 'AI Skill Assessment' },
  customizeBtn: { ar: 'تعديل الشعار والألوان 🎨', en: 'Customize Site 🎨' },
  kidsMode: { ar: 'وضع الأطفال 🎮', en: 'Kids Mode 🎮' },
  adultMode: { ar: 'وضع الكبار 🎓', en: 'Adult Mode 🎓' },
  lightTheme: { ar: 'فاتح', en: 'Light' },
  darkTheme: { ar: 'داكن', en: 'Dark' },
  login: { ar: 'تسجيل الدخول', en: 'Sign In' },
  logout: { ar: 'تسجيل الخروج', en: 'Sign Out' },
  welcomeUser: { ar: 'أهلاً بك،', en: 'Welcome,' },
  previewMode: { ar: 'وضع المعاينة كزائر', en: 'Visitor Preview Mode' },
  exitPreview: { ar: 'الخروج من المعاينة', en: 'Exit Preview' },

  // Hero Section
  heroBadge: { ar: 'الهدف اليومي • أكاديمية سمارتك 2026', en: 'Daily Goal • SmartTech Academy 2026' },
  heroTitlePre: { ar: 'اكتشف موهبة طفلك وابنِ مستقبله مع', en: "Discover Your Child's Talent & Build Their Future with" },
  heroSubtitle: {
    ar: 'برمجة، ذكاء اصطناعي، روبوتات، إلكترونيات، STEM ومهارات المستقبل في تجربة تعليمية تفاعلية واحدة بالمحاكاة والتطبيق العملي.',
    en: 'Programming, Artificial Intelligence, Robotics, Electronics, STEM, and future skills in one interactive learning experience with simulation and hands-on practice.'
  },
  heroStartBtn: { ar: 'ابدأ رحلة التعلم الآن', en: 'Start Learning Journey' },
  heroExploreBtn: { ar: 'اكتشف المسارات التفاعلية', en: 'Explore Interactive Paths' },

  // Course Catalog & Cards
  allCourses: { ar: 'جميع الكورسات والدبلومات', en: 'All Courses & Diplomas' },
  filterCategory: { ar: 'المجال / الفئة', en: 'Category' },
  filterAge: { ar: 'تصفية حسب العمر', en: 'Filter by Age' },
  allAges: { ar: 'جميع الأعمار (6 - 60 سنة)', en: 'All Ages (6 - 60 years)' },
  ageKids: { ar: '6 - 12 سنة (براعم وأطفال)', en: '6 - 12 Years (Kids & Juniors)' },
  ageTeens: { ar: '12 - 16 سنة (ناشئين وتينز)', en: '12 - 16 Years (Teens)' },
  ageAdults: { ar: '16 سنة فما فوق (شباب وكبار)', en: '16+ Years (Adults & University)' },
  searchCoursesPlaceholder: { ar: 'ابحث عن كورس بالعنوان أو الكود أو المهارات...', en: 'Search courses by title, code, or skill...' },
  priceCurrency: { ar: 'ج.م', en: 'EGP' },
  durationWeeks: { ar: 'أسبوع', en: 'Weeks' },
  sessionsCount: { ar: 'سيشن', en: 'Sessions' },
  viewDetailsBtn: { ar: 'تفاصيل التفوق والتسجيل 🎯', en: 'Course Details & Booking 🎯' },
  enrolledStatus: { ar: 'مشترك بالقائمة 🌟', en: 'Enrolled in Course 🌟' },
  bookCourseNow: { ar: 'احجز وسجل الآن', en: 'Book & Register Now' },
  levelLabel: { ar: 'المستوى:', en: 'Level:' },
  ageRangeLabel: { ar: 'العمر المناسب:', en: 'Age Range:' },
  whatYouWillLearn: { ar: 'ماذا سيتعلم الطالب بالدورة:', en: 'What the student will learn:' },
  skillsAcquired: { ar: 'المهارات المكتسبة:', en: 'Skills Acquired:' },

  // Labs & Simulators
  liveSimulatorsTag: { ar: 'محاكاة تفاعلية حية', en: 'Live Interactive Simulators' },
  labsHeading: { ar: 'المختبرات التفاعلية المجانية بالمحاكاة', en: 'Free Interactive Simulation Labs' },
  openAllLabsBtn: { ar: 'فتح جميع المختبرات 🚀', en: 'Open All Labs 🚀' },
  scratchTitle: { ar: 'Scratch Visual Coding 🧩', en: 'Scratch Visual Coding 🧩' },
  arduinoTitle: { ar: 'Arduino Circuit Simulator ⚡', en: 'Arduino Circuit Simulator ⚡' },
  roboticsTitle: { ar: 'Virtual Robotics Arena 🤖', en: 'Virtual Robotics Arena 🤖' },
  aiLabTitle: { ar: 'AI Vision & Creator Lab 🧠', en: 'AI Vision & Creator Lab 🧠' },

  // Store & Branches
  storeHeading: { ar: 'متجر مكونات وحقائب سمارتك', en: 'SmartTech Hardware & Kits Store' },
  storeSubtitle: {
    ar: 'حقائب إلكترونيات وأردوينو وقطع روبوتات LEGO رسمية للمبتكرين والطلاب.',
    en: 'Official electronics kits, Arduino hardware, and LEGO robotics components for young innovators.'
  },
  inStockTag: { ar: 'متوفر بالمتجر 📦', en: 'In Stock 📦' },
  outOfStockTag: { ar: 'غير متوفر حالياً', en: 'Out of Stock' },
  orderViaWhatsapp: { ar: 'طلب شراء عبر الواتساب 📱', en: 'Order via WhatsApp 📱' },
  branchesHeading: { ar: 'فروع ومقرات سمارتك للتدريب', en: 'SmartTech Training Campuses & Branches' },
  workingHours: { ar: 'ساعات العمل:', en: 'Working Hours:' },
  address: { ar: 'العنوان:', en: 'Address:' },
  availableSeats: { ar: 'المقاعد المتاحة:', en: 'Seats Available:' },

  // Certificates
  certTitle: { ar: 'نظام التحقق من شهادات سمارتك المعتمدة', en: 'SmartTech Certificate Verification System' },
  enterCertPlaceholder: { ar: 'أدخل كود الشهادة (مثال: CERT-SMART-2026-8891)', en: 'Enter Certificate Code (e.g. CERT-SMART-2026-8891)' },
  verifyButton: { ar: 'التحقق من صحة الشهادة 🔍', en: 'Verify Certificate 🔍' },
  validCertificateMsg: { ar: 'شهادة معتمدة وصالحة رسمياً من أكاديمية سمارتك', en: 'Official Verified & Accredited Certificate from SmartTech Academy' },

  // Footer
  footerAboutTitle: { ar: 'مركز سمارتك للتدريب المتطور', en: 'SmartTech Advanced Training Center' },
  footerAboutText: {
    ar: 'مركز SmartTech التدريبي المعتمد لتعليم الأطفال والشباب علوم البرمجة، الروبوتات، والذكاء الاصطناعي.',
    en: 'Accredited SmartTech Training Center empowering youth & kids in Programming, Robotics, and Artificial Intelligence.'
  },
  footerContactTitle: { ar: 'التواصل المباشر والمقر:', en: 'Direct Contact & Campus:' },
  footerRights: { ar: '© 2026 SmartTech Training Center. جميع الحقوق محفوظة.', en: '© 2026 SmartTech Training Center. All rights reserved.' },
  
  // Dashboard & Admin
  syncAllCoursesBtn: { ar: 'رفع ومزامنة جميع الكورسات بـ Firestore ⚡', en: 'Sync All Courses to Firestore ⚡' },
  syncingCourses: { ar: 'جاري رفع الكورسات لـ Firestore...', en: 'Syncing courses with Firestore...' },
  myExams: { ar: 'الامتحانات والتحديات البرمجية', en: 'Exams & Coding Challenges' },
  myProjects: { ar: 'معرض مشاريع الطلاب المبتكرين', en: 'Student Projects Showcase' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('smarttech_lang') as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('smarttech_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (language === 'ar') {
      document.documentElement.classList.add('lang-ar');
      document.documentElement.classList.remove('lang-en');
    } else {
      document.documentElement.classList.add('lang-en');
      document.documentElement.classList.remove('lang-ar');
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const isArabic = language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const t = (key: string, fallback?: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].ar || fallback || key;
    }
    return fallback || key;
  };

  /**
   * getLocalized: safely retrieves bilingual properties from Firestore / Data objects
   * Example: getLocalized(course, 'title') -> course.titleEn if lang === 'en', else course.titleAr
   */
  const getLocalized = <T extends Record<string, any>>(item: T | null | undefined, field: string): any => {
    if (!item) return '';
    const fieldEn = field + 'En';
    const fieldAr = field + 'Ar';

    if (language === 'en') {
      if (item[fieldEn] !== undefined && item[fieldEn] !== null && item[fieldEn] !== '') {
        return item[fieldEn];
      }
      if (item[fieldAr] !== undefined && item[fieldAr] !== null) {
        return item[fieldAr];
      }
      return item[field] || '';
    } else {
      if (item[fieldAr] !== undefined && item[fieldAr] !== null && item[fieldAr] !== '') {
        return item[fieldAr];
      }
      if (item[fieldEn] !== undefined && item[fieldEn] !== null) {
        return item[fieldEn];
      }
      return item[field] || '';
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isArabic,
        dir,
        t,
        getLocalized
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
