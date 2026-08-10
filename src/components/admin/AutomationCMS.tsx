import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, getDocs, doc, addDoc, deleteDoc, updateDoc, where } from 'firebase/firestore';
import { Settings, Zap, Trash2, Plus, Play, Pause } from 'lucide-react';
import { AutomationRule, EventType } from '../../types';

export const AutomationCMS: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const snap = await getDocs(collection(db, 'automations'));
      setRules(snap.docs.map(d => ({ id: d.id, ...d.data() } as AutomationRule)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    const newRule: Omit<AutomationRule, 'id'> = {
      name: 'قاعدة جديدة',
      isActive: false,
      triggerEvent: 'ATTENDANCE_ABSENT',
      conditions: [],
      actions: [{ type: 'SEND_NOTIFICATION', targetRole: 'PARENT' as any, message: 'يرجى مراجعة غياب الطالب' }]
    };
    await addDoc(collection(db, 'automations'), newRule);
    fetchRules();
  };

  const handleToggleActive = async (rule: AutomationRule) => {
    await updateDoc(doc(db, 'automations', rule.id), { isActive: !rule.isActive });
    fetchRules();
  };

  
  const runBirthdayJob = async () => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'STUDENT')));
      let count = 0;
      snap.docs.forEach(async (d) => {
        const student = d.data();
        if (student.dateOfBirth) {
          const dob = new Date(student.dateOfBirth);
          if (dob.getMonth() + 1 === month && dob.getDate() === day) {
            count++;
            // Publish Birthday Event
            await addDoc(collection(db, 'events'), {
              id: 'evt_bday_' + d.id + '_' + today.getFullYear(),
              eventType: 'BIRTHDAY',
              studentId: d.id,
              payload: { studentName: student.name },
              status: 'PENDING',
              createdAt: today.toISOString()
            });
          }
        }
      });
      alert('تم تشغيل دورة أعياد الميلاد: ' + count + ' حالة تم رصدها.');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'automations', id));
    fetchRules();
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">جاري تحميل قواعد الأتمتة...</div>;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            محرك الأتمتة (Automation Builder)
          </h2>
          <p className="text-xs text-slate-500 mt-1">قم بإنشاء قواعد تفاعلية تتفاعل مع أحداث المنصة تلقائياً (IF-THIS-THEN-THAT).</p>
        </div>
        
        <button 
          onClick={runBirthdayJob}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 mr-2"
        >
          <Play className="w-4 h-4" /> فحص أعياد الميلاد
        </button>
        <button 
          onClick={handleCreateRule}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> إضافة قاعدة جديدة
        </button>
      </div>

      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-4">
            
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <input 
                  type="text" 
                  value={rule.name}
                  onChange={async (e) => {
                    const newName = e.target.value;
                    setRules(rules.map(r => r.id === rule.id ? { ...r, name: newName } : r));
                  }}
                  onBlur={async (e) => {
                    await updateDoc(doc(db, 'automations', rule.id), { name: e.target.value });
                  }}
                  className="font-black text-lg bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleActive(rule)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
                    rule.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {rule.isActive ? <><Play className="w-3 h-3"/> نشط</> : <><Pause className="w-3 h-3"/> متوقف</>}
                </button>
                <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center font-bold text-sm">
              <div className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-indigo-600 dark:text-indigo-400 block mb-2 text-xs">عندما (WHEN) يحدث الحدث:</span>
                <select 
                  value={rule.triggerEvent}
                  onChange={async (e) => {
                    await updateDoc(doc(db, 'automations', rule.id), { triggerEvent: e.target.value });
                    fetchRules();
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border-none"
                >
                  <option value="ATTENDANCE_ABSENT">تسجيل غياب الطالب</option>
                  <option value="ATTENDANCE_LATE">تسجيل تأخير الطالب</option>
                  <option value="EXAM_GRADED">رصد درجة اختبار</option>
                  <option value="CONCENTRATION_RECORDED">تسجيل مستوى التركيز</option>
                </select>
              </div>

              <div className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-emerald-600 dark:text-emerald-400 block mb-2 text-xs">قم بـ (THEN):</span>
                {rule.actions.map((act, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg flex items-center gap-2">
                    <span>إرسال إشعار إلى</span>
                    <select 
                      value={act.targetRole}
                      onChange={async (e) => {
                        const newActions = [...rule.actions];
                        newActions[idx].targetRole = e.target.value as any;
                        await updateDoc(doc(db, 'automations', rule.id), { actions: newActions });
                        fetchRules();
                      }}
                      className="bg-white dark:bg-slate-700 p-1 rounded border-none text-xs"
                    >
                      <option value="PARENT">ولي الأمر</option>
                      <option value="STUDENT">الطالب</option>
                      <option value="ADMIN">الإدارة</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        ))}
        {rules.length === 0 && (
          <div className="text-center p-10 text-slate-500 font-bold border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            لا توجد أي قواعد أتمتة. قم بإنشاء القاعدة الأولى!
          </div>
        )}
      </div>
    </div>
  );
};
