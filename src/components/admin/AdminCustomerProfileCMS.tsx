import React, { useState, useEffect } from 'react';
import { 
  User, 
  Role, 
  AdminProfileSettingsConfig, 
  CustomerDocument, 
  CustomerIdentityDocument 
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { 
  fetchProfileSettingsConfig, 
  saveProfileSettingsConfig, 
  verifyCustomerDocumentStatus, 
  DEFAULT_PROFILE_SETTINGS 
} from '../../services/profileService';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Users, 
  ShieldCheck, 
  FileCheck, 
  Settings, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Lock, 
  Save, 
  Eye, 
  MessageSquare, 
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface AdminCustomerProfileCMSProps {
  currentUser: User | null;
}

export const AdminCustomerProfileCMS: React.FC<AdminCustomerProfileCMSProps> = ({ currentUser }) => {
  const { isArabic } = useLanguage();
  const [activeTab, setActiveTab] = useState<'verification' | 'settings' | 'directory'>('verification');

  // Customer Profiles list from Firestore
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected User for Detailed Admin Inspection
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Profile Settings Config
  const [config, setConfig] = useState<AdminProfileSettingsConfig>(DEFAULT_PROFILE_SETTINGS);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Verification Action Modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [docToVerify, setDocToVerify] = useState<{
    targetUserId: string;
    targetUserName: string;
    docId: string;
    docTitle: string;
    docType: 'educational' | 'identity';
    fileUrl?: string;
  } | null>(null);

  const [verifyStatus, setVerifyStatus] = useState<'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW'>('VERIFIED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Load Config & Users
  useEffect(() => {
    loadProfileConfig();
    loadUsers();
  }, []);

  const loadProfileConfig = async () => {
    try {
      const cfg = await fetchProfileSettingsConfig();
      setConfig(cfg);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: User[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as User);
      });
      setUsersList(list);
    } catch (err) {
      console.error('Error fetching users for admin profile CMS:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Save Settings Config
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await saveProfileSettingsConfig(config, currentUser?.email || 'admin');
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setSavingConfig(false);
    }
  };

  // Execute Document Verification
  const handleVerifySubmit = async () => {
    if (!docToVerify) return;
    setVerifying(true);
    try {
      await verifyCustomerDocumentStatus(
        docToVerify.targetUserId,
        docToVerify.docId,
        verifyStatus,
        currentUser?.email || 'admin',
        rejectionReason,
        internalNotes,
        docToVerify.docType
      );

      setVerifyModalOpen(false);
      setDocToVerify(null);
      setRejectionReason('');
      setInternalNotes('');

      // Refresh users list
      await loadUsers();
    } catch (err) {
      console.error('Error verifying doc:', err);
    } finally {
      setVerifying(false);
    }
  };

  // Gather all pending documents across all users
  const pendingEducationalDocs: { user: User; doc: CustomerDocument }[] = [];
  const pendingIdentityDocs: { user: User; doc: CustomerIdentityDocument }[] = [];

  usersList.forEach(u => {
    u.documents?.forEach(d => {
      if (d.verificationStatus === 'PENDING' || d.verificationStatus === 'NEEDS_REVIEW') {
        pendingEducationalDocs.push({ user: u, doc: d });
      }
    });
    u.identityDocuments?.forEach(idDoc => {
      if (idDoc.verificationStatus === 'PENDING' || idDoc.verificationStatus === 'NEEDS_REVIEW') {
        pendingIdentityDocs.push({ user: u, doc: idDoc });
      }
    });
  });

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-red-600" />
            <span>{isArabic ? 'إدارة وحوكمة ملفات العملاء والوثائق' : 'Customer Profile & Document Verification CMS'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isArabic ? 'مراجعة طلبات توثيق الشهادات، الهويات الشخصية، وإعدادات حقول ملف العميل' : 'Review educational & identity documents, verify customer records, and configure dynamic profile fields.'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          {[
            { id: 'verification', labelAr: 'مراجعة والتحقق من الوثائق', labelEn: 'Document Verification', icon: <FileCheck className="w-4 h-4" /> },
            { id: 'directory', labelAr: 'دليل ملفات العملاء', labelEn: 'Customer Profiles', icon: <Users className="w-4 h-4" /> },
            { id: 'settings', labelAr: 'إعدادات حقول الملف', labelEn: 'Profile Field Settings', icon: <Settings className="w-4 h-4" /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === t.id ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.icon}
              <span>{isArabic ? t.labelAr : t.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: DOCUMENT VERIFICATION QUEUE                           */}
      {/* ============================================================ */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Educational Documents Pending Queue */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                  <span>{isArabic ? 'الشهادات والمستندات التعليمية المعلقة' : 'Pending Educational Certificates'}</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-600">
                  {pendingEducationalDocs.length}
                </span>
              </div>

              {pendingEducationalDocs.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {pendingEducationalDocs.map(({ user, doc }) => (
                    <div key={doc.documentId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-red-500">{user.name} ({user.email})</p>
                          <h4 className="font-black text-slate-900 dark:text-white text-sm">{doc.title}</h4>
                          {doc.institution && <p className="text-xs text-slate-500">{doc.institution}</p>}
                        </div>
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setDocToVerify({
                            targetUserId: user.id,
                            targetUserName: user.name,
                            docId: doc.documentId,
                            docTitle: doc.title,
                            docType: 'educational',
                            fileUrl: doc.fileUrl
                          });
                          setVerifyModalOpen(true);
                        }}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                      >
                        {isArabic ? 'اتخاذ قرار واعتماد' : 'Review & Verify'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-xs text-slate-400">
                  {isArabic ? 'لا توجد شهادات تعليمية بانتظار المراجعة.' : 'No pending educational certificates.'}
                </p>
              )}
            </div>

            {/* Private Identity Documents Pending Queue */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-500" />
                  <span>{isArabic ? 'وثائق الهويات الشخصية (خاصة بمدير النظام)' : 'Private Identity Documents Queue'}</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500/20 text-red-600">
                  {pendingIdentityDocs.length}
                </span>
              </div>

              {pendingIdentityDocs.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {pendingIdentityDocs.map(({ user, doc: idDoc }) => (
                    <div key={idDoc.documentId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-red-500">{user.name} ({user.email})</p>
                          <h4 className="font-black text-slate-900 dark:text-white text-sm">{idDoc.identityType}</h4>
                          {idDoc.documentNumber && <p className="text-xs text-slate-500">ID: {idDoc.documentNumber}</p>}
                        </div>
                        {idDoc.fileUrl && (
                          <a href={idDoc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setDocToVerify({
                            targetUserId: user.id,
                            targetUserName: user.name,
                            docId: idDoc.documentId,
                            docTitle: idDoc.identityType,
                            docType: 'identity',
                            fileUrl: idDoc.fileUrl
                          });
                          setVerifyModalOpen(true);
                        }}
                        className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer transition"
                      >
                        {isArabic ? 'مراجعة الهوية السرية' : 'Review Identity Doc'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-xs text-slate-400">
                  {isArabic ? 'لا توجد هويات شخصية بانتظار المراجعة.' : 'No pending identity documents.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: CUSTOMER DIRECTORY                                    */}
      {/* ============================================================ */}
      {activeTab === 'directory' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={isArabic ? 'بحث بالاسم، البريد، أو الهاتف...' : 'Search customers...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">{filteredUsers.length} {isArabic ? 'عميل/مستخدم' : 'Customers'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right dir-rtl text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-black">
                <tr>
                  <th className="p-3 text-right">{isArabic ? 'الاسم والبريد' : 'Name & Email'}</th>
                  <th className="p-3 text-right">{isArabic ? 'الدور' : 'Role'}</th>
                  <th className="p-3 text-right">{isArabic ? 'الهاتف / الواتساب' : 'Phone'}</th>
                  <th className="p-3 text-right">{isArabic ? 'نسبة الاكتمال' : 'Completion'}</th>
                  <th className="p-3 text-right">{isArabic ? 'الشهادات' : 'Certificates'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{u.phone || 'N/A'}</td>
                    <td className="p-3 font-bold text-amber-500">{u.profileCompletionPercentage || 0}%</td>
                    <td className="p-3">{u.documents?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: DYNAMIC PROFILE FIELD SETTINGS                         */}
      {/* ============================================================ */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isArabic ? 'إعدادات حقول ملف العميل وشروط المرفقات' : 'Profile Fields & Document Limits Settings'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'الحد الأقصى لحجم الملفات المرفوعة (MB)' : 'Max File Size (MB)'}
              </label>
              <input
                type="number"
                value={config.maxFileSizeMB}
                onChange={e => setConfig({ ...config, maxFileSizeMB: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'الصيغ المسموحة' : 'Allowed File Extensions'}
              </label>
              <input
                type="text"
                value={config.allowedFileTypes.join(', ')}
                onChange={e => setConfig({ ...config, allowedFileTypes: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: VERIFY DOCUMENT DECISION                              */}
      {/* ============================================================ */}
      {verifyModalOpen && docToVerify && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isArabic ? 'البت في توثيق المستند' : 'Verify Document'}
            </h3>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs space-y-1">
              <p><strong>{isArabic ? 'العميل: ' : 'Customer: '}</strong>{docToVerify.targetUserName}</p>
              <p><strong>{isArabic ? 'الوثيقة: ' : 'Document: '}</strong>{docToVerify.docTitle}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'القرار' : 'Decision Status'}
              </label>
              <select
                value={verifyStatus}
                onChange={e => setVerifyStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
              >
                <option value="VERIFIED">{isArabic ? 'اعتماد المرفق (VERIFIED)' : 'Approve & Verify'}</option>
                <option value="REJECTED">{isArabic ? 'رفض المرفق (REJECTED)' : 'Reject Document'}</option>
                <option value="NEEDS_REVIEW">{isArabic ? 'يتطلب مراجعة إضافية (NEEDS_REVIEW)' : 'Needs Review'}</option>
              </select>
            </div>

            {verifyStatus === 'REJECTED' && (
              <div>
                <label className="block text-xs font-bold text-red-500 mb-1">
                  {isArabic ? 'سبب الرفض (يظهر للعميل)' : 'Rejection Reason (Visible to customer)'}
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                {isArabic ? 'ملاحظة إدارية داخلية (خاصة بطاقم العمل فقط)' : 'Internal Staff Notes (Private)'}
              </label>
              <textarea
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setVerifyModalOpen(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">{isArabic ? 'إلغاء' : 'Cancel'}</button>
              <button
                onClick={handleVerifySubmit}
                disabled={verifying}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black"
              >
                {verifying ? 'جاري الحفظ...' : 'تأكيد القرار'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
