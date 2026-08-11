import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Cpu, 
  Monitor, 
  Sparkles, 
  Users, 
  Globe, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  AlertTriangle, 
  RefreshCw, 
  MapPin, 
  Eye, 
  EyeOff, 
  FolderPlus,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  SmartTechCenterProfile, 
  SmartTechFacility, 
  SmartTechEquipment, 
  SmartTechService, 
  SmartTechStaffMember,
  SmartTechMediaItem,
  getSmartTechCenterProfile, 
  saveSmartTechCenterProfile, 
  getSmartTechFacilities, 
  saveSmartTechFacility, 
  deleteSmartTechFacility, 
  getSmartTechEquipment, 
  saveSmartTechEquipment, 
  deleteSmartTechEquipment, 
  getSmartTechServices, 
  saveSmartTechService, 
  deleteSmartTechService, 
  getSmartTechStaff, 
  saveSmartTechStaffMember, 
  deleteSmartTechStaffMember, 
  getSmartTechMediaLibrary, 
  saveSmartTechMediaItem, 
  deleteSmartTechMediaItem, 
  processDataMigrationImport,
  DataImportReport
} from '../../services/smarttechCenterService';
import { User } from '../../types';

interface SmartTechManagementCMSProps {
  currentUser: User | null;
}

export const SmartTechManagementCMS: React.FC<SmartTechManagementCMSProps> = ({ currentUser }) => {
  const { isArabic } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'PROFILE' | 'FACILITIES' | 'EQUIPMENT' | 'SERVICES' | 'STAFF' | 'MEDIA' | 'IMPORT'
  >('PROFILE');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Entity States
  const [profile, setProfile] = useState<SmartTechCenterProfile | null>(null);
  const [facilities, setFacilities] = useState<SmartTechFacility[]>([]);
  const [equipment, setEquipment] = useState<SmartTechEquipment[]>([]);
  const [services, setServices] = useState<SmartTechService[]>([]);
  const [staff, setStaff] = useState<SmartTechStaffMember[]>([]);
  const [mediaItems, setMediaItems] = useState<SmartTechMediaItem[]>([]);

  // Modals for Create/Edit
  const [editingFacility, setEditingFacility] = useState<SmartTechFacility | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<SmartTechEquipment | null>(null);
  const [editingService, setEditingService] = useState<SmartTechService | null>(null);
  const [editingStaff, setEditingStaff] = useState<SmartTechStaffMember | null>(null);

  // Data Migration Import state
  const [importTarget, setImportTarget] = useState<'FACILITIES' | 'EQUIPMENT' | 'SERVICES' | 'STAFF'>('FACILITIES');
  const [importJsonText, setImportJsonText] = useState('');
  const [importReport, setImportReport] = useState<DataImportReport | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [pData, fData, eData, sData, stData, mData] = await Promise.all([
        getSmartTechCenterProfile(),
        getSmartTechFacilities(),
        getSmartTechEquipment(),
        getSmartTechServices(),
        getSmartTechStaff(false), // include private staff
        getSmartTechMediaLibrary()
      ]);

      setProfile(pData);
      setFacilities(fData);
      setEquipment(eData);
      setServices(sData);
      setStaff(stData);
      setMediaItems(mData);
    } catch (err) {
      console.error('Failed to load admin SmartTech data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // 1. Save Center Profile
  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await saveSmartTechCenterProfile(profile, currentUser?.email || 'admin');
      showNotification(isArabic ? 'تم حفظ ملف مركز سمارتك بنجاح' : 'SmartTech Profile saved successfully');
    } catch (err) {
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  // 2. Save Facility
  const handleSaveFacility = async (fac: SmartTechFacility) => {
    setSaving(true);
    try {
      await saveSmartTechFacility(fac);
      setFacilities(await getSmartTechFacilities());
      setEditingFacility(null);
      showNotification(isArabic ? 'تم حفظ المرفق بنجاح' : 'Facility saved successfully');
    } catch (err) {
      alert('Error saving facility');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFacility = async (id: string) => {
    if (!confirm(isArabic ? 'هل أنت تأكد من حذف هذا المرفق؟' : 'Delete facility?')) return;
    try {
      await deleteSmartTechFacility(id);
      setFacilities(prev => prev.filter(f => f.facilityId !== id));
      showNotification(isArabic ? 'تم حذف المرفق' : 'Facility deleted');
    } catch (err) {
      alert('Error deleting facility');
    }
  };

  // 3. Save Equipment
  const handleSaveEquipment = async (eq: SmartTechEquipment) => {
    setSaving(true);
    try {
      await saveSmartTechEquipment(eq);
      setEquipment(await getSmartTechEquipment());
      setEditingEquipment(null);
      showNotification(isArabic ? 'تم حفظ الجهاز/المعدة بنجاح' : 'Equipment saved successfully');
    } catch (err) {
      alert('Error saving equipment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm(isArabic ? 'حذف هذا الجهاز من السجل؟' : 'Delete equipment?')) return;
    try {
      await deleteSmartTechEquipment(id);
      setEquipment(prev => prev.filter(e => e.id !== id));
      showNotification(isArabic ? 'تم الحذف' : 'Deleted');
    } catch (err) {
      alert('Error deleting');
    }
  };

  // 4. Save Service
  const handleSaveService = async (srv: SmartTechService) => {
    setSaving(true);
    try {
      await saveSmartTechService(srv);
      setServices(await getSmartTechServices());
      setEditingService(null);
      showNotification(isArabic ? 'تم حفظ الخدمة بنجاح' : 'Service saved successfully');
    } catch (err) {
      alert('Error saving service');
    } fontally: {
      setSaving(false);
    }
  };

  // 5. Save Staff
  const handleSaveStaff = async (s: SmartTechStaffMember) => {
    setSaving(true);
    try {
      await saveSmartTechStaffMember(s);
      setStaff(await getSmartTechStaff(false));
      setEditingStaff(null);
      showNotification(isArabic ? 'تم حفظ بيانات الموظف/المدرب' : 'Staff member saved successfully');
    } catch (err) {
      alert('Error saving staff');
    } finally {
      setSaving(false);
    }
  };

  // 6. Process Import
  const handleExecuteImport = async () => {
    if (!importJsonText.trim()) {
      alert('Please paste valid JSON data array');
      return;
    }

    setImporting(true);
    try {
      const parsed = JSON.parse(importJsonText);
      const dataArr = Array.isArray(parsed) ? parsed : [parsed];
      const rep = await processDataMigrationImport(importTarget, dataArr, currentUser?.email || 'admin');
      setImportReport(rep);
      await loadAllAdminData();
      showNotification(isArabic ? 'تم تنفيذ عملية الاستيراد والمزامنة بنجاح' : 'Import processed successfully');
    } catch (err: any) {
      alert('Invalid JSON format: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">
          {isArabic ? 'جاري تحميل لوحة إدارة مركز سمارتك...' : 'Loading SmartTech CMS Panel...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-red-600" />
            <span>{isArabic ? 'إدارة مركز سمارتك والمحتوى الموثق' : 'SmartTech Center & Asset CMS'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isArabic ? 'التحكم الكامل في بيانات المركز الرسمية، المختبرات، الأجهزة، الخدمات، الموظفين، وأداة استيراد البيانات.' : 'Full administrative control over SmartTech official profile, labs, equipment, staff, and migration tools.'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          {[
            { id: 'PROFILE', labelAr: 'ملف المركز', labelEn: 'Profile & Info', icon: <Building2 className="w-4 h-4" /> },
            { id: 'FACILITIES', labelAr: 'المختبرات (Facilities)', labelEn: 'Labs & Rooms', icon: <Monitor className="w-4 h-4" /> },
            { id: 'EQUIPMENT', labelAr: 'الأجهزة (Equipment)', labelEn: 'Devices', icon: <Cpu className="w-4 h-4" /> },
            { id: 'SERVICES', labelAr: 'الخدمات (Services)', labelEn: 'Services', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'STAFF', labelAr: 'الطاقم (Staff)', labelEn: 'Staff', icon: <Users className="w-4 h-4" /> },
            { id: 'IMPORT', labelAr: 'استيراد البيانات', labelEn: 'Data Import', icon: <FileSpreadsheet className="w-4 h-4" /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === t.id ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.icon}
              <span>{isArabic ? t.labelAr : t.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Toast */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: CENTER PROFILE & INFORMATION                          */}
      {/* ============================================================ */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-5xl">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isArabic ? 'بيانات وهوية مركز سمارتك الرسمية' : 'Official SmartTech Profile Settings'}
            </h3>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ البيانات'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'اسم المركز (بالعربية)' : 'Center Name (Arabic)'}
              </label>
              <input
                type="text"
                value={profile.centerNameAr}
                onChange={e => setProfile({ ...profile, centerNameAr: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'اسم المركز (بالإنجليزية)' : 'Center Name (English)'}
              </label>
              <input
                type="text"
                value={profile.centerNameEn}
                onChange={e => setProfile({ ...profile, centerNameEn: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'الاسم الرسمي المسجل' : 'Official Legal Name'}
              </label>
              <input
                type="text"
                value={profile.officialNameAr}
                onChange={e => setProfile({ ...profile, officialNameAr: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'تاريخ التأسيس' : 'Founded Date'}
              </label>
              <input
                type="date"
                value={profile.foundedDate}
                onChange={e => setProfile({ ...profile, foundedDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'رقم الهاتف الرئيسي' : 'Main Phone'}
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'رقم الواتساب للتواصل' : 'WhatsApp Contact'}
              </label>
              <input
                type="text"
                value={profile.whatsapp}
                onChange={e => setProfile({ ...profile, whatsapp: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'رابط الموقع على خرائط جوجل (Google Maps Location)' : 'Google Maps Location URL'}
              </label>
              <input
                type="text"
                value={profile.googleMapsUrl}
                onChange={e => setProfile({ ...profile, googleMapsUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'قصة وتاريخ المركز (History)' : 'Center History'}
              </label>
              <textarea
                value={profile.historyAr}
                onChange={e => setProfile({ ...profile, historyAr: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'الرسالة (Mission)' : 'Mission Statement'}
              </label>
              <textarea
                value={profile.missionAr}
                onChange={e => setProfile({ ...profile, missionAr: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'الرؤية (Vision)' : 'Vision Statement'}
              </label>
              <textarea
                value={profile.visionAr}
                onChange={e => setProfile({ ...profile, visionAr: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: FACILITIES & ROOMS                                    */}
      {/* ============================================================ */}
      {activeTab === 'FACILITIES' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isArabic ? 'إدارة قاعات ومختبرات المركز' : 'Manage Facilities & Labs'}
            </h3>
            <button
              onClick={() => setEditingFacility({
                facilityId: `fac_${Date.now()}`,
                nameAr: '',
                nameEn: '',
                descriptionAr: '',
                descriptionEn: '',
                category: 'TRAINING_ROOM',
                capacity: 20,
                image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
                equipment: [],
                features: [],
                status: 'ACTIVE',
                displayOrder: facilities.length + 1,
                published: true
              })}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{isArabic ? 'إضافة مرفق جديد' : 'Add Facility'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {facilities.map(f => (
              <div key={f.facilityId} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-600">
                      {f.category}
                    </span>
                    <h4 className="font-black text-base text-slate-900 dark:text-white mt-1">{f.nameAr}</h4>
                    <p className="text-xs text-slate-500">{f.nameEn}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingFacility(f)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteFacility(f.facilityId)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{f.descriptionAr}</p>

                <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-2 border-t">
                  <span>{isArabic ? 'السعة:' : 'Capacity:'} {f.capacity} {isArabic ? 'طالب' : 'Seats'}</span>
                  <span className={f.published ? 'text-emerald-500' : 'text-slate-400'}>{f.published ? 'منشور' : 'مسودة'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: DEVICES & EQUIPMENT                                   */}
      {/* ============================================================ */}
      {activeTab === 'EQUIPMENT' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isArabic ? 'سجل الأجهزة والتجهيزات' : 'Manage Equipment Inventory'}
            </h3>
            <button
              onClick={() => setEditingEquipment({
                id: `eq_${Date.now()}`,
                nameAr: '',
                nameEn: '',
                category: 'COMPUTER',
                quantity: 1,
                descriptionAr: '',
                descriptionEn: '',
                image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&auto=format&fit=crop&q=80',
                status: 'AVAILABLE',
                location: 'Main Lab',
                specifications: {},
                availableForStudents: true,
                published: true
              })}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{isArabic ? 'تسجيل جهاز/معدة جديدة' : 'Add Equipment'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map(e => (
              <div key={e.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600">
                      {e.category}
                    </span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">{e.nameAr}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingEquipment(e)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-xl">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteEquipment(e.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500">{isArabic ? 'العدد:' : 'Quantity:'} {e.quantity}x</span>
                  <span className="text-emerald-500">{e.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: DATA IMPORT & MIGRATION TOOL                           */}
      {/* ============================================================ */}
      {activeTab === 'IMPORT' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-red-600" />
              <span>{isArabic ? 'أداة استيراد ومزامنة البيانات الحقيقية' : 'Real Data Migration & Import Tool'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isArabic ? 'استيراد السجلات والمرافق والمعدات دفعة واحدة مع الفحص التلقائي وتجنب التكرار.' : 'Batch import facilities, equipment, services, or staff with validation and duplicate checks.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'اختر الكيان المستهدف للاستيراد' : 'Target Entity'}
              </label>
              <select
                value={importTarget}
                onChange={e => setImportTarget(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
              >
                <option value="FACILITIES">{isArabic ? 'المختبرات والمرافق (Facilities)' : 'Facilities & Labs'}</option>
                <option value="EQUIPMENT">{isArabic ? 'سجل الأجهزة والمعدات (Equipment)' : 'Equipment Inventory'}</option>
                <option value="SERVICES">{isArabic ? 'الخدمات والبرامج (Services)' : 'Services'}</option>
                <option value="STAFF">{isArabic ? 'الطاقم الأكاديمي (Staff)' : 'Staff & Instructors'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isArabic ? 'الصق مصفوفة البيانات (JSON Array Data)' : 'Paste JSON Array Data'}
            </label>
            <textarea
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              rows={8}
              placeholder={`[\n  {\n    "nameAr": "مختبر جديد",\n    "category": "COMPUTER_LAB",\n    "capacity": 30\n  }\n]`}
              className="w-full p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800"
            />
          </div>

          <button
            onClick={handleExecuteImport}
            disabled={importing}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl transition cursor-pointer shadow-lg"
          >
            {importing ? 'جاري الاستيراد والمزامنة...' : 'تشغيل الاستيراد والمزامنة مباشرة'}
          </button>

          {importReport && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border space-y-2 text-xs">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">{isArabic ? 'تقرير نتائج الاستيراد:' : 'Import Execution Report:'}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-bold">
                <span className="text-emerald-500">تم الاستيراد: {importReport.importedCount}</span>
                <span className="text-amber-500">تم التحديث: {importReport.updatedCount}</span>
                <span className="text-slate-400">تم التجاهل: {importReport.skippedCount}</span>
                <span className="text-red-500">فشل/غير صالح: {importReport.invalidCount}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Edit Facility */}
      {editingFacility && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isArabic ? 'تعديل / إضافة مرفق' : 'Edit Facility'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isArabic ? 'الاسم بالعربية' : 'Name (Arabic)'}</label>
                <input
                  type="text"
                  value={editingFacility.nameAr}
                  onChange={e => setEditingFacility({ ...editingFacility, nameAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isArabic ? 'النوع / الفئة' : 'Category'}</label>
                <select
                  value={editingFacility.category}
                  onChange={e => setEditingFacility({ ...editingFacility, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                >
                  <option value="TRAINING_ROOM">TRAINING_ROOM</option>
                  <option value="COMPUTER_LAB">COMPUTER_LAB</option>
                  <option value="ROBOTICS_LAB">ROBOTICS_LAB</option>
                  <option value="INTERACTIVE_LAB">INTERACTIVE_LAB</option>
                  <option value="RECEPTION">RECEPTION</option>
                  <option value="STUDENT_AREA">STUDENT_AREA</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isArabic ? 'السعة الاستيعابية (سعة الطلاب)' : 'Capacity'}</label>
                <input
                  type="number"
                  value={editingFacility.capacity}
                  onChange={e => setEditingFacility({ ...editingFacility, capacity: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isArabic ? 'رابط الصورة' : 'Image URL'}</label>
                <input
                  type="text"
                  value={editingFacility.image}
                  onChange={e => setEditingFacility({ ...editingFacility, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingFacility(null)} className="px-4 py-2 text-xs font-bold text-slate-500">إلغاء</button>
              <button
                onClick={() => handleSaveFacility(editingFacility)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black"
              >
                حفظ المرفق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Equipment */}
      {editingEquipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isArabic ? 'تعديل / إضافة جهاز' : 'Edit Equipment'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isArabic ? 'اسم الجهاز/المعدة' : 'Equipment Name'}</label>
                <input
                  type="text"
                  value={editingEquipment.nameAr}
                  onChange={e => setEditingEquipment({ ...editingEquipment, nameAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isArabic ? 'الفئة' : 'Category'}</label>
                  <select
                    value={editingEquipment.category}
                    onChange={e => setEditingEquipment({ ...editingEquipment, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="COMPUTER">COMPUTER</option>
                    <option value="LAPTOP">LAPTOP</option>
                    <option value="PROJECTOR">PROJECTOR</option>
                    <option value="ARDUINO">ARDUINO</option>
                    <option value="RASPBERRY_PI">RASPBERRY_PI</option>
                    <option value="ESP">ESP</option>
                    <option value="ROBOTICS">ROBOTICS</option>
                    <option value="NETWORKING">NETWORKING</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">{isArabic ? 'الكمية الفعالية' : 'Quantity'}</label>
                  <input
                    type="number"
                    value={editingEquipment.quantity}
                    onChange={e => setEditingEquipment({ ...editingEquipment, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isArabic ? 'الموقع داخل المركز' : 'Location'}</label>
                <input
                  type="text"
                  value={editingEquipment.location}
                  onChange={e => setEditingEquipment({ ...editingEquipment, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingEquipment(null)} className="px-4 py-2 text-xs font-bold text-slate-500">إلغاء</button>
              <button
                onClick={() => handleSaveEquipment(editingEquipment)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black"
              >
                حفظ الجهاز
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
