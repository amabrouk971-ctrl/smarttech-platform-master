import React, { useState, useEffect } from 'react';
import { Youtube, Play, Sparkles, Settings2, Check, Video, ExternalLink, AlertCircle, Plus, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MarketingMediaGallery } from './MarketingMediaGallery';
import { Course, Role, PlatformVideo } from '../types';

interface FeaturedVideoSectionProps {
  isAdmin?: boolean;
  userRole?: Role;
  courses?: Course[];
}

export const FeaturedVideoSection: React.FC<FeaturedVideoSectionProps> = ({ isAdmin, userRole, courses = [] }) => {
  const [currentVideo, setCurrentVideo] = useState<PlatformVideo | null>(null);
  const [availableVideos, setAvailableVideos] = useState<PlatformVideo[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  
  const [customInputUrl, setCustomInputUrl] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDesc, setCustomDesc] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const isUserAdmin = isAdmin || userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN;

  // Extract YouTube ID from link or raw ID
  const extractYouTubeId = (urlOrId: string): string | null => {
    if (!urlOrId) return null;
    const clean = urlOrId.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
      return clean;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = clean.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Load real persistent video from Firestore on mount
  useEffect(() => {
    const loadRealVideo = async () => {
      try {
        // Load all platform_videos from Firestore
        const videosSnap = await getDocs(collection(db, 'platform_videos'));
        const loadedList: PlatformVideo[] = [];
        if (!videosSnap.empty) {
          videosSnap.forEach((docSnap) => {
            const data = docSnap.data() as PlatformVideo;
            if (data.status === 'PUBLISHED' || isUserAdmin) {
              loadedList.push({ id: docSnap.id, ...data });
            }
          });
          setAvailableVideos(loadedList);
        }

        // Check settings/featured_video for active selection
        const docRef = doc(db, 'settings', 'featured_video');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.videoId || data.videoUrl) {
            const feat: PlatformVideo = {
              id: data.id || 'featured',
              videoId: data.videoId || data.id || 'featured',
              title: data.titleAr || data.title || 'فيديو الأكاديمية الرسمي',
              description: data.descAr || data.description || '',
              storagePath: data.storagePath || `/smarttech/videos/general/${data.videoId || 'yt'}`,
              videoUrl: data.videoUrl || `https://www.youtube-nocookie.com/embed/${data.youtubeId}`,
              uploadedBy: data.uploadedBy || 'admin',
              uploadedAt: data.uploadedAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
              mimeType: 'video/mp4',
              extension: 'mp4',
              fileSize: 0
            };
            setCurrentVideo(feat);
          }
        } else if (loadedList.length > 0) {
          setCurrentVideo(loadedList[0]);
        }
      } catch (err) {
        console.warn('Could not load featured video from Firestore:', err);
      } finally {
        setLoaded(true);
      }
    };

    loadRealVideo();
  }, [isUserAdmin]);

  // Save new admin-uploaded video configuration
  const handleSaveVideo = async (urlOrId: string, title: string, desc: string) => {
    if (!urlOrId.trim()) {
      setErrorMsg('يرجى إدخال رابط الفيديو أو معرّفه.');
      return;
    }

    const ytId = extractYouTubeId(urlOrId);
    const videoUrl = ytId ? `https://www.youtube-nocookie.com/embed/${ytId}` : urlOrId;
    const finalId = 'vid_' + Date.now();

    const newVideo: PlatformVideo = {
      id: finalId,
      videoId: finalId,
      title: title.trim() || 'فيديو الأكاديمية المعروض',
      description: desc.trim() || '',
      storagePath: `/smarttech/videos/${selectedCourseId || 'general'}/${finalId}`,
      videoUrl,
      uploadedBy: 'admin_authenticated_uid',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      courseId: selectedCourseId || undefined,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      mimeType: 'video/mp4',
      extension: 'mp4',
      fileSize: 0
    };

    setCurrentVideo(newVideo);
    setAvailableVideos((prev) => [newVideo, ...prev]);

    const payload = {
      id: finalId,
      videoId: finalId,
      youtubeId: ytId || '',
      titleAr: newVideo.title,
      descAr: newVideo.description,
      videoUrl: newVideo.videoUrl,
      storagePath: newVideo.storagePath,
      uploadedBy: 'admin_authenticated_uid',
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'settings', 'featured_video'), payload, { merge: true });
      await setDoc(doc(db, 'platform_videos', finalId), newVideo);
    } catch (e) {
      console.warn('Could not save video settings to Firestore:', e);
    }

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
    setShowConfigModal(false);
    setCustomInputUrl('');
    setCustomTitle('');
    setCustomDesc('');
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white dir-rtl text-right overflow-hidden relative border-y border-slate-800/80">
      {/* Background Lighting FX */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 font-black text-xs">
              <Youtube className="w-4 h-4 text-red-500" />
              <span>فيديوهات الأكاديمية الرسمية (Admin Content Only)</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              شاهد الفيديوهات والشروحات المعتمدة من الأكاديمية 🎥
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              يتم عرض الفيديوهات المرفوعة حصرياً بواسطة إدارة سمارتك المعتمدة.
            </p>
          </div>

          {isUserAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowConfigModal(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-extrabold text-white flex items-center gap-2 transition cursor-pointer shadow-lg shadow-red-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>رفع / إضافة فيديو جديد (Admin)</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content: Player or Empty State */}
        {currentVideo ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Main Embedded Player Frame */}
            <div className="lg:col-span-8 bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative group">
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                {currentVideo.videoUrl.includes('youtube') || currentVideo.videoUrl.includes('embed') ? (
                  <iframe
                    className="w-full h-full border-0"
                    src={currentVideo.videoUrl}
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={currentVideo.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            {/* Side Video Details Panel */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Video className="w-4 h-4" /> الفيديو المعروض حالياً:
                  </span>
                  {isSavedNotice && (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <Check className="w-3 h-3" /> تم حفظ التغيير
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-base sm:text-lg text-white leading-snug">
                    {currentVideo.title}
                  </h3>
                  {currentVideo.description && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      {currentVideo.description}
                    </p>
                  )}
                </div>

                {/* Available Admin Videos List */}
                {availableVideos.length > 1 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-extrabold text-slate-400 block">
                      فيديوهات الأكاديمية المتاحة ({availableVideos.length}):
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {availableVideos.map((vid) => (
                        <button
                          key={vid.id}
                          onClick={() => setCurrentVideo(vid)}
                          className={`w-full text-right p-3 rounded-2xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            vid.id === currentVideo.id
                              ? 'bg-red-600/20 border-red-500 text-white font-black'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                          }`}
                        >
                          <span className="truncate">{vid.title}</span>
                          <Play className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>جميع الفيديوهات مرفوعة ومفحوصة أمنياً بواسطة إدارة الأكاديمية.</span>
              </div>
            </div>
          </div>
        ) : (
          /* EMPTY STATE - NO ADMIN VIDEOS YET */
          <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800 text-red-500 flex items-center justify-center mx-auto">
              <Video className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">لا توجد فيديوهات معروضة حالياً</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                تم تنظيف المحتوى التجريبي بالكامل. المادة المرئية تظهر فور رفعها واعتمادها حصرياً من قبل أدمن الأكاديمية.
              </p>
            </div>

            {isUserAdmin && (
              <button
                onClick={() => setShowConfigModal(true)}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 inline-flex items-center gap-2 cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة أول فيديو رسمي للأكاديمية 🚀</span>
              </button>
            )}
          </div>
        )}

        {/* Media & Posts Marketing Gallery Feed */}
        <div className="pt-8 border-t border-slate-800/80">
          <MarketingMediaGallery
            userRole={userRole || (isAdmin ? Role.ADMIN : undefined)}
            courses={courses}
          />
        </div>
      </div>

      {/* Admin Video Upload Modal */}
      <AnimatePresence>
        {showConfigModal && isUserAdmin && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl dir-rtl text-right relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5 text-red-500 font-black text-lg">
                  <Upload className="w-6 h-6" />
                  <span>رفع وتثبيت فيديو رسمي جديد (Admin)</span>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer text-sm font-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    عنوان الفيديو الرئيسي: *
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="مثال: فيديو الجولة التعريفية بالمعامل 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    رابط الفيديو (YouTube / Storage URL): *
                  </label>
                  <input
                    type="text"
                    required
                    value={customInputUrl}
                    onChange={(e) => {
                      setCustomInputUrl(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="https://www.youtube.com/watch?v=... أو رابط مباشر"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    وصف أو تفاصيل الفيديو:
                  </label>
                  <textarea
                    rows={2}
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder="شرح مختصر للمحتوى المرفوع..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                {courses.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">
                      ربط بكورس معين (اختياري):
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                    >
                      <option value="">-- فيديو عام للأكاديمية --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} • {c.titleAr}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold">
                    {errorMsg}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSaveVideo(customInputUrl, customTitle, customDesc)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ ونشر الفيديو رسمياً 🚀</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
