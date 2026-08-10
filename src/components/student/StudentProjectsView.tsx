import React, { useState, useEffect } from 'react';
import { User, Project } from '../../types';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { Folder, Upload, FileText, CheckCircle, Clock, XCircle, Download, Presentation, Lock, AlertTriangle, Play, Sparkles, X } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';

interface StudentProjectsViewProps {
  currentUser: User | null;
  onAwardXp: (amount: number, reason: string) => void;
}

export const StudentProjectsView: React.FC<StudentProjectsViewProps> = ({ currentUser, onAwardXp }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Presentation Stage Mode State
  const [activePresentationProject, setActivePresentationProject] = useState<Project | null>(null);
  const [presentationBlockedMsg, setPresentationBlockedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  const fetchProjects = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'projects'), where('studentId', '==', currentUser.id));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!currentUser || !title || !file) {
      alert('الرجاء إدخال عنوان المشروع واختيار الملف');
      return;
    }

    try {
      setUploading(true);

      const storage = getStorage();
      const storageRef = ref(storage, `projects/${currentUser.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      const newProject: Omit<Project, 'id'> = {
        title,
        description,
        courseId: currentUser.enrolledCourseIds?.[0] || 'general',
        studentId: currentUser.id,
        studentName: currentUser.name,
        fileUrl,
        createdAt: new Date().toISOString(),
        status: 'SUBMITTED',
      };

      await addDoc(collection(db, 'projects'), newProject);

      onAwardXp(150, 'تسليم مشروع جديد!');
      setShowUploadForm(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchProjects();

      alert('تم رفع المشروع بنجاح!');
    } catch (error) {
      console.error('Error uploading project:', error);
      alert('حدث خطأ أثناء رفع المشروع.');
    } finally {
      setUploading(false);
    }
  };

  // Launch Presentation Mode with Session Control Validation
  const handleStartPresentation = async (proj: Project) => {
    setPresentationBlockedMsg(null);

    // 1. Verify Project Ownership
    if (proj.studentId !== currentUser?.id) {
      setPresentationBlockedMsg('تنبيه الأمان: ليس لديك صلاحية عرض مشروع آخر.');
      return;
    }

    // 2. Verify Status is READY_FOR_PRESENTATION or PRESENTED
    if (proj.status !== 'READY_FOR_PRESENTATION' && proj.status !== 'PRESENTED') {
      setPresentationBlockedMsg('المشروع ليس في حالة "جاهز للعرض التقديمي". برجاء انتظار موافقة المعلم أو الإدارة.');
      return;
    }

    // 3. Verify Presentation Session if Restriction is ONLY_THIS_SESSION
    if (proj.presentationRestriction === 'ONLY_THIS_SESSION' && proj.presentationSessionId) {
      try {
        const sessionSnap = await getDoc(doc(db, 'presentation_sessions', proj.presentationSessionId));
        if (!sessionSnap.exists()) {
          setPresentationBlockedMsg('جلسة العرض المقيدة غير موجودة أو تم إلغاؤها.');
          return;
        }

        const sessionData = sessionSnap.data();
        if (sessionData.status === 'CANCELLED') {
          setPresentationBlockedMsg('تنبيه الأمان: تم إلغاء جلسة العرض المقيدة لهذا المشروع.');
          return;
        }
      } catch (e) {
        console.warn('Session verification fallback:', e);
      }
    }

    setActivePresentationProject(proj);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY_FOR_PRESENTATION': return <Presentation className="w-5 h-5 text-amber-400" />;
      case 'PRESENTED': return <CheckCircle className="w-5 h-5 text-indigo-400" />;
      case 'APPROVED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'NEEDS_REVISION': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READY_FOR_PRESENTATION': return 'جاهز للعرض التقديمي 🎤';
      case 'PRESENTED': return 'تم العرض';
      case 'APPROVED': return 'معتمد 🎉';
      case 'NEEDS_REVISION': return 'مراجعة مطلوبة';
      default: return 'قيد المراجعة';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 flex items-center justify-center">
            <Folder className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">مشاريعي ووضع العرض التقديمي (Projects & Presentation Mode)</h2>
            <p className="text-xs text-slate-400">ارفع مشاريعك، تتبع موافقة المعلم، وادخل العرض التقديمي المقيد والجلسات التفاعلية.</p>
          </div>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          {showUploadForm ? 'إلغاء الرفع' : <><Upload className="w-4 h-4" /> رفع مشروع جديد</>}
        </button>
      </div>

      {presentationBlockedMsg && (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-300 rounded-2xl text-xs font-bold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{presentationBlockedMsg}</span>
        </div>
      )}

      {showUploadForm && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">رفع مشروع جديد</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المشروع *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 text-xs outline-none focus:border-indigo-500"
                placeholder="مثال: ذراع الروبوت الذكي بالأردوينو"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">وصف المشروع</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 text-xs min-h-[90px] outline-none focus:border-indigo-500"
                placeholder="شرح أفكار المشروع والمكونات..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">ملف المشروع (PDF, ZIP, Presentation) *</label>
              <input
                type="file"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-4 py-2 text-xs"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {uploading ? 'جاري الرفع...' : <><Upload className="w-4 h-4" /> تأكيد الرفع 🚀</>}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-slate-500 py-10 font-bold text-xs">جاري تحميل المشاريع...</div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 text-center shadow-sm space-y-3">
          <Folder className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">لا توجد مشاريع مرفوعة بعد</h3>
          <p className="text-xs text-slate-500">ارفع مشروعك الأول الآن وابدأ في جمع نقاط XP والحصول على إذن العرض التقديمي.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => (
            <div key={project.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-950 rounded-xl flex items-center justify-center text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm line-clamp-1">{project.title}</h3>
                    <div className="text-[10px] text-slate-500">{new Date(project.createdAt).toLocaleDateString('ar-EG')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-bold">
                  {getStatusIcon(project.status)}
                  <span className="text-slate-300">{getStatusText(project.status)}</span>
                </div>
              </div>

              {project.description && (
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{project.description}</p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                {project.fileUrl && (
                  <a
                    href={project.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> تحميل الملف
                  </a>
                )}

                {project.status === 'READY_FOR_PRESENTATION' && (
                  <button
                    onClick={() => handleStartPresentation(project)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Presentation className="w-4 h-4" />
                    <span>دخول وضع العرض التقديمي 🎤</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL SCREEN PRESENTATION MODE */}
      <AnimatePresence>
        {activePresentationProject && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col p-6 text-right dir-rtl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400">
                  <Presentation className="w-6 h-6" />
                </span>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-extrabold text-[10px]">
                    <Sparkles className="w-3 h-3" /> Presentation Mode Session Active
                  </div>
                  <h2 className="text-lg font-black text-white">{activePresentationProject.title}</h2>
                </div>
              </div>

              <button
                onClick={() => setActivePresentationProject(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>إغلاق العرض التقديمي</span>
              </button>
            </div>

            <div className="flex-1 my-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-xl bg-indigo-950 text-indigo-300 font-bold text-xs">
                  تقديم الطالب: {activePresentationProject.studentName}
                </div>

                <h1 className="text-3xl font-black text-white leading-tight">{activePresentationProject.title}</h1>

                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-w-3xl">
                  {activePresentationProject.description || 'لا يوجد وصف مطول لمشروع العرض التقديمي.'}
                </p>
              </div>

              {activePresentationProject.fileUrl && (
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-amber-400" />
                    <div>
                      <h4 className="font-extrabold text-xs text-white">الملف والمواد المرفقة مع العرض</h4>
                      <p className="text-[10px] text-slate-400">جاهز للعرض والتحميل المباشر للجنة التقييم</p>
                    </div>
                  </div>
                  <a
                    href={activePresentationProject.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> فتح واستعراض الملف
                  </a>
                </div>
              )}

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>تاريخ السماح بالعرض: {new Date(activePresentationProject.readyForPresentationAt || '').toLocaleString('ar-EG')}</span>
                <span className="text-amber-400 font-bold">جلسة العرض معتمدة ومسجلة بالإدارة ✅</span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
