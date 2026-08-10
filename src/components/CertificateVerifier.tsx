import React, { useState } from 'react';
import { Award, Search, CheckCircle2, XCircle, ShieldCheck, Download, Share2 } from 'lucide-react';

export const CertificateVerifier: React.FC = () => {
  const [certCode, setCertCode] = useState('CERT-SMART-2026-901');
  const [certData, setCertData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certCode.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setCertData(null);

    try {
      const response = await fetch(`/api/certificates/verify/${encodeURIComponent(certCode)}`);
      const data = await response.json();

      if (data.valid) {
        setCertData(data.certificate);
      } else {
        setErrorMsg('رمز الشهادة غير مدون في السجل المعتمد. يرجى مراجعة إدارة سمارتك.');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white dir-rtl text-right">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/30">
            SmartTech Official Verification System
          </span>
          <h2 className="text-3xl font-black">التحقق المباشر من صحة واعتماد الشهادات</h2>
          <p className="text-xs text-slate-400">
            أدخل كود الشهادة الفريد المطبوع على الشهادة المعتمدة للتحقق من بيانات الطالب والتأكد من توثيقها.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="text"
            value={certCode}
            onChange={(e) => setCertCode(e.target.value)}
            placeholder="مثال: CERT-SMART-2026-901"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-mono text-amber-300 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'جاري الفحص...' : 'فحص الشهادة 🔍'}</span>
          </button>
        </form>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs font-bold text-center max-w-xl mx-auto flex items-center justify-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Verified Certificate Card Preview */}
        {certData && (
          <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-2xl space-y-6 max-w-2xl mx-auto relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <ShieldCheck className="w-6 h-6" />
                <span>شهادة موثوقة وموثقة بسجلات SmartTech</span>
              </div>
              <span className="font-mono text-xs text-amber-400 font-bold">
                {certData.certificateCode}
              </span>
            </div>

            <div className="space-y-4 text-center py-2">
              <Award className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
              <div className="space-y-1">
                <span className="text-xs text-slate-400">تشهد إدارة مراكز SmartTech بأن الطالب/ـة:</span>
                <h3 className="text-2xl font-black text-white">{certData.studentNameAr}</h3>
                <span className="text-xs text-slate-400 block font-mono">{certData.studentNameEn}</span>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1 text-xs">
                <span className="text-slate-400">قد أتم/ـت بنجاح متطلبات:</span>
                <h4 className="font-extrabold text-amber-400 text-base">{certData.courseTitleAr}</h4>
                <p className="text-slate-300 font-bold">{certData.pathTitleAr}</p>
              </div>

              <div className="flex justify-around text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span>تاريخ الإصدار:</span>
                  <span className="block text-slate-200 font-bold">{certData.issueDate}</span>
                </div>
                <div>
                  <span>الجهة المصدرة:</span>
                  <span className="block text-slate-200 font-bold">SmartTech Alexandria</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> طباعة النسخة الرسمية PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
