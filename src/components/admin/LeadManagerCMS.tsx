import React, { useState, useEffect } from 'react';
import { 
  Phone, MessageSquare, UserCheck, Shield, Clock, Plus, CheckCircle, Search, RefreshCw, 
  AlertCircle, ArrowRight, Calendar, User, FileText, Send, UserPlus, Filter, Award, 
  DollarSign, Activity, CheckCircle2, ChevronRight, CornerDownLeft, ExternalLink, Flame
} from 'lucide-react';
import { 
  Lead, ExtendedLeadStatus, LeadPriority, LeadSource, User as UserType, 
  Employee, LeadCall, LeadMessage, LeadFollowUp, LeadAssignmentHistory, Course, LearningPath 
} from '../../types';
import { 
  fetchLeadsFromFirestore, createLeadInFirestore, updateLeadInFirestore, 
  assignLeadInFirestore, logCallInFirestore, logMessageInFirestore, 
  createFollowUpInFirestore, fetchFollowUpsFromFirestore, completeFollowUpInFirestore,
  fetchAssignmentHistoryFromFirestore, fetchCallsForLeadFromFirestore, 
  fetchMessagesForLeadFromFirestore, checkDuplicateLead, convertLeadToAcademyMemberInFirestore 
} from '../../services/leadService';
import { fetchEmployeesFromFirestore } from '../../services/employeeService';
import { INITIAL_COURSES, INITIAL_LEARNING_PATHS } from '../../data/seedData';

interface LeadManagerCMSProps {
  currentUser?: UserType | null;
}

const KANBAN_STAGES: { status: ExtendedLeadStatus; label: string; color: string }[] = [
  { status: 'NEW', label: 'جديد (New)', color: 'border-cyan-500 bg-cyan-950/20 text-cyan-400' },
  { status: 'CONTACTED', label: 'تم التواصل (Contacted)', color: 'border-blue-500 bg-blue-950/20 text-blue-400' },
  { status: 'INTERESTED', label: 'مهتم (Interested)', color: 'border-purple-500 bg-purple-950/20 text-purple-400' },
  { status: 'FOLLOW_UP', label: 'متابعة حثيثة (Follow-Up)', color: 'border-amber-500 bg-amber-950/20 text-amber-400' },
  { status: 'COURSE_SELECTED', label: 'تم تحديد الكورس (Course Selected)', color: 'border-indigo-500 bg-indigo-950/20 text-indigo-400' },
  { status: 'OFFER_SENT', label: 'تم إرسال العرض (Offer Sent)', color: 'border-pink-500 bg-pink-950/20 text-pink-400' },
  { status: 'PAYMENT_PENDING', label: 'في انتظار الدفع (Payment Pending)', color: 'border-yellow-500 bg-yellow-950/20 text-yellow-400' },
  { status: 'ENROLLED', label: 'تم التسجيل والاشتراك (Enrolled)', color: 'border-emerald-500 bg-emerald-950/20 text-emerald-400' },
  { status: 'LOST', label: 'غير مهتم / ملغى (Lost)', color: 'border-rose-500 bg-rose-950/20 text-rose-400' }
];

export const LeadManagerCMS: React.FC<LeadManagerCMSProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'table' | 'myleads' | 'followups' | 'performance'>('kanban');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [employeeFilter, setEmployeeFilter] = useState<string>('ALL');

  // Selected Lead Details Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadDetailTab, setLeadDetailTab] = useState<'details' | 'calls' | 'messages' | 'assignments' | 'timeline'>('details');

  // Related Lead Data
  const [leadCalls, setLeadCalls] = useState<LeadCall[]>([]);
  const [leadMessages, setLeadMessages] = useState<LeadMessage[]>([]);
  const [leadHistory, setLeadHistory] = useState<LeadAssignmentHistory[]>([]);

  // Modals
  const [showFastAddModal, setShowFastAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  // Fast Add Form State with Duplicate Detection
  const [fastAddForm, setFastAddForm] = useState({
    parentName: '',
    studentName: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    studentAge: 10,
    source: 'WhatsApp' as LeadSource,
    priority: 'MEDIUM' as LeadPriority,
    assignedEmployeeId: '',
    selectedCourses: [] as string[],
    selectedPath: '',
    notes: ''
  });
  const [duplicateLeads, setDuplicateLeads] = useState<Lead[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  // Call Logger Form
  const [callForm, setCallForm] = useState({
    direction: 'OUTBOUND' as any,
    result: 'INTERESTED' as any,
    duration: '3m',
    notes: '',
    nextFollowUpAt: ''
  });

  // Message Logger Form
  const [msgForm, setMsgForm] = useState({
    channel: 'WhatsApp' as any,
    direction: 'OUTBOUND' as any,
    messageSummary: ''
  });

  // Assign / Transfer Form
  const [assignForm, setAssignForm] = useState({
    newEmployeeId: '',
    reason: 'تحويل متابعة ليد'
  });

  // Convert Form
  const [convertForm, setConvertForm] = useState({
    amountPaid: 1200,
    paymentMethod: 'CASH' as any
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAllData = async () => {
    setIsLoading(true);
    const [leadsData, empsData, fupsData] = await Promise.all([
      fetchLeadsFromFirestore(),
      fetchEmployeesFromFirestore(),
      fetchFollowUpsFromFirestore()
    ]);
    setLeads(leadsData);
    setEmployees(empsData);
    setFollowUps(fupsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // When a lead is selected, load its detailed sub-records
  useEffect(() => {
    if (selectedLead) {
      Promise.all([
        fetchCallsForLeadFromFirestore(selectedLead.id),
        fetchMessagesForLeadFromFirestore(selectedLead.id),
        fetchAssignmentHistoryFromFirestore(selectedLead.id)
      ]).then(([calls, msgs, hist]) => {
        setLeadCalls(calls);
        setLeadMessages(msgs);
        setLeadHistory(hist);
      });
    }
  }, [selectedLead]);

  // Handle Fast Add Duplicate Check
  const handleCheckDuplicates = async (phone: string, studentName: string) => {
    if (!phone && !studentName) return;
    setIsCheckingDuplicates(true);
    const dups = await checkDuplicateLead(phone, '', studentName);
    setDuplicateLeads(dups);
    setIsCheckingDuplicates(false);
  };

  const handleCreateFastLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastAddForm.parentName || !fastAddForm.phone) return;

    setIsSubmitting(true);
    try {
      const assignedEmp = employees.find((emp) => emp.id === fastAddForm.assignedEmployeeId);

      const created = await createLeadInFirestore(
        {
          parentName: fastAddForm.parentName,
          studentName: fastAddForm.studentName || 'طالب جديد',
          phone: fastAddForm.phone,
          whatsappNumber: fastAddForm.whatsappNumber || fastAddForm.phone,
          email: fastAddForm.email,
          studentAge: fastAddForm.studentAge,
          childAge: fastAddForm.studentAge,
          source: fastAddForm.source,
          priority: fastAddForm.priority,
          assignedEmployeeId: assignedEmp?.id || '',
          assignedEmployeeName: assignedEmp?.fullName || '',
          selectedCourses: fastAddForm.selectedCourses,
          selectedPath: fastAddForm.selectedPath,
          notes: fastAddForm.notes,
          status: 'NEW'
        },
        currentUser ? { id: currentUser.id, name: currentUser.name } : undefined
      );

      setShowFastAddModal(false);
      resetFastAddForm();
      await loadAllData();
      alert(`تم إضافة الليد بنجاح بالرقم (${created.leadId})!`);
    } catch (err: any) {
      alert(`خطأ في إضافة الليد: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFastAddForm = () => {
    setFastAddForm({
      parentName: '',
      studentName: '',
      phone: '',
      whatsappNumber: '',
      email: '',
      studentAge: 10,
      source: 'WhatsApp',
      priority: 'MEDIUM',
      assignedEmployeeId: '',
      selectedCourses: [],
      selectedPath: '',
      notes: ''
    });
    setDuplicateLeads([]);
  };

  // Status Change / Pipeline Move
  const handleStatusChange = async (leadId: string, newStatus: ExtendedLeadStatus) => {
    await updateLeadInFirestore(leadId, { status: newStatus }, currentUser ? { id: currentUser.id, name: currentUser.name } : undefined);
    await loadAllData();
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  // Lead Assign / Transfer
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !assignForm.newEmployeeId) return;

    const newEmp = employees.find((e) => e.id === assignForm.newEmployeeId);
    if (!newEmp) return;

    setIsSubmitting(true);
    try {
      await assignLeadInFirestore(
        selectedLead,
        { id: newEmp.id, name: newEmp.fullName },
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'ADMIN', name: 'المدير' },
        assignForm.reason
      );
      setShowAssignModal(false);
      await loadAllData();
      setSelectedLead({
        ...selectedLead,
        assignedEmployeeId: newEmp.id,
        assignedEmployeeName: newEmp.fullName
      });
      alert(`تم تحويل الليد بنجاح للموظفة (${newEmp.fullName})!`);
    } catch (err: any) {
      alert(`خطأ في تعيين الليد: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Call Logging Submit
  const handleLogCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setIsSubmitting(true);
    try {
      const empId = currentUser?.id || selectedLead.assignedEmployeeId || 'EMP-1001';
      const empName = currentUser?.name || selectedLead.assignedEmployeeName || 'خديجة محمد';

      await logCallInFirestore(
        {
          callId: `CALL-${Date.now()}`,
          leadId: selectedLead.id,
          employeeId: empId,
          employeeName: empName,
          callDate: new Date().toISOString(),
          duration: callForm.duration,
          direction: callForm.direction,
          result: callForm.result,
          notes: callForm.notes,
          nextFollowUpAt: callForm.nextFollowUpAt || undefined
        },
        { id: empId, name: empName }
      );

      setShowCallModal(false);
      setCallForm({ direction: 'OUTBOUND', result: 'INTERESTED', duration: '3m', notes: '', nextFollowUpAt: '' });
      await loadAllData();
      // Reload lead sub records
      const updatedCalls = await fetchCallsForLeadFromFirestore(selectedLead.id);
      setLeadCalls(updatedCalls);
      alert('تم تسجيل المكالمة بنجاح وتحديث تاريخ التواصل!');
    } catch (err: any) {
      alert(`خطأ في تسجيل المكالمة: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Message Logging Submit
  const handleLogMsgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !msgForm.messageSummary) return;

    setIsSubmitting(true);
    try {
      const empId = currentUser?.id || selectedLead.assignedEmployeeId || 'EMP-1001';
      const empName = currentUser?.name || selectedLead.assignedEmployeeName || 'خديجة محمد';

      await logMessageInFirestore(
        {
          messageId: `MSG-${Date.now()}`,
          leadId: selectedLead.id,
          employeeId: empId,
          employeeName: empName,
          channel: msgForm.channel,
          direction: msgForm.direction,
          messageSummary: msgForm.messageSummary,
          messageTimestamp: new Date().toISOString()
        },
        { id: empId, name: empName }
      );

      setShowMsgModal(false);
      setMsgForm({ channel: 'WhatsApp', direction: 'OUTBOUND', messageSummary: '' });
      await loadAllData();
      const updatedMsgs = await fetchMessagesForLeadFromFirestore(selectedLead.id);
      setLeadMessages(updatedMsgs);
      alert('تم تسجيل المراسلة بنجاح!');
    } catch (err: any) {
      alert(`خطأ في تسجيل الرسالة: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert Lead to Enrollment
  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !currentUser) return;

    setIsSubmitting(true);
    try {
      const result = await convertLeadToAcademyMemberInFirestore(
        selectedLead,
        convertForm.amountPaid,
        convertForm.paymentMethod,
        currentUser
      );
      setShowConvertModal(false);
      await loadAllData();
      alert(`🎉 تم تحويل الليد وتفعيل عضوية الطالب (${result.studentUser.name}) بنجاح مع احتساب الإيراد لـ (${selectedLead.assignedEmployeeName || 'الموظف المسؤول'})!`);
    } catch (err: any) {
      alert(`خطأ في تحويل الليد: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open WhatsApp Link directly
  const handleOpenWhatsApp = (lead: Lead) => {
    const phone = lead.whatsappNumber || lead.phone;
    const cleanPhone = phone.replace(/\D/g, '');
    const numWithCountry = cleanPhone.startsWith('2') ? cleanPhone : `2${cleanPhone}`;
    const text = `أهلاً ${lead.parentName} 👋\nمع حضرتك من أخصائيي سمارتك أكاديمي بخصوص استفساركم عن الكورسات والمسارات المتاحة للطفل ${lead.studentName}. كيف يمكننا مساعدتكم اليوم؟`;
    window.open(`https://wa.me/${numWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    // My Leads tab
    if (activeTab === 'myleads') {
      if (currentUser && l.assignedEmployeeId !== currentUser.id && l.assignedEmployeeName !== currentUser.name) {
        return false;
      }
    }
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (employeeFilter !== 'ALL' && l.assignedEmployeeId !== employeeFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.parentName.toLowerCase().includes(q) ||
        l.studentName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.whatsappNumber.includes(q) ||
        l.leadId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header Banner */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <MessageSquare className="w-3.5 h-3.5" /> SMARTTECH LEAD CRM & SALES CONVERSION ENGINE
          </span>
          <h2 className="text-2xl font-black text-white">إدارة الليدز والمبيعات وتحويلات الواتساب</h2>
          <p className="text-xs text-slate-400">
            متابعة دقيقة لكل ليد، توزيع المهام على الموظفات (خديجة، مهيتاب، حبيبة)، تسجيل المكالمات، المتابعات، وتحويل الطلاب لأعضاء مفعلين.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetFastAddForm();
              setShowFastAddModal(true);
            }}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ليد جديد (+ NEW LEAD)</span>
          </button>
          <button
            onClick={loadAllData}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'kanban' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>خط المبيعات (Kanban Pipeline) 📊</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'table' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>جدول الليدز الشامل ({leads.length}) 📋</span>
        </button>

        <button
          onClick={() => setActiveTab('myleads')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'myleads' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 text-cyan-400" />
          <span>صندوق الليدز الخاصة بي (MY LEADS) 📥</span>
        </button>

        <button
          onClick={() => setActiveTab('followups')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'followups' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>مركز المتابعات والمهام ({followUps.length}) ⏰</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم ولي الأمر، الطفل، أو الهاتف..."
            className="bg-transparent text-white outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto">
          <div>
            <span className="text-[10px] text-slate-500 block mb-1">الموظف المسؤول:</span>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white rounded-xl p-2 outline-none"
            >
              <option value="ALL">جميع الموظفين</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block mb-1">حالة الليد:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white rounded-xl p-2 outline-none"
            >
              <option value="ALL">جميع الحالات</option>
              {KANBAN_STAGES.map((st) => (
                <option key={st.status} value={st.status}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 1. KANBAN PIPELINE VIEW */}
      {activeTab === 'kanban' && (
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-[1600px]">
            {KANBAN_STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.status === stage.status);
              return (
                <div key={stage.status} className="w-72 bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-3 shrink-0">
                  <div className={`p-3 rounded-2xl border ${stage.color} flex items-center justify-between font-black text-xs`}>
                    <span>{stage.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px]">{stageLeads.length}</span>
                  </div>

                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {stageLeads.length === 0 ? (
                      <div className="p-6 text-center text-slate-600 text-[11px] font-bold border border-dashed border-slate-800 rounded-2xl">
                        لا يوجد ليدز هنا
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="bg-slate-900 hover:bg-slate-800/80 p-4 rounded-2xl border border-slate-800 space-y-2 cursor-pointer transition shadow-md hover:border-amber-500/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-mono text-amber-400 font-bold">{lead.leadId}</span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                lead.priority === 'URGENT'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : lead.priority === 'HIGH'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {lead.priority || 'MEDIUM'}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-xs text-white truncate">{lead.studentName}</h4>
                            <p className="text-[11px] text-slate-400">ولي الأمر: {lead.parentName}</p>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                            <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{lead.phone}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span className="flex items-center gap-1 text-cyan-400">
                              <User className="w-3 h-3" /> {lead.assignedEmployeeName || 'غير معين'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWhatsApp(lead);
                              }}
                              className="text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" /> واتساب
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TABLE VIEW & MY LEADS INBOX */}
      {(activeTab === 'table' || activeTab === 'myleads') && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">رقم الليد</th>
                  <th className="p-4">اسم الطالب وولي الأمر</th>
                  <th className="p-4">الهاتف والواتساب</th>
                  <th className="p-4">الموظف المسؤول</th>
                  <th className="p-4">المصدر والأولوية</th>
                  <th className="p-4">الحالة الميدانية</th>
                  <th className="p-4 text-center">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-bold">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-4 font-mono text-amber-400">{lead.leadId}</td>
                    <td className="p-4">
                      <p className="text-white font-extrabold">{lead.studentName} ({lead.studentAge || lead.childAge} سنة)</p>
                      <p className="text-slate-400 text-[11px]">ولي الأمر: {lead.parentName}</p>
                    </td>
                    <td className="p-4 font-mono text-emerald-400">{lead.phone}</td>
                    <td className="p-4 text-cyan-300">{lead.assignedEmployeeName || 'غير معين'}</td>
                    <td className="p-4 space-y-1">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 block w-fit">
                        {lead.source}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as ExtendedLeadStatus)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-bold outline-none"
                      >
                        {KANBAN_STAGES.map((st) => (
                          <option key={st.status} value={st.status}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs cursor-pointer"
                        >
                          تفاصيل الليد 👁️
                        </button>
                        <button
                          onClick={() => handleOpenWhatsApp(lead)}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs cursor-pointer flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> واتساب
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. FOLLOW-UPS HUB */}
      {activeTab === 'followups' && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
          <h3 className="font-black text-lg text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> قائمة المتابعات المطلوبة لكل موظف
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followUps.map((fup) => (
              <div key={fup.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">{fup.followUpType}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${fup.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {fup.status}
                  </span>
                </div>
                <p className="font-extrabold text-sm text-white">{fup.notes}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>الموظف: {fup.employeeName || 'غير محدد'}</span>
                  {fup.status !== 'COMPLETED' && (
                    <button
                      onClick={async () => {
                        await completeFollowUpInFirestore(fup.id);
                        await loadAllData();
                      }}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      إكمال المتابعة ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAST ADD LEAD MODAL WITH DUPLICATE CHECK */}
      {showFastAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl dir-rtl text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> تسجيل ليد جديد بالـ CRM (+ FAST LEAD ENTRY)
              </h3>
              <button onClick={() => setShowFastAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFastLead} className="space-y-4 text-xs font-bold text-slate-300">
              {/* Duplicate Detection Alert Box */}
              {duplicateLeads.length > 0 && (
                <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>تحذير: تم العثور على ليدز مشابهة مسجلة مسبقاً!</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-amber-200">
                    {duplicateLeads.map((dup) => (
                      <p key={dup.id}>
                        • الطالب: {dup.studentName} | ولي الأمر: {dup.parentName} | الهاتف: {dup.phone} (المسؤول: {dup.assignedEmployeeName || 'غير معين'})
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">اسم ولي الأمر *</label>
                  <input
                    type="text"
                    required
                    value={fastAddForm.parentName}
                    onChange={(e) => setFastAddForm({ ...fastAddForm, parentName: e.target.value })}
                    placeholder="اسم ولي الأمر"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">اسم الطالب (الطفل)</label>
                  <input
                    type="text"
                    value={fastAddForm.studentName}
                    onChange={(e) => {
                      setFastAddForm({ ...fastAddForm, studentName: e.target.value });
                      handleCheckDuplicates(fastAddForm.phone, e.target.value);
                    }}
                    placeholder="اسم الطالب"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">رقم الهاتف والواتساب *</label>
                  <input
                    type="tel"
                    required
                    value={fastAddForm.phone}
                    onChange={(e) => {
                      setFastAddForm({ ...fastAddForm, phone: e.target.value, whatsappNumber: e.target.value });
                      handleCheckDuplicates(e.target.value, fastAddForm.studentName);
                    }}
                    placeholder="010XXXXXXXX"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1">عمر الطالب (سنوات)</label>
                  <input
                    type="number"
                    value={fastAddForm.studentAge}
                    onChange={(e) => setFastAddForm({ ...fastAddForm, studentAge: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">الموظفة المسؤولة عن المتابعة</label>
                  <select
                    value={fastAddForm.assignedEmployeeId}
                    onChange={(e) => setFastAddForm({ ...fastAddForm, assignedEmployeeId: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="">-- اختر الموظفة --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">مصدر الليد (Source)</label>
                  <select
                    value={fastAddForm.source}
                    onChange={(e) => setFastAddForm({ ...fastAddForm, source: e.target.value as LeadSource })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="WhatsApp">الواتساب المباشر</option>
                    <option value="Website">موقع الأكاديمية</option>
                    <option value="Facebook">فيسبوك</option>
                    <option value="Instagram">إنستجرام</option>
                    <option value="TikTok">تيك توك</option>
                    <option value="Phone">مكالمة هاتفية</option>
                    <option value="Walk-in">حضور في مقر الأكاديمية</option>
                    <option value="Referral">ترشيح من ولي أمر آخر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">ملاحظات مكالمة الاستفسار الأولي</label>
                <textarea
                  rows={2}
                  value={fastAddForm.notes}
                  onChange={(e) => setFastAddForm({ ...fastAddForm, notes: e.target.value })}
                  placeholder="ملاحظات ولي الأمر، الوقت المفضل للحصص..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                >
                  حفظ وتأكيد الليد بالـ CRM 💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD DETAILED MODAL & SUB-ACTIONS */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl dir-rtl text-right max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400">{selectedLead.leadId}</span>
                <h3 className="font-black text-lg text-white">{selectedLead.studentName}</h3>
                <p className="text-xs text-slate-400">ولي الأمر: {selectedLead.parentName} | الهاتف: {selectedLead.phone}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            {/* Sub-Actions Bar */}
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => handleOpenWhatsApp(selectedLead)}
                className="px-3 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center gap-1 hover:bg-emerald-600/30 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" /> فتح واتساب 💬
              </button>
              <button
                onClick={() => setShowCallModal(true)}
                className="px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl flex items-center gap-1 hover:bg-blue-600/30 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" /> تسجيل مكالمة 📞
              </button>
              <button
                onClick={() => setShowMsgModal(true)}
                className="px-3 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl flex items-center gap-1 hover:bg-purple-600/30 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> تسجيل رسالة ✉️
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-3 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl flex items-center gap-1 hover:bg-cyan-600/30 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> تحويل لموظفة 👤
              </button>
              <button
                onClick={() => setShowConvertModal(true)}
                className="px-3 py-2 bg-amber-500 text-slate-950 font-black rounded-xl flex items-center gap-1 hover:bg-amber-400 cursor-pointer mr-auto"
              >
                <Award className="w-3.5 h-3.5" /> تحويل لعضوية مفعلة 🎓
              </button>
            </div>

            {/* Lead Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-bold">
              <button
                onClick={() => setLeadDetailTab('details')}
                className={`pb-2 border-b-2 transition ${leadDetailTab === 'details' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'}`}
              >
                بيانات الليد
              </button>
              <button
                onClick={() => setLeadDetailTab('calls')}
                className={`pb-2 border-b-2 transition ${leadDetailTab === 'calls' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'}`}
              >
                المكالمات المسجلة ({leadCalls.length})
              </button>
              <button
                onClick={() => setLeadDetailTab('messages')}
                className={`pb-2 border-b-2 transition ${leadDetailTab === 'messages' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'}`}
              >
                الرسائل والتواصل ({leadMessages.length})
              </button>
              <button
                onClick={() => setLeadDetailTab('assignments')}
                className={`pb-2 border-b-2 transition ${leadDetailTab === 'assignments' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'}`}
              >
                سجل التكليفات والتحويل ({leadHistory.length})
              </button>
            </div>

            {/* Lead Tab Content */}
            {leadDetailTab === 'details' && (
              <div className="space-y-4 text-xs font-bold text-slate-300">
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">الموظفة المسؤولة:</span>
                    <span className="text-white text-sm">{selectedLead.assignedEmployeeName || 'غير عين'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">حالة المبيعات:</span>
                    <span className="text-amber-400 text-sm">{selectedLead.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">مصدر الليد:</span>
                    <span className="text-white">{selectedLead.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الأولوية:</span>
                    <span className="text-rose-400">{selectedLead.priority || 'MEDIUM'}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-slate-500 block">الملاحظات المسجلة:</span>
                  <p className="text-white font-normal leading-relaxed">{selectedLead.notes || 'لا توجد ملاحظات مسجلة'}</p>
                </div>
              </div>
            )}

            {leadDetailTab === 'calls' && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {leadCalls.length === 0 ? (
                  <p className="text-xs text-slate-500 font-bold">لم يتم تسجيل مكالمات هاتفية مع هذا الليد بعد.</p>
                ) : (
                  leadCalls.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-amber-400 font-bold">{c.direction} - {c.result}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <p className="text-white">{c.notes}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {leadDetailTab === 'messages' && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {leadMessages.length === 0 ? (
                  <p className="text-xs text-slate-500 font-bold">لم يتم تسجيل مراسلات بعد.</p>
                ) : (
                  leadMessages.map((m) => (
                    <div key={m.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-cyan-400 font-bold">{m.channel} ({m.direction})</span>
                        <span>{new Date(m.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <p className="text-white">{m.messageSummary}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {leadDetailTab === 'assignments' && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {leadHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 font-bold">لم يتم تحويل الليد بين موظفات مسبقاً.</p>
                ) : (
                  leadHistory.map((h) => (
                    <div key={h.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                      <p className="text-white font-bold">
                        تم التحويل من ({h.previousEmployeeName || 'غير معين'}) إلى ({h.newEmployeeName})
                      </p>
                      <p className="text-slate-400 text-[11px]">السبب: {h.reason} | بواسطة: {h.changedByName || 'المدير'}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CALL LOGGING MODAL */}
      {showCallModal && selectedLead && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl dir-rtl text-right">
            <h3 className="font-black text-base text-white">تسجيل مكالمة هاتفية جديدة 📞</h3>
            <form onSubmit={handleLogCallSubmit} className="space-y-3 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1">نتيجة المكالمة</label>
                <select
                  value={callForm.result}
                  onChange={(e) => setCallForm({ ...callForm, result: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                >
                  <option value="INTERESTED">مهتم بالكورس</option>
                  <option value="ANSWERED">تم الرد والاستفسار</option>
                  <option value="NO_ANSWER">لم يتم الرد</option>
                  <option value="BUSY">الخط مشغول</option>
                  <option value="CALLBACK_REQUESTED">طلب الاتصال لاحقاً</option>
                  <option value="NOT_INTERESTED">غير مهتم</option>
                  <option value="WRONG_NUMBER">رقم خاطئ</option>
                  <option value="ENROLLED">جاهز للاشتراك الفوري</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">ملاحظات المكالمة *</label>
                <textarea
                  rows={3}
                  required
                  value={callForm.notes}
                  onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                  placeholder="ملخص يدور حول تفاصيل مكالمة ولي الأمر..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold cursor-pointer">
                تأكيد حفظ المكالمة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MESSAGE LOGGING MODAL */}
      {showMsgModal && selectedLead && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl dir-rtl text-right">
            <h3 className="font-black text-base text-white">تسجيل مراسلة جديدة ✉️</h3>
            <form onSubmit={handleLogMsgSubmit} className="space-y-3 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1">قناة المراسلة</label>
                <select
                  value={msgForm.channel}
                  onChange={(e) => setMsgForm({ ...msgForm, channel: e.target.value as any })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                >
                  <option value="WhatsApp">واتساب (WhatsApp)</option>
                  <option value="SMS">رسالة نصية SMS</option>
                  <option value="Email">بريد إلكتروني Email</option>
                  <option value="Facebook">فيسبوك ماسنجر</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">ملخص الرسالة *</label>
                <textarea
                  rows={3}
                  required
                  value={msgForm.messageSummary}
                  onChange={(e) => setMsgForm({ ...msgForm, messageSummary: e.target.value })}
                  placeholder="ملخص العرض أو التفاصيل المرسلة..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold cursor-pointer">
                تأكيد حفظ المراسلة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGNMENT MODAL */}
      {showAssignModal && selectedLead && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl dir-rtl text-right">
            <h3 className="font-black text-base text-white">تحويل الليد لموظفة أخرى 👤</h3>
            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1">اختيار الموظفة المستقبلة لليد *</label>
                <select
                  required
                  value={assignForm.newEmployeeId}
                  onChange={(e) => setAssignForm({ ...assignForm, newEmployeeId: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                >
                  <option value="">-- اختر الموظفة --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">سبب التحويل</label>
                <input
                  type="text"
                  value={assignForm.reason}
                  onChange={(e) => setAssignForm({ ...assignForm, reason: e.target.value })}
                  placeholder="مثال: تبديل شفت المتابعة"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold cursor-pointer">
                تأكيد تحويل الليد
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT TO ENROLLMENT MODAL */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl dir-rtl text-right">
            <h3 className="font-black text-base text-white">تحويل الليد إلى عضوية أكاديمية مفعلة 🎓</h3>
            <p className="text-xs text-slate-400">
              سيتم إنشاء حساب طالب مفعل للطفل ({selectedLead.studentName}) وتفعيل العضوية واحتساب الإيراد باسم الموظف ({selectedLead.assignedEmployeeName || 'غير عين'}).
            </p>

            <form onSubmit={handleConvertSubmit} className="space-y-3 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1">مبلغ الاشتراك (EGP)</label>
                <input
                  type="number"
                  value={convertForm.amountPaid}
                  onChange={(e) => setConvertForm({ ...convertForm, amountPaid: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none font-mono text-sm font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block mb-1">وسيلة الدفع المسدد بها</label>
                <select
                  value={convertForm.paymentMethod}
                  onChange={(e) => setConvertForm({ ...convertForm, paymentMethod: e.target.value as any })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                >
                  <option value="CASH">نقداً بالمقر (Cash)</option>
                  <option value="VODAFONE_CASH">فودافون كاش (Vodafone Cash)</option>
                  <option value="INSTAPAY">انستا باي (InstaPay)</option>
                  <option value="FAWRY">فوري (Fawry)</option>
                  <option value="CARD">بطاقة إلكترونية (Card)</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black cursor-pointer shadow-lg">
                تأكيد التفعيل واحتساب المبيعات 🎉
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
