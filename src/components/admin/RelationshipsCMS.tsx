import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, getDocs, doc, setDoc, where } from 'firebase/firestore';
import { Users, Plus, ShieldCheck, UserCheck } from 'lucide-react';
import { User, ParentStudentRelationship } from '../../types';

export const RelationshipsCMS: React.FC = () => {
  const [parents, setParents] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [relationships, setRelationships] = useState<ParentStudentRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedParent, setSelectedParent] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'PARENT')));
      setParents(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));

      const sSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'STUDENT')));
      setStudents(sSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));

      const rSnap = await getDocs(collection(db, 'parentStudentRelationships'));
      setRelationships(rSnap.docs.map(d => ({ id: d.id, ...d.data() } as ParentStudentRelationship)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedParent || !selectedStudent) return;
    try {
      // The crucial part: The ID must be parentId_studentId for the Firestore rules to work!
      const relId = `${selectedParent}_${selectedStudent}`;
      const relData = {
        parentId: selectedParent,
        studentId: selectedStudent,
        status: 'ACTIVE',
        verifiedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'parentStudentRelationships', relId), relData);
      
      alert('تم ربط ولي الأمر بالطالب بنجاح وتفعيل الصلاحيات (ReBAC)');
      setSelectedParent('');
      setSelectedStudent('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الربط');
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">جاري تحميل البيانات...</div>;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          إدارة صلاحيات أولياء الأمور (ReBAC)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          بناءً على سياسة الأمان، لا يمكن لولي الأمر رؤية بيانات أي طالب إلا بعد الربط الرسمي هنا.
        </p>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">اختر حساب ولي الأمر:</label>
          <select 
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-sm font-bold"
          >
            <option value="">-- اختر ولي الأمر --</option>
            {parents.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">اختر حساب الطالب (الابن):</label>
          <select 
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-sm font-bold"
          >
            <option value="">-- اختر الطالب --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleLink}
          disabled={!selectedParent || !selectedStudent}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" /> ربط واعتماد
        </button>
      </div>

      <div>
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">الروابط المعتمدة حالياً</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
              <tr>
                <th className="p-3 rounded-tr-xl">اسم ولي الأمر</th>
                <th className="p-3">اسم الطالب المرتبط</th>
                <th className="p-3">حالة الربط</th>
                <th className="p-3 rounded-tl-xl">تاريخ الاعتماد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
              {relationships.map(rel => {
                const p = parents.find(x => x.id === rel.parentId);
                const s = students.find(x => x.id === rel.studentId);
                return (
                  <tr key={rel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 text-slate-900 dark:text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      {p?.name || 'غير معروف'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{s?.name || 'غير معروف'}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs">{rel.status}</span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs">
                      {rel.verifiedAt ? new Date(rel.verifiedAt).toLocaleDateString('ar-EG') : '-'}
                    </td>
                  </tr>
                );
              })}
              {relationships.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-500 text-xs">لا توجد أي روابط مسجلة بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
