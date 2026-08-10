import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Trash2, Edit3, Save, CheckCircle, Clock, Users, HelpCircle, Eye, ShieldCheck, Sparkles, AlertCircle
} from 'lucide-react';
import { Exam, ExamQuestion, ExamType, ResultVisibility, TargetType, ContentTarget } from '../../types';
import {
  fetchExamsFromFirestore, saveExamToFirestore, deleteExamFromFirestore,
  fetchExamQuestions, saveExamQuestionToFirestore
} from '../../services/firebaseService';

export const ExamCMS: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // New Question state
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<any>('SINGLE_CHOICE');
  const [qPoints, setQPoints] = useState(10);
  const [qOptions, setQOptions] = useState([
    { id: 'A', textAr: 'الخيار الأول' },
    { id: 'B', textAr: 'الخيار الثاني' },
    { id: 'C', textAr: 'الخيار الثالث' }
  ]);
  const [qCorrectId, setQCorrectId] = useState('A');
  const [qExplanation, setQExplanation] = useState('');

  // Exam Form State
  const [examForm, setExamForm] = useState<Partial<Exam>>({
    titleAr: '',
    descriptionAr: '',
    examType: 'QUIZ',
    status: 'PUBLISHED',
    durationMinutes: 15,
    maxAttempts: 2,
    passingScore: 70,
    resultVisibility: 'IMMEDIATE',
    showScore: true,
    showCorrectAnswers: false,
    showExplanations: fontCheck(true),
    randomizeQuestions: false,
    randomizeAnswers: true,
    target: { type: 'EVERYONE' }
  });

  function fontCheck(v: boolean) { return v; }

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    const list = await fetchExamsFromFirestore();
    setExams(list);
    if (list.length > 0 && !selectedExam) {
      handleSelectExam(list[0]);
    }
  };

  const handleSelectExam = async (e: Exam) => {
    setSelectedExam(e);
    setExamForm(e);
    const qList = await fetchExamQuestions(e.id);
    setQuestions(qList);
  };

  const handleSaveExam = async () => {
    if (!examForm.titleAr) return;
    const newOrUpdated: Exam = {
      id: selectedExam?.id || `exam-${Date.now()}`,
      titleAr: examForm.titleAr || 'امتحان جديد',
      titleEn: examForm.titleEn || '',
      descriptionAr: examForm.descriptionAr || '',
      examType: examForm.examType || 'QUIZ',
      status: examForm.status || 'PUBLISHED',
      durationMinutes: examForm.durationMinutes || 15,
      maxAttempts: examForm.maxAttempts || 1,
      passingScore: examForm.passingScore || 70,
      totalPoints: questions.reduce((acc, q) => acc + q.points, 0) || 20,
      gradingEnabled: true,
      resultVisibility: examForm.resultVisibility || 'IMMEDIATE',
      showScore: examForm.showScore !== undefined ? examForm.showScore : true,
      showCorrectAnswers: examForm.showCorrectAnswers !== undefined ? examForm.showCorrectAnswers : false,
      showExplanations: examForm.showExplanations !== undefined ? examForm.showExplanations : true,
      randomizeQuestions: !!examForm.randomizeQuestions,
      randomizeAnswers: !!examForm.randomizeAnswers,
      target: examForm.target || { type: 'EVERYONE' },
      createdAt: selectedExam?.createdAt || new Date().toISOString()
    };

    await saveExamToFirestore(newOrUpdated);
    setSelectedExam(newOrUpdated);
    setIsEditingExam(false);
    loadExams();
  };

  const handleDeleteExam = async (id: string) => {
    await deleteExamFromFirestore(id);
    setSelectedExam(null);
    loadExams();
  };

  const handleAddQuestion = async () => {
    if (!selectedExam || !qText) return;
    const newQ: ExamQuestion = {
      id: `q-${Date.now()}`,
      examId: selectedExam.id,
      type: qType,
      questionAr: qText,
      options: qOptions,
      correctAnswerIds: [qCorrectId],
      points: Number(qPoints),
      explanationAr: qExplanation
    };

    await saveExamQuestionToFirestore(newQ);
    const updatedQs = [...questions, newQ];
    setQuestions(updatedQs);

    // Update total points in exam
    const newTotal = updatedQs.reduce((sum, item) => sum + item.points, 0);
    const updatedExam = { ...selectedExam, totalPoints: newTotal };
    await saveExamToFirestore(updatedExam);
    setSelectedExam(updatedExam);

    setIsAddingQuestion(false);
    setQText('');
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 text-white p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider">
            EXAMS & QUIZZES CMS ENGINE
          </span>
          <h2 className="text-2xl font-black mt-2">منظومة بناء وتصميم الامتحانات التفاعلية</h2>
          <p className="text-xs text-slate-400">تحكم كامل بالأسئلة، الوقت، درجات النجاح، والاستهداف بدون تغيير بالكود.</p>
        </div>

        <button
          onClick={() => {
            setSelectedExam(null);
            setExamForm({
              titleAr: 'امتحان وتقييم جديد',
              examType: 'QUIZ',
              status: 'PUBLISHED',
              durationMinutes: 15,
              maxAttempts: 2,
              passingScore: 70,
              resultVisibility: 'IMMEDIATE',
              showScore: true,
              showCorrectAnswers: false,
              showExplanations: true,
              target: { type: 'EVERYONE' }
            });
            setIsEditingExam(true);
          }}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
        >
          <Plus className="w-4 h-4" /> إنشاء امتحان جديد 📝
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam List Sidebar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            قائمة الامتحانات في Firestore ({exams.length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {exams.map((e) => (
              <div
                key={e.id}
                onClick={() => handleSelectExam(e)}
                className={`p-4 rounded-2xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                  selectedExam?.id === e.id
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-sm mb-1">{e.titleAr}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>نوع: {e.examType}</span>
                  <span>{e.durationMinutes} دقيقة</span>
                  <span className="font-mono text-red-600 font-bold">{e.totalPoints} نقطة</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Exam Settings & Questions */}
        <div className="lg:col-span-2 space-y-6">
          {selectedExam || isEditingExam ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              {/* Exam Settings Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  إعدادات الامتحان: {selectedExam?.titleAr || 'امتحان جديد'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveExam}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow"
                  >
                    <Save className="w-4 h-4" /> حفظ الإعدادات بـ Firestore
                  </button>
                  {selectedExam && (
                    <button
                      onClick={() => handleDeleteExam(selectedExam.id)}
                      className="p-2 bg-red-100 dark:bg-red-950 text-red-600 rounded-xl hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div>
                  <label className="block mb-1 text-slate-600 dark:text-slate-400">عنوان الامتحان (بالعربية):</label>
                  <input
                    type="text"
                    value={examForm.titleAr || ''}
                    onChange={(e) => setExamForm({ ...examForm, titleAr: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-600 dark:text-slate-400">نوع الاختبار (Exam Type):</label>
                  <select
                    value={examForm.examType || 'QUIZ'}
                    onChange={(e) => setExamForm({ ...examForm, examType: e.target.value as ExamType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  >
                    <option value="QUIZ">كويز سريع (Quiz)</option>
                    <option value="TEST">اختبار مرحلي (Test)</option>
                    <option value="FINAL">امتحان نهائي (Final)</option>
                    <option value="CHALLENGE">تحدي ذكاء (Challenge)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600 dark:text-slate-400">المدة الزمنية (بالدقائق):</label>
                  <input
                    type="number"
                    value={examForm.durationMinutes || 0}
                    onChange={(e) => setExamForm({ ...examForm, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-600 dark:text-slate-400">نسبة النجاح المطلوب (%):</label>
                  <input
                    type="number"
                    value={examForm.passingScore || 70}
                    onChange={(e) => setExamForm({ ...examForm, passingScore: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-600 dark:text-slate-400">إظهار النتيجة للطالب (Result Visibility):</label>
                  <select
                    value={examForm.resultVisibility || 'IMMEDIATE'}
                    onChange={(e) => setExamForm({ ...examForm, resultVisibility: e.target.value as ResultVisibility })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  >
                    <option value="IMMEDIATE">فوري بعد التسليم مباشرة (Immediate)</option>
                    <option value="AFTER_REVIEW">بعد مراجعة المعلم (After Teacher Review)</option>
                    <option value="NEVER">عدم إظهار النتيجة (Hide Result)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600 dark:text-slate-400">الفئة والمستهدفون (Target Audience):</label>
                  <select
                    value={examForm.target?.type || 'EVERYONE'}
                    onChange={(e) => setExamForm({ ...examForm, target: { type: e.target.value as TargetType } })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  >
                    <option value="EVERYONE">الجميع (Everyone)</option>
                    <option value="STUDENT">طلاب محددون (Specific Students)</option>
                    <option value="GROUP">مجموعة معينة (Group A)</option>
                    <option value="COURSE">مشتركو كورس معين (Enrolled Course)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examForm.showScore}
                    onChange={(e) => setExamForm({ ...examForm, showScore: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>إظهار الدرجة الإجمالية للطالب</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examForm.showCorrectAnswers}
                    onChange={(e) => setExamForm({ ...examForm, showCorrectAnswers: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>كشف الإجابات الصحيحة بعد الاختبار</span>
                </label>
              </div>

              {/* Question Bank for this Exam */}
              <div className="pt-4 space-y-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    أسئلة الامتحان الحالية ({questions.length})
                  </h4>
                  <button
                    onClick={() => setIsAddingQuestion(true)}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة سؤال جديد ➕
                  </button>
                </div>

                {/* Add Question Form */}
                {isAddingQuestion && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">محرر السؤال الجديد:</h5>
                    <input
                      type="text"
                      placeholder="نص السؤال (مثال: ما هو دور الخوارزمية ببرمجة الذكاء الاصطناعي؟)"
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                    />

                    <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                      <div>
                        <label className="block mb-1">الدرجة المخصصة للسؤال:</label>
                        <input
                          type="number"
                          value={qPoints}
                          onChange={(e) => setQPoints(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">الإجابة الصحيحة:</label>
                        <select
                          value={qCorrectId}
                          onChange={(e) => setQCorrectId(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold"
                        >
                          <option value="A">الخيار (أ)</option>
                          <option value="B">الخيار (ب)</option>
                          <option value="C">الخيار (ج)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleAddQuestion}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
                      >
                        حفظ السؤال بـ Firestore
                      </button>
                      <button
                        onClick={() => setIsAddingQuestion(false)}
                        className="px-3 py-2 bg-slate-200 text-slate-700 text-xs rounded-xl font-bold"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                {/* Question List */}
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                      <div className="flex justify-between font-extrabold text-slate-900 dark:text-white">
                        <span>س{idx + 1}: {q.questionAr}</span>
                        <span className="text-red-600 font-mono">{q.points} نقاط</span>
                      </div>
                      <div className="space-y-1 text-slate-600 dark:text-slate-300">
                        {q.options?.map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-lg border ${
                              q.correctAnswerIds?.includes(opt.id)
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 font-bold text-emerald-800 dark:text-emerald-200'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            ({opt.id}) {opt.textAr} {q.correctAnswerIds?.includes(opt.id) && '✓ [إجابة نموذجية]'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
              اختر امتحاناً من القائمة الجانبية أو اضغط "إنشاء امتحان جديد" للبدء.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
