import {
  Home,
  BookOpen,
  Compass,
  Map,
  Cpu,
  Briefcase,
  Trophy,
  Gamepad2,
  Video,
  ShoppingBag,
  MapPin,
  Award,
  UserCheck
} from 'lucide-react';

export interface NavItemConfig {
  id: string;
  labelAr: string;
  labelEn: string;
  category?: 'primary' | 'learning' | 'labs' | 'community';
  iconName?: string;
  badgeAr?: string;
  badgeEn?: string;
}

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  { id: 'home', labelAr: 'الرئيسية', labelEn: 'Home', category: 'primary' },
  { id: 'courses', labelAr: 'الكورسات والأسعار', labelEn: 'Courses & Pricing', category: 'learning', badgeAr: 'الأكثر طلباً', badgeEn: 'Popular' },
  { id: 'paths', labelAr: 'المسارات التخصصية', labelEn: 'Learning Paths', category: 'learning' },
  { id: 'roadmap', labelAr: 'خارطة الطريق', labelEn: 'Roadmap', category: 'learning' },
  { id: 'labs', labelAr: 'المختبرات التفاعلية', labelEn: 'Interactive Labs', category: 'labs', badgeAr: 'تفاعلي AI', badgeEn: 'Interactive' },
  { id: 'projects', labelAr: 'معرض المشاريع', labelEn: 'Projects Gallery', category: 'labs' },
  { id: 'exams', labelAr: 'الامتحانات والتحديات', labelEn: 'Exams & Quizzes', category: 'labs' },
  { id: 'gamezone', labelAr: 'Game Zone', labelEn: 'Game Zone', category: 'labs', badgeAr: 'ألعاب XP', badgeEn: 'Fun' },
  { id: 'media', labelAr: 'الميديا والمنشورات', labelEn: 'Media & Posts', category: 'community' },
  { id: 'store', labelAr: 'المتجر والعروض', labelEn: 'Store & Offers', category: 'community', badgeAr: 'خصومات', badgeEn: 'Offers' },
  { id: 'branches', labelAr: 'الفروع والتواصل', labelEn: 'Branches & Contact', category: 'community' },
  { id: 'verify', labelAr: 'التحقق من الشهادات', labelEn: 'Certificates', category: 'community' }
];
