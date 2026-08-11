import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Upload, ShieldCheck, FileType, CheckCircle, AlertCircle, RefreshCw 
} from 'lucide-react';
import { 
  getFileUploadSettings, updateFileUploadSettings, FileUploadSettings, DEFAULT_FILE_UPLOAD_SETTINGS 
} from '../../services/contentDeliveryService';

export const FileUploadSettingsCMS: React.FC = () => {
  const [settings, setSettings] = useState<FileUploadSettings>(DEFAULT_FILE_UPLOAD_SETTINGS);
  const [extensionsInput, setExtensionsInput] = useState('');
  const [mimeTypesInput, setMimeTypesInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getFileUploadSettings();
      setSettings(data);
      setExtensionsInput(data.allowedExtensions.join(', '));
      setMimeTypesInput(data.allowedMimeTypes.join(', '));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const parsedExts = extensionsInput
        .split(',')
        .map(x => x.trim().toLowerCase().replace(/^\./, ''))
        .filter(Boolean);

      const parsedMimes = mimeTypesInput
        .split(',')
        .map(x => x.trim())
        .filter(Boolean);

      const updated: FileUploadSettings = {
        ...settings,
        allowedExtensions: parsedExts,
        allowedMimeTypes: parsedMimes
      };

      await updateFileUploadSettings(updated);
      setSettings(updated);
      setSuccessMessage('تم حفظ إعدادات رفع الملفات بنجاح في قاعدة البيانات.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-red-500" />
        <span>جاري تحميل إعدادات رفع الملفات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Upload className="w-6 h-6 text-red-500" />
            إعدادات سياسة رفع الملفات والتخزين (File Upload Settings)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            التحكم الديناميكي في الامتدادات المسموح بها، الأحجام القصوى، سياسات التحميل والمعاينة بدون أكواد صلبة.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-2 shrink-0 transition"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ السياسة
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: File Types & Extensions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-black text-sm border-b pb-2 text-slate-900 dark:text-white flex items-center gap-2">
            <FileType className="w-4 h-4 text-red-500" />
            الامتدادات وأنواع الملفات المسموحة (Dynamic File Extensions)
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              الامتدادات المسموح بها (مفصولة بفاصلة):
            </label>
            <textarea
              rows={3}
              value={extensionsInput}
              onChange={(e) => setExtensionsInput(e.target.value)}
              placeholder="pdf, ppt, pptx, doc, docx, xls, xlsx, csv, txt, jpg, jpeg, png, webp, svg, mp4, webm"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-mono dark:text-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              ملاحظة: يمكنك إزالة أو إضافة أي امتداد جديد وتطبيقه فوراً بدون تعديل الكود.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              أنواع الميديا المسموحة (MIME Types):
            </label>
            <textarea
              rows={3}
              value={mimeTypesInput}
              onChange={(e) => setMimeTypesInput(e.target.value)}
              placeholder="application/pdf, video/mp4, image/png, application/vnd.ms-powerpoint"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-mono dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              مسار التخزين الافتراضي (Firebase Storage Path):
            </label>
            <input
              type="text"
              value={settings.storagePathPrefix}
              onChange={(e) => setSettings({ ...settings, storagePathPrefix: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono dark:text-white"
            />
          </div>
        </div>

        {/* Card 2: Size Limits */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-black text-sm border-b pb-2 text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            الحدود القصوى لأحجام الملفات (Max Size Limits)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                الحد العام لكل ملف (MB):
              </label>
              <input
                type="number"
                value={settings.maxFileSizeMB}
                onChange={(e) => setSettings({ ...settings, maxFileSizeMB: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                الحد الأقصى للفيديوهات (MB):
              </label>
              <input
                type="number"
                value={settings.maxVideoSizeMB}
                onChange={(e) => setSettings({ ...settings, maxVideoSizeMB: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                الحد الأقصى للمستندات/PDF (MB):
              </label>
              <input
                type="number"
                value={settings.maxDocumentSizeMB}
                onChange={(e) => setSettings({ ...settings, maxDocumentSizeMB: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                الحد الأقصى للصور (MB):
              </label>
              <input
                type="number"
                value={settings.maxImageSizeMB}
                onChange={(e) => setSettings({ ...settings, maxImageSizeMB: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">السياسات الافتراضية للمواد الجديدة:</h4>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settings.defaultDownloadAllowed}
                onChange={(e) => setSettings({ ...settings, defaultDownloadAllowed: e.target.checked })}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              السماح بالتحميل المباشر للطلاب افتراضياً (Download Allowed)
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settings.defaultPreviewAllowed}
                onChange={(e) => setSettings({ ...settings, defaultPreviewAllowed: e.target.checked })}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              تمكين المعاينة التفاعلية داخل المنصة (Protected Viewer)
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settings.defaultRequiresEnrollment}
                onChange={(e) => setSettings({ ...settings, defaultRequiresEnrollment: e.target.checked })}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              اشتراط الاشتراك بالدورة التدريبية للوصول للمواد
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};
