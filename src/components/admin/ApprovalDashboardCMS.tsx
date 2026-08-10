import React, { useState, useEffect } from 'react';
import { User, Role, ParentStudentRelationship, TeacherProfile } from '../../types';
import { fetchAllUsersFromFirestore, updateUserApprovalInFirestore, logAuditEventInFirestore } from '../../services/firebaseService';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { ShieldCheck, CheckCircle2, XCircle, Clock, UserCheck, Award, FileText, ExternalLink, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

interface ApprovalDashboardCMSProps {
  currentUser: User | null;
}

export const ApprovalDashboardCMS: React.FC<ApprovalDashboardCMSProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'parents'>('teachers');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [relationshipsList, setRelationshipsList] = useState<ParentStudentRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignedCoursesInput, setAssignedCoursesInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    const users = await fetchAllUsersFromFirestore();
    setUsersList(users);

    try {
      const relSnap = await getDocs(collection(db, 'parentStudentRelationships'));
      const rels: ParentStudentRelationship[] = [];
      relSnap.forEach(d => rels.push({ id: d.id, ...d.data() } as ParentStudentRelationship));
      setRelationshipsList(rels);
    } catch (e) {
      console.warn('Failed to load relationships:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveTeacher = async (user: User) => {
    if (!currentUser) return;
    const coursesToAssign = assignedCoursesInput 
      ? assignedCoursesInput.split(',').map(s => s.trim()) 
      : (user.teacherProfile?.requestedCourses || ['AI Junior']);

    await updateUserApprovalInFirestore(user.id, 'APPROVED', currentUser, reviewNotes || 'تم قبول الطلب واعتماد المدرب', coursesToAssign);
    alert(`تمت موافقة اعتماد المدرب ${user.name} بنجاح!`);
    setSelectedUser(null);
    setReviewNotes('');
    loadData();
  };

  const handleRejectTeacher = async (user: User) => {
    if (!currentUser) return;
    await updateUserApprovalInFirestore(user.id, 'REJECTED', currentUser, reviewNotes || 'يتطلب تعديل البيانات');
    alert(`تم رفض الطلب وإبلاغ ${user.name}`);
    setSelectedUser(null);
    setReviewNotes('');
    loadData();
  };

  const handleApproveStudent = async (user: User) => {
    if (!currentUser) return;
    await updateUserApprovalInFirestore(user.id, 'ACTIVE', currentUser, reviewNotes || 'تم تفعيل حساب الطالب');
    alert(`تم قبول وتفعيل حساب الطالب ${user.name}`);
    loadData();
  };

  const handleApproveRelationship = async (relId: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'parentStudentRelationships', relId), {
        status: 'ACTIVE',
        approvedBy: currentUser.id,
        approvedAt: new Date().toISOString()
      });
      alert('تم ربط ولي الأمر بالطالب بنجاح!');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const pendingTeachers = usersList.filter(u => u.role === Role.TEACHER && (u.approvalStatus === 'PENDING_APPROVAL' || u.approvalStatus === 'UNDER_REVIEW' || !u.approvalStatus));
  const pendingStudents = usersList.filter(u => u.role === Role.STUDENT && (u.approvalStatus === 'PENDING_APPROVAL' || u.approvalStatus === 'UNDER_REVIEW'));
  const pendingRelationships = relationshipsList.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-white flex items-center justify-between shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 border border-amber-500/20">
            <UserCheck className="w-4 h-4" /> SmartTech Approval Engine
          </span>
          <h2 className="text-2xl font-black mt-1">مركز اعتماد طلبات الانضمام (Approvals CMS)</h2>
          <p className="text-xs text-slate-400">راجع واعتمد حسابات المدربين والطلاب وطلبات ربط أولياء الأمور.</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" /> تحديث القائمة
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'teachers' ? 'bg-red-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Award className="w-4 h-4" /> طلبات انضمام المدربين ({pendingTeachers.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'students' ? 'bg-red-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <UserCheck className="w-4 h-4" /> طلبات تسجيل الطلاب ({pendingStudents.length})
        </button>
        <button
          onClick={() => setActiveTab('parents')}
          className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'parents' ? 'bg-red-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> ربط أولياء الأمور ({pendingRelationships.length})
        </button>
      </div>

      {/* Pending Teachers View */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          {pendingTeachers.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 font-bold text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p>لا توجد طلبات مدربين قيد الانتظار حالياً. جميع الطلبات معتمدة!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTeachers.map((t) => (
                <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs font-bold">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{t.name}</h4>
                      <p className="text-slate-400 font-mono text-[11px]">{t.email} | {t.phone || 'بدون هاتف'}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-full font-extrabold text-[10px] border border-amber-500/30">
                      {t.approvalStatus || 'PENDING_APPROVAL'}
                    </span>
                  </div>

                  {t.teacherProfile && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl space-y-2 text-[11px]">
                      <div><span className="text-slate-400">المؤهل:</span> {t.teacherProfile.qualifications}</div>
                      <div><span className="text-slate-400">خبرة التدريس:</span> {t.teacherProfile.yearsOfExperience} سنوات</div>
                      <div><span className="text-slate-400">جهة العمل الحالية:</span> {t.teacherProfile.currentWorkplace || 'غير محدد'}</div>
                      <div><span className="text-slate-400">الكورسات المطلوبة:</span> <span className="text-amber-500 font-bold">{t.teacherProfile.requestedCourses?.join(', ') || 'AI Junior'}</span></div>

                      {t.teacherProfile.portfolioItems?.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400 block mb-1">المستندات والـ CV:</span>
                          <div className="space-y-1">
                            {t.teacherProfile.portfolioItems.map((doc, idx) => (
                              <a key={idx} href={doc.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 font-bold">
                                <FileText className="w-3.5 h-3.5" /> {doc.title} ({doc.type}) <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(t);
                        setAssignedCoursesInput(t.teacherProfile?.requestedCourses?.join(', ') || 'AI Junior');
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> فحص واعتماد المدرب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Teacher Approval Form Drawer */}
          {selectedUser && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-white space-y-4 shadow-2xl">
              <h3 className="font-black text-lg text-amber-400">اعتماد طلب المدرب: {selectedUser.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-400 mb-1">تعيين الكورسات المصرح بتدريسها (تفصل بينها فاصلة):</label>
                  <input
                    type="text"
                    value={assignedCoursesInput}
                    onChange={(e) => setAssignedCoursesInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ملاحظات الاعتماد أو أسباب الرفض:</label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    placeholder="تمت مراجعة الـ CV والمقابلة بنجاح."
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleApproveTeacher(selectedUser)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <CheckCircle2 className="w-4 h-4" /> تأكيد اعتماد الحساب كمدرب معتمد (APPROVED)
                </button>
                <button
                  onClick={() => handleRejectTeacher(selectedUser)}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <XCircle className="w-4 h-4" /> طلب تعديل البيانات / رفض (REJECTED)
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pending Students View */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {pendingStudents.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 font-bold text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p>لا توجد حسابات طلاب قيد الموافقة حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingStudents.map((st) => (
                <div key={st.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs font-bold">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{st.name}</h4>
                      <p className="text-slate-400 font-mono text-[11px]">{st.email} | العمر: {st.age || 'غير محدد'}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-full font-extrabold text-[10px]">
                      {st.approvalStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleApproveStudent(st)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> قبول وتفعيل حساب الطالب (ACTIVE)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Parent Relationships View */}
      {activeTab === 'parents' && (
        <div className="space-y-4">
          {pendingRelationships.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 font-bold text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p>لا توجد طلبات ربط أولياء أمور قيد الانتظار.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRelationships.map((rel) => (
                <div key={rel.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs font-bold">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-slate-400">معرف ولي الأمر: {rel.parentId}</span>
                      <h4 className="font-bold text-slate-900 dark:text-white mt-1">طلب ربط بطالب: {rel.studentId}</h4>
                      <p className="text-[10px] text-amber-500 font-extrabold">{rel.relationshipType}</p>
                    </div>
                    <button
                      onClick={() => handleApproveRelationship(rel.id)}
                      className="px-4 py-2 bg-emerald-600 text-white font-extrabold rounded-xl shadow cursor-pointer"
                    >
                      موافقة الربط
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
