import React, { useState, useEffect } from 'react';
import { fetchAuditLogsFromFirestore } from '../../services/firebaseService';
import { Activity, ShieldCheck, RefreshCw, FileText } from 'lucide-react';

export const AuditLogsCMS: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = async () => {
    setLoading(true);
    const auditData = await fetchAuditLogsFromFirestore();
    setLogs(auditData);
    setLoading(false);
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white flex items-center justify-between shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 border border-red-500/30">
            <ShieldCheck className="w-4 h-4" /> SmartTech Audit Trail
          </span>
          <h2 className="text-2xl font-black mt-1">سجلات التدقيق والأمان المتقدمة (Audit Logs)</h2>
          <p className="text-xs text-slate-400">توثيق زمني كامل لكل العمليات الحساسة، التعديلات، وعمليات الاعتماد بالنظام.</p>
        </div>

        <button
          onClick={loadAuditLogs}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" /> تحديث السجلات
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-400 font-bold text-center py-8">جاري تحميل سجلات الأمان والتدقيق...</p>
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold text-center py-8">لا توجد سجلات تدقيق مسجلة حتى الآن.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="p-3">الوقت والمنطقة</th>
                  <th className="p-3">المنفذ (Actor)</th>
                  <th className="p-3">الإجراء (Action)</th>
                  <th className="p-3">الهدف (Target)</th>
                  <th className="p-3">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {logs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="p-3 text-slate-400 font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleString('ar-EG')}
                    </td>
                    <td className="p-3">
                      <div className="text-slate-900 dark:text-white">{log.actorName}</div>
                      <div className="text-[10px] text-amber-500 font-mono">{log.actorRole}</div>
                    </td>
                    <td className="p-3 text-red-600 dark:text-red-400 font-extrabold">{log.action}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {log.targetType}: <span className="font-mono text-[10px]">{log.targetId}</span>
                    </td>
                    <td className="p-3 text-[10px] text-slate-400 font-mono">
                      {log.details ? JSON.stringify(log.details).substring(0, 50) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
