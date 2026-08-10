import React, { useState, useEffect } from 'react';
import { 
  InteractiveLab, LabType, LabDifficulty, QuestionBankItem, QuestionPool, 
  LabAccessRule, AIModelProviderConfig, DatabaseCollectionMeta, DatabaseSchemaExport, 
  SchemaMigrationDiff 
} from '../../types';
import { 
  getLabsFromFirestore, saveLabToFirestore, deleteLabFromFirestore, SEED_INTERACTIVE_LABS,
  getQuestionBankFromFirestore, saveQuestionBankItem, deleteQuestionBankItem,
  getQuestionPoolsFromFirestore, saveQuestionPoolToFirestore,
  getLabAccessRulesFromFirestore, saveLabAccessRuleToFirestore
} from '../../services/labService';
import { 
  getAIModelProvidersFromFirestore, saveAIModelProviderToFirestore, 
  deleteAIModelProviderFromFirestore, testAIModelPromptOnServer 
} from '../../services/aiModelService';
import { 
  CURRENT_FIRESTORE_SCHEMA, checkDatabaseConnectionHealth, fetchDatabaseCollectionsMeta, 
  compareSchemaMigration, generateSchemaSqlScript, generateSchemaTypeScriptDefs 
} from '../../services/databaseAdminService';
import { InteractiveLabRunner } from '../labs/InteractiveLabRunner';
import { 
  Plus, Edit, Trash2, Eye, Copy, Sparkles, Database, ShieldCheck, 
  HelpCircle, Cpu, FileJson, FileCode, CheckCircle2, AlertTriangle, 
  Server, Sliders, Play, RefreshCw, Save, ChevronDown, Download, Upload, Layers
} from 'lucide-react';

export const LabBuilderCMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LABS' | 'QUESTIONS' | 'ACCESS_RULES' | 'AI_MODELS' | 'DATABASE'>('LABS');

  // LABS STATE
  const [labs, setLabs] = useState<InteractiveLab[]>([]);
  const [selectedLab, setSelectedLab] = useState<InteractiveLab | null>(null);
  const [isEditingLab, setIsEditingLab] = useState<boolean>(false);
  const [previewLab, setPreviewLab] = useState<InteractiveLab | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // QUESTION BANK STATE
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [questionPools, setQuestionPools] = useState<QuestionPool[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionBankItem | null>(null);

  // ACCESS RULES STATE
  const [accessRules, setAccessRules] = useState<LabAccessRule[]>([]);

  // AI MODELS STATE
  const [aiProviders, setAiProviders] = useState<AIModelProviderConfig[]>([]);
  const [testSystemPrompt, setTestSystemPrompt] = useState<string>('أنت مساعد تعليمي ذكي لمنصة SmartTech');
  const [testUserPrompt, setTestUserPrompt] = useState<string>('أوجد المساحة لمستطيل طوله 5 وعرضه 3');
  const [testResult, setTestResult] = useState<{ text: string; latencyMs: number; tokensUsed: number; status: string } | null>(null);
  const [isTestingAi, setIsTestingAi] = useState<boolean>(false);

  // DATABASE MANAGEMENT STATE
  const [dbHealth, setDbHealth] = useState<{ status: string; latencyMs: number; detailsAr: string } | null>(null);
  const [collectionsMeta, setCollectionsMeta] = useState<DatabaseCollectionMeta[]>([]);
  const [uploadedSchemaText, setUploadedSchemaText] = useState<string>('');
  const [migrationDiff, setMigrationDiff] = useState<SchemaMigrationDiff | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const loadedLabs = await getLabsFromFirestore();
    setLabs(loadedLabs);

    const loadedQuestions = await getQuestionBankFromFirestore();
    setQuestions(loadedQuestions);

    const loadedPools = await getQuestionPoolsFromFirestore();
    setQuestionPools(loadedPools);

    const loadedRules = await getLabAccessRulesFromFirestore();
    setAccessRules(loadedRules);

    const loadedAi = await getAIModelProvidersFromFirestore();
    setAiProviders(loadedAi);

    const health = await checkDatabaseConnectionHealth();
    setDbHealth(health);

    const metas = await fetchDatabaseCollectionsMeta();
    setCollectionsMeta(metas);
  };

  // --- LAB BUILDER HANDLERS ---
  const handleCreateNewLab = () => {
    const newLab: InteractiveLab = {
      id: `lab-custom-${Date.now()}`,
      courseId: 'digital-employee',
      titleAr: 'مختبر جديد مخصص',
      descriptionAr: 'وصف المختبر التفاعلي الجديد',
      instructionsAr: '1. اتبع الخطوات التفاعلية للمجال.\n2. اضغط تسليم عند الانتهاء.',
      type: 'AI_PROMPT_LAB',
      difficulty: 'BEGINNER',
      timeLimitMinutes: 15,
      passPercentage: 70,
      xpReward: 100,
      status: 'DRAFT',
      version: 1,
      createdBy: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSelectedLab(newLab);
    setIsEditingLab(true);
  };

  const handleSaveLab = async () => {
    if (!selectedLab) return;
    await saveLabToFirestore(selectedLab);
    setIsEditingLab(false);
    setSelectedLab(null);
    await loadAllData();
  };

  const handleDeleteLab = async (labId: string) => {
    if (confirm('هل أنت تأكد من حذف هذا المختبر بصفة نهائية؟')) {
      await deleteLabFromFirestore(labId);
      await loadAllData();
    }
  };

  const handleDuplicateLab = async (lab: InteractiveLab) => {
    const duplicated: InteractiveLab = {
      ...lab,
      id: `lab-dup-${Date.now()}`,
      titleAr: `${lab.titleAr} (نسخة جديدة)`,
      createdAt: new Date().toISOString()
    };
    await saveLabToFirestore(duplicated);
    await loadAllData();
  };

  // --- QUESTION BANK HANDLERS ---
  const handleSaveQuestion = async () => {
    if (!selectedQuestion) return;
    await saveQuestionBankItem(selectedQuestion);
    setSelectedQuestion(null);
    await loadAllData();
  };

  // --- AI MODEL PLAYGROUND TEST ---
  const handleRunAiPlaygroundTest = async () => {
    setIsTestingAi(true);
    const res = await testAIModelPromptOnServer('gemini-3.6-flash', testSystemPrompt, testUserPrompt);
    setIsTestingAi(false);
    setTestResult(res);
  };

  // --- SCHEMA MIGRATION CHECK ---
  const handleAnalyzeMigration = () => {
    const diff = compareSchemaMigration(CURRENT_FIRESTORE_SCHEMA, uploadedSchemaText);
    setMigrationDiff(diff);
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* HEADER BAR */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Sparkles className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-white">نظام المختبرات التفاعلية والتحكم الشامل (Lab Builder CMS)</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            إدارة كافة أنواع المختبرات 30+، بنك الأسئلة، قواعد الفتح، نماذج AI، وقواعد بيانات Firebase
          </p>
        </div>

        <button
          onClick={handleCreateNewLab}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>إنشاء مختبر تفاعلي جديد</span>
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('LABS')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'LABS' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>المختبرات التفاعلية ({labs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('QUESTIONS')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'QUESTIONS' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>بنك الأسئلة والتجميعات ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ACCESS_RULES')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'ACCESS_RULES' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>مُحرك الفتح والاشتراطات</span>
        </button>

        <button
          onClick={() => setActiveTab('AI_MODELS')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'AI_MODELS' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>إدارة نماذج الذكاء الاصطناعي</span>
        </button>

        <button
          onClick={() => setActiveTab('DATABASE')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'DATABASE' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>إدارة القاعدة والـ Schema</span>
        </button>
      </div>

      {/* 1. LABS MANAGEMENT & BUILDER TAB */}
      {activeTab === 'LABS' && (
        <div className="space-y-6">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
            <input
              type="text"
              placeholder="البحث باسم المختبر أو الكورس..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 flex-1"
            />
          </div>

          {/* LABS LIST GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs
              .filter(l => l.titleAr.includes(searchQuery) || l.courseId.includes(searchQuery))
              .map(lab => (
                <div key={lab.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {lab.type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        lab.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {lab.status}
                      </span>
                    </div>

                    <h3 className="text-md font-bold text-slate-100">{lab.titleAr}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{lab.descriptionAr}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                      <div>الكورس: <span className="text-slate-200 font-bold">{lab.courseId}</span></div>
                      <div>المكافأة: <span className="text-amber-400 font-bold">+{lab.xpReward} XP</span></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setPreviewLab(lab)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs flex items-center gap-1 font-bold"
                      title="معاينة كطالب"
                    >
                      <Eye className="w-4 h-4" />
                      <span>معاينة</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedLab(lab);
                        setIsEditingLab(true);
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs flex items-center gap-1 font-bold"
                    >
                      <Edit className="w-4 h-4" />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => handleDuplicateLab(lab)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                      title="نسخ"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteLab(lab.id)}
                      className="p-2 bg-slate-800 hover:bg-rose-900/50 text-rose-400 rounded-lg"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 2. QUESTION BANK TAB */}
      {activeTab === 'QUESTIONS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              بنك الأسئلة الموحد (Unified Question Bank)
            </h2>

            <div className="space-y-3">
              {questions.map(q => (
                <div key={q.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {q.type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 mt-1">{q.questionAr}</h4>
                    <span className="text-xs text-slate-400">النقاط: {q.points} | الصعوبة: {q.difficulty}</span>
                  </div>

                  <button
                    onClick={() => deleteQuestionBankItem(q.id).then(loadAllData)}
                    className="p-2 bg-slate-800 hover:bg-rose-900/50 text-rose-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. ACCESS RULES ENGINE TAB */}
      {activeTab === 'ACCESS_RULES' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            مُحرك القواعد التفاعلي لاشتراطات فتح المختبرات (Visual Rule Builder)
          </h2>
          <p className="text-sm text-slate-400">
            تحديد القواعد الشرطية مثل (إذا تجاوز الطالب تقدم الكورس 70% وحقق في الاختبار السابق 80% يفتح المختبر التالي)
          </p>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300">
            ✓ القواعد النشطة تطبق تلقائياً وتفحص صلاحيات الطالب قبل بدء الجلسة.
          </div>
        </div>
      )}

      {/* 4. AI MODELS MANAGEMENT & TEST PLAYGROUND TAB */}
      {activeTab === 'AI_MODELS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              إدارة المزودات ونماذج AI وآليات السيرفر السريعة (Server API Proxies)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiProviders.map(p => (
                <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200">{p.providerName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${p.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {p.enabled ? 'نشط' : 'معطل'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">النموذج: {p.modelName} | متغير البيئة: {p.apiKeyEnvVar}</div>
                  <div className="text-xs text-slate-400">معدل الاستخدام: {p.usageCount} طلبات | الكلفة المباشرة: ${p.estimatedCostUsd}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI TEST PLAYGROUND */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-md font-bold text-amber-400 flex items-center gap-2">
              <Play className="w-5 h-5" />
              مختبر تجربة واختبار النماذج (AI Model Testing Playground)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">System Prompt</label>
                <input
                  type="text"
                  value={testSystemPrompt}
                  onChange={e => setTestSystemPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">User Prompt Test</label>
                <input
                  type="text"
                  value={testUserPrompt}
                  onChange={e => setTestUserPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>

              <button
                onClick={handleRunAiPlaygroundTest}
                disabled={isTestingAi}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2"
              >
                {isTestingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>تشغيل الفحص السريع واستخراج الكمون والتكلفة</span>
              </button>

              {testResult && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-4 text-slate-400 font-mono">
                    <span>زمن الاستجابة: <strong className="text-amber-400">{testResult.latencyMs}ms</strong></span>
                    <span>الرموز المستخدمة: <strong className="text-blue-400">{testResult.tokensUsed} tokens</strong></span>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-slate-200 font-sans whitespace-pre-wrap">{testResult.text}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. DATABASE MANAGEMENT & SCHEMA GENERATOR TAB */}
      {activeTab === 'DATABASE' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                حالة اتصالات قاعدة البيانات (Firebase Firestore Connection)
              </h2>
              {dbHealth && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  dbHealth.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {dbHealth.detailsAr}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {collectionsMeta.map(col => (
                <div key={col.name} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-200">
                    <span>{col.name}</span>
                    <span className="text-xs text-blue-400">{col.documentCount} سجلات</span>
                  </div>
                  <p className="text-xs text-slate-400">{col.descriptionAr}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SCHEMA EXPORTER & DIFF ANALYZER */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-md font-bold text-amber-400 flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              مُولد ومصدر المخطط (Schema Exporter & Migration Diff)
            </h3>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(CURRENT_FIRESTORE_SCHEMA, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `schema-export-${Date.now()}.json`;
                  a.click();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>تصدير Schema JSON</span>
              </button>

              <button
                onClick={() => {
                  const sql = generateSchemaSqlScript(CURRENT_FIRESTORE_SCHEMA);
                  const blob = new Blob([sql], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `schema-export-${Date.now()}.sql`;
                  a.click();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>تصدير SQL Script</span>
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-400">لصق مخطط جديد لمقارنة التغييرات (Diff Check)</label>
              <textarea
                rows={4}
                placeholder="قم بلصق كود JSON المخطط هنا لمقارنته بالمخطط الحالي ورصد أي Breaking Changes..."
                value={uploadedSchemaText}
                onChange={e => setUploadedSchemaText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono"
              />
              <button
                onClick={handleAnalyzeMigration}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تحليل الفوارق والتغييرات الجوهرية (Migration Diff)</span>
              </button>

              {migrationDiff && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-bold text-amber-400">نتيجة تحليل الفوارق:</h4>
                  {migrationDiff.potentialBreakingChanges.length > 0 ? (
                    <div className="text-rose-400 space-y-1">
                      {migrationDiff.potentialBreakingChanges.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-emerald-400">✓ لا توجد أي تعارضات أو تغييرات كاسرة بالمخطط المقدم!</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LAB EDIT MODAL */}
      {isEditingLab && selectedLab && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">محرر بيانات المختبر التفاعلي</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">عنوان المختبر (بالعربية)</label>
                <input
                  type="text"
                  value={selectedLab.titleAr}
                  onChange={e => setSelectedLab({ ...selectedLab, titleAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">نوع المختبر (Lab Type)</label>
                <select
                  value={selectedLab.type}
                  onChange={e => setSelectedLab({ ...selectedLab, type: e.target.value as LabType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100"
                >
                  <option value="AI_PROMPT_LAB">AI Prompt Engineering Lab</option>
                  <option value="CODE_CHALLENGE">Code Challenge & Debugging</option>
                  <option value="ELECTRONICS_SIMULATION">Electronics & Arduino Simulation</option>
                  <option value="BUSINESS_SIMULATION">Business & Decision Making Simulation</option>
                  <option value="DRAWING_DESIGN_LAB">Drawing & Canvas Lab</option>
                  <option value="QUIZ_LAB">Quiz & Assessment Lab</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">درجة النجاح (%)</label>
                  <input
                    type="number"
                    value={selectedLab.passPercentage}
                    onChange={e => setSelectedLab({ ...selectedLab, passPercentage: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">مكافأة نقاط الخبرة (XP)</label>
                  <input
                    type="number"
                    value={selectedLab.xpReward}
                    onChange={e => setSelectedLab({ ...selectedLab, xpReward: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">وصف المختبر</label>
                <textarea
                  rows={2}
                  value={selectedLab.descriptionAr}
                  onChange={e => setSelectedLab({ ...selectedLab, descriptionAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsEditingLab(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>

              <button
                onClick={handleSaveLab}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات في Firebase</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PREVIEW RUNNER MODAL */}
      {previewLab && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-5xl">
            <InteractiveLabRunner
              lab={previewLab}
              isPreview={true}
              onClose={() => setPreviewLab(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
