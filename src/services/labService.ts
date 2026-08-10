import { 
  db 
} from '../firebase/config';
import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { 
  InteractiveLab, LabAttempt, StudentLabProgress, QuestionBankItem, QuestionPool,
  LabAccessRule, LabProjectSubmission
} from '../types';

const LABS_COLLECTION = 'interactive_labs';
const QUESTIONS_COLLECTION = 'question_bank';
const POOLS_COLLECTION = 'question_pools';
const ATTEMPTS_COLLECTION = 'lab_attempts';
const PROGRESS_COLLECTION = 'student_lab_progress';
const ACCESS_RULES_COLLECTION = 'lab_access_rules';
const PROJECTS_COLLECTION = 'lab_projects';

// INITIAL SEED LABS FOR DIGITAL EMPLOYEE AND AI COURSES
export const SEED_INTERACTIVE_LABS: InteractiveLab[] = [
  {
    id: 'lab-ai-prompt-engineering',
    courseId: 'digital-employee',
    unitId: 'unit-1',
    lessonId: 'lesson-1',
    learningPathIds: ['ai-creator', 'future-programmer'],
    titleAr: 'مختبر صياغة الأوامر واختبار نماذج AI (Prompt Engineering Lab)',
    titleEn: 'AI Prompt Engineering & Testing Lab',
    descriptionAr: 'تجربة تفاعلية لبناء وتقييم ومقارنة الأوامر الموجهة لنماذج الذكاء الاصطناعي مع قياس دقة الإجابة.',
    descriptionEn: 'Interactive workspace to build, test, and compare AI prompts with structured evaluation.',
    instructionsAr: '1. حدد الدور والهدف والسياق بالنموذج الهيكلي.\n2. اضغط على توليد واختبار لتقييم النتيجة مقابل المعايير.\n3. قارن النتيجة مع النموذج المطور.',
    type: 'AI_PROMPT_LAB',
    difficulty: 'BEGINNER',
    timeLimitMinutes: 20,
    maxAttempts: 3,
    passPercentage: 70,
    xpReward: 100,
    perfectScoreXpBonus: 30,
    status: 'PUBLISHED',
    version: 1,
    aiConfig: {
      systemPrompt: 'أنت مساعد ذكي لتعليم الأطفال صياغة الأوامر البرمجية بدقة.',
      targetRole: 'خبير برمجة وتكنولوجيا',
      targetContext: 'مؤسسة SmartTech لتدريب الناشئة',
      targetTask: 'إنشاء كود إضاءة لمبة LED بالذكاء الاصطناعي',
      allowedModels: ['gemini-3.6-flash', 'openai-gpt4o-proxy'],
      expectedKeywords: ['المدخلات', 'الشروط', 'النتيجة', 'LED']
    },
    createdBy: 'SYSTEM_ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lab-python-debugging',
    courseId: 'digital-employee',
    unitId: 'unit-2',
    lessonId: 'lesson-2',
    learningPathIds: ['future-programmer'],
    titleAr: 'مختبر اكتشاف وإصلاح أخطاء البرمجة (Python Debugging Challenge)',
    titleEn: 'Python Code Debugging Lab',
    descriptionAr: 'بيئة برمجية سريعة ومحمية لتشغيل كود بايثون، كشف الأخطاء وتحليل المخرجات البرمجية.',
    descriptionEn: 'Sandbox environment for debugging Python code and running test cases.',
    instructionsAr: 'افحص كود بايثون الموجود في المحرر، حدد خطأ التكرار Loop ثم صحح المتغير لتمرير الاختبارات.',
    type: 'CODE_CHALLENGE',
    difficulty: 'INTERMEDIATE',
    timeLimitMinutes: 15,
    maxAttempts: 5,
    passPercentage: 80,
    xpReward: 120,
    status: 'PUBLISHED',
    version: 1,
    codeConfig: {
      allowedLanguages: ['PYTHON', 'JAVASCRIPT'],
      defaultLanguage: 'PYTHON',
      initialCodeTemplate: `# كود بايثون لحساب مجموع أرقام التكرار\ncount = 0\nfor i in range(1, 6):\n    count = count + i\nprint("المجموع:", count)`,
      testCases: [
        { id: 'tc-1', input: 'range(1,6)', expectedOutput: 'المجموع: 15', isHidden: false, points: 50 }
      ],
      solutionCode: `count = 0\nfor i in range(1, 6):\n    count += i\nprint("المجموع:", count)`
    },
    createdBy: 'SYSTEM_ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lab-electronics-circuit',
    courseId: 'future-engineer',
    unitId: 'unit-1',
    lessonId: 'lesson-3',
    learningPathIds: ['future-engineer'],
    titleAr: 'مختبر المحاكاة التفاعلية لدوائر الإلكترونيات والآردوينو',
    titleEn: 'Arduino & Electronics Circuit Simulator Lab',
    descriptionAr: 'توصيل الليد والمقاومات مع بطارية وآردوينو برمجياً في دوائر حقيقية مع اختبار سريان التيار.',
    descriptionEn: 'Interactive circuit builder with real-time pin configuration and simulation testing.',
    instructionsAr: 'قم بسحب البطارية والليد والمقاومة وقم بتوصيل الأسلاك بالمنفذ 13 واختبر إضاءة الليد.',
    type: 'ELECTRONICS_SIMULATION',
    difficulty: 'BEGINNER',
    timeLimitMinutes: 25,
    maxAttempts: 3,
    passPercentage: 75,
    xpReward: 150,
    status: 'PUBLISHED',
    version: 1,
    electronicsConfig: {
      allowedComponents: ['LED', 'RESISTOR', 'BATTERY', 'BUTTON', 'ARDUINO_UNO', 'WIRES'],
      validationTarget: {
        requiredComponents: ['LED', 'BATTERY', 'RESISTOR'],
        requiredConnections: [
          { fromComp: 'BATTERY', fromPin: 'POS', toComp: 'RESISTOR', toPin: 'PIN1' },
          { fromComp: 'RESISTOR', fromPin: 'PIN2', toComp: 'LED', toPin: 'ANODE' }
        ]
      }
    },
    createdBy: 'SYSTEM_ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lab-business-simulation',
    courseId: 'digital-employee',
    unitId: 'unit-3',
    lessonId: 'lesson-1',
    learningPathIds: ['ai-creator'],
    titleAr: 'محاكي القرارات التجاريه والمشروع الرقمي (Business Simulation)',
    titleEn: 'Commercial & Tech Business Decision Simulation',
    descriptionAr: 'إدارة مركز تكنولوجيا افتراضي وتحديد أسعار المبيعات، التسويق، والخدمة لقياس صافي الأرباح.',
    descriptionEn: 'Interactive decision making simulation for tech project management and pricing.',
    instructionsAr: 'اتخذ قرارات التسعير، عدد الموظفين وميزانية التسويق ثم اضغط على تشغيل شهر المحاكاة لاستخراج النتيجة.',
    type: 'BUSINESS_SIMULATION',
    difficulty: 'INTERMEDIATE',
    timeLimitMinutes: 15,
    maxAttempts: 3,
    passPercentage: 70,
    xpReward: 130,
    status: 'PUBLISHED',
    version: 1,
    businessConfig: {
      scenarioTitleAr: 'إدارة أفرع مركز تدريب التكنولوجيا سمارتك',
      scenarioDescriptionAr: 'لديك رأس مال مبدئي 10,000 $، قم بضبط المتغيرات لتحقيق أرباح مستدامة وتقييم استجابة العملاء.',
      startingCapital: 10000,
      monthlyExpenses: 2000,
      variables: [
        { id: 'v-price', nameAr: 'سعر الاشتراك السنوي ($)', type: 'PRICING', defaultValue: 150, min: 50, max: 500 },
        { id: 'v-mkt', nameAr: 'ميزانية الإعلانات الشهرية ($)', type: 'MARKETING_BUDGET', defaultValue: 1000, min: 100, max: 5000 },
        { id: 'v-staff', nameAr: 'عدد مدربي الحاسوب', type: 'STAFF_COUNT', defaultValue: 3, min: 1, max: 10 }
      ],
      simulationRules: [
        { metricNameAr: 'عدد الطلاب الجدد', targetValue: 30, formulaDescriptionAr: '(ميزانية الإعلانات / 30) + (الجودة * 2)' },
        { metricNameAr: 'صافي الأرباح', targetValue: 2500, formulaDescriptionAr: '(الطلاب * سعر الاشتراك) - المصاريف' }
      ]
    },
    createdBy: 'SYSTEM_ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lab-design-canvas',
    courseId: 'digital-employee',
    unitId: 'unit-4',
    lessonId: 'lesson-2',
    learningPathIds: ['ai-creator'],
    titleAr: 'مختبر التصميم والرسم الرقمي والتلوين (Design & Canvas Lab)',
    titleEn: 'Digital Canvas & Graphic Design Lab',
    descriptionAr: 'منصة رسم متكاملة بالأدوات والأشكال والشعارات لتصميم بوستر أو شعار برلماني وتصديره.',
    descriptionEn: 'Interactive graphic design canvas with tools, layers, shapes, and export.',
    instructionsAr: 'قم بإنشاء شعار مبسط باستخدام الفرشاة والأشكال الهندسية ثم اكتب اسم مشروعك التكنولوجي.',
    type: 'DRAWING_DESIGN_LAB',
    difficulty: 'BEGINNER',
    timeLimitMinutes: 20,
    maxAttempts: 3,
    passPercentage: 80,
    xpReward: 90,
    status: 'PUBLISHED',
    version: 1,
    designConfig: {
      canvasWidth: 600,
      canvasHeight: 400,
      presetShapes: ['RECTANGLE', 'CIRCLE', 'STAR', 'TEXT'],
      allowImageUpload: true,
      requiredColors: ['#3B82F6', '#EF4444', '#10B981']
    },
    createdBy: 'SYSTEM_ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// --- LABS API / FIRESTORE SERVICES ---

export async function getLabsFromFirestore(courseId?: string, unitId?: string, lessonId?: string): Promise<InteractiveLab[]> {
  try {
    const colRef = collection(db, LABS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const labs = snap.docs.map(d => ({ id: d.id, ...d.data() } as InteractiveLab));
      return filterLabs(labs, courseId, unitId, lessonId);
    }
  } catch (err) {
    console.warn('Firestore labs fetch warning, falling back to seed labs:', err);
  }
  return filterLabs(SEED_INTERACTIVE_LABS, courseId, unitId, lessonId);
}

function filterLabs(labs: InteractiveLab[], courseId?: string, unitId?: string, lessonId?: string): InteractiveLab[] {
  let res = labs;
  if (courseId) res = res.filter(l => l.courseId === courseId || (l.learningPathIds && l.learningPathIds.includes(courseId)));
  if (unitId) res = res.filter(l => l.unitId === unitId);
  if (lessonId) res = res.filter(l => l.lessonId === lessonId);
  return res;
}

export async function saveLabToFirestore(lab: InteractiveLab): Promise<void> {
  const docRef = doc(db, LABS_COLLECTION, lab.id);
  await setDoc(docRef, {
    ...lab,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function deleteLabFromFirestore(labId: string): Promise<void> {
  const docRef = doc(db, LABS_COLLECTION, labId);
  await deleteDoc(docRef);
}

// --- QUESTION BANK & POOLS SERVICES ---

export async function getQuestionBankFromFirestore(courseId?: string): Promise<QuestionBankItem[]> {
  try {
    const colRef = collection(db, QUESTIONS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionBankItem));
      if (courseId) return items.filter(i => !i.courseId || i.courseId === courseId);
      return items;
    }
  } catch (err) {
    console.warn('Question bank fetch warning:', err);
  }
  return [
    {
      id: 'q-ai-1',
      courseId: 'digital-employee',
      type: 'MULTIPLE_CHOICE',
      questionAr: 'ما هو المكون الأساسي عند كتابة أمر موجه نموذج الذكاء الاصطناعي (Prompt)؟',
      options: [
        { id: 'opt-1', textAr: 'تحديد دور النموذج والهدف بدقة', isCorrect: true },
        { id: 'opt-2', textAr: 'إغلاق الحاسوب وإعادة تشغيله', isCorrect: false },
        { id: 'opt-3', textAr: 'كتابة كلمة واحدة مبهمة', isCorrect: false }
      ],
      points: 10,
      difficulty: 'BEGINNER',
      tags: ['AI', 'Prompting'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'q-python-1',
      courseId: 'digital-employee',
      type: 'CODE_VALIDATION',
      questionAr: 'ما وظيفة التكرار for loop في لغة بايثون؟',
      options: [
        { id: 'o-1', textAr: 'تكرار تنفيذ الكود لعدد محدد من المرات', isCorrect: true },
        { id: 'o-2', textAr: 'حذف ملف الكود من الحاسوب', isCorrect: false }
      ],
      points: 15,
      difficulty: 'BEGINNER',
      tags: ['Python', 'Loops'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

export async function saveQuestionBankItem(item: QuestionBankItem): Promise<void> {
  const docRef = doc(db, QUESTIONS_COLLECTION, item.id);
  await setDoc(docRef, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteQuestionBankItem(id: string): Promise<void> {
  await deleteDoc(doc(db, QUESTIONS_COLLECTION, id));
}

export async function getQuestionPoolsFromFirestore(): Promise<QuestionPool[]> {
  try {
    const snap = await getDocs(collection(db, POOLS_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionPool));
    }
  } catch (err) {
    console.warn('Pools fetch error:', err);
  }
  return [
    {
      id: 'pool-ai-basics',
      titleAr: 'تجميعة أسئلة الأساسيات الذكية',
      tags: ['AI', 'Prompting'],
      questionIds: ['q-ai-1'],
      selectCount: 5
    }
  ];
}

export async function saveQuestionPoolToFirestore(pool: QuestionPool): Promise<void> {
  await setDoc(doc(db, POOLS_COLLECTION, pool.id), pool, { merge: true });
}

// --- LAB ATTEMPTS & PROGRESS SERVICES ---

export async function submitLabAttemptToFirestore(attempt: LabAttempt): Promise<StudentLabProgress> {
  try {
    // Save attempt record
    const attemptDocRef = doc(db, ATTEMPTS_COLLECTION, attempt.id);
    await setDoc(attemptDocRef, { ...attempt, completedAt: serverTimestamp() }, { merge: true });

    // Update student progress record
    const progressId = `${attempt.studentId}_${attempt.labId}`;
    const progressDocRef = doc(db, PROGRESS_COLLECTION, progressId);

    const progSnap = await getDoc(progressDocRef);
    let currentBest = 0;
    let currentXp = 0;
    let count = 0;

    if (progSnap.exists()) {
      const data = progSnap.data() as StudentLabProgress;
      currentBest = data.bestScorePercentage || 0;
      currentXp = data.bestXpEarned || 0;
      count = data.attemptsCount || 0;
    }

    const newBestScore = Math.max(currentBest, attempt.scorePercentage);
    const newBestXp = Math.max(currentXp, attempt.xpEarned);

    const updatedProgress: StudentLabProgress = {
      id: progressId,
      studentId: attempt.studentId,
      labId: attempt.labId,
      courseId: attempt.courseId,
      status: attempt.passed ? 'PASSED' : 'IN_PROGRESS',
      bestScorePercentage: newBestScore,
      bestXpEarned: newBestXp,
      attemptsCount: count + 1,
      lastAttemptAt: new Date().toISOString(),
      passedAt: attempt.passed ? new Date().toISOString() : undefined
    };

    await setDoc(progressDocRef, updatedProgress, { merge: true });
    return updatedProgress;
  } catch (err) {
    console.warn('Error saving attempt to Firestore, returning local result:', err);
    return {
      id: `${attempt.studentId}_${attempt.labId}`,
      studentId: attempt.studentId,
      labId: attempt.labId,
      courseId: attempt.courseId,
      status: attempt.passed ? 'PASSED' : 'IN_PROGRESS',
      bestScorePercentage: attempt.scorePercentage,
      bestXpEarned: attempt.xpEarned,
      attemptsCount: 1,
      lastAttemptAt: new Date().toISOString()
    };
  }
}

export async function getStudentLabProgressList(studentId: string): Promise<StudentLabProgress[]> {
  try {
    const q = query(collection(db, PROGRESS_COLLECTION), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as StudentLabProgress);
    }
  } catch (err) {
    console.warn('Error fetching student lab progress:', err);
  }
  return [];
}

// --- LAB UNLOCK ENGINE & ACCESS RULES ---

export async function getLabAccessRulesFromFirestore(): Promise<LabAccessRule[]> {
  try {
    const snap = await getDocs(collection(db, ACCESS_RULES_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as LabAccessRule));
    }
  } catch (err) {
    console.warn('Error fetching access rules:', err);
  }
  return [];
}

export async function saveLabAccessRuleToFirestore(rule: LabAccessRule): Promise<void> {
  await setDoc(doc(db, ACCESS_RULES_COLLECTION, rule.id), rule, { merge: true });
}

export function isLabUnlockedForStudent(
  lab: InteractiveLab,
  accessRules: LabAccessRule[],
  studentEnrollmentCourseIds: string[],
  studentCourseProgressPct: number = 100,
  completedLabIds: string[] = [],
  studentClassId?: string,
  currentSessionId?: string
): { unlocked: boolean; reasonAr: string } {
  // Check course restriction
  if (lab.courseId && !studentEnrollmentCourseIds.includes(lab.courseId)) {
    // Check if learning path matches
    const isPathMatched = lab.learningPathIds?.some(pId => studentEnrollmentCourseIds.includes(pId));
    if (!isPathMatched) {
      return { unlocked: false, reasonAr: 'يتطلب التسجيل في الكورس أو المسار المخصص لهذا المختبر.' };
    }
  }

  // Check Prerequisites
  if (lab.prerequisiteLabIds && lab.prerequisiteLabIds.length > 0) {
    const missing = lab.prerequisiteLabIds.filter(reqId => !completedLabIds.includes(reqId));
    if (missing.length > 0) {
      return { unlocked: false, reasonAr: `يتطلب إكمال المختبرات التأسيسية السابقة (${missing.length}) أولاً.` };
    }
  }

  // Check Session Only
  if (lab.sessionOnly && lab.sessionId) {
    if (currentSessionId !== lab.sessionId) {
      return { unlocked: false, reasonAr: 'هذا المختبر متاح حصرية أثناء جلسة الحصة النشطة المحددة.' };
    }
  }

  // Check Specific Access Rules
  const matchingRule = accessRules.find(r => r.labId === lab.id && r.status === 'ACTIVE');
  if (matchingRule) {
    if (matchingRule.minCourseProgressPercentage && studentCourseProgressPct < matchingRule.minCourseProgressPercentage) {
      return { unlocked: false, reasonAr: `يتطلب تحقيق نسبة تقدم ${matchingRule.minCourseProgressPercentage}% على الأقل في الكورس.` };
    }
    if (matchingRule.allowedClassIds && matchingRule.allowedClassIds.length > 0 && studentClassId) {
      if (!matchingRule.allowedClassIds.includes(studentClassId)) {
        return { unlocked: false, reasonAr: 'المختبر مخصص لفصول دراسية محددة.' };
      }
    }
  }

  return { unlocked: true, reasonAr: 'المختبر متاح ومفتوح للطالب.' };
}

// --- PROJECT SUBMISSION SERVICES ---

export async function getLabProjectsFromFirestore(labId?: string, studentId?: string): Promise<LabProjectSubmission[]> {
  try {
    const snap = await getDocs(collection(db, PROJECTS_COLLECTION));
    if (!snap.empty) {
      let projects = snap.docs.map(d => ({ id: d.id, ...d.data() } as LabProjectSubmission));
      if (labId) projects = projects.filter(p => p.labId === labId);
      if (studentId) projects = projects.filter(p => p.studentId === studentId);
      return projects;
    }
  } catch (err) {
    console.warn('Error fetching projects:', err);
  }
  return [];
}

export async function saveLabProjectToFirestore(project: LabProjectSubmission): Promise<void> {
  await setDoc(doc(db, PROJECTS_COLLECTION, project.id), {
    ...project,
    submittedAt: project.submittedAt || new Date().toISOString()
  }, { merge: true });
}
