import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Save, Trash2, CheckCircle, FileText } from 'lucide-react';
import { Assignment } from '../../types';
import { fetchAssignmentsFromFirestore, saveAssignmentToFirestore } from '../../services/firebaseService';

export const AssignmentCMS: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [titleAr, setTitleAr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [maxScore, setMaxScore] = useState(100);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    const list = await fetchAssignmentsFromFirestore();
    setAssignments(list);
  };

  const handleCreateAssignment = async () => {
    if (!titleAr) return;
    const newAssg: Assignment = {
      id: `assg-${Date.now()}`,
      titleAr,
      descriptionAr: descAr,
      maxScore,
      target: { type: 'EVERYONE' },
      createdAt: new Date().toISOString()
    };

    await saveAssignmentToFirestore(newAssg);
    setTitleAr('');
    setDescAr('');
    loadAssignments();
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-black">إدارة وتكليفات الواجبات والأنشطة (Assignments CMS)</h2>
        <p className="text-xs text-slate-400 mt-1">إنشاء وتوزيع الأنشطة المنزلية مع تحديد الدرجات المستهدفة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Assignment Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-black text-sm text-slate-900 dark:text-white border-b pb-2">إضافة واجب أو مشروع جديد</h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">عنوان الواجب:</label>
            <input
              type="text"
              placeholder="مثال: تطبيق تصميم حاسبة Scratch"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">وصف المطلوب بالتفصيل:</label>
            <textarea
              rows={3}
              placeholder="اكتب تعليمات التسليم وخطوات التنفيذ المطلوبة..."
              value={descAr}
              onChange={(e) => setDescAr(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">الدرجة الكلية للواجب:</label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold"
            />
          </div>

          <button
            onClick={handleCreateAssignment}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> حفظ ونشر الواجب بـ Firestore
          </button>
        </div>

        {/* Existing Assignments List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-black text-sm text-slate-900 dark:text-white border-b pb-2">الواجبات الحالية ({assignments.length})</h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {assignments.map((a) => (
              <div key={a.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{a.titleAr}</span>
                  <span className="text-red-600 font-mono">{a.maxScore} درجة</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">{a.descriptionAr}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
