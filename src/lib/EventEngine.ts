import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { PlatformEvent, EventType, Notification, ParentStudentRelationship } from '../types';

export class EventEngine {
  static async publish(eventData: Omit<PlatformEvent, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const event: PlatformEvent = {
      ...eventData,
      id: eventId,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // 1. Save Event Document
    await addDoc(collection(db, 'events'), event);

    // 2. Trigger Processor Asynchronously
    this.processEvent(event).catch(console.error);

    return eventId;
  }

  private static async processEvent(event: PlatformEvent) {
    try {
      const recipients = await this.resolveAudience(event);
      if (recipients.length === 0) return;

      const { title, body } = this.generateNotificationTemplate(event);

      const promises = recipients.map(recipientId => {
        const notif: Omit<Notification, 'id'> = {
          recipientId,
          type: event.eventType,
          title,
          body,
          entityType: event.entityId ? event.eventType : undefined,
          entityId: event.entityId,
          studentId: event.studentId,
          courseId: event.courseId,
          sessionId: event.sessionId,
          createdAt: new Date().toISOString(),
          status: 'UNREAD'
        };
        return addDoc(collection(db, 'notifications'), notif);
      });

      await Promise.all(promises);
    } catch (err) {
      console.error('Error processing event:', err);
    }
  }

  private static async resolveAudience(event: PlatformEvent): Promise<string[]> {
    const recipients = new Set<string>();

    if (event.studentId) {
      const parentSnap = await getDocs(
        query(
          collection(db, 'parentStudentRelationships'),
          where('studentId', '==', event.studentId),
          where('status', '==', 'ACTIVE')
        )
      );
      
      parentSnap.docs.forEach(d => {
        const rel = d.data() as ParentStudentRelationship;
        recipients.add(rel.parentId);
      });

      if (['EXAM_GRADED', 'ATTENDANCE_PRESENT', 'BIRTHDAY'].includes(event.eventType)) {
        recipients.add(event.studentId);
      }
    }

    if (event.eventType === 'MESSAGE_RECEIVED' && event.actorId && event.payload.recipientId) {
       recipients.add(event.payload.recipientId);
    }

    return Array.from(recipients);
  }

  private static generateNotificationTemplate(event: PlatformEvent): { title: string, body: string } {
    let title = 'إشعار جديد';
    let body = 'لديك تحديث جديد في المنصة.';

    switch (event.eventType) {
      case 'BIRTHDAY':
        title = 'عيد ميلاد سعيد! 🎉';
        body = event.payload.studentName ? `كل عام والطالب ${event.payload.studentName} بألف خير!` : 'كل عام وأنت بخير!';
        break;
      case 'ATTENDANCE_PRESENT':
        title = 'تسجيل حضور';
        body = event.payload.studentName ? `تم تسجيل حضور الطالب ${event.payload.studentName}.` : `تم تسجيل الحضور بنجاح.`;
        break;
      case 'ATTENDANCE_LATE':
        title = 'تأخير عن الموعد';
        body = event.payload.studentName ? `تم تسجيل حضور الطالب ${event.payload.studentName} متأخراً.` : `تم تسجيل الحضور متأخراً.`;
        break;
      case 'ATTENDANCE_ABSENT':
        title = 'غياب عن المحاضرة';
        body = event.payload.studentName ? `تم تسجيل غياب الطالب ${event.payload.studentName}.` : `تم تسجيل غياب الطالب اليوم.`;
        break;
      case 'EXAM_GRADED':
        title = 'نتيجة اختبار جديدة';
        body = `تم رصد درجة الاختبار: ${event.payload.score || ''}`;
        break;
      case 'CONCENTRATION_RECORDED':
        title = 'تحديث مستوى التركيز';
        body = `مستوى التركيز المسجل: ${event.payload.score || ''}%`;
        break;
      case 'MESSAGE_RECEIVED':
        title = 'رسالة جديدة';
        body = `تلقيت رسالة جديدة.`;
        break;
      case 'ANNOUNCEMENT_CREATED':
        title = 'إعلان هام';
        body = event.payload.title || 'تم نشر إعلان جديد.';
        break;
      case 'SESSION_COMPLETED':
        title = 'انتهاء المحاضرة';
        body = `تم الانتهاء من المحاضرة. يمكنك الاطلاع على التقرير.`;
        break;
    }

    return { title, body };
  }
}
