import React, { useState, useEffect } from 'react';
import { 
  Users, Key, Lock, Unlock, Play, Pause, Calendar, Plus, Search, Filter, 
  CheckCircle, AlertCircle, RefreshCw, Clock, Shield, Eye, Download, ChevronRight, FileText, Video, Cpu, Trophy
} from 'lucide-react';
import { Course, User, EnrollmentRecord, CourseAccessStatus, CourseMaterial, StudentMaterialAccess } from '../../types';
import { 
  getAllEnrollmentsFromFirestore, saveEnrollmentToFirestore, updateEnrollmentStatusInFirestore, 
  openAllCourseMaterialsForEnrollment, extendEnrollmentDuration, setMaterialAccessOverrideInFirestore,
  fetchCourseMaterialsFromFirestore, getStudentMaterialOverrides
} from '../../services/entitlementService';
import { fetchAllUsersFromFirestore } from '../../services/firebaseService';

interface EnrollmentsCMSProps {
  courses: Course[];
}

export const EnrollmentsCMS: React.FC<EnrollmentsCMSProps> = ({ courses }) => {
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<EnrollmentRecord | null>(null);
  const [showExtendModal, setShowExtendModal] = useState<EnrollmentRecord | null>(null);

  // Form states
  const [newStudentId, setNewStudentId] = useState<string>('');
  const [newCourseId, setNewCourseId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<CourseAccessStatus>('ACTIVE');
  const [newOpenAll, setNewOpenAll] = useState<boolean>(true);
  const [newStartDate, setNewStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState<string>(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Material override management state inside Detail Modal
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [materialOverrides, setMaterialOverrides] = useState<Record<string, StudentMaterialAccess>>({});
  const [materialsLoading, setMaterialsLoading] = useState<boolean>(false);
  const [extendDays, setExtendDays] = useState<number>(30);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allEnrollments, allUsers] = await Promise.all([
        getAllEnrollmentsFromFirestore(),
        fetchAllUsersFromFirestore()
      ]);
      setEnrollments(allEnrollments);
      setStudents(allUsers.filter(u => u.role === 'STUDENT' || u.role === 'GUEST'));
    } catch (err) {
      console.error('Error loading enrollments data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetailModal = async (enrollment: EnrollmentRecord) => {
    setShowDetailModal(enrollment);
    setMaterialsLoading(true);
    try {
      const [mats, overrides] = await Promise.all([
        fetchCourseMaterialsFromFirestore(enrollment.courseId),
        getStudentMaterialOverrides(enrollment.studentId, enrollment.courseId)
      ]);
      setCourseMaterials(mats);
      setMaterialOverrides(overrides);
    } catch (err) {
      console.error('Error fetching materials for enrollment:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleOpenAllToggle = async (enrollmentId: string, currentVal: boolean) => {
    try {
      await openAllCourseMaterialsForEnrollment(enrollmentId, !currentVal);
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, openAllMaterials: !currentVal, status: 'ACTIVE' } : e));
      if (showDetailModal && showDetailModal.id === enrollmentId) {
        setShowDetailModal({ ...showDetailModal, openAllMaterials: !currentVal, status: 'ACTIVE' });
      }
    } catch (err) {
      alert('حدث خطأ أثناء تعديل التراخيص');
    }
  };

  const handleStatusChange = async (enrollmentId: string, status: CourseAccessStatus) => {
    try {
      await updateEnrollmentStatusInFirestore(enrollmentId, status);
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status } : e));
      if (showDetailModal && showDetailModal.id === enrollmentId) {
        setShowDetailModal({ ...showDetailModal, status });
      }
    } catch (err) {
      alert('حدث خطأ أثناء تغيير حالة الاشتراك');
    }
  };

  const handleExtendAccess = async () => {
    if (!showExtendModal) return;
    try {
      const newEndDate = await extendEnrollmentDuration(showExtendModal.id, extendDays);
      setEnrollments(prev => prev.map(e => e.id === showExtendModal.id ? { ...e, endDate: newEndDate, status: 'ACTIVE' } : e));
      alert(`تم تمديد فترة الاشتراك بنجاح حتى ${new Date(newEndDate).toLocaleDateString('ar-EG')}`);
      setShowExtendModal(null);
    } catch (err) {
      alert('حدث خطأ أثناء تمديد الاشتراك');
    }
  };

  const handleToggleIndividualMaterial = async (materialId: string, currentAccess: 'OPEN' | 'CLOSED' | 'LOCKED' | undefined) => {
    if (!showDetailModal) return;
    const nextAccess = currentAccess === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await setMaterialAccessOverrideInFirestore(
        showDetailModal.studentId,
        showDetailModal.id,
        showDetailModal.courseId,
        materialId,
        nextAccess
      );
      setMaterialOverrides(prev => ({
        ...prev,
        [materialId]: {
          id: `${showDetailModal.studentId}_${materialId}`,
          studentId: showDetailModal.studentId,
          enrollmentId: showDetailModal.id,
          courseId: showDetailModal.courseId,
          materialId,
          access: nextAccess,
          override: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
    } catch (err) {
      alert('حدث خطأ أثناء حظر/إتاحة المادة');
    }
  };

  const handleCreateEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId || !newCourseId) {
      alert('يرجى اختيار الطالب والكورس');
      return;
    }
    const studentObj = students.find(s => s.id === newStudentId);
    const courseObj = courses.find(c => c.id === newCourseId);

    const record: EnrollmentRecord = {
      id: `${newStudentId}_${newCourseId}`,
      studentId: newStudentId,
      studentName: studentObj?.fullName || studentObj?.name || 'طالب',
      studentEmail: studentObj?.email,
      courseId: newCourseId,
      courseNameAr: courseObj?.titleAr || 'كورس',
      status: newStatus,
      startDate: newStartDate,
      endDate: newEndDate,
      openAllMaterials: newOpenAll,
      allowDownload: true,
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await saveEnrollmentToFirestore(record);
      setEnrollments(prev => [record, ...prev.filter(x => x.id !== record.id)]);
      setShowAddModal(false);
      alert('تم إنشاء وتفعيل اشتراك الطالب بنجاح');
    } catch (err) {
      alert('حدث خطأ أثناء حفظ الاشتراك');
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = 
      (e.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.studentEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.courseNameAr || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourseFilter === 'ALL' || e.courseId === selectedCourseFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || e.status === selectedStatusFilter;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStatusBadge = (status: CourseAccessStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1 w-fit"><CheckCircle className="w-3.5 h-3.5" /> فعّال ومفتوح</span>;
      case 'PAUSED':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1 w-fit"><Pause className="w-3.5 h-3.5" /> موقوف مؤقتاً</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs flex items-center gap-1 w-fit"><Clock className="w-3.5 h-3.5" /> منتهي الصلاحية</span>;
      case 'NOT_STARTED':
        return <span className="px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-400 font-bold text-xs flex items-center gap-1 w-fit"><Clock className="w-3.5 h-3.5" /> لم يبدأ بعد</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-xs flex items-center gap-1 w-fit">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs mb-1">
            <Key className="w-4 h-4" />
            <span>نظام التحكم بالاشتراكات والتراخيص المركزية - Course Entitlements</span>
          </div>
          <h2 className="text-2xl font-black text-white">إدارة اشتراكات الطلاب وفتح/إغلاق المحتوى التعليمي</h2>
          <p className="text-xs text-slate-400 mt-1">التحكم الفوري في إتاحة الفيديوهات، العروض، ملفات PDF، المحاكاة، والامتحانات لكل طالب</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> إضافة اشتراك جديد للطالب
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="بحث باسم الطالب، البريد، أو الكورس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <select
          value={selectedCourseFilter}
          onChange={(e) => setSelectedCourseFilter(e.target.value)}
          className="w-full py-3 px-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-red-500"
        >
          <option value="ALL">جميع الكورسات ({courses.length})</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.titleAr}</option>
          ))}
        </select>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="w-full py-3 px-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-red-500"
        >
          <option value="ALL">جميع الحالات (ACTIVE, PAUSED, EXPIRED...)</option>
          <option value="ACTIVE">فعّال (ACTIVE)</option>
          <option value="PAUSED">موقوف (PAUSED)</option>
          <option value="EXPIRED">منتهي (EXPIRED)</option>
          <option value="NOT_STARTED">لم يبدأ (NOT_STARTED)</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">جاري تحميل بيانات اشتراكات الطلاب والتراخيص...</div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400 space-y-3">
          <Shield className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-sm font-bold text-white">لا توجد اشتراكات مطابقة للفلتر الحالية</p>
          <p className="text-xs text-slate-400">يمكنك إضافة اشتراك جديد للطالب وتحديد المواد المتاحة فوراً</p>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">الطالب</th>
                  <th className="p-4">الكورس</th>
                  <th className="p-4">حالة الاشتراك</th>
                  <th className="p-4">ترخيص المواد</th>
                  <th className="p-4">فترة الوصول</th>
                  <th className="p-4 text-center">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredEnrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white">
                      <div>{e.studentName || 'طالب بدون اسم'}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">{e.studentEmail || e.studentId}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-emerald-400">{e.courseNameAr || e.courseId}</span>
                    </td>
                    <td className="p-4">{getStatusBadge(e.status)}</td>
                    <td className="p-4">
                      {e.openAllMaterials ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[11px] inline-flex items-center gap-1">
                          <Unlock className="w-3 h-3" /> جميع المواد مفتوحة
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-[11px] inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> تخصيص محدود / مغلق
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-300">
                      <div>من: {e.startDate ? new Date(e.startDate).toLocaleDateString('ar-EG') : 'الآن'}</div>
                      <div>إلى: {e.endDate ? new Date(e.endDate).toLocaleDateString('ar-EG') : 'غير محدد'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Quick Toggle Open All */}
                        <button
                          onClick={() => handleOpenAllToggle(e.id, e.openAllMaterials)}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-[10px] transition cursor-pointer flex items-center gap-1 ${
                            e.openAllMaterials
                              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                              : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30'
                          }`}
                          title={e.openAllMaterials ? 'إغلاق المحتوى' : 'فتح كل المحتوى'}
                        >
                          {e.openAllMaterials ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          {e.openAllMaterials ? 'إغلاق الكل' : 'فتح كل المحتوى'}
                        </button>

                        {/* Extend Access */}
                        <button
                          onClick={() => setShowExtendModal(e)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                          title="تمديد الاشتراك 30 يوم"
                        >
                          <Calendar className="w-3 h-3" /> +30 يوم
                        </button>

                        {/* Detail / Override Modal */}
                        <button
                          onClick={() => handleOpenDetailModal(e)}
                          className="px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                        >
                          <Shield className="w-3 h-3" /> تخصيص المواد
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Enrollment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-right">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-500" /> إضافة تفعيل/اشتراك جديد للطالب
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateEnrollment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اختر الطالب:</label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">-- اختر طالباً --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName || s.name || 'طالب'} ({s.email || s.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">اختر الكورس المراد التفعيل له:</label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">-- اختر الكورس --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.titleAr}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ بداية الوصول:</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ انتهاء الوصول:</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 font-bold text-emerald-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newOpenAll}
                    onChange={(e) => setNewOpenAll(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 accent-red-600"
                  />
                  <span>OPEN ALL COURSE MATERIALS (فتح جميع مواد الكورس فوراً للطالب)</span>
                </label>
                <p className="text-[10px] text-slate-400">عند تفعيل هذا الخيار، سيتمكن الطالب من الوصول لكافة الفيديوهات، العروض التقديمية، والمشاريع بالكورس.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl shadow-lg cursor-pointer"
                >
                  حفظ وتفعيل الاشتراك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Access Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-right">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> تمديد فترة الوصول للطالب
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              الطالب: <strong className="text-white">{showExtendModal.studentName}</strong> <br />
              الكورس: <strong className="text-emerald-400">{showExtendModal.courseNameAr}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اختر عدد الأيام الإضافية:</label>
              <select
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value={15}>+15 يوماً</option>
                <option value={30}>+30 يوماً (شهر كامل)</option>
                <option value={60}>+60 يوماً (شهرين)</option>
                <option value={90}>+90 يوماً (ثلاثة أشهر)</option>
                <option value={365}>+365 يوماً (سنة كاملة)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExtendModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleExtendAccess}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs shadow-lg cursor-pointer"
              >
                تاكيد التمديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Access Override / Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-right">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[10px] font-bold">
                  Material Entitlement Matrix
                </span>
                <h3 className="text-xl font-black text-white mt-1">تخصيص مواد الكورس للطالب: {showDetailModal.studentName}</h3>
                <p className="text-xs text-slate-400">الكورس: {showDetailModal.courseNameAr}</p>
              </div>
              <button onClick={() => setShowDetailModal(null)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
            </div>

            {/* Global Controls */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white mb-0.5">الوضع العام للاشتراك:</div>
                <div className="text-[11px] text-slate-400">
                  {showDetailModal.openAllMaterials
                    ? 'جميع المواد مفتوحة تلقائياً لهذا الطالب. يمكنك إغلاق مواد محددة أدناه.'
                    : 'المواد مغلقة افتراضياً لهذا الطالب، وتفتح فقط المواد المحددة يدوياً أدناه.'}
                </div>
              </div>
              <button
                onClick={() => handleOpenAllToggle(showDetailModal.id, showDetailModal.openAllMaterials)}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  showDetailModal.openAllMaterials
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {showDetailModal.openAllMaterials ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {showDetailModal.openAllMaterials ? 'CLOSE ALL COURSE MATERIALS' : 'OPEN ALL COURSE MATERIALS'}
              </button>
            </div>

            {/* Individual Materials List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-red-400" /> التحكم الدقيق بمواد الكورس (Material Level Access):
              </h4>

              {materialsLoading ? (
                <div className="py-8 text-center text-xs text-slate-500">جاري تحميل قائمة مواد الكورس والتراخيص الخاصة...</div>
              ) : courseMaterials.length === 0 ? (
                <div className="p-6 bg-slate-950 rounded-2xl text-center text-xs text-slate-400">
                  لا توجد مواد مرفوعة لهذا الكورس بعد في قاعدة البيانات. يتم إضافة المواد عبر [ Content Studio ] بالكورس.
                </div>
              ) : (
                <div className="space-y-2">
                  {courseMaterials.map((mat) => {
                    const override = materialOverrides[mat.id];
                    const isExplicitlyOpen = override?.access === 'OPEN';
                    const isExplicitlyClosed = override?.access === 'CLOSED';
                    const isEffectiveOpen = showDetailModal.openAllMaterials
                      ? !isExplicitlyClosed
                      : isExplicitlyOpen;

                    return (
                      <div
                        key={mat.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                          isEffectiveOpen
                            ? 'bg-emerald-950/20 border-emerald-900/50'
                            : 'bg-slate-950 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isEffectiveOpen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {mat.type === 'VIDEO' && <Video className="w-4 h-4" />}
                            {mat.type === 'PDF' && <FileText className="w-4 h-4" />}
                            {mat.type === 'SIMULATION' && <Cpu className="w-4 h-4" />}
                            {mat.type === 'EXAM' && <Trophy className="w-4 h-4" />}
                            {!['VIDEO', 'PDF', 'SIMULATION', 'EXAM'].includes(mat.type) && <FileText className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{mat.titleAr}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span>نوع: {mat.type}</span>
                              <span>•</span>
                              <span>حالة المادة: {mat.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isEffectiveOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {isEffectiveOpen ? 'مفتوح للطالب' : 'مغلق'}
                          </span>

                          <button
                            onClick={() => handleToggleIndividualMaterial(mat.id, override?.access)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                              isEffectiveOpen
                                ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30'
                                : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30'
                            }`}
                          >
                            {isEffectiveOpen ? 'حظر / إغلاق المادة' : 'سماح / فتح المادة'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDetailModal(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
