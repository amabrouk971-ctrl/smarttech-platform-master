import React, { useState, useEffect } from 'react';
import { SupportTicket, SupportMessage, SupportQuickReply, BugReport, TicketStatus, TicketPriority, BugStatus } from '../../types';
import { 
  fetchAllSupportTickets, 
  subscribeToSupportMessages, 
  sendSupportMessage, 
  updateTicketStatus, 
  fetchSupportQuickReplies, 
  saveSupportQuickReply, 
  deleteSupportQuickReply 
} from '../../services/supportService';
import { fetchBugReports, updateBugStatus } from '../../services/bugService';
import { VoiceMessageRecorder } from '../VoiceMessageRecorder';
import { Headphones, Bug, MessageSquare, CheckCircle, Clock, AlertTriangle, User, Phone, Mail, Calendar, Monitor, Paperclip, Play, Send, Shield, Zap, RefreshCw, FileText } from 'lucide-react';

export const AdminSupportCMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'quickReplies' | 'bugs'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [quickReplies, setQuickReplies] = useState<SupportQuickReply[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected ticket for chat
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  // Quick reply editing state
  const [showQuickReplyModal, setShowQuickReplyModal] = useState(false);
  const [quickReplyFormData, setQuickReplyFormData] = useState<Partial<SupportQuickReply>>({
    title: '',
    category: 'عام',
    messageAr: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      const unsubscribe = subscribeToSupportMessages(selectedTicket.id, (msgs) => {
        setMessages(msgs);
      });
      return () => unsubscribe();
    }
  }, [selectedTicket]);

  const loadData = async () => {
    setLoading(true);
    const tData = await fetchAllSupportTickets();
    const qData = await fetchSupportQuickReplies();
    const bData = await fetchBugReports();
    setTickets(tData);
    setQuickReplies(qData);
    setBugs(bData);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || (!replyText.trim())) return;

    await sendSupportMessage({
      ticketId: selectedTicket.id,
      senderId: 'ADMIN',
      senderName: 'فريق الدعم والمساندة - SmartTech',
      senderRole: 'ADMIN',
      text: replyText
    });

    setReplyText('');
  };

  const handleSendVoiceReply = async (voiceUrl: string, durationSeconds: number) => {
    if (!selectedTicket) return;

    await sendSupportMessage({
      ticketId: selectedTicket.id,
      senderId: 'ADMIN',
      senderName: 'فريق الدعم والمساندة - SmartTech',
      senderRole: 'ADMIN',
      voiceUrl,
      voiceDurationSeconds: durationSeconds
    });
  };

  const handleInsertQuickReply = (qr: SupportQuickReply) => {
    if (!selectedTicket) return;
    let msg = qr.messageAr;

    // Substitute variables
    msg = msg.replace(/{{customerName}}/g, selectedTicket.userName || 'العميل العزيز');
    msg = msg.replace(/{{ticketId}}/g, selectedTicket.ticketNumber || selectedTicket.id);
    msg = msg.replace(/{{courseName}}/g, selectedTicket.courseName || 'الكورس');
    msg = msg.replace(/{{employeeName}}/g, 'موظف الدعم');

    setReplyText(msg);
  };

  const handleSaveQuickReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReplyFormData.title || !quickReplyFormData.messageAr) {
      alert('يرجى ملء كافة الحقول الإلزامية');
      return;
    }

    await saveSupportQuickReply({
      ...quickReplyFormData,
      title: quickReplyFormData.title!,
      messageAr: quickReplyFormData.messageAr!
    });

    setShowQuickReplyModal(false);
    loadData();
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">جاري تحميل مركز الدعم والبلاغات...</div>;

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="px-3 py-1 bg-sky-500/20 text-sky-400 font-bold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mb-2">
            <Headphones className="w-4 h-4" /> SUPPORT & BUG REPORTING CENTER
          </span>
          <h2 className="text-2xl font-black">مركز الدعم الفني وبلاغات الأعطال</h2>
          <p className="text-xs text-slate-400 mt-1">تابع التذاكر، الرسائل الصوتية، ردود الجاهزة، وبلاغات الأخطاء البرمجية لحظياً.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${activeTab === 'tickets' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
            >
              <Headphones className="w-4 h-4" /> تذاكر الدعم ({tickets.length})
            </button>
            <button
              onClick={() => setActiveTab('quickReplies')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${activeTab === 'quickReplies' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
            >
              <MessageSquare className="w-4 h-4" /> الردود الجاهزة ({quickReplies.length})
            </button>
            <button
              onClick={() => setActiveTab('bugs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${activeTab === 'bugs' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
            >
              <Bug className="w-4 h-4" /> بلاغات الأعطال ({bugs.length})
            </button>
          </div>

          <button onClick={loadData} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tickets List Column */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl p-4 space-y-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white px-2">قائمة التذاكر الحالية</h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {tickets.map(ticket => {
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">{ticket.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        ticket.priority === 'URGENT' ? 'bg-red-500 text-white' :
                        ticket.priority === 'HIGH' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>

                    <h4 className="font-black text-xs text-slate-900 dark:text-white line-clamp-1">{ticket.subject}</h4>

                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>{ticket.userName} ({ticket.userRole})</span>
                      <span className="text-slate-400 font-mono">{new Date(ticket.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                );
              })}

              {tickets.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-bold text-xs">لا توجد أية تذاكر دعم حالياً.</div>
              )}
            </div>
          </div>

          {/* Ticket Detail & Chat View */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xl flex flex-col justify-between min-h-[550px]">
            {selectedTicket ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Ticket Header Metadata */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">{selectedTicket.ticketNumber}</span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedTicket.subject}</h3>
                      </div>

                      <select
                        value={selectedTicket.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as TicketStatus;
                          await updateTicketStatus(selectedTicket.id, newStatus);
                          setSelectedTicket({ ...selectedTicket, status: newStatus });
                          loadData();
                        }}
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold p-2 rounded-xl"
                      >
                        <option value="OPEN">مفتوحة (OPEN)</option>
                        <option value="IN_PROGRESS">قيد المراجعة (IN_PROGRESS)</option>
                        <option value="WAITING_FOR_CUSTOMER">بانتظار العميل</option>
                        <option value="RESOLVED">تم الحل (RESOLVED)</option>
                        <option value="CLOSED">مغلقة (CLOSED)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <div><User className="w-3.5 h-3.5 inline ml-1 text-slate-400" /> {selectedTicket.userName}</div>
                      <div><Mail className="w-3.5 h-3.5 inline ml-1 text-slate-400" /> {selectedTicket.userEmail}</div>
                      <div><Phone className="w-3.5 h-3.5 inline ml-1 text-slate-400" /> {selectedTicket.userPhone || 'غير مسجل'}</div>
                    </div>
                  </div>

                  {/* Quick Replies Insert Row */}
                  <div className="pt-3">
                    <span className="block text-[11px] font-bold text-slate-500 mb-1.5">إدراج رد جاهز أوتوماتيكي (Quick Replies):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickReplies.map(qr => (
                        <button
                          key={qr.id}
                          onClick={() => handleInsertQuickReply(qr)}
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-bold transition border border-indigo-200 dark:border-indigo-800"
                        >
                          + {qr.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Messages Feed */}
                  <div className="my-4 h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {messages.map(msg => {
                      const isAdmin = msg.senderRole === 'ADMIN' || msg.senderId === 'SYSTEM';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                          <div className={`p-3 rounded-2xl max-w-[80%] text-xs font-bold space-y-1 ${
                            isAdmin 
                              ? 'bg-indigo-600 text-white rounded-br-none' 
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                          }`}>
                            <span className="block text-[9px] opacity-80">{msg.senderName} ({msg.senderRole})</span>
                            {msg.text && <p className="leading-relaxed">{msg.text}</p>}

                            {msg.voiceUrl && (
                              <div className="pt-1">
                                <audio controls src={msg.voiceUrl} className="h-8 w-48" />
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(msg.createdAt).toLocaleTimeString('ar-EG')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reply Controls */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <VoiceMessageRecorder onSendVoice={handleSendVoiceReply} />

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="اكتب ردك للعميل هنا..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold text-xs"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" /> إرسال
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 font-bold p-12 text-center">
                <Headphones className="w-12 h-12 text-slate-300 mb-2" />
                <span>اختر تذكرة دعم من القائمة الجانبية لبدء المحادثة والمتابعة.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK REPLIES TAB */}
      {activeTab === 'quickReplies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-black text-sm text-slate-900 dark:text-white">إدارة القوالب والردود الجاهزة أوتوماتيكياً</h3>
            <button
              onClick={() => {
                setQuickReplyFormData({ title: '', category: 'عام', messageAr: '', isActive: true });
                setShowQuickReplyModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              + إضافة رد جاهز
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickReplies.map(qr => (
              <div key={qr.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] rounded-lg">
                    {qr.category}
                  </span>
                  <button onClick={() => deleteSupportQuickReply(qr.id).then(loadData)} className="text-red-500 hover:text-red-700 text-xs font-bold">
                    حذف
                  </button>
                </div>

                <h4 className="font-black text-sm text-slate-900 dark:text-white">{qr.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 leading-relaxed">
                  {qr.messageAr}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUGS TAB */}
      {activeTab === 'bugs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-black text-sm text-slate-900 dark:text-white">
            سجل بلاغات الأعطال والمشاكل التقنية (Bug Reports)
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">رقم البلاغ</th>
                  <th className="p-3">عنوان المشكلة</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">المتصفح والسياق</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold">
                {bugs.map(bug => (
                  <tr key={bug.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono text-sky-600">{bug.bugNumber}</td>
                    <td className="p-3 font-black text-slate-900 dark:text-white">{bug.title}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{bug.userName}</td>
                    <td className="p-3 text-slate-500 text-[10px]">
                      {bug.browser} | {bug.os} | {bug.deviceType}
                    </td>
                    <td className="p-3">
                      <select
                        value={bug.status}
                        onChange={async (e) => {
                          await updateBugStatus(bug.id, e.target.value as BugStatus);
                          loadData();
                        }}
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 text-[11px] font-bold"
                      >
                        <option value="NEW">جديد (NEW)</option>
                        <option value="INVESTIGATING">قيد التحقيق</option>
                        <option value="CONFIRMED">تم التأكيد</option>
                        <option value="IN_DEVELOPMENT">قيد الإصلاح</option>
                        <option value="FIXED">تم الإصلاح</option>
                        <option value="CLOSED">مغلق</option>
                      </select>
                    </td>
                    <td className="p-3 text-slate-400 font-mono">{new Date(bug.createdAt).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Reply Modal */}
      {showQuickReplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg w-full rounded-3xl p-6 space-y-4 text-right dir-rtl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">إضافة رد جاهز جديد</h3>
            <form onSubmit={handleSaveQuickReply} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">عنوان الرد السريع</label>
                <input
                  type="text"
                  required
                  value={quickReplyFormData.title || ''}
                  onChange={e => setQuickReplyFormData({ ...quickReplyFormData, title: e.target.value })}
                  placeholder="تأكيد الدفع والاستلام"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">نص الرسالة</label>
                <textarea
                  required
                  value={quickReplyFormData.messageAr || ''}
                  onChange={e => setQuickReplyFormData({ ...quickReplyFormData, messageAr: e.target.value })}
                  placeholder="مرحباً {{customerName}}، تم استلام الطلب رقم {{ticketId}}..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl h-28"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowQuickReplyModal(false)} className="px-4 py-2 bg-slate-200 rounded-xl">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
