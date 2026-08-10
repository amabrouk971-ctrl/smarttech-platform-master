import React, { useState, useEffect } from 'react';
import { MarketingMediaItem, Course, Role } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { parseMediaUrl } from '../utils/mediaUrlParser';
import { motion, AnimatePresence } from 'motion/react';
import {
  Youtube,
  Share2,
  Plus,
  Play,
  ExternalLink,
  Trash2,
  Sparkles,
  Video,
  FileText,
  Filter,
  CheckCircle2,
  X,
  Globe,
  Layers,
  Facebook,
  Instagram,
  Tv
} from 'lucide-react';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface MarketingMediaGalleryProps {
  userRole?: Role;
  courses?: Course[];
  filterCourseId?: string;
  compactView?: boolean;
}

export const MarketingMediaGallery: React.FC<MarketingMediaGalleryProps> = ({
  userRole,
  courses = [],
  filterCourseId,
  compactView = false
}) => {
  const { isArabic, dir, t } = useLanguage();
  const isAdmin = userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN || userRole === Role.TEACHER;

  const [items, setItems] = useState<MarketingMediaItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<MarketingMediaItem | null>(null);
  
  // Add Link Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [inputTitleAr, setInputTitleAr] = useState<string>('');
  const [inputTitleEn, setInputTitleEn] = useState<string>('');
  const [inputDescAr, setInputDescAr] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(filterCourseId || '');
  const [inputCategory, setInputCategory] = useState<'course_promo' | 'student_project' | 'center_news' | 'event' | 'testimonial'>('course_promo');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load items from Firestore
  useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        const fetchPromise = getDocs(collection(db, 'marketing_media'));
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 3500)
        );
        const querySnap = await Promise.race([fetchPromise, timeoutPromise]) as any;
        if (querySnap && !querySnap.empty) {
          const loaded: MarketingMediaItem[] = [];
          querySnap.forEach((doc: any) => {
            loaded.push({ id: doc.id, ...doc.data() } as MarketingMediaItem);
          });
          setItems(loaded);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.warn('Using local marketing media state:', err);
        setItems([]);
      }
    };

    fetchMediaItems();
  }, []);

  // Save new media link
  const handleAddMediaLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputTitleAr.trim()) return;

    setIsSaving(true);
    const parsed = parseMediaUrl(inputUrl);
    const newId = 'media_' + Date.now();
    const linkedCourse = courses.find((c) => c.id === selectedCourseId);

    const newItem: MarketingMediaItem = {
      id: newId,
      titleAr: inputTitleAr.trim(),
      titleEn: inputTitleEn.trim() || inputTitleAr.trim(),
      descriptionAr: inputDescAr.trim(),
      type: parsed.type,
      url: inputUrl.trim(),
      embedUrl: parsed.embedUrl || inputUrl.trim(),
      thumbnailUrl: parsed.thumbnailUrl || 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80',
      platformName: parsed.platformName,
      courseId: selectedCourseId || undefined,
      courseCode: linkedCourse?.code,
      courseTitleAr: linkedCourse?.titleAr,
      courseTitleEn: linkedCourse?.titleEn,
      category: inputCategory,
      createdAt: new Date().toISOString()
    };

    // Update state immediately
    setItems((prev) => [newItem, ...prev]);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'marketing_media', newId), newItem);
    } catch (err) {
      console.warn('Failed to save media link to Firestore:', err);
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowAddModal(false);
      setInputUrl('');
      setInputTitleAr('');
      setInputTitleEn('');
      setInputDescAr('');
    }, 1200);
  };

  // Delete media link
  const handleDeleteItem = async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      await deleteDoc(doc(db, 'marketing_media', id));
    } catch (e) {
      console.warn('Firestore delete note:', e);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filterCourseId && item.courseId !== filterCourseId) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'youtube') return item.type === 'YOUTUBE_VIDEO';
    if (activeCategory === 'social') return item.type === 'FACEBOOK_POST' || item.type === 'INSTAGRAM_POST' || item.type === 'TIKTOK_VIDEO';
    if (activeCategory === 'promo') return item.category === 'course_promo';
    return true;
  });

  return (
    <div dir={dir} className={`space-y-6 ${isArabic ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 font-extrabold text-xs">
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>{isArabic ? 'مركز الفيديوهات والروابط التسويقية (Media & Posts)' : 'Media & Social Posts Feed'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isArabic ? 'معرض الميديا، المنشورات وفيديوهات YouTube 🎬' : 'Media Gallery, Posts & YouTube Videos 🎬'}
          </h2>
          <p className="text-xs text-slate-400">
            {isArabic
              ? 'متابعة الفيديوهات التعريفية، المنشورات الرسمية لصفحة الأكاديمية، وعروض المساقات.'
              : 'Explore promo videos, official page posts, and course trailers.'}
          </p>
        </div>

        {/* Action Button for Admin/Staff */}
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 flex items-center gap-2.5 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'إضافة رابط فيديو / منشور جديد' : 'Add Video / Post Link'}</span>
          </button>
        )}
      </div>

      {/* Category Filter Tabs */}
      {!compactView && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {[
            { id: 'all', label: isArabic ? 'جميع الوسائط (الكل)' : 'All Media', icon: Layers },
            { id: 'youtube', label: isArabic ? 'فيديوهات YouTube 🎥' : 'YouTube Videos', icon: Youtube },
            { id: 'social', label: isArabic ? 'منشورات الصفحة (Facebook / Insta)' : 'Social Posts', icon: Share2 },
            { id: 'promo', label: isArabic ? 'عروض المساقات (Course Promos)' : 'Course Promos', icon: Sparkles }
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md font-extrabold'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Media Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <Video className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">
            {isArabic ? 'لا توجد وسائط مضافة حالياً في هذه الفئة.' : 'No media links added yet in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isYt = item.type === 'YOUTUBE_VIDEO';
            const isFb = item.type === 'FACEBOOK_POST';
            const isIg = item.type === 'INSTAGRAM_POST';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition shadow-lg group flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail & Platform Badge */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setActiveModalItem(item)}>
                    <img
                      src={item.thumbnailUrl}
                      alt={item.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Platform Tag */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-white font-extrabold text-[10px] flex items-center gap-1.5 shadow-md">
                      {isYt && <Youtube className="w-3.5 h-3.5 text-red-500" />}
                      {isFb && <Facebook className="w-3.5 h-3.5 text-blue-500" />}
                      {isIg && <Instagram className="w-3.5 h-3.5 text-pink-500" />}
                      {!isYt && !isFb && !isIg && <Globe className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{item.platformName || 'Media'}</span>
                    </div>

                    {/* Course tag if linked */}
                    {item.courseTitleAr && (
                      <div className="absolute bottom-3 left-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-amber-500/30 text-amber-300 font-bold text-[10px] truncate">
                        🏷️ {item.courseTitleAr}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-sm text-white line-clamp-2 leading-snug hover:text-red-400 transition cursor-pointer" onClick={() => setActiveModalItem(item)}>
                      {isArabic ? item.titleAr : item.titleEn || item.titleAr}
                    </h3>
                    {item.descriptionAr && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.descriptionAr}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between">
                  <button
                    onClick={() => setActiveModalItem(item)}
                    className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isArabic ? 'تشغيل / عرض' : 'Watch / Preview'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                      title="فتح الرابط الأصلي"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900 transition cursor-pointer"
                        title="حذف الرابط"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Media Link Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl text-right dir-rtl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-white font-black text-lg">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <span>إضافة رابط فيديو أو منشور جديد</span>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddMediaLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    رابط الفيديو أو المنشور (YouTube / Facebook / Instagram / TikTok): *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=... أو رابط فيسبوك"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    يدعم روابط YouTube الفردية، Shorts، منشورات فيسبوك وإنستجرام وتيك توك.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      عنوان الميديا (بالعربية): *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: فيديو تعريف كورس الروبوتات"
                      value={inputTitleAr}
                      onChange={(e) => setInputTitleAr(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Title (English):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Robotics Course Intro Video"
                      value={inputTitleEn}
                      onChange={(e) => setInputTitleEn(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    وصف أو نبذة عن المنشور:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="تفاصيل مختصرة تظهر أسفل الفيديو..."
                    value={inputDescAr}
                    onChange={(e) => setInputDescAr(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      ربط بكورس محدد (اختياري التسويق لكورس):
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 outline-none"
                    >
                      <option value="">-- عام (لجميع الزوار) --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} • {c.titleAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      تصنيف الميديا:
                    </label>
                    <select
                      value={inputCategory}
                      onChange={(e) => setInputCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 outline-none"
                    >
                      <option value="course_promo">برومو وتدريب الكورسات</option>
                      <option value="student_project">مشاريع وإنجازات الطلاب</option>
                      <option value="center_news">أخبار وفعاليات المركز</option>
                      <option value="testimonial">آراء وأصداء أولياء الأمور</option>
                    </select>
                  </div>
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم حفظ ونشر رابط الميديا بنجاح!</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center gap-2"
                  >
                    {isSaving ? 'جاري الحفظ...' : 'حفظ ونشر الرابط 🚀'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded Player / View Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-slate-950/80 border border-slate-700 text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-video bg-black">
                {activeModalItem.type === 'YOUTUBE_VIDEO' && activeModalItem.embedUrl ? (
                  <iframe
                    className="w-full h-full border-0"
                    src={activeModalItem.embedUrl}
                    title={activeModalItem.titleAr}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950 space-y-4">
                    <Share2 className="w-12 h-12 text-red-500" />
                    <h4 className="text-lg font-black text-white">{activeModalItem.titleAr}</h4>
                    <p className="text-xs text-slate-400 max-w-md">{activeModalItem.descriptionAr}</p>
                    <a
                      href={activeModalItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>فتح المنشور الأصلي في {activeModalItem.platformName}</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-3 dir-rtl text-right">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 font-extrabold text-xs">
                    {activeModalItem.platformName}
                  </span>
                  {activeModalItem.courseTitleAr && (
                    <span className="text-xs font-bold text-amber-400">
                      الكورس: {activeModalItem.courseTitleAr}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-white">{isArabic ? activeModalItem.titleAr : activeModalItem.titleEn}</h3>
                {activeModalItem.descriptionAr && (
                  <p className="text-xs text-slate-300 leading-relaxed">{activeModalItem.descriptionAr}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
