import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc
} from 'firebase/firestore';
import { BugReport, BugStatus } from '../types';

const BUGS_COLLECTION = 'bugReports';

/**
 * Automatically collect browser, OS, device and route context
 */
export function getAutoBugContext() {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  if (ua.includes('Chrome')) browser = 'Google Chrome';
  else if (ua.includes('Safari')) browser = 'Apple Safari';
  else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
  else if (ua.includes('Edg')) browser = 'Microsoft Edge';

  let os = 'Unknown OS';
  if (ua.includes('Win')) os = 'Windows OS';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android OS';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux OS';

  const deviceType = window.innerWidth < 768 ? 'Mobile Phone' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop PC';
  const screenSize = `${window.innerWidth}x${window.innerHeight}`;
  const currentRoute = window.location.pathname + window.location.search;

  return { browser, os, deviceType, screenSize, currentRoute };
}

/**
 * Report a new bug
 */
export async function createBugReport(bugData: {
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  screenshotUrl?: string;
  recordingUrl?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  currentRoute?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  screenSize?: string;
}): Promise<string> {
  const autoCtx = getAutoBugContext();
  const shortId = Math.floor(1000 + Math.random() * 9000);
  const bugNumber = `BUG-${shortId}`;
  const now = new Date().toISOString();

  const payload: Omit<BugReport, 'id'> = {
    bugNumber,
    title: bugData.title,
    description: bugData.description,
    stepsToReproduce: bugData.stepsToReproduce || '',
    expectedResult: bugData.expectedResult || '',
    actualResult: bugData.actualResult || '',
    screenshotUrl: bugData.screenshotUrl || '',
    recordingUrl: bugData.recordingUrl || '',
    userId: bugData.userId,
    userName: bugData.userName,
    userEmail: bugData.userEmail || '',
    currentRoute: bugData.currentRoute || autoCtx.currentRoute,
    browser: bugData.browser || autoCtx.browser,
    os: bugData.os || autoCtx.os,
    deviceType: bugData.deviceType || autoCtx.deviceType,
    screenSize: bugData.screenSize || autoCtx.screenSize,
    status: 'NEW',
    createdAt: now,
    updatedAt: now
  };

  const clean = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, BUGS_COLLECTION, bugNumber), clean);
  return bugNumber;
}

/**
 * Fetch bug reports for Admin
 */
export async function fetchBugReports(): Promise<BugReport[]> {
  try {
    const snap = await getDocs(collection(db, BUGS_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BugReport));
  } catch (err) {
    console.error('Error fetching bug reports:', err);
    return [];
  }
}

/**
 * Update bug status and assignment
 */
export async function updateBugStatus(bugId: string, status: BugStatus, assignedToId?: string, assignedToName?: string): Promise<void> {
  const ref = doc(db, BUGS_COLLECTION, bugId);
  const updates: any = { status, updatedAt: new Date().toISOString() };
  if (assignedToId) updates.assignedToId = assignedToId;
  if (assignedToName) updates.assignedToName = assignedToName;

  await updateDoc(ref, updates);
}

export async function deleteBugReport(bugId: string): Promise<void> {
  await deleteDoc(doc(db, BUGS_COLLECTION, bugId));
}
