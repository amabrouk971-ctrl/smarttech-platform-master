import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, EyeOff, MoveUp, MoveDown, Plus, Trash2, Globe, Layers, Bot, Compass, Sparkles, Check, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  EcosystemPlatform, SmartGuideConfig, HomepageSectionConfig, FoundationPathConfig,
  fetchEcosystemPlatformsFromFirestore, saveEcosystemPlatformToFirestore, deleteEcosystemPlatformFromFirestore,
  fetchSmartGuideConfigFromFirestore, saveSmartGuideConfigToFirestore,
  fetchFoundationPathConfigFromFirestore, saveFoundationPathConfigToFirestore,
  fetchHomepageSectionsFromFirestore, saveHomepageSectionsToFirestore,
  DEFAULT_ECOSYSTEM_PLATFORMS, DEFAULT_SMART_GUIDE, DEFAULT_FOUNDATION_PATH_CONFIG, DEFAULT_HOMEPAGE_SECTIONS
} from '../../services/homepageCMS';

export const HomepageBuilderCMS: React.FC = () => {
  const { isArabic } = useLanguage();

  const [activeTab, setActiveTab] = useState<'SECTIONS' | 'PLATFORMS' | 'SMART_GUIDE' | 'FOUNDATION'>('SECTIONS');
  
  const [sections, setSections] = useState<HomepageSectionConfig[]>([]);
  const [platforms, setPlatforms] = useState<EcosystemPlatform[]>([]);
  const [smartGuide, setSmartGuide] = useState<SmartGuideConfig>(DEFAULT_SMART_GUIDE);
  const [foundationConfig, setFoundationConfig] = useState<FoundationPathConfig>(DEFAULT_FOUNDATION_PATH_CONFIG);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Editing platform modal state
  const [editingPlatform, setEditingPlatform] = useState<EcosystemPlatform | null>(null);

  useEffect(() => {
    loadAllCMSData();
  }, []);

  const loadAllCMSData = async () => {
    setLoading(true);
    try {
      const [secData, platData, guideData, foundData] = await Promise.all([
        fetchHomepageSectionsFromFirestore(),
        fetchEcosystemPlatformsFromFirestore(),
        fetchSmartGuideConfigFromFirestore(),
        fetchFoundationPathConfigFromFirestore()
      ]);

      setSections(secData);
      setPlatforms(platData);
      setSmartGuide(guideData);
      setFoundationConfig(foundData);
    } catch (err) {
      console.error('Failed to load Homepage CMS Data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSections = async () => {
    setSaving(true);
    try {
      await saveHomepageSectionsToFirestore(sections);
      showNotice(isArabic ? 'تم حفظ ترتيب وإعدادات أجزاء الصفحة بنجاح' : 'Sections saved successfully');
    } catch (err) {
      alert('Error saving sections');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSmartGuide = async () => {
    setSaving(true);
    try {
      await saveSmartGuideConfigToFirestore(smartGuide);
      showNotice(isArabic ? 'تم حفظ إعدادات الموجه الذكي بنجاح' : 'Smart Guide saved successfully');
    } catch (err) {
      alert('Error saving Smart Guide');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFoundationConfig = async () => {
    setSaving(true);
    try {
      await saveFoundationPathConfigToFirestore(foundationConfig);
      showNotice(isArabic ? 'تم حفظ إعدادات المسار الأساسي (الموظف الرقمي)' : 'Foundation Path saved successfully');
    } catch (err) {
      alert('Error saving foundation config');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePlatform = async (p: EcosystemPlatform) => {
    setSaving(true);
    try {
      await saveEcosystemPlatformToFirestore(p);
      const updated = await fetchEcosystemPlatformsFromFirestore();
      setPlatforms(updated);
      setEditingPlatform(null);
      showNotice(isArabic ? 'تم حفظ بيانات المنصة بنجاح' : 'Platform saved successfully');
    } catch (err) {
      alert('Error saving platform');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlatform = async (id: string) => {
    if (!confirm(isArabic ? 'هل أنت تأكد من حذف هذه المنصة؟' : 'Delete this platform?')) return;
    try {
      await deleteEcosystemPlatformFromFirestore(id);
      setPlatforms(prev => prev.filter(p => p.id !== id));
      showNotice(isArabic ? 'تم الحذف بنجاح' : 'Platform deleted');
    } catch (err) {
      alert('Delete error');
    }
  };

  const showNotice = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const toggleSectionEnabled = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const moveSection = (index: number, direction: 'UP' | 'DOWN') => {
    const newSecs = [...sections];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSecs.length) return;
    
    const temp = newSecs[index];
    newSecs[index] = newSecs[targetIdx];
    newSecs[targetIdx] = temp;

    // re-assign order
    newSecs.forEach((s, idx) => s.order = idx + 1);
    setSections(newSecs);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold flex items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
        <span>جاري تحميل إعدادات الصفحة الرئيسية والأقسام...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-slate-900 min-h-screen text-white rounded-3xl">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3 text-white">
            <Globe className="w-7 h-7 text-red-500" />
            <span>{isArabic ? 'مُنشئ ومنظم الصفحة الرئيسية (Homepage Builder)' : 'Homepage & Ecosystem Builder'}</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">
            {isArabic ? 'التحكم الكامل في ترتيب وإخفاء أقسام الواجهة المنظومية، المنصات المرفقة، والمرشد الذكي' : 'Full dynamic control over homepage sections, ecosystem platform links, and guide settings.'}
          </p>
        </div>

        {successMsg && (
          <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs Header */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('SECTIONS')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'SECTIONS' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          <Layers className="w-4 h-4" />
          <span>{isArabic ? 'أقسام الواجهة وترتيبها' : 'Homepage Sections'}</span>
        </button>

        <button
          onClick={() => setActiveTab('PLATFORMS')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'PLATFORMS' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          <Globe className="w-4 h-4" />
          <span>{isArabic ? 'منصات المنظومة (Ecosystem Platforms)' : 'Ecosystem Platforms'}</span>
        </button>

        <button
          onClick={() => setActiveTab('SMART_GUIDE')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'SMART_GUIDE' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          <Bot className="w-4 h-4" />
          <span>{isArabic ? 'الموجه الذكي (Smart Guide)' : 'Smart Guide Config'}</span>
        </button>

        <button
          onClick={() => setActiveTab('FOUNDATION')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'FOUNDATION' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          <Compass className="w-4 h-4" />
          <span>{isArabic ? 'المسار الأساسي (الموظف الرقمي)' : 'Foundation Path'}</span>
        </button>
      </div>

      {/* TAB 1: SECTIONS MANAGER */}
      {activeTab === 'SECTIONS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200">{isArabic ? 'التحكم في ظهور وترتيب أقسام الواجهة:' : 'Manage Homepage Sections:'}</h3>
            <button
              onClick={handleSaveSections}
              disabled={saving}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ الترتيب والتغييرات'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div 
                key={sec.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${sec.enabled ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 font-black text-xs flex items-center justify-center text-slate-400">
                    #{sec.order || idx + 1}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{isArabic ? sec.titleAr : sec.titleEn}</h4>
                    <span className="text-xs text-slate-500 uppercase tracking-widest">{sec.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => moveSection(idx, 'UP')}
                    disabled={idx === 0}
                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 cursor-pointer"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => moveSection(idx, 'DOWN')}
                    disabled={idx === sections.length - 1}
                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 cursor-pointer"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleSectionEnabled(sec.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer ${sec.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}
                  >
                    {sec.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{sec.enabled ? (isArabic ? 'ظاهر' : 'Visible') : (isArabic ? 'مخفي' : 'Hidden')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ECOSYSTEM PLATFORMS */}
      {activeTab === 'PLATFORMS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200">{isArabic ? 'منصات المنظومة (SmartTech Ecosystem Platforms):' : 'Manage Ecosystem Platforms:'}</h3>
            <button
              onClick={() => setEditingPlatform({
                id: `platform-${Date.now()}`,
                nameAr: 'منصة جديدة',
                nameEn: 'New Platform',
                descriptionAr: 'وصف المنصة...',
                descriptionEn: 'Platform description...',
                featuresAr: ['خاصية 1', 'خاصية 2'],
                featuresEn: ['Feature 1', 'Feature 2'],
                url: 'https://app.smart-courses.org',
                status: 'ACTIVE',
                ctaTextAr: 'انتقل للمنصة',
                ctaTextEn: 'Explore Platform',
                order: platforms.length + 1
              })}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isArabic ? 'إضافة منصة جديدة' : 'Add New Platform'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map(p => (
              <div key={p.id} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">{p.status}</span>
                    <h4 className="text-lg font-black text-white">{isArabic ? p.nameAr : p.nameEn}</h4>
                    <p className="text-xs text-slate-400 mt-1">{p.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingPlatform(p)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg cursor-pointer"
                    >
                      {isArabic ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDeletePlatform(p.id)}
                      className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">{isArabic ? p.descriptionAr : p.descriptionEn}</p>
              </div>
            ))}
          </div>

          {/* Modal Edit Platform */}
          {editingPlatform && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-black text-white">{isArabic ? 'تعديل بيانات المنصة' : 'Edit Platform Details'}</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400">اسم المنصة (عربي)</label>
                    <input 
                      type="text" 
                      value={editingPlatform.nameAr}
                      onChange={e => setEditingPlatform({ ...editingPlatform, nameAr: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">اسم المنصة (إنجليزي)</label>
                    <input 
                      type="text" 
                      value={editingPlatform.nameEn}
                      onChange={e => setEditingPlatform({ ...editingPlatform, nameEn: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">رابط المنصة / Subdomain Target URL</label>
                    <input 
                      type="text" 
                      value={editingPlatform.url}
                      onChange={e => setEditingPlatform({ ...editingPlatform, url: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">وصف المنصة (عربي)</label>
                    <textarea 
                      value={editingPlatform.descriptionAr}
                      onChange={e => setEditingPlatform({ ...editingPlatform, descriptionAr: e.target.value })}
                      rows={3}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">نص زر الانتقال CTA (عربي)</label>
                    <input 
                      type="text" 
                      value={editingPlatform.ctaTextAr}
                      onChange={e => setEditingPlatform({ ...editingPlatform, ctaTextAr: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button 
                    onClick={() => setEditingPlatform(null)}
                    className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={() => handleSavePlatform(editingPlatform)}
                    className="px-6 py-2 rounded-xl bg-red-600 text-white text-xs font-black cursor-pointer shadow-lg"
                  >
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SMART GUIDE CONFIG */}
      {activeTab === 'SMART_GUIDE' && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200">{isArabic ? 'إعدادات الموجه الذكي والمرشد:' : 'Smart Guide Settings:'}</h3>
            <button
              onClick={handleSaveSmartGuide}
              disabled={saving}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات المرشد'}</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white">{isArabic ? 'تفعيل الموجه الذكي بالأعلى:' : 'Enable Smart Guide Section:'}</label>
              <input 
                type="checkbox"
                checked={smartGuide.enabled}
                onChange={e => setSmartGuide({ ...smartGuide, enabled: e.target.checked })}
                className="w-5 h-5 accent-red-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400">اسم المرشد / الموجه (عربي)</label>
              <input 
                type="text" 
                value={smartGuide.nameAr}
                onChange={e => setSmartGuide({ ...smartGuide, nameAr: e.target.value })}
                className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400">رابط صورة المرشد / Avatar Photo URL</label>
              <input 
                type="text" 
                value={smartGuide.photoUrl}
                onChange={e => setSmartGuide({ ...smartGuide, photoUrl: e.target.value })}
                className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400">نص الترحيب والتعريف (عربي)</label>
              <textarea 
                value={smartGuide.introductionAr}
                onChange={e => setSmartGuide({ ...smartGuide, introductionAr: e.target.value })}
                rows={3}
                className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400">النص الصوتي عند الضغط على استمع (عربي)</label>
              <input 
                type="text" 
                value={smartGuide.voiceTextAr}
                onChange={e => setSmartGuide({ ...smartGuide, voiceTextAr: e.target.value })}
                className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FOUNDATION PATH */}
      {activeTab === 'FOUNDATION' && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200">{isArabic ? 'إعدادات المسار الأساسي (الموظف الرقمي):' : 'Foundation Path Settings:'}</h3>
            <button
              onClick={handleSaveFoundationConfig}
              disabled={saving}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات المسار الأساسي'}</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{isArabic ? 'اعتماد مسار الموظف الرقمي كنواة أساسية للمستجدين؟' : 'Is Foundation Path Enabled?'}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{isArabic ? 'إظهار الشارة والتوجيه للمستجدين للبدء بمسار الموظف الرقمي أولاً' : 'Displays Digital Employee as recommended starting track for all learners.'}</p>
              </div>
              <input 
                type="checkbox"
                checked={foundationConfig.isFoundationEnabled}
                onChange={e => setFoundationConfig({ ...foundationConfig, isFoundationEnabled: e.target.checked })}
                className="w-5 h-5 accent-red-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400">عنوان شارة المسار الأساسي (عربي)</label>
              <input 
                type="text" 
                value={foundationConfig.badgeLabelAr}
                onChange={e => setFoundationConfig({ ...foundationConfig, badgeLabelAr: e.target.value })}
                className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400">وصف توجيه المسار الأساسي (عربي)</label>
              <textarea 
                value={foundationConfig.descriptionAr}
                onChange={e => setFoundationConfig({ ...foundationConfig, descriptionAr: e.target.value })}
                rows={3}
                className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
