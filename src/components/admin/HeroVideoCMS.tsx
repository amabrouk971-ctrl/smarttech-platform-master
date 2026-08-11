import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useLanguage } from '../../context/LanguageContext';
import { Video, Save, Trash2, CheckCircle2, PlayCircle, Eye } from 'lucide-react';
import { motion } from 'motion/react';

export interface HeroAdvertisement {
  id: string;
  type: 'HERO_VIDEO';
  position: 'HOMEPAGE_TOP';
  enabled: boolean;
  autoplay: boolean;
  muted: boolean;
  playsInline: boolean;
  loop: boolean;
  controls: boolean;
  videoSource: string;
  posterImage: string;
  startAt?: string;
  endAt?: string;
}

const DEFAULT_AD: HeroAdvertisement = {
  id: 'main_hero_video',
  type: 'HERO_VIDEO',
  position: 'HOMEPAGE_TOP',
  enabled: true,
  autoplay: true,
  muted: true,
  playsInline: true,
  loop: true,
  controls: false,
  videoSource: '',
  posterImage: ''
};

export const HeroVideoCMS: React.FC = () => {
  const { isArabic, dir } = useLanguage();
  const [adConfig, setAdConfig] = useState<HeroAdvertisement>(DEFAULT_AD);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDocs(collection(db, 'advertisements'));
        if (!snap.empty) {
          const docItem = snap.docs.find(d => d.id === 'main_hero_video');
          if (docItem) {
            setAdConfig({ id: docItem.id, ...docItem.data() } as HeroAdvertisement);
          }
        }
      } catch (err) {
        console.warn('Error fetching hero ad config', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'advertisements', adConfig.id), adConfig);
      setSuccessMsg(isArabic ? 'تم حفظ التعديلات بنجاح! 🚀' : 'Changes saved successfully! 🚀');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn('Error saving ad config', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(isArabic ? 'تأكيد الحذف؟ سيرجع للصفحة الرئيسية بدون فيديو.' : 'Are you sure you want to delete this configuration?')) return;
    try {
      await deleteDoc(doc(db, 'advertisements', adConfig.id));
      setAdConfig(DEFAULT_AD);
      setSuccessMsg(isArabic ? 'تم حذف الفيديو.' : 'Video config deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn('Error deleting ad config', err);
    }
  };

  if (loading) return <div className="text-center p-8 text-slate-500">جاري التحميل... / Loading...</div>;

  return (
    <div dir={dir} className={`space-y-6 ${isArabic ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              {isArabic ? 'إعدادات فيديو البانر الرئيسي (Hero Video)' : 'Hero Advertisement Video Settings'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isArabic ? 'تحكم في كيفية عرض وعمل الفيديو الرئيسي أعلى الصفحة.' : 'Control the behavior and source of the top homepage hero video.'}
            </p>
          </div>
        </div>

        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 bg-emerald-950 border border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-bold">{successMsg}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            {/* Status */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={adConfig.enabled}
                  onChange={(e) => setAdConfig({...adConfig, enabled: e.target.checked})}
                  className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm font-bold text-white">
                  {isArabic ? 'تفعيل الفيديو في الصفحة الرئيسية' : 'Enable Hero Video on Homepage'}
                </span>
              </label>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={adConfig.autoplay} onChange={(e) => setAdConfig({...adConfig, autoplay: e.target.checked})} className="w-4 h-4 rounded text-indigo-500" />
                  <span className="text-xs font-bold text-slate-300">Autoplay</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={adConfig.muted} onChange={(e) => setAdConfig({...adConfig, muted: e.target.checked})} className="w-4 h-4 rounded text-indigo-500" />
                  <span className="text-xs font-bold text-slate-300">Muted (Required for Autoplay)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={adConfig.playsInline} onChange={(e) => setAdConfig({...adConfig, playsInline: e.target.checked})} className="w-4 h-4 rounded text-indigo-500" />
                  <span className="text-xs font-bold text-slate-300">Plays Inline</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={adConfig.loop} onChange={(e) => setAdConfig({...adConfig, loop: e.target.checked})} className="w-4 h-4 rounded text-indigo-500" />
                  <span className="text-xs font-bold text-slate-300">Loop Video</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={adConfig.controls} onChange={(e) => setAdConfig({...adConfig, controls: e.target.checked})} className="w-4 h-4 rounded text-indigo-500" />
                  <span className="text-xs font-bold text-slate-300">Show Controls</span>
                </label>
              </div>
            </div>

            {/* Media Sources */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">{isArabic ? 'رابط الفيديو (MP4 URL)' : 'Video Source URL'}</label>
                <input 
                  type="text" 
                  value={adConfig.videoSource} 
                  onChange={(e) => setAdConfig({...adConfig, videoSource: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 outline-none"
                  placeholder="https://firebasestorage..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">{isArabic ? 'رابط صورة الغلاف (Poster)' : 'Poster Image URL'}</label>
                <input 
                  type="text" 
                  value={adConfig.posterImage} 
                  onChange={(e) => setAdConfig({...adConfig, posterImage: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition">
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : isArabic ? 'حفظ الإعدادات' : 'Save Configuration'}</span>
              </button>
              <button onClick={handleDelete} className="px-4 py-3 bg-red-950 hover:bg-red-900 text-red-500 font-bold rounded-xl flex items-center justify-center transition" title="Delete Configuration">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <span>{isArabic ? 'معاينة الفيديو (Preview)' : 'Live Preview'}</span>
            </h4>
            <div className="relative aspect-video bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center group">
              {adConfig.videoSource ? (
                <video 
                  src={adConfig.videoSource} 
                  poster={adConfig.posterImage}
                  autoPlay={adConfig.autoplay}
                  muted={adConfig.muted}
                  playsInline={adConfig.playsInline}
                  loop={adConfig.loop}
                  controls={adConfig.controls}
                  className="w-full h-full object-cover"
                />
              ) : adConfig.posterImage ? (
                <img src={adConfig.posterImage} alt="Poster" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-600">
                  <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <span className="text-xs font-bold">{isArabic ? 'لا يوجد فيديو محدد' : 'No Video Source'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
