import { auth, db } from '../firebase/config';
import { 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  ActionCodeSettings, 
  updatePassword,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc 
} from 'firebase/firestore';
import { AuthSettings, SecurityAuditLog } from '../types';

export const DEFAULT_AUTH_SETTINGS: AuthSettings = {
  enableEmailPassword: true,
  enableGoogle: true,
  enablePhone: false,
  requireEmailVerification: true,
  allowGuestAccess: true,
  allowStudentRegistration: true,
  allowParentRegistration: true,
  allowTeacherRegistration: true,
  requireTeacherApproval: true,
  requireStudentApproval: false,
  requireParentApproval: false,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: true,
  sessionTimeoutHours: 24
};

export const fetchAuthSettings = async (): Promise<AuthSettings> => {
  try {
    const docRef = doc(db, 'settings', 'authentication');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_AUTH_SETTINGS, ...snap.data() };
    }
  } catch (err) {
    console.error('Error fetching auth settings', err);
  }
  return DEFAULT_AUTH_SETTINGS;
};

export const saveAuthSettings = async (settings: AuthSettings): Promise<void> => {
  const docRef = doc(db, 'settings', 'authentication');
  await setDoc(docRef, {
    ...settings,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const sendResetEmail = async (email: string) => {
  try {
    const actionCodeSettings: ActionCodeSettings = {
      // By default Firebase hosts the reset page at the project's authDomain.
      // Alternatively, we can use our own custom url if we deploy a custom handler,
      // but standard Firebase behavior is to use the default auth domain handler.
      url: window.location.origin + '/?activeTab=home',
      handleCodeInApp: false,
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (err) {
    console.error('Error sending reset email', err);
    // Generic throw to prevent user enumeration
    throw new Error('If an account exists for this email, a password reset link has been sent.');
  }
};

export const logSecurityEvent = async (log: Omit<SecurityAuditLog, 'id' | 'timestamp'>) => {
  try {
    const logsCol = collection(db, 'securityAuditLogs');
    await addDoc(logsCol, {
      ...log,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log security event', err);
  }
};

export const logoutUser = async (userId: string) => {
  await logSecurityEvent({
    userId,
    eventType: 'SIGN_OUT',
    result: 'SUCCESS'
  });
  await signOut(auth);
};
