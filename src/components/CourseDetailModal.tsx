import React, { useState, useEffect } from 'react';
import { Course, User, Role, PaymentSettings, CourseBooking } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MarketingMediaGallery } from './MarketingMediaGallery';
import { motion, AnimatePresence } from 'motion/react';
import { createBooking, getPaymentSettings } from '../services/bookingService';
import { createLeadInFirestore } from '../services/leadService';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  BookOpen,
  Layers,
  Zap,
  Boxes,
  UserPlus,
  Check,
  Phone,
  MessageCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  currentUser?: User | null;
  onOpenAuth?: (role?: Role) => void;
  onAwardXp?: (amount: number) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  currentUser,
  onOpenAuth,
  onAwardXp
}) => {
  if (!course) return null;

  const { isArabic, dir, t, getLocalized } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'schedule' | 'media' | 'booking'>('overview');
  
  const [parentName, setParentName] = useState(currentUser?.name || '');
  const [studentName, setStudentName] = useState(currentUser?.studentProfile?.parentName ? currentUser?.name : ''); 
  const [studentDateOfBirth, setStudentDateOfBirth] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [notes, setNotes] = useState('');
  const [includeKit, setIncludeKit] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(getLocalized(course, 'branchName') || 'سمارتك للتدريب المتطور — زيزينيا الإسكندرية (المقر الرئيسي)');
  const [paymentMethod, setPaymentMethod] = useState<'INSTAPAY' | 'VODAFONE_CASH' | 'IN_PERSON'>('IN_PERSON');
  
  const [isBooked, setIsBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState('');
  
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    getPaymentSettings().then(setPaymentSettings).catch(console.error);
  }, []);

  useEffect(() => {
    if (paymentSettings) {
      if (paymentSettings.instapayEnabled) setPaymentMethod('INSTAPAY');
      else if (paymentSettings.vodafoneCashEnabled) setPaymentMethod('VODAFONE_CASH');
      else if (paymentSettings.inPersonEnabled) setPaymentMethod('IN_PERSON');
    }
  }, [paymentSettings]);

  const finalPrice = course.discountPrice > 0 ? course.discountPrice : course.originalPrice;
  const currency = course.currency || 'EGP';

  const calculateTotal = () => {
    let base = finalPrice;
    if (includeKit && course.kitPrice) {
      base += course.kitPrice;
    }
    return base;
  };

  const buildWhatsAppMessage = (bId: string) => {
    const courseTitle = getLocalized(course, 'title');
    let pmLabel = '';
    if (paymentMethod === 'INSTAPAY') pmLabel = 'InstaPay';
    else if (paymentMethod === 'VODAFONE_CASH') pmLabel = 'Vodafone Cash';
    else if (paymentMethod === 'IN_PERSON') pmLabel = 'Pay In Person';

    return `Hello SmartTech,

I would like to book the following course:

Booking ID: ST-${bId}
Student: ${studentName}
Course: ${courseTitle} (${course.code})
Price: ${calculateTotal()} ${currency}
Payment Method: ${pmLabel}

I would like to complete/confirm my booking.`;
  };

  const openWhatsApp = (bId: string) => {
    const msg = buildWhatsAppMessage(bId);
    const targetWaNumber = paymentSettings?.whatsappNumber || '201024434357';
    const waUrl = `https://wa.me/${targetWaNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const makeCall = () => {
    window.location.href = 'tel:01024434357';
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !studentName || !phone || !whatsappNumber) return;
    
    setIsSubmitting(true);
    try {
      const bData: Omit<CourseBooking, 'id' | 'createdAt' | 'updatedAt'> = {
        customerName: parentName,
        parentName,
        studentName,
        studentDateOfBirth,
        phone,
        whatsappNumber,
        email,
        courseId: course.id,
        priceSnapshot: course.originalPrice,
        discountSnapshot: course.originalPrice - finalPrice,
        finalPriceSnapshot: calculateTotal(),
        currency,
        paymentMethod,
        paymentStatus: 'UNPAID',
        bookingStatus: paymentMethod === 'IN_PERSON' ? 'NEW' : 'PAYMENT_PENDING',
        source: 'WEBSITE',
        notes: `${notes} | Branch: ${selectedBranch} | Kit: ${includeKit ? 'Yes' : 'No'}`
      };

      const newBookingId = await createBooking(bData);
      const shortId = newBookingId.substring(0, 5).toUpperCase();
      setBookingId(shortId);

      try {
         await createLeadInFirestore({
           leadId: `LEAD-${Date.now()}`,
           studentName,
           parentName,
           phone,
           whatsappNumber,
           email,
           status: 'NEW',
           source: 'WEBSITE',
           interestLevel: 'HOT',
           selectedCourses: [course.id],
           selectedCourseTitles: [course.titleAr]
         }, { id: 'GUEST', name: 'GUEST', role: Role.GUEST } as any);
      } catch (e) {
        console.error("Lead creation failed", e);
      }
      
      setIsBooked(true);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      
      if (onAwardXp) onAwardXp(250);
      
      openWhatsApp(shortId);
      
    } catch (error) {
      console.error("Failed to create booking", error);
      alert("An error occurred while booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir={dir} className={`fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto ${isArabic ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-800 text-slate-100 p-6 sm:p-8 relative space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 ${isArabic ? 'left-6' : 'right-6'} p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer z-10`}
        >
          <X className="w-5 h-5" />
        </button>

        {!isBooked ? (
          <div className="space-y-6">
            {/* Header Hero */}
            <div className="flex flex-col sm:flex-row items-start gap-5 border-b border-slate-800 pb-6">
              <img
                src={course.image}
                alt={getLocalized(course, 'title')}
                className="w-full sm:w-32 h-32 rounded-2xl object-cover shadow-lg border border-slate-800 shrink-0"
              />
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-red-600/30 text-red-400 border border-red-500/30 font-extrabold text-[11px]">
                    {course.code} • {isArabic ? `السن ${course.ageMin}–${course.ageMax} سنة` : `Age ${course.ageMin}–${course.ageMax}`}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                    {course.mode}
                  </span>
                  {course.startDate && (
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-400 font-bold text-[11px] border border-emerald-800">
                      {isArabic ? `بداية الدورة: ${course.startDate}` : `Start Date: ${course.startDate}`}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {getLocalized(course, 'title')}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Clock className="w-4 h-4" /> {course.durationWeeks} أسابيع ({course.sessionsCount} جلسة • {course.sessionMinutes} دقيقة)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Users className="w-4 h-4" /> المقاعد المتاحة بالدورة: 5 / 12
                  </span>
                </div>
              </div>
            </div>

            {/* Guest Quick Signup Prompt if guest */}
            {!currentUser && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/60 border border-red-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-extrabold text-white block">تدرس كزائر؟ أنشئ حسابك مجاناً لتتبع مستواك</span>
                    <span className="text-slate-300">احصل على شهادة معتمدة ورصيد XP عند تسجيل الحساب</span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenAuth && onOpenAuth(Role.STUDENT)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تسجيل حساب جديد</span>
                </button>
              </div>
            )}

            {/* Modal Tabs Header */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              {[
                { id: 'overview', label: isArabic ? 'نظرة عامة والأسعار 🏷️' : 'Overview & Pricing 🏷️' },
                { id: 'curriculum', label: isArabic ? 'المحتوى العلمي والوحدات 📚' : 'Curriculum & Units 📚' },
                { id: 'schedule', label: isArabic ? 'جدول مواعيد الجلسات 📅' : 'Schedule & Sessions 📅' },
                { id: 'media', label: isArabic ? 'الفيديوهات والمنشورات 🎬' : 'Videos & Posts 🎬' },
                { id: 'booking', label: isArabic ? 'تأكيد الحجز والدفع 🚀' : 'Enroll & Payment 🚀' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview & Pricing */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-black text-sm text-amber-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> {isArabic ? 'الوصف والتفاصيل العامة:' : 'Description & Details:'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    {getLocalized(course, 'description')}
                  </p>
                </div>

                {/* Outcomes */}
                <div className="space-y-3">
                  <h3 className="font-black text-sm text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {isArabic ? 'مخرجات التعلم التي يكتسبها الطالب:' : 'Learning Outcomes:'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                    {((isArabic ? course.learningOutcomesAr : course.learningOutcomesEn) || course.learningOutcomesAr || []).map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Pricing Section */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-black text-sm text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" /> كشف التفاصيل المالية ورسوم الدورة:
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                      <span className="text-slate-400 block mb-1">السعر الأصلي</span>
                      <span className="text-slate-400 line-through text-sm">{course.originalPrice} {course.currency || 'EGP'}</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                      <span className="text-emerald-400 font-bold block mb-1">خصم الحجز اليوم</span>
                      <span className="text-xl font-black text-emerald-400">{course.discountPrice} {course.currency || 'EGP'}</span>
                    </div>

                    {course.summer3MonthsPrice && (
                      <div className="p-3 bg-amber-950/50 rounded-xl border border-amber-500/30 text-center">
                        <span className="text-amber-300 font-bold block mb-1">عرض الترم (3 شهور)</span>
                        <span className="text-xl font-black text-amber-400">{course.summer3MonthsPrice} {course.currency || 'EGP'}</span>
                      </div>
                    )}
                  </div>

                  {course.kitPrice && (
                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-slate-200">حقيبة المكونات والتطبيقات ({course.kitNameAr || 'Kit'})</span>
                      </div>
                      <span className="text-amber-400 font-black">+{course.kitPrice} {course.currency || 'EGP'}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveTab('booking')}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
                    >
                      الانتقال للتسجيل وحجز المقعد 🚀
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Curriculum & Modules */}
            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" /> المنهج التعليمي والوحدات بالتفصيل:
                </h3>

                {course.modules && course.modules.length > 0 ? (
                  <div className="space-y-3">
                    {course.modules.map((mod, i) => (
                      <div key={mod.id || i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-amber-400 text-xs">{mod.titleAr}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {mod.lessonsCount || 4} دروس تفاعلية
                          </span>
                        </div>
                        {mod.topicsAr && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {mod.topicsAr.map((t, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-slate-900 text-slate-300 text-[11px] rounded-lg border border-slate-800">
                                • {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-center space-y-2">
                    <p className="font-bold text-white">وحدات المنهج المعتمدة كود {course.code}</p>
                    <p>يتضمن الكورس {course.sessionsCount} جلسة عملية تطبق مشاريع تفاعلية بناءً على منهج الأكاديمية.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Session Schedules & Dates */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" /> جدول مواعيد الجلسات والدروس المحددة:
                  </h3>
                  {course.startDate && (
                    <span className="text-xs text-amber-400 font-bold bg-amber-950/50 px-3 py-1 rounded-xl border border-amber-500/30">
                      تاريخ البداية العام: {course.startDate}
                    </span>
                  )}
                </div>

                {course.sessionSchedules && course.sessionSchedules.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {course.sessionSchedules.map((sched, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-red-600/30 text-red-400 font-black flex items-center justify-center shrink-0 border border-red-500/30">
                            {sched.sessionNumber}
                          </span>
                          <div>
                            <span className="font-black text-white block">{sched.titleAr}</span>
                            {sched.descriptionAr && <span className="text-[10px] text-slate-400">{sched.descriptionAr}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-300 font-bold text-[11px] shrink-0">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Calendar className="w-3.5 h-3.5" /> {sched.startDate || course.startDate || 'قريباً'}
                          </span>
                          <span className="flex items-center gap-1 text-amber-400">
                            <Clock className="w-3.5 h-3.5" /> {sched.startTime || '16:00'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-center space-y-2">
                    <p className="font-bold text-white">تاريخ بداية الجلسات: {course.startDate || '1 سبتمبر 2026'}</p>
                    <p>يتم تنظيم مواعيد الجلسات يومين أسبوعياً حسب اختيار الفرع أو الأونلاين.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Media & Videos */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <MarketingMediaGallery
                  userRole={currentUser?.role}
                  filterCourseId={course.id}
                  compactView={false}
                />
              </div>
            )}

            {/* Tab 4: Booking Form */}
            {activeTab === 'booking' && (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <h3 className="font-extrabold text-sm text-white">Guest Booking & Enrollment</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Parent/Customer Name</label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Student Name</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Student Full Name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Student Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={studentDateOfBirth}
                      onChange={(e) => setStudentDateOfBirth(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-sm font-extrabold">
                  <span>Final Course Price:</span>
                  <div className="text-right">
                    {course.discountPrice > 0 && (
                       <span className="text-slate-500 line-through text-xs ml-2">{course.originalPrice} {course.currency || 'EGP'}</span>
                    )}
                    <span className="text-xl text-emerald-400">{calculateTotal()} {course.currency || 'EGP'}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Select Payment Method:</label>
                  {!paymentSettings ? (
                    <div className="text-xs text-slate-400 animate-pulse">Loading payment options...</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                      {paymentSettings.instapayEnabled && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('INSTAPAY')}
                          className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                            paymentMethod === 'INSTAPAY' ? 'bg-red-600/20 text-white border-red-500 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <CreditCard className="w-5 h-5 text-purple-400" />
                          <span>InstaPay</span>
                          {paymentMethod === 'INSTAPAY' && <span className="text-[10px] text-purple-300">{paymentSettings.instapayNumber}</span>}
                        </button>
                      )}
                      
                      {paymentSettings.vodafoneCashEnabled && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('VODAFONE_CASH')}
                          className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                            paymentMethod === 'VODAFONE_CASH' ? 'bg-red-600/20 text-white border-red-500 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <Phone className="w-5 h-5 text-red-500" />
                          <span>Vodafone Cash</span>
                          {paymentMethod === 'VODAFONE_CASH' && <span className="text-[10px] text-red-300">{paymentSettings.vodafoneCashNumber}</span>}
                        </button>
                      )}

                      {paymentSettings.inPersonEnabled && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('IN_PERSON')}
                          className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                            paymentMethod === 'IN_PERSON' ? 'bg-red-600/20 text-white border-red-500 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <MapPin className="w-5 h-5 text-emerald-500" />
                          <span>Pay In Person</span>
                          {paymentMethod === 'IN_PERSON' && <span className="text-[10px] text-emerald-300">At Branch</span>}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !paymentSettings}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-red-900/30 transition cursor-pointer mt-4 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <>Book Course & Proceed to WhatsApp <MessageCircle className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Confirmation Receipt */
          <div className="text-center py-8 space-y-6 dir-rtl">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mx-auto text-3xl font-bold shadow-lg">
              ✓
            </div>
            <h3 className="text-2xl font-black text-white">
              تم تأكيد حجز مقعدك بنجاح في SmartTech! 🎉
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              تم تسجيل الطالب <strong className="text-amber-400">{studentName}</strong> في كورس {course.titleAr}. تم إرسال تفاصيل الفاتورة وميعاد الجلسة الأولى على الواتساب: {phone}.
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-w-md mx-auto text-xs space-y-2 text-right">
              <div className="flex justify-between">
                <span>رقم الحجز الفوري:</span>
                <span className="font-mono font-bold text-red-400">SMART-2026-BOOK-9912</span>
              </div>
              <div className="flex justify-between">
                <span>الفرع:</span>
                <span className="font-bold text-white">{selectedBranch}</span>
              </div>
              <div className="flex justify-between">
                <span>تاريخ بداية الدورة:</span>
                <span className="font-bold text-amber-400">{course.startDate || '1 سبتمبر 2026'}</span>
              </div>
              <div className="flex justify-between">
                <span>المبلغ المستحق:</span>
                <span className="font-black text-emerald-400 text-sm">{calculateTotal()} {course.currency || 'EGP'}</span>
              </div>
            </div>

            {/* Direct Contact & WhatsApp Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={openWhatsApp}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-200" />
                <span>إعادة إرسال الرسالة عبر الواتساب (01024434357) 💬</span>
              </button>

              <button
                type="button"
                onClick={makeCall}
                className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-blue-200" />
                <span>اتصال هاتفي مباشر 📞</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer mt-2"
            >
              إغلاق العرض
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
