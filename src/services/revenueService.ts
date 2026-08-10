import { collection, doc, getDocs, setDoc, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Transaction, PaymentStatus } from '../types';
import { logAuditEventInFirestore } from './firebaseService';

export interface RevenueMetrics {
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  grossRevenue: number;
  refundsTotal: number;
  discountsTotal: number;
  netRevenue: number;
  paidEnrollmentsCount: number;
  averageTransactionValue: number;
  revenueByCourse: Record<string, { title: string; count: number; totalAmount: number; netAmount: number }>;
  revenueByPath: Record<string, { title: string; count: number; totalAmount: number; netAmount: number }>;
  revenueByCategory: Record<string, number>;
}

export const fetchTransactionsFromFirestore = async (): Promise<Transaction[]> => {
  try {
    const txCol = collection(db, 'transactions');
    const snapshot = await getDocs(txCol);
    const list: Transaction[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Transaction);
    });
    return list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  } catch (err) {
    console.error('Error fetching transactions from Firestore:', err);
    return [];
  }
};

export const createTransactionInFirestore = async (txData: Partial<Transaction>): Promise<Transaction> => {
  const txId = txData.transactionId || `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  
  const finalAmount = (txData.amount || 0) - (txData.discount || 0);

  const fullTx: Transaction = {
    id: txId,
    transactionId: txId,
    studentId: txData.studentId || 'GUEST',
    studentName: txData.studentName || 'طالب جديد',
    parentId: txData.parentId,
    parentName: txData.parentName,
    courseId: txData.courseId,
    courseTitleAr: txData.courseTitleAr,
    pathId: txData.pathId,
    pathTitleAr: txData.pathTitleAr,
    amount: txData.amount || 0,
    currency: txData.currency || 'EGP',
    discount: txData.discount || 0,
    finalAmount: finalAmount > 0 ? finalAmount : 0,
    paymentMethod: txData.paymentMethod || 'CASH',
    paymentStatus: txData.paymentStatus || 'PAID',
    transactionDate: txData.transactionDate || now,
    enrollmentId: txData.enrollmentId || `ENR-${Date.now()}`,
    notes: txData.notes || '',
    createdBy: txData.createdBy || 'ADMIN',
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, 'transactions', txId), fullTx);

  await logAuditEventInFirestore({
    actorId: txData.createdBy || 'ADMIN',
    actorName: 'Admin / System',
    actorRole: 'ADMIN',
    action: `تسجيل معاملة مالية جديدة (${fullTx.finalAmount} ${fullTx.currency})`,
    targetType: 'TRANSACTION',
    targetId: txId,
    details: fullTx
  });

  return fullTx;
};

export const updateTransactionStatusInFirestore = async (
  transactionId: string,
  newStatus: PaymentStatus,
  adminUser: { id: string; name: string }
): Promise<void> => {
  try {
    const txRef = doc(db, 'transactions', transactionId);
    await updateDoc(txRef, {
      paymentStatus: newStatus,
      updatedAt: new Date().toISOString()
    });

    await logAuditEventInFirestore({
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: 'ADMIN',
      action: `تحديث حالة المعاملة المالية إلى: ${newStatus}`,
      targetType: 'TRANSACTION',
      targetId: transactionId,
      details: { newStatus }
    });
  } catch (err) {
    console.error('Error updating transaction status:', err);
  }
};

export const calculateRevenueMetrics = (transactions: Transaction[]): RevenueMetrics => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  let grossRevenue = 0;
  let refundsTotal = 0;
  let discountsTotal = 0;
  let paidEnrollmentsCount = 0;

  let revenueToday = 0;
  let revenueThisWeek = 0;
  let revenueThisMonth = 0;
  let revenueThisYear = 0;

  const revenueByCourse: Record<string, { title: string; count: number; totalAmount: number; netAmount: number }> = {};
  const revenueByPath: Record<string, { title: string; count: number; totalAmount: number; netAmount: number }> = {};
  const revenueByCategory: Record<string, number> = {};

  transactions.forEach((tx) => {
    const txTime = new Date(tx.transactionDate).getTime();
    
    // Only PAID counts towards revenue. REFUNDED subtracts.
    if (tx.paymentStatus === 'PAID') {
      grossRevenue += tx.finalAmount;
      discountsTotal += tx.discount;
      paidEnrollmentsCount += 1;

      if (txTime >= startOfToday) revenueToday += tx.finalAmount;
      if (txTime >= startOfWeek) revenueThisWeek += tx.finalAmount;
      if (txTime >= startOfMonth) revenueThisMonth += tx.finalAmount;
      if (txTime >= startOfYear) revenueThisYear += tx.finalAmount;

      if (tx.courseId) {
        const cKey = tx.courseId;
        const cTitle = tx.courseTitleAr || 'كورس غير مسمى';
        if (!revenueByCourse[cKey]) {
          revenueByCourse[cKey] = { title: cTitle, count: 0, totalAmount: 0, netAmount: 0 };
        }
        revenueByCourse[cKey].count += 1;
        revenueByCourse[cKey].totalAmount += tx.amount;
        revenueByCourse[cKey].netAmount += tx.finalAmount;
      }

      if (tx.pathId) {
        const pKey = tx.pathId;
        const pTitle = tx.pathTitleAr || 'مسار غير مسمى';
        if (!revenueByPath[pKey]) {
          revenueByPath[pKey] = { title: pTitle, count: 0, totalAmount: 0, netAmount: 0 };
        }
        revenueByPath[pKey].count += 1;
        revenueByPath[pKey].totalAmount += tx.amount;
        revenueByPath[pKey].netAmount += tx.finalAmount;
      }
    } else if (tx.paymentStatus === 'REFUNDED' || tx.paymentStatus === 'PARTIALLY_REFUNDED') {
      refundsTotal += tx.finalAmount;
    }
  });

  const netRevenue = grossRevenue - refundsTotal;
  const averageTransactionValue = paidEnrollmentsCount > 0 ? grossRevenue / paidEnrollmentsCount : 0;

  return {
    totalRevenue: netRevenue,
    revenueToday,
    revenueThisWeek,
    revenueThisMonth,
    revenueThisYear,
    grossRevenue,
    refundsTotal,
    discountsTotal,
    netRevenue,
    paidEnrollmentsCount,
    averageTransactionValue,
    revenueByCourse,
    revenueByPath,
    revenueByCategory
  };
};
