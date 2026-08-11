import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { 
  CourseMaterial, ContentTarget, User, CourseUnit, CourseLesson, Course 
} from '../types';

// ==========================================
// TYPES FOR CONTENT & SESSION DELIVERY
// ==========================================

export interface FileUploadSettings {
  allowedExtensions: string[];
  maxFileSizeMB: number;
  maxVideoSizeMB: number;
  maxDocumentSizeMB: number;
  maxImageSizeMB: number;
  allowedMimeTypes: string[];
  storagePathPrefix: string;
  defaultDownloadAllowed: boolean;
  defaultPreviewAllowed: boolean;
  defaultRequiresEnrollment: boolean;
  defaultRequiresSession: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_FILE_UPLOAD_SETTINGS: FileUploadSettings = {
  allowedExtensions: [
    'pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 
    'jpg', 'jpeg', 'png', 'webp', 'svg', 'mp4', 'webm'
  ],
  maxFileSizeMB: 100,
  maxVideoSizeMB: 500,
  maxDocumentSizeMB: 50,
  maxImageSizeMB: 20,
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm'
  ],
  storagePathPrefix: 'smarttech_content',
  defaultDownloadAllowed: false,
  defaultPreviewAllowed: true,
  defaultRequiresEnrollment: true,
  defaultRequiresSession: false
};

export interface CourseSession {
  id: string;
  courseId: string;
  unitId?: string;
  lessonId?: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  orderIndex: number;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  instructorId?: string;
  instructorName?: string;
  room?: string;
  meetingType?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  meetingInfo?: string;
  meetingUrl?: string;
  materialIds?: string[];
  presentationIds?: string[];
  videoIds?: string[];
  assignmentIds?: string[];
  projectIds?: string[];
  labIds?: string[];
  examIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MaterialAccessLog {
  id: string;
  materialId: string;
  materialTitle: string;
  studentId: string;
  studentName: string;
  courseId?: string;
  sessionId?: string;
  action: 'OPENED' | 'WATCHED_VIDEO' | 'VIEWED_PRESENTATION' | 'DOWNLOADED' | 'ATTEMPTED_UNAUTHORIZED';
  deviceInfo?: string;
  accessedAt: string;
}

// ==========================================
// FILE UPLOAD SETTINGS SERVICE
// ==========================================

export const getFileUploadSettings = async (): Promise<FileUploadSettings> => {
  try {
    const docRef = doc(db, 'settings', 'fileUploadSettings');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { ...DEFAULT_FILE_UPLOAD_SETTINGS, ...snapshot.data() } as FileUploadSettings;
    }
  } catch (err) {
    console.warn('Error fetching file upload settings from Firestore, using default:', err);
  }
  return DEFAULT_FILE_UPLOAD_SETTINGS;
};

export const updateFileUploadSettings = async (settings: FileUploadSettings): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'fileUploadSettings');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving file upload settings:', err);
    throw err;
  }
};

// ==========================================
// FILE UPLOAD ENGINE (FIREBASE STORAGE)
// ==========================================

export interface UploadProgressCallback {
  (progressPercent: number, bytesTransferred: number, totalBytes: number): void;
}

export const uploadContentFileToStorage = async (
  file: File,
  folderPath: string = 'materials',
  onProgress?: UploadProgressCallback
): Promise<{ storagePath: string; downloadUrl: string; fileSize: number; mimeType: string }> => {
  // Validate extension
  const settings = await getFileUploadSettings();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (settings.allowedExtensions.length > 0 && !settings.allowedExtensions.includes(ext)) {
    throw new Error(`نوع الملف ( .${ext} ) غير مسموح به حسب إعدادات المنصة.`);
  }

  // Validate size
  const maxBytes = settings.maxFileSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`حجم الملف يقتضي ألا يتجاوز ${settings.maxFileSizeMB} ميجابايت.`);
  }

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathPrefix = settings.storagePathPrefix || 'smarttech_content';
  const fullStoragePath = `${pathPrefix}/${folderPath}/${timestamp}_${sanitizedName}`;

  try {
    const storageRef = ref(storage, fullStoragePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
          }
        },
        (error) => {
          console.error('Firebase Storage upload error:', error);
          // Fallback if Storage offline or blocked: create blob/base64 data URL reference
          resolveFallbackFileUpload(file, fullStoragePath, resolve, reject);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              storagePath: fullStoragePath,
              downloadUrl,
              fileSize: file.size,
              mimeType: file.type || 'application/octet-stream'
            });
          } catch (err) {
            resolveFallbackFileUpload(file, fullStoragePath, resolve, reject);
          }
        }
      );
    });
  } catch (error) {
    return new Promise((resolve, reject) => {
      resolveFallbackFileUpload(file, fullStoragePath, resolve, reject);
    });
  }
};

const resolveFallbackFileUpload = (
  file: File,
  storagePath: string,
  resolve: (res: any) => void,
  reject: (err: any) => void
) => {
  const reader = new FileReader();
  reader.onload = () => {
    resolve({
      storagePath,
      downloadUrl: reader.result as string,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream'
    });
  };
  reader.onerror = (err) => reject(err);
  reader.readAsDataURL(file);
};

// Delete file from Storage if referenced
export const deleteFileFromStorage = async (storagePath: string): Promise<void> => {
  if (!storagePath || storagePath.startsWith('data:')) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (err) {
    console.warn('Could not delete file from storage (may already be removed):', err);
  }
};

// ==========================================
// COURSE SESSIONS SERVICE
// ==========================================

export const fetchSessionsForCourse = async (courseId: string): Promise<CourseSession[]> => {
  try {
    const col = collection(db, 'courseSessions');
    const q = query(col, where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    const sessions: CourseSession[] = [];
    snapshot.forEach(docSnap => {
      sessions.push({ id: docSnap.id, ...docSnap.data() } as CourseSession);
    });
    // Sort by orderIndex ascending
    return sessions.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  } catch (err) {
    console.error('Error fetching course sessions:', err);
    return [];
  }
};

export const subscribeToCourseSessions = (courseId: string, callback: (sessions: CourseSession[]) => void) => {
  try {
    const col = collection(db, 'courseSessions');
    const q = query(col, where('courseId', '==', courseId));
    return onSnapshot(q, (snapshot) => {
      const sessions: CourseSession[] = [];
      snapshot.forEach(docSnap => {
        sessions.push({ id: docSnap.id, ...docSnap.data() } as CourseSession);
      });
      sessions.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      callback(sessions);
    });
  } catch (err) {
    return () => {};
  }
};

export const saveCourseSession = async (session: CourseSession): Promise<void> => {
  try {
    const docRef = doc(db, 'courseSessions', session.id);
    await setDoc(docRef, {
      ...session,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving course session:', err);
    throw err;
  }
};

export const deleteCourseSession = async (sessionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'courseSessions', sessionId));
  } catch (err) {
    console.error('Error deleting course session:', err);
    throw err;
  }
};

export const reorderCourseSessions = async (sessionOrders: { id: string; orderIndex: number }[]): Promise<void> => {
  try {
    for (const item of sessionOrders) {
      const docRef = doc(db, 'courseSessions', item.id);
      await updateDoc(docRef, { orderIndex: item.orderIndex, updatedAt: new Date().toISOString() });
    }
  } catch (err) {
    console.error('Error reordering sessions:', err);
    throw err;
  }
};

// ==========================================
// COURSE MATERIALS & ACCESS CONTROL SERVICE
// ==========================================

export const fetchAllMaterials = async (): Promise<CourseMaterial[]> => {
  try {
    const col = collection(db, 'materials');
    const snapshot = await getDocs(col);
    const materials: CourseMaterial[] = [];
    snapshot.forEach(docSnap => {
      materials.push({ id: docSnap.id, ...docSnap.data() } as CourseMaterial);
    });
    return materials;
  } catch (err) {
    console.error('Error fetching materials:', err);
    return [];
  }
};

export const subscribeToMaterials = (callback: (materials: CourseMaterial[]) => void) => {
  try {
    const col = collection(db, 'materials');
    return onSnapshot(col, (snapshot) => {
      const materials: CourseMaterial[] = [];
      snapshot.forEach(docSnap => {
        materials.push({ id: docSnap.id, ...docSnap.data() } as CourseMaterial);
      });
      callback(materials);
    });
  } catch (err) {
    return () => {};
  }
};

export const saveMaterial = async (material: CourseMaterial): Promise<void> => {
  try {
    const docRef = doc(db, 'materials', material.id);
    await setDoc(docRef, {
      ...material,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving material:', err);
    throw err;
  }
};

export const deleteMaterial = async (materialId: string, storagePath?: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'materials', materialId));
    if (storagePath) {
      await deleteFileFromStorage(storagePath);
    }
  } catch (err) {
    console.error('Error deleting material:', err);
    throw err;
  }
};

/**
 * Access Control Evaluator for Students:
 * Checks if a specific student is authorized to access/view a material item.
 */
export const isStudentAuthorizedForMaterial = (
  user: User | null,
  material: CourseMaterial,
  currentSessionId?: string,
  userEnrollments: string[] = []
): { authorized: boolean; reason?: string } => {
  const now = new Date();

  // 1. Staff override
  if (user && ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'EMPLOYEE', 'COORDINATOR'].includes(user.role as string)) {
    return { authorized: true };
  }

  // 2. Publication & Status Check
  if (material.status && (material.status as string) !== 'AVAILABLE' && (material.status as string) !== 'PUBLISHED') {
    return { authorized: false, reason: 'هذه المادة غير منشورة حالياً (Draft / Locked)' };
  }

  // 3. Expiration / Date Availability Check
  if (material.availableFrom) {
    const fromDate = new Date(material.availableFrom);
    if (now < fromDate) {
      return { authorized: false, reason: `هذه المادة ستكون متاحة بدءاً من ${material.availableFrom}` };
    }
  }

  if (material.availableUntil) {
    const untilDate = new Date(material.availableUntil);
    if (now > untilDate) {
      return { authorized: false, reason: 'هذه المادة لم تعد متاحة حالياً (انتهت فترة الإتاحة)' };
    }
  }

  // 4. Session-Only Constraint
  if (material.sessionOnly || material.requiresSpecificSession) {
    if (material.sessionId && currentSessionId && material.sessionId !== currentSessionId) {
      return { authorized: false, reason: 'هذه المادة مقتصرة على جلسة تعليمية أخرى فقط.' };
    }
  }

  // 5. Visibility / Access Policy
  const visibility = (material.visibility || 'ENROLLED_STUDENTS') as string;

  if (visibility === 'PUBLIC') {
    return { authorized: true };
  }

  if (visibility === 'SIGNED_IN_USERS') {
    if (!user) return { authorized: false, reason: 'يتطلب تسجيل الدخول لعرض هذه المادة' };
    return { authorized: true };
  }

  if (visibility === 'ENROLLED_STUDENTS' || material.requiresEnrollment) {
    if (!user) return { authorized: false, reason: 'يتطلب الاشتراك في الدورة لعرض المادة' };
    const enrolledInCourse = material.courseId ? userEnrollments.includes(material.courseId) || user.enrolledCourseIds?.includes(material.courseId) : true;
    if (!enrolledInCourse) {
      return { authorized: false, reason: 'يجب أن تكون مسجلاً في هذه الدورة للوصول إلى هذا المحتوى.' };
    }
    return { authorized: true };
  }

  if (visibility === 'SPECIFIC_STUDENTS' || material.accessType === 'SPECIFIC_STUDENTS') {
    if (!user) return { authorized: false, reason: 'يتطلب تسجيل الدخول' };
    const assignedIds = material.assignedStudentIds || (material.target?.type === 'STUDENT' ? material.target.targetIds : []);
    if (assignedIds && assignedIds.includes(user.id)) {
      return { authorized: true };
    }
    return { authorized: false, reason: 'هذه المادة مخصصة لطلاب محددين فقط.' };
  }

  if (visibility === 'SPECIFIC_CLASS' || material.accessType === 'SPECIFIC_CLASS') {
    if (!user) return { authorized: false, reason: 'يتطلب تسجيل الدخول' };
    const assignedClasses = material.assignedClassIds || ((material.target?.type as string) === 'CLASS' ? material.target?.targetIds : []);
    const studentClassId = user.studentProfile?.classId || user.branchId;
    if (assignedClasses && studentClassId && assignedClasses.includes(studentClassId)) {
      return { authorized: true };
    }
    return { authorized: false, reason: 'هذه المادة مخصصة لمجموعة/فصل تعليمي آخر.' };
  }

  if (visibility === 'TEACHER_ONLY' || visibility === 'ADMIN_ONLY' || visibility === 'SUPER_ADMIN_ONLY') {
    return { authorized: false, reason: 'محتوى مخصص للكوادر الإدارية والتعليمية فقط.' };
  }

  // Fallback check based on enrollment
  if (material.courseId && user) {
    const isEnrolled = userEnrollments.includes(material.courseId) || user.enrolledCourseIds?.includes(material.courseId);
    if (isEnrolled) return { authorized: true };
  }

  return { authorized: false, reason: 'غير مصرح لك بالوصول لهذه المادة.' };
};

// ==========================================
// MATERIAL AUDIT LOGGING
// ==========================================

export const logMaterialAccess = async (logData: Omit<MaterialAccessLog, 'id' | 'accessedAt'>): Promise<void> => {
  try {
    const logId = `access-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const docRef = doc(db, 'materialAccessLogs', logId);
    await setDoc(docRef, {
      ...logData,
      id: logId,
      accessedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not record material access log:', err);
  }
};

export const fetchMaterialAccessLogs = async (materialId?: string): Promise<MaterialAccessLog[]> => {
  try {
    const col = collection(db, 'materialAccessLogs');
    const q = materialId ? query(col, where('materialId', '==', materialId)) : col;
    const snapshot = await getDocs(q);
    const logs: MaterialAccessLog[] = [];
    snapshot.forEach(docSnap => {
      logs.push({ id: docSnap.id, ...docSnap.data() } as MaterialAccessLog);
    });
    return logs.sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime());
  } catch (err) {
    console.error('Error fetching access logs:', err);
    return [];
  }
};
