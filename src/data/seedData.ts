import { LearningPath, Course, Badge, Mission, Branch, StoreItem, StudentProject, Certificate } from '../types';

export const INITIAL_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'junior-engineer',
    titleAr: 'مسار الهندسة والروبوتات (LEGO & Mechanical Engineering)',
    titleEn: 'Junior Engineer - LEGO Robotics Path',
    ageRange: '5–10 سنوات',
    personalityType: 'assembly_engineering',
    personalityLabelAr: 'شغوف بالفك والتركيب والمكعبات والميكانيكا 🛠️',
    descriptionAr: 'المسار المثالي للطفل الذي يحب الفك والتركيب وتجربة القطع بنفسه. يتعلم مبادئ الرافعة والتروس والمحركات والبرمجة بالبلوكات لبناء روبوتات حقيقية متحركة.',
    descriptionEn: 'Designed for kids who love disassembling toys, LEGO assembly, gears, and motor mechanics.',
    color: '#059669',
    iconName: 'Bot',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    targetAudienceAr: 'الأطفال محبو التركيب والمكعبات والألعاب الحركية والميكانيكا.',
    targetAudienceEn: 'Kids fascinated by mechanical assembly and building.',
    estimatedWeeks: 12,
    badgeReward: 'Lego Engineer 🤖',
    stages: [
      {
        id: 'p3-1',
        titleAr: 'مبادئ التفكير الهندسي والآلات البسيطة',
        titleEn: 'Engineering Thinking',
        descriptionAr: 'استكشاف التروس، المحركات، الرافعات، والقوى الميكانيكية بالقطع الفيزيائية.',
        skills: ['Mechanics', 'Gears', 'Engineering Logic'],
        projectOutcomeAr: 'بناء رافعة ميكانيكية ورافعة هيدروليكية مصغرة'
      },
      {
        id: 'p3-2',
        titleAr: 'تركيب روبوتات LEGO WeDo التفاعلية',
        titleEn: 'LEGO Assembly & Motors',
        descriptionAr: 'تجميع الهياكل الروبوتية وربط المحركات الذكية مع كتل الحركة.',
        skills: ['LEGO Assembly', 'Motor Control'],
        projectOutcomeAr: 'بناء سيارة سباق روبوتية وذراع تجميع هدايا'
      },
      {
        id: 'p3-3',
        titleAr: 'برمجة الحساسات والرؤية الاستشعارية',
        titleEn: 'Sensors Logic',
        descriptionAr: 'استخدام حساس المسافة، حساس الألوان، وحساس الاصطدام لحرية حركة الروبوت.',
        skills: ['Distance Sensors', 'Color Reader'],
        projectOutcomeAr: 'روبوت حارس ذكي يتوقف فور رؤية العوائق'
      },
      {
        id: 'p3-4',
        titleAr: 'تحديات حلبة الروبوتات وتتبع المسار',
        titleEn: 'Robotics Arena Challenge',
        descriptionAr: 'تجهيز الروبوت للمنافسات وحل المشكلات الهندسية الميدانية.',
        skills: ['Line Follower', 'Arena Navigation'],
        projectOutcomeAr: 'المشاركة في مسابقة الروبوت الذكي بالأكاديمية'
      }
    ]
  },
  {
    id: 'junior-programmer',
    titleAr: 'مسار البرمجة وتطوير الألعاب (Scratch & Game Development)',
    titleEn: 'Junior Game Programmer Path',
    ageRange: '6–12 سنة',
    personalityType: 'gaming_programming',
    personalityLabelAr: 'عاشق ألعاب الكمبيوتر والشاشات والقصص التفاعلية 🎮',
    descriptionAr: 'تحويل وقت اللعب على الشاشات إلى طاقة إنتاج وإبداع! يتعلم الطفل تحريك الشخصيات، كتابة الأكواد بالبلوكات، وصناعة ألعاب الكمبيوتر الخاصة به مثل روبلوكس وماريو.',
    descriptionEn: 'Transforms gaming time into creative coding. Build games, animations, and interactive stories.',
    color: '#E53935',
    iconName: 'Code',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    targetAudienceAr: 'الأطفال المهتمون بألعاب الفيديو، الرسومات، وترجمة أفكارهم إلى ألعاب.',
    targetAudienceEn: 'Gamers and aspiring young game coders.',
    estimatedWeeks: 12,
    badgeReward: 'Game Master 🎮',
    stages: [
      {
        id: 'p1-1',
        titleAr: 'أساسيات الكمبيوتر والمنطق الصوري',
        titleEn: 'Computer Basics & Logic',
        descriptionAr: 'فهم كيف يفكر الحاسوب والتسلسل الخوارزمي في اللعب.',
        skills: ['Logic Sequencing', 'Computer Fundamentals'],
        projectOutcomeAr: 'قصة تفاعلية ناطقة بـ 3 شخصيات'
      },
      {
        id: 'p1-2',
        titleAr: 'برمجة الشخصيات والأحداث التفاعلية Scratch',
        titleEn: 'Scratch Character Events',
        descriptionAr: 'التحكم بالأسهم والمفاتيح وحركة الكائنات والأصوات الموسيقية.',
        skills: ['Scratch Blocks', 'Keyboard Controls'],
        projectOutcomeAr: 'لعبة متاهة الكنز وتفادي العوائق'
      },
      {
        id: 'p1-3',
        titleAr: 'تصميم ألعاب ثنائية الأبعاد 2D Game Dev',
        titleEn: '2D Game Design',
        descriptionAr: 'حساب النقاط، العداد التنازلي، والمستويات المتعددة.',
        skills: ['Variables', 'Score Systems', 'Physics'],
        projectOutcomeAr: 'لعبة طائرات وحروب الفضاء المتكاملة'
      },
      {
        id: 'p1-4',
        titleAr: 'نشر اللعبة على المنصة وتحديات الأصدقاء',
        titleEn: 'Game Publishing',
        descriptionAr: 'إضافة المؤثرات الصوتية الشائعة ونشر المشروع أونلاين.',
        skills: ['UI Effects', 'Community Showcase'],
        projectOutcomeAr: 'رابط مباشر للعبة يستمتع به الأصدقاء والعائلة'
      }
    ]
  },
  {
    id: 'ai-creator',
    titleAr: 'مسار الذكاء الاصطناعي وصانعي المستقبل (AI & Innovation)',
    titleEn: 'AI & Smart Systems Path',
    ageRange: '8–16 سنة',
    personalityType: 'ai_shared',
    personalityLabelAr: 'مسار مشترك لجميع الأطفال الشغوفين بالمستقبل والذكاء 🧠⚡',
    descriptionAr: 'المسار الجامع بين الهندسة والبرمجة! يتعلم الطفل كيف تدرب النماذج الذكية، تقنيات الرؤية الحاسوبية، التعرف على الوجوه، وهندسة الأوامر توليد الصور والذكاء الاصطناعي.',
    descriptionEn: 'Shared path bridging hardware and coding. Covers Machine Learning, Vision, and Generative AI.',
    color: '#D97706',
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    targetAudienceAr: 'مشترك لجميع الفئات الراغبة في استكشاف ثورة الذكاء الاصطناعي.',
    targetAudienceEn: 'Every curious child building tomorrow.',
    estimatedWeeks: 14,
    badgeReward: 'AI Pioneer 🧠',
    stages: [
      {
        id: 'p5-1',
        titleAr: 'مدخل للذكاء الاصطناعي وكيف تفكر الآلات',
        titleEn: 'How AI Thinks',
        descriptionAr: 'فهم الفرق بين البرمجة التقليدية والتعلم الآلي Machine Learning.',
        skills: ['AI Logic', 'Machine Learning Intro'],
        projectOutcomeAr: 'تطبيق تصنيف الفواكه بالتعلم الآلي'
      },
      {
        id: 'p5-2',
        titleAr: 'تدريب النماذج الرؤية الحاسوبية Computer Vision',
        titleEn: 'Train Custom Models',
        descriptionAr: 'جمع الصور وتدريب الكاميرا على التعرف على الوجوه والإيماءات.',
        skills: ['Teachable Machine', 'Face Detection'],
        projectOutcomeAr: 'قفل الأبواب الذكي عبر التعرف على وجه الطفل'
      },
      {
        id: 'p5-3',
        titleAr: 'الذكاء الاصطناعي التوليدي وهندسة الأوامر AI Art',
        titleEn: 'Generative AI & Prompts',
        descriptionAr: 'صناعة القصص المصورة وتوليد الصور والموسيقى بالأوامر الذكية.',
        skills: ['Prompt Engineering', 'Generative Media'],
        projectOutcomeAr: 'مجلة مصورة كاملة مولدة بالذكاء الاصطناعي'
      },
      {
        id: 'p5-4',
        titleAr: 'بناء المساعد الذكي ودمجه مع التطبيقات',
        titleEn: 'AI Smart Assistant',
        descriptionAr: 'تطوير بوت ناطق يجيب على أسئلة الطلاب وأخلاقيات التكنولوجيا.',
        skills: ['Voice AI', 'Chatbots', 'Tech Ethics'],
        projectOutcomeAr: 'مساعد صوتي ذكي يدرس الطلاب لغات وبرمجة'
      }
    ]
  },
  {
    id: 'future-engineer',
    titleAr: 'مسار اختراعات الإلكترونيات والأردوينو (Arduino & IoT)',
    titleEn: 'Future Electronics & IoT Engineer Path',
    ageRange: '9–16 سنة',
    personalityType: 'assembly_engineering',
    personalityLabelAr: 'عاشق الدوائر الكهربائية واختراع الأجهزة الملموسة ⚡',
    descriptionAr: 'الانتقال إلى عالم الأجهزة الحقيقية الملموسة! تركيب المقاومات، اللوحات الإلكترونية Breadboards، الحساسات، وشريحة ESP32 لربط الاختراعات بالإنترنت والهاتف.',
    descriptionEn: 'Hands-on hardware, electronic circuits, microcontrollers, C++ coding, and Smart Home IoT.',
    color: '#7C3AED',
    iconName: 'Zap',
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1000&q=80',
    targetAudienceAr: 'الأطفال والشباب الشغوفون بتوصيل الأسلاك واختراع أجهزة للمنزل الذكي.',
    targetAudienceEn: 'Hands-on hardware makers building real circuits.',
    estimatedWeeks: 16,
    badgeReward: 'Hardware Maker 🔌',
    stages: [
      {
        id: 'p4-1',
        titleAr: 'أساسيات الدوائر الكهربائية والمكونات',
        titleEn: 'Circuit Fundamentals',
        descriptionAr: 'قوانين الكهرباء، المقاومات، الدايود، واللوحة الالكترونية Breadboard.',
        skills: ['Breadboard Wiring', 'Resistors', 'LED Control'],
        projectOutcomeAr: 'دائرة إشارة مرور ذكية متعددة الألوان'
      },
      {
        id: 'p4-2',
        titleAr: 'برمجة لوحة Arduino Uno والأكواد المكتوبة',
        titleEn: 'Arduino Programming',
        descriptionAr: 'قراءة إشارات الحساسات والتحكم بالمحركات السيرفو Servo.',
        skills: ['Arduino C++', 'Analog/Digital Pins'],
        projectOutcomeAr: 'جهاز إنذار بالسرقة عبر حساس الحركة PIR'
      },
      {
        id: 'p4-3',
        titleAr: 'الإنترنت الأشياء IoT والمنزل الذكي ESP32',
        titleEn: 'IoT & Smart Home',
        descriptionAr: 'ربط اللوحة بالـ Wi-Fi والتحكم بها عبر تطبيق الهاتف الذكي.',
        skills: ['ESP32', 'WiFi Automation', 'Mobile Triggers'],
        projectOutcomeAr: 'نظام إضاءة وسقي زرع تلقائي عبر الموبايل'
      }
    ]
  },
  {
    id: 'digital-artist',
    titleAr: 'مسار الرسم الرقمي والتصميم الجرافيكي (Digital Art & Design)',
    titleEn: 'Digital Art & Graphic Design Path',
    ageRange: '7–15 سنة',
    personalityType: 'creative_design',
    personalityLabelAr: 'عاشق الرسم والفنون البصرية والتشكيل الرقمي 🎨',
    descriptionAr: 'تحويل المواهب الفنية إلى تصاميم رقمية واحترافية! رسم الشخصيات الكرتونية، التلوين الرقمي، رسوم المتحركة 2D، والنمذجة ثلاثية الأبعاد 3D.',
    descriptionEn: 'Empowers artistic children to master digital illustration, 2D animation, and 3D modeling.',
    color: '#EC4899',
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1000&q=80',
    targetAudienceAr: 'الأطفال الموهوبون في الرسم والتصميم والابتكار البصري.',
    targetAudienceEn: 'Visually creative kids fascinated by drawing & animation.',
    estimatedWeeks: 10,
    badgeReward: 'Digital Artist 🎨',
    stages: [
      {
        id: 'p6-1',
        titleAr: 'أساسيات الرسم الكرتوني والرقمي',
        titleEn: 'Digital Illustration Basics',
        descriptionAr: 'تعلم الرسم بالفرش الرقمية، الطبقات Layers، والتلوين وتوزيع الظلال.',
        skills: ['Digital Painting', 'Layers', 'Coloring'],
        projectOutcomeAr: 'لوحة كرتونية متكاملة للشخصية المفضلة'
      }
    ]
  }
];

export const INITIAL_COURSES: Course[] = [
  // 1. المبرمج الصغير (Little Programmer)
  {
    id: 'c-junior-prog',
    code: 'SMART-PROG-1',
    titleAr: 'كورس المبرمج الصغير (Little Programmer)',
    titleEn: 'Little Programmer Course (Scratch & Pictoblox)',
    category: 'programming',
    ageMin: 6,
    ageMax: 9,
    originalPrice: 2700,
    discountPrice: 2200,
    summer3MonthsPrice: 2200,
    monthlyPrice: 900,
    currency: 'EGP',
    startDate: '2026-09-01',
    durationWeeks: 12,
    sessionsCount: 24,
    sessionMinutes: 120,
    descriptionAr: 'منهج ممتع للأطفال لبناء التفكير البرمجي والصنع التفاعلي عبر اللعب والتحدي بدلاً من الشرح التجريدي. يتعلم الأطفال خوارزميات التفكير والكتل المرئية مع Scratch وPictoblox.',
    descriptionEn: 'Interactive play-based coding curriculum. Build Scratch games, storytelling, and problem-solving logic.',
    learningOutcomesAr: [
      'فهم التفكير الحاسوبي: المدخلات، المخرجات، والخوارزميات',
      'بناء المنطق البرمجي (التسلسل، الشروط، الحلقات، والأحداث)',
      'تصميم شخصيات وأصوات وألعاب تفاعلية كاملة بـ Scratch',
      'إنجاز كارتون أو لعبة تفاعلية بالمشروع النهائي'
    ],
    learningOutcomesEn: [
      'Master computational thinking: Inputs, Outputs, Algorithms',
      'Understand loops, variables, conditions, and event triggers',
      'Design full 2D Scratch games with custom sound effects',
      'Create a final showcase interactive story or game'
    ],
    skills: ['Scratch', 'Pictoblox', 'Logic', 'Game Design', 'Algorithms'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    levelAr: 'مبتدئ',
    featured: true,
    interests: ['gaming_coding', 'computer_workplace'],
    tags: ['Little Programmer', 'Programming', 'Gaming', 'Technology', 'Problem Solving'],
    recommendation_weight: 95
  },

  // 2. مبرمج المستقبل (Future Programmer)
  {
    id: 'c-future-prog',
    code: 'SMART-PROG-2',
    titleAr: 'كورس مبرمج المستقبل (Future Programmer)',
    titleEn: 'Future Programmer Course (Scratch + AI + Apps)',
    category: 'programming',
    ageMin: 9,
    ageMax: 14,
    originalPrice: 3000,
    discountPrice: 2500,
    summer3MonthsPrice: 2500,
    monthlyPrice: 1000,
    currency: 'EGP',
    startDate: '2026-09-01',
    durationWeeks: 12,
    sessionsCount: 24,
    sessionMinutes: 120,
    descriptionAr: 'المستوى الأعلى المتقدم للأبناء فوق 9 سنوات. يجمع بين البرمجة المتقدمة وتطوير تطبيقات الموبايل الحقيقية للأندرويد وتطبيقات الرؤية الحاسوبية والذكاء الاصطناعي.',
    descriptionEn: 'Advanced coding for 9+ kids. Build Android mobile apps, computer vision games, and AI Mini-Projects.',
    learningOutcomesAr: [
      'احتراف أساسيات ومفاهيم البرمجة المتقدمة والدوال (Functions)',
      'بناء ألعاب تفاعلية ذات درجات مستويات وسكور معقد',
      'تطوير تطبيقات موبايل أندرويد حقيقية بـ MIT App Inventor',
      'مقدمة عملية لمفاهيم الذكاء الاصطناعي والتوليد الذكي'
    ],
    learningOutcomesEn: [
      'Master advanced coding logic, variables & functions',
      'Build multi-level games with complex physics & scores',
      'Develop mobile Android apps using MIT App Inventor',
      'Apply Computer Vision & Generative AI concepts'
    ],
    skills: ['Scratch Advanced', 'App Inventor', 'Computer Vision', 'Python Intro', 'AI Concepts'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    levelAr: 'متوسط إلى متقدم',
    featured: true,
    interests: ['gaming_coding', 'ai'],
    tags: ['Future Programmer', 'Programming', 'Mobile Apps', 'AI', 'Gaming'],
    recommendation_weight: 92
  },

  // 3. المهندس الصغير (LEGO Robotics)
  {
    id: 'c-lego-robot',
    code: 'SMART-ROB-1',
    titleAr: 'كورس المهندس الصغير (LEGO Robotics)',
    titleEn: 'Little Engineer LEGO Robotics Course',
    category: 'robotics',
    ageMin: 4,
    ageMax: 8,
    originalPrice: 2700,
    discountPrice: 2200,
    summer3MonthsPrice: 2200,
    monthlyPrice: 900,
    currency: 'EGP',
    durationWeeks: 12,
    sessionsCount: 24,
    sessionMinutes: 120,
    descriptionAr: 'مثالي للطفل الشغوف بالفك والتركيب! يتعلم الطفل التفكير الهندسي والميكانيكا والتروس والمحركات عبر بناء مجسمات LEGO ميكانيكية وحساسات حركة.',
    descriptionEn: 'Hands-on LEGO robot construction, mechanics, gear ratios, and fun block programming for kids aged 4-8.',
    learningOutcomesAr: [
      'فهم التفكير الهندسي: التفكيك، التركيب، والتوازن',
      'التعرف على التروس والمحركات والحساسات الميكانيكية',
      'تركيب روبوتات LEGO وسيارات متحركة ذكية',
      'تطوير العقلية الهندسية الشاملة Engineering Mindset'
    ],
    learningOutcomesEn: [
      'Master mechanical thinking: Assembly, balance, gears',
      'Learn motor controls, distance & color sensors',
      'Assemble movable LEGO cars and robotic arms',
      'Develop a strong engineering problem-solving mindset'
    ],
    skills: ['LEGO Robotics', 'Sensors', 'Mechanical Gears', 'Engineering Logic'],
    mode: 'Center',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    levelAr: 'مبتدئ',
    featured: true,
    interests: ['robotics_assembly'],
    tags: ['LEGO Robotics', 'STEM', 'Mechanics', 'Building', 'Engineering'],
    recommendation_weight: 90
  },

  // 4. مهندس المستقبل (Electronics + Arduino)
  {
    id: 'c-future-engineer',
    code: 'SMART-ROB-2',
    titleAr: 'كورس مهندس المستقبل (إلكترونيات + روبوتات + أردوينو)',
    titleEn: 'Future Engineer Electronics & Arduino Course',
    category: 'electronics',
    ageMin: 9,
    ageMax: 16,
    originalPrice: 3300,
    discountPrice: 2500,
    summer3MonthsPrice: 2500,
    monthlyPrice: 1100,
    currency: 'EGP',
    durationWeeks: 12,
    sessionsCount: 24,
    sessionMinutes: 120,
    kitPrice: 1500,
    kitNameAr: 'حقيبة المكونات الإلكترونية والأردوينو الميدانية',
    descriptionAr: 'المسار الهندسي المتقدم. يتضمن الدوائر الكهربائية، المكونات، المقاومات، الشريحة الذكية Arduino Uno، الحساسات، والربط مع ESP32 والإنترنت IoT.',
    descriptionEn: 'Electronics, circuit design, Arduino C++, microcontrollers, robotics, and ESP32 IoT Smart Home systems.',
    learningOutcomesAr: [
      'فهم الجهد الكهربائي، المقاومة، وتركيب الدوائر على Breadboard',
      'كتابة أكواد C++ للتحكم بالمحركات وحساسات الصوت والمطر',
      'بناء روبوت تفادي العوائق وتتبع الخطوط بالأصابع',
      'بناء نموذج مصغر لمنزل ذكي متحكم به من الموبايل IoT'
    ],
    learningOutcomesEn: [
      'Understand voltage, current, and breadboard wiring',
      'Write C++ microcontroller code for motors & sensors',
      'Assemble line follower & obstacle avoiding robots',
      'Build smart home IoT projects controlled via mobile'
    ],
    skills: ['Arduino', 'C++', 'Electronics', 'ESP32', 'IoT', 'Sensors'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    levelAr: 'متوسط إلى احترافي',
    featured: true,
    interests: ['electronics_hardware', 'robotics_assembly'],
    tags: ['Arduino', 'Electronics', 'Robotics', 'STEM', 'IoT', 'Hardware'],
    recommendation_weight: 94
  },

  // 5. تحسين الخط العربي والإنجليزي
  {
    id: 'c-handwriting',
    code: 'SMART-ART-1',
    titleAr: 'كورس تحسين الخط العربي والإنجليزي (Handwriting Improvement)',
    titleEn: 'Arabic & English Handwriting Improvement',
    category: 'arts',
    ageMin: 4,
    ageMax: 14,
    originalPrice: 2100,
    discountPrice: 1750,
    summer3MonthsPrice: 1750,
    monthlyPrice: 700,
    currency: 'EGP',
    durationWeeks: 12,
    sessionsCount: 24,
    sessionMinutes: 90,
    descriptionAr: 'برنامج متخصص لتحسين جودة وسرعة ومحاذاة الكتابة اليدوية باللغتين العربية والإنجليزية. يساعد الطلاب الصغار على الثقة والجمال الخطوط والمحاذاة السليمة.',
    descriptionEn: 'Dedicated program for enhancing letter formation, spacing, speed, and handwriting elegance in Arabic and English.',
    learningOutcomesAr: [
      'ضبط مسكة القلم والوضعية السليمة للكتابة',
      'تحسين اتصالات الحروف العربية ورسم حروف النسخ والرقعة',
      'إتقان الخط الإنجليزي Cursive والـ Print بوضوح',
      'زيادة سرعة الكتابة والترتيب والنظافة في الدفاتر'
    ],
    learningOutcomesEn: [
      'Correct pen grip, posture, and line alignment',
      'Master Arabic letter connectors & calligraphic strokes',
      'Enhance English cursive & print writing legibility',
      'Boost writing speed and neatness in school notebooks'
    ],
    skills: ['Handwriting', 'Arabic Calligraphy', 'English Writing', 'Focus & Neatness'],
    mode: 'Center',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80',
    levelAr: 'تأسيسي',
    interests: ['design_graphics', 'languages_english'],
    tags: ['Handwriting', 'Arabic', 'English', 'Calligraphy', 'Kids Skills'],
    recommendation_weight: 80
  },

  // 6. الرسم والأعمال الفنية (4–8 سنوات)
  {
    id: 'c-drawing-kids',
    code: 'SMART-ART-2',
    titleAr: 'كورس الرسم والأعمال الفنية للأطفال (4–8 سنوات)',
    titleEn: 'Kids Fine Arts & Creative Crafts (Ages 4-8)',
    category: 'arts',
    ageMin: 4,
    ageMax: 8,
    originalPrice: 2550,
    discountPrice: 2300,
    summer3MonthsPrice: 2300,
    monthlyPrice: 850,
    currency: 'EGP',
    durationWeeks: 12,
    sessionsCount: 12,
    sessionMinutes: 120,
    descriptionAr: 'تنمية التعبير الإبداعي والحس البصري لدى الصغار من خلال رسم الأشكال، دمج الألوان المائية والأكريليك، والأعمال اليدوية المبتكرة بصورة ممتعة.',
    descriptionEn: 'Nurture young artistic imagination with hands-on painting, color mixing, watercoloring, and fun craft creation.',
    learningOutcomesAr: [
      'فهم الأشكال الأساسية، الخطوط، وتناسق الألوان',
      'الرسم بالألوان المائية والخشبية الشمعية',
      'صناعة أشغال يدوية ومجسمات فنية مبتكرة',
      'تطوير قدرات السرد البصري والتعبير عن الذات'
    ],
    learningOutcomesEn: [
      'Understand basic shapes, lines, and color harmony',
      'Master watercolors, oil pastels, and pencil sketching',
      'Create 3D papercrafts and creative art projects',
      'Build confidence in artistic visual storytelling'
    ],
    skills: ['Drawing', 'Painting', 'Color Theory', 'Crafts', 'Creative Expression'],
    mode: 'Center',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    levelAr: 'مبتدئ',
    featured: true,
    interests: ['design_graphics'],
    tags: ['Drawing', 'Fine Arts', 'Crafts', 'Colors', 'Kids Art'],
    recommendation_weight: 88
  },

  // 7. الرسم الاحترافي للكبار (9 سنوات فأكثر)
  {
    id: 'c-drawing-pro',
    code: 'SMART-ART-3',
    titleAr: 'كورس الرسم الاحترافي والفنون الجملية (9 سنوات فأكثر)',
    titleEn: 'Professional Fine Arts & Drawing (Ages 9+)',
    category: 'arts',
    ageMin: 9,
    ageMax: 50,
    originalPrice: 2850,
    discountPrice: 2500,
    summer3MonthsPrice: 2500,
    monthlyPrice: 950,
    currency: 'EGP',
    durationWeeks: 12,
    sessionsCount: 12,
    sessionMinutes: 120,
    descriptionAr: 'مسار احترافي يتدرج من المبتدئ إلى المتقدم. يتضمن النسب والتظليل والمنظور الهندسي والرسم بالفحم والألوان الزيتية ورسم البورتريه.',
    descriptionEn: 'Step-by-step masterclass covering light & shadow, perspective, charcoal, portraiture, and acrylic painting.',
    learningOutcomesAr: [
      'دراسة النسب الشائعة، التظليل، وإبراز الضوء والظل',
      'إتقان المنظور الهندسي والطبيعة الصامتة (Still Life)',
      'الرسم بأقلام الفحم والرصاص والألوان الزيتية',
      'رسم الوجوه والبورتريه وإنجاز معرض فني شخصي'
    ],
    learningOutcomesEn: [
      'Master object proportions, shading, light & shadow',
      'Understand perspective rules and Still Life composition',
      'Work with charcoal, graphite, and oil paints',
      'Render human portraits and assemble a personal portfolio'
    ],
    skills: ['Fine Arts', 'Portraiture', 'Shading', 'Perspective', 'Charcoal & Oil'],
    mode: 'Center',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    levelAr: 'مبتدئ إلى احترافي',
    interests: ['design_graphics'],
    tags: ['Drawing', 'Fine Arts', 'Portrait', 'Oil Painting', 'Shading'],
    recommendation_weight: 85
  },

  // 8. الحساب الذهني + Math + IQ
  {
    id: 'c-math-iq',
    code: 'SMART-STEM-1',
    titleAr: 'برنامج الحساب الذهني + الرياضيات + الـ IQ',
    titleEn: 'Mental Math, Abacus & IQ Brain Program',
    category: 'stem',
    ageMin: 5,
    ageMax: 14,
    originalPrice: 2850,
    discountPrice: 2500,
    summer3MonthsPrice: 2500,
    monthlyPrice: 950,
    currency: 'EGP',
    durationWeeks: 12,
    sessionsCount: 12,
    sessionMinutes: 90,
    descriptionAr: 'برنامج تنمية مهارات الدماغ الشامل. يتضمن الحساب الذهني السريع بالعداد الصيني، تأسيس المفاهيم الرياضياتية، وحل ألغاز الـ IQ لزيادة التركيز والسرعة.',
    descriptionEn: 'Brain expansion program combining Abacus speed calculation, mathematics foundation, and spatial IQ logic puzzles.',
    learningOutcomesAr: [
      'إجراء العمليات الحسابية المعقدة في ثوانٍ بدون حاسبة',
      'تطوير التفكير التخيلي والذاكرة البصرية الفائقة',
      'تأسيس المفاهيم الرياضياتية وحل المسائل اللفظية',
      'حل اختبارات الذكاء IQ والأنماط المنطقية المتتابعة'
    ],
    learningOutcomesEn: [
      'Perform rapid multi-digit mental math without calculators',
      'Enhance mental visualization and photographic memory',
      'Strengthen mathematical logic and word problem skills',
      'Solve IQ tests, pattern recognition, and spatial logic'
    ],
    skills: ['Mental Math', 'Abacus Speed', 'IQ Logic', 'Problem Solving', 'Focus'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80',
    levelAr: 'شامل لجميع المراحل',
    featured: true,
    interests: ['math_iq'],
    tags: ['Mental Math', 'Abacus', 'IQ', 'Logic', 'Brain Training'],
    recommendation_weight: 91
  },

  // 9. التنمية البشرية والإتيكيت
  {
    id: 'c-human-dev',
    code: 'SMART-DEV-1',
    titleAr: 'برنامج التنمية البشرية والإتيكيت وتطوير الذات',
    titleEn: 'Personal Development, Etiquette & Soft Skills',
    category: 'diploma',
    ageMin: 7,
    ageMax: 18,
    originalPrice: 2850,
    discountPrice: 2500,
    summer3MonthsPrice: 2500,
    monthlyPrice: 950,
    currency: 'EGP',
    durationWeeks: 12,
    sessionsCount: 12,
    sessionMinutes: 90,
    descriptionAr: 'برنامج بناء الشخصية القوية والمتزنة. يشمل الثقة بالنفس، فن التحدث والعرض، العمل الجماعي، الإتيكيت الاجتماعي، وإدارة الوقت وتحديد الأهداف.',
    descriptionEn: 'Character-building program focused on self-confidence, public speaking, social etiquette, teamwork, and goal setting.',
    learningOutcomesAr: [
      'تعزيز الثقة بالنفس والتحدث أمام الجمهور بجرأة',
      'إتقان قواعد الإتيكيت الاجتماعي وسلوكيات المائدة والتعامل',
      'مهارات العمل الجماعي والقيادة والمؤثرية الشخصية',
      'تنظيم الوقت وتحديد الأهداف وإدارة الضغوط'
    ],
    learningOutcomesEn: [
      'Boost self-confidence and public speaking presence',
      'Master social etiquette, body language, and manners',
      'Develop teamwork, leadership, and positive influence',
      'Learn time management, goal setting, and focus'
    ],
    skills: ['Public Speaking', 'Social Etiquette', 'Leadership', 'Confidence', 'Time Management'],
    mode: 'Center',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    levelAr: 'تطوير شخصي',
    interests: ['personal_growth', 'languages_english'],
    tags: ['Soft Skills', 'Etiquette', 'Leadership', 'Human Development', 'Confidence'],
    recommendation_weight: 84
  },

  // 10. English — 6 Levels
  {
    id: 'c-english-skills',
    code: 'SMART-ENG-1',
    titleAr: 'دورة اللغة الإنجليزية التفاعلية (6 مستويات متدرجة)',
    titleEn: 'Interactive English Language Program (A1 - C1)',
    category: 'english',
    ageMin: 6,
    ageMax: 60,
    originalPrice: 2850,
    discountPrice: 2500,
    summer3MonthsPrice: 2500,
    monthlyPrice: 950,
    currency: 'EGP',
    durationWeeks: 12,
    sessionsCount: 24,
    sessionMinutes: 90,
    descriptionAr: 'مسار لغوي متكامل يبدأ من A1 إلى C1. يركز على المحادثة الحية والطلاقة، النطق الصحيح، الاستماع، واستخدام الإنجليزية بثقة في الحياة والعمل.',
    descriptionEn: 'Full English fluency track (A1 Beginner to C1 Upper-Int). Speaking labs, phonics, grammar, and conversation.',
    learningOutcomesAr: [
      'التحدث بطلاقة وتجاوز عقبة التردد والخوف من الكلام',
      'تطوير النطق الصحيح الصوتيات Phonics والقواعد',
      'إدارة المحادثات والمقابلات باللغة الإنجليزية',
      'الاستعداد للاختبارات والدراسات الدولية'
    ],
    learningOutcomesEn: [
      'Achieve fluent conversational English confidence',
      'Master correct phonics pronunciation & practical grammar',
      'Excel in English interviews and professional dialogues',
      'Prepare for international language tests'
    ],
    skills: ['English Conversation', 'Fluency', 'Phonics', 'Grammar', 'Public Speaking'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
    levelAr: 'جميع المستويات A1–C1',
    featured: true,
    interests: ['languages_english'],
    tags: ['English', 'Fluency', 'Languages', 'Conversation', 'Phonics'],
    recommendation_weight: 89
  },

  // 11. Digital Employee Diploma
  {
    id: 'c-digital-emp',
    code: 'SMART-DIP-1',
    titleAr: 'دبلومة الموظف الرقمي الشامل (Digital Employee)',
    titleEn: 'Comprehensive Digital Employee Diploma',
    category: 'diploma',
    ageMin: 14,
    ageMax: 60,
    originalPrice: 3500,
    discountPrice: 2200,
    durationWeeks: 6,
    sessionsCount: 16,
    sessionMinutes: 180,
    descriptionAr: 'برنامج الموظف الرقمي الشامل لإعداد الشخص لسوق العمل الحديث. يتضمن الويندوز، الأوفيس (Word, Excel, PowerPoint)، أدوات Google السحابية، الإيميل، واستخدام AI.',
    descriptionEn: 'Intensive 1.5 months diploma. Master Windows, Office, Google Workspace, fast typing, and AI office tools.',
    learningOutcomesAr: [
      'احتراف إنشاء المستندات والتقارير بـ Word برمجياً',
      'تصميم جداول البيانات والرموز الحسابية المعقدة بـ Excel',
      'إنشاء العروض التقديمية التفاعلية بـ PowerPoint',
      'إدارة الملفات السحابية بـ Google Workspace والذكاء الاصطناعي'
    ],
    learningOutcomesEn: [
      'Master professional document formatting in Word',
      'Build automated spreadsheets and formulas in Excel',
      'Design high-converting presentations in PowerPoint',
      'Manage cloud team workflows in Google Workspace & AI'
    ],
    skills: ['Excel', 'Word', 'PowerPoint', 'Google Drive', 'Business AI', 'Fast Typing'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    levelAr: 'شامل من الصفر',
    featured: true,
    interests: ['computer_workplace', 'business_marketing'],
    tags: ['Digital Employee', 'Office', 'Excel', 'Google Workspace', 'Workplace AI'],
    recommendation_weight: 96
  },

  // 12. AI Animated Drawing
  {
    id: 'c-ai-animation',
    code: 'SMART-DIP-2',
    titleAr: 'دبلومة تصميم الرسوم المتحركة بالذكاء الاصطناعي',
    titleEn: 'AI Animated Drawing & Filmmaking Diploma',
    category: 'ai',
    ageMin: 12,
    ageMax: 50,
    originalPrice: 5000,
    discountPrice: 2500,
    durationWeeks: 12,
    sessionsCount: 12,
    sessionMinutes: 180,
    descriptionAr: 'تحويل الأفكار والنصوص والصور إلى أفلام كرتونية ورسوم متحركة كاملة باستخدام أحدث أدوات توليد الفيديوهات والصوتيات بالذكاء الاصطناعي.',
    descriptionEn: '3-month program. Turn prompts and artwork into full-blown animated videos, voiceovers, and movie scenes using AI.',
    learningOutcomesAr: [
      'توليد شخصيات ثابتة ومتناسقة المشاهد بـ Midjourney',
      'تحريك الصور وإنتاج مشاهد سينمائية بـ Runway & Luma',
      'توليد الدبلجة والأصوات البشرية السينمائية بـ ElevenLabs',
      'إنتاج كليب أو فيديو كارتوني كامل للمشروع النهائي'
    ],
    learningOutcomesEn: [
      'Generate character consistency across scenes with AI',
      'Animate still art into generative video scenes',
      'Synthesize realistic cinematic voiceovers',
      'Produce a complete AI animated short film'
    ],
    skills: ['AI Animation', 'Midjourney', 'ElevenLabs', 'Runway', 'Generative Video'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    levelAr: 'احترافي',
    interests: ['ai', 'photography_video', 'design_graphics'],
    tags: ['AI Animation', 'AI Art', 'Filmmaking', 'Generative Video', 'Storytelling'],
    recommendation_weight: 93
  },

  // 13. AI Mastery Diploma
  {
    id: 'c-ai-mastery',
    code: 'SMART-DIP-3',
    titleAr: 'دبلومة احتراف الذكاء الاصطناعي (AI Mastery Diploma)',
    titleEn: 'AI Mastery & Productivity Diploma',
    category: 'ai',
    ageMin: 14,
    ageMax: 60,
    originalPrice: 5000,
    discountPrice: 2500,
    durationWeeks: 4,
    sessionsCount: 8,
    sessionMinutes: 180,
    descriptionAr: 'دورة مكثفة تغطي أحدث تطبيقات الذكاء الاصطناعي التوليدي والهندسة المتقدمة للأوامر (Prompt Engineering)، أتمتة الأعمال، وصناعة الوسائط المتعددة.',
    descriptionEn: 'Intensive 1-month diploma covering ChatGPT, Claude, Midjourney, Make automation, and AI business productivity.',
    learningOutcomesAr: [
      'إتقان هندسة الأوامر Mappings & Prompt Engineering',
      'إنتاج الصور والتصاميم عالية الجودة والتأثيرات',
      'أتمتة الأعمال والربط التلقائي بين البرامج',
      'استخدام AI في البرمجة وكتابة المحتوى والتحليل'
    ],
    learningOutcomesEn: [
      'Master advanced Prompt Engineering logic',
      'Generate commercial visual & marketing assets',
      'Automate business workflows with Make & Zapier',
      'Utilize AI for code generation and data analysis'
    ],
    skills: ['ChatGPT', 'Claude 3.5', 'Midjourney', 'Prompting', 'Business Automation'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    levelAr: 'متقدم',
    featured: true,
    interests: ['ai', 'business_marketing'],
    tags: ['AI Mastery', 'ChatGPT', 'Prompt Engineering', 'Automation', 'Productivity'],
    recommendation_weight: 98
  },

  // 14. Digital Content Production + CapCut
  {
    id: 'c-capcut-mastery',
    code: 'SMART-DIP-4',
    titleAr: 'دبلومة صناعة المحتوى والمونتاج CapCut Pro',
    titleEn: 'Digital Content Creation & CapCut Editing',
    category: 'diploma',
    ageMin: 12,
    ageMax: 50,
    originalPrice: 3500,
    discountPrice: 2500,
    durationWeeks: 4,
    sessionsCount: 8,
    sessionMinutes: 180,
    descriptionAr: 'احتراف صناعة المحتوى والمونتاج والتصوير بالموبايل. يتضمن إعداد السكريبت، قواعد التصوير، احتراف CapCut Pro، الموثرات والانتقالات وصناعة الريلز.',
    descriptionEn: 'Mobile cinematography, scriptwriting, CapCut Pro editing, sound design, and viral social media Reels creation.',
    learningOutcomesAr: [
      'كتابة سكريبت المحتوى والـ Hooks المؤثرة',
      'إتقان قواعد التصوير والإضاءة بالموبايل',
      'المونتاج الاحترافي ببرنامج CapCut Pro للموبايل والكمبيوتر',
      'إنتاج فيديوهات جاهزة للنشر على TikTok و Reels'
    ],
    learningOutcomesEn: [
      'Write viral video scripts & engaging hooks',
      'Master mobile camera angles & lighting setups',
      'Advanced video editing with CapCut Pro desktop/mobile',
      'Produce broadcast-ready YouTube shorts and Reels'
    ],
    skills: ['CapCut Pro', 'Video Editing', 'Content Creation', 'Mobile Cinematography'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    levelAr: 'جميع المستويات',
    interests: ['photography_video', 'content_creation'],
    tags: ['CapCut', 'Video Editing', 'Reels', 'Content Creation', 'Social Media'],
    recommendation_weight: 91
  },

  // 15. Graphics Master Diploma
  {
    id: 'c-graphics-master',
    code: 'SMART-DIP-5',
    titleAr: 'دبلومة الجرافيك الشاملة (Graphics Master Diploma)',
    titleEn: 'Graphics Master Diploma (Photoshop, Illustrator, InDesign)',
    category: 'arts',
    ageMin: 14,
    ageMax: 60,
    originalPrice: 4500,
    discountPrice: 3500,
    durationWeeks: 8,
    sessionsCount: 16,
    sessionMinutes: 180,
    descriptionAr: 'الدبلومة الاحترافية للتصميم الجرافيكي. تشمل أدوات Adobe الثلاثة الرئيسية (Photoshop + Illustrator + InDesign) مع 6+ ورش عمل إعلانية وتصميم الهويات البصرية.',
    descriptionEn: '2 months intensive design masterclass covering Photoshop photo editing, Illustrator vector logos, and InDesign print publication.',
    learningOutcomesAr: [
      'تعديل ومعالجة الصور الاحترافية بـ Photoshop',
      'رسم الشعارات والرسوم المتجهة بـ Illustrator',
      'تنسيق الكتب والمطبوعات بـ InDesign',
      'بناء هوية بصرية تجارية متكاملة (Brand Identity)'
    ],
    learningOutcomesEn: [
      'Master photo retouching & composition in Photoshop',
      'Design vector logos and branding assets in Illustrator',
      'Layout multi-page brochures and magazines in InDesign',
      'Deliver a complete commercial Brand Identity project'
    ],
    skills: ['Photoshop', 'Illustrator', 'InDesign', 'Branding', 'Graphic Design'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    levelAr: 'احترافي',
    featured: true,
    interests: ['design_graphics'],
    tags: ['Graphics Master', 'Photoshop', 'Illustrator', 'Branding', 'Design'],
    recommendation_weight: 95
  },

  // 16. E-Marketing Diploma
  {
    id: 'c-digital-marketing',
    code: 'SMART-DIP-6',
    titleAr: 'دبلومة التسويق الإلكتروني الشاملة (E-Marketing)',
    titleEn: 'E-Marketing & Digital Media Diploma',
    category: 'business',
    ageMin: 16,
    ageMax: 60,
    originalPrice: 5500,
    discountPrice: 4000,
    durationWeeks: 8,
    sessionsCount: 16,
    sessionMinutes: 180,
    descriptionAr: 'برنامج التسويق الرقمي الشامل. يغطي استراتيجيات السوق، كتابة الإعلانات، تصميم Canva Pro، إدارة منصات التواصل، وإطلاق الحملات الممولة المدفوعة وتحليل النتائج.',
    descriptionEn: 'Complete digital marketing system. Marketing funnels, Canva Pro design, social media management, paid ads, and campaign analytics.',
    learningOutcomesAr: [
      'تحديد العميل المستهدف وبناء القمع التسويقي Marketing Funnel',
      'تصميم الإعلانات والمحتوى البصري بـ Canva Pro',
      'إدارة منصات Facebook, IG, TikTok, Google Ads',
      'إطلاق ومتابعة الحملات الممولة وإخراج تقارير الأداء'
    ],
    learningOutcomesEn: [
      'Define buyer personas & build high-converting marketing funnels',
      'Design marketing ad creatives with Canva Pro',
      'Manage multi-platform social media channels',
      'Launch paid ad campaigns & optimize ROI metrics'
    ],
    skills: ['Digital Marketing', 'Paid Ads', 'Canva Pro', 'Copywriting', 'SEO', 'Analytics'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    levelAr: 'متقدم',
    interests: ['business_marketing', 'content_creation'],
    tags: ['E-Marketing', 'Digital Marketing', 'Paid Ads', 'Social Media', 'Canva'],
    recommendation_weight: 90
  },

  // 17. AI Junior Explorer
  {
    id: 'c-ai-junior',
    code: 'SMART-KID-3',
    titleAr: 'كورس استكشاف الذكاء الاصطناعي للناشئين (AI Junior)',
    titleEn: 'AI Junior Explorer & Machine Learning Kids',
    category: 'ai',
    ageMin: 8,
    ageMax: 14,
    originalPrice: 2850,
    discountPrice: 2500,
    summer3MonthsPrice: 2500,
    monthlyPrice: 950,
    currency: 'EGP',
    durationWeeks: 12,
    sessionsCount: 12,
    sessionMinutes: 120,
    descriptionAr: 'دورة تفاعلية مبسطة لتدريب الآلات والأطفال على مفاهيم الذكاء الاصطناعي، التعرف على الصور والأصوات والإيماءات، وتوليد الفنون بالأوامر الذكية.',
    descriptionEn: 'Fun hands-on AI course for young minds. Machine learning models, Teachable Machine, voice recognition, and generative AI art.',
    learningOutcomesAr: [
      'فهم كيفية تدريب الكمبيوتر على التعلم الآلي Machine Learning',
      'تدريب الكاميرا على التعرف على الوجوه والإشارات بـ Teachable Machine',
      'توليد الفنون والقصص المصورة بالأوامر النصية Prompts',
      'بناء تطبيق مساعد ذكي يجيب عن أسئلة الطالب'
    ],
    learningOutcomesEn: [
      'Understand how machines learn from data and samples',
      'Train vision models for gesture and face recognition',
      'Generate stories and creative artwork with AI prompts',
      'Build a voice-assisted AI study buddy app'
    ],
    skills: ['AI Concepts', 'Teachable Machine', 'Prompt Engineering', 'Generative Media'],
    mode: 'Hybrid',
    branchNameAr: 'فرع زيزينيا - الإسكندرية',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    levelAr: 'استكشافي',
    interests: ['ai', 'gaming_coding'],
    tags: ['AI Junior', 'Machine Learning', 'AI for Kids', 'Prompting', 'Innovation'],
    recommendation_weight: 87
  }
];

export const INITIAL_BADGES: Badge[] = [
  { id: 'badge-1', titleAr: 'المبرمج الأول', titleEn: 'First Program', descriptionAr: 'أكملت أول كود برمجي بنجاح!', descriptionEn: 'Completed your very first code snippet!', icon: 'Code', category: 'programming' },
  { id: 'badge-2', titleAr: 'سيد سكراتش', titleEn: 'Scratch Master', descriptionAr: 'أتقنت صناعة الألعاب في بيئة Scratch', descriptionEn: 'Mastered building games in Scratch', icon: 'Gamepad2', category: 'programming' },
  { id: 'badge-3', titleAr: 'مستكشف AI', titleEn: 'AI Explorer', descriptionAr: 'دربت أول نموذج ذكاء اصطناعي تفاعلي', descriptionEn: 'Trained your first custom AI model', icon: 'Sparkles', category: 'ai' },
  { id: 'badge-4', titleAr: 'باني الروبوت', titleEn: 'Robot Builder', descriptionAr: 'جمعت وبرمجت روبوت LEGO حقيقي', descriptionEn: 'Assembled and programmed a physical robot', icon: 'Bot', category: 'robotics' },
  { id: 'badge-5', titleAr: 'مهندس أردوينو', titleEn: 'Arduino Engineer', descriptionAr: 'شغلت دائرة كهربائية ذكية بحساسات', descriptionEn: 'Powered up a micro-controller circuit with sensors', icon: 'Zap', category: 'electronics' },
  { id: 'badge-6', titleAr: 'المخترع الصغير', titleEn: 'Young Inventor', descriptionAr: 'نشرت مشروعاً كاملاً في معرض SmartTech', descriptionEn: 'Published a complete project in SmartTech showcase', icon: 'Award', category: 'general' }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    titleAr: 'المهمة 01 — إنقاذ الروبوت التائه',
    titleEn: 'Mission 01 — Save the Stranded Robot',
    pathId: 'junior-programmer',
    xpReward: 300,
    type: 'scratch',
    descriptionAr: 'الروبوت متوقف أمام عقبة! أضف كود الحساس للتعرف على المسافة والالتفاف بـ90 درجة.',
    descriptionEn: 'The robot is stopped at an obstacle! Add the distance sensing block to make it turn 90 degrees.',
    hintsAr: [
      'هل تحققت من الشرط IF Distance < 20؟',
      'تأكد من اختيار كتلة Turn Right 90 degrees.',
      'افحص حلقة Repeat Until Reached.'
    ],
    goalAr: 'اجعل الروبوت يصل إلى النقطة الخضراء بسلام.',
    isCompleted: false
  },
  {
    id: 'm2',
    titleAr: 'المهمة 02 — تشغيل مستشعر الإضاءة الذكي',
    titleEn: 'Mission 02 — Smart LDR Night Light',
    pathId: 'future-engineer',
    xpReward: 500,
    type: 'arduino',
    descriptionAr: 'قم بتوصيل LED وحساس الضوء LDR على لوحة الأردوينو واضبط الكود ليضيء تلقائياً عند إظلام الغرفة.',
    descriptionEn: 'Wire an LED and LDR sensor on Arduino breadboard, setting code to auto-turn on LED in pitch dark.',
    hintsAr: [
      'قم بتوصيل الطرف الموجب لـLED بالمنفذ الرقمي D13.',
      'اقرأ القيمة التناظرية من AnalogPin A0.',
      'اختر القيمة الحدية Threshold < 300 للتشغيل.'
    ],
    goalAr: 'تشغيل المحاكاة ورؤية الضوء يشتعل تلقائياً.',
    isCompleted: false
  },
  {
    id: 'm3',
    titleAr: 'المهمة 03 — تدريب نموذج التعرف على الإشارات',
    titleEn: 'Mission 03 — Train AI Hand Gesture Recognizer',
    pathId: 'ai-creator',
    xpReward: 400,
    type: 'ai_training',
    descriptionAr: 'التقط 5 صور لقبضة اليد و5 صور لليد المفتوحة ودرب النموذج ثم اختبر النتيجة!',
    descriptionEn: 'Capture 5 samples of Fist and 5 samples of Open Palm, train AI model and test classification live!',
    hintsAr: [
      'تأكد من ثبات الإضاءة أثناء التقاط العينات.',
      'درب النموذج لمدة 10 Epochs.',
      'اختبر الاستجابة بالكاميرا الحية.'
    ],
    goalAr: 'الوصول إلى دقة تصنيف أعلى من 90%.',
    isCompleted: false
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-smarttech-main',
    nameAr: 'سمارتك للتدريب المتطور — المقر الرئيسي والسنتر التدريبي المعملي',
    nameEn: 'SmartTech for Advanced Training — Main Headquarters & Training Lab',
    addressAr: 'سمارتك للتدريب المتطور، زيزينيا / الإسكندرية، مصر',
    addressEn: 'SmartTech for Advanced Training, Zizinia, Alexandria, Egypt',
    phone: '01024434357',
    availableSeats: 20,
    maxCapacity: 25,
    workingHoursAr: 'يومياً من 10:00 صباحاً حتى 10:00 مساءً',
    googleMapsUrl: 'https://www.google.com/maps/place/%D8%B3%D9%85%D8%A7%D8%B1%D8%AA%D9%83+%D9%84%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8+%D8%A7%D9%84%D9%8AA%D8%AA%D8%B7%D9%88%D8%B1%E2%80%AD%E2%80%AD/@31.2401598,29.9635953,17z/data=!4m2!3m1!1s0x14f5c513a27e37ed:0xee5386b29ced202e',
    lat: 31.2401598,
    lng: 29.9635953
  },
  {
    id: 'br-online',
    nameAr: 'الفصل الرقمي المباشر (أونلاين عبر الفصول التفاعلية Live Stream)',
    nameEn: 'SmartTech Digital Interactive Campus (Online Live)',
    addressAr: 'فصول افتراضية تفاعلية مباشرة مع المدربين عبر المنصة',
    addressEn: 'Interactive Live Virtual Classrooms via Platform',
    phone: '01024434357',
    availableSeats: 50,
    maxCapacity: 100,
    workingHoursAr: 'حسب مواعيد المجموعات والدورات المتاحة',
    googleMapsUrl: 'https://www.google.com/maps/place/%D8%B3%D9%85%D8%A7%D8%B1%D8%AA%D9%83+%D9%84%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8+%D8%A7%D9%84%D9%8AA%D8%AA%D8%B7%D9%88%D8%B1%E2%80%AD%E2%80%AD/@31.2401598,29.9635953,17z/data=!4m2!3m1!1s0x14f5c513a27e37ed:0xee5386b29ced202e',
    lat: 31.2401598,
    lng: 29.9635953
  }
];

export const INITIAL_STORE_ITEMS: StoreItem[] = [
  {
    id: 'st-1',
    nameAr: 'حقيبة مكونات الإلكترونيات والأردوينو الشاملة (Arduino Ultimate Starter Kit)',
    nameEn: 'Arduino Ultimate Electronics Kit',
    price: 1500,
    originalPrice: 1800,
    descriptionAr: 'تتضمن لوحة Arduino Uno الأصلية + breadboard + حساسات مسافة وشاشة LCD وسيرفو موتور و200+ مكون إلكتروني.',
    descriptionEn: 'Includes Arduino Uno R3, breadboard, Ultrasonic sensor, Servo motors, LCD 16x2, jumper wires, resistors & LEDs.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    category: 'kits',
    inStock: true
  },
  {
    id: 'st-2',
    nameAr: 'مجموعة روبوت LEGO Mindstorms / Education للمبتكرين',
    nameEn: 'LEGO Educational Robotics Kit',
    price: 3500,
    originalPrice: 4200,
    descriptionAr: 'حقيبة قطع LEGO الهندسية مع المحركات وحساسات الحركة لبناء مجسمات وروبوتات ذكية متكاملة.',
    descriptionEn: 'Official LEGO educational building components, motors, color and distance sensors for kids robotics.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    category: 'robotics',
    inStock: true
  },
  {
    id: 'st-3',
    nameAr: 'شريحة ESP32 WiFi + Bluetooth لبناء مشاريع الإنترنت الأشياء IoT',
    nameEn: 'ESP32 Development Board for IoT',
    price: 450,
    originalPrice: 550,
    descriptionAr: 'مايكروكنترولر عالي السرعة مزود بالواي فاي والبلوتوث للربط مع الهاتف الذكي وتطبيقات الذكاء الاصطناعي.',
    descriptionEn: 'Dual-core ESP32 board with Wi-Fi & Bluetooth connectivity for smart home and AI IoT robotics.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    category: 'electronics',
    inStock: true
  }
];

export const INITIAL_PROJECTS: StudentProject[] = [
  {
    id: 'proj-1',
    titleAr: 'لعبة الفضاء والمتاهة التفاعلية',
    studentFirstName: 'أحمد',
    age: 8,
    courseTitleAr: 'المبرمج الصغير',
    skills: ['Scratch', 'Logic', 'Animations'],
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    likesCount: 34,
    createdAt: '2026-07-28'
  },
  {
    id: 'proj-2',
    titleAr: 'سيارة الروبوت ذاتية القيادة لتفادي العوائق',
    studentFirstName: 'يوسف',
    age: 11,
    courseTitleAr: 'مسار مهندس المستقبل',
    skills: ['Arduino', 'C++', 'Ultrasonic Sensor'],
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    likesCount: 52,
    createdAt: '2026-08-01'
  },
  {
    id: 'proj-3',
    titleAr: 'تطبيق للتعرف على الوجه ونبرة الصوت بالـAI',
    studentFirstName: 'سارة',
    age: 10,
    courseTitleAr: 'AI Creator',
    skills: ['Pictoblox', 'Computer Vision', 'Speech AI'],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
    likesCount: 48,
    createdAt: '2026-08-03'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-001',
    certificateCode: 'CERT-SMART-2026-8891',
    studentNameAr: 'أحمد محمد إبراهيم',
    studentNameEn: 'Ahmed Mohamed Ibrahim',
    courseTitleAr: 'دبلومة المبرمج الصغير والذكاء الاصطناعي',
    courseTitleEn: 'Junior Programmer & AI Diploma',
    issueDate: '2026-08-01',
    instructorNameAr: 'م. مصطفى العوضي',
    pathTitleAr: 'مسار المبرمج الصغير',
    qrUrl: '/verify/CERT-SMART-2026-8891'
  }
];
