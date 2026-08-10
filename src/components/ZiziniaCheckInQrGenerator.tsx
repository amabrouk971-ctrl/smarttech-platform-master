import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  MapPin,
  Clock,
  CheckCircle2,
  RefreshCw,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Building2,
  Navigation,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ZiziniaCheckInQrGeneratorProps {
  studentName: string;
  studentId: string;
  courseTitle?: string;
  onAwardXp?: (amount: number) => void;
}

export const ZiziniaCheckInQrGenerator: React.FC<ZiziniaCheckInQrGeneratorProps> = ({
  studentName,
  studentId,
  courseTitle = 'دورة الروبوتات والذكاء الاصطناعي',
  onAwardXp
}) => {
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString());
  const [copied, setCopied] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const formattedDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Unique QR check-in payload for Zizinia branch
  const checkInPayload = JSON.stringify({
    type: 'SMARTTECH_ATTENDANCE_CHECKIN',
    branch: 'Zizinia_Alexandria',
    branchNameAr: 'فرع زيزينيا — الإسكندرية (المقر الرئيسي)',
    studentId,
    studentName,
    courseTitle,
    generatedAt: timestamp,
    verificationCode: `ZIZ-${studentId}-${Date.now().toString(36).toUpperCase()}`
  });

  const handleGenerateNewCode = () => {
    setTimestamp(new Date().toISOString());
    setIsCheckedIn(false);
  };

  const handleSimulateCheckIn = () => {
    setIsCheckedIn(true);
    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    setCheckInTime(nowTime);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    if (onAwardXp) {
      onAwardXp(100); // 100 XP bonus for attending in Zizinia!
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(checkInPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsZiziniaUrl = 'https://www.google.com/maps/place/%D8%B3%D9%85%D8%A7%D8%B1%D8%AA%D9%83+%D9%84%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8+%D8%A7%D9%84%D9%8AA%D8%AA%D8%B7%D9%88%D8%B1%E2%80%AD%E2%80%AD/@31.2401598,29.9635953,17z/data=!4m2!3m1!1s0x14f5c513a27e37ed:0xee5386b29ced202e';

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-6 dir-rtl text-right max-w-md mx-auto relative overflow-hidden">
      {/* Header Accent Glow */}
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500" />

      {/* Title & Branch info */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 font-extrabold text-[10px] border border-red-500/30 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              فرع زيزينيا - الإسكندرية
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] border border-amber-500/20">
              المقر الرئيسي
            </span>
          </div>
          <h3 className="font-black text-lg text-white">توليد كود الحضور الذكي بـ QR</h3>
          <p className="text-xs text-slate-400">
            امسح هذا الكود عند جهاز الاستقبال بفرع زيزينيا لتأكيد حضورك وتوثيق الجلسة
          </p>
        </div>

        <div className="p-3 bg-red-600/10 border border-red-500/30 rounded-2xl shrink-0 text-red-500">
          <QrCode className="w-6 h-6" />
        </div>
      </div>

      {/* Attendance Status Banner */}
      {isCheckedIn ? (
        <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between gap-3 text-emerald-300 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-black text-sm">تم تأكيد الحضور بفرع زيزينيا! 🥳</h4>
              <p className="text-[11px] text-emerald-200">
                تم تسجيل الحضور في تمام الساعة {checkInTime} (+100 XP مكافأة حضور)
              </p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
        </div>
      ) : (
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>تاريخ الجلسة: <strong className="text-white">{formattedDate}</strong></span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{formattedTime}</span>
        </div>
      )}

      {/* QR Code Container */}
      <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-inner relative group">
        <QRCodeSVG
          value={checkInPayload}
          size={200}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: '/favicon.ico',
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />

        <div className="text-center space-y-0.5 dir-ltr">
          <p className="text-[11px] font-mono font-bold text-slate-800">
            ST-ZIZ-{studentId.replace('ST-', '')}
          </p>
          <span className="text-[9px] text-slate-500 font-semibold block dir-rtl">
            كود مشفر خاص بطالب أكاديمية سمارتك
          </span>
        </div>
      </div>

      {/* Student Details Card */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">اسم الطالب:</span>
          <strong className="text-white font-extrabold">{studentName}</strong>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">رقم الطالب:</span>
          <strong className="text-amber-400 font-mono">{studentId}</strong>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">الكورس / المسار:</span>
          <strong className="text-slate-200">{courseTitle}</strong>
        </div>
        <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-500" /> عنوان المقر:
          </span>
          <a
            href={googleMapsZiziniaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 font-bold underline flex items-center gap-1"
          >
            <span>زيزينيا، الإسكندرية</span>
            <Navigation className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Control Actions */}
      <div className="space-y-2">
        {!isCheckedIn ? (
          <button
            type="button"
            onClick={handleSimulateCheckIn}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>محاكاة مسح الكود وتسجيل الحضور بفرع زيزينيا (+100 XP) 📍</span>
          </button>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleGenerateNewCode}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>تحديث كود اليوم</span>
          </button>

          <button
            type="button"
            onClick={handleCopyPayload}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>نسخ الكود</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>طباعة بطاقة تصريح الحضور بفرع زيزينيا</span>
        </button>
      </div>
    </div>
  );
};
