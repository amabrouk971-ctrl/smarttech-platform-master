import React, { useState, useEffect } from 'react';
import { 
  Folder, Plus, FileText, Video, Presentation, Link, Download, Eye, Trash2, Edit2, Copy, 
  Users, CheckCircle, AlertCircle, RefreshCw, Search, ShieldAlert, ArrowUpDown, Calendar, Lock, Unlock, Play, FileCheck, Layers
} from 'lucide-react';
import { Course, CourseMaterial, User } from '../../types';
import { 
  fetchAllMaterials, saveMaterial, deleteMaterial, CourseSession, 
  fetchSessionsForCourse, saveCourseSession, deleteCourseSession, reorderCourseSessions,
  fetchMaterialAccessLogs, MaterialAccessLog, isStudentAuthorizedForMaterial
} from '../../services/contentDeliveryService';
import { fetchAllUsersFromFirestore } from '../../services/firebaseService';
import { DragAndDropUploader, UploadResult } from '../common/DragAndDropUploader';
import { ProtectedDocViewer } from '../common/ProtectedDocViewer';
import { ProtectedPresentationViewer } from '../common/ProtectedPresentationViewer';
import { ProtectedVideoPlayer } from '../common/ProtectedVideoPlayer';

interface AdminContentPortalProps {
  courses: Course[];
}

export type ContentPortalSubTab = 
  | 'COURSES' 
  | 'PATHS' 
  | 'UNITS' 
  | 'LESSONS' 
  | 'SESSIONS' 
  | 'MATERIALS' 
  | 'PRESENTATIONS' 
  | 'VIDEOS' 
  | 'ASSIGNMENTS' 
  | 'PROJECTS' 
  | 'LABS' 
  | 'STUDENT_ACCESS' 
  | 'AUDIT_LOGS';

export const AdminContentPortal: React.FC<AdminContentPortalProps> = ({ courses }) => {
  const [activeTab, setActiveTab] = useState<ContentPortalSubTab>('MATERIALS');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  
  // Data states
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<MaterialAccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');

  // Modals / Actions
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<CourseMaterial | null>(null);
  const [selectedStudentForPreview, setSelectedStudentForPreview] = useState<string>('');

  // Editing Material Form State
  const [editingMaterial, setEditingMaterial] = useState<Partial<CourseMaterial> | null>(null);
  
  // Editing Session Form State
  const [editingSession, setEditingSession] = useState<Partial<CourseSession> | null>(null);

  // Selected Material for Student Assignment
  const [assigningMaterial, setAssigningMaterial] = useState<CourseMaterial | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedCourseId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mats, usersData, logsData] = await Promise.all([
        fetchAllMaterials(),
        fetchAllUsersFromFirestore(),
        fetchMaterialAccessLogs()
      ]);

      setMaterials(mats);
      setAllStudents(usersData.filter(u => u.role === 'STUDENT' || (u.role as string) === 'CHILD'));
      setAuditLogs(logsData);

      if (selectedCourseId) {
        const sessList = await fetchSessionsForCourse(selectedCourseId);
        setSessions(sessList);
      }
    } catch (err) {
      console.error('Error loading content data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Materials
  const filteredMaterials = materials.filter(m => {
    if (selectedCourseId && m.courseId && m.courseId !== selectedCourseId) return false;
    if (typeFilter !== 'ALL' && m.fileType !== typeFilter && m.type !== typeFilter) return false;
    if (visibilityFilter !== 'ALL' && m.visibility !== visibilityFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = m.titleAr?.toLowerCase().includes(term) || m.titleEn?.toLowerCase().includes(term);
      const matchDesc = m.descriptionAr?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Save / Upload Material
  const handleSaveMaterial = async () => {
    if (!editingMaterial?.titleAr) return;

    const newMat: CourseMaterial = {
      id: editingMaterial.id || `mat-${Date.now()}`,
      titleAr: editingMaterial.titleAr || '',
      titleEn: editingMaterial.titleEn || '',
      descriptionAr: editingMaterial.descriptionAr || '',
      fileUrl: editingMaterial.fileUrl || '',
      storagePath: editingMaterial.storagePath || '',
      fileType: editingMaterial.fileType || 'PDF',
      type: editingMaterial.type || 'PDF',
      mimeType: editingMaterial.mimeType || 'application/pdf',
      fileSize: editingMaterial.fileSize || 0,
      courseId: selectedCourseId || editingMaterial.courseId || '',
      unitId: editingMaterial.unitId || '',
      lessonId: editingMaterial.lessonId || '',
      sessionId: editingMaterial.sessionId || '',
      visibility: editingMaterial.visibility || 'ENROLLED_STUDENTS',
      accessType: editingMaterial.accessType || 'ALL_ENROLLED_STUDENTS',
      assignedStudentIds: editingMaterial.assignedStudentIds || [],
      allowDownload: editingMaterial.allowDownload ?? false,
      studentOnly: editingMaterial.studentOnly ?? false,
      requiresEnrollment: editingMaterial.requiresEnrollment ?? true,
      status: editingMaterial.status || 'AVAILABLE',
      availableFrom: editingMaterial.availableFrom || '',
      availableUntil: editingMaterial.availableUntil || '',
      createdAt: editingMaterial.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveMaterial(newMat);
    setEditingMaterial(null);
    setIsUploadModalOpen(false);
    loadData();
  };

  const handleDuplicateMaterial = async (mat: CourseMaterial) => {
    const duplicated: CourseMaterial = {
      ...mat,
      id: `mat-${Date.now()}`,
      titleAr: `${mat.titleAr} (نسخة)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveMaterial(duplicated);
    loadData();
  };

  const handleDeleteMaterial = async (mat: CourseMaterial) => {
    if (window.confirm(`هل أنت تأكد من حذف المادة "${mat.titleAr}"؟ سيتم حذف البيانات من قاعدة البيانات والتخزين.`)) {
      await deleteMaterial(mat.id, mat.storagePath);
      loadData();
    }
  };

  // Handle Upload Completion
  const handleUploadSuccess = (res: UploadResult) => {
    setEditingMaterial({
      ...editingMaterial,
      titleAr: editingMaterial?.titleAr || res.fileName,
      fileUrl: res.fileUrl,
      storagePath: res.storagePath,
      fileType: res.fileType as any,
      mimeType: res.mimeType,
      fileSize: res.fileSize
    });
  };

  // Sessions Logic
  const handleSaveSession = async () => {
    if (!editingSession?.titleAr || !selectedCourseId) return;

    const newSess: CourseSession = {
      id: editingSession.id || `sess-${Date.now()}`,
      courseId: selectedCourseId,
      unitId: editingSession.unitId || '',
      lessonId: editingSession.lessonId || '',
      titleAr: editingSession.titleAr || '',
      descriptionAr: editingSession.descriptionAr || '',
      orderIndex: editingSession.orderIndex ?? sessions.length,
      status: editingSession.status || 'PUBLISHED',
      startDate: editingSession.startDate || '',
      startTime: editingSession.startTime || '',
      endTime: editingSession.endTime || '',
      meetingType: editingSession.meetingType || 'OFFLINE',
      room: editingSession.room || '',
      meetingUrl: editingSession.meetingUrl || '',
      createdAt: editingSession.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveCourseSession(newSess);
    setEditingSession(null);
    setIsSessionModalOpen(false);
    loadData();
  };

  const handleDeleteSession = async (sessId: string) => {
    if (window.confirm('هل أنت تأكد من حذف هذه الجلسة التعليمية؟')) {
      await deleteCourseSession(sessId);
      loadData();
    }
  };

  const handleMoveSession = async (index: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === sessions.length - 1)) return;
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;

    const updatedSessions = [...sessions];
    const temp = updatedSessions[index];
    updatedSessions[index] = updatedSessions[targetIndex];
    updatedSessions[targetIndex] = temp;

    // Update order indexes
    const reorders = updatedSessions.map((s, idx) => ({ id: s.id, orderIndex: idx }));
    setSessions(updatedSessions);
    await reorderCourseSessions(reorders);
  };

  // Student Assignment Handler
  const handleOpenAssignModal = (mat: CourseMaterial) => {
    setAssigningMaterial(mat);
    setSelectedStudentIds(mat.assignedStudentIds || []);
    setIsAssignModalOpen(true);
  };

  const handleSaveStudentAssignment = async () => {
    if (!assigningMaterial) return;
    const updated: CourseMaterial = {
      ...assigningMaterial,
      assignedStudentIds: selectedStudentIds,
      accessType: selectedStudentIds.length > 0 ? 'SPECIFIC_STUDENTS' : 'ALL_ENROLLED_STUDENTS',
      visibility: selectedStudentIds.length > 0 ? 'SPECIFIC_STUDENTS' : 'ENROLLED_STUDENTS'
    };
    await saveMaterial(updated);
    setIsAssignModalOpen(false);
    loadData();
  };

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleSelectAllStudents = () => {
    setSelectedStudentIds(filteredStudents.map(s => s.id));
  };

  const handleDeselectAllStudents = () => {
    setSelectedStudentIds([]);
  };

  const filteredStudents = allStudents.filter(s => {
    if (!studentSearchTerm) return true;
    const term = studentSearchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term) || s.phone?.includes(term);
  });

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Header */}
      <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Layers className="w-6 h-6 text-red-500" />
            نظام إدارة المحتوى والجلسات والتسليم الرقمي (Admin Content Portal)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة متكاملة للدورات، المسارات، الوحدات، الدروس، الجلسات التفاعلية، المكتبات الرقمية، وصلاحيات الطلاب بدون بيانات صورية.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setEditingMaterial({
                titleAr: '',
                fileType: 'PDF',
                type: 'PDF',
                visibility: 'ENROLLED_STUDENTS',
                status: 'AVAILABLE',
                allowDownload: false
              });
              setIsUploadModalOpen(true);
            }}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> رفع مادة تعليمية جديدة
          </button>

          <button
            onClick={() => {
              setEditingSession({
                titleAr: '',
                status: 'PUBLISHED',
                meetingType: 'OFFLINE'
              });
              setIsSessionModalOpen(true);
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-emerald-400" /> إضافة جلسة جديدة
          </button>
        </div>
      </div>

      {/* Sub-Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'MATERIALS', label: 'المكتبة والمواد الرقمية', icon: FileText, count: materials.length },
          { id: 'SESSIONS', label: 'الجلسات والجدولة', icon: Calendar, count: sessions.length },
          { id: 'PRESENTATIONS', label: 'العروض التقديمية (PPT)', icon: Presentation, count: materials.filter(m => m.fileType === 'PPT' || m.fileType === 'PPTX').length },
          { id: 'VIDEOS', label: 'الفيديوهات الشارحة', icon: Video, count: materials.filter(m => m.fileType === 'VIDEO' || m.fileType === 'MP4').length },
          { id: 'STUDENT_ACCESS', label: 'تخصيص للطلاب والمجموعات', icon: Users, count: allStudents.length },
          { id: 'AUDIT_LOGS', label: 'سجل وصول واستخدام الطلاب', icon: ShieldAlert, count: auditLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ContentPortalSubTab)}
              className={`
                px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition cursor-pointer
                ${isActive 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Course Selector Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">اختر الدورة التدريبية:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full md:w-80 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold dark:text-white"
          >
            <option value="">-- جميع الدورة والمناهج --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.titleAr} ({c.code})</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث في العنوان والمحتوى..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs font-bold dark:text-white"
          />
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'MATERIALS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900 dark:text-white">
              جدول المواد الرقمية والمستندات ({filteredMaterials.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">اسم المادة التعليمية</th>
                  <th className="p-4">نوع الملف</th>
                  <th className="p-4">الوصول والرؤية</th>
                  <th className="p-4">الطلاب المخصصين</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">إمكانية التحميل</th>
                  <th className="p-4">تاريخ الإضافة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      لا توجد مواد تعليمية مطابقة للفلتر المحدد.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                        <div>{mat.titleAr}</div>
                        {mat.fileSize ? (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {(mat.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        ) : null}
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-mono font-bold text-[10px]">
                          {mat.fileType || 'PDF'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                          mat.visibility === 'PUBLIC' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          mat.visibility === 'SPECIFIC_STUDENTS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}>
                          {mat.visibility === 'PUBLIC' ? 'عام للجميع' :
                           mat.visibility === 'SPECIFIC_STUDENTS' ? 'طلاب محددين' : 'المشتركين بالدورة'}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleOpenAssignModal(mat)}
                          className="text-xs text-red-500 hover:underline font-bold flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{mat.assignedStudentIds?.length || 0} طالب</span>
                        </button>
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          mat.status === 'AVAILABLE' || mat.status === 'PUBLISHED' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {mat.status === 'AVAILABLE' || mat.status === 'PUBLISHED' ? 'منشور' : 'مسودة'}
                        </span>
                      </td>

                      <td className="p-4">
                        {mat.allowDownload ? (
                          <span className="text-emerald-500 font-bold text-[11px]">مسموح بالتحميل</span>
                        ) : (
                          <span className="text-amber-500 font-bold text-[11px] flex items-center gap-1">
                            <Lock className="w-3 h-3" /> معاينة محمية فقط
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {mat.createdAt ? new Date(mat.createdAt).toLocaleDateString('ar-EG') : '-'}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setPreviewMaterial(mat)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-500"
                            title="معاينة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingMaterial(mat);
                              setIsUploadModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-amber-500"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDuplicateMaterial(mat)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                            title="تكرار"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteMaterial(mat)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-red-500"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Sessions Management & Reordering */}
      {activeTab === 'SESSIONS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                جدول وترتيب الجلسات التعليمية للدورة ({sessions.length})
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                يمكنك إعادة ترتيب الجلسات فورياً وسيتم تحديث تسلسل العرض لدى جميع الطلاب في قاعدة البيانات.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                لا توجد جلسات تعليمية مضافة لهذه الدورة حتى الآن.
              </div>
            ) : (
              sessions.map((sess, idx) => (
                <div 
                  key={sess.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {/* Move Up / Down controls */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveSession(idx, 'UP')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 disabled:opacity-20 cursor-pointer"
                        title="تحريك لأعلى"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveSession(idx, 'DOWN')}
                        disabled={idx === sessions.length - 1}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 disabled:opacity-20 cursor-pointer"
                        title="تحريك لأسفل"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="w-8 h-8 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sess.titleAr}</h4>
                      <p className="text-[10px] text-slate-400">
                        {sess.startDate || 'بدون تاريخ محدد'} • {sess.meetingType} • {sess.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingSession(sess);
                        setIsSessionModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-bold rounded-xl"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteSession(sess.id)}
                      className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold rounded-xl transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Student Access & Assignment */}
      {activeTab === 'STUDENT_ACCESS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="font-black text-sm text-slate-900 dark:text-white border-b pb-3 border-slate-200 dark:border-slate-800">
            تخصيص المواد والملفات لطلاب محددين (Student Content Delivery)
          </h3>
          <p className="text-xs text-slate-400">
            اختر مادة تعليمية لتحديد الطلاب أو المجموعات المصرح لها بالوصول مع ربط كامل بالقواعد الأمنية.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map(m => (
              <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{m.titleAr}</div>
                  <div className="text-[10px] text-slate-400">مخصص لـ: {m.assignedStudentIds?.length || 0} طالب</div>
                </div>
                <button
                  onClick={() => handleOpenAssignModal(m)}
                  className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  تعديل الطلاب
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Audit Access Logs */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="font-black text-sm text-slate-900 dark:text-white border-b pb-3 border-slate-200 dark:border-slate-800">
            سجل وصول واستخدام المواد التعليمية (Content Access Audit Logs)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold">
                <tr>
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">المادة التعليمية</th>
                  <th className="p-3">نوع الإجراء</th>
                  <th className="p-3">تاريخ ووقت الوصول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">لا توجد سجلات وصول بعد.</td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{log.studentName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{log.materialTitle}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {new Date(log.accessedAt).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload / Edit Material Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl space-y-4 text-right dir-rtl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white border-b pb-2">
              {editingMaterial?.id ? 'تعديل مادة تعليمية' : 'إضافة / رفع مادة تعليمية جديدة'}
            </h3>

            {/* Drag and drop uploader */}
            <DragAndDropUploader
              folderPath={`courses/${selectedCourseId || 'general'}`}
              onUploadSuccess={handleUploadSuccess}
            />

            <div>
              <label className="block text-xs font-bold mb-1 dark:text-slate-300">عنوان المادة التعليمية:</label>
              <input
                type="text"
                value={editingMaterial?.titleAr || ''}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, titleAr: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs font-bold dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 dark:text-slate-300">رابط الملف / الفيديوه المرفوع:</label>
              <input
                type="text"
                value={editingMaterial?.fileUrl || ''}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, fileUrl: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs font-mono dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 dark:text-slate-300">سياسة الوصول:</label>
                <select
                  value={editingMaterial?.visibility || 'ENROLLED_STUDENTS'}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, visibility: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs font-bold dark:text-white"
                >
                  <option value="PUBLIC">عام (لجميع الزوار)</option>
                  <option value="ENROLLED_STUDENTS">المشتركين بالدورة فقط</option>
                  <option value="SPECIFIC_STUDENTS">طلاب محددين بالاسم</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 dark:text-slate-300">إمكانية التحميل:</label>
                <select
                  value={editingMaterial?.allowDownload ? 'YES' : 'NO'}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, allowDownload: e.target.value === 'YES' })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs font-bold dark:text-white"
                >
                  <option value="NO">معاينة محمية فقط (No Download)</option>
                  <option value="YES">السماح بالتحميل المباشر</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveMaterial}
                className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow"
              >
                حفظ المادة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Edit Modal */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl space-y-4 text-right dir-rtl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white border-b pb-2">
              {editingSession?.id ? 'تعديل الجلسة التعليمية' : 'إضافة جلسة تعليمية جديدة'}
            </h3>

            <div>
              <label className="block text-xs font-bold mb-1 dark:text-slate-300">عنوان الجلسة:</label>
              <input
                type="text"
                placeholder="مثال: الجلسة الأولى - أساسيات المحركات والدوائر"
                value={editingSession?.titleAr || ''}
                onChange={(e) => setEditingSession({ ...editingSession, titleAr: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs font-bold dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 dark:text-slate-300">نوع الجلسة:</label>
                <select
                  value={editingSession?.meetingType || 'OFFLINE'}
                  onChange={(e) => setEditingSession({ ...editingSession, meetingType: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs font-bold dark:text-white"
                >
                  <option value="OFFLINE">حضوري بالمقر</option>
                  <option value="ONLINE">أونلاين عبر الزوم/المنصة</option>
                  <option value="HYBRID">مزدوج (حضوري + أونلاين)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 dark:text-slate-300">تاريخ الجلسة:</label>
                <input
                  type="date"
                  value={editingSession?.startDate || ''}
                  onChange={(e) => setEditingSession({ ...editingSession, startDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs font-bold dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setIsSessionModalOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveSession}
                className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow"
              >
                حفظ الجلسة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Assign Modal */}
      {isAssignModalOpen && assigningMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl space-y-4 text-right dir-rtl max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white border-b pb-2">
              تخصيص المادة "{assigningMaterial.titleAr}" للطلاب
            </h3>

            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="بحث باسم الطالب أو البريد الإلكتروني..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border rounded-xl p-2 text-xs font-bold dark:text-white"
              />
              <button onClick={handleSelectAllStudents} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl">
                تحديد الكل
              </button>
              <button onClick={handleDeselectAllStudents} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl">
                إلغاء تحديد الكل
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredStudents.map(student => {
                const isChecked = selectedStudentIds.includes(student.id);
                return (
                  <label key={student.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-bold text-xs dark:text-white">{student.name}</div>
                      <div className="text-[10px] text-slate-400">{student.email}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl">
                إلغاء
              </button>
              <button onClick={handleSaveStudentAssignment} className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow">
                حفظ التخصيص
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl space-y-4">
            <div className="flex items-center justify-between text-white">
              <h3 className="font-bold text-sm">معاينة مادة: {previewMaterial.titleAr}</h3>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl"
              >
                إغلاق المعاينة
              </button>
            </div>

            {previewMaterial.fileType === 'VIDEO' || previewMaterial.fileType === 'MP4' ? (
              <ProtectedVideoPlayer material={previewMaterial} downloadAllowed={previewMaterial.allowDownload} />
            ) : previewMaterial.fileType === 'PPT' || previewMaterial.fileType === 'PPTX' ? (
              <ProtectedPresentationViewer material={previewMaterial} downloadAllowed={previewMaterial.allowDownload} />
            ) : (
              <ProtectedDocViewer material={previewMaterial} downloadAllowed={previewMaterial.allowDownload} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
