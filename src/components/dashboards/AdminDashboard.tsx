import React, { useState, useEffect } from 'react';
import { Course, User } from '../../types';
import { Zap, ShieldAlert, Users, Plus, Edit2, Trash2, Save, Camera, Eye, Activity, QrCode, FileText, BookOpen, Megaphone, CreditCard, Folder, Cpu, UserCheck, Shield, Key, Paintbrush, Database, RefreshCw } from 'lucide-react';
import { saveCourseToFirestore, deleteCourseFromFirestore, fetchActivityLogsFromFirestore, seedAllCoursesToFirestore } from '../../services/firebaseService';
import { QrAttendanceScanner } from '../QrAttendanceScanner';
import { SiteCustomizerModal } from '../SiteCustomizerModal';
import { ExamCMS } from '../admin/ExamCMS';
import { AssignmentCMS } from '../admin/AssignmentCMS';
import { AnnouncementCMS } from '../admin/AnnouncementCMS';
import { MaterialCMS } from '../admin/MaterialCMS';
import { SimulationBuilderCMS } from '../admin/SimulationBuilderCMS';
import { AdminProjectsCMS } from '../admin/AdminProjectsCMS';
import { RelationshipsCMS } from '../admin/RelationshipsCMS';
import { AutomationCMS } from '../admin/AutomationCMS';
import { ApprovalDashboardCMS } from '../admin/ApprovalDashboardCMS';
import { PermissionManagerCMS } from '../admin/PermissionManagerCMS';
import { AuditLogsCMS } from '../admin/AuditLogsCMS';
import { ContentStudioCMS } from '../admin/ContentStudioCMS';
import { RevenueDashboardCMS } from '../admin/RevenueDashboardCMS';
import { LeadManagerCMS } from '../admin/LeadManagerCMS';
import { AcademyMembershipCMS } from '../admin/AcademyMembershipCMS';
import { EmployeeManagerCMS } from '../admin/EmployeeManagerCMS';
import { CourseImageUploader } from '../admin/CourseImageUploader';
import { AdminPaymentSettingsCMS } from '../admin/AdminPaymentSettingsCMS';
import { AdminBookingsCMS } from '../admin/AdminBookingsCMS';
import { MarketingMediaGallery } from '../MarketingMediaGallery';

interface AdminDashboardProps {
  courses: Course[];
  currentUser?: User | null;
  onUpdateCourse: (updated: Course) => void;
  onAddCourse: (newCourse: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onTogglePreviewMode?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  courses,
  currentUser = null,
  onUpdateCourse,
  onAddCourse,
  onDeleteCourse,
  onTogglePreviewMode
}) => {
  const [adminTab, setAdminTab] = useState<'courses' | 'bookings' | 'paymentSettings' | 'revenue' | 'leads' | 'memberships' | 'media' | 'approvals' | 'permissions' | 'audit_logs' | 'exams' | 'assignments' | 'announcements' | 'materials' | 'simulations' | 'projects' | 'relationships' | 'automations'>('courses');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showCustomizerModal, setShowCustomizerModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isSyncingCourses, setIsSyncingCourses] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const handleSyncAllCourses = async () => {
    setIsSyncingCourses(true);
    setSyncStatusMsg(null);
    try {
      const updated = await seedAllCoursesToFirestore(true);
      setSyncStatusMsg(` تم رفع ومزامنة جميع الكورسات (${updated.length} كورس) في قاعدة البيانات Firestore بنجاح!`);
      setTimeout(() => setSyncStatusMsg(null), 5000);
    } catch (err) {
      console.error('Failed to sync courses:', err);
      setSyncStatusMsg('❌ حدث خطأ أثناء المزامنة مع Firestore');
    } finally {
      setIsSyncingCourses(false);
    }
  };

  const [formData, setFormData] = useState<Partial<Course>>({
    titleAr: '',
    originalPrice: 1500,
    discountPrice: 1200,
    summer3MonthsPrice: 3000,
    kitPrice: 1500,
    category: 'programming',
    ageMin: 6,
    ageMax: 12,
    mode: 'Hybrid',
    code: 'NEW-101'
  });

  useEffect(() => {
    fetchActivityLogsFromFirestore().then((logs) => setActivityLogs(logs));
  }, []);

  const handleSaveEdit = async () => {
    if (editingCourse) {
      const updated = { ...editingCourse, ...formData } as Course;
      onUpdateCourse(updated);
      await saveCourseToFirestore(updated);
      setEditingCourse(null);
    }
  };

  const handleSaveNew = async () => {
    const newCourseObj: Course = {
      id: `c-${Date.now()}`,
      code: formData.code || 'CODE-101',
      titleAr: formData.titleAr || 'كورس جديد',
      titleEn: 'New Course',
      category: (formData.category as any) || 'programming',
      ageMin: formData.ageMin || 6,
      ageMax: formData.ageMax || 12,
      mode: (formData.mode as any) || 'Hybrid',
      originalPrice: formData.originalPrice || 1500,
      discountPrice: formData.discountPrice || 1200,
      summer3MonthsPrice: formData.summer3MonthsPrice,
      kitPrice: formData.kitPrice,
      kitNameAr: 'حقيبة المكونات التطبيقية',
      descriptionAr: 'وصف الكورس والتطبيقات العملية.',
      descriptionEn: 'Course Description',
      learningOutcomesAr: ['تطبيق عملي 100%'],
      skills: ['SmartTech'],
      durationWeeks: 12,
      sessionsCount: 12,
      sessionMinutes: 90,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      levelAr: 'مستوى مبتدئ',
      learningOutcomesEn: []
    };
    onAddCourse(newCourseObj);
    await saveCourseToFirestore(newCourseObj);
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    onDeleteCourse(id);
    await deleteCourseFromFirestore(id);
  };

  return (
    <div className="space-y-8 dir-rtl text-right">
      {/* Header Controls */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <ShieldAlert className="w-4 h-4" /> DYNAMIC CMS & FIRESTORE LMS CONTROL CENTER
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">مركز الإدارة والتحكم الديناميكي الشامل</h2>
          <p className="text-xs text-slate-400">
            أدِر الكورسات، الامتحانات، الأسئلة، الواجبات، والإعلانات بـ Firestore بدون كود معتمد.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncAllCourses}
            disabled={isSyncingCourses}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            {isSyncingCourses ? (
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
            ) : (
              <Database className="w-4 h-4 text-cyan-300" />
            )}
            {isSyncingCourses ? 'جاري رفع الكورسات لـ Firestore...' : 'رفع ومزامنة جميع الكورسات بـ Firestore ⚡'}
          </button>

          <button
            onClick={() => setShowCustomizerModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Paintbrush className="w-4 h-4 animate-pulse" /> تعديل الشعار والخطوط والألوان 🎨
          </button>

          {onTogglePreviewMode && (
            <button
              onClick={onTogglePreviewMode}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Eye className="w-4 h-4" /> معاينة كعميل (Preview Mode)
            </button>
          )}

          <button
            onClick={() => setShowScannerModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-400" /> ماسح الكاميرا للحضور 📸
          </button>
        </div>
      </div>

      {syncStatusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold animate-fadeIn flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      <SiteCustomizerModal
        isOpen={showCustomizerModal}
        onClose={() => setShowCustomizerModal(false)}
      />

      {/* Admin Module Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        {[
          { id: 'courses', label: 'الكورسات والأسعار 📚', icon: BookOpen },
          { id: 'employees', label: 'حسابات الموظفين (خديجة، مهيتاب...) 👤', icon: Users },
          { id: 'revenue', label: 'الإيرادات والمعاملات 💰', icon: Zap },
          { id: 'leads', label: 'إدارة الليّدز والواتساب 📞', icon: Users },
          { id: 'memberships', label: 'عضويات الأكاديمية 🎓', icon: UserCheck },
          { id: 'media', label: 'استوديو المحتوى والميديا 🎬', icon: Folder },
          { id: 'approvals', label: 'اعتمادات الطلاب والمدربين ⏳', icon: UserCheck },
          { id: 'permissions', label: 'الأدوار والتراخيص 🛡️', icon: Shield },
          { id: 'audit_logs', label: 'سجلات التدقيق والأمان 📝', icon: Activity },
          { id: 'exams', label: 'منظومة الامتحانات CMS 📝', icon: FileText },
          { id: 'assignments', label: 'الواجبات والتكليفات 📌', icon: Save },
          { id: 'announcements', label: 'الإعلانات والأنباء 📢', icon: Megaphone },
          { id: 'materials', label: 'المكتبة والمواد 📁', icon: Folder },
          { id: 'simulations', label: 'المختبرات والمحاكاة ⚡', icon: Cpu },
          { id: 'projects', label: 'مشاريع الطلاب 🚀', icon: Folder },
          { id: 'relationships', label: 'ربط أولياء الأمور 👨‍👩‍👧', icon: Users },
          { id: 'automations', label: 'الأتمتة التلقائية ⚡', icon: Zap }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-5 py-3 rounded-2xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                adminTab === tab.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active CMS Tab */}
      {adminTab === 'employees' && <EmployeeManagerCMS currentUser={currentUser} />}
      {adminTab === 'revenue' && <RevenueDashboardCMS currentUser={currentUser} />}
      {adminTab === 'leads' && <LeadManagerCMS currentUser={currentUser} />}
      {adminTab === 'memberships' && <AcademyMembershipCMS currentUser={currentUser} />}
      {adminTab === 'media' && <ContentStudioCMS currentUser={currentUser} />}
      {adminTab === 'approvals' && <ApprovalDashboardCMS currentUser={currentUser} />}
      {adminTab === 'permissions' && <PermissionManagerCMS currentUser={currentUser} />}
      {adminTab === 'audit_logs' && <AuditLogsCMS />}
      {adminTab === 'exams' && <ExamCMS />}
      {adminTab === 'assignments' && <AssignmentCMS />}
      {adminTab === 'announcements' && <AnnouncementCMS />}
      {adminTab === 'materials' && <MaterialCMS />}
      {adminTab === 'simulations' && <SimulationBuilderCMS />}
      {adminTab === 'projects' && <AdminProjectsCMS />}
      {adminTab === 'relationships' && <RelationshipsCMS />}
      {adminTab === 'automations' && <AutomationCMS />}

      {adminTab === 'bookings' && <AdminBookingsCMS currentUser={currentUser} />}
        {adminTab === 'paymentSettings' && <AdminPaymentSettingsCMS />}

        {adminTab === 'courses' && (
        <>
          {/* QR Attendance Scanner Modal */}
          {showScannerModal && (
            <QrAttendanceScanner
              isOpen={showScannerModal}
              onClose={() => setShowScannerModal(false)}
              onAttendanceSuccess={(studentName) => {
                alert(`تم تسجيل حضور ${studentName} بنجاح في نظام Firestore!`);
              }}
            />
          )}

          {/* Add / Edit Course Form Modal */}
          {(editingCourse || showAddForm) && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-red-600" />
                  {editingCourse ? `تعديل كامل كورس: ${editingCourse.titleAr}` : 'إضافة كورس جديد في الأكاديمية'}
                </h3>
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setShowAddForm(false);
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Basic Details & Images */}
              <div className="space-y-4">
                <h4 className="font-black text-xs text-red-600 dark:text-red-400 uppercase tracking-wider">
                  1. البيانات الأساسية والصورة:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">اسم الكورس (بالعربية):</label>
                    <input
                      type="text"
                      value={formData.titleAr || ''}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      placeholder="مثال: المبرمج الصغير (Scratch & AI)"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">الكود التعريف (Code):</label>
                    <input
                      type="text"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="SMART-PROG-1"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">رابط صورة الكورس (Image URL):</label>
                    <input
                      type="url"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">تاريخ بداية الدورة (Start Date):</label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                {/* Preset image buttons */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
                  <span>صور مقترحة من Unsplash:</span>
                  {[
                    { label: 'برمجة 💻', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80' },
                    { label: 'روبوتات 🤖', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80' },
                    { label: 'ذكاء اصطناعي 🧠', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
                    { label: 'إلكترونيات ⚡', url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80' }
                  ].map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-black text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  2. خطط الأسعار والعروض (Prices & Summer Offers):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-bold">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">السعر الأصلي (Original Price):</label>
                    <input
                      type="number"
                      value={formData.originalPrice || 0}
                      onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">السعر بعد الخصم (Discount Price):</label>
                    <input
                      type="number"
                      value={formData.discountPrice || 0}
                      onChange={(e) => setFormData({ ...formData, discountPrice: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-black text-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">عرض الترم 3 شهور (Summer Price):</label>
                    <input
                      type="number"
                      value={formData.summer3MonthsPrice || 0}
                      onChange={(e) => setFormData({ ...formData, summer3MonthsPrice: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-black text-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">سعر الشواغر شهرياً (Monthly Price):</label>
                    <input
                      type="number"
                      value={formData.monthlyPrice || 0}
                      onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">سعر حقيبة المكونات Kit Price:</label>
                    <input
                      type="number"
                      value={formData.kitPrice || 0}
                      onChange={(e) => setFormData({ ...formData, kitPrice: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">اسم الحقيبة (Kit Name):</label>
                    <input
                      type="text"
                      value={formData.kitNameAr || 'حقيبة المكونات الإلكترونية'}
                      onChange={(e) => setFormData({ ...formData, kitNameAr: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">العملة (Currency):</label>
                    <input
                      type="text"
                      value={formData.currency || 'EGP'}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Details */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-black text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  3. الوصف والمستوى وتفاصيل الفئة العمرية:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">السن الأدنى (Min Age):</label>
                    <input
                      type="number"
                      value={formData.ageMin || 6}
                      onChange={(e) => setFormData({ ...formData, ageMin: parseInt(e.target.value) || 6 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">السن الأقصى (Max Age):</label>
                    <input
                      type="number"
                      value={formData.ageMax || 12}
                      onChange={(e) => setFormData({ ...formData, ageMax: parseInt(e.target.value) || 12 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">طريقة الدراسة (Mode):</label>
                    <select
                      value={formData.mode || 'Hybrid'}
                      onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                    >
                      <option value="Hybrid">Hybrid (مركز + أونلاين)</option>
                      <option value="Center">Center (في المركز الميداني)</option>
                      <option value="Online">Online (أونلاين مباشر)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">وصف الكورس الكامل (تفاصيل المنهج بالعربية):</label>
                  <textarea
                    rows={3}
                    value={formData.descriptionAr || ''}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="اكتب وصفاً جذاباً وشاملاً للمحتوى والمهارات..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={editingCourse ? handleSaveEdit : handleSaveNew}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition"
                >
                  <Save className="w-4 h-4" /> حفظ الكورس والتحديث المباشر في Firestore 💾
                </button>
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setShowAddForm(false);
                  }}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Courses Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">جدول إدارة الكورسات والأسعار الحالية:</h3>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingCourse(null);
                }}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow"
              >
                + إضافة كورس جديد
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="p-3">الكورس</th>
                    <th className="p-3">السعر الأصلي</th>
                    <th className="p-3">بعد الخصم</th>
                    <th className="p-3">عرض 3 شهور</th>
                    <th className="p-3">حقيبة المكونات Kit</th>
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                  {courses.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 text-slate-900 dark:text-white">
                        <div className="font-bold">{c.titleAr}</div>
                        <div className="text-[10px] text-slate-400">{c.code}</div>
                      </td>
                      <td className="p-3 text-slate-400 line-through">{c.originalPrice} EGP</td>
                      <td className="p-3 text-emerald-600 font-extrabold">{c.discountPrice} EGP</td>
                      <td className="p-3 text-amber-500 font-extrabold">{c.summer3MonthsPrice || '-'} EGP</td>
                      <td className="p-3 text-blue-500">{c.kitPrice ? `+${c.kitPrice} EGP` : '-'}</td>
                      <td className="p-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCourse(c);
                            setFormData(c);
                            setShowAddForm(false);
                          }}
                          className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded bg-red-100 dark:bg-red-950 hover:bg-red-200 text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Logs from Firestore */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" /> سجلات النشاط والأحداث (Activity Logs):
            </h3>

            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-500">لا توجد سجلات بعد. سيتم توثيق عمليات الحضور والتعديلات هنا.</p>
            ) : (
              <div className="space-y-2">
                {activityLogs.slice(0, 10).map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString('ar-EG')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
