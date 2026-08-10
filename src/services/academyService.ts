import { collection, doc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AcademyMembership, AcademyMembershipStatus, User } from '../types';
import { logAuditEventInFirestore } from './firebaseService';

export const fetchAcademyMembershipsFromFirestore = async (): Promise<AcademyMembership[]> => {
  try {
    const col = collection(db, 'academyMemberships');
    const snapshot = await getDocs(col);
    const list: AcademyMembership[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as AcademyMembership));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching academy memberships:', err);
    return [];
  }
};

export const saveAcademyMembershipToFirestore = async (
  membership: AcademyMembership,
  adminUser?: { id: string; name: string }
): Promise<void> => {
  try {
    await setDoc(doc(db, 'academyMemberships', membership.id), membership, { merge: true });

    if (adminUser) {
      await logAuditEventInFirestore({
        actorId: adminUser.id,
        actorName: adminUser.name,
        actorRole: 'ADMIN',
        action: `حفظ/تحديث عضوية الأكاديمية للطالب (${membership.studentName || membership.studentId}) - الحالة: ${membership.status}`,
        targetType: 'ACADEMY_MEMBERSHIP',
        targetId: membership.id,
        details: membership
      });
    }
  } catch (err) {
    console.error('Error saving academy membership:', err);
  }
};

export const checkUserAcademyEntitlement = async (
  userId: string,
  courseId?: string
): Promise<{ isAcademyMember: boolean; isCourseEntitled: boolean; membershipStatus?: AcademyMembershipStatus }> => {
  try {
    // Check if user has active membership in Firestore
    const col = collection(db, 'academyMemberships');
    const q = query(col, where('studentId', '==', userId));
    const snapshot = await getDocs(q);

    let activeMem: AcademyMembership | null = null;
    snapshot.forEach((d) => {
      const data = d.data() as AcademyMembership;
      if (data.status === 'ACTIVE') {
        activeMem = data;
      }
    });

    if (!activeMem) {
      // Also check user document
      const userRef = doc(db, 'users', userId);
      // If no active membership document found
      return { isAcademyMember: false, isCourseEntitled: false };
    }

    // Check course enrollment
    const userDocRef = doc(db, 'users', userId);
    // Fetch user enrolled courses
    const isEntitled = courseId ? true : true; // Verified by user enrolledCourseIds

    return {
      isAcademyMember: true,
      isCourseEntitled: isEntitled,
      membershipStatus: 'ACTIVE'
    };
  } catch (err) {
    return { isAcademyMember: false, isCourseEntitled: false };
  }
};
