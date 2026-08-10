import React, { useState, useMemo, useRef } from 'react';
import { Course, LearningPath, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Zap,
  Target,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  Clock,
  Layers,
  ArrowRight,
  Bot,
  Laptop,
  Gamepad2,
  Wrench,
  Palette,
  GraduationCap,
  Star,
  Flame,
  Check,
  Play,
  Share2,
  Info,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Compass
} from 'lucide-react';

interface LearningRoadmapProps {
  courses?: Course[];
  paths?: LearningPath[];
  currentUser?: User | null;
  onSelectCourse?: (course: Course) => void;
  onEnrollTrack?: (trackId: string) => void;
  activeTrackId?: string;
}

// ---------------------------------------------------------------------------
// TRACK DEFINITIONS WITH FOUNDATION HIGHLIGHTS (#1 & #2)
// ---------------------------------------------------------------------------

export interface RoadmapTrackStage {
  id: string;
  stageNumber: number;
  code: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  durationText: string;
  xpPoints: number;
  skills: string[];
  projectOutcomeAr: string;
  courseId?: string; // Maps to actual course in system
  icon: React.ElementType;
  gradient: string;
  prerequisitesAr?: string;
  softwareUsed?: string[];
}

export interface RoadmapTrack {
  id: string;
  titleAr: string;
  titleEn: string;
  isFoundationTrack: boolean; // Highlights 'AI Mastery' or 'Digital Employee'
  badgeTextAr: string;
  taglineAr: string;
  descriptionAr: string;
  targetAudienceAr: string;
  estimatedWeeks: number;
  totalXp: number;
  certificateTitleAr: string;
  icon: React.ElementType;
  accentColor: string; // Tailwind color string
  gradient: string;
  stages: RoadmapTrackStage[];
}

export const ROADMAP_TRACKS: RoadmapTrack[] = [
  {
    id: 'foundation-ai-mastery',
    titleAr: 'مسار خبير الذكاء الاصطناعي والتوليد (AI Mastery Track)',
    titleEn: 'AI Mastery & Automation Track',
    isFoundationTrack: true,
    badgeTextAr: '⭐ مسار تأسيسي رئيسي (Foundation Track)',
    taglineAr: 'من التأسيس في التوليد وPrompt Engineering إلى أتمتة الشركات وبناء AI Agents',
    descriptionAr: 'المسار التأسيسي الأقوى لبناء عقلية وممارسة الذكاء الاصطناعي. يناسب جميع التخصصات لمضاعفة الإنتاجية واحتراف أدوات الذكاء الاصطناعي التوليدي والأتمتة.',
    targetAudienceAr: 'الطلاب، الموظفون، أصحاب الشركات، والمهتمون بمهن المستقبل.',
    estimatedWeeks: 12,
    totalXp: 1200,
    certificateTitleAr: 'شهادة خبير تطبيقات وأتمتة الذكاء الاصطناعي المعتمد',
    icon: Bot,
    accentColor: 'violet',
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    stages: [
      {
        id: 'stage-ai-1',
        stageNumber: 1,
        code: 'AI-101',
        titleAr: 'أساسيات وتوليد الذكاء الاصطناعي (AI Mastery & Prompts)',
        titleEn: 'AI Fundamentals & Prompt Engineering',
        descriptionAr: 'التأسيس في مفاهيم AI، الهندسة المتقدمة للأوامر (Prompting)، توليد النصوص والتحليل الذكي مع ChatGPT, Claude, Gemini.',
        durationText: '3 أسابيع (12 ساعة)',
        xpPoints: 300,
        skills: ['Prompt Engineering', 'ChatGPT & Claude', 'AI Productivity', 'Content Generation'],
        projectOutcomeAr: 'المشروع الأول: بناء مكتبة أحدث أوامر Prompts مخصصة لمجال عملك أو دراستك',
        courseId: 'c-ai-mastery',
        icon: Sparkles,
        gradient: 'from-violet-500 to-purple-600',
        prerequisitesAr: 'لا تشترط خبرة برمجية سابقة',
        softwareUsed: ['ChatGPT', 'Claude 3.5', 'Google Gemini', 'Midjourney']
      },
      {
        id: 'stage-ai-2',
        stageNumber: 2,
        code: 'AI-201',
        titleAr: 'صناعة المحتوى والمونتاج وتوليد الفيديو (AI Media & Video)',
        titleEn: 'Generative Video & CapCut AI',
        descriptionAr: 'توليد الصور والشخصيات الافتراضية، المونتاج الذكي، وتحريك الفيديوهات بالذكاء الاصطناعي باستخدام CapCut Pro وأحدث أدوات الفيديو التوليدي.',
        durationText: '3 أسابيع (12 ساعة)',
        xpPoints: 300,
        skills: ['CapCut Pro AI', 'Generative Video', 'Avatar Creation', 'Social Media Reels'],
        projectOutcomeAr: 'المشروع الثاني: إنتاج فيديو تسويقي وإعلاني كامل بشخصيات وتعليق صوتي سينمائي بالـAI',
        courseId: 'c-capcut-ai',
        icon: Bot,
        gradient: 'from-purple-500 to-pink-600',
        prerequisitesAr: 'إكمال مرحلة AI-101',
        softwareUsed: ['CapCut Pro', 'ElevenLabs', 'Runway ML', 'HeyGen']
      },
      {
        id: 'stage-ai-3',
        stageNumber: 3,
        code: 'AI-301',
        titleAr: 'أتمتة مهام الشركات والربط الذكي (AI Automation & Workflows)',
        titleEn: 'Business Automation with Make & Zapier',
        descriptionAr: 'ربط الأنظمة والتطبيقات (Google Workspace, WhatsApp, CRM) بالذكاء الاصطناعي لأتمتة المهام الروتينية بدون كود.',
        durationText: '3 أسابيع (12 ساعة)',
        xpPoints: 300,
        skills: ['Make.com', 'Zapier', 'API Integration', 'Workflow Automation'],
        projectOutcomeAr: 'المشروع الثالث: بناء نظام أتمتة كامل يرد على العملاء ويسجل بياناتهم في الجداول تلقائيًا',
        courseId: 'c-ai-automation',
        icon: Zap,
        gradient: 'from-pink-500 to-indigo-600',
        prerequisitesAr: 'إكمال مرحلة AI-101',
        softwareUsed: ['Make.com', 'Zapier', 'Webhooks', 'OpenAI APIs']
      },
      {
        id: 'stage-ai-4',
        stageNumber: 4,
        code: 'AI-401',
        titleAr: 'تطوير وبناء المساعدين والوكلاء الذكيين (AI Agents & Python)',
        titleEn: 'Building Custom AI Agents with Python',
        descriptionAr: 'البرمجة بلغة بايثون لبناء مساعدين ذكيين (AI Agents) يعالجون المستندات والبيانات الضخمة ويجرون حوارات تفاعلية.',
        durationText: '3 أسابيع (12 ساعة)',
        xpPoints: 300,
        skills: ['Python AI', 'LangChain / LlamaIndex', 'RAG Search', 'Custom AI Agents'],
        projectOutcomeAr: 'المشروع النهائي: تطوير تطبيق مساعد ذكي مجيب عن أسئلة المؤسسة أو الكتب المرفوعة',
        courseId: 'c-ai-apps',
        icon: Target,
        gradient: 'from-indigo-600 to-blue-700',
        prerequisitesAr: 'إكمال المراحل السابقة + أساسيات البرمجة',
        softwareUsed: ['Python', 'VS Code', 'OpenAI SDK', 'Streamlit']
      }
    ]
  },
  {
    id: 'foundation-digital-employee',
    titleAr: 'مسار الموظف الرقمي والعمل الذكي (Digital Employee Track)',
    titleEn: 'Digital Employee & Office Professional',
    isFoundationTrack: true,
    badgeTextAr: '⭐ مسار تأسيسي رئيسي (Foundation Track)',
    taglineAr: 'التأسيس المتكامل من استخدام الكمبيوتر إلى تطبيقات Google السحابية وأدوات إنتاجية أوفيس والـAI',
    descriptionAr: 'المسار الأساسي لإعداد أي شخص لسوق العمل المكتبي والإداري الحديث. يضمن إتقان أساسيات الويندوز، أوفيس، أداوات Google السحابية والإنتاجية بذكاء.',
    targetAudienceAr: 'المبتدئون، الموظفون، الإداريون، والطلاب الراغبون في سرعة التأهيل الوظيفي.',
    estimatedWeeks: 10,
    totalXp: 1000,
    certificateTitleAr: 'شهادة الموظف الرقمي المعتمد في أنظمة العمل السحابي والذكاء الاصطناعي',
    icon: Laptop,
    accentColor: 'indigo',
    gradient: 'from-indigo-600 via-blue-600 to-cyan-700',
    stages: [
      {
        id: 'stage-de-1',
        stageNumber: 1,
        code: 'DE-101',
        titleAr: 'أساسيات الكمبيوتر والعمل الرقمي (Digital Workplace)',
        titleEn: 'Computer Fundamentals & Fast Typing',
        descriptionAr: 'إتقان الويندوز، إدارة الملفات السحابية، تنظيم سطح المكتب، إتيكيت البريد الإلكتروني، والكتابة السريعة على الكيبورد.',
        durationText: '2 أسابيع (8 ساعات)',
        xpPoints: 250,
        skills: ['Windows 11', 'File Management', 'Touch Typing', 'Email Protocol'],
        projectOutcomeAr: 'المشروع الأول: تجهيز بيئة العمل الرقمية الشاملة وتنظيم الأرشيف الإلكتروني',
        courseId: 'c-digital-emp',
        icon: Laptop,
        gradient: 'from-indigo-500 to-blue-600',
        prerequisitesAr: 'لا تشترط أي معرفة سابقة',
        softwareUsed: ['Windows 11', 'Outlook / Gmail', 'Typing Master']
      },
      {
        id: 'stage-de-2',
        stageNumber: 2,
        code: 'DE-201',
        titleAr: 'إدارة العمل السحابي بـ Google Workspace',
        titleEn: 'Google Workspace & Cloud Collaboration',
        descriptionAr: 'الاحتراف في Google Docs, Google Sheets, Google Forms, Google Drive والعمل الجماعي المباشر على المستندات.',
        durationText: '3 أسابيع (12 ساعة)',
        xpPoints: 250,
        skills: ['Google Sheets', 'Google Docs', 'Google Forms', 'Cloud Drive'],
        projectOutcomeAr: 'المشروع الثاني: بناء لوحة متابعة وجدول بيانات تفاعلي متصل بنموذج استبيان أونلاين',
        courseId: 'c-gsuite',
        icon: Layers,
        gradient: 'from-blue-500 to-cyan-600',
        prerequisitesAr: 'إكمال مرحلة DE-101',
        softwareUsed: ['Google Workspace', 'Google Sheets', 'Google Forms']
      },
      {
        id: 'stage-de-3',
        stageNumber: 3,
        code: 'DE-301',
        titleAr: 'مضاعفة الإنتاجية المكتبية بالذكاء الاصطناعي',
        titleEn: 'Office Productivity with AI Tools',
        descriptionAr: 'تسريع كتابة التقارير، تحليل جداول الإكسل المعقدة تلقائيًا، وإعداد العروض التقديمية الفعالة بمساعدة مساعدين ذكيين.',
        durationText: '2 أسابيع (8 ساعات)',
        xpPoints: 250,
        skills: ['Excel AI Formulas', 'AI Presentation Generation', 'Smart Summaries'],
        projectOutcomeAr: 'المشروع الثالث: إنشاء عرض تقديمي كامل وتحليل تقرير مالي بضغطة زر باستخدام AI',
        courseId: 'c-office-ai',
        icon: Sparkles,
        gradient: 'from-cyan-500 to-teal-600',
        prerequisitesAr: 'إكمال مراحل DE-101 و DE-201',
        softwareUsed: ['Copilot', 'Gamma App', 'ChatGPT for Excel']
      },
      {
        id: 'stage-de-4',
        stageNumber: 4,
        code: 'DE-401',
        titleAr: 'التخصص والتأهيل الوظيفي لسوق العمل',
        titleEn: 'Career Readiness & Specialized Track',
        descriptionAr: 'إعداد السيرة الذاتية الرقمية، بناء ملف الأعمال (Portfolio)، واختيار مسار التخصص (جرافيك، تسويق، أو أتمتة).',
        durationText: '3 أسابيع (12 ساعة)',
        xpPoints: 250,
        skills: ['CV Building', 'LinkedIn Profile', 'Digital Portfolio', 'Interview Prep'],
        projectOutcomeAr: 'المشروع النهائي: إطلاق ملف الأعمال الشخصي والتقدم للفرص الوظيفية الرقمية',
        courseId: 'c-digital-specialist',
        icon: GraduationCap,
        gradient: 'from-teal-600 to-emerald-700',
        prerequisitesAr: 'إكمال جميع مراحل المسار التأسيسي',
        softwareUsed: ['LinkedIn', 'Canva Portfolio', 'Google Sites']
      }
    ]
  },
  {
    id: 'track-junior-coder',
    titleAr: 'مسار المبرمج الصغير وصانع الألعاب (Young Game Coder)',
    titleEn: 'Junior Game Coder Track',
    isFoundationTrack: false,
    badgeTextAr: '🚀 مسار البرمجة للأطفال والناشئين',
    taglineAr: 'من المنطق البرمجي بالبلوكات المرئية إلى صناعة الألعاب ثنائية الأبعاد وتطبيقات الموبايل',
    descriptionAr: 'مسار ممتع يحول اهتمام الطفل بالشاشات إلى طاقة ابتكار حقيقية عبر بناء ألعاب حوارية وتطبيقات ذكية.',
    targetAudienceAr: 'الأطفال والناشئون من سن 6 إلى 14 سنة.',
    estimatedWeeks: 12,
    totalXp: 1200,
    certificateTitleAr: 'شهادة المبرمج الصغير وصانع الألعاب التفاعلية المعتمد',
    icon: Gamepad2,
    accentColor: 'cyan',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    stages: [
      {
        id: 'stage-jc-1',
        stageNumber: 1,
        code: 'COD-101',
        titleAr: 'أساسيات المنطق والكتل البرمجية (Scratch Basics)',
        titleEn: 'Scratch Logic & Characters',
        descriptionAr: 'برمجة الحركة، الأصوات، والتفاعل بين الشخصيات وصناعة قصص وألعاب بسيطة.',
        durationText: '3 أسابيع',
        xpPoints: 300,
        skills: ['Scratch Blocks', 'Loops & Conditions', 'Event Handling'],
        projectOutcomeAr: 'لعبة متاهة الألوان وتجميع الجواهر',
        courseId: 'c-scratch',
        icon: Gamepad2,
        gradient: 'from-cyan-500 to-blue-600'
      },
      {
        id: 'stage-jc-2',
        stageNumber: 2,
        code: 'COD-201',
        titleAr: 'صناعة الألعاب المتقدمة ودرجات السكور (2D Game Dev)',
        titleEn: 'Advanced 2D Games & Score Systems',
        descriptionAr: 'إضافة عداد النقاط، المستويات المتعددة، وفيزياء حركة الأجسام بالكتل البرمجية.',
        durationText: '3 أسابيع',
        xpPoints: 300,
        skills: ['Variables', 'Scoreboard', 'Game Physics'],
        projectOutcomeAr: 'لعبة حرب الفضاء وحساب النقاط التنافسية',
        courseId: 'c-scratch-adv',
        icon: Flame,
        gradient: 'from-blue-500 to-indigo-600'
      },
      {
        id: 'stage-jc-3',
        stageNumber: 3,
        code: 'COD-301',
        titleAr: 'تطوير تطبيقات الموبايل الحقيقية (MIT App Inventor)',
        titleEn: 'Mobile App Builder & Sensors',
        descriptionAr: 'تصميم واجهات الموبايل وبرمجة الحساسات والرؤية الحاسوبية لبناء تطبيقات حقيقية للأندرويد.',
        durationText: '3 أسابيع',
        xpPoints: 300,
        skills: ['App Inventor', 'Mobile UI', 'Camera & GPS'],
        projectOutcomeAr: 'تطبيق موبايل للتعرف على الوجوه وحماية الخصوصية',
        courseId: 'c-app-inventor',
        icon: SmartphoneIcon,
        gradient: 'from-indigo-500 to-purple-600'
      },
      {
        id: 'stage-jc-4',
        stageNumber: 4,
        code: 'COD-401',
        titleAr: 'الانتقال للبرمجة المكتوبة Python & AI',
        titleEn: 'Python Syntax & Simple AI',
        descriptionAr: 'الانتقال من البلوكات لكتابة أكواد بايثون الحقيقية والرسم بالأكواد Turtle Graphics.',
        durationText: '3 أسابيع',
        xpPoints: 300,
        skills: ['Python Syntax', 'Turtle Graphics', 'Logic Games'],
        projectOutcomeAr: 'مشروع لعبة الثعبان الرسمية المكتوبة بلغة Python',
        courseId: 'c-python-kids',
        icon: Target,
        gradient: 'from-purple-600 to-pink-600'
      }
    ]
  },
  {
    id: 'track-robotics-hardware',
    titleAr: 'مسار مهندس المستقبل والروبوتات (Robotics & IoT)',
    titleEn: 'Robotics & Hardware Engineering Track',
    isFoundationTrack: false,
    badgeTextAr: '🛠️ مسار الهندسة والإلكترونيات',
    taglineAr: 'بناء الأجهزة الفيزياء الملموسة من تركيب قطع LEGO إلى الأردوينو والإنترنت الذكي ESP32',
    descriptionAr: 'مسار تطبيقي عملي يناسب محبي الفك والتركيب والتجارب الهندسية الملموسة في معمل السنتر.',
    targetAudienceAr: 'الأطفال والشباب من سن 7 إلى 16 سنة.',
    estimatedWeeks: 12,
    totalXp: 1200,
    certificateTitleAr: 'شهادة مهندس الروبوتات والأنظمة المدمجة المعتمد',
    icon: Wrench,
    accentColor: 'amber',
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    stages: [
      {
        id: 'stage-rh-1',
        stageNumber: 1,
        code: 'ROB-101',
        titleAr: 'المهندس الصغير الميكانيكي (LEGO Robotics)',
        titleEn: 'LEGO Mechanical Robotics',
        descriptionAr: 'فهم التروس، المحركات، والرافعات الميكانيكية بتركيب الهياكل الفيزيائية.',
        durationText: '3 أسابيع',
        xpPoints: 300,
        skills: ['Mechanical Gears', 'LEGO WeDo', 'Motors Control'],
        projectOutcomeAr: 'بناء ذراع روبوتية ميكانيكية لرفع الأجسام',
        courseId: 'c-lego-wedo',
        icon: Wrench,
        gradient: 'from-amber-500 to-orange-600'
      },
      {
        id: 'stage-rh-2',
        stageNumber: 2,
        code: 'ROB-201',
        titleAr: 'مهندس الإلكترونيات والأردوينو (Arduino Circuits)',
        titleEn: 'Arduino Circuits & Electronic Components',
        descriptionAr: 'توصيل اللوحات، الدايودات، المقاومات، وكتابة الأكواد للتحكم بالإضاءات والمحركات.',
        durationText: '3 أسابيع',
        xpPoints: 300,
        skills: ['Arduino C++', 'Circuit Boards', 'Breadboard Wiring'],
        projectOutcomeAr: 'بناء نظام إشارات مرور ذكي مبرمج بالكامل',
        courseId: 'c-arduino-101',
        icon: Zap,
        gradient: 'from-orange-500 to-red-600'
      },
      {
        id: 'stage-rh-3',
        stageNumber: 3,
        code: 'ROB-301',
        titleAr: 'حلبة الروبوتات الذكية ذاتية القيادة (Autonomous Arena)',
        titleEn: 'Autonomous Line Follower & Obstacle Avoidance',
        descriptionAr: 'استخدام حساسات المسافة والألوان لتسيير سيارة روبوتية تتفادى العوائق وتتبع الخطوط.',
        durationText: '3 أسابيع',
        xpPoints: 300,
        skills: ['Ultrasonic Sensors', 'IR Line Sensors', 'Robotics Arena'],
        projectOutcomeAr: 'المشاركة بـ السيارة الروبوتية في المسابقة السنوية',
        courseId: 'c-robotics-arena',
        icon: ShieldCheck,
        gradient: 'from-red-600 to-rose-700'
      },
      {
        id: 'stage-rh-4',
        stageNumber: 4,
        code: 'ROB-401',
        titleAr: 'البيت الذكي وإنترنت الأشياء (Smart Home IoT ESP32)',
        titleEn: 'Smart Home & IoT with ESP32',
        descriptionAr: 'ربط الاختراعات والإنارات بالواي فاي والتحكم بها من خلال تطبيق الموبايل عن بعد.',
        durationText: '3 أسابيع',
        xpPoints: 300,
        skills: ['ESP32 WiFi', 'IoT Protocols', 'Smart Home Control'],
        projectOutcomeAr: 'نموذج مصغر لـ منزل ذكي متحكم به بالموبايل والإنترنت',
        courseId: 'c-esp32-iot',
        icon: Compass,
        gradient: 'from-rose-600 to-purple-700'
      }
    ]
  }
];

// Helper icon component
function SmartphoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

export const LearningRoadmap: React.FC<LearningRoadmapProps> = ({
  courses = [],
  paths = [],
  currentUser,
  onSelectCourse,
  onEnrollTrack,
  activeTrackId: initialActiveTrackId
}) => {
  // Selected track state (defaults to AI Mastery foundation track)
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    initialActiveTrackId || 'foundation-ai-mastery'
  );

  // View mode: Horizontal Flow vs Vertical Timeline
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal');

  // Selected stage modal state
  const [selectedStage, setSelectedStage] = useState<RoadmapTrackStage | null>(null);

  // User Progress simulation/real state
  const [completedStageIds, setCompletedStageIds] = useState<string[]>(() => {
    // If user has enrolled course IDs, map them or initialize defaults
    if (currentUser?.enrolledCourseIds && currentUser.enrolledCourseIds.length > 0) {
      return ['stage-ai-1', 'stage-de-1'];
    }
    return ['stage-ai-1']; // First stage completed by default for demo progress
  });

  // Active track object
  const activeTrack = useMemo(() => {
    return (
      ROADMAP_TRACKS.find((t) => t.id === selectedTrackId) || ROADMAP_TRACKS[0]
    );
  }, [selectedTrackId]);

  // Horizontal scroll ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Toggle stage completed status (for interactive simulation)
  const toggleStageCompletion = (stageId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCompletedStageIds((prev) => {
      if (prev.includes(stageId)) {
        return prev.filter((id) => id !== stageId);
      } else {
        return [...prev, stageId];
      }
    });
  };

  // Compute stats for current track
  const trackStats = useMemo(() => {
    const total = activeTrack.stages.length;
    const completed = activeTrack.stages.filter((s) => completedStageIds.includes(s.id)).length;
    const percent = Math.round((completed / total) * 100);
    const earnedXp = activeTrack.stages
      .filter((s) => completedStageIds.includes(s.id))
      .reduce((sum, s) => sum + s.xpPoints, 0);

    return {
      total,
      completed,
      percent,
      earnedXp
    };
  }, [activeTrack, completedStageIds]);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 dir-rtl text-right overflow-hidden relative border-t border-slate-900">
      {/* Background Lighting Elements */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">

        {/* ------------------------------------------------------------- */}
        {/* SECTION HEADER                                                 */}
        {/* ------------------------------------------------------------- */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-950/80 to-indigo-950/80 border border-violet-500/30 text-violet-300 font-black text-xs shadow-md mx-auto"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>خارطة طريق التعلم والتدرج المنهجي — Learning Roadmap</span>
          </motion.div>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            تدرج خطوة بخطوة نحو <span className="bg-gradient-to-r from-violet-400 via-amber-300 to-amber-200 bg-clip-text text-transparent">احتراف المستقبل</span> 🚀
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            مسارات دراسية تسلسلية موجهة بالنتائج والمشاريع العملية. اختر المسار التأسيسي للبدء، وتابع تقدمك وإنجازك خطوة بخطوة.
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TRACK SELECTION TABS WITH FOUNDATION HIGHLIGHTS (#1 & #2)      */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-amber-400 font-extrabold">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>المسارات التأسيسية والتخصصية المتاحة:</span>
            </span>
            <span className="hidden sm:inline-block">انقر على المسار لاستعراض الخريطة التسلسلية كاملة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ROADMAP_TRACKS.map((track) => {
              const Icon = track.icon;
              const isSelected = selectedTrackId === track.id;

              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`relative p-4 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between gap-3 overflow-hidden ${
                    isSelected
                      ? `bg-slate-900 border-${track.accentColor}-500 shadow-xl shadow-${track.accentColor}-900/20 ring-2 ring-${track.accentColor}-500`
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  {/* Highlight Ribbon for Foundation Tracks (#1 & #2) */}
                  {track.isFoundationTrack && (
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-br-xl shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>مسار تأسيسي</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mt-2">
                    <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-${track.accentColor}-400 shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-[11px] font-extrabold text-slate-400 block">
                        {track.estimatedWeeks} أسابيع
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        +{track.totalXp} XP
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-white leading-snug">
                      {track.titleAr}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {track.taglineAr}
                    </p>
                  </div>

                  {isSelected && (
                    <motion.div
                      layoutId="activeTrackBar"
                      className={`h-1.5 w-full bg-gradient-to-r ${track.gradient} rounded-full mt-1`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ACTIVE TRACK BANNER & USER PROGRESS HIGHLIGHT CARD (#3)       */}
        {/* ------------------------------------------------------------- */}
        <div className={`rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
            
            {/* Track Info */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-extrabold text-xs flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{activeTrack.badgeTextAr}</span>
                </span>
                <span className="text-xs text-slate-400 font-bold bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  {activeTrack.estimatedWeeks} أسابيع دراسية • 4 مراحل موجهة
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {activeTrack.titleAr}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeTrack.descriptionAr}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 font-bold pt-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <GraduationCap className="w-4 h-4 text-violet-400" />
                  <span>الجمهور المستهدف: {activeTrack.targetAudienceAr}</span>
                </span>
              </div>
            </div>

            {/* Track Progress Dashboard Component */}
            <div className="lg:w-80 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-inner space-y-4 shrink-0">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>تقدمك في هذا المسار:</span>
                </span>
                <span className="text-amber-400 font-black text-sm">
                  {trackStats.percent}% مكتمل
                </span>
              </div>

              {/* Glowing Progress Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${trackStats.percent}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full bg-gradient-to-r ${activeTrack.gradient} shadow-lg shadow-amber-500/20`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">المراحل المكتملة</span>
                  <span className="text-sm font-black text-emerald-400">
                    {trackStats.completed} / {trackStats.total}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">النقاط المكتسبة</span>
                  <span className="text-sm font-black text-amber-400">
                    +{trackStats.earnedXp} XP
                  </span>
                </div>
              </div>

              {/* Certificate Award Preview Banner */}
              <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs flex items-center gap-2.5">
                <Award className="w-6 h-6 text-amber-400 shrink-0" />
                <div className="leading-tight">
                  <span className="text-[10px] font-extrabold text-violet-300 block">عند إكمال الـ 4 مراحل:</span>
                  <span className="text-white font-extrabold text-[11px] line-clamp-1">{activeTrack.certificateTitleAr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar: Horizontal vs Vertical View + Left/Right Nav */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">طريقة عرض الخريطة:</span>
              <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setViewMode('horizontal')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'horizontal'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>أفقي تصفحي (Horizontal)</span>
                </button>
                <button
                  onClick={() => setViewMode('vertical')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'vertical'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>رأسي تسلسلي (Vertical)</span>
                </button>
              </div>
            </div>

            {viewMode === 'horizontal' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                  اسحب أفقيًا على الموبايل أو استخدم الأسهم:
                </span>
                <button
                  onClick={scrollRight}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition cursor-pointer"
                  title="السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollLeft}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition cursor-pointer"
                  title="التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* HORIZONTAL SCROLLING SEQUENCE VIEW (#4)                       */}
          {/* ------------------------------------------------------------- */}
          {viewMode === 'horizontal' ? (
            <div className="relative pt-6">
              {/* Connected Line Wire background running through nodes */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-6 hidden md:block pointer-events-none z-0" />

              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-violet-500/30 scrollbar-track-slate-900 relative z-10"
              >
                {activeTrack.stages.map((stage, idx) => {
                  const isCompleted = completedStageIds.includes(stage.id);
                  const isCurrent = !isCompleted && (idx === 0 || completedStageIds.includes(activeTrack.stages[idx - 1].id));
                  const isLocked = !isCompleted && !isCurrent;
                  const Icon = stage.icon;

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      onClick={() => setSelectedStage(stage)}
                      className={`min-w-[280px] sm:min-w-[330px] max-w-[340px] snap-center shrink-0 rounded-2xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                        isCompleted
                          ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40 shadow-lg shadow-emerald-900/10 hover:border-emerald-400'
                          : isCurrent
                          ? 'bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-950 border-amber-500/80 shadow-xl shadow-amber-900/20 ring-2 ring-amber-500/50 hover:border-amber-400'
                          : 'bg-slate-950/90 border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700'
                      }`}
                    >
                      {/* Step Badge & Status Pill */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full font-black text-xs border ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : isCurrent
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          المرحلة {stage.stageNumber < 10 ? `0${stage.stageNumber}` : stage.stageNumber}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isCompleted && (
                            <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>مكتملة ✓</span>
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                              <span>المرحلة الحالية</span>
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-[11px] font-black text-slate-500 flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                              <span>مغلقة 🔒</span>
                            </span>
                          )}

                          {/* Interactive Toggle for Demo Testing */}
                          <button
                            onClick={(e) => toggleStageCompletion(stage.id, e)}
                            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
                            title={isCompleted ? "تعليم كغير مكتملة" : "تعليم كمكتملة"}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Header Code & Title */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl bg-gradient-to-r ${stage.gradient} text-white shadow-md`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                            {stage.code}
                          </span>
                        </div>

                        <h4 className="font-black text-base text-white leading-snug">
                          {stage.titleAr}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {stage.descriptionAr}
                        </p>
                      </div>

                      {/* Duration & XP */}
                      <div className="flex items-center justify-between text-xs text-slate-400 font-bold py-2 border-y border-slate-800/80">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{stage.durationText}</span>
                        </span>
                        <span className="text-amber-400 font-extrabold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          +{stage.xpPoints} XP
                        </span>
                      </div>

                      {/* Project Outcome Box */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-snug">
                        <span className="font-extrabold text-amber-300 block mb-1">🎯 مشروع المرحلة:</span>
                        <span>{stage.projectOutcomeAr}</span>
                      </div>

                      {/* Skills learned badges */}
                      <div className="flex flex-wrap gap-1">
                        {stage.skills.slice(0, 3).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {stage.skills.length > 3 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-500">
                            +{stage.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* CTA Button */}
                      <div className="pt-2">
                        {isCompleted ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStage(stage);
                            }}
                            className="w-full py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>عرض الإنجاز والمشروع ✓</span>
                          </button>
                        ) : isCurrent ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectCourse) {
                                // Find course if available
                                const c = courses.find((crs) => crs.id === stage.courseId);
                                if (c) onSelectCourse(c);
                                else setSelectedStage(stage);
                              } else {
                                setSelectedStage(stage);
                              }
                            }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-white font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-4 h-4 text-slate-950 fill-slate-950" />
                            <span>بدء هذه المرحلة الآن ⚡</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStage(stage);
                            }}
                            className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span>استكشاف المنهج 🔒</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ------------------------------------------------------------- */
            /* VERTICAL TIMELINE VIEW                                        */
            /* ------------------------------------------------------------- */
            <div className="pt-6 max-w-3xl mx-auto space-y-6 relative">
              <div className="absolute top-4 bottom-4 right-6 w-1 bg-slate-800 rounded-full" />

              {activeTrack.stages.map((stage, idx) => {
                const isCompleted = completedStageIds.includes(stage.id);
                const isCurrent = !isCompleted && (idx === 0 || completedStageIds.includes(activeTrack.stages[idx - 1].id));
                const Icon = stage.icon;

                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    onClick={() => setSelectedStage(stage)}
                    className={`relative pr-14 pl-6 py-5 rounded-2xl border transition cursor-pointer ${
                      isCompleted
                        ? 'bg-slate-900/90 border-emerald-500/40'
                        : isCurrent
                        ? 'bg-slate-900 border-amber-500 ring-1 ring-amber-500/50'
                        : 'bg-slate-950 border-slate-800 opacity-80'
                    }`}
                  >
                    {/* Timeline Circle Node */}
                    <div
                      className={`absolute top-6 right-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                          : isCurrent
                          ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse shadow-md shadow-amber-500/30'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      {isCompleted ? '✓' : stage.stageNumber}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                            {stage.code}
                          </span>
                          <h4 className="font-extrabold text-base text-white">
                            المرحلة {stage.stageNumber}: {stage.titleAr}
                          </h4>
                        </div>

                        <span className="text-xs text-slate-400 font-bold">
                          {stage.durationText} • +{stage.xpPoints} XP
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {stage.descriptionAr}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                        <span className="font-black text-amber-300">🎯 مخرج المشروع: </span>
                        <span>{stage.projectOutcomeAr}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* EXPANDED STAGE DETAIL MODAL                                   */}
        {/* ------------------------------------------------------------- */}
        <AnimatePresence>
          {selectedStage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-right dir-rtl overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${selectedStage.gradient} text-white`}>
                      <selectedStage.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-amber-400">{selectedStage.code}</span>
                      <h3 className="text-lg sm:text-xl font-black text-white">{selectedStage.titleAr}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStage(null)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <p>{selectedStage.descriptionAr}</p>

                  {selectedStage.prerequisitesAr && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                      <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span><strong>متطلبات سابقة:</strong> {selectedStage.prerequisitesAr}</span>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-extrabold text-amber-300 text-xs">🎓 مشروع وحصيلة هذه المرحلة:</h4>
                    <p className="text-white font-bold">{selectedStage.projectOutcomeAr}</p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-slate-300 text-xs">المهارات والتقنيات المكتسبة:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStage.skills.map((sk, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedStage.softwareUsed && (
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-slate-300 text-xs">الأدوات والبرامج المستخدمة:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedStage.softwareUsed.map((sw, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-violet-950/60 text-violet-300 border border-violet-500/30 font-bold text-xs">
                            {sw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      const c = courses.find((crs) => crs.id === selectedStage.courseId);
                      if (c && onSelectCourse) {
                        onSelectCourse(c);
                        setSelectedStage(null);
                      } else {
                        alert(`سيتم تحويلك لكورس ${selectedStage.titleAr}`);
                        setSelectedStage(null);
                      }
                    }}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-amber-400 text-white font-black text-xs shadow-xl shadow-red-600/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-200" />
                    <span>انتقل لصفحة الكورس الكاملة 🚀</span>
                  </button>

                  <button
                    onClick={() => setSelectedStage(null)}
                    className="px-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
