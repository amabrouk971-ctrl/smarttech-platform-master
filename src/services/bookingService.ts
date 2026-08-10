import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CourseBooking, PaymentSettings, Course, PaymentMethod } from '../types';

export const getPaymentSettings = async (): Promise<PaymentSettings> => {
  const settingsDoc = await getDoc(doc(db, 'settings', 'payment'));
  if (settingsDoc.exists()) {
    return settingsDoc.data() as PaymentSettings;
  }
  // Defaults
  return {
    instapayNumber: '01024434357',
    vodafoneCashNumber: '01024434357',
    whatsappNumber: '201024434357',
    branchInformation: 'SmartTech Advanced Training - Alexandria Zizinia Main HQ',
    instapayEnabled: true,
    vodafoneCashEnabled: true,
    inPersonEnabled: true
  };
};

export const updatePaymentSettings = async (settings: PaymentSettings): Promise<void> => {
  await setDoc(doc(db, 'settings', 'payment'), settings);
};

export const createBooking = async (booking: Omit<CourseBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const bookingRef = doc(collection(db, 'courseBookings'));
  const newBooking: CourseBooking = {
    ...booking,
    id: bookingRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await setDoc(bookingRef, newBooking);
  return bookingRef.id;
};

export const getBookings = async (): Promise<CourseBooking[]> => {
  const q = query(collection(db, 'courseBookings'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as CourseBooking);
};

export const updateBookingStatus = async (id: string, statusUpdates: Partial<CourseBooking>): Promise<void> => {
  const bookingRef = doc(db, 'courseBookings', id);
  await updateDoc(bookingRef, {
    ...statusUpdates,
    updatedAt: new Date().toISOString()
  });
};
