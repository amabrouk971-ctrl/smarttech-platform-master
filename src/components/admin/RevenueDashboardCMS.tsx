import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, CreditCard, UserCheck, ShieldAlert, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { Transaction, PaymentStatus, User } from '../../types';
import { fetchTransactionsFromFirestore, calculateRevenueMetrics, RevenueMetrics, createTransactionInFirestore, updateTransactionStatusInFirestore } from '../../services/revenueService';

interface RevenueDashboardCMSProps {
  currentUser?: User | null;
}

export const RevenueDashboardCMS: React.FC<RevenueDashboardCMSProps> = ({ currentUser }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL');

  // Manual Transaction Creation Modal
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [newTxForm, setNewTxForm] = useState({
    studentName: '',
    parentName: '',
    courseTitleAr: '',
    amount: 1500,
    discount: 300,
    paymentMethod: 'CASH' as any,
    notes: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    const txs = await fetchTransactionsFromFirestore();
    setTransactions(txs);
    setMetrics(calculateRevenueMetrics(txs));
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateManualTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxForm.studentName || !newTxForm.amount) return;

    await createTransactionInFirestore({
      studentName: newTxForm.studentName,
      parentName: newTxForm.parentName,
      courseTitleAr: newTxForm.courseTitleAr || 'كورس الأكاديمية المباشر',
      amount: Number(newTxForm.amount),
      discount: Number(newTxForm.discount),
      paymentMethod: newTxForm.paymentMethod,
      paymentStatus: 'PAID',
      createdBy: currentUser?.id || 'admin',
      notes: newTxForm.notes
    });

    setShowAddTxModal(false);
    setNewTxForm({
      studentName: '',
      parentName: '',
      courseTitleAr: '',
      amount: 1500,
      discount: 300,
      paymentMethod: 'CASH',
      notes: ''
    });
    await loadData();
  };

  const handleStatusChange = async (txId: string, newStatus: PaymentStatus) => {
    if (!currentUser) return;
    await updateTransactionStatusInFirestore(txId, newStatus, currentUser);
    await loadData();
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (paymentStatusFilter !== 'ALL' && tx.paymentStatus !== paymentStatusFilter) return false;
    
    if (dateFilter === 'TODAY') {
      const today = new Date().toISOString().substring(0, 10);
      return tx.transactionDate.startsWith(today);
    }
    return true;
  });

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header Banner */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <DollarSign className="w-3.5 h-3.5" /> FIRESTORE FINANCIAL & REVENUE ANALYTICS ENGINE
          </span>
          <h2 className="text-2xl font-black text-white">منظومة الإيرادات والتحليلات المالية المعتمدة</h2>
          <p className="text-xs text-slate-400">
            تتبع الأرباح الحقيقية، الاشتراطات المدفوعة، الاستردادات، ومتوسط قيمة المعاملة بناءً على معاملات قواعد بيانات Firestore الحقيقية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddTxModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> تسجيل معاملة ودفع جديد 💰
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>صافي الإيرادات (Net Revenue)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">
              {metrics.netRevenue.toLocaleString()} EGP
            </p>
            <p className="text-[10px] text-slate-500">
              المدفوعات الحقيقية ({metrics.grossRevenue.toLocaleString()}) - الاستردادات ({metrics.refundsTotal.toLocaleString()})
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>إيرادات اليوم</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">
              {metrics.revenueToday.toLocaleString()} EGP
            </p>
            <p className="text-[10px] text-slate-500">
              هذا الشهر: {metrics.revenueThisMonth.toLocaleString()} EGP
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>عدد الاشتراكات المدفوعة</span>
              <UserCheck className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">
              {metrics.paidEnrollmentsCount} طالب
            </p>
            <p className="text-[10px] text-slate-500">
              متوسط قيمة الطلب: {metrics.averageTransactionValue.toFixed(0)} EGP
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>إجمالي الخصومات والخصم</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-purple-400">
              {metrics.discountsTotal.toLocaleString()} EGP
            </p>
            <p className="text-[10px] text-slate-500">
              إجمالي الخصومات الممنوحة بالطلبات
            </p>
          </div>
        </div>
      )}

      {/* Revenue Breakdown by Course & Path */}
      {metrics && Object.keys(metrics.revenueByCourse).length > 0 && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>توزيع الإيرادات والمبيعات حسب الكورس المباشر</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metrics.revenueByCourse).map(([cId, item]: [string, { title: string; count: number; totalAmount: number; netAmount: number }]) => (
              <div key={cId} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white truncate">{item.title}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                    {item.count} اشتراك
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">صافي المحصل:</span>
                  <span className="font-black text-emerald-400">{item.netAmount.toLocaleString()} EGP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">فلترة المعاملات:</span>
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'PAID', 'PENDING', 'REFUNDED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setPaymentStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                paymentStatusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'جميع الحالات' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Firestore Data Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-200">
            جدول المعاملات المالية الحية في قواعد البيانات Firestore ({filteredTransactions.length})
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold space-y-2">
            <DollarSign className="w-8 h-8 mx-auto text-slate-600" />
            <p>لا توجد معاملات مسجلة تطابق الفلتر الحالي.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">رقم المعاملة</th>
                  <th className="p-3">الطالب / ولي الأمر</th>
                  <th className="p-3">الكورس / المسار</th>
                  <th className="p-3">المبلغ الأصلي</th>
                  <th className="p-3">الخصم</th>
                  <th className="p-3">الصافي المدفوع</th>
                  <th className="p-3">طريقة الدفع</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 font-mono text-[11px] text-amber-400">{tx.transactionId}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{tx.studentName || 'طالب غير مسمى'}</div>
                      <div className="text-[10px] text-slate-400">{tx.parentName}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-300">{tx.courseTitleAr || tx.pathTitleAr || 'دورة عامة'}</td>
                    <td className="p-3 text-slate-400 line-through">{tx.amount} {tx.currency}</td>
                    <td className="p-3 text-purple-400">-{tx.discount}</td>
                    <td className="p-3 font-black text-emerald-400">{tx.finalAmount} {tx.currency}</td>
                    <td className="p-3 font-bold text-blue-400">{tx.paymentMethod}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        tx.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : tx.paymentStatus === 'REFUNDED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {tx.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-[10px] text-slate-400">
                      {new Date(tx.transactionDate).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3">
                      {tx.paymentStatus === 'PAID' && (
                        <button
                          onClick={() => handleStatusChange(tx.id, 'REFUNDED')}
                          className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 font-bold text-[10px] rounded-lg border border-red-500/30 transition cursor-pointer"
                        >
                          معالجة استرداد (Refund)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Manual Transaction Record */}
      {showAddTxModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>تسجيل دفعة معتمدة جديدة في Firestore</span>
              </h3>
              <button
                onClick={() => setShowAddTxModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualTx} className="space-y-4 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1">اسم الطالب:</label>
                <input
                  type="text"
                  required
                  value={newTxForm.studentName}
                  onChange={(e) => setNewTxForm({ ...newTxForm, studentName: e.target.value })}
                  placeholder="أدخل اسم الطالب ثلاثي"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">اسم ولي الأمر (اختياري):</label>
                <input
                  type="text"
                  value={newTxForm.parentName}
                  onChange={(e) => setNewTxForm({ ...newTxForm, parentName: e.target.value })}
                  placeholder="اسم ولي الأمر"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">عنوان الكورس / المسار:</label>
                <input
                  type="text"
                  value={newTxForm.courseTitleAr}
                  onChange={(e) => setNewTxForm({ ...newTxForm, courseTitleAr: e.target.value })}
                  placeholder="مثال: كورس البرمجة للناشئين - Scratch"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">المبلغ (EGP):</label>
                  <input
                    type="number"
                    required
                    value={newTxForm.amount}
                    onChange={(e) => setNewTxForm({ ...newTxForm, amount: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">الخصم الممنوح (EGP):</label>
                  <input
                    type="number"
                    value={newTxForm.discount}
                    onChange={(e) => setNewTxForm({ ...newTxForm, discount: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">طريقة الدفع:</label>
                <select
                  value={newTxForm.paymentMethod}
                  onChange={(e) => setNewTxForm({ ...newTxForm, paymentMethod: e.target.value as any })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 outline-none"
                >
                  <option value="CASH">نقداً في الفرع (CASH)</option>
                  <option value="VODAFONE_CASH">فودافون كاش (Vodafone Cash)</option>
                  <option value="INSTAPAY">انستاباي (InstaPay)</option>

                  <option value="BANK_TRANSFER">تحويل بنكي</option>
                  <option value="CARD">بطاقة إلكترونية</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow cursor-pointer"
                >
                  حفظ الدفعة في Firestore 💰
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
