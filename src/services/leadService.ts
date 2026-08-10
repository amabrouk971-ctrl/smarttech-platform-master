import { 
  collection, doc, getDocs, setDoc, updateDoc, query, where, orderBy, deleteDoc, addDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Lead, ExtendedLeadStatus, LeadPriority, User, Role, UserMode, AcademyMembership,
  LeadAssignmentHistory, LeadCall, LeadMessage, LeadFollowUp, CRMNotification 
} from '../types';
import { createTransactionInFirestore } from './revenueService';
import { logAuditEventInFirestore, updateUserProfileInFirestore } from './firebaseService';

// ==========================================
// 1. FETCH & CREATE LEADS
// ==========================================

export const fetchLeadsFromFirestore = async (assignedEmployeeId?: string): Promise<Lead[]> => {
  try {
    const col = collection(db, 'leads');
    let q = query(col);
    if (assignedEmployeeId) {
      q = query(col, where('assignedEmployeeId', '==', assignedEmployeeId));
    }
    const snapshot = await getDocs(q);
    const list: Lead[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Lead));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching leads:', err);
    return [];
  }
};

export const checkDuplicateLead = async (phone: string, email?: string, studentName?: string): Promise<Lead[]> => {
  try {
    const col = collection(db, 'leads');
    const snapshot = await getDocs(col);
    const duplicates: Lead[] = [];
    
    const normPhone = phone.replace(/\D/g, '');
    snapshot.forEach((d) => {
      const l = { id: d.id, ...d.data() } as Lead;
      const lPhone = (l.phone || '').replace(/\D/g, '');
      const lWp = (l.whatsappNumber || '').replace(/\D/g, '');

      if (normPhone && (lPhone.includes(normPhone) || lWp.includes(normPhone) || normPhone.includes(lPhone))) {
        duplicates.push(l);
      } else if (email && l.email && l.email.toLowerCase() === email.toLowerCase()) {
        duplicates.push(l);
      } else if (studentName && l.studentName && l.studentName.trim().toLowerCase() === studentName.trim().toLowerCase()) {
        duplicates.push(l);
      }
    });

    return duplicates;
  } catch (err) {
    console.error('Error checking duplicate lead:', err);
    return [];
  }
};

export const createLeadInFirestore = async (
  leadInput: Partial<Lead>,
  creatorUser?: { id: string; name: string }
): Promise<Lead> => {
  const leadId = `LEAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const newLead: Lead = {
    id: leadId,
    leadId,
    parentName: leadInput.parentName || 'ولي أمر',
    studentName: leadInput.studentName || 'طالب جديد',
    phone: leadInput.phone || '',
    whatsappNumber: leadInput.whatsappNumber || leadInput.phone || '',
    email: leadInput.email || '',
    childDateOfBirth: leadInput.childDateOfBirth || leadInput.studentDateOfBirth || '',
    childAge: leadInput.childAge || leadInput.studentAge || 10,
    studentAge: leadInput.studentAge || leadInput.childAge || 10,
    studentDateOfBirth: leadInput.studentDateOfBirth || leadInput.childDateOfBirth || '',
    selectedPath: leadInput.selectedPath || '',
    selectedPathTitle: leadInput.selectedPathTitle || '',
    selectedCourses: leadInput.selectedCourses || [],
    selectedCourseTitles: leadInput.selectedCourseTitles || [],
    interestedCourseIds: leadInput.interestedCourseIds || leadInput.selectedCourses || [],
    interestedPathIds: leadInput.interestedPathIds || (leadInput.selectedPath ? [leadInput.selectedPath] : []),
    interests: leadInput.interests || [],
    notes: leadInput.notes || '',
    source: leadInput.source || 'Website',
    status: (leadInput.status as ExtendedLeadStatus) || 'NEW',
    priority: (leadInput.priority as LeadPriority) || 'MEDIUM',
    assignedEmployeeId: leadInput.assignedEmployeeId || '',
    assignedEmployeeName: leadInput.assignedEmployeeName || '',
    createdBy: creatorUser?.id || leadInput.createdBy || 'SYSTEM',
    createdByName: creatorUser?.name || 'النظام الإداري',
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, 'leads', leadId), newLead);

  if (creatorUser) {
    await logAuditEventInFirestore({
      actorId: creatorUser.id,
      actorName: creatorUser.name,
      actorRole: 'ADMIN',
      action: `إنشاء ليد جديد (${leadId}) للطالب ${newLead.studentName}`,
      targetType: 'LEAD',
      targetId: leadId,
      details: newLead
    });
  }

  return newLead;
};

export const updateLeadInFirestore = async (
  leadId: string,
  updateFields: Partial<Lead>,
  actorUser?: { id: string; name: string }
): Promise<void> => {
  try {
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, {
      ...updateFields,
      updatedAt: new Date().toISOString()
    });

    if (actorUser) {
      await logAuditEventInFirestore({
        actorId: actorUser.id,
        actorName: actorUser.name,
        actorRole: 'USER',
        action: `تحديث الليد (${leadId})`,
        targetType: 'LEAD',
        targetId: leadId,
        details: updateFields
      });
    }
  } catch (err) {
    console.error('Error updating lead:', err);
  }
};

// ==========================================
// 2. LEAD ASSIGNMENT & HISTORY
// ==========================================

export const assignLeadInFirestore = async (
  lead: Lead,
  newEmployee: { id: string; name: string },
  assignedByUser: { id: string; name: string },
  reason: string = 'تعيين مسؤول المتابعة'
): Promise<void> => {
  const now = new Date().toISOString();
  const previousEmployeeId = lead.assignedEmployeeId || '';
  const previousEmployeeName = lead.assignedEmployeeName || 'غير معين';

  // 1. Record in Lead Assignment History
  const historyId = `HIST-${Date.now()}`;
  const historyRecord: LeadAssignmentHistory = {
    id: historyId,
    leadId: lead.id,
    previousEmployeeId,
    previousEmployeeName,
    newEmployeeId: newEmployee.id,
    newEmployeeName: newEmployee.name,
    changedBy: assignedByUser.id,
    changedByName: assignedByUser.name,
    reason,
    createdAt: now
  };
  await setDoc(doc(db, 'leadAssignmentHistory', historyId), historyRecord);

  // 2. Update Lead document
  await updateDoc(doc(db, 'leads', lead.id), {
    assignedEmployeeId: newEmployee.id,
    assignedEmployeeName: newEmployee.name,
    assignedBy: assignedByUser.id,
    assignedAt: now,
    updatedAt: now
  });

  // 3. Create Notification for new employee
  const notifId = `NOTIF-${Date.now()}`;
  const notification: CRMNotification = {
    id: notifId,
    userId: newEmployee.id,
    title: 'تعيين ليد جديد 📞',
    message: `تم تحويل الليد الخاص بـ (${lead.studentName} / ${lead.parentName}) إليك للمتابعة.`,
    type: 'LEAD_ASSIGNED',
    leadId: lead.id,
    read: false,
    createdAt: now
  };
  await setDoc(doc(db, 'notifications', notifId), notification);

  // Audit event
  await logAuditEventInFirestore({
    actorId: assignedByUser.id,
    actorName: assignedByUser.name,
    actorRole: 'ADMIN',
    action: `تحويل الليد ${lead.leadId} إلى الموظف ${newEmployee.name}`,
    targetType: 'LEAD',
    targetId: lead.id,
    details: historyRecord
  });
};

export const fetchAssignmentHistoryFromFirestore = async (leadId: string): Promise<LeadAssignmentHistory[]> => {
  try {
    const col = collection(db, 'leadAssignmentHistory');
    const q = query(col, where('leadId', '==', leadId));
    const snapshot = await getDocs(q);
    const list: LeadAssignmentHistory[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as LeadAssignmentHistory));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching assignment history:', err);
    return [];
  }
};

// ==========================================
// 3. CALL & MESSAGE LOGGING
// ==========================================

export const logCallInFirestore = async (
  callInput: Omit<LeadCall, 'id' | 'createdAt'>,
  user: { id: string; name: string }
): Promise<LeadCall> => {
  const callId = `CALL-${Date.now()}`;
  const now = new Date().toISOString();

  const newCall: LeadCall = {
    ...callInput,
    id: callId,
    callId,
    createdAt: now
  };

  await setDoc(doc(db, 'leadCalls', callId), newCall);

  // Update Lead last contact & next follow up if given
  const updatePayload: Partial<Lead> = {
    lastContactAt: now,
    updatedAt: now
  };
  if (callInput.nextFollowUpAt) {
    updatePayload.nextFollowUpAt = callInput.nextFollowUpAt;
  }
  await updateDoc(doc(db, 'leads', callInput.leadId), updatePayload);

  // Auto-schedule Follow Up if date provided
  if (callInput.nextFollowUpAt) {
    await createFollowUpInFirestore({
      leadId: callInput.leadId,
      employeeId: callInput.employeeId,
      employeeName: callInput.employeeName,
      followUpDate: callInput.nextFollowUpAt,
      followUpType: 'CALL',
      notes: `متابعة بعد مكالمة (${callInput.result}): ${callInput.notes}`,
      status: 'PENDING',
      priority: 'MEDIUM'
    });
  }

  return newCall;
};

export const fetchCallsForLeadFromFirestore = async (leadId: string): Promise<LeadCall[]> => {
  try {
    const col = collection(db, 'leadCalls');
    const q = query(col, where('leadId', '==', leadId));
    const snapshot = await getDocs(q);
    const list: LeadCall[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as LeadCall));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching calls:', err);
    return [];
  }
};

export const logMessageInFirestore = async (
  msgInput: Omit<LeadMessage, 'id' | 'createdAt'>,
  user: { id: string; name: string }
): Promise<LeadMessage> => {
  const messageId = `MSG-${Date.now()}`;
  const now = new Date().toISOString();

  const newMsg: LeadMessage = {
    ...msgInput,
    id: messageId,
    messageId,
    createdAt: now
  };

  await setDoc(doc(db, 'leadMessages', messageId), newMsg);

  await updateDoc(doc(db, 'leads', msgInput.leadId), {
    lastContactAt: now,
    updatedAt: now
  });

  return newMsg;
};

export const fetchMessagesForLeadFromFirestore = async (leadId: string): Promise<LeadMessage[]> => {
  try {
    const col = collection(db, 'leadMessages');
    const q = query(col, where('leadId', '==', leadId));
    const snapshot = await getDocs(q);
    const list: LeadMessage[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as LeadMessage));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
};

// ==========================================
// 4. FOLLOW-UP SYSTEM
// ==========================================

export const createFollowUpInFirestore = async (
  input: Omit<LeadFollowUp, 'id' | 'followUpId' | 'createdAt'>
): Promise<LeadFollowUp> => {
  const followUpId = `FUP-${Date.now()}`;
  const now = new Date().toISOString();

  const newFollowUp: LeadFollowUp = {
    ...input,
    id: followUpId,
    followUpId,
    status: input.status || 'PENDING',
    createdAt: now
  };

  await setDoc(doc(db, 'leadFollowUps', followUpId), newFollowUp);

  // Update lead's nextFollowUpAt field
  if (input.leadId && input.followUpDate) {
    await updateDoc(doc(db, 'leads', input.leadId), {
      nextFollowUpAt: input.followUpDate,
      updatedAt: now
    });
  }

  return newFollowUp;
};

export const fetchFollowUpsFromFirestore = async (employeeId?: string): Promise<LeadFollowUp[]> => {
  try {
    const col = collection(db, 'leadFollowUps');
    let q = query(col);
    if (employeeId) {
      q = query(col, where('employeeId', '==', employeeId));
    }
    const snapshot = await getDocs(q);
    const list: LeadFollowUp[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as LeadFollowUp));
    return list.sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());
  } catch (err) {
    console.error('Error fetching follow-ups:', err);
    return [];
  }
};

export const completeFollowUpInFirestore = async (followUpId: string): Promise<void> => {
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'leadFollowUps', followUpId), {
    status: 'COMPLETED',
    completedAt: now
  });
};

// ==========================================
// 5. CONVERT LEAD TO ENROLLMENT WITH REVENUE ATTRIBUTION
// ==========================================

export const convertLeadToAcademyMemberInFirestore = async (
  lead: Lead,
  amountPaid: number,
  paymentMethod: 'CASH' | 'FAWRY' | 'VODAFONE_CASH' | 'BANK_TRANSFER' | 'CARD' | 'INSTAPAY',
  adminUser: User
): Promise<{ studentUser: User; membership: AcademyMembership }> => {
  const now = new Date().toISOString();
  const studentUid = `student-${lead.leadId.toLowerCase()}`;

  // 1. Create or Update Student User Profile
  const studentUser: User = {
    id: studentUid,
    name: lead.studentName,
    email: lead.email || `${studentUid}@smarttech.edu`,
    role: Role.STUDENT,
    mode: lead.childAge && lead.childAge >= 13 ? UserMode.ADULT : UserMode.KIDS,
    approvalStatus: 'APPROVED',
    age: lead.childAge || lead.studentAge || 10,
    phone: lead.phone,
    xp: 500,
    level: 1,
    levelTitle: 'عضو الأكاديمية المعتمد',
    badges: ['Academy Member'],
    enrolledCourseIds: lead.selectedCourses.length > 0 ? lead.selectedCourses : ['scratch-young-coder'],
    enrolledPathIds: lead.selectedPath ? [lead.selectedPath] : ['junior-programmer'],
    studentProfile: {
      parentName: lead.parentName,
      parentPhone: lead.whatsappNumber,
      parentEmail: lead.email,
      birthDate: lead.childDateOfBirth || lead.studentDateOfBirth
    }
  };

  await updateUserProfileInFirestore(studentUser);

  // 2. Create Active Academy Membership
  const membershipId = `MEM-${Date.now()}`;
  const membership: AcademyMembership = {
    id: membershipId,
    userId: studentUid,
    studentId: studentUid,
    studentName: lead.studentName,
    parentName: lead.parentName,
    status: 'ACTIVE',
    membershipType: 'REGULAR',
    startDate: now.substring(0, 10),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    createdAt: now,
    approvedBy: adminUser.id,
    approvedAt: now,
    notes: `تم التفعيل عبر تحويل الليد ${lead.leadId}`
  };

  await setDoc(doc(db, 'academyMemberships', membershipId), membership);

  // 3. Record Financial Transaction linked to Lead and Employee Attribution
  const txResult = await createTransactionInFirestore({
    studentId: studentUid,
    studentName: lead.studentName,
    parentName: lead.parentName,
    courseId: lead.selectedCourses[0] || '',
    courseTitleAr: lead.selectedCourseTitles?.[0] || 'كورس الأكاديمية',
    pathId: lead.selectedPath,
    pathTitleAr: lead.selectedPathTitle,
    amount: amountPaid,
    discount: 0,
    paymentMethod,
    paymentStatus: 'PAID',
    createdBy: adminUser.id,
    notes: `تسجيل رسم الاشتراك وتحويل الليد ${lead.leadId} (الموظف المسؤول: ${lead.assignedEmployeeName || 'غير محدد'})`
  });

  // 4. Update Lead Status to ENROLLED
  await updateLeadInFirestore(lead.id, {
    status: 'ENROLLED',
    adminNotes: `تم التحويل بنجاح إلى عضوية أكاديمية نشطة بمسؤولية الموظف ${lead.assignedEmployeeName || 'غير محدد'}`
  }, adminUser);

  // 5. Create Notification
  if (lead.assignedEmployeeId) {
    const notifId = `NOTIF-${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      userId: lead.assignedEmployeeId,
      title: 'تهانينا! تم تحويل الليد وتسجيل الاشتراك 🎉',
      message: `تم تسديد الاشتراك للطفل ${lead.studentName} بمبلغ ${amountPaid} ج.م واحتسابه ضمن مبيعاتك.`,
      type: 'ENROLLMENT_SUCCESS',
      leadId: lead.id,
      read: false,
      createdAt: now
    });
  }

  return { studentUser, membership };
};
