import React, { useState, useRef } from 'react';
import {
  Palette,
  Upload,
  Type,
  Layout,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Paintbrush,
  Eye,
  Megaphone,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBranding } from '../context/BrandingContext';

interface SiteCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLOR_PALETTES = [
  { nameAr: 'أحمر سمارتك القياسي', primary: '#dc2626', accent: '#f59e0b' },
  { nameAr: 'أزرق سايبر متطور', primary: '#2563eb', accent: '#06b6d4' },
  { nameAr: 'زمردي ميكانيكي', primary: '#059669', accent: '#10b981' },
  { nameAr: 'بنفسجي ملكي ذكي', primary: '#7c3aed', accent: '#ec4899' },
  { nameAr: 'ذهبي فخم عالي التباين', primary: '#d97706', accent: '#f59e0b' },
  { nameAr: 'نيون وردي حماسي', primary: '#db2777', accent: '#a855f7' }
];

const AVAILABLE_FONTS = [
  { id: 'Cairo', nameAr: 'خط كايرو (Cairo) — العصر والنقاء' },
  { id: 'Tajawal', nameAr: 'خط تجوال (Tajawal) — تقني حديث' },
  { id: 'Readex Pro', nameAr: 'خط ريدكس بروفشنال (Readex Pro) — عالي القراءة' },
  { id: 'Almarai', nameAr: 'خط المراعي (Almarai) — أنيق ومنسق' },
  { id: 'Alexandria', nameAr: 'خط الإسكندرية (Alexandria) — جلي وفخم' },
  { id: 'IBM Plex Sans Arabic', nameAr: 'خط آي بي إم (IBM Plex Sans) — تقني واحترافي' },
  { id: 'Plus Jakarta Sans', nameAr: 'خط جاكارتا العالمي (Plus Jakarta)' }
];

export const SiteCustomizerModal: React.FC<SiteCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToDefaults, uploadLogoImage } = useBranding();

  const [activeTab, setActiveTab] = useState<'logo' | 'colors' | 'typography' | 'identity' | 'banner' | 'advanced'>('logo');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(settings.logoUrl);
  const [logoHeight, setLogoHeight] = useState<number>(settings.logoHeightPx || 42);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle Logo File Upload (PNG / JPG / WEBP)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadErrorMsg('');
    setUploadStatusMsg('');

    try {
      const dataUrl = await uploadLogoImage(file);
      setLogoPreviewUrl(dataUrl);
      setUploadStatusMsg('تم رفع وشعار جديد بنجاح! يظهر الشعار الآن في أعلى وأسفل المنصة.');
    } catch (err: any) {
      setUploadErrorMsg(err?.message || 'حدث خطأ أثناء رفع الشعار.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoPreviewUrl(null);
    await updateSettings({ logoUrl: null });
    setUploadStatusMsg('تمت العودة للشعار الرمز الحركي التلقائي.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto dir-rtl text-right">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border-2 border-slate-800 rounded-3xl max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Paintbrush className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-[10px]">
                  Site Customization & Visual Editor
                </span>
                <span className="text-xs text-slate-400 font-mono">100% Fully Editable</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                تعديل وتصميم كل شيء بالموقع (الشعار، الألوان، الخطوط، الهوية)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Navigation Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 bg-slate-950/90 border-b md:border-b-0 md:border-l border-slate-800 p-3 flex md:flex-col gap-1 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('logo')}
              className={`p-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition text-right cursor-pointer whitespace-nowrap ${
                activeTab === 'logo'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>الشعار واللوجو (PNG / JPG)</span>
            </button>

            <button
              onClick={() => setActiveTab('colors')}
              className={`p-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition text-right cursor-pointer whitespace-nowrap ${
                activeTab === 'colors'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>الألوان والتنسيق البصري</span>
            </button>

            <button
              onClick={() => setActiveTab('typography')}
              className={`p-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition text-right cursor-pointer whitespace-nowrap ${
                activeTab === 'typography'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>نوع وحجم الخط (Fonts)</span>
            </button>

            <button
              onClick={() => setActiveTab('identity')}
              className={`p-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition text-right cursor-pointer whitespace-nowrap ${
                activeTab === 'identity'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>اسم المنصة والعناوين</span>
            </button>

            <button
              onClick={() => setActiveTab('banner')}
              className={`p-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition text-right cursor-pointer whitespace-nowrap ${
                activeTab === 'banner'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>شريط الإعلانات العلوي</span>
            </button>

            <button
              onClick={() => setActiveTab('advanced')}
              className={`p-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition text-right cursor-pointer whitespace-nowrap ${
                activeTab === 'advanced'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>أكواد CSS المخصصة</span>
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-6">
            {/* TAB 1: LOGO UPLOAD */}
            {activeTab === 'logo' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-red-500" /> رفع شعار مخصص للمنصة (Custom Logo Image)
                  </h3>
                  <p className="text-xs text-slate-400">
                    يمكنك رفع شعار أكاديميتك أو مؤسستك بصيغة PNG أو JPG أو WEBP. وسيظهر فوراً في أعلى الموقع وجميع القوائم والشهادات!
                  </p>
                </div>

                {/* Logo Live Preview Card */}
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4 text-center">
                  <span className="text-xs font-bold text-slate-400 block">معاينة الشعار الحالية برأس الموقع:</span>

                  <div className="inline-flex items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-2xl min-w-[220px]">
                    {logoPreviewUrl ? (
                      <img
                        src={logoPreviewUrl}
                        alt="Custom Logo"
                        style={{ height: `${logoHeight}px` }}
                        className="object-contain max-w-full transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-600/30">
                          <div className="w-5 h-5 border-4 border-white rounded-full border-t-transparent"></div>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-lg font-black uppercase text-white leading-none">
                            Smart<span className="text-red-500">Tech</span>
                          </span>
                          <span className="text-[9px] font-bold tracking-widest text-red-500 uppercase">
                            Academy & Labs
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logo Height Adjust Slider */}
                  {logoPreviewUrl && (
                    <div className="max-w-xs mx-auto space-y-2 pt-2">
                      <div className="flex justify-between text-xs text-slate-300 font-bold">
                        <span>حجم ارتفاع الشعار:</span>
                        <span>{logoHeight}px</span>
                      </div>
                      <input
                        type="range"
                        min="24"
                        max="80"
                        value={logoHeight}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLogoHeight(val);
                          updateSettings({ logoHeightPx: val });
                        }}
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="p-6 bg-slate-950/80 border-2 border-dashed border-slate-700 rounded-3xl text-center space-y-4 hover:border-red-500 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-14 h-14 mx-auto rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Upload className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-white">اضغط هنا لاختيار صورة الشعار من جهازك</h4>
                    <p className="text-xs text-slate-400">يدعم صيغ PNG الشفافة، JPG، WEBP أو SVG (حتى 5 ميجابايت)</p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'جاري رفع الملف...' : 'رفع ملف الشعار الجديد'}</span>
                    </button>

                    {logoPreviewUrl && (
                      <button
                        onClick={handleRemoveLogo}
                        className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition"
                      >
                        حذف الشعار والعودة للرمز الإفتراضي
                      </button>
                    )}
                  </div>
                </div>

                {/* Status or Error Notice */}
                {uploadStatusMsg && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{uploadStatusMsg}</span>
                  </div>
                )}

                {uploadErrorMsg && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadErrorMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: COLOR SCHEME */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-red-500" /> اختيار الألوان والنسق البصري الرئيسي
                  </h3>
                  <p className="text-xs text-slate-400">
                    اختر اللون الأساسي للمنصة أو اختر من اللوحات البصرية الجاهزة.
                  </p>
                </div>

                {/* Preset Palettes */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">لوحات ألوان احترافية جاهزة بنقرة واحدة:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PRESET_COLOR_PALETTES.map((pal) => (
                      <button
                        key={pal.nameAr}
                        onClick={() => {
                          updateSettings({
                            primaryColorHex: pal.primary,
                            accentColorHex: pal.accent,
                            announcementBgColorHex: pal.primary
                          });
                        }}
                        className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-right transition flex items-center justify-between cursor-pointer group"
                      >
                        <span className="text-xs font-bold text-white group-hover:text-amber-300">{pal.nameAr}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                            style={{ backgroundColor: pal.primary }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                            style={{ backgroundColor: pal.accent }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Custom Hex Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">اللون الأساسي (Primary Accent):</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.primaryColorHex}
                        onChange={(e) => updateSettings({ primaryColorHex: e.target.value })}
                        className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                      />
                      <input
                        type="text"
                        value={settings.primaryColorHex}
                        onChange={(e) => updateSettings({ primaryColorHex: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono uppercase w-32"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">اللون المساعد (Secondary Accent):</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.accentColorHex}
                        onChange={(e) => updateSettings({ accentColorHex: e.target.value })}
                        className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                      />
                      <input
                        type="text"
                        value={settings.accentColorHex}
                        onChange={(e) => updateSettings({ accentColorHex: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono uppercase w-32"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TYPOGRAPHY / FONTS */}
            {activeTab === 'typography' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Type className="w-5 h-5 text-red-500" /> تغيير نوع الخط العربي الرئيسي للشبكة
                  </h3>
                  <p className="text-xs text-slate-400">
                    اختر خط الكتابة الذي يظهر في جميع الأقسام والصفحات والأزرار بالموقع.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {AVAILABLE_FONTS.map((font) => {
                    const isSelected = settings.fontFamily === font.id;
                    return (
                      <button
                        key={font.id}
                        onClick={() => updateSettings({ fontFamily: font.id as any })}
                        className={`p-4 rounded-2xl border text-right transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-red-600/20 border-red-500 text-white font-black shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="font-extrabold text-sm text-white block" style={{ fontFamily: font.id }}>
                            {font.nameAr}
                          </span>
                          <span className="text-xs text-slate-400 block font-sans" style={{ fontFamily: font.id }}>
                            مثال: أكاديمية سمارتك للروبوتات والذكاء الاصطناعي — 0123456789
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: IDENTITY & TEXTS */}
            {activeTab === 'identity' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Layout className="w-5 h-5 text-red-500" /> تعديل مسميات المنصة والعناوين الرسمية
                  </h3>
                  <p className="text-xs text-slate-400">
                    يمكنك كتابة مسمى الأكاديمية الرسمي وشعارها اللفظي وحقوق الملكية باللغتين العربية والإنجليزية.
                  </p>
                </div>

                <div className="space-y-4 bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">اسم المنصة بالعربية:</label>
                    <input
                      type="text"
                      value={settings.brandNameAr}
                      onChange={(e) => updateSettings({ brandNameAr: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">اسم المنصة بالإنجليزية (English Title):</label>
                    <input
                      type="text"
                      value={settings.brandNameEn}
                      onChange={(e) => updateSettings({ brandNameEn: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">الوصف أو الشعار اللفظي الفرعي:</label>
                    <input
                      type="text"
                      value={settings.brandTaglineAr}
                      onChange={(e) => updateSettings({ brandTaglineAr: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-300 block">نص حقوق الملكية في أسفل الصفحة (Footer Copyright):</label>
                    <input
                      type="text"
                      value={settings.footerTextAr}
                      onChange={(e) => updateSettings({ footerTextAr: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ANNOUNCEMENT BANNER */}
            {activeTab === 'banner' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-red-500" /> شريط الإعلانات والتنبيهات المباشرة
                  </h3>
                  <p className="text-xs text-slate-400">
                    هذا الشريط يظهر في أعلى الهيدر لجميع زوار المنصة لإتاحة الخصومات والتنبيهات المهمة.
                  </p>
                </div>

                <div className="space-y-4 bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">نص الإعلان العلوي:</label>
                    <input
                      type="text"
                      value={settings.announcementTextAr}
                      onChange={(e) => updateSettings({ announcementTextAr: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">لون خلفية شريط الإعلانات:</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.announcementBgColorHex}
                        onChange={(e) => updateSettings({ announcementBgColorHex: e.target.value })}
                        className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                      />
                      <input
                        type="text"
                        value={settings.announcementBgColorHex}
                        onChange={(e) => updateSettings({ announcementBgColorHex: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono uppercase w-32"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: ADVANCED CSS */}
            {activeTab === 'advanced' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-red-500" /> تخصيص أكواد CSS المتقدمة
                  </h3>
                  <p className="text-xs text-slate-400">
                    يمكنك كتابة تنسيقات CSS مخصصة تُطبق مباشرة على عناصر الصفحة للحصول على أي تصميم خاص تريد.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-950 p-4 rounded-3xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 block">Custom CSS Rules:</label>
                  <textarea
                    rows={8}
                    value={settings.customCss}
                    onChange={(e) => updateSettings({ customCss: e.target.value })}
                    placeholder="/* أدخل أكواد CSS هنا مثلاً: */&#10;header { border-bottom: 2px solid #ef4444; }"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-emerald-400 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              if (window.confirm('هل أنت تأكد من إعادة ضبط وتطبيق إعدادات التصميم القياسية التلقائية؟')) {
                resetToDefaults();
                setLogoPreviewUrl(null);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة التعيين للشكل التلقائي القياسي</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition"
          >
            <Check className="w-4 h-4" />
            <span>حفظ وإغلاق نافذة التعديل</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
