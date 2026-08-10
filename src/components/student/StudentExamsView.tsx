import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, Award, ArrowRight, ArrowLeft, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { Exam, ExamQuestion, ExamAttempt, ExamAttemptAnswer, User } from '../../types';
import {
  fetchExamsFromFirestore, fetchExamQuestions, submitExamAttemptToFirestore,
  fetchStudentExamAttempts, canUserAccessContent
} from '../../services/firebaseService';

interface Props {
  currentUser: User | null;
  onAwardXp: (amount: number, reason: string) => void;
}

export const StudentExamsView: React.FC<Props> = ({ currentUser, onAwardXp }) => {
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [studentAttempts, setStudentAttempts] = useState<ExamAttempt[]>([]);

  // Active Taking State
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result Modal
  const [completedAttempt, setCompletedAttempt] = useState<ExamAttempt | null>(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Timer countdown effect
  useEffect(() => {
    if (!activeExam || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeExam, timeLeftSeconds]);

  const loadData = async () => {
    const list = await fetchExamsFromFirestore();
    const accessible = list.filter((e) => canUserAccessContent(currentUser, e.target, e.startAt, e.endAt));
    setAvailableExams(accessible);

    if (currentUser?.id) {
      const attempts = await fetchStudentExamAttempts(currentUser.id);
      setStudentAttempts(attempts);
    }
  };

  const handleStartExam = async (exam: Exam) => {
    const questions = await fetchExamQuestions(exam.id);
    if (questions.length === 0) {
      alert('عذراً، هذا الامتحان لا يحتوي على أسئلة حالياً.');
      return;
    }
    setActiveExam(exam);
    setActiveQuestions(questions);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setTimeLeftSeconds((exam.durationMinutes || 15) * 60);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: [optionId]
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitAttempt();
  };

  const handleSubmitAttempt = async () => {
    if (!activeExam || !currentUser) return;
    setIsSubmitting(true);

    let earnedPoints = 0;
    const totalPoints = activeQuestions.reduce((sum, q) => sum + q.points, 0) || 100;
    const answers: ExamAttemptAnswer[] = [];

    activeQuestions.forEach((q) => {
      const userAns = selectedAnswers[q.id] || [];
      const isCorrect =
        q.correctAnswerIds &&
        userAns.length === q.correctAnswerIds.length &&
        userAns.every((val) => q.correctAnswerIds?.includes(val));

      const pointsForQ = isCorrect ? q.points : 0;
      earnedPoints += pointsForQ;

      answers.push({
        questionId: q.id,
        selectedAnswerIds: userAns,
        pointsAwarded: pointsForQ,
        isGraded: true
      });
    });

    const percentage = Math.round((earnedPoints / (totalPoints || 1)) * 100);
    const passed = percentage >= (activeExam.passingScore || 50);

    const attempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      examId: activeExam.id,
      studentId: currentUser.id,
      studentName: currentUser.name || 'طالب SmartTech',
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      attemptNumber: (studentAttempts.filter((a) => a.examId === activeExam.id).length || 0) + 1,
      status: 'GRADED',
      score: earnedPoints,
      totalPoints,
      percentage,
      passed,
      answers
    };

    await submitExamAttemptToFirestore(attempt);

    if (passed) {
      onAwardXp(100, `اجتياز امتحان "${activeExam.titleAr}" بنسبة ${percentage}% 🎉`);
    }

    setCompletedAttempt(attempt);
    setIsSubmitting(false);
    setActiveExam(null);
    loadData();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Title Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs">
            Dynamic Assessment Engine
          </span>
          <h2 className="text-2xl font-black mt-2">اختبارات وتحديات SmartTech التفاعلية 📝</h2>
          <p className="text-xs text-slate-400">امتحانات ديناميكية مسحوبة مباشرة من قاعدة بيانات Firestore مع التقييم الفوري.</p>
        </div>
      </div>

      {/* Available Exams Cards */}
      {!activeExam && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableExams.map((e) => {
            const myAttempts = studentAttempts.filter((a) => a.examId === e.id);
            const bestScore = myAttempts.length > 0 ? Math.max(...myAttempts.map((a) => a.percentage)) : null;

            return (
              <div
                key={e.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-red-500 transition group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-600 font-extrabold text-[10px]">
                      {e.examType}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" /> {e.durationMinutes} دقيقة
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-red-600 transition">
                    {e.titleAr}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {e.descriptionAr || 'اختبار تقييمي لقياس الفهم البرمجي والذكاء الاصطناعي.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300 font-bold">
                    <span>درجة النجاح: {e.passingScore}%</span>
                    {bestScore !== null && (
                      <span className="text-emerald-600 font-extrabold">أعلى نتيجة: {bestScore}%</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartExam(e)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> بدْء الاختبار الآن 🚀
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Exam Taking Interface Modal/Screen */}
      {activeExam && activeQuestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-red-500 shadow-2xl space-y-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-400 font-bold">جاري تأدية الاختبار:</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{activeExam.titleAr}</h3>
            </div>

            <div className="flex items-center gap-4 bg-slate-950 text-white px-5 py-2.5 rounded-2xl border border-slate-800 font-mono text-sm font-bold">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>الوقت المتبقي: {formatTime(timeLeftSeconds)}</span>
            </div>
          </div>

          {/* Question Stepper Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-extrabold text-slate-600 dark:text-slate-400">
              <span>السؤال {currentQuestionIdx + 1} من {activeQuestions.length}</span>
              <span>درجة السؤال: {activeQuestions[currentQuestionIdx].points} نقاط</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / activeQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question Body */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-relaxed">
              {activeQuestions[currentQuestionIdx].questionAr}
            </h4>

            {/* Options */}
            <div className="space-y-3">
              {activeQuestions[currentQuestionIdx].options?.map((opt) => {
                const isSelected = selectedAnswers[activeQuestions[currentQuestionIdx].id]?.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(activeQuestions[currentQuestionIdx].id, opt.id)}
                    className={`w-full p-4 rounded-2xl border text-right font-bold text-sm transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200 shadow'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span>({opt.id}) {opt.textAr}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
            <button
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" /> السؤال السابق
            </button>

            {currentQuestionIdx < activeQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                السؤال التالي <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitAttempt}
                disabled={isSubmitting}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> إنهاء وتسليم الاختبار ✅
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed Result Dialog */}
      {completedAttempt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-8 text-center space-y-6 shadow-2xl dir-rtl">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">نتيجة الاختبار التفاعلي</h3>
              <p className="text-xs text-slate-400 mt-1">تم حفظ نتيجتك بـ Firestore بنجاح!</p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="text-4xl font-black text-red-600 font-mono">
                {completedAttempt.percentage}%
              </div>
              <div className="font-extrabold text-sm text-slate-700 dark:text-slate-200">
                الدرجة الإجمالية: {completedAttempt.score} / {completedAttempt.totalPoints} نقاط
              </div>
              <div className={`inline-block px-4 py-1.5 rounded-full font-bold text-xs ${
                completedAttempt.passed
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                  : 'bg-red-100 dark:bg-red-950 text-red-600'
              }`}>
                {completedAttempt.passed ? 'ممتاز! تم اجتياز الاختبار بنجاح 🎉' : 'حاول مرة أخرى في المحاولة القادمة 💪'}
              </div>
            </div>

            <button
              onClick={() => setCompletedAttempt(null)}
              className="w-full py-3 bg-red-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              العودة إلى قائمة الاختبارات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
