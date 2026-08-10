import React, { useState, useEffect } from 'react';
import { getPaymentSettings, updatePaymentSettings, formatWhatsAppMessage, DEFAULT_CONTACT_PAYMENT_SETTINGS } from '../../services/bookingService';
import { ContactPaymentSettings, WhatsAppTemplates } from '../../types';
import { Settings, Save, CheckCircle2, Phone, MapPin, CreditCard, MessageCircle, Eye, Sparkles, ExternalLink, Copy, Clock, Building2, HelpCircle } from 'lucide-react';

export const AdminPaymentSettingsCMS: React.FC = () => {
  const [settings, setSettings] = useState<ContactPaymentSettings>(DEFAULT_CONTACT_PAYMENT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'methods' | 'location' | 'templates' | 'preview'>('methods');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [previewVars, setPreviewVars] = useState({
    courseName: 'دبلومة الذكاء الاصطناعي وتطوير التطبيقات',
    customerName: 'أحمد محمود العبد',
    phone: '01012345678',
    price: '2500',
    paymentMethod: 'InstaPay',
    className: 'مجموعة الأحد والأربعاء - 5:00 مساءً',
    startDate: '15 سبتمبر 2026',
    schedule: '5:00 - 7:00 مساءً',
    attendanceMode: 'حضوري في المركز',
    bookingId: '8F3A21',
    centerName: settings.centerName,
    centerAddress: settings.centerAddress
  });

  useEffect(() => {
    getPaymentSettings().then(s => {
      setSettings(s);
      setPreviewVars(prev => ({
        ...prev,
        centerName: s.centerName,
        centerAddress: s.centerAddress
      }));
    }).catch(console.error);
  }, []);

  const handleChange = (field: keyof ContactPaymentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateChange = (field: keyof WhatsAppTemplates, value: string) => {
    setSettings(prev => ({
      ...prev,
      whatsappTemplates: {
        ...DEFAULT_CONTACT_PAYMENT_SETTINGS.whatsappTemplates,
        ...(prev.whatsappTemplates || {}),
        [field]: value
      }
    }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      await updatePaymentSettings(settings);
      setSaveMessage('تم حفظ إعدادات الدفع والتواصل والواتساب بنجاح ✅');
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (error) {
      console.error('Error saving payment settings', error);
      setSaveMessage('حدث خطأ أثناء حفظ الإعدادات.');
    } finally {
      setIsSaving(false);
    }
  };

  const templates = settings.whatsappTemplates || DEFAULT_CONTACT_PAYMENT_SETTINGS.whatsappTemplates!;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 max-w-6xl mx-auto text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <Settings className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">إعدادات وسائل الدفع والواتساب والفرع 💳</h2>
            <p className="text-xs text-slate-400 mt-1">
              إدارة أرقام InstaPay وVodafone Cash ورابط الخريطة وقوالب رسائل الواتساب الديناميكية دون الحاجة للبرمجة.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl transition shadow-lg shadow-emerald-900/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات الحالية'}
        </button>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm rounded-2xl animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('methods')}
          className={`px-5 py-3 rounded-2xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'methods'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          وسائل الدفع والأرقام
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('location')}
          className={`px-5 py-3 rounded-2xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'location'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4 text-red-400" />
          مقر المركز وخرائط Google
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-5 py-3 rounded-2xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          قوالب رسائل الواتساب
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-5 py-3 rounded-2xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4 text-purple-400" />
          معاينة تجربة العميل Live
        </button>
      </div>

      {/* Tab 1: Methods */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          
          {/* General WhatsApp Support */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-white">رقم الواتساب الرئيسي للدعم والاستفسارات 💬</h3>
                <p className="text-xs text-slate-400">الرقم الذي يتم توجيه استفسارات الكورسات والدفع بالمركز إليه.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">رقم الواتساب الرئيسي (مع كود الدولة أو بدون)</label>
                <input
                  type="text"
                  value={settings.supportWhatsapp}
                  onChange={(e) => handleChange('supportWhatsapp', e.target.value)}
                  placeholder="01227811948"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 dir-ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اسم المستلم الرسمي في التحويلات</label>
                <input
                  type="text"
                  value={settings.paymentRecipientName}
                  onChange={(e) => handleChange('paymentRecipientName', e.target.value)}
                  placeholder="SmartTech Center"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* InstaPay */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-black text-sm">
                  ⚡
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">إعدادات تحويل InstaPay</h3>
                  <p className="text-xs text-slate-400">أرقام وتفعيل خدمة الدفع عبر إنستا باي</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={settings.enableInstapay}
                  onChange={(e) => handleChange('enableInstapay', e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
                <span className="text-xs font-extrabold text-slate-300">تفعيل الدفع بـ InstaPay</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم InstaPay المخصص للتحويل</label>
                <input
                  type="text"
                  value={settings.instapayNumber}
                  onChange={(e) => handleChange('instapayNumber', e.target.value)}
                  disabled={!settings.enableInstapay}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono font-bold text-purple-300 focus:ring-2 focus:ring-purple-500 disabled:opacity-40 dir-ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم واتساب InstaPay لتلقي إثبات التحويل</label>
                <input
                  type="text"
                  value={settings.instapayWhatsapp}
                  onChange={(e) => handleChange('instapayWhatsapp', e.target.value)}
                  disabled={!settings.enableInstapay}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500 disabled:opacity-40 dir-ltr"
                />
              </div>
            </div>
          </div>

          {/* Vodafone Cash */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 font-black text-sm">
                  📱
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">إعدادات تحويل Vodafone Cash</h3>
                  <p className="text-xs text-slate-400">أرقام وتفعيل خدمة فودافون كاش</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={settings.enableVodafoneCash}
                  onChange={(e) => handleChange('enableVodafoneCash', e.target.checked)}
                  className="w-4 h-4 accent-red-500"
                />
                <span className="text-xs font-extrabold text-slate-300">تفعيل الدفع بـ Vodafone Cash</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم محفظة Vodafone Cash للتحويل</label>
                <input
                  type="text"
                  value={settings.vodafoneCashNumber}
                  onChange={(e) => handleChange('vodafoneCashNumber', e.target.value)}
                  disabled={!settings.enableVodafoneCash}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono font-bold text-red-300 focus:ring-2 focus:ring-red-500 disabled:opacity-40 dir-ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم واتساب Vodafone Cash لتلقي السكرين شوت</label>
                <input
                  type="text"
                  value={settings.vodafoneCashWhatsapp}
                  onChange={(e) => handleChange('vodafoneCashWhatsapp', e.target.value)}
                  disabled={!settings.enableVodafoneCash}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500 disabled:opacity-40 dir-ltr"
                />
              </div>
            </div>
          </div>

          {/* Pay In Center */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">إمكانية الدفع نقداً بداخل مقر المركز (Pay In Center)</h3>
                  <p className="text-xs text-slate-400">السماح للعميل بالحجز والحضور للدفع بالمركز</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={settings.enablePayInCenter}
                  onChange={(e) => handleChange('enablePayInCenter', e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <span className="text-xs font-extrabold text-slate-300">تفعيل الدفع بالمركز</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">تعليمات الدفع المباشرة للعملاء</label>
              <textarea
                value={settings.paymentInstructions}
                onChange={(e) => handleChange('paymentInstructions', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-200 h-24 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Location */}
      {activeTab === 'location' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" /> عنوان المقر ومواعيد العمل الرسمية
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المقر / المركز</label>
                <input
                  type="text"
                  value={settings.centerName}
                  onChange={(e) => handleChange('centerName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">مواعيد العمل الرسمية</label>
                <input
                  type="text"
                  value={settings.businessHours}
                  onChange={(e) => handleChange('businessHours', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">العنوان التفصيلي للمركز</label>
                <input
                  type="text"
                  value={settings.centerAddress}
                  onChange={(e) => handleChange('centerAddress', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">رابط Google Maps للفرع (يُفتح تلقائياً عند ضغط العميل)</label>
                <input
                  type="text"
                  value={settings.googleMapsUrl}
                  onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-emerald-300 dir-ltr"
                />
              </div>
            </div>

            {settings.googleMapsUrl && (
              <div className="pt-2">
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  اختبار فتح رابط الخريطة على Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs space-y-2">
            <div className="font-extrabold flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" /> المتغيرات الديناميكية المتاحة للاستخدام في الرسائل:
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              {['{{courseName}}', '{{customerName}}', '{{phone}}', '{{price}}', '{{paymentMethod}}', '{{className}}', '{{startDate}}', '{{schedule}}', '{{attendanceMode}}', '{{bookingId}}', '{{centerName}}', '{{centerAddress}}'].map(v => (
                <span key={v} className="px-2 py-1 bg-slate-900 rounded border border-amber-500/20">{v}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Inquiry Template */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-black text-white">رسالة الاستفسار عن الكورس (اسأل عن الكورس)</label>
              <textarea
                value={templates.courseInquiry}
                onChange={(e) => handleTemplateChange('courseInquiry', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 h-44 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* InstaPay Template */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-black text-purple-400">رسالة تأكيد الدفع بـ InstaPay</label>
              <textarea
                value={templates.instapayPayment}
                onChange={(e) => handleTemplateChange('instapayPayment', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 h-44 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Vodafone Cash Template */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-black text-red-400">رسالة تأكيد الدفع بـ Vodafone Cash</label>
              <textarea
                value={templates.vodafoneCashPayment}
                onChange={(e) => handleTemplateChange('vodafoneCashPayment', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 h-44 focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Pay In Center Template */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-black text-emerald-400">رسالة الحجز والدفع بالمركز</label>
              <textarea
                value={templates.payInCenter}
                onChange={(e) => handleTemplateChange('payInCenter', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 h-44 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Live Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-300 text-xs">
            معاينة فورية لكروت الدفع ورسائل الواتساب التي تظهر للعميل بناءً على مدخلاتك الحالية:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* InstaPay Card Preview */}
            <div className="bg-slate-950 border border-purple-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">InstaPay</span>
                <span className="text-xs font-bold text-emerald-400">0% رسوم تحويل</span>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold mb-1">رقم حساب InstaPay:</div>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="font-mono text-base font-black text-purple-300 dir-ltr">{settings.instapayNumber}</span>
                  <button
                    onClick={() => handleCopy(settings.instapayNumber, 'instapay')}
                    className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedKey === 'instapay' ? 'تم النسخ!' : 'نسخ'}
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <p>1. افتح تطبيق InstaPay وانقل المبلغ ({previewVars.price} EGP).</p>
                <p>2. خذ لقطة شاشة للتحويل.</p>
                <p>3. اضغط زر الواتساب لإرسال الإثبات.</p>
              </div>
              <button
                type="button"
                className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                <MessageCircle className="w-4 h-4" />
                إرسال التأكيد عبر الواتساب ({settings.instapayWhatsapp})
              </button>
            </div>

            {/* Vodafone Cash Card Preview */}
            <div className="bg-slate-950 border border-red-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">Vodafone Cash</span>
                <span className="text-xs font-bold text-slate-400">محفظة إلكترونية</span>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold mb-1">رقم محفظة فودافون كاش:</div>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="font-mono text-base font-black text-red-300 dir-ltr">{settings.vodafoneCashNumber}</span>
                  <button
                    onClick={() => handleCopy(settings.vodafoneCashNumber, 'voda')}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedKey === 'voda' ? 'تم النسخ!' : 'نسخ'}
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <p>1. طلب #7*9* للتحويل لـ {settings.vodafoneCashNumber}.</p>
                <p>2. احتفظ بـ SMS أو السكرين شوت.</p>
                <p>3. أرسل التأكيد على الرقم بالأسفل.</p>
              </div>
              <button
                type="button"
                className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                <MessageCircle className="w-4 h-4" />
                إرسال التأكيد عبر الواتساب ({settings.vodafoneCashWhatsapp})
              </button>
            </div>

            {/* Pay In Center Preview */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Pay In Center</span>
                <span className="text-xs font-bold text-slate-400">الدفع بالمقر</span>
              </div>
              <div className="space-y-2 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                <div className="font-bold text-white flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-emerald-400" /> {settings.centerName}
                </div>
                <div className="text-slate-300 text-[11px]">{settings.centerAddress}</div>
                <div className="text-slate-400 text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {settings.businessHours}
                </div>
              </div>

              {settings.googleMapsUrl && (
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <MapPin className="w-4 h-4 text-red-500" />
                  فتح الموقع على Google Maps
                </a>
              )}

              <button
                type="button"
                className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                <MessageCircle className="w-4 h-4" />
                تأكيد الحجز والدفع بالمركز
              </button>
            </div>

          </div>

          {/* Generated WhatsApp Message Live Preview */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> معاينة النص المولد ديناميكياً للتحويل عبر InstaPay
            </h4>
            <pre className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed dir-rtl">
              {formatWhatsAppMessage(templates.instapayPayment, previewVars)}
            </pre>
          </div>

        </div>
      )}

    </div>
  );
};
