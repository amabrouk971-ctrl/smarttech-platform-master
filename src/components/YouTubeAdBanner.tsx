import React, { useState, useEffect } from 'react';
import { Youtube, Play, ExternalLink, Edit3, Check, Sparkles, Megaphone, Share2 } from 'lucide-react';
import { User, Role } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface YouTubeAdBannerProps {
  currentUser?: User | null;
}

export const YouTubeAdBanner: React.FC<YouTubeAdBannerProps> = ({ currentUser }) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [adTitle, setAdTitle] = useState<string>('');
  const [adDescription, setAdDescription] = useState<string>('');
  const [buttonLink, setButtonLink] = useState<string>('');
  const [loaded, setLoaded] = useState<boolean>(false);
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [inputTitle, setInputTitle] = useState<string>('');
  const [inputDesc, setInputDesc] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const isSuperAdmin = currentUser?.role === Role.SUPER_ADMIN || currentUser?.role === Role.ADMIN;

  // Extract YouTube Embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  useEffect(() => {
    const fetchAdSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'ad_banner'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.videoUrl) {
            setVideoUrl(data.videoUrl);
            setAdTitle(data.title || '');
            setAdDescription(data.description || '');
            setButtonLink(data.buttonLink || data.videoUrl);
          }
        }
      } catch (e) {
        console.warn('Ad banner settings load error:', e);
      } finally {
        setLoaded(true);
      }
    };
    fetchAdSettings();
  }, []);

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedEmbed = getEmbedUrl(inputUrl);
    setVideoUrl(formattedEmbed);
    setAdTitle(inputTitle);
    setAdDescription(inputDesc);
    const link = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;
    setButtonLink(link);

    try {
      await setDoc(doc(db, 'settings', 'ad_banner'), {
        videoUrl: formattedEmbed,
        title: inputTitle,
        description: inputDesc,
        buttonLink: link,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.id || 'admin'
      });
    } catch (e) {
      console.warn('Save ad banner error:', e);
    }

    setIsEditing(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(buttonLink || videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!loaded) return null;
  if (!videoUrl && !isSuperAdmin) return null;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-900 border-y border-red-900/30 text-white dir-rtl text-right my-8 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Ad Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-red-600 text-white font-black text-[11px] flex items-center gap-1.5 shadow-lg shadow-red-600/30">
              <Megaphone className="w-3.5 h-3.5 animate-bounce" /> إعلان مرئي رسمي
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> العرض المميز
            </span>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'إلغاء التعديل' : 'تخصيص الإعلان (Admin Only)'}</span>
            </button>
          )}
        </div>

        {/* Admin Edit Panel */}
        {isEditing && isSuperAdmin && (
          <form onSubmit={handleSaveAd} className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> لوحة تخصيص الإعلان المرئي الرسمي
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">رابط فيديو YouTube أو المعرّف:</label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white dir-ltr focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">عنوان الإعلان الرئيسي:</label>
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-red-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">وصف الإعلان:</label>
              <textarea
                value={inputDesc}
                onChange={(e) => setInputDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-red-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" /> حفظ ونشر الإعلان فوراً
              </button>
            </div>
          </form>
        )}

        {/* Video & Info Grid Layout */}
        {videoUrl ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* YouTube Embedded Video Container */}
            <div className="lg:col-span-7 relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-red-600/40 shadow-2xl bg-black">
              <iframe
                src={getEmbedUrl(videoUrl)}
                title={adTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Ad Copy & Action Link */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs">
                  <Youtube className="w-5 h-5 text-red-600" />
                  <span>فيديو إعلاني رسمي من إدارة الأكاديمية</span>
                </div>
                {adTitle && <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">{adTitle}</h3>}
                {adDescription && <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{adDescription}</p>}
              </div>

              {/* Link & Social Share Actions */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>رابط الإعلان المباشر:</span>
                  <button
                    onClick={handleCopyLink}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? 'تم نسخ الرابط!' : 'مشاركة الرابط'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 dir-ltr">
                  <Youtube className="w-4 h-4 text-red-500 shrink-0 ml-1" />
                  <span className="text-xs text-slate-300 font-mono truncate flex-1">{buttonLink || videoUrl}</span>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={buttonLink || videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/30"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>مشاهدة الإعلان الكامل على YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
            <p className="text-xs text-slate-400">لا يوجد إعلان مرئي مفعل حالياً.</p>
          </div>
        )}
      </div>
    </section>
  );
};
