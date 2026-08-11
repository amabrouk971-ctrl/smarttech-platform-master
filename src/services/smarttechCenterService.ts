import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { MAIN_WEBSITE_URL, APP_PLATFORM_URL } from './domainService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SmartTechCenterProfile {
  id: string;
  centerNameAr: string;
  centerNameEn: string;
  officialNameAr: string;
  officialNameEn: string;
  shortNameAr: string;
  shortNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  longDescriptionAr: string;
  longDescriptionEn: string;
  foundedDate: string;
  yearsOfExperience: number;
  locationAr: string;
  locationEn: string;
  addressAr: string;
  addressEn: string;
  googleMapsUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  officialWebsiteUrl: string;
  appPlatformUrl: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    telegram?: string;
  };
  openingHoursAr: string;
  openingHoursEn: string;
  trainingRoomsCount: number;
  totalRoomCapacity: number;
  availableTechnologyAr: string;
  availableTechnologyEn: string;
  internetNetworkInfoAr: string;
  internetNetworkInfoEn: string;
  studentFacilitiesAr: string[];
  studentFacilitiesEn: string[];
  historyAr: string;
  historyEn: string;
  missionAr: string;
  missionEn: string;
  visionAr: string;
  visionEn: string;
  philosophyAr: string;
  philosophyEn: string;
  updatedAt: string;
  updatedBy: string;
}

export type FacilityCategory = 
  | 'TRAINING_ROOM'
  | 'COMPUTER_LAB'
  | 'INTERACTIVE_LAB'
  | 'ELECTRONICS_LAB'
  | 'AI_LAB'
  | 'ROBOTICS_LAB'
  | 'RECEPTION'
  | 'ADMIN'
  | 'STUDENT_AREA';

export interface SmartTechFacility {
  facilityId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: FacilityCategory;
  capacity: number;
  image: string;
  equipment: string[];
  features: string[];
  status: 'ACTIVE' | 'MAINTENANCE' | 'PLANNED';
  displayOrder: number;
  published: boolean;
  updatedAt?: string;
}

export type EquipmentCategory = 
  | 'COMPUTER'
  | 'LAPTOP'
  | 'PROJECTOR'
  | 'CAMERA'
  | 'ARDUINO'
  | 'RASPBERRY_PI'
  | 'ESP'
  | 'ROBOTICS'
  | 'ELECTRONICS'
  | 'NETWORKING'
  | 'PRINTER'
  | 'OTHER';

export interface SmartTechEquipment {
  id: string;
  nameAr: string;
  nameEn: string;
  category: EquipmentCategory;
  quantity: number;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  location: string;
  specifications: Record<string, string>;
  availableForStudents: boolean;
  published: boolean;
  updatedAt?: string;
}

export interface SmartTechService {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string;
  categoryAr: string;
  categoryEn: string;
  targetAudienceAr: string;
  targetAudienceEn: string;
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder: number;
  published: boolean;
}

export interface SmartTechStaffMember {
  id: string;
  nameAr: string;
  nameEn: string;
  photo: string;
  roleAr: string;
  roleEn: string;
  departmentAr: string;
  departmentEn: string;
  bioAr: string;
  bioEn: string;
  specializations: string[];
  experienceYears: number;
  assignedCourses: string[];
  socialLinks: Record<string, string>;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  published: boolean;
  isPublic: boolean;
}

export type MediaCategory = 
  | 'CENTER'
  | 'FACILITIES'
  | 'COURSES'
  | 'LEARNING_PATHS'
  | 'INSTRUCTORS'
  | 'STUDENTS'
  | 'PROJECTS'
  | 'ADS'
  | 'POSTS'
  | 'VIDEOS'
  | 'CERTIFICATES'
  | 'BRANDING'
  | 'OTHER';

export interface SmartTechMediaItem {
  id: string;
  title: string;
  category: MediaCategory;
  fileUrl: string;
  fileType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  sizeBytes?: number;
  dimensions?: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  createdBy: string;
}

export interface DataImportReport {
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  duplicateCount: number;
  invalidCount: number;
  errors: string[];
  details: { entity: string; status: 'IMPORTED' | 'UPDATED' | 'SKIPPED' | 'FAILED'; message: string }[];
}

// ============================================================================
// INITIAL REAL DEFAULTS (SOURCE OF TRUTH)
// ============================================================================

export const DEFAULT_CENTER_PROFILE: SmartTechCenterProfile = {
  id: 'official_center_profile',
  centerNameAr: 'مركز سمارتك للتكنولوجيا والتدريب المتقدم',
  centerNameEn: 'SmartTech Advanced Technology & Training Center',
  officialNameAr: 'مؤسسة سمارتك الأكاديمية للاستشارات والتدريب التكنولوجي',
  officialNameEn: 'SmartTech Academy for Technology Training & Consulting',
  shortNameAr: 'سمارتك',
  shortNameEn: 'SmartTech',
  descriptionAr: 'المركز الرائد في برامج التدريب البرمجي، الذكاء الاصطناعي، الروبوتات والأنظمة المدمجة بأساليب تطبيقية حديئة.',
  descriptionEn: 'Leading training center specializing in full-stack coding, AI algorithms, robotics, and embedded systems.',
  longDescriptionAr: 'تعتبر أجيال سمارتك المرجع التقني الأول المجهز بأحدث المختبرات الذكية، أجهزة الكمبيوتر عالية الأداء، وأطقم الروبوتات والذكاء الاصطناعي للتأهيل العملي والمهني.',
  longDescriptionEn: 'SmartTech provides state-of-the-art interactive computer labs, AI robotics kits, and real-world project hubs empowering students and professionals.',
  foundedDate: '2018-01-15',
  yearsOfExperience: 8,
  locationAr: 'الفرع الرئيسي - مجمع التكنولوجيا والابتكار',
  locationEn: 'Main Branch - Tech & Innovation Hub',
  addressAr: 'شارع التكنولوجيا الرئيسي، البرج الأكاديمي - الدور الثالث',
  addressEn: 'Main Technology Street, Academic Tower - 3rd Floor',
  googleMapsUrl: 'https://maps.google.com/?q=SmartTech+Academy',
  phone: '+20 100 000 0000',
  whatsapp: '+20 100 000 0000',
  email: 'info@smart-courses.org',
  officialWebsiteUrl: MAIN_WEBSITE_URL,
  appPlatformUrl: APP_PLATFORM_URL,
  socialMedia: {
    facebook: 'https://facebook.com/smarttech.academy',
    instagram: 'https://instagram.com/smarttech.academy',
    youtube: 'https://youtube.com/smarttechacademy',
    linkedin: 'https://linkedin.com/company/smarttech-academy',
    telegram: 'https://t.me/smarttech_academy'
  },
  openingHoursAr: 'السبت - الخميس: 9:00 صباحاً - 9:00 مساءً',
  openingHoursEn: 'Saturday - Thursday: 9:00 AM - 9:00 PM',
  trainingRoomsCount: 6,
  totalRoomCapacity: 120,
  availableTechnologyAr: 'أجهزة كمبيوتر Intel i7/i9، شبكات ألياف ضوئية فائقة السرعة، شاشات تفاعلية 4K، وحدات Arduino & Raspberry Pi v4/v5',
  availableTechnologyEn: 'High-performance Intel i7/i9 Workstations, Gigabit Fiber Network, 4K Interactive Touch Display Screens, Arduino & Raspberry Pi v4/v5 Ecosystems',
  internetNetworkInfoAr: 'شبكة ألياف ضوئية فائقة السرعة مع اتصال احتياطي مزدوج وخوادم محليّة مخصصة للتجارب.',
  internetNetworkInfoEn: 'Redundant High-Speed Fiber Optic Dedicated Line with local lab deployment servers.',
  studentFacilitiesAr: [
    'مختبر حاسب آلي رئيسي معالجات عالية الأداء',
    'مختبر الروبوتات والإنترنت الأشياء (IoT)',
    'استراحة طلاب مجهزة مع خدمة إنترنت لاسلكية',
    'قاعة اجتماعات وعروض مشاريع التخرج',
    'مكتبة رقمية ومراجع تدريبية مجانية'
  ],
  studentFacilitiesEn: [
    'Main Computer Lab with high-performance workstations',
    'Robotics & IoT Prototyping Workshop',
    'Student Lounge with High-Speed WiFi',
    'Presentation & Capstone Demo Hall',
    'Digital Resource Library & Free Docs'
  ],
  historyAr: 'تأسست سمارتك عام 2018 بهدف سد الفجوة بين التعليم الأكاديمي ومتطلبات سوق العمل التكنولوجي الحديث. نجحنا في تدريب وتخريج آلاف الطلاب والمهندسين.',
  historyEn: 'Established in 2018, SmartTech was created to bridge the gap between traditional tech education and practical market engineering demands.',
  missionAr: 'تمكين الشباب والأطفال والمهنيين من امتلاك المهارات البرمجية والذكاء الاصطناعي والتصنيع الرقمي لبناء حلول حقيقية.',
  missionEn: 'Empower kids, youth, and professionals with hands-on software development, AI, and digital prototyping mastery.',
  visionAr: 'أن نكون المنصة والأكاديمية الأولى والأكثر موثوقية في المنطقة لتعليم التكنولوجيا الحقيقية التطبيقية.',
  visionEn: 'To be the most trusted and advanced practical technology academy in the region.',
  philosophyAr: 'التعلم القائم على المشاريع التطبيقية الحقيقية (Project-Based Learning) بدلاً من التلقين النظري.',
  philosophyEn: '100% Hands-on Project-Based Learning rather than abstract passive lectures.',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

export const DEFAULT_FACILITIES: SmartTechFacility[] = [
  {
    facilityId: 'fac-main-lab',
    nameAr: 'مختبر البرمجة والذكاء الاصطناعي الرئيسي',
    nameEn: 'Main AI & Coding Computer Lab',
    descriptionAr: 'قاعة مجهزة بأحدث أجهزة الحاسوب المخصصة لتطوير البرمجيات، النماذج الذكية والشبكات.',
    descriptionEn: 'Equipped with high-spec workstation PCs for software development, AI model training, and web apps.',
    category: 'COMPUTER_LAB',
    capacity: 30,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    equipment: ['30 Workstation PCs (i7/32GB RAM)', '4K Interactive Display', 'Gigabit Switches'],
    features: ['High-Speed Fiber Internet', 'Ergonomic Chairs', 'Central AC'],
    status: 'ACTIVE',
    displayOrder: 1,
    published: true
  },
  {
    facilityId: 'fac-robotics-lab',
    nameAr: 'مختبر الروبوتات والإلكترونيات الذكية',
    nameEn: 'Robotics & Embedded Systems Lab',
    descriptionAr: 'قاعة التجميع والبرمجة الصلبة المجهزة بحقائب Arduino، Raspberry Pi، ومحطات اللحام القياسية.',
    descriptionEn: 'Hardware workspace with Arduino kits, Raspberry Pi 5, sensors, soldering stations, and motors.',
    category: 'ROBOTICS_LAB',
    capacity: 20,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    equipment: ['Arduino Mega/Uno Kits', 'Raspberry Pi 5 Units', 'Oscilloscopes', '3D Printers'],
    features: ['Safety Prototyping Benches', 'Components Storage', 'ESD Protection'],
    status: 'ACTIVE',
    displayOrder: 2,
    published: true
  },
  {
    facilityId: 'fac-kids-lab',
    nameAr: 'قاعة الابتكار والتكنولوجيا للأطفال',
    nameEn: 'Kids Tech & Innovation Interactive Room',
    descriptionAr: 'بيئة تفاعلية محفزة مخصصة لتعليم البرمجة الرسومية (Scratch) والروبوتات التعليمية للصغار.',
    descriptionEn: 'Interactive environment designed for kids scratch coding, EV3/Wedo robotics, and logic games.',
    category: 'INTERACTIVE_LAB',
    capacity: 25,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    equipment: ['25 Touchscreen Laptops', 'Lego Mindstorms Kits', 'Interactive Smartboard'],
    features: ['Child-friendly Design', 'Colorful Ergonomic Furniture', 'Safety Flooring'],
    status: 'ACTIVE',
    displayOrder: 3,
    published: true
  },
  {
    facilityId: 'fac-conference-hall',
    nameAr: 'قاعة المحاضرات والعروض الرئيسية',
    nameEn: 'Main Presentation & Capstone Hall',
    descriptionAr: 'مساحة مخصصة لعرض مشاريع الطلاب والتخرج واستضافة الندوات التقنية ورش العمل.',
    descriptionEn: 'Auditorium hall used for final capstone presentations, workshops, and tech seminars.',
    category: 'TRAINING_ROOM',
    capacity: 45,
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    equipment: ['High-Lumen HD Laser Projector', 'Surround Sound System', 'Wireless Microphones'],
    features: ['Tiered Seating', 'Live Streaming Rig', 'Stage Lighting'],
    status: 'ACTIVE',
    displayOrder: 4,
    published: true
  }
];

export const DEFAULT_EQUIPMENT: SmartTechEquipment[] = [
  {
    id: 'eq-pcs',
    nameAr: 'حواسيب مكتوبية عالية الأداء',
    nameEn: 'High-Performance Workstation PCs',
    category: 'COMPUTER',
    quantity: 65,
    descriptionAr: 'أجهزة حاسوب بمواصفات معالجات Intel i7/i9 وذاكرة 32GB مخصصة للبرمجة والذكاء الاصطناعي.',
    descriptionEn: 'Intel Core i7/i9 workstations with 32GB RAM & NVMe SSDs for heavy compilation & AI.',
    image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
    location: 'Main Computer Labs 1 & 2',
    specifications: { CPU: 'Intel Core i7 13th Gen', RAM: '32GB DDR5', Storage: '1TB NVMe SSD', Display: '27-inch IPS FHD' },
    availableForStudents: true,
    published: true
  },
  {
    id: 'eq-laptops',
    nameAr: 'أجهزة حاسوب محمولة تفاعلية',
    nameEn: 'Interactive Workstation Laptops',
    category: 'LAPTOP',
    quantity: 25,
    descriptionAr: 'لاب توب عالي الكفاءة مخصص للمختبرات التفاعلية والورش الخارجية.',
    descriptionEn: 'High performance portable laptops for mobile coding and robotics programming.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
    location: 'Kids Innovation Lab & Mobile Units',
    specifications: { CPU: 'Intel i5 12th Gen', RAM: '16GB', Screen: '15.6" Touchscreen' },
    availableForStudents: true,
    published: true
  },
  {
    id: 'eq-projectors',
    nameAr: 'أجهزة العرض والشاشات الذكية',
    nameEn: '4K Interactive Laser Projectors & Smartboards',
    category: 'PROJECTOR',
    quantity: 8,
    descriptionAr: 'شاشات عريضة تفاعلية فائقة الوضوح لتقديم الشرح البرمجي والتوضيحي الهندسي.',
    descriptionEn: 'Ultra HD interactive touch projectors deployed in all training rooms.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
    location: 'All Training Rooms',
    specifications: { Resolution: '4K UHD', Lumens: '4500 ANSI', Touch: 'Multi-Point Stylus' },
    availableForStudents: false,
    published: true
  },
  {
    id: 'eq-arduino-kits',
    nameAr: 'حقائب Arduino و ESP32 للإلكترونيات',
    nameEn: 'Arduino & ESP32 Prototyping Kits',
    category: 'ARDUINO',
    quantity: 40,
    descriptionAr: 'حقائب متكاملة تحتوي على متحكمات دقيقة، حساسات حرارة ومسافة، ومحركات خطوية.',
    descriptionEn: 'Full prototyping suites containing microcontrollers, sensors, OLEDs, and motors.',
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
    location: 'Robotics & Hardware Lab',
    specifications: { Chips: 'ATmega328P, ESP32 WROOM', Sensors: 'Ultrasonic, DHT22, IR, Gyro' },
    availableForStudents: true,
    published: true
  },
  {
    id: 'eq-raspberry-pi',
    nameAr: 'وحدات Raspberry Pi 4/5',
    nameEn: 'Raspberry Pi 4 & 5 Single Board Computers',
    category: 'RASPBERRY_PI',
    quantity: 30,
    descriptionAr: 'كمبيوترات صغيرة الحجم لتطبيقات الذكاء الاصطناعي على الحافة (Edge AI) وإنترنت الأشياء.',
    descriptionEn: 'Single board Linux computers for edge computing, computer vision, and IoT servers.',
    image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=800&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
    location: 'IoT & Advanced AI Lab',
    specifications: { Model: 'Raspberry Pi 5', RAM: '8GB DDR4', OS: 'Raspbian / Ubuntu IoT' },
    availableForStudents: true,
    published: true
  }
];

export const DEFAULT_SERVICES: SmartTechService[] = [
  {
    id: 'srv-coding',
    titleAr: 'الدورات والمسارات البرمجية الشاملة',
    titleEn: 'Full-Stack Software Engineering Programs',
    descriptionAr: 'تعليم تطوير المواقع، التطبيقات، وقواعد البيانات باستخدام أفضل تقنيات مثل React, Node.js, Python, Flutter.',
    descriptionEn: 'Hands-on full-stack development, mobile apps, backend APIs, and database engineering.',
    iconName: 'Code',
    categoryAr: 'برمجة وتطوير',
    categoryEn: 'Software Engineering',
    targetAudienceAr: 'الشباب والخريجون',
    targetAudienceEn: 'Youth & Graduates',
    status: 'ACTIVE',
    displayOrder: 1,
    published: true
  },
  {
    id: 'srv-ai-robotics',
    titleAr: 'دبلومات الذكاء الاصطناعي والروبوتات',
    titleEn: 'Artificial Intelligence & Robotics Diplomas',
    descriptionAr: 'برامج عملية لبناء نماذج تعلم الآلة، الرؤية الحاسوبية، وتصميم الروبوتات المادية برمجياً.',
    descriptionEn: 'Practical machine learning models, computer vision, OpenCV, ROS, and physical robotics builds.',
    iconName: 'Bot',
    categoryAr: 'ذكاء اصطناعي',
    categoryEn: 'AI & Robotics',
    targetAudienceAr: 'المهندسون والمهتمون بالتكنولوجيا',
    targetAudienceEn: 'Engineers & Tech Enthusiasts',
    status: 'ACTIVE',
    displayOrder: 2,
    published: true
  },
  {
    id: 'srv-kids',
    titleAr: 'أكاديمية التكنولوجيا المتقدمة للأطفال واليافعين',
    titleEn: 'SmartTech Kids & Youth Academy',
    descriptionAr: 'مناهج برمجية تفاعلية مصممة لسن 6 إلى 16 سنة لتعليم منطق البرمجة والروبوتات والذكاء الاصطناعي.',
    descriptionEn: 'Gamified coding, robotics, and STEM logic tailored for ages 6 to 16.',
    iconName: 'Sparkles',
    categoryAr: 'تعليم الأطفال',
    categoryEn: 'Kids Tech',
    targetAudienceAr: 'الأطفال واليافعون (6-16 سنة)',
    targetAudienceEn: 'Kids & Teens (6-16 Yrs)',
    status: 'ACTIVE',
    displayOrder: 3,
    published: true
  },
  {
    id: 'srv-testing-cert',
    titleAr: 'مراكز الاختبارات والشهادات المعتمدة',
    titleEn: 'Certified Examination & Verification Services',
    descriptionAr: 'تقديم اختبارات التقييم الدوري والشهادات الموثقة عبر نظام التحقق الرقمي المباشر بالـ QR Code.',
    descriptionEn: 'Official assessment exams and verifiable certificate issuance with live QR code lookup.',
    iconName: 'Award',
    categoryAr: 'اختبارات وشهادات',
    categoryEn: 'Testing & Certification',
    targetAudienceAr: 'جميع الطلاب والمهنيين',
    targetAudienceEn: 'All Students & Professionals',
    status: 'ACTIVE',
    displayOrder: 4,
    published: true
  }
];

export const DEFAULT_STAFF: SmartTechStaffMember[] = [
  {
    id: 'staff-lead-eng',
    nameAr: 'م. أحمد مبروك',
    nameEn: 'Eng. Ahmed Mabrouk',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    roleAr: 'المؤسس ومدير التطوير الأكاديمي',
    roleEn: 'Founder & Head of Academic Engineering',
    departmentAr: 'الإدارة العليا والهندسة',
    departmentEn: 'Executive Board & Engineering',
    bioAr: 'مهندس برمجيات وخبير ذكاء اصطناعي له خبرة تزيد عن 10 سنوات في تصميم المناهج وإدارة البرامج التكنولوجية.',
    bioEn: 'Senior software architect & AI Specialist with 10+ years driving tech curricula & innovation.',
    specializations: ['Full-Stack Systems', 'AI & Machine Learning', 'Educational Architecture'],
    experienceYears: 10,
    assignedCourses: ['Python for AI', 'Full-Stack Architecture'],
    socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
    status: 'ACTIVE',
    published: true,
    isPublic: true
  },
  {
    id: 'staff-robotics-head',
    nameAr: 'م. سارة محمود',
    nameEn: 'Eng. Sarah Mahmoud',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    roleAr: 'رئيس قسم الروبوتات والأنظمة المدمجة',
    roleEn: 'Lead Robotics & Embedded Systems Instructor',
    departmentAr: 'قسم الروبوتات والإنترنت الأشياء',
    departmentEn: 'Robotics & IoT Department',
    bioAr: 'تخصصت في تصميم الروبوتات الصناعية وأنظمة IoT مع نشر أبحاث في التحكم الآلي والربط السحابي.',
    bioEn: 'Specialized in robotics design and IoT sensors with deep experience in ROS and embedded C++.',
    specializations: ['Arduino & ESP32', 'ROS Robotics', 'PCB Prototyping'],
    experienceYears: 7,
    assignedCourses: ['Robotics Fundamentals', 'IoT Smart Home Lab'],
    socialLinks: { linkedin: 'https://linkedin.com' },
    status: 'ACTIVE',
    published: true,
    isPublic: true
  }
];

// ============================================================================
// FIRESTORE SERVICES
// ============================================================================

const COLLECTION_CENTER_PROFILE = 'smarttech_center_profile';
const COLLECTION_FACILITIES = 'smarttech_facilities';
const COLLECTION_EQUIPMENT = 'smarttech_equipment';
const COLLECTION_SERVICES = 'smarttech_services';
const COLLECTION_STAFF = 'smarttech_staff';
const COLLECTION_MEDIA = 'smarttech_media_library';

/**
 * Get Official Center Profile
 */
export async function getSmartTechCenterProfile(): Promise<SmartTechCenterProfile> {
  try {
    const docRef = doc(db, COLLECTION_CENTER_PROFILE, 'official_center_profile');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as SmartTechCenterProfile;
    }
  } catch (err) {
    console.warn('Firestore fetch failed for center profile, using default:', err);
  }
  return DEFAULT_CENTER_PROFILE;
}

/**
 * Save Official Center Profile
 */
export async function saveSmartTechCenterProfile(profile: SmartTechCenterProfile, adminEmail: string): Promise<void> {
  const docRef = doc(db, COLLECTION_CENTER_PROFILE, 'official_center_profile');
  const payload = {
    ...profile,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail
  };
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Get All Facilities
 */
export async function getSmartTechFacilities(): Promise<SmartTechFacility[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_FACILITIES));
    if (!snap.empty) {
      const list: SmartTechFacility[] = [];
      snap.forEach(d => list.push({ facilityId: d.id, ...d.data() } as SmartTechFacility));
      return list.sort((a, b) => a.displayOrder - b.displayOrder);
    }
  } catch (err) {
    console.warn('Firestore fetch failed for facilities, using default:', err);
  }
  return DEFAULT_FACILITIES;
}

/**
 * Save Facility
 */
export async function saveSmartTechFacility(fac: SmartTechFacility): Promise<void> {
  const docRef = doc(db, COLLECTION_FACILITIES, fac.facilityId);
  await setDoc(docRef, { ...fac, updatedAt: new Date().toISOString() }, { merge: true });
}

/**
 * Delete Facility
 */
export async function deleteSmartTechFacility(facilityId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_FACILITIES, facilityId));
}

/**
 * Get All Equipment
 */
export async function getSmartTechEquipment(): Promise<SmartTechEquipment[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_EQUIPMENT));
    if (!snap.empty) {
      const list: SmartTechEquipment[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as SmartTechEquipment));
      return list;
    }
  } catch (err) {
    console.warn('Firestore fetch failed for equipment, using default:', err);
  }
  return DEFAULT_EQUIPMENT;
}

/**
 * Save Equipment
 */
export async function saveSmartTechEquipment(eq: SmartTechEquipment): Promise<void> {
  const docRef = doc(db, COLLECTION_EQUIPMENT, eq.id);
  await setDoc(docRef, { ...eq, updatedAt: new Date().toISOString() }, { merge: true });
}

/**
 * Delete Equipment
 */
export async function deleteSmartTechEquipment(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_EQUIPMENT, id));
}

/**
 * Calculate dynamic computer & device count from database equipment records
 */
export async function getDynamicComputerCount(): Promise<{ totalComputers: number; totalDevices: number }> {
  const equipment = await getSmartTechEquipment();
  let totalComputers = 0;
  let totalDevices = 0;

  equipment.forEach(e => {
    totalDevices += e.quantity || 0;
    if (e.category === 'COMPUTER' || e.category === 'LAPTOP') {
      totalComputers += e.quantity || 0;
    }
  });

  return { totalComputers, totalDevices };
}

/**
 * Get Services
 */
export async function getSmartTechServices(): Promise<SmartTechService[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_SERVICES));
    if (!snap.empty) {
      const list: SmartTechService[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as SmartTechService));
      return list.sort((a, b) => a.displayOrder - b.displayOrder);
    }
  } catch (err) {
    console.warn('Firestore fetch failed for services, using default:', err);
  }
  return DEFAULT_SERVICES;
}

/**
 * Save Service
 */
export async function saveSmartTechService(srv: SmartTechService): Promise<void> {
  const docRef = doc(db, COLLECTION_SERVICES, srv.id);
  await setDoc(docRef, srv, { merge: true });
}

/**
 * Delete Service
 */
export async function deleteSmartTechService(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_SERVICES, id));
}

/**
 * Get Staff Members (Filters public staff for public website)
 */
export async function getSmartTechStaff(publicOnly: boolean = false): Promise<SmartTechStaffMember[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_STAFF));
    if (!snap.empty) {
      const list: SmartTechStaffMember[] = [];
      snap.forEach(d => {
        const data = d.data() as SmartTechStaffMember;
        if (!publicOnly || (data.published && data.isPublic)) {
          list.push({ id: d.id, ...data });
        }
      });
      return list;
    }
  } catch (err) {
    console.warn('Firestore fetch failed for staff, using default:', err);
  }
  return publicOnly ? DEFAULT_STAFF.filter(s => s.published && s.isPublic) : DEFAULT_STAFF;
}

/**
 * Save Staff Member
 */
export async function saveSmartTechStaffMember(staff: SmartTechStaffMember): Promise<void> {
  const docRef = doc(db, COLLECTION_STAFF, staff.id);
  await setDoc(docRef, staff, { merge: true });
}

/**
 * Delete Staff Member
 */
export async function deleteSmartTechStaffMember(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_STAFF, id));
}

/**
 * Get Centralized Media Library Items
 */
export async function getSmartTechMediaLibrary(categoryFilter?: MediaCategory): Promise<SmartTechMediaItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_MEDIA));
    if (!snap.empty) {
      const list: SmartTechMediaItem[] = [];
      snap.forEach(d => {
        const item = { id: d.id, ...d.data() } as SmartTechMediaItem;
        if (!categoryFilter || item.category === categoryFilter) {
          list.push(item);
        }
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (err) {
    console.warn('Firestore fetch failed for media library:', err);
  }
  return [];
}

/**
 * Save Media Item
 */
export async function saveSmartTechMediaItem(media: SmartTechMediaItem): Promise<void> {
  const docRef = doc(db, COLLECTION_MEDIA, media.id);
  await setDoc(docRef, media, { merge: true });
}

/**
 * Delete Media Item
 */
export async function deleteSmartTechMediaItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_MEDIA, id));
}

// ============================================================================
// DATA IMPORT & MIGRATION WORKFLOW ENGINE
// ============================================================================

export async function processDataMigrationImport(
  targetEntity: 'FACILITIES' | 'EQUIPMENT' | 'SERVICES' | 'STAFF' | 'COURSES' | 'MEDIA',
  jsonDataArray: any[],
  adminEmail: string
): Promise<DataImportReport> {
  const report: DataImportReport = {
    importedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    duplicateCount: 0,
    invalidCount: 0,
    errors: [],
    details: []
  };

  if (!Array.isArray(jsonDataArray) || jsonDataArray.length === 0) {
    report.errors.push('Invalid or empty data array provided.');
    return report;
  }

  for (let idx = 0; idx < jsonDataArray.length; idx++) {
    const item = jsonDataArray[idx];
    const rowNum = idx + 1;

    try {
      if (targetEntity === 'FACILITIES') {
        const facId = item.facilityId || item.id || `fac_imp_${Date.now()}_${idx}`;
        if (!item.nameAr && !item.nameEn) {
          report.invalidCount++;
          report.details.push({ entity: `Row ${rowNum}`, status: 'FAILED', message: 'Missing facility name' });
          continue;
        }

        const facility: SmartTechFacility = {
          facilityId: facId,
          nameAr: item.nameAr || item.name || 'مرفق جديد',
          nameEn: item.nameEn || item.name || 'New Facility',
          descriptionAr: item.descriptionAr || item.description || '',
          descriptionEn: item.descriptionEn || item.description || '',
          category: item.category || 'TRAINING_ROOM',
          capacity: parseInt(item.capacity) || 20,
          image: item.image || item.imageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
          equipment: Array.isArray(item.equipment) ? item.equipment : (item.equipment ? String(item.equipment).split(',') : []),
          features: Array.isArray(item.features) ? item.features : (item.features ? String(item.features).split(',') : []),
          status: item.status || 'ACTIVE',
          displayOrder: parseInt(item.displayOrder) || rowNum,
          published: item.published !== false
        };

        await saveSmartTechFacility(facility);
        report.importedCount++;
        report.details.push({ entity: facility.nameAr, status: 'IMPORTED', message: `Imported facility ${facId}` });

      } else if (targetEntity === 'EQUIPMENT') {
        const eqId = item.id || `eq_imp_${Date.now()}_${idx}`;
        if (!item.nameAr && !item.nameEn) {
          report.invalidCount++;
          report.details.push({ entity: `Row ${rowNum}`, status: 'FAILED', message: 'Missing equipment name' });
          continue;
        }

        const equipment: SmartTechEquipment = {
          id: eqId,
          nameAr: item.nameAr || item.name || 'جهاز جديد',
          nameEn: item.nameEn || item.name || 'New Equipment',
          category: item.category || 'COMPUTER',
          quantity: parseInt(item.quantity) || 1,
          descriptionAr: item.descriptionAr || item.description || '',
          descriptionEn: item.descriptionEn || item.description || '',
          image: item.image || 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&auto=format&fit=crop&q=80',
          status: item.status || 'AVAILABLE',
          location: item.location || 'Main Branch',
          specifications: typeof item.specifications === 'object' ? item.specifications : {},
          availableForStudents: item.availableForStudents !== false,
          published: item.published !== false
        };

        await saveSmartTechEquipment(equipment);
        report.importedCount++;
        report.details.push({ entity: equipment.nameAr, status: 'IMPORTED', message: `Imported equipment ${eqId}` });

      } else if (targetEntity === 'SERVICES') {
        const srvId = item.id || `srv_imp_${Date.now()}_${idx}`;
        const service: SmartTechService = {
          id: srvId,
          titleAr: item.titleAr || item.title || 'خدمة جديدة',
          titleEn: item.titleEn || item.title || 'New Service',
          descriptionAr: item.descriptionAr || item.description || '',
          descriptionEn: item.descriptionEn || item.description || '',
          iconName: item.iconName || 'Sparkles',
          categoryAr: item.categoryAr || 'عام',
          categoryEn: item.categoryEn || 'General',
          targetAudienceAr: item.targetAudienceAr || 'الجميع',
          targetAudienceEn: item.targetAudienceEn || 'Everyone',
          status: item.status || 'ACTIVE',
          displayOrder: parseInt(item.displayOrder) || rowNum,
          published: item.published !== false
        };

        await saveSmartTechService(service);
        report.importedCount++;
        report.details.push({ entity: service.titleAr, status: 'IMPORTED', message: `Imported service ${srvId}` });

      } else if (targetEntity === 'STAFF') {
        const staffId = item.id || `staff_imp_${Date.now()}_${idx}`;
        const staffMember: SmartTechStaffMember = {
          id: staffId,
          nameAr: item.nameAr || item.name || 'عضو طاقم',
          nameEn: item.nameEn || item.name || 'Staff Member',
          photo: item.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          roleAr: item.roleAr || item.role || 'مدرب',
          roleEn: item.roleEn || item.role || 'Instructor',
          departmentAr: item.departmentAr || 'التدريب',
          departmentEn: item.departmentEn || 'Training',
          bioAr: item.bioAr || item.bio || '',
          bioEn: item.bioEn || item.bio || '',
          specializations: Array.isArray(item.specializations) ? item.specializations : [],
          experienceYears: parseInt(item.experienceYears) || 3,
          assignedCourses: Array.isArray(item.assignedCourses) ? item.assignedCourses : [],
          socialLinks: typeof item.socialLinks === 'object' ? item.socialLinks : {},
          status: item.status || 'ACTIVE',
          published: item.published !== false,
          isPublic: item.isPublic !== false
        };

        await saveSmartTechStaffMember(staffMember);
        report.importedCount++;
        report.details.push({ entity: staffMember.nameAr, status: 'IMPORTED', message: `Imported staff member ${staffId}` });
      }
    } catch (err: any) {
      report.invalidCount++;
      report.errors.push(`Row ${rowNum} error: ${err.message}`);
      report.details.push({ entity: `Row ${rowNum}`, status: 'FAILED', message: err.message });
    }
  }

  return report;
}
