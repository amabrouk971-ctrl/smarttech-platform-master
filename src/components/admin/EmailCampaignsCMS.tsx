import React, { useState, useEffect } from 'react';
import { EmailCampaign, EmailLog, RecipientType } from '../../types';
import { fetchEmailCampaigns, saveEmailCampaign, sendCampaign, resolveRecipientEmails, fetchEmailLogs, deleteCampaign, interpolateEmailVariables } from '../../services/emailService';
import { Mail, Plus, Send, Calendar, Users, Eye, CheckCircle, AlertTriangle, RefreshCw, Trash2, Smartphone, Monitor, Code, Image as ImageIcon } from 'lucide-react';

export const EmailCampaignsCMS: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'logs'>('campaigns');

  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [recipientCountEstimate, setRecipientCountEstimate] = useState<number>(0);
  const [confirmSendModal, setConfirmSendModal] = useState<EmailCampaign | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [formData, setFormData] = useState<Partial<EmailCampaign>>({
    name: '',
    subject: '',
    senderName: 'SmartTech Academy',
    senderEmail: 'info@smarttech.edu',
    recipientType: 'ALL_STUDENTS',
    templateHtml: `
<div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #0f172a; padding: 24px; text-align: center;">
      <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">SmartTech Academy</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #0f172a; margin-top: 0;">مرحباً {{fullName}} 👋</h2>
      <p style="color: #475569; line-height: 1.6; font-size: 16px;">
        يسرنا إعلامكم ببدء التسجيل في أحدث الكورسات والبرامج التدريبية المتاحة حصرياً لدى أسرع أكاديمية تكنولوجية.
      </p>
      <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #4f46e5; margin: 0 0 8px 0;">{{courseName}}</h3>
        <p style="margin: 0; color: #64748b;">السعر الأساسي: <del>{{coursePrice}}</del> | السعر بعد الخصم: <strong style="color: #10b981;">{{discountedPrice}}</strong></p>
      </div>
      <div style="text-align: center; margin-top: 32px;">
        <a href="https://smarttech.edu" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">تصفح الكورسات والاحجز الآن</a>
      </div>
    </div>
    <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
      © SmartTech Academy - جميع الحقوق محفوظة
    </div>
  </div>
</div>
    `,
    status: 'DRAFT'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    updateRecipientEstimate();
  }, [formData.recipientType, formData.targetIds, formData.customEmails]);

  const loadData = async () => {
    setLoading(true);
    const cData = await fetchEmailCampaigns();
    const lData = await fetchEmailLogs();
    setCampaigns(cData);
    setLogs(lData);
    setLoading(false);
  };

  const updateRecipientEstimate = async () => {
    if (formData.recipientType) {
      const resolved = await resolveRecipientEmails(formData.recipientType, formData.targetIds, formData.customEmails);
      setRecipientCountEstimate(resolved.length);
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject) {
      alert('يرجى كتابة اسم الحملة وموضوع الرسالة');
      return;
    }

    await saveEmailCampaign({
      ...formData,
      id: editingCampaign?.id,
      name: formData.name!,
      subject: formData.subject!,
      recipientCount: recipientCountEstimate
    });

    setShowModal(false);
    setEditingCampaign(null);
    loadData();
  };

  const handleExecuteSend = async (campaign: EmailCampaign) => {
    setIsSending(true);
    try {
      const result = await sendCampaign(campaign.id);
      alert(`تم إرسال الحملة بنجاح إلى ${result.successCount} مستقبل.`);
      setConfirmSendModal(null);
      loadData();
    } catch (err: any) {
      alert(`حدث خطأ أثناء الإرسال: ${err?.message || 'تعذر الإرسال'}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت تأكد من حذف هذه الحملة الإعلانية؟')) {
      await deleteCampaign(id);
      loadData();
    }
  };

  const insertVariable = (varName: string) => {
    setFormData(prev => ({
      ...prev,
      templateHtml: (prev.templateHtml || '') + ` {{${varName}}} `
    }));
  };

  const variablesList = [
    'firstName', 'lastName', 'fullName', 'email', 
    'courseName', 'coursePrice', 'discount', 'discountedPrice', 
    'offerName', 'offerEndDate', 'bookingId', 'studentName', 
    'centerName', 'supportEmail'
  ];

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">جاري تحميل نظام الحملات البريدية...</div>;

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 font-bold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mb-2">
            <Mail className="w-4 h-4" /> AUTOMATION CENTER EMAIL CAMPAIGNS
          </span>
          <h2 className="text-2xl font-black">حملات البريد الإلكتروني القابلة للأتمتة</h2>
          <p className="text-xs text-slate-400 mt-1">أنشئ ورسائل بريد HTML احترافية واستهدف الموظفين، الطلاب، وأولياء الأمور مباشرة.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'campaigns' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              الحملات ({campaigns.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              سجلات الإرسال ({logs.length})
            </button>
          </div>

          <button
            onClick={() => {
              setEditingCampaign(null);
              setFormData({
                name: 'حملة ترويجية جديدة',
                subject: 'تحديثات هامة وعروض حصرية من SmartTech',
                senderName: 'SmartTech Academy',
                senderEmail: 'info@smarttech.edu',
                recipientType: 'ALL_STUDENTS',
                templateHtml: formData.templateHtml,
                status: 'DRAFT'
              });
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-5 h-5" /> إنشاء حملة بريدية جديدة
          </button>
        </div>
      </div>

      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(camp => (
            <div key={camp.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    camp.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                    camp.status === 'SENDING' ? 'bg-amber-500/20 text-amber-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {camp.status === 'SENT' ? 'تم الإرسال بنجاح' : camp.status === 'SENDING' ? 'جاري الإرسال...' : 'مسودة'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{new Date(camp.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">{camp.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">الموضوع: {camp.subject}</p>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">الفئة المستهدفة:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{camp.recipientType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">عدد المستقبلين:</span>
                    <span>{camp.recipientCount} مستقبل</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => setConfirmSendModal(camp)}
                  disabled={camp.status === 'SENDING'}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> إرسال الآن
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingCampaign(camp);
                      setFormData(camp);
                      setShowModal(true);
                    }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(camp.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {campaigns.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 font-bold border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              لا توجد أية حملات بريدية حتى الآن. أنشئ حملتك الأولى الآن!
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-black text-sm text-slate-900 dark:text-white">
            سجل إرسال الرسائل الإلكترونية بالكامل (Email Dispatch Logs)
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">البريد المستقبل</th>
                  <th className="p-3">اسم المستقبل</th>
                  <th className="p-3">موضوع الرسالة</th>
                  <th className="p-3">حالة الإرسال</th>
                  <th className="p-3">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 text-indigo-600 dark:text-indigo-400 font-mono">{log.recipientEmail}</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">{log.recipientName || '-'}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{log.subject}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        log.status === 'SENT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status === 'SENT' ? 'تم الإرسال' : 'فشل'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono">{new Date(log.sentAt).toLocaleString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl p-6 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto text-right dir-rtl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" />
                {editingCampaign ? 'تعديل الحملة البريدية' : 'مصمم رسائل HTML والحملات البريدية'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">اسم الحملة الداخلي</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: حملة الموظفين - إعلان هدايا التفوق"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">عنوان بريد الموضوع (Email Subject)</label>
                  <input
                    type="text"
                    required
                    value={formData.subject || ''}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="تحديثات هامة بخصوص عروض SmartTech"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">تحديد فئة المستقبلين</label>
                  <select
                    value={formData.recipientType}
                    onChange={e => setFormData({ ...formData, recipientType: e.target.value as RecipientType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                  >
                    <option value="ALL_STAFF">جميع فريق العمل (All Staff)</option>
                    <option value="ALL_EMPLOYEES">جميع الموظفين (All Employees)</option>
                    <option value="ALL_TEACHERS">جميع المعلمين (All Teachers)</option>
                    <option value="ALL_STUDENTS">جميع الطلاب (All Students)</option>
                    <option value="ALL_PARENTS">جميع أولياء الأمور (All Parents)</option>
                    <option value="CUSTOM_LIST">قائمة بريد إلكتروني مخصصة</option>
                  </select>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] text-indigo-600 dark:text-indigo-400">عدد المستقبلين التقديري:</span>
                    <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">{recipientCountEstimate} مستلم</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Variables Picker Chips */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5">إدراج متغيرات مخصصة تلقائياً (Variables)</label>
                <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {variablesList.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-indigo-600 hover:text-white border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-mono transition"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* HTML Editor & Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Code className="w-4 h-4 text-indigo-500" /> كود HTML قالب الرسالة
                    </label>
                  </div>
                  <textarea
                    value={formData.templateHtml || ''}
                    onChange={e => setFormData({ ...formData, templateHtml: e.target.value })}
                    className="w-full h-80 bg-slate-950 text-slate-100 font-mono text-[11px] p-3 rounded-xl border border-slate-800 dir-ltr text-left focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Eye className="w-4 h-4 text-emerald-500" /> المعاينة المباشرة (Live Preview)
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`mx-auto bg-white rounded-xl border border-slate-300 overflow-hidden shadow-inner h-80 overflow-y-auto ${
                    previewDevice === 'mobile' ? 'max-w-[320px]' : 'w-full'
                  }`}>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: interpolateEmailVariables(formData.templateHtml || '', { fullName: 'أحمد محمود' }) 
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  حفظ المسودة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Bulk Send Modal */}
      {confirmSendModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 text-center dir-rtl">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">تأكيد إرسال الحملة البريدية</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                أنت على وشك إرسال هذه الرسالة إلى <strong className="text-amber-500 font-black">{confirmSendModal.recipientCount}</strong> مستلم من قاعدة البيانات.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 text-right">
              <div>الموضوع: {confirmSendModal.subject}</div>
              <div>الفئة المستهدفة: {confirmSendModal.recipientType}</div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSendModal(null)}
                className="w-1/2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={() => handleExecuteSend(confirmSendModal)}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition flex items-center justify-center gap-2"
              >
                {isSending ? 'جاري الإرسال...' : 'CONFIRM SEND'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
