import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertTriangle, XCircle, RefreshCw, 
  ArrowRight, ArrowLeft, Database, ShieldCheck, Download, Search, Check, AlertCircle 
} from 'lucide-react';
import { Certificate, CertificateImportBatch, CertificateImportRow, Course } from '../../types';
import { 
  saveCertificateImportBatchToFirestore, bulkSaveCertificatesToFirestore, 
  fetchCertificatesFromFirestore, fetchAllUsersFromFirestore, checkDuplicateCertificateNumberOrSerial 
} from '../../services/firebaseService';

interface CertificateBulkImporterProps {
  courses?: Course[];
  onComplete?: () => void;
}

const SMARTTECH_CERT_FIELDS: { key: string; labelAr: string; required: boolean; defaultVal?: string }[] = [
  { key: 'certificateNumber', labelAr: 'رقم الشهادة (Certificate Number)', required: false },
  { key: 'serialNumber', labelAr: 'الرقم التسلسلي (Serial Number)', required: false },
  { key: 'verificationId', labelAr: 'رمز التحقق (Verification ID)', required: false },
  { key: 'studentName', labelAr: 'اسم الطالب (Student Name)', required: true },
  { key: 'studentNameAr', labelAr: 'اسم الطالب بالعربية', required: false },
  { key: 'studentEmail', labelAr: 'البريد الإلكتروني للطالب', required: false },
  { key: 'courseName', labelAr: 'اسم الدورة / الكورس (Course Name)', required: true },
  { key: 'courseCode', labelAr: 'كود الكورس (Course Code)', required: false },
  { key: 'score', labelAr: 'الدرجة / المجموع (Score)', required: false, defaultVal: '95%' },
  { key: 'result', labelAr: 'النتيجة (Passed / Distinction)', required: true, defaultVal: 'Passed' },
  { key: 'issueDate', labelAr: 'تاريخ الإصدار (Issue Date)', required: false, defaultVal: new Date().toISOString().split('T')[0] },
  { key: 'instructorName', labelAr: 'اسم المدرب (Instructor Name)', required: false, defaultVal: 'مهندس م. سمارتك' },
  { key: 'notes', labelAr: 'ملاحظات إضافية', required: false }
];

export const CertificateBulkImporter: React.FC<CertificateBulkImporterProps> = ({ courses = [], onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState<string>('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  
  // Step 2: Mapping state
  const [mapping, setMapping] = useState<Record<string, string>>({});
  
  // Step 3: Validation & Preview State
  const [parsedRows, setParsedRows] = useState<CertificateImportRow[]>([]);
  const [duplicateHandling, setDuplicateHandling] = useState<'SKIP' | 'UPDATE' | 'NEW_NUMBER'>('SKIP');
  const [existingCerts, setExistingCerts] = useState<Certificate[]>([]);
  const [validating, setValidating] = useState<boolean>(false);
  
  // Step 4: Import execution
  const [importing, setImporting] = useState<boolean>(false);
  const [batchResult, setBatchResult] = useState<CertificateImportBatch | null>(null);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          alert('الملف فارغ أو لا يحتوي على صفوف بيانات.');
          return;
        }

        const headers = (jsonData[0] as string[]).map((h) => String(h || '').trim());
        const dataRows = jsonData.slice(1).map((rowArray: any) => {
          const rowObj: Record<string, any> = {};
          headers.forEach((h, idx) => {
            if (h) rowObj[h] = rowArray[idx] !== undefined ? rowArray[idx] : '';
          });
          return rowObj;
        }).filter((row) => Object.values(row).some((val) => val !== ''));

        setRawHeaders(headers);
        setRawRows(dataRows);

        // Auto-detect mappings based on header text
        const initialMapping: Record<string, string> = {};
        SMARTTECH_CERT_FIELDS.forEach((field) => {
          const fieldKeyLower = field.key.toLowerCase();
          const matchedHeader = headers.find((h) => {
            const hLower = h.toLowerCase();
            return hLower.includes(fieldKeyLower) || 
                   (fieldKeyLower.includes('student') && (hLower.includes('طالب') || hLower.includes('اسم'))) ||
                   (fieldKeyLower.includes('course') && (hLower.includes('كورس') || hLower.includes('دورة'))) ||
                   (fieldKeyLower.includes('number') && (hLower.includes('رقم') || hLower.includes('شهادة'))) ||
                   (fieldKeyLower.includes('score') && (hLower.includes('درجة') || hLower.includes('مجموع'))) ||
                   (fieldKeyLower.includes('result') && (hLower.includes('نتيجة') || hLower.includes('تقدير')));
          });
          if (matchedHeader) {
            initialMapping[field.key] = matchedHeader;
          }
        });

        setMapping(initialMapping);
        setStep(2);
      } catch (err) {
        console.error('Error reading file:', err);
        alert('حدث خطأ أثناء قراءة الملف. يرجى التأكد من بصيغة CSV أو XLSX صحيح.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Run Validation
  const runValidation = async () => {
    setValidating(true);
    try {
      const fetchedCerts = await fetchCertificatesFromFirestore();
      setExistingCerts(fetchedCerts);

      const rows: CertificateImportRow[] = [];

      for (let index = 0; index < rawRows.length; index++) {
        const raw = rawRows[index];
        const errors: string[] = [];
        let status: 'VALID' | 'WARNING' | 'ERROR' | 'DUPLICATE' = 'VALID';

        const certNum = raw[mapping['certificateNumber']] || `ST-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const serialNum = raw[mapping['serialNumber']] || `SN-${Math.floor(1000000 + Math.random() * 9000000)}`;
        const studentName = raw[mapping['studentName']] || '';
        const courseName = raw[mapping['courseName']] || '';
        const score = raw[mapping['score']] || '95%';
        const result = raw[mapping['result']] || 'Passed';
        const issueDate = raw[mapping['issueDate']] || new Date().toISOString().split('T')[0];
        const instructorName = raw[mapping['instructorName']] || 'مهندس م. سمارتك';

        if (!studentName.trim()) {
          errors.push('اسم الطالب مفقود.');
          status = 'ERROR';
        }

        if (!courseName.trim()) {
          errors.push('اسم الكورس مفقود.');
          status = 'ERROR';
        }

        // Check duplicates
        const existingCertMatch = fetchedCerts.find(
          (c) => 
            (c.certificateNumber && c.certificateNumber.trim().toLowerCase() === String(certNum).trim().toLowerCase()) ||
            (c.serialNumber && c.serialNumber.trim().toLowerCase() === String(serialNum).trim().toLowerCase())
        );

        let duplicateDetails = '';
        if (existingCertMatch) {
          status = 'DUPLICATE';
          duplicateDetails = `شهادة موجودة مسبقاً باسم (${existingCertMatch.studentName}) - رقم: ${existingCertMatch.certificateNumber}`;
        }

        const parsedCert: Partial<Certificate> = {
          certificateNumber: String(certNum).trim(),
          serialNumber: String(serialNum).trim(),
          verificationId: `vKey-${Math.random().toString(36).substr(2, 8)}-${Date.now().toString().slice(-4)}`,
          studentName: String(studentName).trim(),
          studentNameAr: String(studentName).trim(),
          studentEmail: String(raw[mapping['studentEmail']] || '').trim(),
          courseName: String(courseName).trim(),
          courseTitleAr: String(courseName).trim(),
          courseCode: String(raw[mapping['courseCode']] || '').trim(),
          score: String(score).trim(),
          result: String(result).trim(),
          issueDate: String(issueDate).trim(),
          instructorName: String(instructorName).trim(),
          status: 'VALID'
        };

        rows.push({
          rowNumber: index + 1,
          rawData: raw,
          parsedCertificate: parsedCert,
          validationStatus: status,
          validationErrors: errors,
          duplicateDetails
        });
      }

      setParsedRows(rows);
      setStep(3);
    } catch (err) {
      console.error('Validation error:', err);
      alert('حدث خطأ أثناء إجراء المطابقة والتحقق.');
    } finally {
      setValidating(false);
    }
  };

  // Execute Import
  const executeImport = async () => {
    setImporting(true);
    try {
      const usersList = await fetchAllUsersFromFirestore();
      const certsToSave: Partial<Certificate>[] = [];

      let countSuccess = 0;
      let countFailed = 0;
      let countDuplicate = 0;
      let countWarning = 0;

      for (const item of parsedRows) {
        if (item.validationStatus === 'ERROR') {
          countFailed++;
          continue;
        }

        if (item.validationStatus === 'DUPLICATE') {
          countDuplicate++;
          if (duplicateHandling === 'SKIP') {
            continue;
          }
        }

        let cert = { ...item.parsedCertificate };

        if (item.validationStatus === 'DUPLICATE' && duplicateHandling === 'NEW_NUMBER') {
          cert.certificateNumber = `ST-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
          cert.serialNumber = `SN-${Math.floor(1000000 + Math.random() * 9000000)}`;
        }

        // Auto-link with student profile if email matches
        if (cert.studentEmail) {
          const matchedUser = usersList.find((u) => u.email && u.email.toLowerCase() === cert.studentEmail?.toLowerCase());
          if (matchedUser) {
            cert.studentId = matchedUser.id;
          }
        }

        certsToSave.push(cert);
        countSuccess++;
      }

      if (certsToSave.length > 0) {
        await bulkSaveCertificatesToFirestore(certsToSave);
      }

      // Record batch log
      const batchLog = await saveCertificateImportBatchToFirestore({
        fileName,
        totalRows: parsedRows.length,
        successfulRows: countSuccess,
        failedRows: countFailed,
        duplicateRows: countDuplicate,
        warningRows: countWarning,
        status: 'COMPLETED'
      });

      setBatchResult(batchLog);
      setStep(4);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Import error:', err);
      alert('حدث خطأ أثناء حفظ الشهادات المستوردة.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 text-right text-slate-100 dir-rtl">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6 overflow-x-auto">
        {[
          { num: 1, title: 'رفع الملف (CSV/Excel)', desc: 'اختيار ملف الدفعة' },
          { num: 2, title: 'مطابقة الأعمدة', desc: 'ربط بيانات الشهادة' },
          { num: 3, title: 'المعاينة والتدقيق', desc: 'كشف التكرار والأخطاء' },
          { num: 4, title: 'نتيجة الاستيراد', desc: 'التقرير والسجل التراكمي' }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-3 min-w-[180px]">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition ${
              step === s.num
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/20'
                : step > s.num
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}>
              {step > s.num ? <Check className="w-5 h-5" /> : s.num}
            </div>
            <div>
              <p className={`text-xs font-extrabold ${step === s.num ? 'text-amber-400' : 'text-slate-300'}`}>{s.title}</p>
              <p className="text-[10px] text-slate-500">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* STEP 1: FILE UPLOAD */}
      {step === 1 && (
        <div className="space-y-6 text-center max-w-2xl mx-auto py-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
            <FileSpreadsheet className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">رفع ملف الشهادات الجماعي</h3>
            <p className="text-xs text-slate-400 mt-2">
              يرجى رفع ملف Excel (.xlsx / .xls) أو CSV يحتوي على بيانات الشهادات والطلاب للتحقق والتخزين الفوري في Firebase.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-950/50 rounded-3xl p-10 transition group cursor-pointer relative">
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="space-y-3 pointer-events-none">
              <Upload className="w-10 h-10 text-slate-500 group-hover:text-amber-400 mx-auto transition" />
              <p className="text-sm font-bold text-slate-300">اضغط هنا لاختيار الملف أو قم بسحبه وإسقاطه</p>
              <p className="text-[10px] text-slate-500">يدعم صيغ .xlsx و .csv حتى حجم 20MB</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-right space-y-1">
            <p className="font-bold text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> تعليمات الاستيراد الآمن:
            </p>
            <p className="text-slate-400 text-[11px]">• تأكد من احتواء الصف الأول على أسماء الأعمدة (Header Row).</p>
            <p className="text-slate-400 text-[11px]">• يجب توفر اسم الطالب اسم الكورس كحد أدنى للإصدار.</p>
            <p className="text-slate-400 text-[11px]">• يقوم النظام تلقائياً بكشف الأرقام المكررة وتوليد روابط التوثيق بالـ QR.</p>
          </div>
        </div>
      )}

      {/* STEP 2: FIELD MAPPING */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">اسم الملف: <span className="text-amber-400">{fileName}</span></p>
              <p className="text-[10px] text-slate-400">تم التعرف على {rawHeaders.length} عموداً و {rawRows.length} صف بيانات.</p>
            </div>
            <button 
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              تغيير الملف <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-amber-400">مطابقة حقول سمارت تك مع أعمدة الملف:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SMARTTECH_CERT_FIELDS.map((field) => (
                <div key={field.key} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      {field.labelAr} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    <span className="text-[10px] text-slate-500">{field.key}</span>
                  </div>
                  <select
                    value={mapping[field.key] || ''}
                    onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
                  >
                    <option value="">-- اختر العمود المقابل --</option>
                    {rawHeaders.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl hover:bg-slate-700 transition cursor-pointer"
            >
              السابق
            </button>
            <button
              onClick={runValidation}
              disabled={validating}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-2xl hover:from-amber-400 hover:to-amber-500 transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {validating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'فحص ومطابقة البيانات 🔍'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW & VALIDATION */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-bold">إجمالي الصفوف</p>
              <p className="text-2xl font-black text-white">{parsedRows.length}</p>
            </div>
            <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/30 text-center">
              <p className="text-[10px] text-emerald-400 font-bold">جاهز للاستيراد</p>
              <p className="text-2xl font-black text-emerald-400">
                {parsedRows.filter((r) => r.validationStatus === 'VALID').length}
              </p>
            </div>
            <div className="bg-amber-950/20 p-4 rounded-2xl border border-amber-500/30 text-center">
              <p className="text-[10px] text-amber-400 font-bold">سجلات مكررة</p>
              <p className="text-2xl font-black text-amber-400">
                {parsedRows.filter((r) => r.validationStatus === 'DUPLICATE').length}
              </p>
            </div>
            <div className="bg-red-950/20 p-4 rounded-2xl border border-red-500/30 text-center">
              <p className="text-[10px] text-red-400 font-bold">صفوف بها أخطاء</p>
              <p className="text-2xl font-black text-red-400">
                {parsedRows.filter((r) => r.validationStatus === 'ERROR').length}
              </p>
            </div>
          </div>

          {/* Duplicate Conflict Resolution selector */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <p className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> خيارات التعامل مع الشهادات المكررة:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 'SKIP', label: 'تجاهل المكرر (تخطي)', desc: 'عدم إعادة استيراد الشهادات الموجودة مسبقاً' },
                { key: 'UPDATE', label: 'تحديث البياتات الحالية', desc: 'استبدال بيانات الشهادات القديمة بالجديدة' },
                { key: 'NEW_NUMBER', label: 'توليد أرقام شهادات جديدة', desc: 'إصدار أرقام تسلسلية جديدة للجميع' }
              ].map((opt) => (
                <label key={opt.key} className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                  duplicateHandling === opt.key 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input 
                    type="radio" 
                    name="dups" 
                    checked={duplicateHandling === opt.key} 
                    onChange={() => setDuplicateHandling(opt.key as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] opacity-70">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">رقم الشهادة</th>
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">الكورس</th>
                  <th className="p-3">تاريخ الإصدار</th>
                  <th className="p-3">الملاحظات / الأخطاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {parsedRows.slice(0, 50).map((row) => (
                  <tr key={row.rowNumber} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 font-mono text-slate-500">{row.rowNumber}</td>
                    <td className="p-3">
                      {row.validationStatus === 'VALID' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                          صالح ✅
                        </span>
                      )}
                      {row.validationStatus === 'DUPLICATE' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                          مكرر ⚠️
                        </span>
                      )}
                      {row.validationStatus === 'ERROR' && (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold text-[10px] border border-red-500/20">
                          خطأ ❌
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">{row.parsedCertificate?.certificateNumber}</td>
                    <td className="p-3 font-bold text-white">{row.parsedCertificate?.studentName}</td>
                    <td className="p-3 text-slate-300">{row.parsedCertificate?.courseName}</td>
                    <td className="p-3 text-slate-400">{row.parsedCertificate?.issueDate}</td>
                    <td className="p-3 text-[11px]">
                      {row.validationErrors.length > 0 && (
                        <span className="text-red-400">{row.validationErrors.join(', ')}</span>
                      )}
                      {row.duplicateDetails && (
                        <span className="text-amber-400">{row.duplicateDetails}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl hover:bg-slate-700 transition cursor-pointer"
            >
              رجوع للمطابقة
            </button>
            <button
              onClick={executeImport}
              disabled={importing || parsedRows.filter((r) => r.validationStatus !== 'ERROR').length === 0}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black text-xs rounded-2xl hover:from-emerald-400 hover:to-emerald-500 transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'بدء معالجة واستيراد البيانات 🚀'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: IMPORT COMPLETE REPORT */}
      {step === 4 && batchResult && (
        <div className="space-y-6 text-center py-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-2xl">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">تم استيراد دفعة الشهادات بنجاح!</h3>
            <p className="text-xs text-slate-400 mt-2">
              تم تحديث قاعدة بيانات Firebase وحفظ سجل التغييرات والربط الفوري بروابط الـ QR الرسمية.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-[10px] text-slate-400">إجمالي المعالجة</p>
              <p className="text-xl font-black text-white">{batchResult.totalRows}</p>
            </div>
            <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/30">
              <p className="text-[10px] text-emerald-400">تم حفظها بنجاح</p>
              <p className="text-xl font-black text-emerald-400">{batchResult.successfulRows}</p>
            </div>
            <div className="bg-amber-950/20 p-4 rounded-2xl border border-amber-500/30">
              <p className="text-[10px] text-amber-400">مكررة (تخطي/تحديث)</p>
              <p className="text-xl font-black text-amber-400">{batchResult.duplicateRows}</p>
            </div>
            <div className="bg-red-950/20 p-4 rounded-2xl border border-red-500/30">
              <p className="text-[10px] text-red-400">فشلت / بها أخطاء</p>
              <p className="text-xl font-black text-red-400">{batchResult.failedRows}</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 pt-4">
            <button
              onClick={() => {
                setStep(1);
                setParsedRows([]);
                setBatchResult(null);
              }}
              className="px-6 py-3 bg-slate-800 text-slate-200 font-bold text-xs rounded-2xl hover:bg-slate-700 transition cursor-pointer"
            >
              استيراد دفعة أخرى 📄
            </button>
            <button
              onClick={() => {
                if (onComplete) onComplete();
              }}
              className="px-8 py-3 bg-amber-500 text-slate-950 font-black text-xs rounded-2xl hover:bg-amber-400 transition cursor-pointer shadow-lg"
            >
              الذهاب لسجل الشهادات 📜
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
