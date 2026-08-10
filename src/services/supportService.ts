import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc 
} from 'firebase/firestore';
import { SupportTicket, SupportMessage, SupportQuickReply, TicketStatus, TicketPriority, TicketCategory } from '../types';

const TICKETS_COLLECTION = 'supportTickets';
const MESSAGES_COLLECTION = 'supportMessages';
const QUICK_REPLIES_COLLECTION = 'supportQuickReplies';

/**
 * Create a new support ticket
 */
export async function createSupportTicket(ticketData: {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userDob?: string;
  userRole: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  messageText: string;
  courseId?: string;
  courseName?: string;
  attachmentsUrl?: string[];
  voiceUrl?: string;
  voiceDurationSeconds?: number;
  deviceInfo?: any;
}): Promise<string> {
  const shortId = Math.floor(1000 + Math.random() * 9000);
  const ticketId = `ST-TICK-${shortId}`;
  const now = new Date().toISOString();

  const ticketPayload: Omit<SupportTicket, 'id'> = {
    ticketNumber: ticketId,
    userId: ticketData.userId,
    userName: ticketData.userName,
    userEmail: ticketData.userEmail,
    userPhone: ticketData.userPhone || '',
    userDob: ticketData.userDob || '',
    userRole: ticketData.userRole,
    subject: ticketData.subject,
    category: ticketData.category,
    priority: ticketData.priority,
    status: 'OPEN',
    courseId: ticketData.courseId || '',
    courseName: ticketData.courseName || '',
    deviceInfo: ticketData.deviceInfo || {},
    hasUnreadAdmin: true,
    hasUnreadCustomer: false,
    createdAt: now,
    updatedAt: now,
    slaStatus: 'WITHIN_SLA'
  };

  const cleanTicket = JSON.parse(JSON.stringify(ticketPayload));
  await setDoc(doc(db, TICKETS_COLLECTION, ticketId), cleanTicket);

  // Send initial customer message
  if (ticketData.messageText || ticketData.voiceUrl || (ticketData.attachmentsUrl && ticketData.attachmentsUrl.length > 0)) {
    await sendSupportMessage({
      ticketId,
      senderId: ticketData.userId,
      senderName: ticketData.userName,
      senderRole: ticketData.userRole,
      text: ticketData.messageText,
      voiceUrl: ticketData.voiceUrl,
      voiceDurationSeconds: ticketData.voiceDurationSeconds,
      attachmentsUrl: ticketData.attachmentsUrl
    });
  }

  // Trigger automated acknowledgment message from system
  const ackMessage = `مرحباً ${ticketData.userName}، تم استلام طلب الدعم الخاص بك بنجاح (رقم الطلب: ${ticketId}). سيقوم فريق الدعم الفني بمراجعته والرد عليك في أقرب وقت.`;
  await sendSupportMessage({
    ticketId,
    senderId: 'SYSTEM',
    senderName: 'فريق الدعم الفني - SmartTech',
    senderRole: 'ADMIN',
    text: ackMessage
  });

  return ticketId;
}

/**
 * Fetch all tickets (For Admin / Support Staff)
 */
export async function fetchAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    const snap = await getDocs(collection(db, TICKETS_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket));
  } catch (err) {
    console.error('Error fetching support tickets:', err);
    return [];
  }
}

/**
 * Fetch customer specific tickets
 */
export async function fetchUserSupportTickets(userId: string): Promise<SupportTicket[]> {
  try {
    const q = query(collection(db, TICKETS_COLLECTION), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket));
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    return [];
  }
}

/**
 * Subscribe to Ticket real-time messages
 */
export function subscribeToSupportMessages(ticketId: string, callback: (messages: SupportMessage[]) => void) {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('ticketId', '==', ticketId)
  );

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportMessage));
    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(msgs);
  }, (err) => {
    console.error('Error in support messages listener:', err);
  });
}

/**
 * Send message inside a support ticket
 */
export async function sendSupportMessage(msgData: {
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text?: string;
  voiceUrl?: string;
  voiceDurationSeconds?: number;
  imageUrl?: string;
  attachmentsUrl?: string[];
  isInternalNote?: boolean;
}): Promise<string> {
  const now = new Date().toISOString();
  const payload: Omit<SupportMessage, 'id'> = {
    ticketId: msgData.ticketId,
    senderId: msgData.senderId,
    senderName: msgData.senderName,
    senderRole: msgData.senderRole,
    text: msgData.text || '',
    voiceUrl: msgData.voiceUrl || '',
    voiceDurationSeconds: msgData.voiceDurationSeconds || 0,
    imageUrl: msgData.imageUrl || '',
    attachmentsUrl: msgData.attachmentsUrl || [],
    isInternalNote: msgData.isInternalNote || false,
    createdAt: now
  };

  const clean = JSON.parse(JSON.stringify(payload));
  const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), clean);

  // Update parent ticket timestamp & status flags
  const ticketRef = doc(db, TICKETS_COLLECTION, msgData.ticketId);
  const isCustomer = msgData.senderRole === 'STUDENT' || msgData.senderRole === 'PARENT';
  
  await updateDoc(ticketRef, {
    updatedAt: now,
    hasUnreadAdmin: isCustomer,
    hasUnreadCustomer: !isCustomer,
    status: isCustomer ? 'IN_PROGRESS' : 'WAITING_FOR_CUSTOMER'
  }).catch(() => {});

  return docRef.id;
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(ticketId: string, status: TicketStatus, assignedToId?: string, assignedToName?: string): Promise<void> {
  const ref = doc(db, TICKETS_COLLECTION, ticketId);
  const updates: any = { status, updatedAt: new Date().toISOString() };
  if (assignedToId) updates.assignedToId = assignedToId;
  if (assignedToName) updates.assignedToName = assignedToName;
  if (status === 'RESOLVED' || status === 'CLOSED') updates.resolvedAt = new Date().toISOString();

  await updateDoc(ref, updates);
}

/**
 * Quick Replies Management
 */
export async function fetchSupportQuickReplies(): Promise<SupportQuickReply[]> {
  try {
    const snap = await getDocs(collection(db, QUICK_REPLIES_COLLECTION));
    if (snap.empty) {
      // Seed default quick replies if empty
      const defaultReplies: Omit<SupportQuickReply, 'id'>[] = [
        {
          title: 'استلام الطلب والمراجعة',
          category: 'عام',
          messageAr: 'مرحباً {{customerName}}، تم استلام طلب الدعم الخاص بك بنجاح، وسيقوم فريق SmartTech بمراجعته والرد عليك في أقرب وقت.',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          title: 'تأكيد الحجز والدفع',
          category: 'مدفوعات',
          messageAr: 'أهلاً بك {{customerName}}، تم التحقق من عملية الدفع الخاصة بك لكورس {{courseName}}، وتأكيد حجزك برقم {{bookingId}}.',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          title: 'الدعم التقني والمنصة',
          category: 'فني',
          messageAr: 'عزيزي {{customerName}}، يرجى إعادة تشغيل التطبيق أو تحديث الصفحة وفي حال استمرار المشكلة سنقوم بمتابعتك فوراً.',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      for (const r of defaultReplies) {
        await addDoc(collection(db, QUICK_REPLIES_COLLECTION), r);
      }
      const newSnap = await getDocs(collection(db, QUICK_REPLIES_COLLECTION));
      return newSnap.docs.map(d => ({ id: d.id, ...d.data() } as SupportQuickReply));
    }

    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportQuickReply));
  } catch (err) {
    console.error('Error fetching quick replies:', err);
    return [];
  }
}

export async function saveSupportQuickReply(reply: Partial<SupportQuickReply> & { title: string; messageAr: string }): Promise<string> {
  const id = reply.id || `QR-${Date.now()}`;
  const ref = doc(db, QUICK_REPLIES_COLLECTION, id);
  const now = new Date().toISOString();

  const payload: Omit<SupportQuickReply, 'id'> = {
    title: reply.title,
    category: reply.category || 'عام',
    messageAr: reply.messageAr,
    messageEn: reply.messageEn || '',
    isActive: reply.isActive !== undefined ? reply.isActive : true,
    createdBy: reply.createdBy || 'ADMIN',
    createdAt: reply.createdAt || now
  };

  await setDoc(ref, JSON.parse(JSON.stringify(payload)), { merge: true });
  return id;
}

export async function deleteSupportQuickReply(id: string): Promise<void> {
  await deleteDoc(doc(db, QUICK_REPLIES_COLLECTION, id));
}
