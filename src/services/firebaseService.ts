import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc, onSnapshot, query, where, orderBy, deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Course, User, Certificate, Role, UserMode, 
  Exam, ExamQuestion, ExamAttempt, Assignment, AssignmentSubmission, Announcement, CourseMaterial, ContentTarget, CourseReview,
  Product, InventoryTransaction, StoreOrder, CertificateAuditLog, CertificateTemplate,
  Supplier, ProductCategory, ProductType, PurchaseRequest, PurchaseOrder, ReceivingRecord, PurchaseReturn,
  StoreExpense, StockAdjustment, CertificateImportBatch
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
  type: 'PDF',
  status: 'AVAILABLE',
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
    if (snapshot.empty) {
      console.log('No courses found in Firestore. Returning empty list.');
      return [];
    }
    const courses: Course[] = [];
    snapshot.forEach((d) => {
      courses.push({ id: d.id, ...d.data() } as Course);
    });
    return courses;
  } catch (err) {
    console.warn('Firestore fetch failed:', err);
    return [];
  }
};

// Realtime course listener
export const subscribeToCourses = (callback: (courses: Course[]) => void) => {
  try {
    const coursesCol = collection(db, 'courses');
    return onSnapshot(coursesCol, (snapshot) => {
      const courses: Course[] = [];
      snapshot.forEach((d) => {
        courses.push({ id: d.id, ...d.data() } as Course);
      });
      callback(courses);
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

const SEED_COURSE_REVIEWS: CourseReview[] = [
  {
    id: 'rev-c-little-prog-1',
    courseId: 'c-little-prog',
    studentName: 'يوسف العطار (10 سنوات)',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    rating: 5,
    reviewText: 'تعلمت تصميم الألعاب بـ Scratch وبنيت لعبة المتاهة والروبوت المتحرك واستمتعت جداً بالشرح والمسابقات!',
    courseTitleAr: 'كورس البرمجة التفاعلية للأطفال (Scratch)',
    date: 'قبل 3 أيام',
    verifiedStudent: true
  },
  {
    id: 'rev-c-future-prog-1',
    courseId: 'c-future-prog',
    studentName: 'فريدة محمد (12 سنة)',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
    reviewText: 'كورس ممتاز جداً! قمت ببرمجة تطبيق الذكاء الاصطناعي الخاص بي للتعرف على الوجوه وأصبح بإمكاني إبراز مشروعي بالمدرسة.',
    courseTitleAr: 'كورس مبرمج المستقبل',
    date: 'قبل أسبوع',
    verifiedStudent: true
  },
  {
    id: 'rev-c-python-ai-1',
    courseId: 'c-python-ai',
    studentName: 'عمر شريف (15 سنة)',
    studentAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80',
    rating: 5,
    reviewText: 'Python والذكاء الاصطناعي مع المهندسين بزيزينيا غير تفكيري تماماً. أنصح به كل طالب يريد دخول عالم البرمجة من الأبواب الواسعة.',
    courseTitleAr: 'دبلومة البرمجة والذكاء الاصطناعي الشاملة (Python & AI)',
    date: 'قبل 5 أيام',
    verifiedStudent: true
  },
  {
    id: 'rev-c-lego-wedo-1',
    courseId: 'c-lego-wedo',
    studentName: 'والد الطفل ياسين أحمد (7 سنوات)',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 5,
    reviewText: 'التفاعل الحركي بقطع LEGO WeDo والمحركات نمّى عند ابني تركيز هائل ومهارات التفكير الميكانيكي المنظم.',
    courseTitleAr: 'كورس مهندس المستقبل والأساسيات الميكانيكية (LEGO Robotics)',
    date: 'قبل أسبوعين',
    verifiedStudent: true
  },
  {
    id: 'rev-c-arduino-ai-1',
    courseId: 'c-arduino-ai',
    studentName: 'كريم هاني (14 سنة)',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    rating: 5,
    reviewText: 'قمنا بتركيب دارات الكترونية وحساسات حقيقية برمجناها بالأردوينو والذكاء الاصطناعي للتحكم بالمنزل الذكي.',
    courseTitleAr: 'كورس الإلكترونيات والإنترنت الذكي (Arduino & IoT)',
    date: 'قبل 4 أيام',
    verifiedStudent: true
  }
];

export const fetchCourseReviewsFromFirestore = async (courseIds?: string[]): Promise<CourseReview[]> => {
  try {
    const reviewsCol = collection(db, 'course_reviews');
    const snapshot = await getDocs(reviewsCol);
    
    let list: CourseReview[] = [];
    if (snapshot.empty) {
      for (const rev of SEED_COURSE_REVIEWS) {
        try {
          await setDoc(doc(db, 'course_reviews', rev.id), rev);
        } catch (e) {
          // ignore doc write errors
        }
      }
      list = [...SEED_COURSE_REVIEWS];
    } else {
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as CourseReview);
      });
    }

    if (courseIds && courseIds.length > 0) {
      const filtered = list.filter(r => courseIds.includes(r.courseId));
      return filtered.length > 0 ? filtered : list;
    }

    return list;
  } catch (err) {
    console.warn('Error fetching course reviews from Firestore, returning default seed reviews:', err);
    return SEED_COURSE_REVIEWS;
  }
};

// ==========================================
// SMARTTECH STORE MANAGEMENT SERVICES
// ==========================================

export const fetchProductsFromFirestore = async (): Promise<Product[]> => {
  try {
    const colRef = collection(db, 'products');
    const snapshot = await getDocs(colRef);
    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      products.push({ id: docSnap.id, ...docSnap.data() } as Product);
    });
    return products;
  } catch (err) {
    console.error('Error fetching products from Firestore:', err);
    return [];
  }
};

export const saveProductToFirestore = async (prod: Partial<Product>): Promise<Product> => {
  const prodId = prod.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const now = new Date().toISOString();
  
  const cost = Number(prod.costPrice) || 0;
  const selling = Number(prod.sellingPrice || prod.price) || 0;
  const margin = selling > 0 ? Math.round(((selling - cost) / selling) * 100) : 0;

  const fullProduct: Product = {
    id: prodId,
    name: prod.name || prod.nameAr || 'منتج جديد',
    nameAr: prod.nameAr || prod.name || 'منتج جديد',
    nameEn: prod.nameEn || '',
    sku: prod.sku || `SKU-${Date.now().toString().slice(-6)}`,
    barcode: prod.barcode || '',
    productType: prod.productType || 'REGULAR_PRODUCT',
    category: prod.category || 'kits',
    categoryId: prod.categoryId || prod.category || 'kits',
    subcategory: prod.subcategory || '',
    brand: prod.brand || 'SmartTech',
    description: prod.description || prod.descriptionAr || '',
    shortDescription: prod.shortDescription || '',
    costPrice: cost,
    sellingPrice: selling,
    price: selling,
    discountPrice: Number(prod.discountPrice) || undefined,
    originalPrice: Number(prod.originalPrice) || selling,
    profitMargin: margin,
    stockQuantity: Number(prod.stockQuantity) || 0,
    minimumStock: Number(prod.minimumStock) || 2,
    unit: prod.unit || 'قطعة',
    supplier: prod.supplier || 'المورد الرئيسي',
    status: (prod.status as any) || (Number(prod.stockQuantity) <= 0 ? 'OUT_OF_STOCK' : 'ACTIVE'),
    mainImagePath: prod.mainImagePath || prod.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    image: prod.mainImagePath || prod.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    images: prod.images || [],
    specifications: prod.specifications || '',
    notes: prod.notes || '',
    createdAt: prod.createdAt || now,
    updatedAt: now,
    createdBy: prod.createdBy || 'Admin'
  };

  // Remove undefined values to avoid Firestore errors
  const cleanProduct = Object.fromEntries(
    Object.entries(fullProduct).filter(([_, v]) => v !== undefined)
  );

  await setDoc(doc(db, 'products', prodId), cleanProduct, { merge: true });
  return cleanProduct as Product;
};

export const deleteProductFromFirestore = async (productId: string): Promise<void> => {
  await deleteDoc(doc(db, 'products', productId));
};

export const recordInventoryTransaction = async (
  tx: Omit<InventoryTransaction, 'id' | 'createdAt'>
): Promise<InventoryTransaction> => {
  const txId = `invtx-${Date.now()}`;
  const record: InventoryTransaction = {
    ...tx,
    id: txId,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'inventoryTransactions', txId), record);
  return record;
};

export const fetchInventoryTransactionsFromFirestore = async (productId?: string): Promise<InventoryTransaction[]> => {
  try {
    const colRef = collection(db, 'inventoryTransactions');
    const snapshot = await getDocs(colRef);
    let list: InventoryTransaction[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as InventoryTransaction);
    });
    if (productId) {
      list = list.filter((t) => t.productId === productId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching inventory transactions:', err);
    return [];
  }
};

export const createStoreOrderInFirestore = async (
  orderData: Omit<StoreOrder, 'id' | 'createdAt'>
): Promise<StoreOrder> => {
  const orderId = `ST-ORD-${Date.now().toString().slice(-6)}`;
  const id = `order-${Date.now()}`;
  const now = new Date().toISOString();

  const fullOrder: StoreOrder = {
    ...orderData,
    id,
    orderId,
    status: orderData.status || 'NEW',
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, 'storeOrders', id), fullOrder);

  // Update product stock quantities and record inventory transactions
  for (const item of orderData.items) {
    try {
      const prodDoc = await getDoc(doc(db, 'products', item.productId));
      if (prodDoc.exists()) {
        const prod = prodDoc.data() as Product;
        const currentStock = Number(prod.stockQuantity) || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        await updateDoc(doc(db, 'products', item.productId), {
          stockQuantity: newStock,
          status: newStock === 0 ? 'OUT_OF_STOCK' : prod.status
        });
        await recordInventoryTransaction({
          productId: item.productId,
          productName: item.productName,
          type: 'SOLD',
          quantity: item.quantity,
          previousStock: currentStock,
          newStock,
          notes: `طلب متجر واتساب #${orderId}`
        });
      }
    } catch (e) {
      console.warn(`Failed to decrement stock for product ${item.productId}:`, e);
    }
  }

  return fullOrder;
};

export const fetchStoreOrdersFromFirestore = async (customerId?: string): Promise<StoreOrder[]> => {
  try {
    const colRef = collection(db, 'storeOrders');
    const snapshot = await getDocs(colRef);
    let orders: StoreOrder[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as StoreOrder);
    });
    if (customerId) {
      orders = orders.filter((o) => o.customerId === customerId);
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching store orders:', err);
    return [];
  }
};

export const updateStoreOrderStatusInFirestore = async (
  orderId: string,
  status: StoreOrder['status']
): Promise<void> => {
  await updateDoc(doc(db, 'storeOrders', orderId), {
    status,
    updatedAt: new Date().toISOString()
  });
};

// ==========================================
// CERTIFICATE REGISTRY & VERIFICATION SYSTEM
// ==========================================

export const logCertificateAuditInFirestore = async (
  log: Omit<CertificateAuditLog, 'id' | 'timestamp'>
): Promise<CertificateAuditLog> => {
  const id = `certlog-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const fullLog: CertificateAuditLog = {
    ...log,
    id,
    timestamp: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'certificateAuditLogs', id), fullLog);
  } catch (e) {
    console.warn('Could not write certificate audit log:', e);
  }
  return fullLog;
};

export const fetchCertificatesFromFirestore = async (): Promise<Certificate[]> => {
  try {
    const colRef = collection(db, 'certificates');
    const snapshot = await getDocs(colRef);
    const certs: Certificate[] = [];
    snapshot.forEach((docSnap) => {
      certs.push({ id: docSnap.id, ...docSnap.data() } as Certificate);
    });
    return certs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err) {
    console.error('Error fetching certificates from Firestore:', err);
    return [];
  }
};

export const verifyCertificateByCodeOrId = async (
  queryStr: string
): Promise<{ valid: boolean; certificate?: Certificate; isRevoked?: boolean; message?: string }> => {
  const cleanQuery = queryStr.trim();
  if (!cleanQuery) {
    return { valid: false, message: 'يرجى إدخال كود الشهادة أو الرقم التسلسلي.' };
  }

  try {
    const certs = await fetchCertificatesFromFirestore();
    const queryLower = cleanQuery.toLowerCase();

    const match = certs.find(
      (c) =>
        (c.certificateNumber && c.certificateNumber.toLowerCase() === queryLower) ||
        (c.serialNumber && c.serialNumber.toLowerCase() === queryLower) ||
        (c.verificationId && c.verificationId.toLowerCase() === queryLower) ||
        (c.certificateCode && c.certificateCode.toLowerCase() === queryLower) ||
        (c.id && c.id.toLowerCase() === queryLower)
    );

    if (!match) {
      await logCertificateAuditInFirestore({
        certificateNumber: cleanQuery,
        action: 'VERIFIED',
        details: `فشل التحقق: لم يتم العثور على الشهادة بالكود (${cleanQuery})`
      });
      return {
        valid: false,
        message: 'CERTIFICATE NOT FOUND - لم يتم العثور على هذه الشهادة في سجل الشهادات المعتمد لمركز SmartTech.'
      };
    }

    // Log verification attempt
    await logCertificateAuditInFirestore({
      certificateId: match.id,
      certificateNumber: match.certificateNumber,
      action: 'VERIFIED',
      details: `تمت عملية التحقق بنجاح من الشهادة للطالب (${match.studentName})`
    });

    if (match.status === 'REVOKED') {
      return {
        valid: false,
        isRevoked: true,
        certificate: match,
        message: `تم إلغاء هذه الشهادة بقرار إداري. سبب الإلغاء: ${match.revocationReason || 'غير محدد'}`
      };
    }

    if (match.status === 'EXPIRED') {
      return {
        valid: false,
        certificate: match,
        message: 'هذه الشهادة منتهية الصلاحية.'
      };
    }

    return { valid: true, certificate: match };
  } catch (err) {
    console.error('Error verifying certificate:', err);
    return { valid: false, message: 'حدث خطأ أثناء الاتصال بقاعدة بيانات الشهادات.' };
  }
};

export const checkDuplicateCertificateNumberOrSerial = async (
  certificateNumber: string,
  serialNumber: string,
  excludeId?: string
): Promise<{ duplicate: boolean; field?: string }> => {
  const certs = await fetchCertificatesFromFirestore();
  const certNumLower = certificateNumber.trim().toLowerCase();
  const serialLower = serialNumber.trim().toLowerCase();

  for (const c of certs) {
    if (excludeId && c.id === excludeId) continue;
    if (c.certificateNumber && c.certificateNumber.toLowerCase() === certNumLower) {
      return { duplicate: true, field: 'رقم الشهادة (Certificate Number)' };
    }
    if (c.serialNumber && c.serialNumber.toLowerCase() === serialLower) {
      return { duplicate: true, field: 'الرقم التسلسلي (Serial Number)' };
    }
  }

  return { duplicate: false };
};

export const saveCertificateToFirestore = async (cert: Partial<Certificate>): Promise<Certificate> => {
  const certId = cert.id || `cert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const certNum = cert.certificateNumber || `ST-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const serialNum = cert.serialNumber || `SN-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const vId = cert.verificationId || `vKey-${Math.random().toString(36).substr(2, 8)}-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  // Check duplicate
  const dupCheck = await checkDuplicateCertificateNumberOrSerial(certNum, serialNum, cert.id);
  if (dupCheck.duplicate && !cert.id) {
    throw new Error(`تعذر الحفظ: ${dupCheck.field} مكرر ومسجل بالفعل لشهادة أخرى.`);
  }

  const fullCert: Certificate = {
    id: certId,
    certificateNumber: certNum,
    serialNumber: serialNum,
    verificationId: vId,
    studentId: cert.studentId || '',
    studentName: cert.studentName || cert.studentNameAr || 'طالب سمارتك',
    studentNameAr: cert.studentNameAr || cert.studentName || 'طالب سمارتك',
    studentNameEn: cert.studentNameEn || '',
    studentProfileId: cert.studentProfileId || cert.studentId || '',
    certificateName: cert.certificateName || 'شهادة إتمام كورس تخصصي',
    courseId: cert.courseId || '',
    courseName: cert.courseName || cert.courseTitleAr || 'كورس البرمجة والروبوتكس',
    courseTitleAr: cert.courseTitleAr || cert.courseName || 'كورس البرمجة والروبوتكس',
    courseTitleEn: cert.courseTitleEn || '',
    learningPathId: cert.learningPathId || '',
    learningPathName: cert.learningPathName || '',
    classId: cert.classId || '',
    instructorId: cert.instructorId || '',
    instructorName: cert.instructorName || cert.instructorNameAr || 'مهندس م. سمارتك',
    instructorNameAr: cert.instructorNameAr || cert.instructorName || 'مهندس م. سمارتك',
    issueDate: cert.issueDate || new Date().toISOString().split('T')[0],
    completionDate: cert.completionDate || cert.issueDate || new Date().toISOString().split('T')[0],
    startDate: cert.startDate || '',
    endDate: cert.endDate || '',
    result: cert.result || 'Passed',
    score: cert.score || '100%',
    attendancePercentage: Number(cert.attendancePercentage) || 100,
    status: cert.status || 'VALID',
    certificateFilePath: cert.certificateFilePath || '',
    certificateImagePath: cert.certificateImagePath || '',
    qrCode: cert.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(vId)}`,
    verificationUrl: `${window.location.origin}/verify-certificate?id=${encodeURIComponent(vId)}`,
    templateId: cert.templateId || 'default-template',
    batchId: cert.batchId || '',
    replaces: cert.replaces || '',
    replacedBy: cert.replacedBy || '',
    revocationReason: cert.revocationReason || '',
    createdAt: cert.createdAt || now,
    createdBy: cert.createdBy || 'Admin',
    updatedAt: now,
    certificateCode: certNum,
    pathTitleAr: cert.learningPathName || cert.courseName || ''
  };

  await setDoc(doc(db, 'certificates', certId), fullCert, { merge: true });

  await logCertificateAuditInFirestore({
    certificateId: certId,
    certificateNumber: certNum,
    action: cert.id ? 'UPDATED' : 'CREATED',
    details: `${cert.id ? 'تحديث بيانات' : 'إصدار'} شهادة للطالب (${fullCert.studentName})`
  });

  return fullCert;
};

export const bulkSaveCertificatesToFirestore = async (certsData: Partial<Certificate>[]): Promise<{ created: Certificate[]; duplicatesCount: number }> => {
  const created: Certificate[] = [];
  let duplicatesCount = 0;

  for (const cData of certsData) {
    try {
      const c = await saveCertificateToFirestore(cData);
      created.push(c);
    } catch (err) {
      duplicatesCount++;
    }
  }

  if (created.length > 0) {
    await logCertificateAuditInFirestore({
      action: 'IMPORTED',
      details: `تم إنشاء وإضافة عدد (${created.length}) شهادة دفعة واحدة بكتلة البيانات`
    });
  }

  return { created, duplicatesCount };
};

export const revokeCertificateInFirestore = async (
  certId: string,
  reason: string,
  revokedBy: string = 'Admin'
): Promise<void> => {
  await updateDoc(doc(db, 'certificates', certId), {
    status: 'REVOKED',
    revocationReason: reason,
    updatedAt: new Date().toISOString()
  });

  await logCertificateAuditInFirestore({
    certificateId: certId,
    action: 'REVOKED',
    performedBy: revokedBy,
    details: `تم إلغاء اعتماد الشهادة. السبب: ${reason}`
  });
};

export const replaceCertificateInFirestore = async (
  oldCertId: string,
  newCertData: Partial<Certificate>,
  operator: string = 'Admin'
): Promise<Certificate> => {
  // Create new certificate first
  const newCert = await saveCertificateToFirestore({
    ...newCertData,
    replaces: oldCertId
  });

  // Mark old certificate as replaced
  await updateDoc(doc(db, 'certificates', oldCertId), {
    status: 'REPLACED',
    replacedBy: newCert.id,
    updatedAt: new Date().toISOString()
  });

  await logCertificateAuditInFirestore({
    certificateId: oldCertId,
    action: 'REPLACED',
    performedBy: operator,
    details: `تم استبدال هذه الشهادة بالشهادة الجديدة رقم (${newCert.certificateNumber})`
  });

  return newCert;
};

export const fetchCertificateAuditLogsFromFirestore = async (certId?: string): Promise<CertificateAuditLog[]> => {
  try {
    const colRef = collection(db, 'certificateAuditLogs');
    const snapshot = await getDocs(colRef);
    let logs: CertificateAuditLog[] = [];
    snapshot.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...docSnap.data() } as CertificateAuditLog);
    });
    if (certId) {
      logs = logs.filter((l) => l.certificateId === certId);
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.error('Error fetching certificate audit logs:', err);
    return [];
  }
};

export const fetchCertificateTemplatesFromFirestore = async (): Promise<CertificateTemplate[]> => {
  try {
    const colRef = collection(db, 'certificateTemplates');
    const snapshot = await getDocs(colRef);
    const templates: CertificateTemplate[] = [];
    snapshot.forEach((docSnap) => {
      templates.push({ id: docSnap.id, ...docSnap.data() } as CertificateTemplate);
    });
    return templates;
  } catch (err) {
    console.error('Error fetching certificate templates:', err);
    return [];
  }
};

export const saveCertificateTemplateToFirestore = async (tmpl: Partial<CertificateTemplate>): Promise<CertificateTemplate> => {
  const id = tmpl.id || `tmpl-${Date.now()}`;
  const fullTmpl: CertificateTemplate = {
    id,
    name: tmpl.name || 'قالب شهادة رسمي',
    description: tmpl.description || '',
    templateUrl: tmpl.templateUrl || '',
    isDefault: tmpl.isDefault ?? true,
    courseId: tmpl.courseId || '',
    learningPathId: tmpl.learningPathId || '',
    qrPlacement: tmpl.qrPlacement || { x: 80, y: 80, width: 100, height: 100 },
    createdAt: tmpl.createdAt || new Date().toISOString()
  };
  await setDoc(doc(db, 'certificateTemplates', id), fullTmpl, { merge: true });
  return fullTmpl;
};

// =========================================================================
// SUPPLIERS MANAGEMENT
// =========================================================================

export const fetchSuppliersFromFirestore = async (): Promise<Supplier[]> => {
  try {
    const colRef = collection(db, 'suppliers');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Supplier));
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    return [];
  }
};

export const saveSupplierToFirestore = async (sup: Partial<Supplier>): Promise<Supplier> => {
  const id = sup.id || `sup-${Date.now()}`;
  const supplierId = sup.supplierId || `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
  const fullSup: Supplier = {
    id,
    supplierId,
    companyName: sup.companyName || 'مورد جديد',
    contactName: sup.contactName || '',
    phone: sup.phone || '',
    whatsapp: sup.whatsapp || sup.phone || '',
    email: sup.email || '',
    address: sup.address || '',
    taxInfo: sup.taxInfo || '',
    paymentTerms: sup.paymentTerms || '30 يوماً',
    notes: sup.notes || '',
    status: sup.status || 'ACTIVE',
    productsSupplied: sup.productsSupplied || [],
    createdAt: sup.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'suppliers', id), fullSup, { merge: true });
  return fullSup;
};

export const deleteSupplierFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'suppliers', id));
};

// =========================================================================
// PRODUCT CATEGORIES & TYPES
// =========================================================================

export const fetchProductCategoriesFromFirestore = async (): Promise<ProductCategory[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'productCategories'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ProductCategory));
  } catch (err) {
    console.error('Error fetching product categories:', err);
    return [];
  }
};

export const saveProductCategoryToFirestore = async (cat: Partial<ProductCategory>): Promise<ProductCategory> => {
  const id = cat.id || `cat-${Date.now()}`;
  const fullCat: ProductCategory = {
    id,
    nameAr: cat.nameAr || 'قسم جديد',
    nameEn: cat.nameEn || 'New Category',
    productType: cat.productType || 'REGULAR_PRODUCT',
    subcategories: cat.subcategories || [],
    description: cat.description || '',
    createdAt: cat.createdAt || new Date().toISOString()
  };
  await setDoc(doc(db, 'productCategories', id), fullCat, { merge: true });
  return fullCat;
};

export const deleteProductCategoryFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'productCategories', id));
};

// =========================================================================
// PURCHASE REQUESTS
// =========================================================================

export const fetchPurchaseRequestsFromFirestore = async (): Promise<PurchaseRequest[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'purchaseRequests'));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PurchaseRequest));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching purchase requests:', err);
    return [];
  }
};

export const savePurchaseRequestToFirestore = async (req: Partial<PurchaseRequest>): Promise<PurchaseRequest> => {
  const id = req.id || `pr-${Date.now()}`;
  const requestId = req.requestId || `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const fullReq: PurchaseRequest = {
    id,
    requestId,
    employeeId: req.employeeId || 'emp-001',
    employeeName: req.employeeName || 'موظف سمارت تك',
    employeeEmail: req.employeeEmail || '',
    supplierId: req.supplierId || '',
    supplierName: req.supplierName || 'مورد عام',
    items: req.items || [],
    totalEstimatedCost: req.totalEstimatedCost || (req.items?.reduce((sum, i) => sum + (i.estimatedSubtotal || 0), 0) || 0),
    reason: req.reason || '',
    priority: req.priority || 'MEDIUM',
    requiredDate: req.requiredDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    notes: req.notes || '',
    attachments: req.attachments || [],
    status: req.status || 'SUBMITTED',
    adminFeedback: req.adminFeedback || '',
    comments: req.comments || [],
    createdAt: req.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'purchaseRequests', id), fullReq, { merge: true });
  return fullReq;
};

export const updatePurchaseRequestStatusInFirestore = async (
  id: string,
  status: PurchaseRequest['status'],
  feedback?: string,
  approvedBy?: { id: string; name: string }
): Promise<void> => {
  const updates: any = {
    status,
    updatedAt: new Date().toISOString()
  };
  if (feedback !== undefined) updates.adminFeedback = feedback;
  if (approvedBy) {
    updates.approvedBy = approvedBy.id;
    updates.approvedByName = approvedBy.name;
    updates.approvedAt = new Date().toISOString();
  }
  await updateDoc(doc(db, 'purchaseRequests', id), updates);
};

export const addPurchaseRequestCommentInFirestore = async (
  id: string,
  comment: { userId: string; userName: string; userRole: string; comment: string }
): Promise<void> => {
  const docRef = doc(db, 'purchaseRequests', id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const existingComments = snap.data().comments || [];
    const newComment = {
      id: `cmt-${Date.now()}`,
      ...comment,
      createdAt: new Date().toISOString()
    };
    await updateDoc(docRef, {
      comments: [...existingComments, newComment],
      updatedAt: new Date().toISOString()
    });
  }
};

// =========================================================================
// PURCHASE ORDERS
// =========================================================================

export const generateUniquePoNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const snapshot = await getDocs(collection(db, 'purchaseOrders'));
  const count = snapshot.size + 1;
  const seq = String(count).padStart(6, '0');
  return `PO-${year}-${seq}`;
};

export const fetchPurchaseOrdersFromFirestore = async (): Promise<PurchaseOrder[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'purchaseOrders'));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PurchaseOrder));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching purchase orders:', err);
    return [];
  }
};

export const savePurchaseOrderToFirestore = async (po: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
  const id = po.id || `po-${Date.now()}`;
  const poNumber = po.poNumber || await generateUniquePoNumber();
  const subtotal = po.subtotal ?? (po.items?.reduce((sum, i) => sum + (i.totalCost || 0), 0) || 0);
  const tax = po.tax || 0;
  const shipping = po.shipping || 0;
  const otherCosts = po.otherCosts || 0;
  const totalCost = subtotal + tax + shipping + otherCosts;

  const fullPo: PurchaseOrder = {
    id,
    poNumber,
    purchaseRequestId: po.purchaseRequestId || '',
    supplierId: po.supplierId || '',
    supplierName: po.supplierName || 'مورد عام',
    createdBy: po.createdBy || 'admin',
    createdByName: po.createdByName || 'مدير النظام',
    approvedBy: po.approvedBy || '',
    approvedByName: po.approvedByName || '',
    orderDate: po.orderDate || new Date().toISOString().split('T')[0],
    expectedDeliveryDate: po.expectedDeliveryDate || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    items: po.items || [],
    subtotal,
    tax,
    shipping,
    otherCosts,
    totalCost,
    paymentStatus: po.paymentStatus || 'UNPAID',
    deliveryStatus: po.deliveryStatus || 'PENDING',
    status: po.status || 'DRAFT',
    notes: po.notes || '',
    attachments: po.attachments || [],
    auditTrail: po.auditTrail || [
      {
        id: `log-${Date.now()}`,
        action: 'CREATED',
        performedBy: po.createdBy || 'admin',
        performedByName: po.createdByName || 'مدير النظام',
        timestamp: new Date().toISOString(),
        reason: 'إنشاء أمر الشراء'
      }
    ],
    createdAt: po.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'purchaseOrders', id), fullPo, { merge: true });
  return fullPo;
};

export const updatePurchaseOrderStatusInFirestore = async (
  id: string,
  status: PurchaseOrder['status'],
  performedBy: { id: string; name: string },
  reason?: string
): Promise<void> => {
  const docRef = doc(db, 'purchaseOrders', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const currentPo = snap.data() as PurchaseOrder;
  const auditTrail = currentPo.auditTrail || [];
  const newAudit = {
    id: `log-${Date.now()}`,
    action: status as any,
    performedBy: performedBy.id,
    performedByName: performedBy.name,
    timestamp: new Date().toISOString(),
    oldValue: currentPo.status,
    newValue: status,
    reason: reason || `تغيير الحالة إلى ${status}`
  };

  const updates: any = {
    status,
    auditTrail: [...auditTrail, newAudit],
    updatedAt: new Date().toISOString()
  };

  if (status === 'APPROVED') {
    updates.approvedBy = performedBy.id;
    updates.approvedByName = performedBy.name;
  }

  await updateDoc(docRef, updates);
};

// =========================================================================
// RECEIVING GOODS & AUTOMATIC INVENTORY
// =========================================================================

export const fetchReceivingRecordsFromFirestore = async (): Promise<ReceivingRecord[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'receivingRecords'));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ReceivingRecord));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching receiving records:', err);
    return [];
  }
};

export const processReceivingGoodsInFirestore = async (rec: Partial<ReceivingRecord>): Promise<ReceivingRecord> => {
  const id = rec.id || `rec-${Date.now()}`;
  const receivingNumber = rec.receivingNumber || `REC-${Date.now().toString().slice(-6)}`;
  const totalItemsReceived = rec.items?.reduce((sum, i) => sum + (i.currentlyReceivedQuantity || 0), 0) || 0;

  const fullRec: ReceivingRecord = {
    id,
    receivingNumber,
    poId: rec.poId || '',
    poNumber: rec.poNumber || '',
    supplierId: rec.supplierId || '',
    supplierName: rec.supplierName || '',
    receivedBy: rec.receivedBy || 'admin',
    receivedByName: rec.receivedByName || 'مسؤول المستودع',
    receivedDate: rec.receivedDate || new Date().toISOString().split('T')[0],
    items: rec.items || [],
    totalItemsReceived,
    invoiceNumber: rec.invoiceNumber || '',
    deliveryNoteNumber: rec.deliveryNoteNumber || '',
    attachments: rec.attachments || [],
    notes: rec.notes || '',
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'receivingRecords', id), fullRec);

  // Update Inventory automatically and log transactions
  if (rec.items && rec.items.length > 0) {
    for (const item of rec.items) {
      if (!item.productId || item.currentlyReceivedQuantity <= 0) continue;

      const prodRef = doc(db, 'products', item.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const prodData = prodSnap.data() as Product;
        const previousStock = prodData.stockQuantity || 0;
        const newStock = previousStock + item.currentlyReceivedQuantity;

        // Record price history
        const priceHistory = prodData.priceHistory || [];
        const newPriceEntry = {
          supplierId: rec.supplierId || '',
          supplierName: rec.supplierName || 'مورد عام',
          price: prodData.costPrice || 0,
          date: new Date().toISOString(),
          poNumber: rec.poNumber
        };

        await updateDoc(prodRef, {
          stockQuantity: newStock,
          status: newStock > 0 ? 'ACTIVE' : prodData.status,
          priceHistory: [...priceHistory, newPriceEntry],
          updatedAt: new Date().toISOString()
        });

        // Record Inventory Transaction
        await recordInventoryTransaction({
          productId: item.productId,
          productName: item.productName || prodData.nameAr || prodData.name,
          sku: item.sku || prodData.sku,
          type: 'PURCHASE_RECEIVE',
          quantity: item.currentlyReceivedQuantity,
          previousStock,
          newStock,
          poNumber: rec.poNumber,
          supplierId: rec.supplierId,
          supplierName: rec.supplierName,
          employeeId: rec.receivedBy,
          employeeName: rec.receivedByName,
          reason: `استلام بضائع بموجب أمر الشراء (${rec.poNumber})`
        });
      }
    }
  }

  // Update PO received quantities and status
  if (rec.poId) {
    const poRef = doc(db, 'purchaseOrders', rec.poId);
    const poSnap = await getDoc(poRef);
    if (poSnap.exists()) {
      const poData = poSnap.data() as PurchaseOrder;
      const updatedItems = poData.items.map((poItem) => {
        const receivedItem = rec.items?.find((i) => i.productId === poItem.productId);
        if (receivedItem) {
          const newRecQty = (poItem.receivedQuantity || 0) + receivedItem.currentlyReceivedQuantity;
          const newDamQty = (poItem.damagedQuantity || 0) + receivedItem.damagedQuantity;
          const newMisQty = (poItem.missingQuantity || 0) + receivedItem.missingQuantity;
          return {
            ...poItem,
            receivedQuantity: newRecQty,
            damagedQuantity: newDamQty,
            missingQuantity: newMisQty
          };
        }
        return poItem;
      });

      const totalOrdered = updatedItems.reduce((s, i) => s + i.quantity, 0);
      const totalReceived = updatedItems.reduce((s, i) => s + i.receivedQuantity, 0);

      let newDeliveryStatus: PurchaseOrder['deliveryStatus'] = 'PENDING';
      let newPoStatus: PurchaseOrder['status'] = poData.status;

      if (totalReceived >= totalOrdered) {
        newDeliveryStatus = 'DELIVERED';
        newPoStatus = 'RECEIVED';
      } else if (totalReceived > 0) {
        newDeliveryStatus = 'PARTIALLY_DELIVERED';
        newPoStatus = 'PARTIALLY_RECEIVED';
      }

      await updateDoc(poRef, {
        items: updatedItems,
        deliveryStatus: newDeliveryStatus,
        status: newPoStatus,
        updatedAt: new Date().toISOString()
      });
    }
  }

  return fullRec;
};

// =========================================================================
// PURCHASE RETURNS
// =========================================================================

export const fetchPurchaseReturnsFromFirestore = async (): Promise<PurchaseReturn[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'purchaseReturns'));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PurchaseReturn));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching purchase returns:', err);
    return [];
  }
};

export const savePurchaseReturnToFirestore = async (ret: Partial<PurchaseReturn>): Promise<PurchaseReturn> => {
  const id = ret.id || `ret-${Date.now()}`;
  const returnNumber = ret.returnNumber || `RET-${Date.now().toString().slice(-6)}`;
  const totalReturnAmount = ret.items?.reduce((sum, i) => sum + (i.subtotal || 0), 0) || 0;

  const fullRet: PurchaseReturn = {
    id,
    returnNumber,
    poId: ret.poId || '',
    poNumber: ret.poNumber || '',
    supplierId: ret.supplierId || '',
    supplierName: ret.supplierName || '',
    createdBy: ret.createdBy || 'admin',
    createdByName: ret.createdByName || 'مدير النظام',
    returnDate: ret.returnDate || new Date().toISOString().split('T')[0],
    items: ret.items || [],
    totalReturnAmount,
    reason: ret.reason || '',
    condition: ret.condition || 'جديد / صالحة',
    attachments: ret.attachments || [],
    status: ret.status || 'SUBMITTED',
    notes: ret.notes || '',
    createdAt: ret.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'purchaseReturns', id), fullRet, { merge: true });

  // If approved/returned, adjust inventory downwards
  if (ret.status === 'APPROVED' || ret.status === 'RETURNED') {
    for (const item of fullRet.items) {
      const prodRef = doc(db, 'products', item.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const prodData = prodSnap.data() as Product;
        const previousStock = prodData.stockQuantity || 0;
        const newStock = Math.max(0, previousStock - item.quantity);

        await updateDoc(prodRef, {
          stockQuantity: newStock,
          updatedAt: new Date().toISOString()
        });

        await recordInventoryTransaction({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          type: 'RETURN_TO_SUPPLIER',
          quantity: item.quantity,
          previousStock,
          newStock,
          poNumber: ret.poNumber,
          supplierId: ret.supplierId,
          supplierName: ret.supplierName,
          reason: `إرجاع للمورد (${ret.reason})`
        });
      }
    }
  }

  return fullRet;
};

// =========================================================================
// STORE EXPENSES & STOCK ADJUSTMENTS
// =========================================================================

export const fetchStoreExpensesFromFirestore = async (): Promise<StoreExpense[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'storeExpenses'));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as StoreExpense));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching store expenses:', err);
    return [];
  }
};

export const saveStoreExpenseToFirestore = async (exp: Partial<StoreExpense>): Promise<StoreExpense> => {
  const id = exp.id || `exp-${Date.now()}`;
  const fullExp: StoreExpense = {
    id,
    title: exp.title || 'مصروف متجر جديد',
    category: exp.category || 'صيانة وشحن',
    amount: exp.amount || 0,
    date: exp.date || new Date().toISOString().split('T')[0],
    recordedBy: exp.recordedBy || 'admin',
    recordedByName: exp.recordedByName || 'مسؤول المتجر',
    notes: exp.notes || '',
    attachment: exp.attachment || '',
    createdAt: exp.createdAt || new Date().toISOString()
  };
  await setDoc(doc(db, 'storeExpenses', id), fullExp, { merge: true });
  return fullExp;
};

export const recordStockAdjustmentInFirestore = async (adj: Partial<StockAdjustment>): Promise<StockAdjustment> => {
  const id = adj.id || `adj-${Date.now()}`;
  const prodRef = doc(db, 'products', adj.productId!);
  const prodSnap = await getDoc(prodRef);
  
  let previousStock = 0;
  if (prodSnap.exists()) {
    previousStock = prodSnap.data().stockQuantity || 0;
  }

  let newStock = previousStock;
  if (adj.type === 'ADD') newStock = previousStock + (adj.adjustmentQty || 0);
  else if (adj.type === 'REMOVE') newStock = Math.max(0, previousStock - (adj.adjustmentQty || 0));
  else if (adj.type === 'SET') newStock = adj.newStock ?? (adj.adjustmentQty || 0);

  const fullAdj: StockAdjustment = {
    id,
    productId: adj.productId!,
    productName: adj.productName || 'منتج',
    sku: adj.sku || '',
    previousStock,
    newStock,
    adjustmentQty: Math.abs(newStock - previousStock),
    type: adj.type || 'SET',
    reason: adj.reason || 'تعديل جرد يدوي',
    performedBy: adj.performedBy || 'admin',
    performedByName: adj.performedByName || 'مسؤول المخزون',
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'stockAdjustments', id), fullAdj);

  if (prodSnap.exists()) {
    await updateDoc(prodRef, {
      stockQuantity: newStock,
      status: newStock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
      updatedAt: new Date().toISOString()
    });
  }

  await recordInventoryTransaction({
    productId: adj.productId!,
    productName: adj.productName || 'منتج',
    sku: adj.sku,
    type: 'ADJUSTMENT',
    quantity: Math.abs(newStock - previousStock),
    previousStock,
    newStock,
    reason: adj.reason || 'تسوية مخزون'
  });

  return fullAdj;
};

// =========================================================================
// CERTIFICATE BULK IMPORT TRANSACTION
// =========================================================================

export const saveCertificateImportBatchToFirestore = async (batch: Partial<CertificateImportBatch>): Promise<CertificateImportBatch> => {
  const id = batch.id || `batch-${Date.now()}`;
  const fullBatch: CertificateImportBatch = {
    id,
    batchId: batch.batchId || `IMP-${Date.now().toString().slice(-6)}`,
    fileName: batch.fileName || 'certificates_import.csv',
    uploadedBy: batch.uploadedBy || 'admin',
    uploadedByName: batch.uploadedByName || 'مدير النظام',
    uploadedAt: batch.uploadedAt || new Date().toISOString(),
    totalRows: batch.totalRows || 0,
    successfulRows: batch.successfulRows || 0,
    failedRows: batch.failedRows || 0,
    duplicateRows: batch.duplicateRows || 0,
    warningRows: batch.warningRows || 0,
    status: batch.status || 'COMPLETED',
    logReportUrl: batch.logReportUrl || ''
  };
  await setDoc(doc(db, 'certificateImportBatches', id), fullBatch);
  return fullBatch;
};

export const fetchCertificateImportBatchesFromFirestore = async (): Promise<CertificateImportBatch[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'certificateImportBatches'));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CertificateImportBatch));
    return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (err) {
    console.error('Error fetching import batches:', err);
    return [];
  }
};



