import React, { useState, useRef, useEffect } from 'react';
import { User, AttendanceRecord, Course } from '../../types';
import { recordQrAttendance, fetchAttendanceRecords } from '../../services/attendanceService';
import { QrCode, Camera, CheckCircle2, AlertCircle, RefreshCw, UserCheck, ShieldAlert, Smartphone, Clock, Search } from 'lucide-react';

interface QrAttendanceScannerProps {
  currentUser: User;
  courses: Course[];
}

export const QrAttendanceScanner: React.FC<QrAttendanceScannerProps> = ({
  currentUser,
  courses
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [lastScannedResult, setLastScannedResult] = useState<{ success: boolean; message: string; studentName?: string } | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL_COURSES');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadRecords();
    return () => {
      stopCamera();
    };
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const data = await fetchAttendanceRecords();
    setRecords(data);
    setLoading(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setLastScannedResult(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('متصفحك لا يدعم فتح الكاميرا المباشرة. يمكنك استخدام الإدخال اليدوي أدناه.');
      return;
    }

    try {
      // Explicit permission request
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera permission denied or unavailable:', err);
      setCameraError('تم رفض الإذن بفتح الكاميرا أو لا توجد كاميرا متصلة. يرجى إدخال كود الطالب يدوياً.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleProcessScan = async (token: string) => {
    if (!token.trim()) return;

    const res = await recordQrAttendance({
      qrToken: token.trim(),
      scannerUser: currentUser,
      courseId: selectedCourseId !== 'ALL_COURSES' ? selectedCourseId : undefined
    });

    setLastScannedResult(res);
    if (res.success) {
      setManualToken('');
      loadRecords();
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mb-2">
            <QrCode className="w-4 h-4" /> QR SCANNER & ATTENDANCE LOGS
          </span>
          <h2 className="text-2xl font-black">ماسح QR لتسجيل حضور الطلاب أوتوماتيكياً</h2>
          <p className="text-xs text-slate-400 mt-1">تأكيد حضور الطلاب بالكاميرا مع التوثيق المباشر وإرسال إشعارات فورية لولياء الأمور.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold p-2.5 rounded-xl"
          >
            <option value="ALL_COURSES">جميع الكورسات القائمة</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.titleAr}</option>
            ))}
          </select>

          <button onClick={loadRecords} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Camera / Manual Input Area */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xl">
          <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-500" /> مسح كود QR أو إدخال الرقم
          </h3>

          {cameraError && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs rounded-2xl flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Camera Viewfinder */}
          <div className="relative bg-slate-950 rounded-2xl h-64 overflow-hidden flex flex-col items-center justify-center border border-slate-800">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {!isCameraActive && (
              <div className="text-center p-6 space-y-3">
                <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-bold">انقر أدناه لفتح كاميرا ماسح QR مع طلب الإذن المباشر</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
                >
                  تشغيل كاميرا الماسح الضوئي
                </button>
              </div>
            )}

            {isCameraActive && (
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-slate-900/80 backdrop-blur p-2 rounded-xl text-xs text-white font-bold">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> الكاميرا تعمل
                </span>
                <button onClick={stopCamera} className="px-3 py-1 bg-red-600 text-white rounded-lg text-[10px]">
                  إيقاف الكاميرا
                </button>
              </div>
            )}
          </div>

          {/* Manual Input Fallback */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              إدخال كود الـ QR أو رقم الطالب يدوياً
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={e => setManualToken(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleProcessScan(manualToken)}
                placeholder="مثال: QR-STU-1002"
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-mono text-xs font-bold"
              />
              <button
                type="button"
                onClick={() => handleProcessScan(manualToken)}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
              >
                تسجيل
              </button>
            </div>
          </div>

          {/* Scan Result Feedback Banner */}
          {lastScannedResult && (
            <div className={`p-4 rounded-2xl border text-xs font-bold space-y-1 ${
              lastScannedResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-700 dark:text-rose-300'
            }`}>
              <div className="flex items-center gap-2 text-sm font-black">
                {lastScannedResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
                <span>{lastScannedResult.success ? 'تم تأكيد الحضور' : 'خطأ في عملية المسح'}</span>
              </div>
              <p>{lastScannedResult.message}</p>
            </div>
          )}
        </div>

        {/* Attendance Log Table Column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-black text-sm text-slate-900 dark:text-white flex justify-between items-center">
            <span>سجل الحضور المسجل بالـ QR</span>
            <span className="text-xs text-slate-400 font-mono font-bold">{records.length} طالب</span>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">الكورس</th>
                  <th className="p-3">طريقة المسح</th>
                  <th className="p-3">المسؤول عن المسح</th>
                  <th className="p-3">وقت الحضور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 text-slate-900 dark:text-white font-black">{r.studentName}</td>
                    <td className="p-3 text-indigo-600 dark:text-indigo-400">{r.courseName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-md text-[10px]">
                        {r.method}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{r.scannerUserName}</td>
                    <td className="p-3 text-slate-400 font-mono">{new Date(r.checkInTime).toLocaleTimeString('ar-EG')}</td>
                  </tr>
                ))}

                {records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                      لا يوجد حضور مسجل اليوم حتى الآن.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
