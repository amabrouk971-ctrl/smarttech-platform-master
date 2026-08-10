import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc, onSnapshot, query, where, orderBy, deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Course, User, Certificate, Role, UserMode, 
  Exam, ExamQuestion, ExamAttempt, Assignment, AssignmentSubmission, Announcement, CourseMaterial, ContentTarget 
} from '../types';
import { INITIAL_COURSES } from '../data/seedData';

// Helper: Check if a user matches target permissions and date range
export const canUserAccessContent = (
  user: User | null,
  target: ContentTarget,
  startAt?: string,
  endAt?: string
): boolean => {
  const now = new Date().getTime();
  if (startAt && new Date(startAt).getTime() > now) return false;
  if (endAt && new Date(endAt).getTime() < now) return false;

  if (!target || target.type === 'EVERYONE') return true;
  if (!user) return false;

  if (target.type === 'ROLE') {
    return target.targetIds?.includes(user.role) || false;
  }
  if (target.type === 'STUDENT') {
    return target.targetIds?.includes(user.id) || false;
  }
  if (target.type === 'COURSE') {
    return user.enrolledCourseIds?.some((id) => target.targetIds?.includes(id)) || false;
  }
  if (target.type === 'GROUP') {
    return target.targetIds?.includes('AI Kids Group A') || true; // Allowed for student group
  }
  return true;
};

// ==========================================
// EXAMS & QUIZZES FIRESTORE SERVICE
// ==========================================

const SEED_EXAM: Exam = {
  id: 'exam-ai-101',
  titleAr: 'اختبار الذكاء الاصطناعي الأساسي (AI Basics Challenge)',
  titleEn: 'AI Basics Challenge',
  descriptionAr: 'اختبار تفاعلي للتحقق من المفاهيم الأساسية للذكاء الاصطناعي ورؤية الحاسوب.',
  examType: 'QUIZ',
  status: 'PUBLISHED',
  durationMinutes: 15,
  maxAttempts: 2,
  passingScore: 70,
  totalPoints: 20,
  gradingEnabled: true,
  resultVisibility: 'IMMEDIATE',
  showScore: true,
  showCorrectAnswers: false,
  showExplanations: true,
  randomizeQuestions: false,
  randomizeAnswers: true,
  target: { type: 'EVERYONE' },
  createdAt: new Date().toISOString()
};

const SEED_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q1',
    examId: 'exam-ai-101',
    type: 'SINGLE_CHOICE',
    questionAr: 'ما هي التقنية المستخدمة في التعرف على الوجوه والصور بالأجهزة الذكية؟',
    options: [
      { id: 'A', textAr: 'رؤية الحاسوب (Computer Vision)' },
      { id: 'B', textAr: 'الطباعة ثلاثية الأبعاد' },
      { id: 'C', textAr: 'بلوتوث' }
    ],
    correctAnswerIds: ['A'],
    points: 10,
    explanationAr: 'رؤية الحاسوب هي فرع الذكاء الاصطناعي المعني بتحليل الصور والفيديوهات.'
  },
  {
    id: 'q2',
    examId: 'exam-ai-101',
    type: 'TRUE_FALSE',
    questionAr: 'هل يستطيع كود Scratch الاتصال بحساسات Arduino والتحكم بالأضواء؟',
    options: [
      { id: 'A', textAr: 'صحيح' },
      { id: 'B', textAr: 'خطأ' }
    ],
    correctAnswerIds: ['A'],
    points: 10,
    explanationAr: 'نعم بواسطة برنامج Pictoblox يمكن ربط Scratch بالـ Arduino بسهولة.'
  }
];

export const fetchExamsFromFirestore = async (): Promise<Exam[]> => {
  try {
    const col = collection(db, 'exams');
    const snapshot = await getDocs(col);
    if (snapshot.empty) {
      await setDoc(doc(db, 'exams', SEED_EXAM.id), SEED_EXAM);
      for (const q of SEED_QUESTIONS) {
        await setDoc(doc(db, 'examQuestions', q.id), q);
      }
      return [SEED_EXAM];
    }
    const exams: Exam[] = [];
    snapshot.forEach((d) => exams.push({ id: d.id, ...d.data() } as Exam));
    return exams;
  } catch (err) {
    return [SEED_EXAM];
  }
};

export const subscribeToExams = (callback: (exams: Exam[]) => void) => {
  try {
    const col = collection(db, 'exams');
    return onSnapshot(col, (snapshot) => {
      const exams: Exam[] = [];
      snapshot.forEach((d) => exams.push({ id: d.id, ...d.data() } as Exam));
      callback(exams);
    }, (err) => console.warn('Exams snapshot error:', err));
  } catch (err) {
    return () => {};
  }
};

export const saveExamToFirestore = async (exam: Exam): Promise<void> => {
  try {
    await setDoc(doc(db, 'exams', exam.id), exam, { merge: true });
    await logActivityInFirestore('ADMIN', `حفظ/تحديث الامتحان: ${exam.titleAr}`);
  } catch (err) {
    console.error('Error saving exam:', err);
  }
};

export const deleteExamFromFirestore = async (examId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'exams', examId));
  } catch (err) {
    console.error('Error deleting exam:', err);
  }
};

export const fetchExamQuestions = async (examId: string): Promise<ExamQuestion[]> => {
  try {
    const qCol = collection(db, 'examQuestions');
    const q = query(qCol, where('examId', '==', examId));
    const snapshot = await getDocs(q);
    if (snapshot.empty && examId === SEED_EXAM.id) {
      return SEED_QUESTIONS;
    }
    const questions: ExamQuestion[] = [];
    snapshot.forEach((d) => questions.push({ id: d.id, ...d.data() } as ExamQuestion));
    return questions;
  } catch (err) {
    return examId === SEED_EXAM.id ? SEED_QUESTIONS : [];
  }
};

export const saveExamQuestionToFirestore = async (question: ExamQuestion): Promise<void> => {
  try {
    await setDoc(doc(db, 'examQuestions', question.id), question, { merge: true });
  } catch (err) {
    console.error('Error saving question:', err);
  }
};

export const submitExamAttemptToFirestore = async (attempt: ExamAttempt): Promise<void> => {
  try {
    await setDoc(doc(db, 'examAttempts', attempt.id), attempt, { merge: true });
    await logActivityInFirestore(attempt.studentId, `تسليم امتحان: ${attempt.examId} بنتيجة ${attempt.percentage}%`);
  } catch (err) {
    console.error('Error submitting exam attempt:', err);
  }
};

export const fetchStudentExamAttempts = async (studentId: string, examId?: string): Promise<ExamAttempt[]> => {
  try {
    const col = collection(db, 'examAttempts');
    const q = query(col, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    const attempts: ExamAttempt[] = [];
    snapshot.forEach((d) => {
      const data = { id: d.id, ...d.data() } as ExamAttempt;
      if (!examId || data.examId === examId) attempts.push(data);
    });
    return attempts;
  } catch (err) {
    return [];
  }
};

// ==========================================
// ASSIGNMENTS & HOMEWORK SERVICE
// ==========================================

const SEED_ASSIGNMENT: Assignment = {
  id: 'assg-1',
  titleAr: 'تطبيق Scratch: تصميم حاسبة ذكية للأرقام',
  descriptionAr: 'قم بإنشاء كود Scratch يحتوي على كائن يسأل المستخدم عن رقمين ويقوم بجمعهما وإخراج النتيجة صوتياً.',
  maxScore: 100,
  target: { type: 'EVERYONE' },
  createdAt: new Date().toISOString()
};

export const fetchAssignmentsFromFirestore = async (): Promise<Assignment[]> => {
  try {
    const col = collection(db, 'assignments');
    const snapshot = await getDocs(col);
    if (snapshot.empty) {
      await setDoc(doc(db, 'assignments', SEED_ASSIGNMENT.id), SEED_ASSIGNMENT);
      return [SEED_ASSIGNMENT];
    }
    const list: Assignment[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Assignment));
    return list;
  } catch (err) {
    return [SEED_ASSIGNMENT];
  }
};

export const saveAssignmentToFirestore = async (assignment: Assignment): Promise<void> => {
  try {
    await setDoc(doc(db, 'assignments', assignment.id), assignment, { merge: true });
    await logActivityInFirestore('ADMIN', `حفظ الواجب: ${assignment.titleAr}`);
  } catch (err) {
    console.error('Error saving assignment:', err);
  }
};

export const submitAssignmentInFirestore = async (sub: AssignmentSubmission): Promise<void> => {
  try {
    await setDoc(doc(db, 'assignmentSubmissions', sub.id), sub, { merge: true });
    await logActivityInFirestore(sub.studentId, `تسليم واجب: ${sub.assignmentId}`);
  } catch (err) {
    console.error('Error submitting assignment:', err);
  }
};

// ==========================================
// ANNOUNCEMENTS SERVICE
// ==========================================

const SEED_ANNOUNCEMENT: Announcement = {
  id: 'ann-1',
  titleAr: '🚀 بدء التسجيل في دورات الموسم التنافسي والذكاء الاصطناعي 2026',
  contentAr: 'أهلاً بكم في SmartTech! يسعدنا إعلان فتح باب الحجز بالمقرات وأونلاين لجميع المسارات البرمجية والروبوتية.',
  priority: 'IMPORTANT',
  target: { type: 'EVERYONE' },
  publishedAt: new Date().toISOString()
};

export const fetchAnnouncementsFromFirestore = async (): Promise<Announcement[]> => {
  try {
    const col = collection(db, 'announcements');
    const snapshot = await getDocs(col);
    if (snapshot.empty) {
      await setDoc(doc(db, 'announcements', SEED_ANNOUNCEMENT.id), SEED_ANNOUNCEMENT);
      return [SEED_ANNOUNCEMENT];
    }
    const list: Announcement[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Announcement));
    return list;
  } catch (err) {
    return [SEED_ANNOUNCEMENT];
  }
};

export const saveAnnouncementToFirestore = async (ann: Announcement): Promise<void> => {
  try {
    await setDoc(doc(db, 'announcements', ann.id), ann, { merge: true });
  } catch (err) {
    console.error('Error saving announcement:', err);
  }
};

// ==========================================
// MATERIALS & LIBRARY SERVICE
// ==========================================

const SEED_MATERIAL: CourseMaterial = {
  id: 'mat-1',
  titleAr: 'دليل المكونات والدوائر الإلكترونية لـ Arduino Nano & UNO',
  descriptionAr: 'ملف PDF شامل يشرح طريقة توصيل المكونات الحساسة والمحركات.',
  fileUrl: 'https://smart-courses.org/materials/arduino-guide.pdf',
  fileType: 'PDF',
  target: { type: 'EVERYONE' },
  createdAt: new Date().toISOString()
};

export const fetchMaterialsFromFirestore = async (): Promise<CourseMaterial[]> => {
  try {
    const col = collection(db, 'materials');
    const snapshot = await getDocs(col);
    if (snapshot.empty) {
      await setDoc(doc(db, 'materials', SEED_MATERIAL.id), SEED_MATERIAL);
      return [SEED_MATERIAL];
    }
    const list: CourseMaterial[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as CourseMaterial));
    return list;
  } catch (err) {
    return [SEED_MATERIAL];
  }
};

export const saveMaterialToFirestore = async (mat: CourseMaterial): Promise<void> => {
  try {
    await setDoc(doc(db, 'materials', mat.id), mat, { merge: true });
  } catch (err) {
    console.error('Error saving material:', err);
  }
};


// Sync or fetch courses from Firestore
export const seedAllCoursesToFirestore = async (overwrite: boolean = false): Promise<Course[]> => {
  try {
    const coursesCol = collection(db, 'courses');
    const snapshot = await getDocs(coursesCol);
    const existingMap = new Map(snapshot.docs.map(d => [d.id, d.data()]));
    
    // Upload any course in INITIAL_COURSES that is missing or overwrite if requested
    for (const course of INITIAL_COURSES) {
      if (overwrite || !existingMap.has(course.id)) {
        await setDoc(doc(db, 'courses', course.id), course, { merge: true });
      }
    }
    
    // Fetch updated snapshot
    const freshSnapshot = await getDocs(coursesCol);
    const courses: Course[] = [];
    freshSnapshot.forEach((d) => {
      courses.push({ id: d.id, ...d.data() } as Course);
    });
    return courses;
  } catch (err) {
    console.warn('Failed to seed courses to Firestore:', err);
    return INITIAL_COURSES;
  }
};

export const fetchCoursesFromFirestore = async (): Promise<Course[]> => {
  try {
    const coursesCol = collection(db, 'courses');
    const snapshot = await getDocs(coursesCol);
    if (snapshot.empty || snapshot.size < INITIAL_COURSES.length) {
      console.log('Syncing all initial courses into Firestore database...');
      return await seedAllCoursesToFirestore(false);
    }
    const courses: Course[] = [];
    snapshot.forEach((d) => {
      courses.push({ id: d.id, ...d.data() } as Course);
    });
    return courses;
  } catch (err) {
    console.warn('Firestore fetch failed, returning initial seed courses:', err);
    return INITIAL_COURSES;
  }
};

// Realtime course listener
export const subscribeToCourses = (callback: (courses: Course[]) => void) => {
  try {
    const coursesCol = collection(db, 'courses');
    return onSnapshot(coursesCol, async (snapshot) => {
      if (snapshot.empty || snapshot.size < INITIAL_COURSES.length) {
        console.log('Courses in Firestore incomplete, seeding missing courses...');
        await seedAllCoursesToFirestore(false);
      }
      const courses: Course[] = [];
      snapshot.forEach((d) => {
        courses.push({ id: d.id, ...d.data() } as Course);
      });
      if (courses.length > 0) {
        callback(courses);
      }
    }, (err) => console.warn('Courses snapshot error:', err));
  } catch (err) {
    console.warn('Firestore subscription failed:', err);
    return () => {};
  }
};

// Save or Update Course in Firestore
export const saveCourseToFirestore = async (course: Course): Promise<void> => {
  try {
    await setDoc(doc(db, 'courses', course.id), course, { merge: true });
    await logActivityInFirestore('ADMIN', `حفظ/تعديل الدورة: ${course.titleAr}`);
  } catch (err) {
    console.error('Error saving course to Firestore:', err);
  }
};

// Delete Course
export const deleteCourseFromFirestore = async (courseId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
    await logActivityInFirestore('ADMIN', `حذف الدورة برقم: ${courseId}`);
  } catch (err) {
    console.error('Error deleting course:', err);
  }
};

// Record Attendance in Firestore
export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  timestamp: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  method: 'QR' | 'MANUAL';
}

export interface TeacherAttendanceRecord {
  id?: string;
  teacherId: string;
  teacherName: string;
  branchName?: string;
  timestamp: string;
  dateStr: string;
  status: 'PRESENT' | 'LATE' | 'CHECKED_OUT';
  method: 'QR' | 'MANUAL' | 'SELF_CHECKIN';
  notes?: string;
}

export const recordAttendanceInFirestore = async (record: AttendanceRecord): Promise<void> => {
  try {
    const attCol = collection(db, 'attendance');
    await addDoc(attCol, {
      ...record,
      timestamp: new Date().toISOString()
    });
    await logActivityInFirestore(record.studentId, `تسجيل حضور الطالب: ${record.studentName} في ${record.courseTitle}`);
  } catch (err) {
    console.error('Failed to record attendance:', err);
  }
};

export const recordTeacherAttendanceInFirestore = async (record: TeacherAttendanceRecord): Promise<void> => {
  try {
    const attCol = collection(db, 'teacherAttendance');
    await addDoc(attCol, {
      ...record,
      timestamp: new Date().toISOString(),
      dateStr: record.dateStr || new Date().toISOString().substring(0, 10)
    });
    await logActivityInFirestore(record.teacherId, `تسجيل حضور المدرب المعلم: ${record.teacherName}`);
  } catch (err) {
    console.error('Failed to record teacher attendance:', err);
  }
};

export const fetchTeacherAttendanceFromFirestore = async (teacherId: string): Promise<TeacherAttendanceRecord[]> => {
  try {
    const attCol = collection(db, 'teacherAttendance');
    const q = query(attCol, where('teacherId', '==', teacherId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as TeacherAttendanceRecord));
  } catch (err) {
    console.warn('Failed to fetch teacher attendance:', err);
    return [];
  }
};

// Activity Logging
export const logActivityInFirestore = async (userId: string, action: string): Promise<void> => {
  try {
    const logsCol = collection(db, 'activityLogs');
    await addDoc(logsCol, {
      userId,
      action,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Logging activity failed:', err);
  }
};

// Create or update user profile in Firestore
export const updateUserProfileInFirestore = async (user: User): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (err) {
    console.error('Updating user profile failed:', err);
  }
};

// Fetch Activity Logs
export const fetchActivityLogsFromFirestore = async () => {
  try {
    const logsCol = collection(db, 'activityLogs');
    const snapshot = await getDocs(logsCol);
    const logs: any[] = [];
    snapshot.forEach((d) => logs.push({ id: d.id, ...d.data() }));
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    return [];
  }
};

// ==========================================
// DYNAMIC ROLES, PERMISSIONS & APPROVALS
// ==========================================

export const fetchCustomRolesFromFirestore = async (): Promise<any[]> => {
  try {
    const rolesCol = collection(db, 'roles');
    const snapshot = await getDocs(rolesCol);
    const roles: any[] = [];
    snapshot.forEach((d) => roles.push({ id: d.id, ...d.data() }));
    return roles;
  } catch (err) {
    console.error('Error fetching custom roles:', err);
    return [];
  }
};

export const saveCustomRoleToFirestore = async (roleObj: any): Promise<void> => {
  try {
    const roleRef = doc(db, 'roles', roleObj.id);
    await setDoc(roleRef, {
      ...roleObj,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    await logAuditEventInFirestore({
      actorId: roleObj.createdBy || 'SYSTEM',
      actorName: 'Super Admin',
      actorRole: 'SUPER_ADMIN',
      action: `إضافة/تعديل دور مخصص: ${roleObj.name}`,
      targetType: 'ROLE',
      targetId: roleObj.id,
      details: roleObj
    });
  } catch (err) {
    console.error('Error saving custom role:', err);
  }
};

export const deleteCustomRoleFromFirestore = async (roleId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'roles', roleId));
  } catch (err) {
    console.error('Error deleting custom role:', err);
  }
};

export const fetchAllUsersFromFirestore = async (): Promise<User[]> => {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    const users: User[] = [];
    snapshot.forEach((d) => users.push({ id: d.id, ...d.data() } as User));
    return users;
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
};

export const updateUserApprovalInFirestore = async (
  userId: string,
  status: string,
  approverUser: User,
  reviewNotes?: string,
  assignedCourses?: string[]
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const updatePayload: Record<string, any> = {
      approvalStatus: status,
      approvedBy: approverUser.id,
      approvedAt: new Date().toISOString()
    };

    if (assignedCourses && assignedCourses.length > 0) {
      updatePayload['teacherProfile.assignedCourses'] = assignedCourses;
      updatePayload['enrolledCourseIds'] = assignedCourses;
    }

    if (reviewNotes) {
      updatePayload['teacherProfile.reviewNotes'] = reviewNotes;
    }

    await updateDoc(userRef, updatePayload);

    await logAuditEventInFirestore({
      actorId: approverUser.id,
      actorName: approverUser.name,
      actorRole: approverUser.role,
      action: `تحديث حالة اعتمادات المستخدم (${status})`,
      targetType: 'USER',
      targetId: userId,
      details: { status, reviewNotes, assignedCourses }
    });

    // Notify User
    const notifCol = collection(db, 'notifications');
    await addDoc(notifCol, {
      recipientId: userId,
      type: 'APPROVAL_UPDATE',
      title: status === 'APPROVED' || status === 'ACTIVE' ? '🎉 تم قبول حسابك بنجاح' : '⚠️ تحديث على طلب الانضمام',
      body: status === 'APPROVED' || status === 'ACTIVE' 
        ? 'تهانينا! تم الاعتماد وتفعيل حسابك في منصة سمارتك. يمكنك الآن استخدام كافة الميزات المتاحة.'
        : `تم تحديث حالة الطلب إلى: ${status}. ملاحظات: ${reviewNotes || 'لا توجد ملاحظات إضافية'}`,
      createdAt: new Date().toISOString(),
      status: 'UNREAD'
    });
  } catch (err) {
    console.error('Error updating user approval status:', err);
  }
};

export const logAuditEventInFirestore = async (audit: {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
}): Promise<void> => {
  try {
    const auditCol = collection(db, 'auditLogs');
    await addDoc(auditCol, {
      ...audit,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Audit logging failed:', err);
  }
};

export const fetchAuditLogsFromFirestore = async (): Promise<any[]> => {
  try {
    const auditCol = collection(db, 'auditLogs');
    const snapshot = await getDocs(auditCol);
    const logs: any[] = [];
    snapshot.forEach((d) => logs.push({ id: d.id, ...d.data() }));
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return [];
  }
};

export const regenerateStudentQrTokenInFirestore = async (studentId: string): Promise<string> => {
  const newToken = `ST-TOKEN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  try {
    const userRef = doc(db, 'users', studentId);
    await updateDoc(userRef, {
      qrToken: newToken,
      qrTokenCreatedAt: new Date().toISOString(),
      qrStatus: 'ACTIVE'
    });
  } catch (err) {
    console.error('Error regenerating QR token:', err);
  }
  return newToken;
};

