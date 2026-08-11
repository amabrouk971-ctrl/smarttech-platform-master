import React, { useState, useEffect } from 'react';
import { MediaAsset, Post, FileTypePolicy, Role, User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Plus,
  Trash2,
  Lock,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Megaphone,
  Sparkles,
  Settings,
  Tag,
  Calendar,
  Layers
} from 'lucide-react';
import { collection, getDocs, setDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/config';

import { HeroVideoCMS } from './HeroVideoCMS';

interface ContentStudioCMSProps {
  currentUser?: User;
}

const DEFAULT_POLICY: FileTypePolicy = {
  allowedImageExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  allowedVideoExtensions: ['mp4', 'webm', 'mov'],
  allowedDocumentExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
  maxImageSizeMB: 10,
  maxVideoSizeMB: 100,
  maxDocumentSizeMB: 25
};

export const ContentStudioCMS: React.FC<ContentStudioCMSProps> = ({ currentUser }) => {
  const { isArabic, dir } = useLanguage();
  const isAdmin = currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN;

  const [activeTab, setActiveTab] = useState<'media' | 'posts' | 'announcements' | 'gallery' | 'promotions' | 'advertisements' | 'policy'>('media');
  const [mediaItems, setMediaItems] = useState<MediaAsset[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [policy, setPolicy] = useState<FileTypePolicy>(DEFAULT_POLICY);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Upload State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDesc, setUploadDesc] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('courses');
  const [uploadVisibility, setUploadVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'RESTRICTED'>('PUBLIC');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  // New Post Modal
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [postTitle, setPostTitle] = useState<string>('');
  const [postBody, setPostBody] = useState<string>('');
  const [postCategory, setPostCategory] = useState<string>('news');
  const [postVisibility, setPostVisibility] = useState<'PUBLIC' | 'STUDENTS_ONLY' | 'TEACHERS_ONLY'>('PUBLIC');

  // Load from Firestore
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Media
        const mediaSnap = await getDocs(collection(db, 'media_assets'));
        if (!mediaSnap.empty) {
          const list: MediaAsset[] = [];
          mediaSnap.forEach((d) => list.push({ id: d.id, ...d.data() } as MediaAsset));
          setMediaItems(list);
        }

        // Posts
        const postSnap = await getDocs(collection(db, 'posts'));
        if (!postSnap.empty) {
          const list: Post[] = [];
          postSnap.forEach((d) => list.push({ id: d.id, ...d.data() } as Post));
          setPosts(list);
        }

        // Policy
        const policySnap = await getDocs(collection(db, 'file_type_policy'));
        if (!policySnap.empty) {
          policySnap.forEach((d) => {
            if (d.id === 'main') setPolicy(d.data() as FileTypePolicy);
          });
        }
      } catch (err) {
        console.warn('ContentStudio fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Strict Admin Lockdown Guard
  if (!isAdmin) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 my-8 max-w-2xl mx-auto text-white">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-xl font-black">
          {isArabic ? 'تنبيه الأمان والخصوصية: غير مصرح بالوصول' : 'Security Alert: Access Denied'}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {isArabic
            ? 'إدارة الميديا والمنشورات والملفات المرفوعة مقصورة حصرياً على مدراء النظام (Admin Only). تم فرض صلاحية الأمان على مستوى الواجهة والداتابيز.'
            : 'Content and Media Studio management is strictly restricted to platform Administrators.'}
        </p>
      </div>
    );
  }

  // Validate File MIME & Extension against FileTypePolicy
  const handleFileSelect = (file: File) => {
    setValidationError(null);
    setUploadFile(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const sizeMB = file.size / (1024 * 1024);

    let isImage = file.type.startsWith('image/') || policy.allowedImageExtensions.includes(ext);
    let isVideo = file.type.startsWith('video/') || policy.allowedVideoExtensions.includes(ext);
    let isDoc = file.type.includes('pdf') || file.type.includes('word') || policy.allowedDocumentExtensions.includes(ext);

    if (isImage) {
      if (!policy.allowedImageExtensions.includes(ext)) {
        setValidationError(`امتداد الصورة .${ext} غير مسموح به في سياسة الأمان.`);
        return;
      }
      if (sizeMB > policy.maxImageSizeMB) {
        setValidationError(`حجم الصورة (${sizeMB.toFixed(1)}MB) يتجاوز الحد الأقصى المسموح (${policy.maxImageSizeMB}MB).`);
        return;
      }
    } else if (isVideo) {
      if (!policy.allowedVideoExtensions.includes(ext)) {
        setValidationError(`امتداد الفيديو .${ext} غير مسموح به.`);
        return;
      }
      if (sizeMB > policy.maxVideoSizeMB) {
        setValidationError(`حجم الفيديو يتجاوز الحد الأقصى المسموح (${policy.maxVideoSizeMB}MB).`);
        return;
      }
    } else if (isDoc) {
      if (!policy.allowedDocumentExtensions.includes(ext)) {
        setValidationError(`امتداد المستند .${ext} غير مسموح به.`);
        return;
      }
      if (sizeMB > policy.maxDocumentSizeMB) {
        setValidationError(`حجم المستند يتجاوز الحد الأقصى المسموح (${policy.maxDocumentSizeMB}MB).`);
        return;
      }
    } else {
      setValidationError(`نوع الملف (${file.type || ext}) غير مدعوم في سياسة رفع الميديا.`);
      return;
    }

    setUploadFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Upload Media Asset Process
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) return;

    setIsUploading(true);
    const mediaId = 'media_' + Date.now();
    const ext = uploadFile.name.split('.').pop()?.toLowerCase() || 'file';
    let type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' = 'DOCUMENT';
    if (uploadFile.type.startsWith('image/')) type = 'IMAGE';
    if (uploadFile.type.startsWith('video/')) type = 'VIDEO';

    const storagePath = `media/${mediaId}_${uploadFile.name}`;
    const fileRef = ref(storage, storagePath);

    try {
      await uploadBytesResumable(fileRef, uploadFile);
      const downloadUrl = await getDownloadURL(fileRef);

      const newAsset: MediaAsset = {
        id: mediaId,
        title: uploadTitle.trim(),
        description: uploadDesc.trim(),
        type,
        extension: ext,
        mimeType: uploadFile.type || 'application/octet-stream',
        storagePath: storagePath,
        downloadUrl: downloadUrl,
        fileSize: uploadFile.size,
        uploadedBy: currentUser?.name || 'Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        visibility: uploadVisibility,
        category: uploadCategory,
        isPublished: true
      };

      await setDoc(doc(db, 'media_assets', mediaId), newAsset);
      if (type === 'VIDEO') {
        const videoDoc = {
          id: mediaId,
          videoId: mediaId,
          title: newAsset.title,
          description: newAsset.description || '',
          storagePath: storagePath,
          videoUrl: downloadUrl,
          uploadedBy: currentUser?.id || 'admin',
          uploaderName: currentUser?.name || 'Admin',
          uploadedAt: newAsset.createdAt,
          updatedAt: newAsset.updatedAt,
          status: 'PUBLISHED',
          visibility: uploadVisibility,
          mimeType: uploadFile.type || 'video/mp4',
          extension: ext,
          fileSize: uploadFile.size
        };
        await setDoc(doc(db, 'platform_videos', mediaId), videoDoc);
      }
      
      setMediaItems((prev) => [newAsset, ...prev]);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadDesc('');
      }, 1200);
    } catch (e) {
      console.warn('Firestore set media note:', e);
      setValidationError('حدث خطأ أثناء الرفع، الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  // Save Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    const postId = 'post_' + Date.now();
    const newPost: Post = {
      id: postId,
      title: postTitle.trim(),
      body: postBody.trim(),
      authorId: currentUser?.id || 'admin',
      authorName: currentUser?.name || 'SmartTech Admin',
      category: postCategory,
      status: 'PUBLISHED',
      visibility: postVisibility,
      audience: 'ALL',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPosts((prev) => [newPost, ...prev]);
    try {
      await setDoc(doc(db, 'posts', postId), newPost);
    } catch (e) {
      console.warn('Firestore set post note:', e);
    }

    setShowPostModal(false);
    setPostTitle('');
    setPostBody('');
  };

  // Delete Media
  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الملف نهائياً؟' : 'Are you sure you want to delete this media?')) return;
    
    const asset = mediaItems.find(m => m.id === id);
    if (!asset) return;

    try {
      // 1. Delete from Storage
      if (asset.storagePath && !asset.storagePath.startsWith('marketing_media')) {
        const fileRef = ref(storage, asset.storagePath);
        await deleteObject(fileRef).catch(e => console.warn('Storage delete error:', e));
      }
      // 2. Delete from platform_videos if video
      if (asset.type === 'VIDEO') {
        await deleteDoc(doc(db, 'platform_videos', id));
      }
      // 3. Delete from media_assets
      await deleteDoc(doc(db, 'media_assets', id));
      
      setMediaItems((prev) => prev.filter((m) => m.id !== id));
      alert(isArabic ? 'تم حذف الملف بنجاح.' : 'Media deleted successfully.');
    } catch (e) {
      console.warn('Delete media error:', e);
      alert(isArabic ? 'حدث خطأ أثناء الحذف.' : 'Error deleting media.');
    }
  };

  // Save Policy
  const handleSavePolicy = async () => {
    try {
      await setDoc(doc(db, 'file_type_policy', 'main'), policy);
      alert(isArabic ? 'تم حفظ سياسة رفع الملفات وتراخيص الامتدادات بنجاح! 🛡️' : 'File policy updated successfully!');
    } catch (e) {
      console.warn('Save policy error:', e);
    }
  };

  return (
    <div dir={dir} className={`space-y-6 ${isArabic ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-extrabold text-xs">
            <Folder className="w-3.5 h-3.5" />
            <span>{isArabic ? 'استوديوهات المحتوى والإعلام المركزية (Central Content Studio)' : 'Central Content Studio'}</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {isArabic ? 'لوحة الميديا، المنشورات والسياسات الأمنية 🎬' : 'Media Studio, Posts & Policy Control 🎬'}
          </h2>
          <p className="text-xs text-slate-400">
            {isArabic
              ? 'إدارة كافة الصور، الفيديوهات، المستندات، المنشورات وسياسات رفع الملفات من مكان موحد مع أمان حصري للمدراء.'
              : 'Manage images, videos, documents, posts, and file policies from one central location.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isArabic ? 'رفع ميديا جديدة' : 'Upload Media'}</span>
          </button>

          <button
            onClick={() => setShowPostModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{isArabic ? 'كتابة منشور جديد' : 'New Post'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'media', label: isArabic ? 'مكتبة الميديا (Media Assets)' : 'Media Assets', icon: Folder },
          { id: 'posts', label: isArabic ? 'المنشورات والأخبار (Posts)' : 'Posts & News', icon: FileText },
          { id: 'announcements', label: isArabic ? 'الإعلانات الهامة' : 'Announcements', icon: Megaphone },
          { id: 'gallery', label: isArabic ? 'معرض الصور' : 'Photo Gallery', icon: ImageIcon },
          { id: 'promotions', label: isArabic ? 'العروض الترويجية' : 'Promotions', icon: Sparkles },
          { id: 'advertisements', label: isArabic ? 'إعلانات الفيديو (Hero Video)' : 'Hero Video Ads', icon: Video },
          { id: 'policy', label: isArabic ? 'سياسة امتدادات وأحجام الملفات 🛡️' : 'File Policy & Security', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: MEDIA ASSETS */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder={isArabic ? 'بحث في ملفات الميديا...' : 'Search media...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-extrabold">
              {isArabic ? `إجمالي الملفات: ${mediaItems.length}` : `Total files: ${mediaItems.length}`}
            </span>
          </div>

          {mediaItems.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
              <Folder className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {isArabic ? 'لا توجد ملفات ميديا مضافة حتى الآن. انقر على رفع ميديا جديدة.' : 'No media assets found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mediaItems
                .filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((asset) => (
                  <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 relative group hover:border-indigo-500/50 transition">
                    <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center relative">
                      {asset.type === 'IMAGE' ? (
                        <img src={asset.downloadUrl} alt={asset.title} className="w-full h-full object-cover" />
                      ) : asset.type === 'VIDEO' ? (
                        <Video className="w-8 h-8 text-indigo-400" />
                      ) : (
                        <File className="w-8 h-8 text-amber-400" />
                      )}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-white">
                        .{asset.extension.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs text-white truncate">{asset.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {(asset.fileSize / (1024 * 1024)).toFixed(2)} MB • {asset.category}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                      <span>{new Date(asset.createdAt).toLocaleDateString('ar-EG')}</span>
                      <button
                        onClick={() => handleDeleteMedia(asset.id)}
                        className="p-1 rounded bg-red-950 text-red-400 hover:bg-red-900 transition"
                        title="حذف الملف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: POSTS */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {isArabic ? 'لا توجد منشورات حتى الآن. انقر على كتابة منشور جديد.' : 'No posts published yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-right">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 font-bold text-[10px]">
                      {post.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleString('ar-EG')}</span>
                  </div>
                  <h3 className="font-black text-sm text-white">{post.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{post.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ADVERTISEMENTS (Hero Video) */}
      {activeTab === 'advertisements' && (
        <HeroVideoCMS />
      )}

      {/* TAB: FILE POLICY CONFIG */}
      {activeTab === 'policy' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 text-right">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              <span>إعدادات سياسة الامتدادات والأحجام المسموح بها (File Type Policy)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              تحديد الامتدادات المعتمدة للصور والفيديوهات والمستندات لحماية المنصة من الملفات الضارة وتحديد السعة القصوى.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Images */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
                <ImageIcon className="w-4 h-4" />
                <span>سياسة الصور (Images)</span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الامتدادات المسموحة (تفصل بفاصلة):</label>
                <input
                  type="text"
                  value={policy.allowedImageExtensions.join(', ')}
                  onChange={(e) =>
                    setPolicy({ ...policy, allowedImageExtensions: e.target.value.split(',').map((s) => s.trim().toLowerCase()) })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الحد الأقصى لحجم الصورة (ميجابايت MB):</label>
                <input
                  type="number"
                  value={policy.maxImageSizeMB}
                  onChange={(e) => setPolicy({ ...policy, maxImageSizeMB: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Videos */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
                <Video className="w-4 h-4" />
                <span>سياسة الفيديوهات (Videos)</span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الامتدادات المسموحة:</label>
                <input
                  type="text"
                  value={policy.allowedVideoExtensions.join(', ')}
                  onChange={(e) =>
                    setPolicy({ ...policy, allowedVideoExtensions: e.target.value.split(',').map((s) => s.trim().toLowerCase()) })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الحد الأقصى لحجم الفيديو (MB):</label>
                <input
                  type="number"
                  value={policy.maxVideoSizeMB}
                  onChange={(e) => setPolicy({ ...policy, maxVideoSizeMB: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Documents */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
                <File className="w-4 h-4" />
                <span>سياسة المستندات (Docs & PDFs)</span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الامتدادات المسموحة:</label>
                <input
                  type="text"
                  value={policy.allowedDocumentExtensions.join(', ')}
                  onChange={(e) =>
                    setPolicy({ ...policy, allowedDocumentExtensions: e.target.value.split(',').map((s) => s.trim().toLowerCase()) })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الحد الأقصى لحجم المستند (MB):</label>
                <input
                  type="number"
                  value={policy.maxDocumentSizeMB}
                  onChange={(e) => setPolicy({ ...policy, maxDocumentSizeMB: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={handleSavePolicy}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30"
            >
              حفظ وتطبيق سياسة الأمان 🛡️
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl text-right"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  <span>رفع ملف ميديا جديد</span>
                </h3>
                <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* File Dropzone */}
                <div className="p-6 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950 text-center space-y-2">
                  <input
                    type="file"
                    id="media-file-input"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                  <label htmlFor="media-file-input" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-bold">
                      {uploadFile ? uploadFile.name : 'اختر ملف الميديا من جهازك'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      يتم التحقق تلقائياً من نوع الملف والامتدادات المسموحة وMIME type.
                    </p>
                  </label>
                </div>

                {validationError && (
                  <div className="p-3 bg-red-950/80 border border-red-800 text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الملف: *</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الوصف:</label>
                  <textarea
                    rows={2}
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                {uploadSuccess && (
                  <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم رفع وتحفظ ملف الميديا بنجاح!</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadFile || isUploading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30"
                  >
                    {isUploading ? 'جاري الرفع...' : 'رفع الملف الآن 🚀'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl text-right"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>كتابة منشور أو خبر جديد</span>
                </h3>
                <button onClick={() => setShowPostModal(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المنشور: *</label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">محتوى المنشور: *</label>
                  <textarea
                    rows={4}
                    required
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg shadow-amber-600/30"
                  >
                    نشر الخبر 🚀
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
