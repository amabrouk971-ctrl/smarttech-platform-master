import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  addDoc 
} from 'firebase/firestore';
import { AttendanceRecord, User } from '../types';

const ATTENDANCE_COLLECTION = 'attendance';

/**
 * Scan & record attendance via QR
 */
export async function recordQrAttendance(params: {
  qrToken: string;
  scannerUser: User;
  courseId?: string;
  classId?: string;
}): Promise<{ success: boolean; studentName?: string; message: string; record?: AttendanceRecord }> {
  try {
    if (!params.qrToken || params.qrToken.trim() === '') {
      return { success: false, message: 'كود QR الممسوح غير صالحة أو فارغ.' };
    }

    // Find student by qrToken or ID
    const usersRef = collection(db, 'users');
    let studentDoc: any = null;

    // First try qrToken field
    const qToken = query(usersRef, where('studentProfile.qrToken', '==', params.qrToken.trim()));
    const tokenSnap = await getDocs(qToken);

    if (!tokenSnap.empty) {
      studentDoc = { id: tokenSnap.docs[0].id, ...tokenSnap.docs[0].data() };
    } else {
      // Try direct UID or ID match
      const docDirect = await getDoc(doc(db, 'users', params.qrToken.trim()));
      if (docDirect.exists()) {
        studentDoc = { id: docDirect.id, ...docDirect.data() };
      }
    }

    if (!studentDoc) {
      return { success: false, message: 'لم يتم العثور على طالب مرتبط بهذا الـ QR.' };
    }

    const now = new Date().toISOString();
    const attendanceId = `ATT-${Date.now()}`;
    const attendanceRef = doc(db, ATTENDANCE_COLLECTION, attendanceId);

    const record: Omit<AttendanceRecord, 'id'> = {
      studentId: studentDoc.id,
      studentName: studentDoc.name || studentDoc.fullName || 'طالب SmartTech',
      courseId: params.courseId || studentDoc.enrolledCourseId || 'ALL_COURSES',
      courseName: studentDoc.enrolledCourseName || 'كورس SmartTech',
      classId: params.classId || 'CLASS-101',
      className: 'المجموعة الأولى',
      scannerUserId: params.scannerUser.id,
      scannerUserName: params.scannerUser.name || 'مسؤول الحضور',
      checkInTime: now,
      method: 'QR',
      device: navigator.userAgent.includes('Mobile') ? 'Mobile Scanner' : 'Desktop Scanner',
      status: 'PRESENT',
      createdAt: now
    };

    const cleanRecord = JSON.parse(JSON.stringify(record));
    await setDoc(attendanceRef, cleanRecord);

    // Trigger Notification in Firestore
    try {
      const notifText = `تم تسجيل حضور الطالب ${record.studentName} في ${record.courseName} الساعة ${new Date().toLocaleTimeString('ar-EG')}`;
      
      // Student Notification
      await addDoc(collection(db, 'notifications'), {
        userId: studentDoc.id,
        title: 'تأكيد الحضور بـ QR',
        message: notifText,
        type: 'ATTENDANCE',
        read: false,
        createdAt: now
      });

      // Parent Notification if linked
      if (studentDoc.studentProfile?.parentEmail) {
        await addDoc(collection(db, 'notifications'), {
          userEmail: studentDoc.studentProfile.parentEmail,
          title: 'تنبيه حضور ابنك/ابنتك',
          message: notifText,
          type: 'ATTENDANCE',
          read: false,
          createdAt: now
        });
      }
    } catch (nErr) {
      console.error('Notification trigger error:', nErr);
    }

    return {
      success: true,
      studentName: record.studentName,
      message: `تم تسجيل حضور الطالب ${record.studentName} بنجاح!`,
      record: { id: attendanceId, ...record }
    };
  } catch (err: any) {
    console.error('Error recording QR attendance:', err);
    return { success: false, message: err?.message || 'حدث خطأ أثناء تسجيل الحضور' };
  }
}

/**
 * Fetch attendance records
 */
export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const snap = await getDocs(collection(db, ATTENDANCE_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord));
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    return [];
  }
}
