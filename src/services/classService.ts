import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CourseClass } from '../types';

export const getClassesForCourse = async (courseId: string): Promise<CourseClass[]> => {
  try {
    const q = query(collection(db, 'classes'), where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    const classes: CourseClass[] = [];
    snapshot.forEach(doc => classes.push({ id: doc.id, ...doc.data() } as CourseClass));
    return classes;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

export const saveClass = async (classData: CourseClass): Promise<void> => {
  try {
    const docRef = doc(db, 'classes', classData.id);
    await setDoc(docRef, {
      ...classData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving class:', error);
    throw error;
  }
};

export const deleteClass = async (classId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'classes', classId));
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};

// Also calculate course total available seats
export const getCourseTotalAvailableSeats = async (courseId: string): Promise<number> => {
  const classes = await getClassesForCourse(courseId);
  const activeClasses = classes.filter(c => c.status === 'PUBLISHED' || c.status === 'OPEN_FOR_ENROLLMENT');
  let totalAvailable = 0;
  activeClasses.forEach(c => {
    const available = c.capacity - (c.enrolledCount || 0);
    if (available > 0) totalAvailable += available;
  });
  return totalAvailable;
};

// Increment enrolled count
export const incrementClassEnrollment = async (classId: string, count: number = 1): Promise<void> => {
  const docRef = doc(db, 'classes', classId);
  await updateDoc(docRef, {
    enrolledCount: increment(count),
    updatedAt: new Date().toISOString()
  });
};
