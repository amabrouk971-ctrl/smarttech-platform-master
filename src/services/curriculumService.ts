import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CourseUnit } from '../types';

export const getCurriculumForCourse = async (courseId: string): Promise<CourseUnit[]> => {
  try {
    const q = query(collection(db, 'curriculum_units'), where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    const units: CourseUnit[] = [];
    snapshot.forEach(doc => units.push({ id: doc.id, ...doc.data() } as CourseUnit));
    // Sort by order
    return units.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return [];
  }
};

export const saveCurriculumUnit = async (unitData: CourseUnit): Promise<void> => {
  try {
    const docRef = doc(db, 'curriculum_units', unitData.id);
    await setDoc(docRef, unitData, { merge: true });
  } catch (error) {
    console.error('Error saving curriculum unit:', error);
    throw error;
  }
};

export const deleteCurriculumUnit = async (unitId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'curriculum_units', unitId));
  } catch (error) {
    console.error('Error deleting unit:', error);
    throw error;
  }
};
