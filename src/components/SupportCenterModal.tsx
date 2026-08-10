import React, { useState, useEffect } from 'react';
import { User, TicketCategory, TicketPriority, SupportTicket, SupportMessage } from '../types';
import { createSupportTicket, fetchUserSupportTickets, subscribeToSupportMessages, sendSupportMessage } from '../services/supportService';
import { createBugReport } from '../services/bugService';
import { VoiceMessageRecorder } from './VoiceMessageRecorder';
import { Headphones, Bug, Send, X, Plus, Clock, MessageSquare, AlertCircle, FileText, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface SupportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const SupportCenterModal: React.FC<SupportCenterModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'tickets' | 'bug'>('create');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  // Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<TicketCategory>('GENERAL');
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('MEDIUM');
  const [ticketMessage, setTicketMessage] = useState('');
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Bug Form
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugSteps, setBugSteps] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      loadTickets();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (selectedTicket) {
      const unsub = subscribeToSupportMessages(selectedTicket.id, (msgs) => setMessages(msgs));
      return () => unsub();
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    if (!currentUser) return;
    const userTickets = await fetchUserSupportTickets(currentUser.id);
    setTickets(userTickets);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || (!ticketMessage && !voiceUrl)) {
      alert('يرجى ملء موضوع و تفاصيل طلب الدعم');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticketId = await createSupportTicket({
        userId: currentUser.id,
        userName: currentUser.name || currentUser.fullName || 'طالب SmartTech',
        userEmail: currentUser.email,
        userPhone: currentUser.phone || '',
        userRole: currentUser.role,
        subject: ticketSubject,
        category: ticketCategory,
        priority: ticketPriority,
        messageText: ticketMessage,
        voiceUrl: voiceUrl || undefined,
        voiceDurationSeconds: voiceDuration || undefined
      });

      setSuccessMsg(`تم إنشاء طلب الدعم بنجاح! رقم الطلب: ${ticketId}`);
      setTicketSubject('');
      setTicketMessage('');
      setVoiceUrl(null);
      loadTickets();
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveTab('tickets');
      }, 2000);
    } catch (err: any) {
      alert(`حدث خطأ: ${err?.message || 'تعذر إنشاء التذكرة'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle || !bugDescription) {
      alert('يرجى ملء عنوان و تفاصيل العطل البرمجي');
      return;
    }

    setIsSubmitting(true);
    try {
      const bugNumber = await createBugReport({
        title: bugTitle,
        description: bugDescription,
        stepsToReproduce: bugSteps,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.fullName || 'مستخدم SmartTech',
        userEmail: currentUser.email
      });

      setSuccessMsg(`تم إرسال بلاغ العطل البرمجي بنجاح! رقم البلاغ: ${bugNumber}`);
      setBugTitle('');
      setBugDescription('');
      setBugSteps('');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`حدث خطأ: ${err?.message || 'تعذر الإبلاغ عن العطل'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || (!replyText.trim())) return;

    await sendSupportMessage({
      ticketId: selectedTicket.id,
      senderId: currentUser.id,
      senderName: currentUser.name || currentUser.fullName || 'العميل',
      senderRole: currentUser.role,
      text: replyText
    });

    setReplyText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto dir-rtl text-right">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/10 text-sky-500 rounded-2xl flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">مركز المساعدة والدعم الفني</h3>
              <p className="text-xs text-slate-400">فريق SmartTech في خدمتك على مدار الساعة.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('create')}
            className={`w-1/3 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 ${
              activeTab === 'create' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Plus className="w-4 h-4" /> طلب دعم جديد
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-1/3 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 ${
              activeTab === 'tickets' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> تذاكري المفتوحة ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('bug')}
            className={`w-1/3 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 ${
              activeTab === 'bug' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Bug className="w-4 h-4" /> الإبلاغ عن عطل برمجي
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* CREATE TICKET TAB */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">عنوان المساعدة أو المشكلة</label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={e => setTicketSubject(e.target.value)}
                placeholder="مثال: استفسار عن مواعيد محاضرة الذكاء الاصطناعي"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">فئة الدعم</label>
                <select
                  value={ticketCategory}
                  onChange={e => setTicketCategory(e.target.value as TicketCategory)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                >
                  <option value="GENERAL">استفسار عام</option>
                  <option value="PAYMENT">مدفوعات وفودافون كاش / إنستا باي</option>
                  <option value="COURSE_BOOKING">حجز الكورسات والقاعات</option>
                  <option value="TECHNICAL">مشاكل تقنية بالمنصة</option>
                  <option value="ATTENDANCE">حضور واختبارات</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">درجة الأهمية</label>
                <select
                  value={ticketPriority}
                  onChange={e => setTicketPriority(e.target.value as TicketPriority)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                >
                  <option value="LOW">عادية</option>
                  <option value="MEDIUM">متوسطة</option>
                  <option value="HIGH">هام جداً</option>
                  <option value="URGENT">طوارئ عاجلة</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">تفاصيل الرسالة</label>
              <textarea
                value={ticketMessage}
                onChange={e => setTicketMessage(e.target.value)}
                placeholder="اكتب استفسارك أو مشكلتك بالتفصيل..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl h-28 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">إرسال تسجيل صوتي (اختياري)</label>
              <VoiceMessageRecorder
                onSendVoice={(url, duration) => {
                  setVoiceUrl(url);
                  setVoiceDuration(duration);
                  alert('تم تسجيل الرسالة الصوتية بنجاح وإرفاقها بالتذكرة.');
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl transition shadow-lg shadow-sky-600/20"
            >
              {isSubmitting ? 'جاري إرسال التذكرة...' : 'إرسال طلب الدعم الآن'}
            </button>
          </form>
        )}

        {/* USER TICKETS TAB */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {selectedTicket ? (
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline mb-2 block"
                >
                  ← العودة لقائمة التذاكر
                </button>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold space-y-1">
                  <div className="flex justify-between">
                    <span className="font-mono text-sky-600">{selectedTicket.ticketNumber}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 rounded text-[10px]">{selectedTicket.status}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedTicket.subject}</h4>
                </div>

                {/* Messages Chat */}
                <div className="h-60 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl space-y-3 border border-slate-200 dark:border-slate-800">
                  {messages.map(m => {
                    const isMe = m.senderId === currentUser.id;
                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl max-w-[80%] text-xs font-bold ${
                          isMe ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border'
                        }`}>
                          <span className="block text-[9px] opacity-80 mb-0.5">{m.senderName}</span>
                          {m.text && <p>{m.text}</p>}
                          {m.voiceUrl && <audio controls src={m.voiceUrl} className="h-8 w-44 mt-1" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب ردك..."
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                  />
                  <button onClick={handleSendMessage} className="px-4 py-2.5 bg-sky-600 text-white font-bold rounded-xl text-xs">
                    إرسال
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {tickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700 rounded-2xl transition cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-sky-600 font-bold">{t.ticketNumber}</span>
                      <h4 className="font-black text-xs text-slate-900 dark:text-white">{t.subject}</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px] rounded-lg">
                      {t.status}
                    </span>
                  </div>
                ))}

                {tickets.length === 0 && (
                  <div className="p-8 text-center text-slate-400 font-bold text-xs">لا توجد لديك أية تذاكر مفتوحة حالياً.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* BUG REPORT TAB */}
        {activeTab === 'bug' && (
          <form onSubmit={handleCreateBug} className="space-y-4 text-xs font-bold">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-[11px] leading-relaxed">
              يقوم نظام SmartTech بتجميع معلومات جهازك ومتصفحك تلقائياً لسرعة معالجة العطل دون الحاجة لإدخالها يدوياً.
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">عنوان العطل البرمجي</label>
              <input
                type="text"
                required
                value={bugTitle}
                onChange={e => setBugTitle(e.target.value)}
                placeholder="مثال: زر تأكيد الحجز لا يفتح نافذة فودافون كاش"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">وصف العطل بالتفصيل</label>
              <textarea
                required
                value={bugDescription}
                onChange={e => setBugDescription(e.target.value)}
                placeholder="ما الذي حدث بالظبط؟"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl h-24 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">خطوات تكرار العطل (Steps to Reproduce)</label>
              <input
                type="text"
                value={bugSteps}
                onChange={e => setBugSteps(e.target.value)}
                placeholder="1. ضغطت على الكورس -> 2. اخترت الدفع..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition shadow-lg shadow-rose-600/20"
            >
              {isSubmitting ? 'جاري الإبلاغ...' : 'إرسال بلاغ العطل للقسم الفني'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
