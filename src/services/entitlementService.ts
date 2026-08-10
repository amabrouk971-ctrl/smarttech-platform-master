import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, orderBy, deleteDoc, addDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Role, CourseAccessStatus, MaterialType, MaterialStatus, 
  CourseMaterial, EnrollmentRecord, StudentMaterialAccess, StudentProgressRecord 
} from '../types';

export type AccessDecisionReason = 
  | 'ALLOWED_STAFF'
  | 'ALLOWED_ACTIVE_ENROLLMENT'
  | 'ALLOWED_OVERRIDE'
  | 'DENIED_NOT_AUTHENTICATED'
  | 'DENIED_NOT_ENROLLED'
  | 'DENIED_ACCESS_PAUSED'
  | 'DENIED_ACCESS_EXPIRED'
  | 'DENIED_ACCESS_SUSPENDED'
  | 'DENIED_ACCESS_CANCELLED'
  | 'DENIED_ACCESS_NOT_STARTED'
  | 'DENIED_MATERIAL_LOCKED'
  | 'DENIED_MATERIAL_DRAFT'
  | 'DENIED_NOT_YET_RELEASED'
  | 'DENIED_DOWNLOAD_RESTRICTED'
  | 'DENIED_NO_PERMISSION';

export interface AccessCheckResult {
  allowed: boolean;
  reason: AccessDecisionReason;
  enrollment?: EnrollmentRecord;
  material?: CourseMaterial;
  messageAr: string;
}

/**
 * Centralized Access Resolution Engine
 */
export const canStudentAccessMaterial = async (
  userId: string | null | undefined,
  userRole: Role | undefined,
  materialId: string,
  courseId: string,
  operation: 'view' | 'download' = 'view'
): Promise<AccessCheckResult> => {
  // 1. Authentication check
  if (!userId) {
    return {
      allowed: false,
      reason: 'DENIED_NOT_AUTHENTICATED',
      messageAr: 'يرجى تسجيل الدخول للوصول إلى المحتوى التعليمي.'
    };
  }

  // 2. Staff override (Admins, Coordinators, Super Admins, Teachers)
  if (userRole && [Role.SUPER_ADMIN, Role.ADMIN, Role.COORDINATOR, Role.TEACHER].includes(userRole)) {
    return {
      allowed: true,
      reason: 'ALLOWED_STAFF',
      messageAr: 'تم منح إذن الوصول بصفة مسؤول/مدرب.'
    };
  }

  try {
    // 3. Fetch material metadata
    const materialRef = doc(db, 'materials', materialId);
    const materialSnap = await getDoc(materialRef);
    let materialData: CourseMaterial | null = null;

    if (materialSnap.exists()) {
      materialData = { id: materialSnap.id, ...materialSnap.data() } as CourseMaterial;
      if (materialData.status === 'DRAFT' || materialData.status === 'ARCHIVED') {
        return {
          allowed: false,
          reason: 'DENIED_MATERIAL_DRAFT',
          messageAr: 'هذه المادة التعليمية غير متاحة حالياً.'
        };
      }
      if (materialData.status === 'LOCKED') {
        return {
          allowed: false,
          reason: 'DENIED_MATERIAL_LOCKED',
          messageAr: 'المادة التعليمية مغلقة من قبل الإدارة.'
        };
      }
      if (materialData.availableFrom && new Date(materialData.availableFrom).getTime() > Date.now()) {
        return {
          allowed: false,
          reason: 'DENIED_NOT_YET_RELEASED',
          messageAr: `ستصبح هذه المادة متاحة بدءاً من ${new Date(materialData.availableFrom).toLocaleDateString('ar-EG')}.`
        };
      }
    }

    // 4. Fetch Enrollment
    const enrollmentsQ = query(
      collection(db, 'enrollments'),
      where('studentId', '==', userId),
      where('courseId', '==', courseId)
    );
    const enrollmentsSnap = await getDocs(enrollmentsQ);

    if (enrollmentsSnap.empty) {
      return {
        allowed: false,
        reason: 'DENIED_NOT_ENROLLED',
        messageAr: 'هذا المحتوى متاح للطلاب المسجلين رسمياً في الكورس فقط.'
      };
    }

    const enrollmentDoc = enrollmentsSnap.docs[0];
    const enrollment = { id: enrollmentDoc.id, ...enrollmentDoc.data() } as EnrollmentRecord;

    // 5. Evaluate Enrollment Status
    if (enrollment.status === 'PAUSED') {
      return {
        allowed: false,
        reason: 'DENIED_ACCESS_PAUSED',
        enrollment,
        messageAr: 'تم إيقاف اشتراكك مؤقتاً. يرجى التواصل مع إدارة المركز لإعادة التفعيل.'
      };
    }
    if (enrollment.status === 'SUSPENDED' || enrollment.status === 'CANCELLED') {
      return {
        allowed: false,
        reason: 'DENIED_ACCESS_SUSPENDED',
        enrollment,
        messageAr: 'اشتراكك ملغى أو معلق حالياً.'
      };
    }
    if (enrollment.status === 'EXPIRED') {
      return {
        allowed: false,
        reason: 'DENIED_ACCESS_EXPIRED',
        enrollment,
        messageAr: 'انتهت فترة الوصول الخاصة باشتراكك في هذا الكورس.'
      };
    }

    const now = Date.now();
    if (enrollment.startDate && new Date(enrollment.startDate).getTime() > now) {
      return {
        allowed: false,
        reason: 'DENIED_ACCESS_NOT_STARTED',
        enrollment,
        messageAr: `سيبدأ الكورس واشتراكك في ${new Date(enrollment.startDate).toLocaleDateString('ar-EG')}.`
      };
    }
    if (enrollment.endDate && new Date(enrollment.endDate).getTime() < now) {
      return {
        allowed: false,
        reason: 'DENIED_ACCESS_EXPIRED',
        enrollment,
        messageAr: 'انتهت صلاحية اشتراكك الزمني في هذا الكورس.'
      };
    }

    // 6. Check Specific Material Override in studentMaterialAccess
    const overrideQ = query(
      collection(db, 'studentMaterialAccess'),
      where('studentId', '==', userId),
      where('materialId', '==', materialId)
    );
    const overrideSnap = await getDocs(overrideQ);

    if (!overrideSnap.empty) {
      const overrideData = overrideSnap.docs[0].data() as StudentMaterialAccess;
      if (overrideData.access === 'CLOSED' || overrideData.access === 'LOCKED') {
        return {
          allowed: false,
          reason: 'DENIED_MATERIAL_LOCKED',
          enrollment,
          material: materialData || undefined,
          messageAr: 'تم إغلاق هذه المادة المحددة لحسابك من قبل الإدارة.'
        };
      }
      if (overrideData.access === 'OPEN') {
        if (operation === 'download' && overrideData.allowDownload === false) {
          return {
            allowed: false,
            reason: 'DENIED_DOWNLOAD_RESTRICTED',
            enrollment,
            material: materialData || undefined,
            messageAr: 'العرض متاح ولكن التحميل غير مصرح به لهذه المادة.'
          };
        }
        return {
          allowed: true,
          reason: 'ALLOWED_OVERRIDE',
          enrollment,
          material: materialData || undefined,
          messageAr: 'متاح للوصول'
        };
      }
    }

    // 7. Open All Materials check
    if (enrollment.openAllMaterials) {
      if (operation === 'download' && materialData && materialData.allowDownload === false) {
        return {
          allowed: false,
          reason: 'DENIED_DOWNLOAD_RESTRICTED',
          enrollment,
          material: materialData,
          messageAr: 'التحميل غير مصرح لهذه المادة.'
        };
      }
      return {
        allowed: true,
        reason: 'ALLOWED_ACTIVE_ENROLLMENT',
        enrollment,
        material: materialData || undefined,
        messageAr: 'متاح للوصول'
      };
    }

    // If openAllMaterials is false and no explicit OPEN override was found
    return {
      allowed: false,
      reason: 'DENIED_MATERIAL_LOCKED',
      enrollment,
      material: materialData || undefined,
      messageAr: 'هذه المادة غير مفتوحة حالياً باشتراكك.'
    };

  } catch (error) {
    console.error('Error in access resolution engine:', error);
    return {
      allowed: false,
      reason: 'DENIED_NO_PERMISSION',
      messageAr: 'تعذر التحقق من صلاحيات الوصول.'
    };
  }
};

/**
 * Fetch all enrollments for a student
 */
export const getEnrollmentsForStudent = async (studentId: string): Promise<EnrollmentRecord[]> => {
  try {
    const q = query(collection(db, 'enrollments'), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    const records: EnrollmentRecord[] = [];
    snapshot.forEach(doc => records.push({ id: doc.id, ...doc.data() } as EnrollmentRecord));
    return records;
  } catch (err) {
    console.error('Error fetching student enrollments:', err);
    return [];
  }
};

/**
 * Fetch single enrollment record
 */
export const getEnrollment = async (studentId: string, courseId: string): Promise<EnrollmentRecord | null> => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as EnrollmentRecord;
  } catch (err) {
    console.error('Error getting enrollment:', err);
    return null;
  }
};

/**
 * Fetch all enrollments for Admin Management
 */
export const getAllEnrollmentsFromFirestore = async (): Promise<EnrollmentRecord[]> => {
  try {
    const col = collection(db, 'enrollments');
    const snapshot = await getDocs(col);
    const records: EnrollmentRecord[] = [];
    snapshot.forEach(doc => records.push({ id: doc.id, ...doc.data() } as EnrollmentRecord));
    return records;
  } catch (err) {
    console.error('Error fetching all enrollments:', err);
    return [];
  }
};

/**
 * Save or update enrollment
 */
export const saveEnrollmentToFirestore = async (record: EnrollmentRecord): Promise<void> => {
  try {
    const docRef = doc(db, 'enrollments', record.id);
    await setDoc(docRef, { ...record, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error saving enrollment:', err);
    throw err;
  }
};

/**
 * Quick toggle: Open All Course Materials for Enrollment
 */
export const openAllCourseMaterialsForEnrollment = async (enrollmentId: string, openAll: boolean): Promise<void> => {
  try {
    const docRef = doc(db, 'enrollments', enrollmentId);
    await updateDoc(docRef, {
      openAllMaterials: openAll,
      status: 'ACTIVE',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error toggling open all materials:', err);
    throw err;
  }
};

/**
 * Update enrollment status
 */
export const updateEnrollmentStatusInFirestore = async (
  enrollmentId: string, 
  status: CourseAccessStatus
): Promise<void> => {
  try {
    const docRef = doc(db, 'enrollments', enrollmentId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating enrollment status:', err);
    throw err;
  }
};

/**
 * Extend enrollment end date by N days
 */
export const extendEnrollmentDuration = async (enrollmentId: string, daysToAdd: number = 30): Promise<string> => {
  try {
    const docRef = doc(db, 'enrollments', enrollmentId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Enrollment not found');

    const currentData = snap.data() as EnrollmentRecord;
    let baseDate = new Date();
    if (currentData.endDate && new Date(currentData.endDate).getTime() > Date.now()) {
      baseDate = new Date(currentData.endDate);
    }
    
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    const newEndDate = baseDate.toISOString();

    await updateDoc(docRef, {
      endDate: newEndDate,
      status: 'ACTIVE',
      updatedAt: new Date().toISOString()
    });

    return newEndDate;
  } catch (err) {
    console.error('Error extending enrollment:', err);
    throw err;
  }
};

/**
 * Set material access override for a specific student & material
 */
export const setMaterialAccessOverrideInFirestore = async (
  studentId: string,
  enrollmentId: string,
  courseId: string,
  materialId: string,
  access: 'OPEN' | 'CLOSED' | 'LOCKED',
  allowDownload: boolean = true
): Promise<void> => {
  try {
    const id = `${studentId}_${materialId}`;
    const docRef = doc(db, 'studentMaterialAccess', id);
    await setDoc(docRef, {
      id,
      studentId,
      enrollmentId,
      courseId,
      materialId,
      access,
      override: true,
      allowDownload,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error setting material access override:', err);
    throw err;
  }
};

/**
 * Get all material access overrides for a student in a course
 */
export const getStudentMaterialOverrides = async (
  studentId: string, 
  courseId: string
): Promise<Record<string, StudentMaterialAccess>> => {
  try {
    const q = query(
      collection(db, 'studentMaterialAccess'),
      where('studentId', '==', studentId),
      where('courseId', '==', courseId)
    );
    const snap = await getDocs(q);
    const map: Record<string, StudentMaterialAccess> = {};
    snap.forEach(d => {
      const data = d.data() as StudentMaterialAccess;
      map[data.materialId] = data;
    });
    return map;
  } catch (err) {
    console.error('Error fetching material overrides:', err);
    return {};
  }
};

/**
 * Fetch Course Materials from Firestore
 */
export const fetchCourseMaterialsFromFirestore = async (courseId: string): Promise<CourseMaterial[]> => {
  try {
    const q = query(collection(db, 'materials'), where('courseId', '==', courseId));
    const snap = await getDocs(q);
    const list: CourseMaterial[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as CourseMaterial));
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.error('Error fetching materials:', err);
    return [];
  }
};

/**
 * Save Course Material
 */
export const saveCourseMaterialToFirestore = async (material: CourseMaterial): Promise<void> => {
  try {
    const docRef = doc(db, 'materials', material.id);
    await setDoc(docRef, { ...material, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error saving course material:', err);
    throw err;
  }
};

/**
 * Delete Course Material
 */
export const deleteCourseMaterialFromFirestore = async (materialId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'materials', materialId));
  } catch (err) {
    console.error('Error deleting course material:', err);
    throw err;
  }
};

/**
 * Log student material access audit
 */
export const logMaterialAccessAudit = async (
  studentId: string,
  courseId: string,
  materialId: string,
  action: 'OPENED' | 'VIDEO_START' | 'VIDEO_COMPLETED' | 'DOWNLOAD' | 'SIMULATION_START' | 'EXAM_START'
): Promise<void> => {
  try {
    await addDoc(collection(db, 'material_audit_logs'), {
      studentId,
      courseId,
      materialId,
      action,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    // Audit error silent fail
  }
};
