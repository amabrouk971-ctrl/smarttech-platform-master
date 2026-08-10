import { 
  collection, getDocs, getDoc, doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  LearningPath, Course, SpecializationInterest, RecommendationScoringWeights, 
  RecommendationRulesConfig, PathValidationResult, PathCourseSequenceItem 
} from '../types';
import { INITIAL_LEARNING_PATHS } from '../data/seedData';

// 1. DIGITAL EMPLOYEE FOUNDATION COURSE CONSTANT
export const DIGITAL_EMPLOYEE_COURSE: Course = {
  id: 'digital-employee',
  code: 'DE-101',
  titleAr: 'الموظف الرقمي التأسيسي (Digital Employee Foundation)',
  titleEn: 'Digital Employee Foundation 101',
  category: 'programming',
  ageMin: 5,
  ageMax: 20,
  originalPrice: 1200,
  discountPrice: 950,
  summer3MonthsPrice: 2400,
  monthlyPrice: 350,
  durationWeeks: 8,
  sessionsCount: 8,
  sessionMinutes: 120,
  descriptionAr: 'المسار التأسيسي الزامي الموحد لجميع طلاب SmartTech. يبني مهارات الموظف الرقمي، الحاسوب المتقدم، الأمان الرقمي، الأدوات الإنتاجية، والتعامل الذكي مع أدوات الذكاء الاصطناعي.',
  descriptionEn: 'Unified mandatory foundation course for all SmartTech learners. Covers Digital Literacy, Internet Safety, Computer Fundamentals, Productivity Tools, & AI Basics.',
  learningOutcomesAr: [
    'إتقان التعامل مع أساسيات الحاسوب وأنظمة التشغيل الحديثة',
    'استخدام أدوات الموظف الرقمي والإنتاجية السحابية Google & Microsoft',
    'مبادئ الأمن الرقمي وإدارة الملفات والهوية الرقمية',
    'التعامل العملي الأخلاقي مع نماذج الذكاء الاصطناعي وهندسة الأوامر',
    'التفكير المنطقي وحل المشكلات الرقمية وتجهيز الطالب لأي تخصص تكنولوجي'
  ],
  learningOutcomesEn: [
    'Master OS and computer hardware & software basics',
    'Utilize digital productivity platforms & cloud workflows',
    'Practice cyber safety, identity security, and cloud storage',
    'Prompt engineering basics with generative AI tools',
    'Problem solving & computational thinking for specialized technology paths'
  ],
  skills: [
    'Digital Literacy', 'Computer Fundamentals', 'Internet Safety', 
    'Cloud Productivity', 'AI Prompting', 'Computational Thinking', 'Digital Ethics'
  ],
  mode: 'Hybrid',
  image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
  levelAr: 'تأسيسي إجباري (Level 0)',
  featured: true,
  interests: ['Computer Science', 'Programming', 'Artificial Intelligence', 'Business', 'Robotics', 'Design'],
  tags: ['foundation', 'mandatory', 'digital-employee', 'basics', 'level0'],
  recommendation_weight: 100,
  digital_employee_relevance_score: 100,
  status: 'PUBLISHED'
};

// 2. DEFAULT SPECIALIZATION INTERESTS
export const DEFAULT_SPECIALIZATION_INTERESTS: SpecializationInterest[] = [
  {
    id: 'int-ai',
    nameAr: 'الذكاء الاصطناعي والتعلم الآلي',
    nameEn: 'AI & Machine Learning',
    descriptionAr: 'استكشاف النماذج الذكية والرؤية الحاسوبية وهندسة الأوامر Prompt Engineering',
    descriptionEn: 'Generative AI models, Computer Vision, & Machine Learning basics',
    iconName: 'Sparkles',
    color: '#8B5CF6',
    categoryTag: 'ai',
    priority: 1,
    enabled: true,
    assignedCourseIds: ['digital-employee', 'c3-ai-master', 'ai-python-lab'],
    assignedPathIds: ['ai-creator', 'master-ai-path']
  },
  {
    id: 'int-programming',
    nameAr: 'البرمجة وهندسة البرمجيات',
    nameEn: 'Programming & Software Engineering',
    descriptionAr: 'كتابة الكود والبرمجة بالبلوكات ولغات Python, JavaScript, Scratch',
    descriptionEn: 'Block coding, Python, Web & Software Development',
    iconName: 'Code2',
    color: '#3B82F6',
    categoryTag: 'programming',
    priority: 2,
    enabled: true,
    assignedCourseIds: ['digital-employee', 'c1-scratch-basics', 'python-pro-101'],
    assignedPathIds: ['junior-programmer', 'fullstack-dev-path']
  },
  {
    id: 'int-robotics',
    nameAr: 'الروبوتات والميكانيكا',
    nameEn: 'Robotics & Mechanical Systems',
    descriptionAr: 'تركيب ومحاكاة الروبوتات والتروس والحساسات والمحركات',
    descriptionEn: 'LEGO robotics, Arduino, motor mechanics & smart sensors',
    iconName: 'Bot',
    color: '#10B981',
    categoryTag: 'robotics',
    priority: 3,
    enabled: true,
    assignedCourseIds: ['digital-employee', 'c2-lego-wedo'],
    assignedPathIds: ['junior-engineer', 'robotics-master-path']
  },
  {
    id: 'int-electronics',
    nameAr: 'الإلكترونيات والإنترنت للأشياء IoT',
    nameEn: 'Electronics & Smart Systems',
    descriptionAr: 'الدوائر الكهربائية والأنظمة المدمجة مع Arduino & Raspberry Pi',
    descriptionEn: 'Circuits, breadboards, smart sensors & IoT projects',
    iconName: 'Cpu',
    color: '#F59E0B',
    categoryTag: 'electronics',
    priority: 4,
    enabled: true,
    assignedCourseIds: ['digital-employee', 'c2-lego-wedo'],
    assignedPathIds: ['junior-engineer']
  },
  {
    id: 'int-gamedev',
    nameAr: 'تطوير وصناعة الألعاب 2D / 3D',
    nameEn: 'Game Development & Roblox',
    descriptionAr: 'صناعة الألعاب والشخصيات والأحداث التفاعلية بـ Scratch & Unity',
    descriptionEn: 'Building 2D/3D games, physics mechanics, Scratch & Unity',
    iconName: 'Gamepad2',
    color: '#EF4444',
    categoryTag: 'gamedev',
    priority: 5,
    enabled: true,
    assignedCourseIds: ['c1-scratch-basics'],
    assignedPathIds: ['junior-programmer']
  },
  {
    id: 'int-design',
    nameAr: 'التصميم الجرافيكي والرسم الرقمي',
    nameEn: 'Creative Design & UI/UX',
    descriptionAr: 'تصميم الواجهات والشعارات والرسوم المتجهية بـ Photoshop & Canva',
    descriptionEn: 'Digital art, vector design, branding & UI creation',
    iconName: 'Palette',
    color: '#EC4899',
    categoryTag: 'design',
    priority: 6,
    enabled: true,
    assignedCourseIds: ['digital-employee'],
    assignedPathIds: ['creative-design-path']
  },
  {
    id: 'int-business',
    nameAr: 'ريادة الأعمال والإدارة التكنولوجية',
    nameEn: 'Tech Entrepreneurship & Business',
    descriptionAr: 'تحويل الأفكار لمشاريع، إدارة الفرق، ومبادئ الاقتصاد الرقمي',
    descriptionEn: 'Startup basics, pitch decks, product management & digital business',
    iconName: 'Briefcase',
    color: '#6366F1',
    categoryTag: 'business',
    priority: 7,
    enabled: true,
    assignedCourseIds: ['digital-employee'],
    assignedPathIds: ['digital-employee-master-path']
  },
  {
    id: 'int-cybersecurity',
    nameAr: 'الأمن السيبراني والبيانات',
    nameEn: 'Cybersecurity & Data Protection',
    descriptionAr: 'حماية البيانات، التشفير، وأساسيات الشبكات والأمان السحابي',
    descriptionEn: 'Cyber hygiene, ethical security concepts & cloud data safety',
    iconName: 'Shield',
    color: '#06B6D4',
    categoryTag: 'cybersecurity',
    priority: 8,
    enabled: true,
    assignedCourseIds: ['digital-employee'],
    assignedPathIds: ['cyber-data-path']
  }
];

// 3. DEFAULT RECOMMENDATION RULES & SCORING WEIGHTS
export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationScoringWeights = {
  interestMatchWeight: 30,
  goalMatchWeight: 25,
  ageMatchWeight: 15,
  prerequisiteMatchWeight: 20,
  pathMatchWeight: 20,
  foundationProgressionWeight: 30,
  classAvailabilityWeight: 10,
  completedCoursePenalty: -100,
  enrolledCoursePenalty: -80,
  fullClassPenalty: -50
};

// 4. DEFAULT MASTER LEARNING PATHS (Backed by Digital Employee Foundation)
export const DEFAULT_MASTER_PATHS: LearningPath[] = [
  {
    id: 'digital-employee-master-path',
    titleAr: 'مسار الموظف الرقمي والأساسيات التكنولوجية',
    titleEn: 'Digital Employee & Future Foundations Path',
    slug: 'digital-employee-foundation',
    ageRange: '5–18 سنة',
    targetAgeMin: 5,
    targetAgeMax: 18,
    descriptionAr: 'المسار التأسيسي العام الموحد. يتعلم المستفيد أساسيات التعامل مع الكمبيوتر والأدوات الرقمية والإنتاجية والأمن السحابي وتطبيق الذكاء الاصطناعي.',
    descriptionEn: 'The mandatory universal foundation path for every SmartTech learner before specialized tech paths.',
    color: '#0284C7',
    iconName: 'Briefcase',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    category: 'foundation',
    interests: ['Programming', 'Artificial Intelligence', 'Business', 'Robotics'],
    difficulty: 'BEGINNER',
    foundationRequired: true,
    foundationCourseId: 'digital-employee',
    status: 'PUBLISHED',
    version: 1,
    displayOrder: 1,
    targetAudienceAr: 'جميع الطلاب والناشئين في بداية رحلتهم التكنولوجية.',
    targetAudienceEn: 'Every beginner learner embarking on a tech career.',
    estimatedWeeks: 8,
    badgeReward: 'Digital Employee Certified 🎓',
    stages: [
      {
        id: 'de-s1',
        titleAr: 'المستوى صفر: الثقافة الحاسوبية والأمن الرقمي',
        titleEn: 'Level 0: Digital Hygiene & OS Fundamentals',
        descriptionAr: 'التعرف على مكونات الحاسوب ونظم التشغيل والتعامل الآمن مع الإنترنت.',
        skills: ['Computer OS', 'Cloud Storage', 'Internet Safety'],
        projectOutcomeAr: 'إنشاء الهوية الرقمية للطلبة وتنظيم الملفات السحابية'
      },
      {
        id: 'de-s2',
        titleAr: 'أدوات الموظف الرقمي والإنتاجية التفاعلية',
        titleEn: 'Digital Tools & Productivity',
        descriptionAr: 'إتقان المستندات والعروض التقديمية وتطبيقات العمل الجماعي.',
        skills: ['Cloud Docs', 'Slides', 'Collaborative Tools'],
        projectOutcomeAr: 'تقديم عرض تقديمي تفاعلي وحساب جداول بيانات'
      },
      {
        id: 'de-s3',
        titleAr: 'الوعي بالذكاء الاصطناعي والتكود الأولي',
        titleEn: 'AI Prompting & Logical Thinking',
        descriptionAr: 'استخدام نماذج الذكاء الاصطناعي المساعدة وتنمية المنطق الخوارزمي.',
        skills: ['AI Prompting', 'Algorithm Logic'],
        projectOutcomeAr: 'مشروع تخرج الموظف الرقمي وحل مشكلة واقعية'
      }
    ],
    courseSequence: [
      {
        courseId: 'digital-employee',
        stepNumber: 1,
        role: 'REQUIRED',
        reasonAr: 'المسار التأسيسي الأول لجميع المتعلمين للتمكن من الأدوات التكنولوجية.',
        reasonEn: 'Primary mandatory starting stage for digital fluency.'
      },
      {
        courseId: 'c1-scratch-basics',
        stepNumber: 2,
        role: 'RECOMMENDED',
        reasonAr: 'الانتقال إلى التفكير المنطقي الخوارزمي والبرمجة بالبلوكات.',
        reasonEn: 'Logical step forward to block coding and visual algorithms.'
      }
    ]
  },
  {
    id: 'ai-creator-master-path',
    titleAr: 'مسار المبتكر الذكي والذكاء الاصطناعي (AI & Innovation Master)',
    titleEn: 'Smart AI & Innovation Specialist Path',
    slug: 'ai-specialist-path',
    ageRange: '8–18 سنة',
    targetAgeMin: 8,
    targetAgeMax: 18,
    descriptionAr: 'مسار متخصص يبدأ من الموظف الرقمي ثم ينتقل لبناء نماذج الذكاء الاصطناعي، التعرف على الوجوه، والرؤية الحاسوبية وتطبيقات AI.',
    descriptionEn: 'Advanced AI path bridging foundational digital tools with computer vision and Generative AI.',
    color: '#8B5CF6',
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    category: 'ai',
    interests: ['Artificial Intelligence', 'Programming', 'Business'],
    difficulty: 'INTERMEDIATE',
    foundationRequired: true,
    foundationCourseId: 'digital-employee',
    status: 'PUBLISHED',
    version: 1,
    displayOrder: 2,
    targetAudienceAr: 'الطلاب الراغبون في احتراف تطبيقات الذكاء الاصطناعي وصناعة الحلول الذكية.',
    targetAudienceEn: 'Students building future AI systems.',
    estimatedWeeks: 14,
    badgeReward: 'AI Mastermind 🧠',
    stages: [
      {
        id: 'ai-s1',
        titleAr: 'تأسيس الموظف الرقمي والوعي بالذكاء الاصطناعي',
        titleEn: 'Digital Foundation & AI Awareness',
        descriptionAr: 'إتقان الأدوات الأساسية والتعامل مع الذكاء الاصطناعي التوليدي.',
        skills: ['Digital Employee', 'AI Tools', 'Prompting'],
        projectOutcomeAr: 'مشروع أساسيات الموظف الرقمي'
      },
      {
        id: 'ai-s2',
        titleAr: 'تدريب النماذج الذكية والرؤية الحاسوبية Machine Vision',
        titleEn: 'Train Smart Models & Computer Vision',
        descriptionAr: 'تدريب الحاسوب على التعلم من الصور والأصوات والحركات.',
        skills: ['Teachable Machine', 'Computer Vision', 'Image Classification'],
        projectOutcomeAr: 'نظام ذكي للتعرف على الوجه وفتح الأبواب تلقائياً'
      },
      {
        id: 'ai-s3',
        titleAr: 'بناء المساعد الشخصي وتطبيقات AI المتطورة',
        titleEn: 'AI Agents & Python AI Projects',
        descriptionAr: 'ربط واجهات API وبناء روبوتات محادثة ناطقة متكاملة.',
        skills: ['Python Basics', 'AI APIs', 'LLM Agents'],
        projectOutcomeAr: 'مساعد ذكي صوتي يجيب على استفسارات الطلاب'
      }
    ],
    courseSequence: [
      {
        courseId: 'digital-employee',
        stepNumber: 1,
        role: 'REQUIRED',
        reasonAr: 'التأسيس الواجب لاكتساب مهارات الموظف الرقمي والتعامل مع الأدوات.',
        reasonEn: 'Mandatory foundation step.'
      },
      {
        courseId: 'c3-ai-master',
        stepNumber: 2,
        role: 'REQUIRED',
        reasonAr: 'الكورس الرئيسي لتدريب النماذج وبناء التطبيقات الذكية.',
        reasonEn: 'Core specialized AI training course.'
      }
    ]
  },
  {
    id: 'junior-programmer-master-path',
    titleAr: 'مسار مهندس البرمجيات والألعاب (Full-Stack & Game Developer)',
    titleEn: 'Software Engineering & Game Developer Path',
    slug: 'software-game-dev',
    ageRange: '6–18 سنة',
    targetAgeMin: 6,
    targetAgeMax: 18,
    descriptionAr: 'مسار احتراف البرمجة بدءاً من التأسيس إلى البرمجة النصية بلغة Python وتصميم الألعاب ثنائية وثلاثية الأبعاد.',
    descriptionEn: 'Comprehensive coding path taking learners from block logic to Python and 2D/3D Game Dev.',
    color: '#EF4444',
    iconName: 'Code2',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    category: 'programming',
    interests: ['Programming', 'Game Development', 'Electronics'],
    difficulty: 'INTERMEDIATE',
    foundationRequired: true,
    foundationCourseId: 'digital-employee',
    status: 'PUBLISHED',
    version: 1,
    displayOrder: 3,
    targetAudienceAr: 'شغوفو البرمجة وألعاب الفيديو والابتكار التكنولوجي.',
    targetAudienceEn: 'Aspiring coders and game creators.',
    estimatedWeeks: 12,
    badgeReward: 'Code Architect 💻',
    stages: [
      {
        id: 'prog-s1',
        titleAr: 'التأسيس الرقمي ومنطق البرمجة البصرية Scratch',
        titleEn: 'Digital Employee & Block Logic',
        descriptionAr: 'استيعاب المنطق الخوارزمي والشخصيات والحركات.',
        skills: ['Digital Employee', 'Scratch Blocks', 'Sequencing'],
        projectOutcomeAr: 'لعبة تفاعلية 2D متعددة المراحل'
      },
      {
        id: 'prog-s2',
        titleAr: 'البرمجة النصية بلغة Python والمشاريع الحقيقية',
        titleEn: 'Text-based Python Programming',
        descriptionAr: 'كتابة الأكواد النصية، الدوال، المتغيرات، وإصلاح الأخطاء Debugging.',
        skills: ['Python Syntax', 'Functions', 'Data Logic'],
        projectOutcomeAr: 'تطبيق حاسبة متطورة ولعبة نصية تفاعلية'
      }
    ],
    courseSequence: [
      {
        courseId: 'digital-employee',
        stepNumber: 1,
        role: 'REQUIRED',
        reasonAr: 'التأسيس الرقمي الأساسي المطلوب لجميع طلاب البرمجة.',
        reasonEn: 'Essential foundation for digital skills.'
      },
      {
        courseId: 'c1-scratch-basics',
        stepNumber: 2,
        role: 'REQUIRED',
        reasonAr: 'بناء المفاهيم الخوارزمية قبل الانتقال للأكواد النصية.',
        reasonEn: 'Block coding logic step.'
      }
    ]
  },
  {
    id: 'junior-engineer-master-path',
    titleAr: 'مسار الروبوتات والهندسة الميكانيكية (Robotics & LEGO Engineer)',
    titleEn: 'Robotics & Mechatronics Master Path',
    slug: 'robotics-engineering',
    ageRange: '5–16 سنة',
    targetAgeMin: 5,
    targetAgeMax: 16,
    descriptionAr: 'مسار تطبيقي يبدأ بتأسيس الموظف الرقمي ثم التركيب الميكانيكي ومحركات LEGO والحساسات والاستشعار.',
    descriptionEn: 'Hands-on hardware & mechanics path starting with Digital Employee through LEGO robotics.',
    color: '#10B981',
    iconName: 'Bot',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    category: 'robotics',
    interests: ['Robotics', 'Electronics', 'Programming'],
    difficulty: 'BEGINNER',
    foundationRequired: true,
    foundationCourseId: 'digital-employee',
    status: 'PUBLISHED',
    version: 1,
    displayOrder: 4,
    targetAudienceAr: 'عشاق التركيب الميكانيكي والأجهزة الحركية.',
    targetAudienceEn: 'Hands-on builders and robotics enthusiasts.',
    estimatedWeeks: 12,
    badgeReward: 'Robotics Master 🤖',
    stages: [
      {
        id: 'rob-s1',
        titleAr: 'أساسيات الموظف الرقمي والهندسة الميكانيكية',
        titleEn: 'Digital Employee & Basic Mechanics',
        descriptionAr: 'التعرف على التروس والرافعات والقوى الميكانيكية بالقطع الفيزيائية.',
        skills: ['Digital Employee', 'Gears', 'Levers'],
        projectOutcomeAr: 'رافعة ميكانيكية مصغرة'
      },
      {
        id: 'rob-s2',
        titleAr: 'برمجة حساسات ومحركات LEGO WeDo',
        titleEn: 'LEGO Assembly & Smart Sensors',
        descriptionAr: 'ربط الحساسات وحرية حركة الروبوت في الحلبة.',
        skills: ['Distance Sensor', 'Motor Control'],
        projectOutcomeAr: 'سيارة روبوتية تتجنب العوائق ذكياً'
      }
    ],
    courseSequence: [
      {
        courseId: 'digital-employee',
        stepNumber: 1,
        role: 'REQUIRED',
        reasonAr: 'التأسيس الرقمي الهام للتحكم بالأجهزة والبرمجيات.',
        reasonEn: 'Prerequisite digital foundation.'
      },
      {
        courseId: 'c2-lego-wedo',
        stepNumber: 2,
        role: 'REQUIRED',
        reasonAr: 'التطبيق الميكانيكي والروبوتي المباشر.',
        reasonEn: 'Hands-on robotics hardware course.'
      }
    ]
  }
];

// 5. PATH VALIDATION AND CIRCULAR DEPENDENCY DETECTOR (DFS Graph Cycle)
export const validateLearningPath = (
  path: Partial<LearningPath>, 
  allCourses: Course[] = []
): PathValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let hasFoundation = false;
  let hasCircularDependency = false;
  let circularDependencyPath: string[] = [];

  // A. Check Foundation Requirement
  if (path.foundationRequired !== false) {
    const fId = path.foundationCourseId || 'digital-employee';
    const hasInSeq = path.courseSequence?.some(s => s.courseId === fId);
    const hasInReq = path.requiredCourseIds?.includes(fId);

    if (hasInSeq || hasInReq || fId === 'digital-employee') {
      hasFoundation = true;
    } else {
      errors.push(`المسار يفتقد كورس الموظف الرقمي التأسيسي (Digital Employee Foundation - ${fId}). جميع المسارات الرئيسية يجب أن تبدأ به.`);
    }
  } else {
    warnings.push('تم تعطيل شرط الموظف الرقمي التأسيسي لهذا المسار الاستثنائي.');
  }

  // B. Validate Required Courses Exist
  const courseMap = new Map(allCourses.map(c => [c.id, c]));
  path.courseSequence?.forEach((seq) => {
    if (allCourses.length > 0 && !courseMap.has(seq.courseId) && seq.courseId !== 'digital-employee') {
      warnings.push(`الكورس بالمعرف (${seq.courseId}) المضاف في التسلسل غير موجود حالياً في سجل الكورسات.`);
    }
  });

  // C. Circular Dependency Graph Detection Algorithm (DFS Cycle Detection)
  const adjList = new Map<string, string[]>();
  
  // Build adjacency list from course prerequisites
  allCourses.forEach(course => {
    if (course.prerequisites && Array.isArray(course.prerequisites)) {
      adjList.set(course.id, [...course.prerequisites]);
    }
  });

  // Add path sequence dependencies (Step N depends on Step N-1 if required)
  if (path.courseSequence && path.courseSequence.length > 1) {
    const sortedSeq = [...path.courseSequence].sort((a, b) => a.stepNumber - b.stepNumber);
    for (let i = 1; i < sortedSeq.length; i++) {
      const prev = sortedSeq[i - 1].courseId;
      const curr = sortedSeq[i].courseId;
      const existing = adjList.get(curr) || [];
      if (!existing.includes(prev)) {
        adjList.set(curr, [...existing, prev]);
      }
    }
  }

  // Detect Cycle using DFS
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const cycleTrace: string[] = [];

  const dfsCycle = (node: string): boolean => {
    visited.add(node);
    recStack.add(node);
    cycleTrace.push(node);

    const neighbors = adjList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfsCycle(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        cycleTrace.push(neighbor);
        hasCircularDependency = true;
        return true;
      }
    }

    recStack.delete(node);
    cycleTrace.pop();
    return false;
  };

  for (const courseId of Array.from(adjList.keys())) {
    if (!visited.has(courseId)) {
      if (dfsCycle(courseId)) {
        break;
      }
    }
  }

  if (hasCircularDependency) {
    circularDependencyPath = cycleTrace;
    errors.push(`تم اكتشاف اعتماد دائرية مغلقة (Circular Dependency) في متطلبات الكورسات: ${cycleTrace.join(' ➔ ')}. يرجى فك الارتباط التكراري.`);
  }

  return {
    valid: errors.length === 0,
    hasFoundation,
    hasCircularDependency,
    circularDependencyPath,
    errors,
    warnings
  };
};

// 6. FIRESTORE CRUD OPERATIONS FOR LEARNING PATHS & INTERESTS

// Get All Master Learning Paths
export const getLearningPathsFromFirestore = async (): Promise<LearningPath[]> => {
  try {
    const pathsCol = collection(db, 'learningPaths');
    const snapshot = await getDocs(pathsCol);
    if (snapshot.empty) {
      return DEFAULT_MASTER_PATHS;
    }
    const paths = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LearningPath[];
    return paths.length > 0 ? paths : DEFAULT_MASTER_PATHS;
  } catch (err) {
    console.warn('Firestore fetch learningPaths failed, using fallback seed paths:', err);
    return DEFAULT_MASTER_PATHS;
  }
};

// Save / Update Learning Path
export const saveLearningPathToFirestore = async (path: LearningPath): Promise<void> => {
  const pathRef = doc(db, 'learningPaths', path.id);
  const now = new Date().toISOString();
  const updatedPath = {
    ...path,
    updatedAt: now,
    version: (path.version || 1) + 1
  };
  await setDoc(pathRef, updatedPath, { merge: true });
};

// Delete Learning Path
export const deleteLearningPathFromFirestore = async (pathId: string): Promise<void> => {
  const pathRef = doc(db, 'learningPaths', pathId);
  await deleteDoc(pathRef);
};

// Get Specialization Interests
export const getInterestsFromFirestore = async (): Promise<SpecializationInterest[]> => {
  try {
    const colRef = collection(db, 'interests');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return DEFAULT_SPECIALIZATION_INTERESTS;
    }
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as SpecializationInterest[];
    return items.length > 0 ? items : DEFAULT_SPECIALIZATION_INTERESTS;
  } catch (err) {
    return DEFAULT_SPECIALIZATION_INTERESTS;
  }
};

// Save Specialization Interest
export const saveInterestToFirestore = async (interest: SpecializationInterest): Promise<void> => {
  const docRef = doc(db, 'interests', interest.id);
  await setDoc(docRef, interest, { merge: true });
};

// Get Recommendation Rules & Scoring Weights
export const getRecommendationRulesFromFirestore = async (): Promise<RecommendationScoringWeights> => {
  try {
    const docRef = doc(db, 'recommendationRules', 'default_weights');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as RecommendationRulesConfig;
      return { ...DEFAULT_RECOMMENDATION_WEIGHTS, ...data.weights };
    }
  } catch (err) {
    console.warn('Could not load recommendation rules from Firestore, using defaults');
  }
  return DEFAULT_RECOMMENDATION_WEIGHTS;
};

// Save Recommendation Rules
export const saveRecommendationRulesToFirestore = async (weights: RecommendationScoringWeights): Promise<void> => {
  const docRef = doc(db, 'recommendationRules', 'default_weights');
  await setDoc(docRef, {
    id: 'default_weights',
    weights,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

// Seed / Sync Foundation Course and Default Master Paths to Firestore
export const seedFoundationAndPathsToFirestore = async (): Promise<{ pathsCount: number; interestsCount: number }> => {
  try {
    // 1. Ensure Digital Employee Foundation Course exists in Firestore
    const deRef = doc(db, 'courses', DIGITAL_EMPLOYEE_COURSE.id);
    await setDoc(deRef, DIGITAL_EMPLOYEE_COURSE, { merge: true });

    // 2. Sync Master Paths
    for (const path of DEFAULT_MASTER_PATHS) {
      const pathRef = doc(db, 'learningPaths', path.id);
      await setDoc(pathRef, path, { merge: true });
    }

    // 3. Sync Interests
    for (const interest of DEFAULT_SPECIALIZATION_INTERESTS) {
      const intRef = doc(db, 'interests', interest.id);
      await setDoc(intRef, interest, { merge: true });
    }

    // 4. Sync Scoring Weights
    const weightsRef = doc(db, 'recommendationRules', 'default_weights');
    await setDoc(weightsRef, {
      id: 'default_weights',
      weights: DEFAULT_RECOMMENDATION_WEIGHTS,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return {
      pathsCount: DEFAULT_MASTER_PATHS.length,
      interestsCount: DEFAULT_SPECIALIZATION_INTERESTS.length
    };
  } catch (err) {
    console.error('Error seeding foundation and paths to Firestore:', err);
    throw err;
  }
};
