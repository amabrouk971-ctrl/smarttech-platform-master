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
  addDoc
} from 'firebase/firestore';
import { EmailCampaign, EmailLog, RecipientType } from '../types';

const CAMPAIGNS_COLLECTION = 'campaigns';
const EMAIL_LOGS_COLLECTION = 'emailLogs';

/**
 * Fetch all email campaigns
 */
export async function fetchEmailCampaigns(): Promise<EmailCampaign[]> {
  try {
    const snap = await getDocs(collection(db, CAMPAIGNS_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EmailCampaign));
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    return [];
  }
}

/**
 * Save or update campaign
 */
export async function saveEmailCampaign(campaign: Partial<EmailCampaign> & { name: string; subject: string }): Promise<string> {
  const id = campaign.id || `CAMP-${Date.now()}`;
  const ref = doc(db, CAMPAIGNS_COLLECTION, id);
  const now = new Date().toISOString();

  const payload: Omit<EmailCampaign, 'id'> = {
    name: campaign.name,
    subject: campaign.subject,
    senderName: campaign.senderName || 'SmartTech Academy',
    senderEmail: campaign.senderEmail || 'info@smarttech.edu',
    recipientType: campaign.recipientType || 'ALL_STUDENTS',
    targetIds: campaign.targetIds || [],
    customEmails: campaign.customEmails || [],
    templateHtml: campaign.templateHtml || '<div></div>',
    status: campaign.status || 'DRAFT',
    scheduledAt: campaign.scheduledAt || undefined,
    sentAt: campaign.sentAt || undefined,
    recipientCount: campaign.recipientCount || 0,
    successCount: campaign.successCount || 0,
    failureCount: campaign.failureCount || 0,
    createdBy: campaign.createdBy || 'ADMIN',
    createdAt: campaign.createdAt || now,
    updatedAt: now
  };

  const clean = JSON.parse(JSON.stringify(payload));
  await setDoc(ref, clean, { merge: true });
  return id;
}

/**
 * Resolve recipient emails list from database according to recipientType
 */
export async function resolveRecipientEmails(recipientType: RecipientType, targetIds?: string[], customEmails?: string[]): Promise<{ email: string; name?: string; role?: string }[]> {
  try {
    if (recipientType === 'CUSTOM_LIST' && customEmails) {
      return customEmails.map(e => ({ email: e.trim() })).filter(e => e.email.includes('@'));
    }

    const usersSnap = await getDocs(collection(db, 'users'));
    const allUsers: any[] = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let filtered = allUsers;

    switch (recipientType) {
      case 'ALL_STAFF':
      case 'ALL_EMPLOYEES':
        filtered = allUsers.filter(u => ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR', 'EMPLOYEE'].includes(u.role));
        break;
      case 'ALL_TEACHERS':
        filtered = allUsers.filter(u => u.role === 'TEACHER');
        break;
      case 'ALL_STUDENTS':
        filtered = allUsers.filter(u => u.role === 'STUDENT' || u.role === 'ATTENDEE');
        break;
      case 'ALL_PARENTS':
        filtered = allUsers.filter(u => u.role === 'PARENT');
        break;
      case 'SELECTED_STAFF':
      case 'SELECTED_EMPLOYEES':
      case 'SELECTED_TEACHERS':
      case 'SELECTED_STUDENTS':
      case 'SELECTED_PARENTS':
        if (targetIds && targetIds.length > 0) {
          filtered = allUsers.filter(u => targetIds.includes(u.id));
        }
        break;
      default:
        break;
    }

    return filtered
      .filter(u => u.email && u.email.includes('@'))
      .map(u => ({
        email: u.email,
        name: u.name || u.fullName || 'عميل SmartTech',
        role: u.role
      }));
  } catch (err) {
    console.error('Error resolving recipient emails:', err);
    return [];
  }
}

/**
 * Interpolate email variables
 */
export function interpolateEmailVariables(html: string, variables: Record<string, string>): string {
  let result = html;
  const defaultVars: Record<string, string> = {
    firstName: 'العميل العزيز',
    lastName: '',
    fullName: 'عميل SmartTech المميز',
    email: 'user@smarttech.edu',
    courseName: 'كورس الذكاء الاصطناعي البرمجي',
    coursePrice: '2000 ج.م',
    discount: '20%',
    discountedPrice: '1600 ج.م',
    offerName: 'عروض SmartTech الخاصة',
    offerEndDate: new Date(Date.now() + 86400000 * 3).toLocaleDateString('ar-EG'),
    bookingId: 'ST-BOOK-101',
    studentName: 'الطالب',
    centerName: 'SmartTech Academy',
    supportEmail: 'support@smarttech.edu',
    ...variables
  };

  Object.keys(defaultVars).forEach(key => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, defaultVars[key]);
  });

  return result;
}

/**
 * Dispatch Campaign (Simulated backend / Firebase email logger)
 */
export async function sendCampaign(campaignId: string): Promise<{ successCount: number; failureCount: number }> {
  try {
    const campRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
    const campSnap = await getDoc(campRef);
    if (!campSnap.exists()) throw new Error('Campaign not found');

    const campaign = { id: campSnap.id, ...campSnap.data() } as EmailCampaign;
    await updateDoc(campRef, { status: 'SENDING', updatedAt: new Date().toISOString() });

    const recipients = await resolveRecipientEmails(campaign.recipientType, campaign.targetIds, campaign.customEmails);

    let success = 0;
    let failure = 0;

    for (const recipient of recipients) {
      try {
        const interpolated = interpolateEmailVariables(campaign.templateHtml, {
          email: recipient.email,
          fullName: recipient.name || 'عميلنا العزيز'
        });

        // Store email log in Firestore
        await addDoc(collection(db, EMAIL_LOGS_COLLECTION), {
          campaignId,
          recipientEmail: recipient.email,
          recipientName: recipient.name || '',
          subject: campaign.subject,
          status: 'SENT',
          sentAt: new Date().toISOString()
        });

        success++;
      } catch (e: any) {
        failure++;
        await addDoc(collection(db, EMAIL_LOGS_COLLECTION), {
          campaignId,
          recipientEmail: recipient.email,
          recipientName: recipient.name || '',
          subject: campaign.subject,
          status: 'FAILED',
          errorDetails: e?.message || 'Failed to dispatch email',
          sentAt: new Date().toISOString()
        });
      }
    }

    await updateDoc(campRef, {
      status: 'SENT',
      sentAt: new Date().toISOString(),
      recipientCount: recipients.length,
      successCount: success,
      failureCount: failure,
      updatedAt: new Date().toISOString()
    });

    return { successCount: success, failureCount: failure };
  } catch (err) {
    console.error('Error sending campaign:', err);
    await updateDoc(doc(db, CAMPAIGNS_COLLECTION, campaignId), { status: 'FAILED' }).catch(() => {});
    throw err;
  }
}

/**
 * Fetch Campaign logs
 */
export async function fetchEmailLogs(campaignId?: string): Promise<EmailLog[]> {
  try {
    let q = query(collection(db, EMAIL_LOGS_COLLECTION));
    if (campaignId) {
      q = query(collection(db, EMAIL_LOGS_COLLECTION), where('campaignId', '==', campaignId));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EmailLog));
  } catch (err) {
    console.error('Error fetching logs:', err);
    return [];
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  await deleteDoc(doc(db, CAMPAIGNS_COLLECTION, id));
}
