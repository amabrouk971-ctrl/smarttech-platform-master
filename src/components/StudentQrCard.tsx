import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface StudentQrCardProps {
  studentName: string;
  studentId: string;
  courseTitle?: string;
  userRole?: string;
  roleTitle?: string;
}

export const StudentQrCard: React.FC<StudentQrCardProps> = ({
  studentName,
  studentId,
  courseTitle = 'مسار مبرمج المستقبل',
  userRole = 'STUDENT',
  roleTitle
}) => {
  const isTeacher = userRole === 'TEACHER';
  const displayRoleTitle = roleTitle || (isTeacher ? 'مدرب ومعلم معتمد' : 'طالب أكاديمية سمارتك');

  const qrData = JSON.stringify({
    studentId,
    studentName,
    userRole,
    platform: 'SmartTech Academy'
  });

  return (
    <div className={`p-6 rounded-3xl border-2 shadow-2xl space-y-4 max-w-sm mx-auto dir-rtl text-right ${
      isTeacher 
        ? 'bg-slate-950 text-white border-amber-500/50 shadow-amber-500/10' 
        : 'bg-slate-900 text-white border-slate-800'
    }`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white ${
            isTeacher ? 'bg-amber-600' : 'bg-red-600'
          }`}>
            S
          </div>
          <div>
            <span className="font-extrabold text-xs text-white block leading-none">SmartTech ID Card</span>
            <span className={`text-[10px] font-bold ${isTeacher ? 'text-amber-400' : 'text-slate-400'}`}>
              {isTeacher ? 'بطاقة اعتمادات وحضور المدرب' : 'كود الحضور المعتمد'}
            </span>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 font-mono font-bold text-[10px] rounded-full border ${
          isTeacher 
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          {isTeacher ? 'كود مدرب معتمد' : 'نشط 2026'}
        </span>
      </div>

      <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-inner">
        <QRCodeSVG value={qrData} size={180} level="H" includeMargin={true} />
      </div>

      <div className="text-center space-y-1">
        <h4 className="font-black text-lg text-white">{studentName}</h4>
        <p className="text-xs font-mono text-amber-400 font-bold">{studentId}</p>
        <p className="text-[11px] text-slate-300 font-semibold">{displayRoleTitle}</p>
        <p className="text-[10px] text-slate-400">{courseTitle}</p>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> توثيق آمن بـ QR
        </span>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition text-white"
        >
          <Download className="w-3.5 h-3.5" /> طباعة البطاقة
        </button>
      </div>
    </div>
  );
};
