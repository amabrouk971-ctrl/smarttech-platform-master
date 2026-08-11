import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DiscoveryConfig, DiscoveryProfile, ChildProfileData, DiscoveryQuestion } from '../types';

export const DEFAULT_DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: 'q1-target-age',
    step: 1,
    titleAr: 'لمن نختار رحلة التعلم اليوم؟',
    titleEn: 'Who are we choosing a learning journey for?',
    subtitleAr: 'حدد المستفيد لنخصص الأنشطة والمستوى المناسب',
    subtitleEn: 'Select target learner to customize age and level',
    type: 'SINGLE',
    enabled: true,
    options: [
      {
        id: 'target-child',
        textAr: 'طفلي / ابني / ابنتي',
        textEn: 'My Child',
        iconName: 'User',
        value: 'MY_CHILD',
        descriptionAr: 'اختيار مسار تعليمي لطفل أو ناشئ',
        descriptionEn: 'Tailored paths for kids & teenagers'
      },
      {
        id: 'target-self',
        textAr: 'لنفسي (طالب / كبار)',
        textEn: 'Myself',
        iconName: 'GraduationCap',
        value: 'MYSELF',
        descriptionAr: 'تعلم البرمجة والذكاء الاصطناعي بنفسي',
        descriptionEn: 'Self-paced coding & AI learning'
      },
      {
        id: 'target-student',
        textAr: 'طالب آخر (قريب / إهداء)',
        textEn: 'Another Student',
        iconName: 'Users',
        value: 'ANOTHER_STUDENT',
        descriptionAr: 'هدية أو تسجيل لطالب آخر',
        descriptionEn: 'Register on behalf of a student'
      }
    ]
  },
  {
    id: 'q2-interests',
    step: 2,
    titleAr: 'ما هي أهم المجالات والاهتمامات المفضل لديكم؟',
    titleEn: 'What is the learner most interested in?',
    subtitleAr: 'يمكنك اختيار أكثر من مجال واهتمام (Multi-Select)',
    subtitleEn: 'Select one or multiple interests',
    type: 'MULTIPLE',
    enabled: true,
    options: [
      {
        id: 'int-prog',
        textAr: 'البرمجة والتكود',
        textEn: 'Programming',
        iconName: 'Code2',
        value: 'Programming',
        categoryTag: 'programming'
      },
      {
        id: 'int-ai',
        textAr: 'الذكاء الاصطناعي AI',
        textEn: 'Artificial Intelligence',
        iconName: 'Sparkles',
        value: 'Artificial Intelligence',
        categoryTag: 'ai'
      },
      {
        id: 'int-robotics',
        textAr: 'الروبوتات والأجهزة الذكية',
        textEn: 'Robotics',
        iconName: 'Bot',
        value: 'Robotics',
        categoryTag: 'robotics'
      },
      {
        id: 'int-electronics',
        textAr: 'الإلكترونيات و Arduino',
        textEn: 'Electronics',
        iconName: 'Cpu',
        value: 'Electronics',
        categoryTag: 'electronics'
      },
      {
        id: 'int-gamedev',
        textAr: 'تطوير وصناعة الألعاب',
        textEn: 'Game Development',
        iconName: 'Gamepad2',
        value: 'Game Development',
        categoryTag: 'gamedev'
      },
      {
        id: 'int-design',
        textAr: 'التصميم والرسم الرقمي',
        textEn: 'Creative Design',
        iconName: 'Palette',
        value: 'Creative Design',
        categoryTag: 'design'
      },
      {
        id: 'int-media',
        textAr: 'صناعة المحتوى والميديا',
        textEn: 'Video & Content Creation',
        iconName: 'Video',
        value: 'Video & Content Creation',
        categoryTag: 'media'
      },
      {
        id: 'int-business',
        textAr: 'ريادة الأعمال والتكنولوجيا',
        textEn: 'Business & Tech',
        iconName: 'Briefcase',
        value: 'Business',
        categoryTag: 'business'
      }
    ]
  },
  {
    id: 'q3-goals',
    step: 3,
    titleAr: 'ما الهدف الرئيسي المطلوب تحقيقه؟',
    titleEn: 'What would you like the learner to achieve?',
    subtitleAr: 'اختر الغاية والنتائج المرجوة لرحلة التعلم',
    subtitleEn: 'Choose desired outcomes & milestones',
    type: 'MULTIPLE',
    enabled: true,
    options: [
      {
        id: 'goal-basics',
        textAr: 'تعلم أساسيات الكمبيوتر والمنطق',
        textEn: 'Learn the basics',
        iconName: 'BookOpen',
        value: 'Learn the basics'
      },
      {
        id: 'goal-projects',
        textAr: 'بناء وتصميم مشاريع عملي حقيقية',
        textEn: 'Build projects',
        iconName: 'Rocket',
        value: 'Build projects'
      },
      {
        id: 'goal-programmer',
        textAr: 'الاحتراف كمبرمج صغير / مستقبل تكنولوجي',
        textEn: 'Become a programmer',
        iconName: 'Terminal',
        value: 'Become a programmer'
      },
      {
        id: 'goal-ai',
        textAr: 'استكشاف واستخدام الذكاء الاصطناعي',
        textEn: 'Learn AI',
        iconName: 'BrainCircuit',
        value: 'Learn AI'
      },
      {
        id: 'goal-robot',
        textAr: 'تجميع والتحكم بالروبوتات',
        textEn: 'Build robots',
        iconName: 'Zap',
        value: 'Build robots'
      },
      {
        id: 'goal-career',
        textAr: 'التأهيل للمسابقات ومسارات المستقبل',
        textEn: 'Prepare for future careers',
        iconName: 'Trophy',
        value: 'Prepare for future careers'
      }
    ]
  }
];

export const DEFAULT_DISCOVERY_CONFIG: DiscoveryConfig = {
  questions: DEFAULT_DISCOVERY_QUESTIONS,
  recommendationRules: {
    ageWeight: 40,
    interestWeight: 35,
    goalWeight: 20,
    availabilityBoost: 10
  },
  enabled: true
};

// Fetch dynamic configuration from Firestore or return fallback
export const getDiscoveryConfig = async (): Promise<DiscoveryConfig> => {
  try {
    const configDoc = await getDoc(doc(db, 'settings', 'discovery'));
    if (configDoc.exists()) {
      return configDoc.data() as DiscoveryConfig;
    }
  } catch (err) {
    console.warn('Failed to load discovery config from Firestore, using defaults:', err);
  }
  return DEFAULT_DISCOVERY_CONFIG;
};

// Admin save discovery config
export const saveDiscoveryConfig = async (config: DiscoveryConfig): Promise<void> => {
  try {
    await setDoc(doc(db, 'settings', 'discovery'), {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving discovery config:', err);
    throw err;
  }
};

// Save User Discovery Profile
export const saveUserDiscoveryProfile = async (userId: string, profile: DiscoveryProfile): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', userId), {
      discoveryProfile: {
        ...profile,
        updatedAt: new Date().toISOString()
      }
    }, { merge: true });
  } catch (err) {
    console.error('Failed to save user discovery profile:', err);
  }
};

// Save Child Profile (For Parent Users)
export const saveChildProfileInFirestore = async (userId: string, child: ChildProfileData): Promise<void> => {
  try {
    const childRef = doc(db, 'users', userId, 'children', child.id);
    await setDoc(childRef, {
      ...child,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Failed to save child profile in Firestore:', err);
  }
};

// Fetch Linked Children Profiles for Parent
export const fetchChildProfilesFromFirestore = async (userId: string): Promise<ChildProfileData[]> => {
  try {
    const colRef = collection(db, 'users', userId, 'children');
    const snap = await getDocs(colRef);
    const children: ChildProfileData[] = [];
    snap.forEach((doc) => children.push({ id: doc.id, ...doc.data() } as ChildProfileData));
    return children;
  } catch (err) {
    console.warn('Failed to fetch child profiles:', err);
    return [];
  }
};

// Delete Child Profile
export const deleteChildProfileInFirestore = async (userId: string, childId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'children', childId));
  } catch (err) {
    console.error('Error deleting child profile:', err);
  }
};

// Discovery Analytics logging
export const logDiscoveryAnalyticsEvent = async (
  eventType: 'discovery_started' | 'discovery_completed' | 'recommendation_viewed' | 'course_clicked' | 'path_clicked' | 'booking_started',
  data: Record<string, any>
): Promise<void> => {
  try {
    const analyticsCol = collection(db, 'discoveryAnalytics');
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    await addDoc(analyticsCol, {
      eventType,
      ...cleanData,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Discovery analytics logging failed:', err);
  }
};

// Fetch Analytics Summary for Admin
export const fetchDiscoveryAnalyticsFromFirestore = async (): Promise<any[]> => {
  try {
    const analyticsCol = collection(db, 'discoveryAnalytics');
    const snap = await getDocs(analyticsCol);
    const logs: any[] = [];
    snap.forEach((d) => logs.push({ id: d.id, ...d.data() }));
    return logs;
  } catch (err) {
    console.warn('Failed to fetch discovery analytics:', err);
    return [];
  }
};
