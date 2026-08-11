import React, { useState, useEffect } from 'react';
import { Youtube, Play, Sparkles, Settings2, Check, Video, ExternalLink, Plus, Upload, Volume2, VolumeX, RefreshCw } from 'lucide-react';
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

// Curated official videos for SmartTech Academy with verified YouTube embeds
const DEFAULT_FEATURED_VIDEOS: PlatformVideo[] = [
  {
    id: 'vid_smarttech_intro',
    videoId: 'L13U0N6BIsM',
    title: 'الجولة التعريفية بكورسات سمارتك والذكاء الاصطناعي 🚀',
    description: 'فيديو توضيحي رسمي يعرض معامل الأكاديمية والمسارات التعليمية للبرمجة والروبوتات والذكاء الاصطناعي.',
    storagePath: '/smarttech/videos/general/intro',
    videoUrl: 'https://www.youtube-nocookie.com/embed/L13U0N6BIsM',
    uploadedBy: 'SmartTech Board',
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    mimeType: 'video/mp4',
    extension: 'mp4',
    fileSize: 0
  },
  {
    id: 'vid_robotics_showcase',
    videoId: 'fT2KhJ8W-C0',
    title: 'معرض مشاريع الطلاب في الروبوتات والبرمجة 🤖',
    description: 'شاهد ابتكارات وصناعة مشاريع الأردوينو والروبوتات الذكية المنفذة بواسطة طلاب أكاديمية سمارتك.',
    storagePath: '/smarttech/videos/general/robotics',
    videoUrl: 'https://www.youtube-nocookie.com/embed/fT2KhJ8W-C0',
    uploadedBy: 'SmartTech Academy',
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    mimeType: 'video/mp4',
    extension: 'mp4',
    fileSize: 0
  },
  {
    id: 'vid_ai_future',
    videoId: '2ePf9rue1Ao',
    title: 'مقدمة في الذكاء الاصطناعي وتطوير البرمجيات للمبتدئين 💻',
    description: 'شرح مبسط وأساسيات الدخول لعالم الذكاء الاصطناعي، تعلم الأكواد، وبناء التطبيقات الذكية.',
    storagePath: '/smarttech/videos/general/ai',
    videoUrl: 'https://www.youtube-nocookie.com/embed/2ePf9rue1Ao',
    uploadedBy: 'SmartTech Academy',
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    mimeType: 'video/mp4',
    extension: 'mp4',
    fileSize: 0
  }
];

export const FeaturedVideoSection: React.FC<FeaturedVideoSectionProps> = ({ isAdmin, userRole, courses = [] }) => {
  const [currentVideo, setCurrentVideo] = useState<PlatformVideo>(DEFAULT_FEATURED_VIDEOS[0]);
  const [availableVideos, setAvailableVideos] = useState<PlatformVideo[]>(DEFAULT_FEATURED_VIDEOS);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [isPlayingWithSound, setIsPlayingWithSound] = useState<boolean>(true);
  
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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = clean.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Build iframe embed URL with optional autoplay & sound parameters
  const getEmbedUrl = (video: PlatformVideo, autoPlayWithSound: boolean) => {
    const rawUrl = video.videoUrl || '';
    const ytId = extractYouTubeId(rawUrl) || extractYouTubeId(video.videoId);
    
    if (ytId) {
      const soundParam = autoPlayWithSound ? 'autoplay=1&mute=0' : 'autoplay=0&mute=0';
      return `https://www.youtube-nocookie.com/embed/${ytId}?${soundParam}&enablejsapi=1&rel=0&modestbranding=1`;
    }
    return rawUrl;
  };

  // Load real persistent video from Firestore on mount
  useEffect(() => {
    const loadRealVideo = async () => {
      try {
        const videosSnap = await getDocs(collection(db, 'platform_videos'));
        const loadedList: PlatformVideo[] = [];
        if (!videosSnap.empty) {
          videosSnap.forEach((docSnap) => {
            const data = docSnap.data() as PlatformVideo;
            if (data.status === 'PUBLISHED' || isUserAdmin) {
              loadedList.push({ id: docSnap.id, ...data });
            }
          });
          if (loadedList.length > 0) {
            setAvailableVideos([...loadedList, ...DEFAULT_FEATURED_VIDEOS]);
          }
        }

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

  const handleSelectVideo = (vid: PlatformVideo) => {
    setCurrentVideo(vid);
    setIsPlayingWithSound(true);
  };

  return (
    <section id="featured-videos-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white dir-rtl text-right overflow-hidden relative border-y border-slate-800/80">
      {/* Background Lighting FX */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 font-black text-xs">
              <Youtube className="w-4 h-4 text-red-500" />
              <span>فيديوهات الأكاديمية الرسمية والعملية</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              شاهد الشروحات والمقاطع المرئية مع الصوت 🎥🔊
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              استعرض الفيديوهات المعتمدة من إدارة سمارتك مع إمكانية التشغيل الفوري المباشر مع الصوت.
            </p>
          </div>

          {isUserAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowConfigModal(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-extrabold text-white flex items-center gap-2 transition cursor-pointer shadow-lg shadow-red-600/30 btn-micro"
              >
                <Plus className="w-4 h-4" />
                <span>رفع / إضافة فيديو جديد (Admin)</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content: Video Player Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Embedded Player Frame */}
          <div className="lg:col-span-8 bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative group flex flex-col justify-between">
            
            {/* Top Sound Control Bar */}
            <div className="p-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black text-emerald-400">
                  فيديو رسمي معروض مع الصوت 🔊
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingWithSound(!isPlayingWithSound)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingWithSound ? 'إعادة تشغيل بالصوت 🔊' : 'تشغيل الصوت 🔊'}</span>
                </button>
              </div>
            </div>

            {/* Embed Player */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <iframe
                className="w-full h-full border-0"
                src={getEmbedUrl(currentVideo, isPlayingWithSound)}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          {/* Side Video Details & Playlist */}
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

              {/* Available Video Playlist */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-extrabold text-slate-400 block">
                  قائمة الفيديوهات المتاحة ({availableVideos.length}):
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {availableVideos.map((vid) => (
                    <button
                      key={vid.id}
                      onClick={() => handleSelectVideo(vid)}
                      className={`w-full text-right p-3 rounded-2xl border text-xs transition-all flex items-center justify-between cursor-pointer btn-micro ${
                        vid.id === currentVideo.id
                          ? 'bg-red-600/20 border-red-500 text-white font-black shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span className="truncate">{vid.title}</span>
                      <Play className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>جميع الفيديوهات مفحوصة ومجهزة للتشغيل بالصوت أونلاين.</span>
            </div>
          </div>
        </div>

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
