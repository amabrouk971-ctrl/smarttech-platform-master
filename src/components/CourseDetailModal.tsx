import React, { useState, useEffect } from 'react';
import { Course, User, Role, ContactPaymentSettings, CourseBooking, CourseClass, CourseUnit, CourseMaterial } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MarketingMediaGallery } from './MarketingMediaGallery';
import { AuthGateModal } from './AuthGateModal';
import { canStudentAccessMaterial, fetchCourseMaterialsFromFirestore, logMaterialAccessAudit } from '../services/entitlementService';
import { motion, AnimatePresence } from 'motion/react';
import {
  createBooking,
  getPaymentSettings,
  calculateCourseSeats,
  formatWhatsAppMessage,
  getWhatsAppNumberForMethod,
  buildWhatsAppUrl,
  DEFAULT_CONTACT_PAYMENT_SETTINGS
} from '../services/bookingService';
import { getClassesForCourse } from '../services/classService';
import { getCurriculumForCourse } from '../services/curriculumService';
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
  Copy,
  ChevronRight,
  ChevronLeft,
  Building2,
  AlertTriangle,
  HelpCircle,
  Upload,
  Image as ImageIcon,
  Crown,
  Trash2,
  FileText
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

  const { isArabic, getLocalized } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'schedule' | 'media' | 'booking'>('overview');

  // Booking Flow Steps
  const [bookingStep, setBookingStep] = useState<number>(1);

  // Form State
  const [isParent, setIsParent] = useState<boolean>(currentUser?.role === Role.PARENT || false);
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [parentName, setParentName] = useState(currentUser?.name || '');
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<string>('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [notes, setNotes] = useState('');
  const [includeKit, setIncludeKit] = useState(false);
  const [attendanceMode, setAttendanceMode] = useState<'IN_PERSON' | 'ONLINE'>('IN_PERSON');
  const [paymentMethod, setPaymentMethod] = useState<'INSTAPAY' | 'VODAFONE_CASH' | 'IN_PERSON'>('INSTAPAY');

  // Reservation Type & Duration
  const [reservationType, setReservationType] = useState<'GROUP' | 'PRIVATE' | 'LECTURES'>('GROUP');
  const [expectedDuration, setExpectedDuration] = useState<string>('1_MONTH');
  const [customDuration, setCustomDuration] = useState<string>('');

  // Receipt Image Upload
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentProofFileName, setPaymentProofFileName] = useState<string>('');

  // Confirmation & Settings
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dynamic Data
  const [settings, setSettings] = useState<ContactPaymentSettings>(DEFAULT_CONTACT_PAYMENT_SETTINGS);
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [units, setUnits] = useState<CourseUnit[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Gate Modal State
  const [gateModalOpen, setGateModalOpen] = useState<boolean>(false);
  const [gateTitle, setGateTitle] = useState<string>('');
  const [gateDescription, setGateDescription] = useState<string>('');
  const [isNotEnrolledGate, setIsNotEnrolledGate] = useState<boolean>(false);
  const [selectedMaterialForView, setSelectedMaterialForView] = useState<CourseMaterial | null>(null);

  // Seat Availability
  const [seatsData, setSeatsData] = useState<{
    maxCapacity: number;
    confirmedEnrollments: number;
    availableSeats: number;
    isFullyBooked: boolean;
  }>({
    maxCapacity: course.maxStudents || 20,
    confirmedEnrollments: 0,
    availableSeats: course.maxStudents || 20,
    isFullyBooked: false
  });

  useEffect(() => {
    getClassesForCourse(course.id).then(fetchedClasses => {
      setClasses(fetchedClasses);
      if (fetchedClasses.length > 0) {
        setSelectedClassId(fetchedClasses[0].id);
      }
    }).catch(console.error);

    getCurriculumForCourse(course.id).then(setUnits).catch(console.error);
    fetchCourseMaterialsFromFirestore(course.id).then(setCourseMaterials).catch(console.error);

    getPaymentSettings().then(s => {
      setSettings(s);
      if (s.enableInstapay) setPaymentMethod('INSTAPAY');
      else if (s.enableVodafoneCash) setPaymentMethod('VODAFONE_CASH');
      else if (s.enablePayInCenter) setPaymentMethod('IN_PERSON');
    }).catch(console.error);

    calculateCourseSeats(course.id, course.maxStudents || 20).then(setSeatsData).catch(console.error);
  }, [course.id]);

  const handleAttemptAccessMaterial = async (materialId: string, operation: 'view' | 'download' = 'view') => {
    const result = await canStudentAccessMaterial(
      currentUser?.id,
      currentUser?.role,
      materialId,
      course.id,
      operation
    );

    if (result.allowed) {
      if (currentUser?.id) {
        logMaterialAccessAudit(
          currentUser.id,
          course.id,
          materialId,
          operation === 'download' ? 'DOWNLOAD' : 'OPENED'
        );
      }
      const mat = courseMaterials.find(m => m.id === materialId);
      if (mat) {
        setSelectedMaterialForView(mat);
      } else {
        alert('متاح للوصول! يمكنك البدء بالدراسة الآن.');
      }
    } else {
      if (!currentUser) {
        setGateTitle('سجّل الدخول للوصول إلى المحتوى');
        setGateDescription(result.messageAr || 'هذا المحتوى متاح للطلاب المسجلين فقط.');
        setIsNotEnrolledGate(false);
        setGateModalOpen(true);
      } else if (result.reason === 'DENIED_NOT_ENROLLED') {
        setGateTitle('محتوى حصري للطلاب المشتركين');
        setGateDescription('حسابك مسجل دخول، لكنك غير مشترك في هذا الكورس بعد. احجز الكورس الآن للحصول على التفعيل المباشر.');
        setIsNotEnrolledGate(true);
        setGateModalOpen(true);
      } else {
        alert(`❌ تعذر الوصول: ${result.messageAr}`);
      }
    }
  };

  const currency = course.currency || 'EGP';

  const getReservationPrice = () => {
    let base = course.discountPrice > 0 ? course.discountPrice : course.originalPrice;
    if (!base || base <= 0) base = 2500;
    if (reservationType === 'PRIVATE') {
      // Cost increases from 2500 to 5000 EGP (+2500 EGP)
      return base === 2500 ? 5000 : base + 2500;
    }
    if (reservationType === 'LECTURES') {
      return Math.round(base / 4) > 0 ? Math.round(base / 4) : 500;
    }
    return base;
  };

  const calculateTotal = () => {
    let total = getReservationPrice();
    if (includeKit && course.kitPrice) {
      total += course.kitPrice;
    }
    return total;
  };

  const getDurationLabel = () => {
    if (expectedDuration === '1_LECTURE') return 'محاضرة واحدة';
    if (expectedDuration === '1_MONTH') return 'شهر واحد (4 أسابيع)';
    if (expectedDuration === '3_MONTHS') return '3 أشهر (ترم كامل)';
    if (expectedDuration === '6_MONTHS') return '6 أشهر (برنامج مكثف)';
    if (expectedDuration === 'CUSTOM') return customDuration || 'مدة مخصصة';
    return expectedDuration;
  };

  const getReservationTypeLabel = () => {
    if (reservationType === 'PRIVATE') return 'حجز خاص VIP (1-إلى-1)';
    if (reservationType === 'LECTURES') return 'حجز محاضرات / ورش عمل';
    return 'حجز مجموعة جماعية';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(isArabic ? 'يرجى اختيار صورة إيصال فقط (PNG, JPG, JPEG)' : 'Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(isArabic ? 'حجم الصورة يتجاوز 5 ميجابايت' : 'Image exceeds 5MB limit');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          
          // Verify size is roughly within 1MB base64 limit (1MB ~ 1.37MB base64 string length)
          // 0.6 JPEG quality with max 800px will almost certainly be under 200KB.
          setPaymentProofUrl(compressedDataUrl);
          setPaymentProofFileName(file.name);
        } else {
          setPaymentProofUrl(event.target?.result as string);
          setPaymentProofFileName(file.name);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenCourseInquiryWhatsApp = () => {
    const tmpl = settings.whatsappTemplates?.courseInquiry || DEFAULT_CONTACT_PAYMENT_SETTINGS.whatsappTemplates!.courseInquiry;
    const msg = formatWhatsAppMessage(tmpl, {
      courseName: getLocalized(course, 'title'),
      price: calculateTotal(),
      centerName: settings.centerName,
      centerAddress: settings.centerAddress
    });
    const targetPhone = getWhatsAppNumberForMethod('INQUIRY', settings);
    window.open(buildWhatsAppUrl(targetPhone, msg), '_blank');
  };

  const sendFullDetailsToWhatsApp = (bId?: string) => {
    const code = bId || bookingId || 'ST-2026-BOOK';
    const selectedClass = classes.find(c => c.id === selectedClassId);
    
    let receiptStatusText = 'لم يتم إرفاق إيصال بعد';
    if (paymentMethod === 'IN_PERSON') {
      receiptStatusText = 'الدفع نقداً بمقر المركز (زيزينيا - الإسكندرية)';
    } else if (paymentProofUrl) {
      receiptStatusText = '📸 تم رفع وإرفاق صورة إيصال التحويل بالسيستم بنجاح';
    }

    const customMsg = `مرحباً SmartTech Academy 👋

أود تأكيد حجز الكورس وإرسال كافة البيانات للتسجيل:
📌 رقم الحجز الرسمي: ST-${code}

👤 بيانات صاحب الحجز والطالب:
• الاسم: ${customerName} ${childName ? `(طالب/ة: ${childName})` : ''}
• رقم التواصل: ${phone}
• الواتساب: ${whatsappNumber || phone}

🎓 تفاصيل الكورس ونوع الحجز:
• اسم الكورس: ${getLocalized(course, 'title')}
• نوع الحجز: ${getReservationTypeLabel()}
• المدة المتوقعة: ${getDurationLabel()}
• طريقة الحضور: ${attendanceMode === 'IN_PERSON' ? 'حضوري بالمركز (زيزينيا)' : 'أونلاين تفاعلي'}
• المجموعة / الموعد: ${selectedClass?.name || 'المجموعة الأساسية'} (${selectedClass?.schedule || 'مواعيد رسمية'})

💳 الدفع وإيصال التحويل:
• طريقة الدفع: ${paymentMethod === 'INSTAPAY' ? '⚡ InstaPay' : paymentMethod === 'VODAFONE_CASH' ? '📱 Vodafone Cash' : '🏢 الدفع في المركز'}
• الإجمالي المستحق: ${calculateTotal()} ${currency}
• صورة إيصال التحويل: ${receiptStatusText}

📍 مقر الفرع: ${settings.centerName}
${settings.centerAddress}

أرجو مراجعة طلب الحجز وتأكيد تسجيل الطالب رسمياً.`;

    const targetPhone = getWhatsAppNumberForMethod(paymentMethod, settings);
    window.open(buildWhatsAppUrl(targetPhone, customMsg), '_blank');
  };

  const handleSubmitBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customerName || !phone) {
      alert(isArabic ? 'يرجى إدخال الاسم ورقم الهاتف' : 'Please enter name and phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedClass = classes.find(c => c.id === selectedClassId);

      const bData: Omit<CourseBooking, 'id' | 'createdAt' | 'updatedAt'> = {
        customerName,
        parentName: isParent ? customerName : (parentName || ''),
        studentName: isParent ? (childName || customerName) : (studentName || customerName),
        isParent,
        childName: childName || '',
        childAge: childAge || '',
        phone,
        whatsappNumber: whatsappNumber || phone,
        email: email || '',
        courseId: course.id,
        courseName: getLocalized(course, 'title'),
        courseNameSnapshot: getLocalized(course, 'title'),
        classId: selectedClassId || '',
        className: selectedClass?.name || 'المجموعة الأولى',
        classNameSnapshot: selectedClass?.name || 'المجموعة الأولى',
        startDate: selectedClass?.startDate || 'سيتم التحديد عند اكتمال المجموعة',
        schedule: selectedClass?.schedule || 'يومين أسبوعياً',
        attendanceMode,
        reservationType,
        expectedDuration: getDurationLabel(),
        paymentProofUrl: paymentProofUrl || '',
        priceSnapshot: course.originalPrice || 0,
        discountSnapshot: (course.originalPrice || 0) - getReservationPrice(),
        finalPriceSnapshot: calculateTotal(),
        currency,
        paymentMethod,
        paymentStatus: paymentMethod === 'IN_PERSON' ? 'PAY_IN_CENTER_PENDING' : paymentProofUrl ? 'PENDING_VERIFICATION' : 'PENDING_PAYMENT',
        bookingStatus: 'NEW',
        source: 'WEBSITE_BOOKING',
        notes: `${notes || ''} | Type: ${getReservationTypeLabel()} | Duration: ${getDurationLabel()} | Receipt: ${paymentProofUrl ? 'Attached' : 'No'} | Branch: ${settings.centerName}`
      };

      const newBookingId = await createBooking(bData);
      const shortId = newBookingId.substring(0, 6).toUpperCase();
      setBookingId(shortId);

      setBookingCompleted(true);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

      if (onAwardXp) onAwardXp(300);

      // Auto send to WhatsApp
      sendFullDetailsToWhatsApp(shortId);

    } catch (err) {
      console.error('Failed to create booking:', err);
      alert('حدث خطأ أثناء الحجز، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentWhatsAppConfirmation = () => {
    const selectedClass = classes.find(c => c.id === selectedClassId);
    let tmpl = settings.whatsappTemplates?.instapayPayment;
    if (paymentMethod === 'VODAFONE_CASH') {
      tmpl = settings.whatsappTemplates?.vodafoneCashPayment;
    } else if (paymentMethod === 'IN_PERSON') {
      tmpl = settings.whatsappTemplates?.payInCenter;
    }

    const msg = formatWhatsAppMessage(tmpl || DEFAULT_CONTACT_PAYMENT_SETTINGS.whatsappTemplates!.instapayPayment, {
      courseName: getLocalized(course, 'title'),
      customerName: isParent ? `${customerName} (ولي أمر الطالب: ${childName})` : customerName,
      phone,
      price: calculateTotal(),
      paymentMethod: paymentMethod === 'INSTAPAY' ? 'InstaPay' : paymentMethod === 'VODAFONE_CASH' ? 'Vodafone Cash' : 'الدفع بالمركز',
      className: selectedClass?.name || 'المجموعة الأساسية',
      startDate: selectedClass?.startDate || 'قريباً',
      schedule: selectedClass?.schedule || 'مواعيد رسمية',
      attendanceMode: attendanceMode === 'IN_PERSON' ? 'حضوري بالمركز' : 'أونلاين',
      bookingId,
      centerName: settings.centerName,
      centerAddress: settings.centerAddress
    });

    const targetPhone = getWhatsAppNumberForMethod(paymentMethod, settings);
    window.open(buildWhatsAppUrl(targetPhone, msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto dir-rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-white my-auto"
      >
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-extrabold text-xs">
              {course.code || 'COURSE'}
            </span>
            <div>
              <h3 className="text-lg font-black text-white line-clamp-1">
                {getLocalized(course, 'title')}
              </h3>
              <p className="text-xs text-slate-400">
                مستوى: {getLocalized(course, 'level') || 'متقدم'} • {course.ageGroup || 'من 8 إلى 16 سنة'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Navigation Tabs inside Modal */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 overflow-x-auto text-xs font-bold shrink-0 bg-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'overview' ? 'border-emerald-500 text-emerald-400 font-black' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> التفاصيل ونظرة عامة
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'curriculum' ? 'border-emerald-500 text-emerald-400 font-black' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> المنهج والوحدات ({units.length})
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'schedule' ? 'border-emerald-500 text-emerald-400 font-black' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" /> المواعيد والمجموعات ({classes.length})
          </button>

          <button
            onClick={() => setActiveTab('booking')}
            className={`pb-3 px-4 rounded-t-xl flex items-center gap-1.5 transition cursor-pointer bg-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-900/30 ml-auto`}
          >
            <Sparkles className="w-4 h-4" /> احجز المقعد الآن
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Hero Banner & Live Seats Indicator */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 p-6 flex flex-col md:flex-row gap-6 items-center">
                <img
                  src={course.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'}
                  alt={getLocalized(course, 'title')}
                  className="w-full md:w-72 h-48 object-cover rounded-2xl border border-slate-800"
                />

                <div className="flex-1 space-y-3">
                  
                  {/* Dynamic Real Seats Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {seatsData.isFullyBooked ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-black text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> مكتمل العدد (FULLY BOOKED)
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-black text-xs flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> متبقي {seatsData.availableSeats} مقعداً فقط من أصل {seatsData.maxCapacity}
                      </span>
                    )}

                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-bold text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {course.durationHours || 24} ساعة تدريبية
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white">
                    {getLocalized(course, 'title')}
                  </h2>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {getLocalized(course, 'description')}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <div>
                      <span className="text-xs text-slate-400 block font-bold">استثمار الكورس:</span>
                      <span className="text-2xl font-black text-emerald-400">
                        {course.discountPrice || course.originalPrice} {currency}
                      </span>
                      {course.discountPrice > 0 && (
                        <span className="text-xs text-slate-500 line-through mr-2 font-bold">
                          {course.originalPrice} {currency}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mr-auto">
                      <button
                        onClick={handleOpenCourseInquiryWhatsApp}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold rounded-2xl text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        اسأل عن الكورس
                      </button>

                      <button
                        onClick={() => setActiveTab('booking')}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        احجز الآن
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Course Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> خيارات الحضور
                  </div>
                  <div className="text-xs text-slate-300 font-extrabold">
                    حضوري بالمركز ({settings.centerName}) أو أونلاين
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> شهادة معتمدة
                  </div>
                  <div className="text-xs text-slate-300 font-extrabold">
                    شهادة إتمام معتمدة + كود QR للتحقق
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> معامل وتطبيق عملي
                  </div>
                  <div className="text-xs text-slate-300 font-extrabold">
                    مشاريع عمل معملية حقيقية 100%
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CURRICULUM & MATERIALS */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" /> المحتوى التدريبي والوحدات التعليمية
                </h4>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                  {currentUser ? 'وضع الوصول كطالب مسجل' : 'وضع المعاينة كزائر (Guest Mode)'}
                </span>
              </div>

              {units.length === 0 && courseMaterials.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  جاري إعداد محتوى الكورس والمواد التفصيلية.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Units & Lessons */}
                  {units.map((unit, idx) => (
                    <div key={unit.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <div className="font-extrabold text-sm text-emerald-300 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs font-mono">{idx + 1}</span>
                        {unit.titleAr}
                      </div>
                      {unit.lessons && unit.lessons.length > 0 && (
                        <div className="pr-4 space-y-2 border-r-2 border-slate-800">
                          {unit.lessons.map((les) => (
                            <div key={les.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-2">
                              <div className="text-xs text-slate-200 flex items-center gap-2 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{les.titleAr}</span>
                              </div>
                              <button
                                onClick={() => handleAttemptAccessMaterial(les.id, 'view')}
                                className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 font-bold text-[10px] rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <BookOpen className="w-3 h-3" /> مشاهدة المحتوى
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Course Materials Collection */}
                  {courseMaterials.length > 0 && (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <h5 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> المواد التعليمية والمحاكاة والـ PDFs المرفقة:
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {courseMaterials.map((mat) => (
                          <div key={mat.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white">{mat.titleAr}</div>
                              <div className="text-[10px] text-slate-400">{mat.type} • {mat.status}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleAttemptAccessMaterial(mat.id, 'view')}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] rounded-lg border border-slate-700 cursor-pointer"
                              >
                                عرض
                              </button>
                              <button
                                onClick={() => handleAttemptAccessMaterial(mat.id, 'download')}
                                className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 font-bold text-[10px] rounded-lg cursor-pointer"
                              >
                                تحميل
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCHEDULE & CLASSES */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> المجموعات والمواعيد المتاحة
              </h4>

              {classes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  يتم تحديد المواعيد بالتنسيق مع مسؤول التسجيل فور اكتمال المجموعة.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.map(cls => (
                    <div
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`p-5 rounded-2xl border transition cursor-pointer space-y-2 ${
                        selectedClassId === cls.id
                          ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-white">{cls.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                          سعة {cls.maxStudents || 15} طالب
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cls.schedule || 'أحد وأربعاء - 5:00 مساءً'}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>بداية: {cls.startDate || 'قريباً'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BOOKING FLOW */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              
              {!bookingCompleted ? (
                <div className="space-y-6">
                  
                  {/* Step Stepper Header */}
                  <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-bold overflow-x-auto gap-1">
                    {[
                      { step: 1, title: 'البيانات الشخصية' },
                      { step: 2, title: 'نوع الحجز والمدة' },
                      { step: 3, title: 'المجموعة والموعد' },
                      { step: 4, title: 'طريقة الحضور' },
                      { step: 5, title: 'الدفع والإيصال' },
                      { step: 6, title: 'المراجعة والتأكيد' }
                    ].map(st => (
                      <button
                        key={st.step}
                        onClick={() => setBookingStep(st.step)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                          bookingStep === st.step
                            ? 'bg-emerald-600 text-white shadow-md'
                            : bookingStep > st.step
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-900 border flex items-center justify-center text-[10px] font-mono">
                          {st.step}
                        </span>
                        <span>{st.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* STEP 1: CUSTOMER INFO */}
                  {bookingStep === 1 && (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" /> بيانات صاحب الطلب والطالب
                      </h4>

                      <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-2xl border border-slate-800 w-fit">
                        <button
                          type="button"
                          onClick={() => setIsParent(false)}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                            !isParent ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          أنا الطالب نفسي
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsParent(true)}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                            isParent ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          أنا ولي أمر الطالب
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {isParent ? 'اسم ولي الأمر الخماسي' : 'الاسم بالكامل'}
                          </label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="مثال: أحمد محمد علي"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {isParent && (
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">اسم الطالب/ة</label>
                            <input
                              type="text"
                              required
                              value={childName}
                              onChange={(e) => setChildName(e.target.value)}
                              placeholder="مثال: يوسف أحمد محمد"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">رقم المحمول / الواتساب الرسمي</label>
                          <input
                            type="text"
                            required
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              setWhatsappNumber(e.target.value);
                            }}
                            placeholder="01012345678"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني (اختياري)</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@gmail.com"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setBookingStep(2)}
                          disabled={!customerName || !phone}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                        >
                          <span>المتابعة لنوع الحجز والمدة</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: RESERVATION TYPE & DURATION */}
                  {bookingStep === 2 && (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-400" /> اختر نوع الحجز والمدة المتوقعة
                      </h4>

                      {/* RESERVATION TYPE SELECTION */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-300">نوع الحجز المطلوب:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          
                          {/* GROUP */}
                          <div
                            onClick={() => setReservationType('GROUP')}
                            className={`p-4 rounded-2xl border cursor-pointer space-y-2 transition relative ${
                              reservationType === 'GROUP'
                                ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-400" /> مجموعة جماعية
                              </span>
                              {reservationType === 'GROUP' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <p className="text-[11px] text-slate-300">
                              تفاعل ومشاركة ضمن مجموعات المباشرة.
                            </p>
                            <div className="pt-1 text-xs font-black text-emerald-400">
                              {course.discountPrice || course.originalPrice || 2500} {currency}
                            </div>
                          </div>

                          {/* PRIVATE */}
                          <div
                            onClick={() => setReservationType('PRIVATE')}
                            className={`p-4 rounded-2xl border cursor-pointer space-y-2 transition relative ${
                              reservationType === 'PRIVATE'
                                ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-950/30'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-amber-300 flex items-center gap-2">
                                <Crown className="w-4 h-4 text-amber-400" /> حجز خاص (VIP)
                              </span>
                              {reservationType === 'PRIVATE' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                            </div>
                            <p className="text-[11px] text-slate-300">
                              متابعة خاصة فردية 1-إلى-1 وتفرغ كامل للمُحاضر.
                            </p>
                            <div className="pt-1 text-xs font-black text-amber-400 flex items-center gap-1">
                              <span>5000 {currency}</span>
                              <span className="text-[10px] text-slate-400 font-normal">(حسب الاختيار)</span>
                            </div>
                          </div>

                          {/* LECTURES */}
                          <div
                            onClick={() => setReservationType('LECTURES')}
                            className={`p-4 rounded-2xl border cursor-pointer space-y-2 transition relative ${
                              reservationType === 'LECTURES'
                                ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-blue-300 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-400" /> محاضرات / ورش
                              </span>
                              {reservationType === 'LECTURES' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                            </div>
                            <p className="text-[11px] text-slate-300">
                              حضور محاضرات محددة أو ورش عمل تخصصية.
                            </p>
                            <div className="pt-1 text-xs font-black text-blue-400">
                              {getReservationPrice()} {currency} / محاضرة
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* EXPECTED DURATION SELECTION */}
                      <div className="space-y-3 pt-2">
                        <label className="block text-xs font-bold text-slate-300">المدة المتوقعة للحجز:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { id: '1_LECTURE', label: 'محاضرة واحدة' },
                            { id: '1_MONTH', label: 'شهر واحد (4 أسابيع)' },
                            { id: '3_MONTHS', label: '3 أشهر (ترم كامل)' },
                            { id: '6_MONTHS', label: '6 أشهر (برنامج مكثف)' },
                            { id: 'CUSTOM', label: 'مدة مخصصة' }
                          ].map(dur => (
                            <button
                              key={dur.id}
                              type="button"
                              onClick={() => setExpectedDuration(dur.id)}
                              className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                                expectedDuration === dur.id
                                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {dur.label}
                            </button>
                          ))}
                        </div>

                        {expectedDuration === 'CUSTOM' && (
                          <div className="pt-2">
                            <input
                              type="text"
                              value={customDuration}
                              onChange={(e) => setCustomDuration(e.target.value)}
                              placeholder="اكتب المدة المتوقعة (مثال: أسبوعين / 6 محاضرات)"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        )}
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setBookingStep(1)}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" /> العودة
                        </button>

                        <button
                          type="button"
                          onClick={() => setBookingStep(3)}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <span>المتابعة لاختيار الموعد</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: CLASS SELECTION */}
                  {bookingStep === 3 && (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-400" /> اختر المجموعة والموعد المفضل
                      </h4>

                      {classes.length === 0 ? (
                        <div className="p-4 bg-slate-900 rounded-xl text-xs text-slate-300">
                          سيتم التنسيق معك بخصوص المواعيد المناسبة فور إتمام الطلب.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {classes.map(cls => (
                            <div
                              key={cls.id}
                              onClick={() => setSelectedClassId(cls.id)}
                              className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                                selectedClassId === cls.id
                                  ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="font-bold text-sm text-white">{cls.name}</div>
                              <div className="text-xs text-slate-400">{cls.schedule || 'يومين أسبوعياً'}</div>
                              <div className="text-[11px] text-emerald-400 font-bold">بداية: {cls.startDate || 'قريباً'}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setBookingStep(2)}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" /> العودة
                        </button>

                        <button
                          type="button"
                          onClick={() => setBookingStep(4)}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <span>اختيار طريقة الحضور</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: ATTENDANCE MODE */}
                  {bookingStep === 4 && (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-400" /> طريقة الحضور
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          onClick={() => setAttendanceMode('IN_PERSON')}
                          className={`p-5 rounded-2xl border cursor-pointer space-y-2 transition ${
                            attendanceMode === 'IN_PERSON'
                              ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="font-extrabold text-sm text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-emerald-400" />
                            حضوري في مركز سمارتك
                          </div>
                          <p className="text-xs text-slate-300">
                            {settings.centerAddress}
                          </p>
                        </div>

                        <div
                          onClick={() => setAttendanceMode('ONLINE')}
                          className={`p-5 rounded-2xl border cursor-pointer space-y-2 transition ${
                            attendanceMode === 'ONLINE'
                              ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="font-extrabold text-sm text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-400" />
                            أونلاين تفاعلي
                          </div>
                          <p className="text-xs text-slate-300">
                            منزلية تفاعلية مباشرة عبر زوم والتطبيقات الذكية
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setBookingStep(3)}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" /> العودة
                        </button>

                        <button
                          type="button"
                          onClick={() => setBookingStep(5)}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <span>اختيار طريقة الدفع والإيصال</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: PAYMENT METHOD & PROOF UPLOAD */}
                  {bookingStep === 5 && (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-400" /> طريقة الدفع وإرفاق صورة إيصال التحويل
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
                        {settings.enableInstapay && (
                          <div
                            onClick={() => setPaymentMethod('INSTAPAY')}
                            className={`p-5 rounded-2xl border cursor-pointer space-y-2 transition ${
                              paymentMethod === 'INSTAPAY'
                                ? 'bg-purple-500/10 border-purple-500 text-white shadow-lg'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="font-extrabold text-sm text-purple-300 flex items-center gap-2">
                              ⚡ InstaPay
                            </div>
                            <p className="text-[11px] text-slate-300">
                              تحويل مباشر برقم {settings.instapayNumber}
                            </p>
                          </div>
                        )}

                        {settings.enableVodafoneCash && (
                          <div
                            onClick={() => setPaymentMethod('VODAFONE_CASH')}
                            className={`p-5 rounded-2xl border cursor-pointer space-y-2 transition ${
                              paymentMethod === 'VODAFONE_CASH'
                                ? 'bg-red-500/10 border-red-500 text-white shadow-lg'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="font-extrabold text-sm text-red-300 flex items-center gap-2">
                              📱 Vodafone Cash
                            </div>
                            <p className="text-[11px] text-slate-300">
                              تحويل محفظة فودافون كاش ({settings.vodafoneCashNumber})
                            </p>
                          </div>
                        )}

                        {settings.enablePayInCenter && (
                          <div
                            onClick={() => setPaymentMethod('IN_PERSON')}
                            className={`p-5 rounded-2xl border cursor-pointer space-y-2 transition ${
                              paymentMethod === 'IN_PERSON'
                                ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="font-extrabold text-sm text-emerald-300 flex items-center gap-2">
                              🏢 الدفع بالمركز
                            </div>
                            <p className="text-[11px] text-slate-300">
                              حجز مقدماً والدفع كاش بمقر زيزينيا
                            </p>
                          </div>
                        )}

                      </div>

                      {/* PAYMENT PROOF FILE UPLOAD FOR INSTAPAY & VODAFONE CASH */}
                      {(paymentMethod === 'INSTAPAY' || paymentMethod === 'VODAFONE_CASH') && (
                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                          <label className="block text-xs font-bold text-slate-200">
                            📸 إرفاق صورة إيصال التحويل أو لقطة الشاشة (Screenshot):
                          </label>

                          {paymentProofUrl ? (
                            <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-3 text-center">
                              <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-xs">
                                <CheckCircle2 className="w-4 h-4" /> تم إرفاق صورة الإيصال ({paymentProofFileName})
                              </div>
                              <img
                                src={paymentProofUrl}
                                alt="إيصال التحويل"
                                className="max-h-36 mx-auto rounded-xl border border-slate-800 object-contain shadow-md"
                              />
                              <button
                                type="button"
                                onClick={() => { setPaymentProofUrl(''); setPaymentProofFileName(''); }}
                                className="text-xs text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                              >
                                حذف الصورة وإعادة الرفع
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center p-6 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-emerald-500 rounded-2xl cursor-pointer transition">
                              <Upload className="w-8 h-8 text-emerald-400 mb-2" />
                              <span className="text-xs font-extrabold text-white">اضغط هنا لاختيار صورة إيصال التحويل</span>
                              <span className="text-[10px] text-slate-400 pt-1">يدعم JPG, PNG (حد أقصى 5 ميجابايت)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )}

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setBookingStep(4)}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" /> العودة
                        </button>

                        <button
                          type="button"
                          onClick={() => setBookingStep(6)}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <span>مراجعة الطلب والتأكيد</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: REVIEW & SUBMIT */}
                  {bookingStep === 6 && (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" /> مراجعة إجمالي الحجز والتأكيد
                      </h4>

                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">اسم الطالب / العميل:</span>
                          <span className="font-bold text-white">{customerName} {childName ? `(${childName})` : ''}</span>
                        </div>

                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">رقم التواصل والواتساب:</span>
                          <span className="font-mono text-emerald-400">{phone}</span>
                        </div>

                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">الكورس المطلوب:</span>
                          <span className="font-bold text-white">{getLocalized(course, 'title')}</span>
                        </div>

                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">نوع الحجز:</span>
                          <span className="font-bold text-amber-300">{getReservationTypeLabel()}</span>
                        </div>

                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">المدة المتوقعة:</span>
                          <span className="font-bold text-emerald-300">{getDurationLabel()}</span>
                        </div>

                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">طريقة الحضور:</span>
                          <span className="font-bold text-white">{attendanceMode === 'IN_PERSON' ? 'حضوري بالمركز' : 'أونلاين'}</span>
                        </div>

                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">طريقة الدفع المختارة:</span>
                          <span className="font-bold text-purple-300">
                            {paymentMethod === 'INSTAPAY' ? 'InstaPay' : paymentMethod === 'VODAFONE_CASH' ? 'Vodafone Cash' : 'الدفع في المركز'}
                          </span>
                        </div>

                        {paymentProofUrl && (
                          <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-400">صورة إيصال التحويل:</span>
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> مرفقة بنجاح
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between pt-2 text-sm font-black">
                          <span className="text-white">إجمالي المستحق:</span>
                          <span className="text-emerald-400 text-lg">{calculateTotal()} {currency}</span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setBookingStep(5)}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" /> التعديل
                        </button>

                        <button
                          id="confirm-booking-whatsapp-button"
                          type="button"
                          onClick={() => handleSubmitBooking()}
                          disabled={isSubmitting}
                          className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-sm flex items-center gap-2 shadow-xl shadow-emerald-900/30 disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          {isSubmitting ? 'جاري تسجيل الحجز...' : 'تأكيد الحجز واستخراج الرقم الرسمي 🎉'}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* CONFIRMATION & WHATSAPP ACTION CARD */
                <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-emerald-500/30 space-y-6 animate-fadeIn">
                  
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-white">تم تسجيل طلب حجزك بنجاح! 🎉</h3>
                    
                    <div className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-2xl font-mono text-2xl font-black text-emerald-400 shadow-lg">
                      رقم الحجز: ST-{bookingId}
                    </div>

                    <p className="text-xs text-slate-300 max-w-md mx-auto pt-1">
                      اضغط على الزر بالأسفل لإرسال كافة تفاصيل ورقم الحجز وصورة الإيصال مباشرة عبر الواتساب لتأكيد التسجيل.
                    </p>
                  </div>

                  {/* WHATSAPP ACTION BUTTON */}
                  <div className="p-6 bg-slate-900 border border-emerald-500/40 rounded-3xl space-y-4 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => sendFullDetailsToWhatsApp()}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40 transition cursor-pointer"
                    >
                      <MessageCircle className="w-6 h-6" />
                      إرسال تفاصيل الحجز والرقم إلى الواتساب فوراً 🚀
                    </button>

                    <div className="text-xs text-slate-300 space-y-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right">
                      <p className="font-bold text-white mb-1">ملخص تفاصيل حجزك:</p>
                      <p>• الكورس: <span className="font-bold text-emerald-300">{getLocalized(course, 'title')}</span></p>
                      <p>• نوع الحجز: <span className="font-bold text-amber-300">{getReservationTypeLabel()}</span></p>
                      <p>• المدة المتوقعة: <span className="font-bold text-slate-200">{getDurationLabel()}</span></p>
                      <p>• المبلغ المستحق: <span className="font-bold text-emerald-400">{calculateTotal()} {currency}</span></p>
                      {paymentProofUrl && (
                        <p className="text-emerald-400 font-bold pt-1">✓ تم إرفاق صورة إيصال الدفع بنجاح</p>
                      )}
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs text-slate-400 hover:text-white font-bold underline cursor-pointer"
                    >
                      إغلاق النافذة
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </motion.div>

      {/* Auth Gate Modal Integration */}
      <AuthGateModal
        isOpen={gateModalOpen}
        onClose={() => setGateModalOpen(false)}
        onOpenAuth={(role) => {
          setGateModalOpen(false);
          if (onOpenAuth) onOpenAuth(role);
        }}
        onBookCourse={() => {
          setGateModalOpen(false);
          setActiveTab('booking');
        }}
        title={gateTitle}
        description={gateDescription}
        isNotEnrolledUser={isNotEnrolledGate}
      />
    </div>
  );
};
