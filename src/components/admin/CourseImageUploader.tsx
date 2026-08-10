import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, RefreshCw, AlertCircle, Eye, ShieldCheck } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, db } from '../../firebase/config';
import { CourseImage, User } from '../../types';

interface CourseImageUploaderProps {
  entityId: string; // courseId or pathId
  entityType?: 'COURSE' | 'PATH' | 'CATEGORY' | 'LESSON' | 'PROJECT';
  imageType?: 'cover' | 'thumbnail' | 'banner' | 'icon' | 'general';
  currentImageUrl?: string;
  onImageUploaded: (downloadUrl: string, storagePath: string) => void;
  currentUser?: User | null;
  labelAr?: string;
}

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'];
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif'
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export const CourseImageUploader: React.FC<CourseImageUploaderProps> = ({
  entityId,
  entityType = 'COURSE',
  imageType = 'cover',
  currentImageUrl,
  onImageUploaded,
  currentUser,
  labelAr = 'رفع صورة الكورس من جهازك 📷'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. File extension validation
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(`نوع الملف غير مدعوم (.${ext}). يُرجى رفعه بأساليب: JPG, JPEG, PNG, WEBP, GIF, SVG, AVIF.`);
      return;
    }

    // 2. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      setErrorMessage('الملف المختار ليس صورة صحيحة أو تالف.');
      return;
    }

    // 3. File size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('حجم الصورة كبير جداً (أقصى حد مسموح به هو 10 ميجابايت).');
      return;
    }

    setSelectedFile(file);

    // Generate local preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStartUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('يرجى اختيار صورة أولاً من جهازك.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const imageId = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const storagePath = `smarttech/${entityType.toLowerCase()}s/${entityId || 'general'}/images/${imageType}_${imageId}.${ext}`;
      
      // Upload directly to Firebase Storage
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, selectedFile, {
        contentType: selectedFile.type,
        customMetadata: {
          uploadedBy: currentUser?.id || 'admin',
          entityId,
          entityType
        }
      });

      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Save Image Metadata in Firestore
      const imageMetadata: CourseImage = {
        imageId,
        courseId: entityType === 'COURSE' ? entityId : undefined,
        pathId: entityType === 'PATH' ? entityId : undefined,
        type: imageType as any,
        storagePath,
        downloadUrl,
        mimeType: selectedFile.type,
        extension: ext,
        fileSize: selectedFile.size,
        uploadedBy: currentUser?.id || 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'courseImages', imageId), imageMetadata);

      setSuccessMessage(' تم رفع الصورة بنجاح وتخزينها في Firebase Storage و Firestore!');
      setSelectedFile(null);
      onImageUploaded(downloadUrl, storagePath);
    } catch (err: any) {
      console.error('Error uploading image to Firebase Storage:', err);
      setErrorMessage(`فشل رفع الصورة: ${err.message || 'حدث خطأ في الاتصال بالسيرفر'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageUploaded('', '');
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>{labelAr}</span>
        </label>
        <span className="text-[10px] text-slate-400">
          دعم: JPG, PNG, WEBP, GIF, SVG, AVIF (حتى 10MB)
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Dropzone / Button */}
      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-36 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl bg-slate-950 flex flex-col items-center justify-center p-4 transition group cursor-pointer text-center space-y-2"
        >
          <div className="p-3 rounded-full bg-slate-800 text-amber-400 group-hover:scale-110 transition">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-amber-400 transition">
              انقر لاختيار صورة من الكومبيوتر/الموبايل مباشرة 📁
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              لا داعي للنسخ واللصق - يتم الرفع والتخزين أوتوماتيكياً
            </p>
          </div>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-2xl"
          />
          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition backdrop-blur-sm flex items-center justify-center gap-3 p-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> تغيير الصورة
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> حذف
            </button>
          </div>
        </div>
      )}

      {/* Selected file info & Confirm upload button */}
      {selectedFile && (
        <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="truncate">
            <p className="font-bold text-white truncate">{selectedFile.name}</p>
            <p className="text-[10px] text-slate-400">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>جاري الرفع...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>رفع وتخزين الصورة ⚡</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Feedback */}
      {errorMessage && (
        <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Feedback */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
