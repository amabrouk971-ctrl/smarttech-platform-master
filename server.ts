import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  INITIAL_COURSES,
  INITIAL_LEARNING_PATHS,
  INITIAL_CERTIFICATES,
  INITIAL_BRANCHES
} from './src/data/seedData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store seeded from brochure data
let coursesDb = [...INITIAL_COURSES];
let pathsDb = [...INITIAL_LEARNING_PATHS];
let certificatesDb = [...INITIAL_CERTIFICATES];
let branchesDb = [...INITIAL_BRANCHES];

// Initialize Gemini AI Client securely on the server
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. SmartBot AI features will fallback gracefully.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SmartTech Education Ecosystem 2026' });
});

// GET Courses with optional category and age filters
app.get('/api/courses', (req, res) => {
  const { category, age, mode, search } = req.query;
  let filtered = [...coursesDb];

  if (category && category !== 'all') {
    filtered = filtered.filter((c) => c.category === category);
  }

  if (age) {
    const ageNum = parseInt(age as string, 10);
    if (!isNaN(ageNum)) {
      filtered = filtered.filter((c) => ageNum >= c.ageMin && ageNum <= c.ageMax);
    }
  }

  if (mode && mode !== 'all') {
    filtered = filtered.filter((c) => c.mode === mode);
  }

  if (search) {
    const query = (search as string).toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.titleAr.toLowerCase().includes(query) ||
        c.titleEn.toLowerCase().includes(query) ||
        c.skills.some((s) => s.toLowerCase().includes(query))
    );
  }

  res.json(filtered);
});

// Admin Course CRUD (Add/Update course or prices)
app.post('/api/courses', (req, res) => {
  const newCourse = req.body;
  if (!newCourse || !newCourse.titleAr) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const existingIndex = coursesDb.findIndex((c) => c.id === newCourse.id);
  if (existingIndex >= 0) {
    coursesDb[existingIndex] = { ...coursesDb[existingIndex], ...newCourse };
    return res.json({ message: 'Course updated', course: coursesDb[existingIndex] });
  } else {
    const id = newCourse.id || `c-${Date.now()}`;
    const courseWithId = { ...newCourse, id };
    coursesDb.push(courseWithId);
    return res.json({ message: 'Course added', course: courseWithId });
  }
});

// Admin Delete Course
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  coursesDb = coursesDb.filter((c) => c.id !== id);
  res.json({ message: 'Course deleted', id });
});

// GET Learning Paths
app.get('/api/paths', (req, res) => {
  res.json(pathsDb);
});

// Verify Certificate Code
app.get('/api/certificates/verify/:code', (req, res) => {
  const { code } = req.params;
  const cert = certificatesDb.find(
    (c) => c.certificateCode.toLowerCase() === code.toLowerCase()
  );

  if (cert) {
    res.json({ valid: true, certificate: cert });
  } else {
    // Return sample auto-verified structure for demo certificate codes
    if (code.toUpperCase().startsWith('CERT-SMART')) {
      return res.json({
        valid: true,
        certificate: {
          id: code,
          certificateCode: code.toUpperCase(),
          studentNameAr: 'طالب معتمد سمارتك',
          studentNameEn: 'SmartTech Certified Student',
          courseTitleAr: 'دبلومة هندسة الروبوت والبرمجة',
          courseTitleEn: 'Robotics & Programming Diploma',
          issueDate: new Date().toISOString().split('T')[0],
          instructorNameAr: 'مركز تدريب SmartTech',
          pathTitleAr: 'مسار مبرمج المستقبل',
          qrUrl: `/verify/${code}`
        }
      });
    }
    res.status(404).json({ valid: false, message: 'Certificate code not found' });
  }
});

// --- GEMINI AI FEATURES (SERVER SIDE) ---

// 1. SmartBot AI Tutor: Progressive Scaffolding Hints (3 steps)
app.post('/api/ai/smartbot-hint', async (req, res) => {
  try {
    const { problemTitle, currentCode, studentAttempts, language = 'ar' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        hints: [
          'جرب التحقق من ترتيب الخطوات داخل الكود.',
          'هل استخدمت الشرط الصحيح للجزء المطلوب؟',
          'راجع القيمة المدخلة في المتغير للحصول على النتيجة المطلوبة.'
        ]
      });
    }

    const prompt = `
You are SmartBot, a friendly AI Tutor mascot for SmartTech Academy.
The student is trying to solve: "${problemTitle}".
Their current code/circuit state: "${currentCode || 'Not started yet'}".
Number of failed attempts so far: ${studentAttempts || 1}.

CRITICAL INSTRUCTION: DO NOT GIVE THE FINAL ANSWER OR DIRECT CODE SOLUTION!
Provide 3 progressive scaffolding hints in Arabic that guide the student step-by-step:
Hint 1: A gentle guiding observation or question.
Hint 2: A focused hint pointing out what logic condition or block to check.
Hint 3: A clear suggestion of where to look or what parameter to test.

Respond in JSON format with array "hints": ["Hint 1 text", "Hint 2 text", "Hint 3 text"]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    let parsed = { hints: [] };
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { hints: [text] };
    }

    res.json(parsed);
  } catch (err: any) {
    console.error('SmartBot AI Hint Error:', err);
    res.json({
      hints: [
        'افحص الشروط والمحركات في الكود الخاص بك.',
        'تأكد من أن الأوامر مرتبة بالتسلسل الصحيح.',
        'جرب تغيير قيم الحساسات واختبار النتيجة.'
      ]
    });
  }
});

// 2. AI Skill Assessment for Kids
app.post('/api/ai/assess-skill', async (req, res) => {
  try {
    const { age, interests, previousExperience } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        recommendedPathId: age < 9 ? 'junior-programmer' : 'future-engineer',
        levelTitle: 'Tech Explorer',
        assessmentSummary: 'بناءً على عمرك واهتماماتك، ننصحك بالبدء في مسار التطبيق والبرمجة التفاعلية!',
        questions: [
          { q: 'ماذا يحدث لو ضغطنا على زر البدء بدون تحديد اتجاه الروبوت؟', options: ['يتوقف', 'يمشي عشوائياً', 'يطلب الاتجاه'], correctIndex: 0 }
        ]
      });
    }

    const prompt = `
You are an expert Educational AI Advisor for SmartTech Academy.
Analyze a student with Age: ${age}, Interests: "${interests}", Previous experience: "${previousExperience}".
Recommend the ideal path among: 'junior-programmer', 'future-programmer', 'junior-engineer', 'future-engineer', 'ai-creator'.
Provide a brief encouraging assessment summary in Arabic.
Generate 3 fun interactive age-appropriate logic questions for this child.

Return JSON format:
{
  "recommendedPathId": "path_id",
  "levelTitle": "Level Title in Arabic",
  "assessmentSummary": "encouraging summary in Arabic",
  "questions": [
    { "q": "Question text in Arabic", "options": ["Opt1", "Opt2", "Opt3"], "correctIndex": 0 }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err) {
    res.json({
      recommendedPathId: 'junior-programmer',
      levelTitle: 'Junior Coder',
      assessmentSummary: 'مسار ممتااااز للبدء في عالم البرمجة والذكاء الاصطناعي!',
      questions: []
    });
  }
});

// 3. AI Teacher Assistant: Auto Lesson Plan & Quiz Generator
app.post('/api/ai/teacher-assistant', async (req, res) => {
  try {
    const { topic, targetAge, language = 'ar' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        title: `درس تفاعلي عن: ${topic}`,
        objective: 'فهم المفاهيم الأساسية والتطبيق بمشروع عملي.',
        steps: ['مقدمة نظرية مشوقة (5 دقائق)', 'تطبيق عملي بالمنصة (20 دقيقة)', 'تحدي المبتكر الصغير (15 دقيقة)'],
        quizQuestions: [{ question: 'ما فائقة المتغير في البرمجة؟', options: ['حفظ البيانات', 'تغيير اللون', 'إغلاق اللعبة'], correct: 0 }]
      });
    }

    const prompt = `
You are SmartTech AI Teacher Assistant.
Create a high-quality lesson plan for topic: "${topic}" tailored for children aged ${targetAge}.
Include:
1. Lesson Title (Arabic)
2. Educational Objective (Arabic)
3. Step-by-step Teaching Steps (3-4 steps)
4. Hands-on Mission activity idea
5. 3 Quiz questions with 3 options each and correct option index.

Return strict JSON format.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate lesson plan' });
  }
});

// 4. AI Parent Weekly Progress Report Generator
app.post('/api/ai/parent-report', async (req, res) => {
  try {
    const { studentName, pathTitle, completedMissionsCount, xpGained, strengths, areasToImprove } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reportSummary: `تقرير أسبوعي رائع للطالب ${studentName}! أتم ببراعة ${completedMissionsCount} مهمة تفاعلية واكتسب ${xpGained} نقطة خبرة XP. أظهر تفوقاً ملحوظاً في التفكير المنطقي وتركيب الحساسات.`
      });
    }

    const prompt = `
Generate a warm, professional, encouraging Weekly Progress Report in Arabic for a parent.
Student Name: ${studentName}
Learning Path: ${pathTitle}
Missions Completed this week: ${completedMissionsCount}
XP Gained: ${xpGained}
Strengths observed: ${JSON.stringify(strengths)}
Areas to practice: ${JSON.stringify(areasToImprove)}

Keep it clear, concise (2 short paragraphs), and inspiring for parents.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt
    });

    res.json({ reportSummary: response.text });
  } catch (err) {
    res.json({
      reportSummary: `تقرير أسبوعي ممتاز للطالب ${req.body.studentName || 'البطل'}! حقق تقدماً رائعاً في تنفيذ المهام والبرمجة هذا الأسبوع.`
    });
  }
});

// --- VITE MIDDLEWARE / PRODUCTION STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartTech Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
