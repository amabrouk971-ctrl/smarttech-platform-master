import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Save } from 'lucide-react';
import { Announcement } from '../../types';
import { fetchAnnouncementsFromFirestore, saveAnnouncementToFirestore } from '../../services/firebaseService';

export const AnnouncementCMS: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('IMPORTANT');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const list = await fetchAnnouncementsFromFirestore();
    setAnnouncements(list);
  };

  const handleCreateAnnouncement = async () => {
    if (!title) return;
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      titleAr: title,
      contentAr: content,
      priority,
      target: { type: 'EVERYONE' },
      publishedAt: new Date().toISOString()
    };

    await saveAnnouncementToFirestore(newAnn);
    setTitle('');
    setContent('');
    loadAnnouncements();
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-black">إدارة وتوجيه الإعلانات والأنباء (Announcements CMS)</h2>
        <p className="text-xs text-slate-400 mt-1">بث التحديثات والأخبار الهامة للطلاب وأولياء الأمور مباشرة عبر المنصة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-black text-sm border-b pb-2 text-slate-900 dark:text-white">نشر إعلان جديد</h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">عنوان الإعلان:</label>
            <input
              type="text"
              placeholder="مثال: فتح باب التسجيل بمسابقة الروبوت الإقليمية"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">تفاصيل الإعلان:</label>
            <textarea
              rows={3}
              placeholder="نص الإعلان الذي سيظهر للطلاب بالصفحة الرئيسية..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">درجة الأهمية:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold"
            >
              <option value="NORMAL">عادي (Normal)</option>
              <option value="IMPORTANT">هام (Important)</option>
              <option value="URGENT">عاجل جداً (Urgent)</option>
            </select>
          </div>

          <button
            onClick={handleCreateAnnouncement}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> حفظ ونشر الإعلان
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-black text-sm border-b pb-2 text-slate-900 dark:text-white">الإعلانات المنشورة ({announcements.length})</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>{ann.titleAr}</span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-[10px]">{ann.priority}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">{ann.contentAr}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
