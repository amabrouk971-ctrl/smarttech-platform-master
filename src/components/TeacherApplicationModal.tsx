import React, { useState } from 'react';
import { User, Role, TeacherProfile, TeacherWorkExperience, TeacherPortfolioItem, ApprovalStatus } from '../types';
import { X, Save, Plus, Trash2, Award, Briefcase, FileText, CheckCircle2, ShieldAlert, BookOpen, Send } from 'lucide-react';
import { updateUserProfileInFirestore, logAuditEventInFirestore } from '../services/firebaseService';

interface TeacherApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSubmitted: (updatedUser: User) => void;
}

export const TeacherApplicationModal: React.FC<TeacherApplicationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitted
}) => {
  if (!isOpen) return null;

  const [qualifications, setQualifications] = useState(currentUser?.teacherProfile?.qualifications || 'بكالوريوس هندسة حاسبات / علوم حاسب');
  const [yearsOfExperience, setYearsOfExperience] = useState(currentUser?.teacherProfile?.yearsOfExperience || 3);
  const [currentWorkplace, setCurrentWorkplace] = useState(currentUser?.teacherProfile?.currentWorkplace || 'مدرس برمجيات وروبوتات');
  const [bio, setBio] = useState(currentUser?.teacherProfile?.bio || 'مدرب شغوف بتعليم الأطفال والشباب أحدث تقنيات البرمجة والذكاء الاصطناعي.');
  const [specializations, setSpecializations] = useState<string[]>(currentUser?.teacherProfile?.specializations || ['AI Kids', 'Python', 'Arduino', 'Scratch']);
  const [requestedCourses, setRequestedCourses] = useState<string[]>(currentUser?.teacherProfile?.requestedCourses || ['AI Junior', 'Robotics Master']);

  const [workHistory, setWorkHistory] = useState<TeacherWorkExperience[]>(currentUser?.teacherProfile?.workHistory || [
    {
      id: 'w1',
      company: 'SmartTech Academy',
      position: 'مدرب الذكاء الاصطناعي والروبوتات',
      startDate: '2023-01',
      description: 'تدريب أكثر من 150 طالب على كورس الذكاء الاصطناعي والروبوتات المتقدم.'
    }
  ]);

  const [portfolioItems, setPortfolioItems] = useState<TeacherPortfolioItem[]>(currentUser?.teacherProfile?.portfolioItems || [
    {
      id: 'p1',
      title: 'السيرة الذاتية الشهادات CV',
      type: 'CV',
      url: 'https://smarttech.academy/docs/cv_teacher.pdf',
      visibility: 'ADMIN_ONLY',
      createdAt: new Date().toISOString()
    }
  ]);

  const [newCompany, setNewCompany] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocType, setNewDocType] = useState<'CV' | 'CERTIFICATE' | 'PROJECT' | 'VIDEO' | 'DOCUMENT' | 'LINK'>('CERTIFICATE');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleAddExperience = () => {
    if (!newCompany || !newPosition) return;
    setWorkHistory([
      ...workHistory,
      {
        id: `w-${Date.now()}`,
        company: newCompany,
        position: newPosition,
        startDate: new Date().toISOString().substring(0, 7),
        description: 'خبرة عمل مخصصة'
      }
    ]);
    setNewCompany('');
    setNewPosition('');
  };

  const handleAddDoc = () => {
    if (!newDocTitle || !newDocUrl) return;
    setPortfolioItems([
      ...portfolioItems,
      {
        id: `p-${Date.now()}`,
        title: newDocTitle,
        url: newDocUrl,
        type: newDocType,
        visibility: 'PUBLIC_PROFILE',
        createdAt: new Date().toISOString()
      }
    ]);
    setNewDocTitle('');
    setNewDocUrl('');
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setSubmitting(true);

    const teacherProfileData: TeacherProfile = {
      qualifications,
      specializations,
      yearsOfExperience,
      currentWorkplace,
      bio,
      workHistory,
      portfolioItems,
      requestedCourses
    };

    const updatedUser: User = {
      ...currentUser,
      role: Role.TEACHER,
      approvalStatus: 'PENDING_APPROVAL',
      teacherProfile: teacherProfileData
    };

    await updateUserProfileInFirestore(updatedUser);
    await logAuditEventInFirestore({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: Role.TEACHER,
      action: 'تقديم طلب الانضمام كمدرب في منصة سمارتك',
      targetType: 'TEACHER_APPLICATION',
      targetId: currentUser.id,
      details: teacherProfileData
    });

    setSubmitting(false);
    setSuccessMsg(true);
    onSubmitted(updatedUser);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-right overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 border border-amber-500/20">
            <Award className="w-3.5 h-3.5" /> نموذج طلب الانضمام للـ SmartTech Faculty
          </span>
          <h3 className="text-2xl font-black text-white">تقديم ملف المعلم / المدرب المعتمد</h3>
          <p className="text-xs text-slate-400">
            قم بتعبيئة المؤهلات، خبرات العمل، وملفات الإنجازات والشهادات لمراجعتها من قبل السوبر أدمن.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-black text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>تم تقديم ملفك بنجاح! طلبك الآن قيد المراجعة (PENDING_APPROVAL) بواسطة إدارة المنصة.</span>
          </div>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Section 1: Basic Bio & Qualifications */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> 1. المؤهلات والبيانات الشخصية
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
              <div>
                <label className="block text-slate-400 mb-1">المؤهل الأكاديمي والشهادات:</label>
                <input
                  type="text"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">جهة العمل الحالية / التخصص:</label>
                <input
                  type="text"
                  value={currentWorkplace}
                  onChange={(e) => setCurrentWorkplace(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">سنوات الخبرة التدريسية:</label>
                <input
                  type="number"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">الكورسات المطلوبة للتدريس:</label>
                <input
                  type="text"
                  value={requestedCourses.join(', ')}
                  onChange={(e) => setRequestedCourses(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="AI Junior, Robotics, Python"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1 font-bold">نبذة تعريفية (Bio):</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Section 2: Work History Timeline */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" /> 2. خبرات العمل السابقة (Work History)
            </h4>

            {workHistory.map((item) => (
              <div key={item.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white">{item.position} - <span className="text-amber-400">{item.company}</span></div>
                  <div className="text-[10px] text-slate-400">{item.startDate} | {item.description}</div>
                </div>
                <button
                  onClick={() => setWorkHistory(workHistory.filter(w => w.id !== item.id))}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
              <input
                type="text"
                placeholder="اسم الشركّة / المعهد"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
              />
              <input
                type="text"
                placeholder="المسمى الوظيفي"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
              />
              <button
                type="button"
                onClick={handleAddExperience}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold p-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> إضافة خبرة
              </button>
            </div>
          </div>

          {/* Section 3: Portfolio & Documents */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> 3. المعرض المهني والشهادات (Portfolio & Documents)
            </h4>

            {portfolioItems.map((docItem) => (
              <div key={docItem.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white">{docItem.title} <span className="text-[10px] text-emerald-400">({docItem.type})</span></div>
                  <a href={docItem.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline">{docItem.url}</a>
                </div>
                <button
                  onClick={() => setPortfolioItems(portfolioItems.filter(p => p.id !== docItem.id))}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
              <input
                type="text"
                placeholder="عنوان المستند / مشروع سابق"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
              />
              <input
                type="text"
                placeholder="رابط المستند / CV / غوغل درايف"
                value={newDocUrl}
                onChange={(e) => setNewDocUrl(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
              />
              <button
                type="button"
                onClick={handleAddDoc}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold p-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> إضافة ملف
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {submitting ? 'جاري إرسال الطلب...' : 'إرسال طلب الانضمام للـ Super Admin'}
          </button>
        </div>
      </div>
    </div>
  );
};
