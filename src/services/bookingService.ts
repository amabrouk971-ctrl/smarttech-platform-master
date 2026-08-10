import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CourseBooking, ContactPaymentSettings, PaymentSettings, PaymentMethod, PaymentStatus, BookingStatus } from '../types';
import { createLeadInFirestore, fetchLeadsFromFirestore } from './leadService';

export const DEFAULT_CONTACT_PAYMENT_SETTINGS: ContactPaymentSettings = {
  instapayNumber: '01227811948',
  instapayWhatsapp: '01227811948',
  vodafoneCashNumber: '01024434357',
  vodafoneCashWhatsapp: '01024434357',
  supportWhatsapp: '01227811948',
  centerName: 'مركز سمارتك للتدريب المتطور — SmartTech Center',
  centerAddress: 'الإسكندرية - زيزينيا (شارع أبوقير - أعلى البنك الأهلي المصري)',
  googleMapsUrl: 'https://www.google.com/maps/place/%D8%B3%D9%85%D8%A7%D8%B1%D8%AA%D9%83+%D9%84%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8+%D8%A7%D9%84%D9%8AA%D8%AA%D8%B7%D9%88%D8%B1%E2%80%AD%E2%80%AD/@31.2401598,29.9635953,17z/data=!4m2!3m1!1s0x14f5c513a27e37ed:0xee5386b29ced202e',
  latitude: 31.2401598,
  longitude: 29.9635953,
  businessHours: 'يومياً من الساعة 10:00 صباحاً حتى 08:00 مساءً (عدا الجمعة)',
  paymentRecipientName: 'SmartTech Center',
  paymentInstructions: '1. انسخ رقم الدفع الموضح أعلاه.\n2. افتح تطبيق InstaPay أو محفظة Vodafone Cash بحسب اختيارك.\n3. قم بتحويل قيمة الكورس المستحقة.\n4. احتفظ بإثبات التحويل (Screenshot).\n5. اضغط "إرسال التأكيد عبر WhatsApp" لمراجعة التحويل وتأكيد حجزك.',
  paymentConfirmationInstructions: 'سيتم مراجعة التحويل وتأكيد الحجز رسمياً فور استلام الصورة عبر الواتساب من قِبل موظف المبيعات.',
  enableInstapay: true,
  enableVodafoneCash: true,
  enablePayInCenter: true,
  // Backwards compatibility aliases
  instapayEnabled: true,
  vodafoneCashEnabled: true,
  inPersonEnabled: true,
  whatsappNumber: '201227811948',
  branchInformation: 'زيزينيا - الإسكندرية (أعلى البنك الأهلي المصري)',
  whatsappTemplates: {
    courseInquiry: `مرحباً SmartTech 👋

أريد الاستفسار عن كورس: {{courseName}}
السعر المعلن: {{price}} EGP

أود معرفة التفاصيل التالية:
- المواعيد المتاحة وتواريخ البدء
- المحتوى والمهارات المكتسبة
- خيارات الحضور (حضوري / أونلاين)`,

    instapayPayment: `مرحباً SmartTech 👋

قمت بتحويل رسوم الكورس عبر InstaPay.

📌 تفاصيل الحجز:
• الكورس: {{courseName}}
• الاسم: {{customerName}}
• رقم الهاتف: {{phone}}
• المجموعة / الموعد: {{className}}
• موعد البداية: {{startDate}} ({{schedule}})
• طريقة الحضور: {{attendanceMode}}
• المبلغ: {{price}} EGP
• طريقة الدفع: InstaPay
• رقم الحجز: ST-{{bookingId}}

أرجو مراجعة التحويل وتأكيد الحجز.`,

    vodafoneCashPayment: `مرحباً SmartTech 👋

قمت بتحويل رسوم الكورس عبر Vodafone Cash.

📌 تفاصيل الحجز:
• الكورس: {{courseName}}
• الاسم: {{customerName}}
• رقم الهاتف: {{phone}}
• المجموعة / الموعد: {{className}}
• موعد البداية: {{startDate}} ({{schedule}})
• طريقة الحضور: {{attendanceMode}}
• المبلغ: {{price}} EGP
• طريقة الدفع: Vodafone Cash
• رقم الحجز: ST-{{bookingId}}

أرجو مراجعة التحويل وتأكيد الحجز.`,

    payInCenter: `مرحباً SmartTech 👋

أرغب في إتمام حجز الكورس والدفع داخل المركز.

📌 تفاصيل الحجز:
• الكورس: {{courseName}}
• الاسم: {{customerName}}
• رقم الهاتف: {{phone}}
• المجموعة / الموعد: {{className}}
• موعد البداية: {{startDate}} ({{schedule}})
• طريقة الحضور: {{attendanceMode}}
• السعر: {{price}} EGP
• طريقة الدفع: الدفع في المركز (Pay in Center)
• رقم الحجز: ST-{{bookingId}}

أرغب في زيارة المركز لإتمام الدفع وتأكيد الحجز.`,

    bookingConfirmation: `مرحباً {{customerName}}!
تم تسليم طلب حجزك لكورس {{courseName}} بنجاح.
رقم الحجز الخاص بك: ST-{{bookingId}}
حالة الدفع الحالية: {{paymentStatus}}`
  }
};

export const getPaymentSettings = async (): Promise<ContactPaymentSettings> => {
  try {
    const contactDoc = await getDoc(doc(db, 'settings', 'contactPayment'));
    if (contactDoc.exists()) {
      const data = contactDoc.data() as ContactPaymentSettings;
      return {
        ...DEFAULT_CONTACT_PAYMENT_SETTINGS,
        ...data,
        enableInstapay: data.enableInstapay ?? data.instapayEnabled ?? true,
        enableVodafoneCash: data.enableVodafoneCash ?? data.vodafoneCashEnabled ?? true,
        enablePayInCenter: data.enablePayInCenter ?? data.inPersonEnabled ?? true,
        whatsappTemplates: {
          ...DEFAULT_CONTACT_PAYMENT_SETTINGS.whatsappTemplates,
          ...(data.whatsappTemplates || {})
        }
      };
    }

    const legacyDoc = await getDoc(doc(db, 'settings', 'payment'));
    if (legacyDoc.exists()) {
      const data = legacyDoc.data() as Partial<ContactPaymentSettings>;
      return {
        ...DEFAULT_CONTACT_PAYMENT_SETTINGS,
        ...data,
        enableInstapay: data.enableInstapay ?? data.instapayEnabled ?? true,
        enableVodafoneCash: data.enableVodafoneCash ?? data.vodafoneCashEnabled ?? true,
        enablePayInCenter: data.enablePayInCenter ?? data.inPersonEnabled ?? true,
      };
    }
  } catch (err) {
    console.error('Error fetching payment settings from Firestore:', err);
  }
  return DEFAULT_CONTACT_PAYMENT_SETTINGS;
};

export const updatePaymentSettings = async (settings: ContactPaymentSettings): Promise<void> => {
  const updatedData: ContactPaymentSettings = {
    ...settings,
    instapayEnabled: settings.enableInstapay,
    vodafoneCashEnabled: settings.enableVodafoneCash,
    inPersonEnabled: settings.enablePayInCenter,
    whatsappNumber: settings.supportWhatsapp || settings.instapayWhatsapp || '201227811948',
    branchInformation: settings.centerAddress || settings.branchInformation,
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'settings', 'contactPayment'), updatedData, { merge: true });
  await setDoc(doc(db, 'settings', 'payment'), updatedData, { merge: true });
};

export const createBooking = async (booking: Omit<CourseBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const bookingRef = doc(collection(db, 'courseBookings'));
  const newBookingId = bookingRef.id;
  const shortId = newBookingId.substring(0, 6).toUpperCase();

  const newBooking: CourseBooking = {
    ...booking,
    id: newBookingId,
    bookingId: shortId,
    paymentStatus: booking.paymentStatus || (booking.paymentMethod === 'IN_PERSON' ? 'PAY_IN_CENTER_PENDING' : 'PENDING_VERIFICATION'),
    bookingStatus: booking.bookingStatus || 'NEW',
    whatsappStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Remove undefined properties before saving to Firestore to prevent "Unsupported field value: undefined"
  const cleanBooking = JSON.parse(JSON.stringify(newBooking));

  await setDoc(bookingRef, cleanBooking);

  // Sync / create Lead in Firestore without duplicating
  try {
    const existingLeads = await fetchLeadsFromFirestore();
    const cleanPhone = (booking.phone || '').trim();
    const existingLead = existingLeads.find(l => l.phone.trim() === cleanPhone || (booking.email && l.email?.trim() === booking.email.trim()));

    if (existingLead) {
      const selectedCourses = Array.from(new Set([...(existingLead.selectedCourses || []), booking.courseId]));
      const selectedCourseTitles = Array.from(new Set([...(existingLead.selectedCourseTitles || []), booking.courseNameSnapshot || booking.courseName || booking.courseId]));
      
      const leadUpdates = JSON.parse(JSON.stringify({
        interestLevel: 'HOT',
        selectedCourses,
        selectedCourseTitles,
        parentName: booking.parentName || existingLead.parentName,
        studentName: booking.studentName || existingLead.studentName,
        notes: `${existingLead.notes || ''}\n[Booking ST-${shortId} created for ${booking.courseNameSnapshot || booking.courseId}]`,
        updatedAt: new Date().toISOString()
      }));

      await updateDoc(doc(db, 'leads', existingLead.id), leadUpdates);
    } else {
      await createLeadInFirestore({
        leadId: `LEAD-${Date.now()}`,
        studentName: booking.studentName,
        parentName: booking.parentName || booking.customerName,
        phone: booking.phone,
        whatsappNumber: booking.whatsappNumber || booking.phone,
        email: booking.email || '',
        status: 'NEW',
        source: booking.source || 'WEBSITE_BOOKING',
        interestLevel: 'HOT',
        selectedCourses: [booking.courseId],
        selectedCourseTitles: [booking.courseNameSnapshot || booking.courseName || booking.courseId]
      }, { id: 'SYSTEM', name: 'SYSTEM_AUTOMATION', role: 'ADMIN' } as any);
    }
  } catch (leadError) {
    console.error('Lead auto-sync error during booking:', leadError);
  }

  return newBookingId;
};

export const getBookings = async (): Promise<CourseBooking[]> => {
  try {
    const q = query(collection(db, 'courseBookings'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as CourseBooking));
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
};

export const getUserBookings = async (identifier: string): Promise<CourseBooking[]> => {
  if (!identifier) return [];
  try {
    const all = await getBookings();
    const cleanId = identifier.trim().toLowerCase();
    return all.filter(b => 
      (b.phone && b.phone.includes(cleanId)) ||
      (b.whatsappNumber && b.whatsappNumber.includes(cleanId)) ||
      (b.email && b.email.toLowerCase() === cleanId) ||
      (b.customerId && b.customerId === identifier) ||
      (b.studentId && b.studentId === identifier) ||
      (b.parentId && b.parentId === identifier)
    );
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    return [];
  }
};

export const updateBookingStatus = async (id: string, statusUpdates: Partial<CourseBooking>): Promise<void> => {
  const bookingRef = doc(db, 'courseBookings', id);
  await updateDoc(bookingRef, {
    ...statusUpdates,
    updatedAt: new Date().toISOString()
  });
};

export const calculateCourseSeats = async (courseId: string, maxCapacity = 20, classId?: string): Promise<{
  maxCapacity: number;
  confirmedEnrollments: number;
  availableSeats: number;
  isFullyBooked: boolean;
}> => {
  try {
    const bookings = await getBookings();
    const activeBookings = bookings.filter(b => 
      b.courseId === courseId &&
      (!classId || b.classId === classId) &&
      b.bookingStatus !== 'CANCELLED' &&
      b.bookingStatus !== 'REJECTED' &&
      b.paymentStatus !== 'REJECTED'
    );

    const confirmedCount = activeBookings.filter(b => 
      b.bookingStatus === 'ENROLLED' || 
      b.bookingStatus === 'BOOKING_CONFIRMED' || 
      b.bookingStatus === 'CONFIRMED' ||
      b.paymentStatus === 'VERIFIED'
    ).length;

    const capacity = maxCapacity || 20;
    const available = Math.max(0, capacity - confirmedCount);

    return {
      maxCapacity: capacity,
      confirmedEnrollments: confirmedCount,
      availableSeats: available,
      isFullyBooked: available <= 0
    };
  } catch (err) {
    console.error('Error calculating seats:', err);
    return {
      maxCapacity: maxCapacity || 20,
      confirmedEnrollments: 0,
      availableSeats: maxCapacity || 20,
      isFullyBooked: false
    };
  }
};

export const formatWhatsAppMessage = (
  template: string,
  data: {
    courseName?: string;
    customerName?: string;
    phone?: string;
    price?: string | number;
    paymentMethod?: string;
    className?: string;
    startDate?: string;
    schedule?: string;
    attendanceMode?: string;
    bookingId?: string;
    centerName?: string;
    centerAddress?: string;
    reservationType?: string;
    expectedDuration?: string;
    receiptStatus?: string;
  }
): string => {
  let text = template || '';
  const variables: Record<string, string> = {
    courseName: data.courseName || '',
    customerName: data.customerName || '',
    phone: data.phone || '',
    price: data.price ? String(data.price) : '',
    paymentMethod: data.paymentMethod || '',
    className: data.className || '',
    startDate: data.startDate || '',
    schedule: data.schedule || '',
    attendanceMode: data.attendanceMode || '',
    bookingId: data.bookingId || '',
    centerName: data.centerName || '',
    centerAddress: data.centerAddress || '',
    reservationType: data.reservationType || 'مجموعة جماعية',
    expectedDuration: data.expectedDuration || 'شهر واحد (4 أسابيع)',
    receiptStatus: data.receiptStatus || ''
  };

  Object.entries(variables).forEach(([key, val]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    text = text.replace(regex, val);
  });

  return text;
};

export const getWhatsAppNumberForMethod = (
  method: 'INSTAPAY' | 'VODAFONE_CASH' | 'IN_PERSON' | 'INQUIRY',
  settings: ContactPaymentSettings
): string => {
  let num = '';
  if (method === 'INSTAPAY') {
    num = settings.instapayWhatsapp || settings.instapayNumber || settings.supportWhatsapp || '01227811948';
  } else if (method === 'VODAFONE_CASH') {
    num = settings.vodafoneCashWhatsapp || settings.vodafoneCashNumber || settings.supportWhatsapp || '01024434357';
  } else {
    num = settings.supportWhatsapp || settings.instapayWhatsapp || '01227811948';
  }

  let clean = num.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '20' + clean.substring(1);
  }
  return clean || '201227811948';
};

export const buildWhatsAppUrl = (
  targetNumber: string,
  message: string
): string => {
  let cleanNum = targetNumber.replace(/[^0-9]/g, '');
  if (cleanNum.startsWith('0')) {
    cleanNum = '20' + cleanNum.substring(1);
  }
  return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
};
