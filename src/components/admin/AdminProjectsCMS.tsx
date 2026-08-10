import React, { useState, useEffect } from 'react';
import { Project, PresentationSession, Course } from '../../types';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, getDocs } from 'firebase/firestore';
import { Folder, CheckCircle, XCircle, Clock, Presentation, Calendar, Plus, Shield, MapPin, UserCheck, AlertTriangle } from 'lucide-react';

interface AdminProjectsCMSProps {
  courses?: Course[];
}

export const AdminProjectsCMS: React.FC<AdminProjectsCMSProps> = ({ courses = [] }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<PresentationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'sessions'>('projects');

  // Presentation Session Creator
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionCourseId, setSessionCourseId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionStartTime, setSessionStartTime] = useState('16:00');
  const [sessionEndTime, setSessionEndTime] = useState('18:00');
  const [sessionLocation, setSessionLocation] = useState('قاعة سمارتك الأولى - زيزينيا الإسكندرية');

  // Assign Presentation Modal
  const [targetSessionId, setTargetSessionId] = useState('');
  const [presentationRestriction, setPresentationRestriction] = useState<'ONLY_THIS_SESSION' | 'ANY_SESSION'>('ONLY_THIS_SESSION');

  useEffect(() => {
    // Fetch Projects
    const qP = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubP = onSnapshot(qP, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
      setProjects(data);
      setLoading(false);
    }, (err) => {
      console.warn('Projects snapshot fallback:', err);
      setLoading(false);
    });

    // Fetch Sessions
    const qS = query(collection(db, 'presentation_sessions'), orderBy('createdAt', 'desc'));
    const unsubS = onSnapshot(qS, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PresentationSession));
      setSessions(data);
    }, (err) => console.warn('Sessions snapshot fallback:', err));

    return () => {
      unsubP();
      unsubS();
    };
  }, []);

  // Mark Ready for Presentation
  const handleMarkReadyForPresentation = async () => {
    if (!selectedProject || !targetSessionId) {
      alert('برجاء اختيار جلسة العرض التقديمي أولاً!');
      return;
    }

    try {
      await updateDoc(doc(db, 'projects', selectedProject.id), {
        status: 'READY_FOR_PRESENTATION',
        presentationSessionId: targetSessionId,
        presentationRestriction,
        readyForPresentationAt: new Date().toISOString(),
        readyBy: 'Admin'
      });

      alert('تم إعطاء إذن العرض التقديمي للمشروع وتحديد الجلسة المقيدة بنجاح! 🚀');
      setSelectedProject(null);
    } catch (err) {
      console.error('Update presentation status error:', err);
      alert('حدث خطأ أثناء تعديل حالة التقديم');
    }
  };

  // Create New Session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim() || !sessionCourseId) return;

    const sessionId = 'session_' + Date.now();
    const newSession: PresentationSession = {
      id: sessionId,
      sessionName: sessionName.trim(),
      courseId: sessionCourseId,
      date: sessionDate,
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      location: sessionLocation,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString()
    };

    setSessions((prev) => [newSession, ...prev]);
    try {
      await setDoc(doc(db, 'presentation_sessions', sessionId), newSession);
    } catch (err) {
      console.warn('Firestore set session error:', err);
    }

    setShowSessionModal(false);
    setSessionName('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY_FOR_PRESENTATION':
        return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-extrabold flex items-center gap-1 border border-amber-500/30"><Presentation className="w-3 h-3" /> جاهز للعرض 🎤</span>;
      case 'PRESENTED':
        return <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-extrabold flex items-center gap-1 border border-indigo-500/30"><UserCheck className="w-3 h-3" /> تم العرض</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-[10px] font-extrabold flex items-center gap-1 border border-emerald-500/30"><CheckCircle className="w-3 h-3" /> معتمد 🎉</span>;
      case 'NEEDS_REVISION':
        return <span className="px-2.5 py-1 bg-red-500/20 text-red-300 rounded-lg text-[10px] font-extrabold flex items-center gap-1 border border-red-500/30"><XCircle className="w-3 h-3" /> مراجعة مطلوية</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> قيد التنفيذ</span>;
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header & Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Folder className="w-6 h-6 text-indigo-400" />
            <span>نظام التحكم بمشاريع الطلاب وجلسات العرض (Presentation Sessions) 🎓</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            إدارة حالة المشاريع، فتح إذن العرض التقديمي (Ready for Presentation)، وتحديد مواعيد وقاعات الجلسات.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSessionModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>جلسة عرض جديدة</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}
        >
          مشاريع الطلاب ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'sessions' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}
        >
          جلسات العرض المقيدة ({sessions.length})
        </button>
      </div>

      {activeTab === 'projects' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400 font-bold">جاري تحميل المشاريع...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-bold space-y-2">
              <Folder className="w-10 h-10 mx-auto text-slate-700" />
              <p>لا توجد مشاريع مضافة حالياً.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="p-3">اسم المشروع</th>
                    <th className="p-3">الطالب</th>
                    <th className="p-3">الكورس</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">إجراء العرض التقديمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-bold">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3">
                        <div className="text-white font-extrabold">{proj.title}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{proj.description}</div>
                      </td>
                      <td className="p-3 text-indigo-400">{proj.studentName}</td>
                      <td className="p-3 text-slate-400">{proj.courseTitleAr || proj.courseId}</td>
                      <td className="p-3">{getStatusBadge(proj.status)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedProject(proj)}
                          className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-xl text-[11px] font-extrabold transition cursor-pointer"
                        >
                          تحديد حالة العرض 🎤
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((sess) => (
            <div key={sess.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 text-[10px] font-bold">
                  {sess.status}
                </span>
                <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{sess.date} ({sess.startTime} - {sess.endTime})</span>
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-white">{sess.sessionName}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{sess.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Session Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-5 text-right">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Presentation className="w-5 h-5 text-amber-400" />
              <span>إرسال إذن العرض التقديمي لـ: {selectedProject.title}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">حدد جلسة العرض المسموح بها: *</label>
                <select
                  value={targetSessionId}
                  onChange={(e) => setTargetSessionId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                >
                  <option value="">-- اختر جلسة العرض التقديمي --</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.sessionName} ({s.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">قيود العرض التقديمي: *</label>
                <select
                  value={presentationRestriction}
                  onChange={(e) => setPresentationRestriction(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                >
                  <option value="ONLY_THIS_SESSION">يُسمح بالعرض في هذه الجلسة المحددة فقط (ONLY_THIS_SESSION)</option>
                  <option value="ANY_SESSION">يُسمح بالعرض في أي جلسة مفتوحة</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleMarkReadyForPresentation}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg"
              >
                تأكيد وقيد العرض 🎤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateSession} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-4 text-right">
            <h3 className="text-base font-black text-white">إنشاء جلسة عرض تقديمية مقيدة جديد</h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">اسم الجلسة: *</label>
              <input
                type="text"
                required
                placeholder="مثال: جلسة عرض مشاريع الذكاء الاصطناعي - الموعد 4"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">الكورس التابع:</label>
              <select
                value={sessionCourseId}
                onChange={(e) => setSessionCourseId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
              >
                <option value="">-- اختر الكورس --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titleAr}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">التاريخ:</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">من:</label>
                <input
                  type="time"
                  value={sessionStartTime}
                  onChange={(e) => setSessionStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">إلى:</label>
                <input
                  type="time"
                  value={sessionEndTime}
                  onChange={(e) => setSessionEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSessionModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg"
              >
                حفظ الجلسة 🚀
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
