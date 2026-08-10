import React, { useState, useEffect } from 'react';
import { Award, Search, CheckCircle2, XCircle, ShieldCheck, Download, Share2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { verifyCertificateByCodeOrId } from '../services/firebaseService';
import { Certificate } from '../types';

export const CertificateVerifier: React.FC = () => {
  const [certCode, setCertCode] = useState('ST-2026-10001');
  const [certData, setCertData] = useState<Certificate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if URL has ?id= parameter
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id') || urlParams.get('cert') || urlParams.get('code');
    if (queryId) {
      setCertCode(queryId);
      doVerify(queryId);
    }
  }, []);

  const doVerify = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setCertData(null);

    try {
      const res = await verifyCertificateByCodeOrId(codeToVerify);

      if (res.valid && res.certificate) {
        setCertData(res.certificate);
      } else if (res.isRevoked) {
        setErrorMsg(`شهادة ملغاة رسمياً! ${res.message || 'تم إلغاء الاعتماد بالسجلات الرسمية.'}`);
      } else {
        setErrorMsg('رمز الشهادة غير مدون بالسجل المعتمد لمركز SmartTech. يرجى مراجعة الإدارة.');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء الاتصال بسجلات Firestore للشهادات.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doVerify(certCode);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white dir-rtl text-right min-h-[70vh] flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/30">
            SmartTech Official Verification System
          </span>
          <h2 className="text-3xl sm:text-4xl font-black">التحقق المباشر من صحة واعتماد الشهادات</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            أدخل كود الشهادة الفريد، الرقم التسلسلي، أو مفتاح التوثيق المطبوع على الشهادة للتأكد الفوري من مطابقتها للسجلات الرسمية.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="text"
            value={certCode}
            onChange={(e) => setCertCode(e.target.value)}
            placeholder="أدخل رقم الشهادة أو السيريال..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm font-mono text-amber-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'جاري الفحص بالسجلات...' : 'فحص وتوثيق 🔍'}</span>
          </button>
        </form>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs font-bold text-center max-w-xl mx-auto flex items-center justify-center gap-2 shadow-2xl">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Verified Certificate Card Preview */}
        {certData && (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/60 shadow-2xl space-y-6 max-w-2xl mx-auto relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <ShieldCheck className="w-6 h-6" />
                <span>شهادة معتمدة وموثقة بسجلات SmartTech</span>
              </div>
              <span className="font-mono text-xs text-amber-400 font-bold">
                {certData.certificateNumber}
              </span>
            </div>

            <div className="space-y-4 text-center py-2">
              <Award className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
              <div className="space-y-1">
                <span className="text-xs text-slate-400">تشهد إدارة مراكز SmartTech بأن الطالب/ـة:</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{certData.studentNameAr || certData.studentName}</h3>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
                <span className="text-slate-400">قد أتم/ـت بنجاح متطلبات الكورس المعتمد:</span>
                <h4 className="font-extrabold text-amber-400 text-base">{certData.courseTitleAr || certData.courseName}</h4>
                <p className="text-slate-300 font-bold">النتيجة والتقدير: <span className="text-emerald-400 font-mono">{certData.result} ({certData.score || '100%'})</span></p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-right text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">الرقم التسلسلي Serial:</span>
                  <span className="text-cyan-400 font-bold">{certData.serialNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">مفتاح التوثيق Key:</span>
                  <span className="text-slate-300 font-bold">{certData.verificationId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">تاريخ الإصدار:</span>
                  <span className="text-white font-bold">{certData.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">اسم المحاضر / المدرب:</span>
                  <span className="text-white font-bold">{certData.instructorName || 'م. سمارتك'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> طباعة وثيقة الاعتماد PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
