import { db, storage } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  User, 
  AdminProfileSettingsConfig, 
  CustomerDocument, 
  CustomerIdentityDocument,
  CustomerEducationRecord,
  Role 
} from '../types';

export const DEFAULT_PROFILE_SETTINGS: AdminProfileSettingsConfig = {
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
  maxFileSizeMB: 5,
  enableIdentityUpload: true,
  enableEducationUpload: true,
  enableEmergencyContact: true,
  defaultPhotoVisibility: 'PRIVATE',
  requireVerificationForCertificates: true,
  fieldsConfig: [
    { fieldId: 'firstName', labelAr: 'الاسم الأول', labelEn: 'First Name', fieldType: 'TEXT', required: true, visible: true, editable: true, roleAccess: [Role.STUDENT, Role.PARENT, Role.TEACHER], order: 1 },
    { fieldId: 'lastName', labelAr: 'اسم العائلة', labelEn: 'Last Name', fieldType: 'TEXT', required: true, visible: true, editable: true, roleAccess: [Role.STUDENT, Role.PARENT, Role.TEACHER], order: 2 },
    { fieldId: 'displayName', labelAr: 'اسم العرض', labelEn: 'Display Name', fieldType: 'TEXT', required: false, visible: true, editable: true, roleAccess: [Role.STUDENT, Role.PARENT, Role.TEACHER], order: 3 },
    { fieldId: 'dateOfBirth', labelAr: 'تاريخ الميلاد', labelEn: 'Date of Birth', fieldType: 'DATE', required: false, visible: true, editable: true, roleAccess: [Role.STUDENT, Role.PARENT, Role.TEACHER], order: 4 },
    { fieldId: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', fieldType: 'TEXT', required: true, visible: true, editable: true, roleAccess: [Role.STUDENT, Role.PARENT, Role.TEACHER], order: 5 },
    { fieldId: 'whatsappNumber', labelAr: 'رقم الواتساب', labelEn: 'WhatsApp Number', fieldType: 'TEXT', required: false, visible: true, editable: true, roleAccess: [Role.STUDENT, Role.PARENT, Role.TEACHER], order: 6 },
    { fieldId: 'country', labelAr: 'الدولة', labelEn: 'Country', fieldType: 'TEXT', required: true, visible: true, editable: true, roleAccess: [Role.STUDENT, Role.PARENT, Role.TEACHER], order: 7 },
    { fieldId: 'city', labelAr: 'المدينة', labelEn: 'City', fieldType: 'TEXT', required: true, visible: true, editable: true, roleAccess: [Role.STUDENT, Role.PARENT, Role.TEACHER], order: 8 }
  ]
};

/**
 * Fetch profile settings configuration from Firestore
 */
export const fetchProfileSettingsConfig = async (): Promise<AdminProfileSettingsConfig> => {
  try {
    const docRef = doc(db, 'settings', 'profileSettings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_PROFILE_SETTINGS, ...snap.data() };
    }
  } catch (err) {
    console.warn('Error fetching profile settings config, using defaults:', err);
  }
  return DEFAULT_PROFILE_SETTINGS;
};

/**
 * Save profile settings configuration to Firestore
 */
export const saveProfileSettingsConfig = async (config: AdminProfileSettingsConfig, actorEmail?: string): Promise<void> => {
  const docRef = doc(db, 'settings', 'profileSettings');
  await setDoc(docRef, {
    ...config,
    updatedAt: new Date().toISOString(),
    updatedBy: actorEmail || 'system'
  }, { merge: true });
};

/**
 * Calculate Profile Completion Percentage
 */
export const calculateProfileCompletion = (user: Partial<User>): { percentage: number; missingFields: string[] } => {
  let score = 0;
  const totalWeight = 100;
  const missing: string[] = [];

  // Basic Info (30%)
  if (user.avatar) score += 15; else missing.push('الصورة الشخصية / Profile Photo');
  if (user.firstName || user.name) score += 15; else missing.push('الاسم / Name');

  // Contact Info (25%)
  if (user.phone) score += 15; else missing.push('رقم الهاتف / Phone');
  if (user.whatsappNumber || user.isPhoneAndWhatsappSame) score += 10; else missing.push('رقم الواتساب / WhatsApp');

  // Address Info (20%)
  if (user.country || user.address?.country) score += 10; else missing.push('الدولة / Country');
  if (user.city || user.address?.city) score += 10; else missing.push('المدينة / City');

  // Education / Bio (15%)
  if (user.educationHistory && user.educationHistory.length > 0) score += 15; else missing.push('السجل التعليمي / Education History');

  // Emergency Contact (10%)
  if (user.emergencyContactDetails?.phone || user.studentProfile?.emergencyContact) score += 10; else missing.push('جهات الاتصال للطوارئ / Emergency Contact');

  return {
    percentage: Math.min(100, score),
    missingFields: missing
  };
};

/**
 * Upload Image / File to Firebase Storage or Base64 fallback
 */
export const uploadProfileFile = async (
  userId: string, 
  file: File, 
  folder: 'avatars' | 'documents' | 'identity'
): Promise<{ downloadUrl: string; storagePath: string }> => {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const storagePath = `users/${userId}/${folder}/${fileName}`;

  try {
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return { downloadUrl, storagePath };
  } catch (err) {
    console.warn('Firebase Storage upload failed, converting file to Data URL fallback:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ downloadUrl: reader.result as string, storagePath });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Save user profile updates to Firestore
 */
export const updateUserProfileData = async (userId: string, updates: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const completion = calculateProfileCompletion(updates);

  await setDoc(userRef, {
    ...updates,
    profileCompletionPercentage: completion.percentage,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

/**
 * Add / Update Customer Educational Document
 */
export const saveCustomerDocument = async (
  userId: string, 
  docData: Omit<CustomerDocument, 'documentId' | 'createdAt' | 'verificationStatus'>,
  existingDocs: CustomerDocument[] = []
): Promise<CustomerDocument[]> => {
  const newDoc: CustomerDocument = {
    ...docData,
    documentId: `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    verificationStatus: 'PENDING'
  };

  const updatedDocs = [newDoc, ...existingDocs];
  await updateUserProfileData(userId, { documents: updatedDocs });
  return updatedDocs;
};

/**
 * Delete Customer Document
 */
export const deleteCustomerDocument = async (userId: string, documentId: string, currentDocs: CustomerDocument[]): Promise<CustomerDocument[]> => {
  const filtered = currentDocs.filter(d => d.documentId !== documentId);
  await updateUserProfileData(userId, { documents: filtered });
  return filtered;
};

/**
 * Save Customer Identity Document (Private)
 */
export const saveCustomerIdentityDocument = async (
  userId: string, 
  docData: Omit<CustomerIdentityDocument, 'documentId' | 'createdAt' | 'verificationStatus'>,
  existingDocs: CustomerIdentityDocument[] = []
): Promise<CustomerIdentityDocument[]> => {
  const newDoc: CustomerIdentityDocument = {
    ...docData,
    documentId: `ID-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    verificationStatus: 'PENDING'
  };

  const updatedDocs = [newDoc, ...existingDocs];
  await updateUserProfileData(userId, { identityDocuments: updatedDocs });
  return updatedDocs;
};

/**
 * Admin: Verify or Reject Document
 */
export const verifyCustomerDocumentStatus = async (
  targetUserId: string,
  documentId: string,
  status: 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW',
  adminEmail: string,
  rejectionReason?: string,
  internalNotes?: string,
  docType: 'educational' | 'identity' = 'educational'
): Promise<void> => {
  const userRef = doc(db, 'users', targetUserId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error('User not found');

  const userData = snap.data() as User;

  if (docType === 'educational') {
    const docs = userData.documents || [];
    const updated = docs.map(d => {
      if (d.documentId === documentId) {
        return {
          ...d,
          verificationStatus: status,
          verifiedBy: adminEmail,
          verifiedAt: new Date().toISOString(),
          rejectionReason: rejectionReason || d.rejectionReason,
          internalNotes: internalNotes || d.internalNotes
        };
      }
      return d;
    });
    await updateDoc(userRef, { documents: updated });
  } else {
    const docs = userData.identityDocuments || [];
    const updated = docs.map(d => {
      if (d.documentId === documentId) {
        return {
          ...d,
          verificationStatus: status,
          verifiedBy: adminEmail,
          verifiedAt: new Date().toISOString(),
          rejectionReason: rejectionReason || d.rejectionReason,
          internalNotes: internalNotes || d.internalNotes
        };
      }
      return d;
    });
    await updateDoc(userRef, { identityDocuments: updated });
  }
};
