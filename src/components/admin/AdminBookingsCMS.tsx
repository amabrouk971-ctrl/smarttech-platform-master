import React, { useState, useEffect } from 'react';
import { User, CourseBooking, PaymentStatus, BookingStatus, PaymentMethod, Role } from '../../types';
import { getBookings, updateBookingStatus } from '../../services/bookingService';
import { incrementClassEnrollment } from '../../services/classService';
import { awardXP } from '../../services/gamificationService';
import { buildWhatsAppUrl, getPaymentSettings } from '../../services/bookingService';
import { CreditCard, MapPin, Phone, MessageCircle, CheckCircle2, XCircle, Clock, ShieldCheck, Download, Search, Filter, DollarSign, UserCheck, ChevronDown, Edit3, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AdminBookingsCMSProps {
  currentUser: User | null;
}

export const AdminBookingsCMS: React.FC<AdminBookingsCMSProps> = ({ currentUser }) => {
  const [bookings, setBookings] = useState<CourseBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editAssignee, setEditAssignee] = useState<string>('');

  const { isArabic } = useLanguage();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (booking: CourseBooking) => {
    if (!window.confirm(`هل أنت تأكد من اعتماد تحويل الطالب/ة (${booking.studentName}) بمبلغ ${booking.finalPriceSnapshot} EGP؟`)) {
      return;
    }
    try {
      await updateBookingStatus(booking.id, {
        paymentStatus: 'VERIFIED',
        bookingStatus: 'BOOKING_CONFIRMED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: currentUser?.name || currentUser?.id || 'ADMIN'
      });

      if (booking.classId) {
        await incrementClassEnrollment(booking.classId, 1);
      }

      if (currentUser) {
        await awardXP(
          currentUser.id,
          currentUser.role || Role.ADMIN,
          'PAYMENT_VERIFIED',
          booking.id,
          'BOOKING',
          `Verified payment for ${booking.courseNameSnapshot || booking.courseId}`,
          100
        );
      }

      fetchBookings();
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('فشل في اعتماد التحويل.');
    }
  };

  const handleRejectBooking = async (booking: CourseBooking) => {
    const reason = window.prompt('يرجى كتابة سبب رفض الطلب / التحويل:', 'لم يكتمل التحويل / القيمة غير مطابقة');
    if (reason === null) return;

    try {
      await updateBookingStatus(booking.id, {
        paymentStatus: 'REJECTED',
        bookingStatus: 'REJECTED',
        notes: `${booking.notes || ''}\n[REJECTED REASON: ${reason}]`
      });
      fetchBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('فشل في رفض الطلب.');
    }
  };

  const handleStatusChange = async (bookingId: string, pStatus: PaymentStatus, bStatus: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, {
        paymentStatus: pStatus,
        bookingStatus: bStatus
      });
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveEdit = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, {
        notes: editNotes,
        assignedEmployee: editAssignee
      });
      setEditingBookingId(null);
      fetchBookings();
    } catch (error) {
      console.error('Error saving edits:', error);
    }
  };

  const openCustomerWhatsApp = (booking: CourseBooking) => {
    const shortId = (booking.bookingId || booking.id.substring(0, 6)).toUpperCase();
    const msg = `مرفق تحية طيبة من مركز SmartTech للتدريب المتطور 👋

تأكيد حالة طلب الحجز الخاص بكم:
• رقم الحجز: ST-${shortId}
• الطالب: ${booking.studentName}
• الكورس: ${booking.courseNameSnapshot || booking.courseId}
• حالة الدفع والحجز: ${booking.paymentStatus === 'VERIFIED' ? 'مؤكد ومفعل ✅' : booking.paymentStatus === 'REJECTED' ? 'مرفوض ❌' : 'قيد المراجعة ⏳'}

في حال وجود أي استفسار يرجى الرد على هذه الرسالة.`;

    const targetPhone = booking.whatsappNumber || booking.phone;
    const url = buildWhatsAppUrl(targetPhone, msg);
    window.open(url, '_blank');
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      (b.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.phone || '').includes(searchTerm) ||
      (b.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.bookingId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.courseNameSnapshot || b.courseId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      b.bookingStatus === statusFilter ||
      b.paymentStatus === statusFilter;

    const matchesMethod =
      paymentMethodFilter === 'ALL' ||
      b.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate quick stats
  const totalCount = bookings.length;
  const verifiedCount = bookings.filter(b => b.paymentStatus === 'VERIFIED' || b.bookingStatus === 'BOOKING_CONFIRMED' || b.bookingStatus === 'ENROLLED').length;
  const pendingCount = bookings.filter(b => b.paymentStatus === 'PENDING_VERIFICATION' || b.paymentStatus === 'PAY_IN_CENTER_PENDING' || b.bookingStatus === 'NEW').length;
  const verifiedRevenue = bookings
    .filter(b => b.paymentStatus === 'VERIFIED' || b.bookingStatus === 'BOOKING_CONFIRMED' || b.bookingStatus === 'ENROLLED')
    .reduce((acc, b) => acc + (b.finalPriceSnapshot || 0), 0);

  const instapayCount = bookings.filter(b => b.paymentMethod === 'INSTAPAY').length;
  const vodafoneCount = bookings.filter(b => b.paymentMethod === 'VODAFONE_CASH').length;
  const inPersonCount = bookings.filter(b => b.paymentMethod === 'IN_PERSON').length;

  const getStatusBadge = (bStatus: BookingStatus, pStatus: PaymentStatus) => {
    if (pStatus === 'VERIFIED' || bStatus === 'BOOKING_CONFIRMED' || bStatus === 'ENROLLED' || bStatus === 'CONFIRMED') {
      return <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30 flex items-center gap-1 w-fit"><ShieldCheck className="w-3.5 h-3.5" /> مؤكد ومحفّظ</span>;
    }
    if (pStatus === 'REJECTED' || bStatus === 'REJECTED' || bStatus === 'CANCELLED') {
      return <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-black border border-red-500/30 flex items-center gap-1 w-fit"><XCircle className="w-3.5 h-3.5" /> مرفوض / ملغى</span>;
    }
    if (pStatus === 'PAY_IN_CENTER_PENDING') {
      return <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black border border-blue-500/30 flex items-center gap-1 w-fit"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> دفع بالمركز قيد الانتظار</span>;
    }
    return <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30 flex items-center gap-1 w-fit"><Clock className="w-3.5 h-3.5" /> جاري مراجعة التحويل</span>;
  };

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-emerald-400" />
            إدارة حجز الكورسات والتحويلات المالية 📑
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            متابعة طلبات الحجز المباشرة عبر الويب، مراجعة التحويلات المالية، وتأكيد مقاعد الطلاب.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          تحديث القائمة
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-400">إجمالي الطلبات</div>
          <div className="text-xl font-black text-white">{totalCount}</div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 space-y-1 bg-emerald-500/5">
          <div className="text-[11px] font-bold text-emerald-400">الحجوزات المؤكدة</div>
          <div className="text-xl font-black text-emerald-300">{verifiedCount}</div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 space-y-1 bg-amber-500/5">
          <div className="text-[11px] font-bold text-amber-400">قيد المراجعه والدفع</div>
          <div className="text-xl font-black text-amber-300">{pendingCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-400">الإيراد المحصل</div>
          <div className="text-xl font-black text-emerald-400">{verifiedRevenue} <span className="text-xs">EGP</span></div>
        </div>

        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-bold text-purple-400">InstaPay</div>
          <div className="text-xl font-black text-purple-300">{instapayCount}</div>
        </div>

        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-bold text-red-400">Vodafone Cash</div>
          <div className="text-xl font-black text-red-300">{vodafoneCount}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="relative">
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، هاتف الطالب، الكورس، أو رقم الحجز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">جميع الحالات (تأكيد / معلق / مرفوض)</option>
              <option value="VERIFIED">المؤكدة فقط (VERIFIED)</option>
              <option value="PENDING_VERIFICATION">قيد مراجعة التحويل (PENDING_VERIFICATION)</option>
              <option value="PAY_IN_CENTER_PENDING">الدفع بالمركز معلق (PAY_IN_CENTER_PENDING)</option>
              <option value="REJECTED">المرفوضة والملغاة (REJECTED)</option>
            </select>
          </div>

          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">جميع طرق الدفع (InstaPay / Cash / Center)</option>
              <option value="INSTAPAY">InstaPay</option>
              <option value="VODAFONE_CASH">Vodafone Cash</option>
              <option value="IN_PERSON">Pay in Center (بالمركز)</option>
            </select>
          </div>

        </div>

        {/* Table / List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">جاري تحميل بيانات الحجوزات...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            لا توجد حجوزات تطابق البحث المترتب.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs whitespace-nowrap">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4 font-bold rounded-tr-2xl">رقم الحجز</th>
                  <th className="p-4 font-bold">اسم الطالب وولي الأمر</th>
                  <th className="p-4 font-bold">الهاتف والواتساب</th>
                  <th className="p-4 font-bold">الكورس والمجموعة</th>
                  <th className="p-4 font-bold">السعر وطريقة الدفع</th>
                  <th className="p-4 font-bold">الحالة</th>
                  <th className="p-4 font-bold">الموظف والنعليقات</th>
                  <th className="p-4 font-bold text-left rounded-tl-2xl">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBookings.map((booking) => {
                  const shortId = (booking.bookingId || booking.id.substring(0, 6)).toUpperCase();
                  const isEditing = editingBookingId === booking.id;

                  return (
                    <tr key={booking.id} className="hover:bg-slate-800/40 transition">
                      
                      {/* ID & Date */}
                      <td className="p-4 font-mono font-bold text-emerald-400">
                        <div>ST-{shortId}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('ar-EG') : ''}
                        </div>
                      </td>

                      {/* Student & Parent */}
                      <td className="p-4">
                        <div className="font-extrabold text-white text-sm">{booking.studentName}</div>
                        <div className="text-[11px] text-slate-400">
                          {booking.parentName ? `ولي الأمر: ${booking.parentName}` : ''}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="p-4">
                        <div className="font-mono text-slate-200 dir-ltr text-right">{booking.phone}</div>
                        <button
                          onClick={() => openCustomerWhatsApp(booking)}
                          className="mt-1 text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" /> مراسلة على WhatsApp
                        </button>
                      </td>

                      {/* Course & Class */}
                      <td className="p-4 max-w-xs truncate">
                        <div className="font-bold text-slate-200">{booking.courseNameSnapshot || booking.courseId}</div>
                        <div className="text-[10px] text-slate-400">
                          {booking.classNameSnapshot || booking.className || 'المجموعة الأساسية'}
                        </div>
                      </td>

                      {/* Price & Method */}
                      <td className="p-4">
                        <div className="font-black text-emerald-400">{booking.finalPriceSnapshot} {booking.currency || 'EGP'}</div>
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                          {booking.paymentMethod === 'INSTAPAY' && <span className="text-purple-400 font-black">⚡ InstaPay</span>}
                          {booking.paymentMethod === 'VODAFONE_CASH' && <span className="text-red-400 font-black">📱 Vodafone Cash</span>}
                          {booking.paymentMethod === 'IN_PERSON' && <span className="text-emerald-400 font-black">🏢 Pay in Center</span>}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {getStatusBadge(booking.bookingStatus, booking.paymentStatus)}
                      </td>

                      {/* Assignee & Notes */}
                      <td className="p-4 max-w-xs">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editAssignee}
                              onChange={(e) => setEditAssignee(e.target.value)}
                              placeholder="اسم الموظف المسؤول..."
                              className="w-full bg-slate-950 p-1.5 rounded border border-slate-700 text-xs text-white"
                            />
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="ملاحظات..."
                              className="w-full bg-slate-950 p-1.5 rounded border border-slate-700 text-xs text-white h-12"
                            />
                            <button
                              onClick={() => handleSaveEdit(booking.id)}
                              className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[10px] flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" /> حفظ
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-[11px] text-slate-300 font-bold">
                              المسؤول: {booking.assignedEmployee || 'غير معين'}
                            </div>
                            {booking.notes && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={booking.notes}>
                                {booking.notes}
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setEditingBookingId(booking.id);
                                setEditNotes(booking.notes || '');
                                setEditAssignee(booking.assignedEmployee || '');
                              }}
                              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" /> تعديل الملاحظات
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          
                          {booking.paymentStatus !== 'VERIFIED' && (
                            <button
                              onClick={() => handleVerifyPayment(booking)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-md shadow-emerald-900/20 cursor-pointer"
                              title="اعتماد الدفع وتأكيد الحجز"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              اعتماد التحويل
                            </button>
                          )}

                          {booking.bookingStatus !== 'REJECTED' && booking.paymentStatus !== 'VERIFIED' && (
                            <button
                              onClick={() => handleRejectBooking(booking)}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl text-xs transition flex items-center gap-1 border border-red-500/30 cursor-pointer"
                              title="رفض الطلب"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              رفض
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
