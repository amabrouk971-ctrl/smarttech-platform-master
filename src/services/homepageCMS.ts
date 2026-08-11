import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { APP_PLATFORM_URL, MAIN_WEBSITE_URL } from './domainService';

export interface EcosystemPlatform {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: string[];
  featuresEn: string[];
  url: string;
  imageUrl?: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'DRAFT';
  ctaTextAr: string;
  ctaTextEn: string;
  order: number;
}

export interface SmartGuideConfig {
  enabled: boolean;
  nameAr: string;
  nameEn: string;
  photoUrl: string;
  videoUrl?: string;
  voiceTextAr: string;
  voiceTextEn: string;
  introductionAr: string;
  introductionEn: string;
  ctaTextAr: string;
  ctaTextEn: string;
}

export interface HomepageSectionConfig {
  id: string;
  type: string;
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
  enabled: boolean;
  order: number;
}

export interface FoundationPathConfig {
  isFoundationEnabled: boolean;
  foundationPathId: string;
  badgeLabelAr: string;
  badgeLabelEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface DesignTokensConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkDefault: boolean;
}

export const DEFAULT_ECOSYSTEM_PLATFORMS: EcosystemPlatform[] = [
  {
    id: 'smarttech-official-platform',
    nameAr: 'المنصة الرسمية smart-courses.org',
    nameEn: 'Official smart-courses.org Platform',
    descriptionAr: 'منصتنا الرسمية المعتمدة للتعلم والتطوير الذكي، والتي يمكن تشغيلها وإدارتها بالكامل أونلاين عبر الإنترنت بسماعات رأس ذكية وتفاعل صوتي وبصري مباشر.',
    descriptionEn: 'Our official certified interactive platform which can be operated online directly for virtual learning, smart courses, and smart headset interactions.',
    featuresAr: ['تشغيل كامل للمنصة أونلاين عبر الإنترنت', 'سماعات رأس ذكية وتفاعل صوتي مباشر 🎧', 'إدارة المقررات والشهادات المعتمدة أونلاين'],
    featuresEn: ['100% Operated Online in Real-time', 'Smart Headsets & Interactive Audio 🎧', 'Online Course & Certificate Management'],
    url: MAIN_WEBSITE_URL,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    ctaTextAr: 'المنصة الرسمية smart-courses.org (تعمل أونلاين) 🎧',
    ctaTextEn: 'Official Platform smart-courses.org (Operated Online) 🎧',
    order: 1
  },
  {
    id: 'smarttech-accounting-platform',
    nameAr: 'منصة سمارتك للمحاسبة والأكاديميات المالية',
    nameEn: 'Smart Academy Financial Accounting Platform',
    descriptionAr: 'النظام المحاسبي والمالي المعتمد للأكاديميات والمؤسسات التعليمية لمتابعة الإيرادات والمصروفات، اشتراكات الطلاب، والفواتير المالية.',
    descriptionEn: 'Comprehensive financial accounting platform for accounting academies & institutions to manage student fees, subscriptions, expenses & financial reports.',
    featuresAr: ['إدارة الفواتير واشتراكات الطلاب والرسوم 💼', 'تقارير الأرباح والميزانية والمحاسبة المالية 📊', 'متابعة الرسوم الدراسية وربط بوابات الدفع 💳'],
    featuresEn: ['Billing, Student Subscriptions & Fees 💼', 'Financial Accounting & Profit Reports 📊', 'Integrated Payment Gateways & Invoicing 💳'],
    url: APP_PLATFORM_URL,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=200&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    ctaTextAr: 'منصة المحاسبة والأكاديميات المالية 💼',
    ctaTextEn: 'Explore Financial Accounting Platform 💼',
    order: 2
  }
];

export const DEFAULT_SMART_GUIDE: SmartGuideConfig = {
  enabled: true,
  nameAr: 'م. أحمد مبروك (الموجه الذكي)',
  nameEn: 'Eng. Ahmed Mabrouk (Smart Guide)',
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  videoUrl: '',
  voiceTextAr: 'مرحباً بك في سمارتك! دعنا نكتشف المسار المخصص لبناء مهارات المستقبل.',
  voiceTextEn: 'Welcome to SmartTech! Let us guide you to the perfect learning path.',
  introductionAr: 'أهلاً بك في أكاديمية سمارتك. هدفي مساعدتك على اختيار أفضل مسار تعليمي يناسب عمرك واهتماماتك.',
  introductionEn: 'Welcome to SmartTech Academy. I am here to help you find the right path for your age and goals.',
  ctaTextAr: 'ابدأ التقييم التفاعلي الآن ⚡',
  ctaTextEn: 'Start Interactive Assessment ⚡'
};

export const DEFAULT_FOUNDATION_PATH_CONFIG: FoundationPathConfig = {
  isFoundationEnabled: true,
  foundationPathId: 'path-digital-employee',
  badgeLabelAr: 'النواة والأساس الموصى به 🌟',
  badgeLabelEn: 'Recommended Starting Point 🌟',
  descriptionAr: 'مسار "الموظف الرقمي" يوفر المهارات الأساسية للتعامل مع الأدوات الذكية وتطبيقات الحوسبة قبل التخصص.',
  descriptionEn: 'The "Digital Employee" path provides foundational digital skills before branching into specialized tracks.'
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { id: 'hero', type: 'HERO', titleAr: 'الواجهة الرئيسية', titleEn: 'Hero Section', enabled: true, order: 1 },
  { id: 'smart-guide', type: 'SMART_GUIDE', titleAr: 'الموجه الذكي', titleEn: 'Smart Guide', enabled: true, order: 2 },
  { id: 'learning-paths', type: 'LEARNING_PATHS', titleAr: 'مسارات التعلم', titleEn: 'Learning Paths', enabled: true, order: 3 },
  { id: 'ecosystem-platforms', type: 'ECOSYSTEM_PLATFORMS', titleAr: 'منصات منظومة سمارتك', titleEn: 'SmartTech Platforms', enabled: true, order: 4 },
  { id: 'interactive-guide', type: 'INTERACTIVE_GUIDE', titleAr: 'دليل الاستكشاف التفاعلي', titleEn: 'Interactive Guide', enabled: true, order: 5 },
  { id: 'recommended-courses', type: 'RECOMMENDED_COURSES', titleAr: 'الكورسات المقترحة', titleEn: 'Recommended Courses', enabled: true, order: 6 },
  { id: 'featured-videos', type: 'FEATURED_VIDEOS', titleAr: 'الفيديوهات المميزة', titleEn: 'Featured Videos', enabled: true, order: 7 },
  { id: 'projects-certificates', type: 'PROJECTS_CERTIFICATES', titleAr: 'المشاريع والشهادات', titleEn: 'Projects & Certificates', enabled: true, order: 8 }
];

export const fetchEcosystemPlatformsFromFirestore = async (): Promise<EcosystemPlatform[]> => {
  try {
    const snap = await getDocs(collection(db, 'ecosystem_platforms'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as EcosystemPlatform));
      return items.sort((a, b) => a.order - b.order);
    }
  } catch (err) {
    console.warn('Error loading ecosystem platforms from Firestore', err);
  }
  return DEFAULT_ECOSYSTEM_PLATFORMS;
};

export const saveEcosystemPlatformToFirestore = async (platform: EcosystemPlatform): Promise<void> => {
  const ref = doc(db, 'ecosystem_platforms', platform.id);
  await setDoc(ref, platform, { merge: true });
};

export const deleteEcosystemPlatformFromFirestore = async (id: string): Promise<void> => {
  await doc(db, 'ecosystem_platforms', id);
};

export const fetchSmartGuideConfigFromFirestore = async (): Promise<SmartGuideConfig> => {
  try {
    const ref = doc(db, 'settings', 'smartGuideConfig');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as SmartGuideConfig;
    }
  } catch (err) {
    console.warn('Error loading smart guide config', err);
  }
  return DEFAULT_SMART_GUIDE;
};

export const saveSmartGuideConfigToFirestore = async (config: SmartGuideConfig): Promise<void> => {
  const ref = doc(db, 'settings', 'smartGuideConfig');
  await setDoc(ref, config, { merge: true });
};

export const fetchFoundationPathConfigFromFirestore = async (): Promise<FoundationPathConfig> => {
  try {
    const ref = doc(db, 'settings', 'foundationPathConfig');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as FoundationPathConfig;
    }
  } catch (err) {
    console.warn('Error loading foundation path config', err);
  }
  return DEFAULT_FOUNDATION_PATH_CONFIG;
};

export const saveFoundationPathConfigToFirestore = async (config: FoundationPathConfig): Promise<void> => {
  const ref = doc(db, 'settings', 'foundationPathConfig');
  await setDoc(ref, config, { merge: true });
};

export const fetchHomepageSectionsFromFirestore = async (): Promise<HomepageSectionConfig[]> => {
  try {
    const ref = doc(db, 'settings', 'homepageSectionsConfig');
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.sections) {
      return snap.data().sections as HomepageSectionConfig[];
    }
  } catch (err) {
    console.warn('Error loading homepage sections config', err);
  }
  return DEFAULT_HOMEPAGE_SECTIONS;
};

export const saveHomepageSectionsToFirestore = async (sections: HomepageSectionConfig[]): Promise<void> => {
  const ref = doc(db, 'settings', 'homepageSectionsConfig');
  await setDoc(ref, { sections, updatedAt: new Date().toISOString() }, { merge: true });
};
