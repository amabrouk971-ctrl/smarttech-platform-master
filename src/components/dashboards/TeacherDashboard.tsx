import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Sparkles,
  Plus,
  CheckCircle2,
  Bot,
  Award,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Send,
  QrCode,
  Calendar,
  UserCheck,
  Briefcase,
  FileText,
  Save,
  Trash2,
  Camera,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Building2,
  ExternalLink
} from 'lucide-react';
import {
  User,
  AttendanceSession,
  AttendanceRecord,
  ConcentrationRecord,
  Conversation,
  Message,
  TeacherProfile,
  TeacherWorkExperience,
  TeacherPortfolioItem
} from '../../types';
import { EventEngine } from '../../lib/EventEngine';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, onSnapshot } from 'firebase/firestore';
import {
  recordTeacherAttendanceInFirestore,
  fetchTeacherAttendanceFromFirestore,
  updateUserProfileInFirestore,
  TeacherAttendanceRecord
} from '../../services/firebaseService';
import { StudentQrCard } from '../StudentQrCard';
import { QrAttendanceScanner } from '../QrAttendanceScanner';

interface TeacherDashboardProps {
  currentUser: User | null;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'profile' | 'classroom' | 'assistant'>('attendance');

  // AI Generator state
  const [topicInput, setTopicInput] = useState('حساس المسافة Ultrasonic مع محرك السيرفو');
  const [targetAge, setTargetAge] = useState(10);
  const [generatedLesson, setGeneratedLesson] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Classroom state
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [concentration, setConcentration] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  // Chat State
  const [conversations, setConversations] = useState<(Conversation & { parent?: User; student?: User })[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Teacher Attendance & Scanner state
  const [teacherAttendanceHistory, setTeacherAttendanceHistory] = useState<TeacherAttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Teacher Profile Editing state
  const [qualifications, setQualifications] = useState(currentUser?.teacherProfile?.qualifications || 'بكالوريوس هندسة / علوم حاسب');
  const [yearsOfExperience, setYearsOfExperience] = useState(currentUser?.teacherProfile?.yearsOfExperience || 4);
  const [currentWorkplace, setCurrentWorkplace] = useState(currentUser?.teacherProfile?.currentWorkplace || 'مدرب معتمد بمركز SmartTech');
  const [bio, setBio] = useState(currentUser?.teacherProfile?.bio || 'مدرب وخبير متقدم في تعليم البرمجة والذكاء الاصطناعي للأطفال والشباب.');
  const [specializations, setSpecializations] = useState<string[]>(currentUser?.teacherProfile?.specializations || ['AI & Robotics', 'Python', 'Arduino', 'Web Dev']);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  useEffect(() => {
    fetchStudents();
    if (currentUser) {
      fetchConversations();
      loadTeacherAttendance();
    }
  }, [currentUser]);

  const loadTeacherAttendance = async () => {
    if (!currentUser) return;
    setAttendanceLoading(true);
    try {
      const records = await fetchTeacherAttendanceFromFirestore(currentUser.id);
      records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTeacherAttendanceHistory(records);
    } catch (err) {
      console.error('Error loading teacher attendance:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSelfAttendanceCheckin = async () => {
    if (!currentUser) return;
    setAttendanceLoading(true);
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      await recordTeacherAttendanceInFirestore({
        teacherId: currentUser.id,
        teacherName: currentUser.name || 'مدرب سمارتك',
        branchName: 'مقر زيزينيا - الإسكندرية',
        timestamp: now.toISOString(),
        dateStr: now.toISOString().substring(0, 10),
        status: 'PRESENT',
        method: 'SELF_CHECKIN',
        notes: `تسجيل حضور تلقائي من لوحة التحكم في ${timeStr}`
      });

      setAttendanceSuccessMsg(`تم تسجيل حضورك اليوم بنجاح الساعة ${timeStr} ✅`);
      await loadTeacherAttendance();
      setTimeout(() => setAttendanceSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Checkin error:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSaveTeacherProfile = async () => {
    if (!currentUser) return;
    setSavingProfile(true);
    try {
      const updatedProfile: TeacherProfile = {
        qualifications,
        specializations,
        yearsOfExperience,
        currentWorkplace,
        bio,
        workHistory: currentUser.teacherProfile?.workHistory || [],
        portfolioItems: currentUser.teacherProfile?.portfolioItems || [],
        requestedCourses: currentUser.teacherProfile?.requestedCourses || ['AI Junior', 'Robotics']
      };

      const updatedUser: User = {
        ...currentUser,
        teacherProfile: updatedProfile
      };

      await updateUserProfileInFirestore(updatedUser);
      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'STUDENT'));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'conversations'), where('participantIds', 'array-contains', currentUser.id));
      const snap = await getDocs(q);

      const convs = await Promise.all(
        snap.docs.map(async (d) => {
          const c = { id: d.id, ...d.data() } as Conversation;
          let parent, student;
          const pSnap = await getDocs(query(collection(db, 'users'), where('id', '==', c.parentId)));
          if (!pSnap.empty) parent = pSnap.docs[0].data() as User;

          const sSnap = await getDocs(query(collection(db, 'users'), where('id', '==', c.studentId)));
          if (!sSnap.empty) student = sSnap.docs[0].data() as User;

          return { ...c, parent, student };
        })
      );
      setConversations(convs);
    } catch (err) {
      console.error('Error fetching conversations', err);
    }
  };

  useEffect(() => {
    if (!activeConversation) return;
    const q = query(collection(db, 'messages'), where('conversationId', '==', activeConversation.id), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
    }, (err) => console.warn('Teacher messages snapshot error:', err));
    return () => unsub();
  }, [activeConversation]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !currentUser) return;
    try {
      const msgRef = await addDoc(collection(db, 'messages'), {
        conversationId: activeConversation.id,
        senderId: currentUser.id,
        text: newMessage,
        type: 'TEXT',
        status: 'SENT',
        createdAt: new Date().toISOString()
      });

      await EventEngine.publish({
        eventType: 'MESSAGE_RECEIVED',
        actorId: currentUser.id,
        entityId: msgRef.id,
        payload: {
          text: newMessage,
          recipientId: activeConversation.parentId
        }
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  const handleGenerateLesson = async () => {
    setLoadingAi(true);
    try {
      setTimeout(() => {
        setGeneratedLesson({
          title: `درس تفاعلي عن: ${topicInput}`,
          objective: 'فهم كيفية قراءة قيم الحساسات وتطبيق التحكم بالمحركات.',
          steps: [
            'شرح نظرية الأمواج فوق الصوتية Ultrasonic (5 دقائق)',
            'توصيل الدائرة على سيميولاتور SmartTech (15 دقيقة)',
            'تحدي برمجة الروبوت لتفادي الجدار (20 دقيقة)'
          ]
        });
        setLoadingAi(false);
      }, 1200);
    } catch (err) {
      setLoadingAi(false);
    }
  };

  const startSession = async () => {
    if (!currentUser) return;
    try {
      const newSession = {
        courseId: 'demo-course',
        teacherId: currentUser.id,
        scheduledStart: new Date().toISOString(),
        actualStart: new Date().toISOString(),
        status: 'IN_PROGRESS',
        examEnabled: false
      };
      const docRef = await addDoc(collection(db, 'attendanceSessions'), newSession);
      setActiveSession({ id: docRef.id, ...newSession } as AttendanceSession);

      const initialAtt: Record<string, string> = {};
      const initialConc: Record<string, number> = {};
      students.forEach((s) => {
        initialAtt[s.id] = 'PRESENT';
        initialConc[s.id] = 100;
      });
      setAttendance(initialAtt);
      setConcentration(initialConc);
    } catch (err) {
      console.error('Error starting session', err);
    }
  };

  const endSession = async () => {
    if (!activeSession || !currentUser) return;
    try {
      const currentStudents = students;

      const attPromises = Object.entries(attendance).map(async ([studentId, status]) => {
        const student = currentStudents.find((s) => s?.id === studentId);
        const docRef = await addDoc(collection(db, 'attendanceRecords'), {
          studentId,
          sessionId: activeSession.id,
          courseId: activeSession.courseId,
          teacherId: currentUser.id,
          status,
          method: 'MANUAL',
          timestamp: new Date().toISOString(),
          recordedBy: currentUser.id
        });

        let eventType = 'ATTENDANCE_PRESENT';
        if (status === 'LATE') eventType = 'ATTENDANCE_LATE';
        if (status === 'ABSENT') eventType = 'ATTENDANCE_ABSENT';

        await EventEngine.publish({
          eventType: eventType as any,
          actorId: currentUser.id,
          studentId: studentId,
          courseId: activeSession.courseId,
          sessionId: activeSession.id,
          entityId: docRef.id,
          payload: {
            status,
            studentName: student?.name
          }
        });

        return docRef;
      });

      const concPromises = Object.entries(concentration).map(async ([studentId, score]) => {
        const student = currentStudents.find((s) => s?.id === studentId);
        const docRef = await addDoc(collection(db, 'concentrationRecords'), {
          studentId,
          sessionId: activeSession.id,
          teacherId: currentUser.id,
          courseId: activeSession.courseId,
          score,
          scale: 100,
          teacherNoteVisibility: 'VISIBLE_TO_PARENT',
          teacherFeedback: feedback[studentId] || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        await EventEngine.publish({
          eventType: 'CONCENTRATION_RECORDED',
          actorId: currentUser.id,
          studentId: studentId,
          courseId: activeSession.courseId,
          sessionId: activeSession.id,
          entityId: docRef.id,
          payload: {
            score,
            studentName: student?.name
          }
        });

        return docRef;
      });

      await Promise.all([...attPromises, ...concPromises]);

      await EventEngine.publish({
        eventType: 'SESSION_COMPLETED',
        actorId: currentUser.id,
        courseId: activeSession.courseId,
        sessionId: activeSession.id,
        payload: {
          sessionTitle: activeSession.titleAr
        }
      });
      await updateDoc(doc(db, 'attendanceSessions', activeSession.id), {
        status: 'COMPLETED',
        actualEnd: new Date().toISOString()
      });

      alert('تم إنهاء الجلسة وحفظ جميع التقييمات بنجاح وإرسال إشعارات لأولياء الأمور!');
      setActiveSession(null);
    } catch (err) {
      console.error('Error ending session', err);
      alert('حدث خطأ أثناء حفظ الجلسة');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-8 dir-rtl text-right">
      {/* Scanner Modal */}
      <QrAttendanceScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onAttendanceSuccess={() => loadTeacherAttendance()}
      />

      {/* Pending Approval Banner */}
      {currentUser.approvalStatus && currentUser.approvalStatus !== 'APPROVED' && currentUser.approvalStatus !== 'ACTIVE' && (
        <div className="bg-amber-950/90 border-2 border-amber-500/50 p-6 rounded-3xl text-amber-200 space-y-2 shadow-xl">
          <div className="flex items-center gap-2 font-black text-base text-amber-400">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>حساب المعلم قيد الاعتماد والمراجعة الرسمية</span>
          </div>
          <p className="text-xs text-slate-300">
            أهلاً بك م. {currentUser.name}! ملفك المهني معروض لدى إدارة أكاديمية سمارتك. يمكنك حالياً استخدام كود QR المعتمد، تسجيل حضورك، وإدارة تحضير دروسك.
          </p>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black text-xs flex items-center gap-1">
              <Award className="w-4 h-4" /> معلم ومدرب معتمد 2026
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
              ID: {currentUser.id.substring(0, 8)}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            مرحباً بك، الأستاذ / {currentUser.name}
          </h2>
          <p className="text-xs text-slate-400">
            منظومة إدارة المدربين بمركز SmartTech: بطاقة QR، تسجيل الحضور، إدارة الصفوف والمساعد الذكي.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScannerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-red-600/30"
          >
            <Camera className="w-4 h-4" /> فتح ماسح الحضور بـ QR
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-5 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <QrCode className="w-4 h-4" /> بطاقة QR وتسجيل حضور المعلم
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <UserIcon className="w-4 h-4" /> الملف الشخصي والسيرة المهنية
        </button>

        <button
          onClick={() => setActiveTab('classroom')}
          className={`px-5 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'classroom'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> إدارة الجلسات وحضور الطلاب
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-5 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'assistant'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" /> المساعد الذكي ورسائل أولياء الأمور
        </button>
      </div>

      {/* TAB 1: TEACHER QR CODE & ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Teacher QR Card */}
          <div className="lg:col-span-5 space-y-4">
            <StudentQrCard
              studentName={currentUser.name}
              studentId={currentUser.id}
              courseTitle={currentUser.teacherProfile?.currentWorkplace || 'مدرب الذكاء الاصطناعي والروبوتات'}
              userRole="TEACHER"
              roleTitle="مدرب ومعلم معتمد بـ SmartTech"
            />

            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-3 text-white">
              <h4 className="font-black text-sm text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> استخدام كود QR الخاص بالمدرب
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                يمكنك طباعة هذه البطاقة أو إبرازها من شاشة الهاتف أمام ماسح المركز بالفرع لإثبات وتسجيل حضورك اليومي تلقائياً.
              </p>
            </div>
          </div>

          {/* Right Column: Attendance Check-In & History */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Self Check-in Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border-2 border-amber-500/30 text-white space-y-4 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black text-[10px]">
                    تسجيل الحضور المباشر
                  </span>
                  <h3 className="text-xl font-black text-white">تسجيل حضور اليوم كمدرب</h3>
                  <p className="text-xs text-slate-400">سجّل حضورك في الفرع بنقرة واحدة لتسجيل التوقيت والتاريخ فورياً</p>
                </div>

                <button
                  onClick={handleSelfAttendanceCheckin}
                  disabled={attendanceLoading}
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>{attendanceLoading ? 'جاري التسجيل...' : 'تسجيل الحضور اليومي الآن ✅'}</span>
                </button>
              </div>

              {attendanceSuccessMsg && (
                <div className="p-3 bg-emerald-950/90 border border-emerald-500 text-emerald-200 rounded-xl text-xs font-bold text-center">
                  {attendanceSuccessMsg}
                </div>
              )}
            </div>

            {/* Attendance Records History Table */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  سجل حضور وانصراف المدرب السابق
                </h3>
                <span className="text-xs font-bold text-slate-400">إجمالي الأيام: {teacherAttendanceHistory.length}</span>
              </div>

              {teacherAttendanceHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-400 opacity-50" />
                  <p>لا توجد تسجيلات حضور سابقة بعد. اضغط على زر التسجيل أعلاه لتسجيل أول يوم.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">توقيت الحضور</th>
                        <th className="p-3">المقر / الفرع</th>
                        <th className="p-3">طريقة التسجيل</th>
                        <th className="p-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                      {teacherAttendanceHistory.map((rec, idx) => (
                        <tr key={rec.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="p-3 text-slate-900 dark:text-white font-mono">{rec.dateStr}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">
                            {new Date(rec.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{rec.branchName || 'فرع زيزينيا'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                              {rec.method === 'QR' ? 'ماسح الكاميرا QR' : 'تسجيل مباشر'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                              حاضر ✅
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEACHER PROFILE EDITOR */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-amber-500" />
                تعديل الملف المهني والسيرة الذاتية للمدرب
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تعديل المؤهلات والخبرات والتخصصات ليطلع عليها المسؤولون وأولياء الأمور.
              </p>
            </div>

            <button
              onClick={handleSaveTeacherProfile}
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold text-center border border-emerald-300 dark:border-emerald-800">
              تم حفظ بيانات الملف المهني بنجاح!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold">
            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300">الاسم الكامل الرسمي:</label>
              <input
                type="text"
                value={currentUser.name}
                disabled
                className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300">البريد الإلكتروني الحساب:</label>
              <input
                type="text"
                value={currentUser.email}
                disabled
                className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300">المؤهل الأكاديمي:</label>
              <input
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300">جهة العمل / التخصص الحالي:</label>
              <input
                type="text"
                value={currentWorkplace}
                onChange={(e) => setCurrentWorkplace(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300">سنوات الخبرة العملية:</label>
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(parseInt(e.target.value, 10) || 0)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-slate-700 dark:text-slate-300">نبذة تعريفية سريعة (Bio):</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLASSROOM & STUDENT ATTENDANCE */}
      {activeTab === 'classroom' && (
        <div className="space-y-6">
          {!activeSession ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-4">
                <Play className="w-10 h-10 ml-1" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">بدء جلسة تعليمية جديدة</h3>
              <p className="text-slate-500 max-w-md mx-auto text-xs">
                قم ببدء الجلسة لتسجيل حضور الطلاب وتقييم أدائهم وإرسال الإشعارات التلقائية لأولياء الأمور.
              </p>
              <button
                onClick={startSession}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition text-sm mt-4 cursor-pointer"
              >
                بدء الجلسة الآن 🚀
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    جلسة قيد الانعقاد
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">قم بتسجيل الحضور والتقييم قبل إنهاء الجلسة.</p>
                </div>
                <button
                  onClick={endSession}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-xl shadow transition cursor-pointer"
                >
                  إنهاء الجلسة وحفظ التقرير
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="p-3">الطالب</th>
                      <th className="p-3 w-48">حالة الحضور</th>
                      <th className="p-3 w-32">مستوى التركيز</th>
                      <th className="p-3">ملاحظات لولي الأمر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3 text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs">
                            {st.avatar || '👦'}
                          </div>
                          {st.name}
                        </td>
                        <td className="p-3">
                          <select
                            value={attendance[st.id]}
                            onChange={(e) => setAttendance({ ...attendance, [st.id]: e.target.value })}
                            className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-2 py-1.5 text-xs font-bold ${
                              attendance[st.id] === 'PRESENT'
                                ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                                : attendance[st.id] === 'ABSENT'
                                ? 'border-red-500 text-red-700 dark:text-red-400'
                                : 'border-amber-500 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            <option value="PRESENT">حاضر ✅</option>
                            <option value="LATE">متأخر ⏱️</option>
                            <option value="ABSENT">غائب ❌</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={concentration[st.id]}
                              onChange={(e) => setConcentration({ ...concentration, [st.id]: parseInt(e.target.value) || 0 })}
                              className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
                              disabled={attendance[st.id] === 'ABSENT'}
                            />
                            <span className="text-xs text-slate-500">%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="تظهر لولي الأمر..."
                            value={feedback[st.id] || ''}
                            onChange={(e) => setFeedback({ ...feedback, [st.id]: e.target.value })}
                            disabled={attendance[st.id] === 'ABSENT'}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs placeholder:font-normal disabled:opacity-50"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AI ASSISTANT & MESSENGER */}
      {activeTab === 'assistant' && (
        <div className="space-y-8">
          {/* AI Teacher Assistant Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3>توليد خطة درس تفاعلية بـ AI (AI Lesson Plan Generator):</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">موضوع الدرس:</label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">سن الطلاب المستهدف:</label>
                <input
                  type="number"
                  value={targetAge}
                  onChange={(e) => setTargetAge(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateLesson}
              disabled={loadingAi}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
            >
              {loadingAi ? 'جاري التوليد...' : 'توليد خطة الدرس والأسئلة ⚡'}
            </button>

            {generatedLesson && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-extrabold text-sm text-amber-500">{generatedLesson.title}</h4>
                <p className="text-slate-600 dark:text-slate-300 font-medium">الهدف: {generatedLesson.objective}</p>
                {generatedLesson.steps && (
                  <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">خطوات التنفيذ:</span>
                    {generatedLesson.steps.map((step: string, sIdx: number) => (
                      <div key={sIdx} className="text-slate-600 dark:text-slate-400">
                        • {step}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Teacher Messenger */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              رسائل أولياء الأمور
            </h3>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">
              <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col">
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {conversations.length === 0 && <div className="text-center p-4 text-xs text-slate-500">لا توجد رسائل حالياً</div>}
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveConversation(c)}
                      className={`w-full text-right p-3 rounded-xl transition ${
                        activeConversation?.id === c.id
                          ? 'bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {c.parent?.name || 'ولي أمر مجهول'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold">بخصوص: {c.student?.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
                {activeConversation ? (
                  <>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {activeConversation.parent?.name}
                      </div>
                      <div className="text-xs text-slate-500 font-bold">ولي أمر الطالب: {activeConversation.student?.name}</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-500 text-xs py-10 font-bold">لا توجد رسائل.</div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === currentUser?.id ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                                msg.senderId === currentUser?.id
                                  ? 'bg-indigo-600 text-white rounded-tr-none'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {msg.text}
                              <div
                                className={`text-[9px] mt-1 text-left ${
                                  msg.senderId === currentUser?.id ? 'text-indigo-200' : 'text-slate-400'
                                }`}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="اكتب ردك..."
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                    <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">اختر محادثة</h3>
                    <p className="text-xs mt-2">قم بالرد على استفسارات أولياء الأمور.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
