import React, { useState, useEffect } from 'react';
import { useBranding, SiteBrandingSettings } from '../../context/BrandingContext';
import { useLanguage } from '../../context/LanguageContext';
import { getPaymentSettings, DEFAULT_CONTACT_PAYMENT_SETTINGS } from '../../services/bookingService';
import { ContactPaymentSettings, Role, User } from '../../types';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, getRoleLabelAr } from '../../lib/permissions';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import {
  Settings,
  Paintbrush,
  Type,
  Layout,
  Zap,
  Image as ImageIcon,
  Home,
  Phone,
  Bell,
  Search,
  Share2,
  Lock,
  Shield,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  Upload,
  Sliders,
  ChevronUp,
  ChevronDown,
  EyeOff,
  Sparkles,
  HelpCircle,
  Code
} from 'lucide-react';

interface AdminSettingsCMSProps {
  currentUser?: User | null;
}

const COLOR_PRESETS = [
  { nameAr: 'أحمر سمارتك القياسي', primary: '#dc2626', secondary: '#2563eb', accent: '#f59e0b' },
  { nameAr: 'أزرق سايبر روبوتكس', primary: '#2563eb', secondary: '#0284c7', accent: '#06b6d4' },
  { nameAr: 'زمردي تكنولوجي', primary: '#059669', secondary: '#0284c7', accent: '#10b981' },
  { nameAr: 'بنفسجي AI كوانتوم', primary: '#7c3aed', secondary: '#db2777', accent: '#f59e0b' },
  { nameAr: 'ذهبي فاخر عالي التباين', primary: '#d97706', secondary: '#dc2626', accent: '#f59e0b' }
];

const FONTS_LIST = [
  { id: 'Cairo', labelAr: 'خط كايرو (Cairo) — العصر والنقاء' },
  { id: 'Tajawal', labelAr: 'خط تجوال (Tajawal) — تقني حديث' },
  { id: 'Readex Pro', labelAr: 'خط ريدكس بروفشنال (Readex Pro) — عالي القراءة' },
  { id: 'Almarai', labelAr: 'خط المراعي (Almarai) — أنيق ومنسق' },
  { id: 'Alexandria', labelAr: 'خط الإسكندرية (Alexandria) — جلي وفخم' },
  { id: 'IBM Plex Sans Arabic', labelAr: 'خط آي بي إم (IBM Plex Sans) — تقني واحترافي' },
  { id: 'Plus Jakarta Sans', labelAr: 'خط جاكارتا العالمي (Plus Jakarta)' }
];

export const AdminSettingsCMS: React.FC<AdminSettingsCMSProps> = ({ currentUser }) => {
  const { isArabic } = useLanguage();
  const { settings: brandingSettings, updateSettings: updateBranding, resetToDefaults } = useBranding();

  const [activeSubTab, setActiveSubTab] = useState<
    | 'general'
    | 'colors'
    | 'typography'
    | 'appearance'
    | 'animations'
    | 'branding'
    | 'homepage'
    | 'contact'
    | 'seo'
    | 'social'
    | 'storage'
    | 'permissions'
  >('general');

  // Contact & Payment state
  const [contactSettings, setContactSettings] = useState<ContactPaymentSettings>(DEFAULT_CONTACT_PAYMENT_SETTINGS);

  // General & SEO & Social & Homepage Extended Settings
  const [extendedSettings, setExtendedSettings] = useState({
    siteTitleAr: 'أكاديمية سمارتك للروبوتات والذكاء الاصطناعي',
    siteTitleEn: 'SmartTech Academy for Robotics & AI',
    metaDescriptionAr: 'أكاديمية سمارتك الرائدة بالإسكندرية في تدريب الأطفال والشباب على البرمجة، الروبوتات، والذكاء الاصطناعي.',
    metaKeywordsAr: 'سمارتك, زيزينيا, الإسكندرية, برمجة للأطفال, ذكاء اصطناعي, روبوتات, Scratch, Python, Arduino',
    ogImageUrl: '',
    twitterCardType: 'summary_large_image',
    facebookUrl: 'https://facebook.com/smarttechcenter',
    instagramUrl: 'https://instagram.com/smarttechcenter',
    tiktokUrl: 'https://tiktok.com/@smarttechcenter',
    youtubeUrl: 'https://youtube.com/@smarttechcenter',
    linkedinUrl: 'https://linkedin.com/company/smarttechcenter',
    whatsappGroupUrl: 'https://chat.whatsapp.com/smarttech',
    // Homepage Order & Visibilities
    homepageSections: [
      { id: 'hero', nameAr: 'قسم البانر الرئيسي (Hero)', enabled: true },
      { id: 'paths', nameAr: 'مسارات التعلم التخصصية', enabled: true },
      { id: 'courses', nameAr: 'الكورسات والأسعار المميزة', enabled: true },
      { id: 'labs', nameAr: 'المختبرات التفاعلية والـ AI', enabled: true },
      { id: 'projects', nameAr: 'معرض مشاريع الطلاب', enabled: true },
      { id: 'activities', nameAr: 'أنشطة وفعاليات المركز', enabled: true },
      { id: 'posts', nameAr: 'الأخبار والمنشورات التعليمية', enabled: true },
      { id: 'testimonials', nameAr: 'آراء وآراء أولياء الأمور', enabled: true },
      { id: 'cta', nameAr: 'دعوة للانضمام والتواصل', enabled: true }
    ],
    heroTitleAr: 'نبني قادة التكنولوجيا والذكاء الاصطناعي في مصر والوطن العربي 🚀',
    heroSubtitleAr: 'بيئة تعليمية تفاعلية تمزج بين التطبيق العملي، الروبوتات، الذكاء الاصطناعي، والبرمجة من سن 6 حتى 18 سنة.',
    heroImageUrl: '',
    heroVideoUrl: '',
    // Storage policies
    maxImageMB: 10,
    maxVideoMB: 100,
    maxDocumentMB: 25,
    allowedImageExts: 'jpg, jpeg, png, webp, svg',
    allowedVideoExts: 'mp4, webm, mov',
    allowedDocExts: 'pdf, doc, docx, ppt, xls'
  });

  // Local state for colors & typography
  const [colors, setColors] = useState({
    primary: brandingSettings.primaryColorHex || '#dc2626',
    secondary: '#2563eb',
    accent: brandingSettings.accentColorHex || '#f59e0b',
    background: '#0f172a',
    surface: '#1e293b',
    card: '#0f172a',
    text: '#f8fafc',
    mutedText: '#94a3b8',
    border: '#334155',
    button: brandingSettings.primaryColorHex || '#dc2626',
    buttonHover: '#b91c1c',
    link: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  });

  const [typography, setTypography] = useState({
    fontFamily: brandingSettings.fontFamily || 'Cairo',
    headingFont: brandingSettings.fontFamily || 'Cairo',
    h1SizePx: 36,
    h2SizePx: 28,
    h3SizePx: 22,
    bodySizePx: 16,
    fontWeightPrimary: 'Bold',
    lineHeight: 1.6,
    letterSpacing: 0
  });

  const [appearance, setAppearance] = useState({
    borderRadiusPx: 16,
    buttonStyle: 'rounded', // rounded, pill, square
    cardStyle: 'glass', // flat, glass, 3d, elevated
    shadowIntensity: 'medium', // low, medium, high
    glassmorphismLevel: 80,
    animationIntensity: 'normal'
  });

  const [animationSettings, setAnimationSettings] = useState({
    enableAnimations: true,
    enable3D: true,
    enableScrollAnimations: true,
    enableHoverAnimations: true,
    enablePageTransitions: true,
    enableMicroInteractions: true,
    animationSpeed: 'normal',
    reducedMotion: false
  });

  // Permissions state
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);

  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Load from Firestore on mount
  useEffect(() => {
    const loadGlobalConfig = async () => {
      try {
        const contactData = await getPaymentSettings();
        setContactSettings(contactData);

        const configSnap = await getDoc(doc(db, 'settings', 'global_config'));
        if (configSnap.exists()) {
          const data = configSnap.data();
          if (data.colors) setColors((prev) => ({ ...prev, ...data.colors }));
          if (data.typography) setTypography((prev) => ({ ...prev, ...data.typography }));
          if (data.appearance) setAppearance((prev) => ({ ...prev, ...data.appearance }));
          if (data.animationSettings) setAnimationSettings((prev) => ({ ...prev, ...data.animationSettings }));
          if (data.extendedSettings) {
            setExtendedSettings((prev) => ({
              ...prev,
              ...data.extendedSettings,
              homepageSections: data.extendedSettings.homepageSections || prev.homepageSections || []
            }));
          }
          if (data.rolePermissions) setRolePermissions(data.rolePermissions);
        }
      } catch (err) {
        console.warn('Error loading global settings from Firestore:', err);
      }
    };

    loadGlobalConfig();
  }, []);

  // Save all settings to Firestore
  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    setSaveStatusMsg(null);

    try {
      // 1. Save Branding & Color CSS variables
      await updateBranding({
        primaryColorHex: colors.primary,
        accentColorHex: colors.accent,
        fontFamily: typography.fontFamily as any
      });

      // 2. Save Payment & Contact Settings to settings/contact_payment
      await setDoc(doc(db, 'settings', 'contact_payment'), contactSettings, { merge: true });

      // 3. Save Global Config to settings/global_config
      const payload = {
        colors,
        typography,
        appearance,
        animationSettings,
        extendedSettings,
        rolePermissions,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'admin'
      };

      await setDoc(doc(db, 'settings', 'global_config'), payload, { merge: true });

      // Apply CSS variables live
      document.documentElement.style.setProperty('--brand-primary', colors.primary);
      document.documentElement.style.setProperty('--brand-secondary', colors.secondary);
      document.documentElement.style.setProperty('--brand-accent', colors.accent);
      document.body.style.fontFamily = `'${typography.fontFamily}', sans-serif`;

      setSaveStatusMsg('✅ تم حفظ ونشر جميع إعدادات المنصة بنجاح وتطبيقها مباشرة على الواجهة العامة!');
      setTimeout(() => setSaveStatusMsg(null), 5000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveStatusMsg('❌ حدث خطأ أثناء حفظ الإعدادات في Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  // Move Homepage section up or down
  const moveHomepageSection = (index: number, direction: 'up' | 'down') => {
    const list = [...(extendedSettings.homepageSections || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    setExtendedSettings({ ...extendedSettings, homepageSections: list });
  };

  const toggleHomepageSectionEnabled = (id: string) => {
    const list = (extendedSettings.homepageSections || []).map((sec) =>
      sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
    );
    setExtendedSettings({ ...extendedSettings, homepageSections: list });
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">مركز الإعدادات الشامل للمنصة (Central Settings Control)</h2>
            <p className="text-xs text-slate-400 mt-1">
              المركز الوحيد للتحكم في مظهر، ألوان، خطوط، هوية، أمان، وصلاحيات أكاديمية سمارتك.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              showLivePreview
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{showLivePreview ? 'إخفاء المعاينة المباشرة' : 'معاينة مباشرة 👁️'}</span>
          </button>

          <button
            onClick={resetToDefaults}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>إعادة للوضع الافتراضي</span>
          </button>

          <button
            onClick={handleSaveAllSettings}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ ونشر التغييرات 🚀'}</span>
          </button>
        </div>
      </div>

      {saveStatusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold animate-fadeIn flex items-center gap-2 ${
            saveStatusMsg.includes('✅')
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveStatusMsg}</span>
        </div>
      )}

      {/* Subtab Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {[
          { id: 'general', label: 'عامة والهوية 🌐', icon: Settings },
          { id: 'colors', label: 'الألوان والـ Theme 🎨', icon: Paintbrush },
          { id: 'typography', label: 'الخطوط والطباعة 🔤', icon: Type },
          { id: 'appearance', label: 'المظهر والأنماط 💎', icon: Layout },
          { id: 'animations', label: 'المؤثرات والحركة ⚡', icon: Zap },
          { id: 'branding', label: 'الشعار والوسائط 🖼️', icon: ImageIcon },
          { id: 'homepage', label: 'مُنشئ الرئيسية 🏠', icon: Home },
          { id: 'contact', label: 'التواصل والدفع 📞', icon: Phone },
          { id: 'seo', label: 'تهيئة SEO 🔎', icon: Search },
          { id: 'social', label: 'سوشيال ميديا 📱', icon: Share2 },
          { id: 'storage', label: 'الملفات والأمان 🔒', icon: Lock },
          { id: 'permissions', label: 'الأدوار والتراخيص 🛡️', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer border ${
                isActive
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        {/* 1. GENERAL SETTINGS */}
        {activeSubTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Settings className="w-5 h-5 text-red-500" />
              <span>الإعدادات العامة وهويّة المنصة الرئيسية</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">اسم المنصة بالعربية</label>
                <input
                  type="text"
                  value={extendedSettings.siteTitleAr}
                  onChange={(e) => setExtendedSettings({ ...extendedSettings, siteTitleAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">اسم المنصة بالإنجليزية (English Title)</label>
                <input
                  type="text"
                  value={extendedSettings.siteTitleEn}
                  onChange={(e) => setExtendedSettings({ ...extendedSettings, siteTitleEn: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none dir-ltr text-left"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-300">نص شريط التنبيهات والأخبار العلوي (Announcement Bar)</label>
                <input
                  type="text"
                  value={brandingSettings.announcementTextAr}
                  onChange={(e) => updateBranding({ announcementTextAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. COLORS & THEME */}
        {activeSubTab === 'colors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Paintbrush className="w-5 h-5 text-amber-400" />
                <span>إدارة لوحة الألوان المركزية (Platform Color System)</span>
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">نماذج جاهزة:</span>
                {COLOR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setColors({ ...colors, primary: p.primary, secondary: p.secondary, accent: p.accent })}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer border border-slate-700 flex items-center gap-1"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }}></span>
                    <span>{p.nameAr}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400">
              تغيير أي لون هنا سيقوم بالانعكاس تلقائياً وبشكل ديناميكي على جميع أزرار، خلفيات، وعناصر المنصة بالكامل.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'primary', label: 'اللون الرئيسي (Primary Color)', val: colors.primary },
                { key: 'secondary', label: 'اللون الثانوي (Secondary Color)', val: colors.secondary },
                { key: 'accent', label: 'لون التمييز (Accent Color)', val: colors.accent },
                { key: 'background', label: 'خلفية الصفحة (Background)', val: colors.background },
                { key: 'surface', label: 'خلفية الحاويات (Surface)', val: colors.surface },
                { key: 'card', label: 'خلفية البطاقات (Card Bg)', val: colors.card },
                { key: 'text', label: 'لون النصوص الأساسية (Text)', val: colors.text },
                { key: 'mutedText', label: 'لون النصوص الفرعية (Muted Text)', val: colors.mutedText },
                { key: 'border', label: 'لون الحدود (Border Color)', val: colors.border },
                { key: 'button', label: 'خلفية الأزرار (Button Bg)', val: colors.button },
                { key: 'buttonHover', label: 'لون الأزرار عند التمرير (Hover)', val: colors.buttonHover },
                { key: 'success', label: 'لون النجاح (Success)', val: colors.success },
                { key: 'warning', label: 'لون التنبيه (Warning)', val: colors.warning },
                { key: 'error', label: 'لون الخطأ (Error)', val: colors.error }
              ].map((c) => (
                <div key={c.key} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">{c.label}</label>
                    <input
                      type="color"
                      value={c.val.startsWith('#') ? c.val : '#dc2626'}
                      onChange={(e) => setColors({ ...colors, [c.key]: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={c.val}
                    onChange={(e) => setColors({ ...colors, [c.key]: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono dir-ltr text-left outline-none"
                    placeholder="HEX / RGB / HSL"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. TYPOGRAPHY / FONTS */}
        {activeSubTab === 'typography' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Type className="w-5 h-5 text-blue-400" />
              <span>إدارة الخطوط والطباعة (Typography Settings)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">الخط الرئيسي للنصوص (Primary Font)</label>
                <select
                  value={typography.fontFamily}
                  onChange={(e) => setTypography({ ...typography, fontFamily: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none"
                >
                  {FONTS_LIST.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.labelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">خط العناوين الرئيسية (Heading Font)</label>
                <select
                  value={typography.headingFont}
                  onChange={(e) => setTypography({ ...typography, headingFont: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none"
                >
                  {FONTS_LIST.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.labelAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Font Sample Preview Card */}
            <div
              className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3"
              style={{ fontFamily: `'${typography.fontFamily}', sans-serif` }}
            >
              <h1 className="text-2xl font-black text-white">معاينة الخط العربي: أهلاً بكم في أكاديمية سمارتك 🚀</h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                هذا النص يعرض شكل وطبيعة الخط المختار لنصوص ووصف الكورسات والوحدات التعليمية داخل منصة سمارتك.
              </p>
            </div>
          </div>
        )}

        {/* 4. APPEARANCE & STYLES */}
        {activeSubTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layout className="w-5 h-5 text-emerald-400" />
              <span>أنماط الحواف والأحجام والمظهر (Appearance & Styles)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300">انحناء الحواف (Border Radius)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 6, label: 'صغير (6px)' },
                    { id: 12, label: 'متوسط (12px)' },
                    { id: 16, label: 'كبير (16px)' },
                    { id: 24, label: 'دائري جداً (24px)' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setAppearance({ ...appearance, borderRadiusPx: r.id })}
                      className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        appearance.borderRadiusPx === r.id
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300">نمط الأزرار (Button Style)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['rounded', 'pill', 'square'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setAppearance({ ...appearance, buttonStyle: style })}
                      className={`p-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer border ${
                        appearance.buttonStyle === style
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300">نمط البطاقات (Card Style)</label>
                <div className="grid grid-cols-2 gap-2">
                  {['flat', 'glass', '3d', 'elevated'].map((cardStyle) => (
                    <button
                      key={cardStyle}
                      onClick={() => setAppearance({ ...appearance, cardStyle })}
                      className={`p-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer border ${
                        appearance.cardStyle === cardStyle
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {cardStyle}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. ANIMATIONS */}
        {activeSubTab === 'animations' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>تكوين الحركة والمؤثرات البصرية (Animation Controls)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'enableAnimations', label: 'تفعيل جميع المؤثرات التفاعلية وحركات العناصر' },
                { key: 'enable3D', label: 'تفعيل التأثيرات ثلاثية الأبعاد 3D Effects' },
                { key: 'enableScrollAnimations', label: 'تفعيل أنيميشن التمرير (Scroll Animations)' },
                { key: 'enableHoverAnimations', label: 'تفعيل تأثيرات التمرير بالماوس (Hover Effects)' },
                { key: 'enablePageTransitions', label: 'تفعيل انتقالات الصفحات السلسة' },
                { key: 'reducedMotion', label: 'دعم نمط تقليل الحركة لراحة العين (Reduced Motion)' }
              ].map((item) => (
                <div key={item.key} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(animationSettings as any)[item.key]}
                    onChange={(e) => setAnimationSettings({ ...animationSettings, [item.key]: e.target.checked })}
                    className="w-5 h-5 accent-red-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. BRANDING & ASSETS */}
        {activeSubTab === 'branding' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              <span>إدارة شعارات ووسائط المنصة (Branding Assets)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-black text-white">الشعار الرئيسي (Main Logo)</h4>
                {brandingSettings.logoUrl ? (
                  <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between border border-slate-800">
                    <img src={brandingSettings.logoUrl} alt="Logo" className="h-12 object-contain" />
                    <button
                      onClick={() => updateBranding({ logoUrl: null })}
                      className="px-3 py-1.5 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs font-bold transition"
                    >
                      حذف الشعار
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">يتم استخدام الشعار النصي الافتراضي الذكي.</p>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">رفع شعار جديد من الجهاز (PNG / JPG / WEBP)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                          const url = ev.target?.result as string;
                          if (url) {
                            const img = new window.Image();
                            img.onload = async () => {
                              const canvas = document.createElement('canvas');
                              let width = img.width;
                              let height = img.height;
                              const maxDim = 800;

                              if (width > height) {
                                if (width > maxDim) {
                                  height = Math.round((height * maxDim) / width);
                                  width = maxDim;
                                }
                              } else {
                                if (height > maxDim) {
                                  width = Math.round((width * maxDim) / height);
                                  height = maxDim;
                                }
                              }

                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                ctx.drawImage(img, 0, 0, width, height);
                                const compressedDataUrl = canvas.toDataURL('image/png');
                                await updateBranding({ logoUrl: compressedDataUrl });
                              } else {
                                await updateBranding({ logoUrl: url });
                              }
                            };
                            img.src = url;
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-black text-white">ارتفاع الشعار بالهيدر (Header Logo Height)</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={24}
                    max={80}
                    value={brandingSettings.logoHeightPx || 42}
                    onChange={(e) => updateBranding({ logoHeightPx: parseInt(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-amber-400 w-12 text-center">
                    {brandingSettings.logoHeightPx || 42}px
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. HOMEPAGE BUILDER */}
        {activeSubTab === 'homepage' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Home className="w-5 h-5 text-red-500" />
              <span>مُنشئ ومُنسق الصفحة الرئيسية (Homepage Drag & Section Builder)</span>
            </h3>

            <p className="text-xs text-slate-400">
              يمكنك إعادة ترتيب أو إخفاء/إظهار أي قسم في الصفحة الرئيسية للموقع. وسيتم حفظ هذا الترتيب ومزامنته فوراً.
            </p>

            <div className="space-y-2">
              {(extendedSettings.homepageSections || []).map((sec, idx) => (
                <div
                  key={sec.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                    sec.enabled
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-950/40 border-slate-800/40 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-black">{sec.nameAr}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleHomepageSectionEnabled(sec.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        sec.enabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {sec.enabled ? 'مُفعل 👁️' : 'مُعطل 🙈'}
                    </button>

                    <button
                      onClick={() => moveHomepageSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => moveHomepageSection(idx, 'down')}
                      disabled={idx === (extendedSettings.homepageSections || []).length - 1}
                      className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. CONTACT & PAYMENTS */}
        {activeSubTab === 'contact' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Phone className="w-5 h-5 text-emerald-400" />
              <span>إعدادات وسائل الدفع وأرقام التواصل الرسمية</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">رقم تحويل InstaPay</label>
                <input
                  type="text"
                  value={contactSettings.instapayNumber}
                  onChange={(e) => setContactSettings({ ...contactSettings, instapayNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">رقم تحويل محفظة Vodafone Cash</label>
                <input
                  type="text"
                  value={contactSettings.vodafoneCashNumber}
                  onChange={(e) => setContactSettings({ ...contactSettings, vodafoneCashNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">رقم الواتساب الدعم والاستفسارات</label>
                <input
                  type="text"
                  value={contactSettings.supportWhatsapp}
                  onChange={(e) => setContactSettings({ ...contactSettings, supportWhatsapp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">عنوان المقر الرئيسي (الإسكندرية)</label>
                <input
                  type="text"
                  value={contactSettings.centerAddress}
                  onChange={(e) => setContactSettings({ ...contactSettings, centerAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 9. SEO */}
        {activeSubTab === 'seo' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Search className="w-5 h-5 text-amber-400" />
              <span>إعدادات محركات البحث ووسوم الـ SEO</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">وصف موقع الأكاديمية (Meta Description)</label>
                <textarea
                  rows={3}
                  value={extendedSettings.metaDescriptionAr}
                  onChange={(e) => setExtendedSettings({ ...extendedSettings, metaDescriptionAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">الكلمات المفتاحية (SEO Keywords)</label>
                <input
                  type="text"
                  value={extendedSettings.metaKeywordsAr}
                  onChange={(e) => setExtendedSettings({ ...extendedSettings, metaKeywordsAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 10. SOCIAL MEDIA */}
        {activeSubTab === 'social' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Share2 className="w-5 h-5 text-blue-400" />
              <span>روابط منصات التواصل الاجتماعي الرسمية</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'facebookUrl', label: 'رابط صفحة Facebook' },
                { key: 'instagramUrl', label: 'رابط حساب Instagram' },
                { key: 'youtubeUrl', label: 'رابط قناة YouTube' },
                { key: 'tiktokUrl', label: 'رابط حساب TikTok' },
                { key: 'linkedinUrl', label: 'رابط صفحة LinkedIn' },
                { key: 'whatsappGroupUrl', label: 'رابط مجتمع الواتساب' }
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">{item.label}</label>
                  <input
                    type="text"
                    value={(extendedSettings as any)[item.key]}
                    onChange={(e) => setExtendedSettings({ ...extendedSettings, [item.key]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:border-red-500 outline-none dir-ltr text-left"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 11. STORAGE & POLICIES */}
        {activeSubTab === 'storage' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="w-5 h-5 text-red-400" />
              <span>سياسات وأحجام رفع الملفات المسموحة</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300">أقصى حجم للصور (ميجابايت)</label>
                <input
                  type="number"
                  value={extendedSettings.maxImageMB}
                  onChange={(e) => setExtendedSettings({ ...extendedSettings, maxImageMB: parseInt(e.target.value) || 10 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300">أقصى حجم للفيديوهات (ميجابايت)</label>
                <input
                  type="number"
                  value={extendedSettings.maxVideoMB}
                  onChange={(e) => setExtendedSettings({ ...extendedSettings, maxVideoMB: parseInt(e.target.value) || 100 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300">أقصى حجم للمستندات والـ PDF (ميجابايت)</label>
                <input
                  type="number"
                  value={extendedSettings.maxDocumentMB}
                  onChange={(e) => setExtendedSettings({ ...extendedSettings, maxDocumentMB: parseInt(e.target.value) || 25 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 12. ROLES & PERMISSIONS */}
        {activeSubTab === 'permissions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>مصفوفة الأدوار والصلاحيات (Dynamic Roles & Permissions Matrix)</span>
            </h3>

            <p className="text-xs text-slate-400">
              المشرف العام (Super Admin) يمتلك الصلاحيات الكاملة بشكل دائم، ويمكنك إدارة تراخيص أدوار المعلمين والمنسقين والطلاب من هنا.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3">الدور / الرتبة</th>
                    <th className="p-3">نوع نطاق البيانات (Scope)</th>
                    <th className="p-3">عدد الصلاحيات الممنوحة</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {Object.entries(rolePermissions).map(([roleKey, rawCfg]) => {
                    const cfg = rawCfg as { permissions: string[]; pages: string[]; scope: string };
                    return (
                      <tr key={roleKey} className="hover:bg-slate-950/50 transition">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <Shield className="w-4 h-4 text-amber-400" />
                          <span>{getRoleLabelAr(roleKey as any)}</span>
                        </td>
                        <td className="p-3 text-slate-300 font-mono">{cfg.scope}</td>
                        <td className="p-3 font-bold text-emerald-400">{cfg.permissions?.length || 0} صلاحية</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                            نشط ومُعترف به
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
