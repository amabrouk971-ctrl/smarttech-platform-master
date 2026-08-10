import React, { useState, useEffect } from 'react';
import { User, CourseBooking } from '../../types';
import { getUserBookings, buildWhatsAppUrl, getPaymentSettings } from '../../services/bookingService';
import { X, CreditCard, Clock, ShieldCheck, MapPin, MessageCircle, RefreshCw, AlertCircle, Phone } from 'lucide-react';
import { motion } from 'motion/react';

interface MyBookingsModalProps {
  currentUser: User | null;
  onClose: () => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({ currentUser, onClose }) => {
  const [bookings, setBookings] = useState<CourseBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState(currentUser?.phone || '');

  useEffect(() => {
    if (currentUser?.phone || currentUser?.email || currentUser?.id) {
      loadBookings(currentUser.phone || currentUser.email || currentUser.id);
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const loadBookings = async (identifier: string) => {
    if (!identifier) return;
    setIsLoading(true);
    try {
      const data = await getUserBookings(identifier);
      setBookings(data);
    } catch (err) {
      console.error('Error loading user bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPhone) {
      loadBookings(searchPhone);
    }
  };

  const sendWhatsAppInquiry = async (booking: CourseBooking) => {
    const settings = await getPaymentSettings();
    const shortId = (booking.bookingId || booking.id.substring(0, 6)).toUpperCase();
    const msg = `مرحباً SmartTech 👋

أستفسر عن حالة الحجز الخاص بي:
رقم الحجز: ST-${shortId}
الكورس: ${booking.courseNameSnapshot || booking.courseId}
الاسم: ${booking.studentName}

أرجو إفادتي بحالة التأكيد.`;

    const targetPhone = settings.supportWhatsapp || '01227811948';
    window.open(buildWhatsAppUrl(targetPhone, msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-white dir-rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">حجوزاتي وطلبات الكورسات 📑</h3>
              <p className="text-xs text-slate-400">تابع حالة حجزك ومراجعة الفواتير والتحويلات المالية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar if not auto-loaded */}
        <form onSubmit={handleSearch} className="flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="أدخل رقم المحمول أو البريد الإلكتروني للبحث..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            بحث
          </button>
        </form>

        {/* List of Bookings */}
        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">جاري جلب حجوزاتك...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p>لم يتم العثور على حجوزات سابقة بالرقم المدخل.</p>
            </div>
          ) : (
            bookings.map((booking) => {
              const shortId = (booking.bookingId || booking.id.substring(0, 6)).toUpperCase();
              const isVerified = booking.paymentStatus === 'VERIFIED' || booking.bookingStatus === 'BOOKING_CONFIRMED' || booking.bookingStatus === 'ENROLLED';

              return (
                <div
                  key={booking.id}
                  className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-emerald-400 text-sm">ST-{shortId}</span>
                      <span className="text-xs font-bold text-white">• {booking.courseNameSnapshot || booking.courseId}</span>
                    </div>

                    <div>
                      {isVerified ? (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-black text-xs flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> حجز مؤكد ومفعل ✅
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-black text-xs flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> جاري مراجعة التحويل ⏳
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">الطالب:</span>
                      <span className="font-bold text-white">{booking.studentName}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">المجموعة:</span>
                      <span className="font-bold text-white">{booking.classNameSnapshot || 'المجموعة الأولى'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">طريقة الدفع:</span>
                      <span className="font-bold text-emerald-400">{booking.paymentMethod}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">القيمة:</span>
                      <span className="font-black text-emerald-300">{booking.finalPriceSnapshot} {booking.currency || 'EGP'}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => sendWhatsAppInquiry(booking)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      متابعة الحجز على WhatsApp
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </motion.div>
    </div>
  );
};
