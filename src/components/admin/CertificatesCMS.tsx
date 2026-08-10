import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, Search, Plus, Upload, Download, RefreshCw, XCircle, 
  CheckCircle, FileText, AlertTriangle, Layers, Eye, Edit, Trash2, ShieldAlert,
  BarChart2, Users, FileSpreadsheet, Lock, ExternalLink
} from 'lucide-react';
import { Certificate, CertificateAuditLog, CertificateTemplate, Course } from '../../types';
import { 
  fetchCertificatesFromFirestore, saveCertificateToFirestore, revokeCertificateInFirestore,
  replaceCertificateInFirestore, fetchCertificateAuditLogsFromFirestore, 
  fetchCertificateTemplatesFromFirestore, saveCertificateTemplateToFirestore,
  bulkSaveCertificatesToFirestore, checkDuplicateCertificateNumberOrSerial
} from '../../services/firebaseService';
import { CertificateBulkImporter } from './CertificateBulkImporter';

interface CertificatesCMSProps {
  courses?: Course[];
}

export const CertificatesCMS: React.FC<CertificatesCMSProps> = ({ courses = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState<'registry' | 'add' | 'bulk' | 'import' | 'templates' | 'audit'>('registry');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [auditLogs, setAuditLogs] = useState<CertificateAuditLog[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Single Certificate Form
  const [certForm, setCertForm] = useState<Partial<Certificate>>({
    certificateNumber: `ST-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    serialNumber: `SN-${Math.floor(1000000 + Math.random() * 9000000)}`,
    verificationId: `vKey-${Math.random().toString(36).substr(2, 8)}-${Date.now().toString().slice(-4)}`,
    studentName: '',
    courseName: '',
    result: 'Passed',
    score: '95%',
    issueDate: new Date().toISOString().split('T')[0],
    instructorName: 'مهندس م. سمارتك',
    status: 'VALID'
  });

  // Modal States
  const [viewCert, setViewCert] = useState<Certificate | null>(null);
  const [revokeCert, setRevokeCert] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [replaceCert, setReplaceCert] = useState<Certificate | null>(null);

  // Bulk Generator State
  const [bulkCourseId, setBulkCourseId] = useState('');
  const [bulkStudentsText, setBulkStudentsText] = useState('أحمد محمد علي\nعمر خالد إبراهيم\nفاطمة محمود علي\nياسين محمد سامي');

  // CSV Import State
  const [csvText, setCsvText] = useState('');

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [certsData, logsData, tmplsData] = await Promise.all([
        fetchCertificatesFromFirestore(),
        fetchCertificateAuditLogsFromFirestore(),
        fetchCertificateTemplatesFromFirestore()
      ]);
      setCertificates(certsData);
      setAuditLogs(logsData);
      setTemplates(tmplsData);
    } catch (err) {
      console.error('Error loading certificate data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSingleCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.studentName || !certForm.courseName) {
      alert('يرجى ملء اسم الطالب واسم الكورس.');
      return;
    }

    try {
      setLoading(true);
      const saved = await saveCertificateToFirestore(certForm);
      alert(`تم إصدار الشهادة بنجاح برقم (${saved.certificateNumber}) !`);
      setCertificates((prev) => [saved, ...prev]);
      setActiveSubTab('registry');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ الشهادة.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeCert || !revokeReason.trim()) {
      alert('يرجى إدخال سبب الإلغاء.');
      return;
    }
    try {
      await revokeCertificateInFirestore(revokeCert.id, revokeReason);
      setCertificates((prev) =>
        prev.map((c) =>
          c.id === revokeCert.id ? { ...c, status: 'REVOKED', revocationReason: revokeReason } : c
        )
      );
      setRevokeCert(null);
      setRevokeReason('');
      alert('تم إلغاء الشهادة وتسجيل القرار بالسجلات الرسمية.');
    } catch (err) {
      alert('حدث خطأ أثناء إلغاء الشهادة.');
    }
  };

  const handleConfirmReplace = async () => {
    if (!replaceCert) return;
    try {
      const newCertData: Partial<Certificate> = {
        studentName: replaceCert.studentName,
        courseName: replaceCert.courseName,
        certificateName: replaceCert.certificateName,
        instructorName: replaceCert.instructorName,
        result: replaceCert.result,
        score: replaceCert.score,
        status: 'VALID'
      };
      const newCert = await replaceCertificateInFirestore(replaceCert.id, newCertData);
      alert(`تم استبدال الشهادة بنجاح. الشهادة الجديدة برقم (${newCert.certificateNumber}).`);
      setReplaceCert(null);
      loadData();
    } catch (err) {
      alert('حدث خطأ أثناء استبدال الشهادة.');
    }
  };

  const handleBulkGenerate = async () => {
    const studentNames = bulkStudentsText.split('\n').map((s) => s.trim()).filter(Boolean);
    if (studentNames.length === 0) {
      alert('يرجى إدخال أسماء الطلاب.');
      return;
    }

    const selectedCourse = courses.find((c) => c.id === bulkCourseId);
    const courseTitle = selectedCourse ? selectedCourse.titleAr : 'كورس سمارتك المعتمد';

    const certsData: Partial<Certificate>[] = studentNames.map((name) => ({
      studentName: name,
      studentNameAr: name,
      courseName: courseTitle,
      courseTitleAr: courseTitle,
      certificateName: 'شهادة إتمام كورس تخصصي معتمدة',
      result: 'Passed',
      score: '100%',
      issueDate: new Date().toISOString().split('T')[0],
      instructorName: 'مهندس م. سمارتك',
      status: 'VALID'
    }));

    try {
      setLoading(true);
      const res = await bulkSaveCertificatesToFirestore(certsData);
      alert(`تم إنشاء وإصدار عدد (${res.created.length}) شهادة بكتلة واحدة بنجاح!`);
      loadData();
      setActiveSubTab('registry');
    } catch (err) {
      alert('حدث خطأ أثناء التوليد الجماعي.');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVImport = async () => {
    if (!csvText.trim()) return;
    const lines = csvText.split('\n').filter(Boolean);
    if (lines.length < 2) {
      alert('يرجى إدخال بيانات CSV بالهيدر: StudentName,CourseName,Result,Score');
      return;
    }

    const certsData: Partial<Certificate>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts[0]) {
        certsData.push({
          studentName: parts[0],
          studentNameAr: parts[0],
          courseName: parts[1] || 'كورس سمارتك المعتمد',
          courseTitleAr: parts[1] || 'كورس سمارتك المعتمد',
          result: parts[2] || 'Passed',
          score: parts[3] || '90%',
          issueDate: new Date().toISOString().split('T')[0],
          status: 'VALID'
        });
      }
    }

    try {
      setLoading(true);
      const res = await bulkSaveCertificatesToFirestore(certsData);
      alert(`تم استيراد وحفظ (${res.created.length}) شهادة في Firestore!`);
      setCsvText('');
      loadData();
      setActiveSubTab('registry');
    } catch (err) {
      alert('حدث خطأ أثناء استيراد البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = 'CertificateNumber,SerialNumber,VerificationID,StudentName,CourseName,Result,Score,IssueDate,Status\n';
    const rows = filteredCerts.map((c) => 
      `"${c.certificateNumber}","${c.serialNumber}","${c.verificationId}","${c.studentName}","${c.courseName}","${c.result}","${c.score}","${c.issueDate}","${c.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SmartTech_Certificates_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredCerts = certificates.filter((c) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      (c.certificateNumber && c.certificateNumber.toLowerCase().includes(search)) ||
      (c.serialNumber && c.serialNumber.toLowerCase().includes(search)) ||
      (c.verificationId && c.verificationId.toLowerCase().includes(search)) ||
      (c.studentName && c.studentName.toLowerCase().includes(search)) ||
      (c.courseName && c.courseName.toLowerCase().includes(search));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValid = certificates.filter((c) => c.status === 'VALID').length;
  const totalRevoked = certificates.filter((c) => c.status === 'REVOKED').length;
  const totalVerifications = auditLogs.filter((l) => l.action === 'VERIFIED').length;

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-amber-500/30 text-white shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] uppercase tracking-widest border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <Award className="w-3.5 h-3.5" /> SMARTTECH CERTIFICATE VERIFICATION REGISTRY
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">السجل الرسمي للشهادات والتوثيق الإلكتروني</h2>
          <p className="text-xs text-slate-400">
            إدارة إصدار الشهادات الموثوقة، التثبت والتحقق الفوري عبر الـ QR، وإدارة طلبات الفحص وحماية التزييف.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-2xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" /> تصدير السجل CSV
          </button>
          <button
            onClick={() => setActiveSubTab('add')}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-600 text-white font-black text-xs rounded-2xl shadow-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> إصدار شهادة فردية 📜
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'registry', label: 'سجل الشهادات (Registry) 📜', icon: FileText },
          { id: 'add', label: 'إصدار شهادة جديدة ✍️', icon: Plus },
          { id: 'bulk', label: 'توليد دفعة شهادات (Bulk) ⚡', icon: Users },
          { id: 'import', label: 'استيراد CSV / Excel 📊', icon: FileSpreadsheet },
          { id: 'audit', label: 'سجل التدقيق والتحليلات 🛡️', icon: BarChart2 }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-5 py-3 rounded-2xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CERTIFICATES REGISTRY */}
      {/* ========================================================= */}
      {activeSubTab === 'registry' && (
        <div className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">إجمالي الشهادات المسجلة</span>
                <span className="text-2xl font-black text-white font-mono">{certificates.length}</span>
              </div>
              <Award className="w-8 h-8 text-amber-400" />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">شهادات سارية (VALID)</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{totalValid}</span>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">إجمالي عمليات الفحص والتحقق</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">{totalVerifications}</span>
              </div>
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث برقم الشهادة، السيريال، اسم الطالب، أو الكورس..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white font-bold"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="VALID">سارية (VALID)</option>
              <option value="REVOKED">ملغاة (REVOKED)</option>
              <option value="EXPIRED">منتهية (EXPIRED)</option>
              <option value="REPLACED">مستبدلة (REPLACED)</option>
            </select>
          </div>

          {/* Registry Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">رقم الشهادة / السيريال</th>
                    <th className="p-4">اسم الطالب</th>
                    <th className="p-4">الكورس والجهة</th>
                    <th className="p-4">النتيجة والتقدير</th>
                    <th className="p-4">تاريخ الإصدار</th>
                    <th className="p-4">الحالة المعتمدة</th>
                    <th className="p-4 text-center">الإجراءات والتحقق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredCerts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        لا توجد شهادات مسجلة مطابقة للبحث في قاعدة البيانات Firestore.
                      </td>
                    </tr>
                  ) : (
                    filteredCerts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-4">
                          <span className="font-mono font-bold text-amber-500 block">{c.certificateNumber}</span>
                          <span className="font-mono text-slate-400 text-[10px]">SN: {c.serialNumber}</span>
                        </td>
                        <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                          {c.studentName}
                        </td>
                        <td className="p-4 text-slate-300">
                          <span className="block font-bold">{c.courseName}</span>
                          <span className="text-[10px] text-slate-500">{c.instructorName}</span>
                        </td>
                        <td className="p-4 font-mono font-bold">
                          <span className="text-emerald-400">{c.result}</span> ({c.score || '100%'})
                        </td>
                        <td className="p-4 font-mono text-slate-400">{c.issueDate}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            c.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400' :
                            c.status === 'REVOKED' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewCert(c)}
                              title="معاينة كارت الشهادة الموثقة"
                              className="p-2 hover:bg-amber-500/20 text-amber-400 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {c.status === 'VALID' && (
                              <>
                                <button
                                  onClick={() => setRevokeCert(c)}
                                  title="إلغاء اعتماد الشهادة"
                                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setReplaceCert(c)}
                                  title="استبدال بشهادة جديدة"
                                  className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ADD SINGLE CERTIFICATE */}
      {/* ========================================================= */}
      {activeSubTab === 'add' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto text-white">
          <h3 className="font-extrabold text-xl text-amber-400 flex items-center gap-2">
            <Award className="w-6 h-6" /> إصدار شهادة اعتماد فردية جديدة
          </h3>

          <form onSubmit={handleSaveSingleCert} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">اسم الطالب رباعي (بالعربي)</label>
                <input
                  type="text"
                  required
                  value={certForm.studentName || ''}
                  onChange={(e) => setCertForm({ ...certForm, studentName: e.target.value, studentNameAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold focus:ring-2 focus:ring-amber-500"
                  placeholder="مثال: يوسف أحمد محمود سليمان"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">اسم الكورس / البرنامج</label>
                <input
                  type="text"
                  required
                  value={certForm.courseName || ''}
                  onChange={(e) => setCertForm({ ...certForm, courseName: e.target.value, courseTitleAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold"
                  placeholder="مثال: كورس الأردوينو المتقدم والذكاء الاصطناعي"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">رقم الشهادة المعتمد (Certificate Number)</label>
                <input
                  type="text"
                  required
                  value={certForm.certificateNumber || ''}
                  onChange={(e) => setCertForm({ ...certForm, certificateNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-amber-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">الرقم التسلسلي الفريد (Serial Number)</label>
                <input
                  type="text"
                  required
                  value={certForm.serialNumber || ''}
                  onChange={(e) => setCertForm({ ...certForm, serialNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-amber-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">النتيجة والتقدير</label>
                <select
                  value={certForm.result || 'Passed'}
                  onChange={(e) => setCertForm({ ...certForm, result: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold"
                >
                  <option value="Passed">ناجح بممتاز (Passed with Distinction)</option>
                  <option value="Passed">ناجح (Passed)</option>
                  <option value="Incomplete">غير مكتمل (Incomplete)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">الدرجة المئوية</label>
                <input
                  type="text"
                  value={certForm.score || '95%'}
                  onChange={(e) => setCertForm({ ...certForm, score: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">تاريخ الإصدار</label>
                <input
                  type="date"
                  value={certForm.issueDate || ''}
                  onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">اسم المحاضر / المدرب</label>
                <input
                  type="text"
                  value={certForm.instructorName || ''}
                  onChange={(e) => setCertForm({ ...certForm, instructorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-xl flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>{loading ? 'جاري الإصدار والتسجيل...' : 'إصدار الشهادة وحفظها بـ Firestore'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: BULK CERTIFICATE GENERATOR */}
      {/* ========================================================= */}
      {activeSubTab === 'bulk' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto text-white">
          <h3 className="font-extrabold text-xl text-amber-400 flex items-center gap-2">
            <Users className="w-6 h-6" /> التوليد الجماعي لشهادات الطلاب لدفعة كورس كاملة
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">اختر الكورس من القائمة</label>
              <select
                value={bulkCourseId}
                onChange={(e) => setBulkCourseId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
              >
                <option value="">-- اختر الكورس --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.titleAr} ({c.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">قائمة أسماء الطلاب (اسم طالب بكل سطر)</label>
              <textarea
                rows={6}
                value={bulkStudentsText}
                onChange={(e) => setBulkStudentsText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold leading-relaxed"
              />
            </div>

            <button
              onClick={handleBulkGenerate}
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{loading ? 'جاري إنشاء الشهادات وحفظها...' : 'توليد الشهادات تلقائياً بالسجل ⚡'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: BULK IMPORT CSV / EXCEL */}
      {/* ========================================================= */}
      {activeSubTab === 'import' && (
        <CertificateBulkImporter 
          courses={courses} 
          onComplete={() => { 
            loadData(); 
            setActiveSubTab('registry'); 
          }} 
        />
      )}

      {/* ========================================================= */}
      {/* TAB 5: AUDIT LOGS */}
      {/* ========================================================= */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-white">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> سجل التدقيق وحركات الأمان للشهادات
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-extrabold border-b border-slate-800">
                <tr>
                  <th className="p-3">الإجراء</th>
                  <th className="p-3">رقم الشهادة المعنية</th>
                  <th className="p-3">التفاصيل والوصف</th>
                  <th className="p-3">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">لا توجد سجلات تدقيق حتى الآن.</td>
                  </tr>
                ) : (
                  auditLogs.map((l) => (
                    <tr key={l.id}>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold text-[10px]">
                          {l.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">{l.certificateNumber || '-'}</td>
                      <td className="p-3">{l.details}</td>
                      <td className="p-3 font-mono text-slate-500">{new Date(l.timestamp).toLocaleString('ar-EG')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW CERTIFICATE CARD */}
      {/* ========================================================= */}
      {viewCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 text-white relative">
            <button
              onClick={() => setViewCert(null)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white font-black cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-2 pt-2">
              <Award className="w-16 h-16 text-amber-400 mx-auto" />
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono font-bold block">
                SMARTTECH OFFICIAL CERTIFICATE CARD
              </span>
              <h3 className="text-2xl font-black">{viewCert.studentName}</h3>
              <p className="text-xs text-slate-400 font-bold">{viewCert.courseName}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">CERTIFICATE NO:</span>
                <span className="text-amber-400 font-bold">{viewCert.certificateNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SERIAL NO:</span>
                <span className="text-cyan-400 font-bold">{viewCert.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">RESULT:</span>
                <span className="text-emerald-400 font-bold">{viewCert.result} ({viewCert.score})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">VERIFICATION KEY:</span>
                <span className="text-slate-300 font-bold">{viewCert.verificationId}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>تاريخ الإصدار: <strong className="text-white font-mono">{viewCert.issueDate}</strong></span>
              <a
                href={`/verify-certificate?id=${encodeURIComponent(viewCert.verificationId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" /> رابط التحقق العام
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REVOKE CERTIFICATE */}
      {/* ========================================================= */}
      {revokeCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="font-extrabold text-lg text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> إلغاء اعتماد الشهادة رقم ({revokeCert.certificateNumber})
            </h3>
            <p className="text-xs text-slate-300">
              سيتم تغيير حالة الشهادة بالسجل الرسمي إلى REVOKED وسوف يظهر ذلك فوراً للعموم وأصحاب العمل.
            </p>

            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1">سبب إلغاء الاعتماد الرسمي</label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                placeholder="اكتب سبب إلغاء الاعتماد (مثال: إلغاء القيد أو اكتشاف بيانات غير دقيقة)..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokeCert(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-5 py-2 bg-red-600 text-white font-extrabold text-xs rounded-xl shadow"
              >
                تأكيد إلغاء الاعتماد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
