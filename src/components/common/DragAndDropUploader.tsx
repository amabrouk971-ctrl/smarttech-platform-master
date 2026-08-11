import React, { useState, useRef } from 'react';
import { 
  UploadCloud, File, FileText, Image as ImageIcon, Video, CheckCircle, AlertTriangle, X, RefreshCw 
} from 'lucide-react';
import { 
  uploadContentFileToStorage, UploadProgressCallback 
} from '../../services/contentDeliveryService';

export interface UploadResult {
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  fileUrl: string;
}

interface DragAndDropUploaderProps {
  folderPath?: string;
  allowedTypesLabel?: string;
  maxSizeMB?: number;
  onUploadSuccess: (result: UploadResult) => void;
  onUploadError?: (errorMsg: string) => void;
}

export const DragAndDropUploader: React.FC<DragAndDropUploaderProps> = ({
  folderPath = 'materials',
  allowedTypesLabel = 'PDF, PPT, PPTX, DOC, DOCX, XLS, PNG, JPG, MP4, WEBM',
  maxSizeMB = 100,
  onUploadSuccess,
  onUploadError
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMsg('');
    setUploadSuccess(null);
    setCurrentFile(file);

    // Extension check
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    // Size check
    if (file.size > maxSizeMB * 1024 * 1024) {
      const err = `حجم الملف (${(file.size / (1024 * 1024)).toFixed(1)}MB) يتجاوز الحد المسموح (${maxSizeMB}MB).`;
      setErrorMsg(err);
      if (onUploadError) onUploadError(err);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const onProgress: UploadProgressCallback = (p) => {
      setProgress(Math.round(p));
    };

    try {
      const result = await uploadContentFileToStorage(file, folderPath, onProgress);
      const res: UploadResult = {
        fileName: file.name,
        fileType: ext,
        mimeType: result.mimeType,
        fileSize: result.fileSize,
        storagePath: result.storagePath,
        fileUrl: result.downloadUrl
      };
      setUploadSuccess(res);
      onUploadSuccess(res);
    } catch (err: any) {
      const msg = err.message || 'فشل رفع الملف لـ Firebase Storage.';
      setErrorMsg(msg);
      if (onUploadError) onUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileIcon = (ext: string) => {
    if (['MP4', 'WEBM', 'MOV'].includes(ext)) return <Video className="w-8 h-8 text-blue-500" />;
    if (['JPG', 'JPEG', 'PNG', 'WEBP', 'SVG'].includes(ext)) return <ImageIcon className="w-8 h-8 text-emerald-500" />;
    return <FileText className="w-8 h-8 text-red-500" />;
  };

  return (
    <div className="space-y-3 dir-rtl text-right">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200
          flex flex-col items-center justify-center gap-3
          ${isDragging 
            ? 'border-red-500 bg-red-500/10 scale-[1.01]' 
            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
          }
        `}
      >
        <div className="w-14 h-14 bg-red-100 dark:bg-red-950/60 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div>
          <p className="text-xs font-black text-slate-800 dark:text-white">
            اسحب الملفات وأسقطها هنا مباشرةً أو <span className="text-red-500 underline">اختر ملفاً من جهازك</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            الامتدادات المدعومة: {allowedTypesLabel} (حتى {maxSizeMB}MB)
          </p>
        </div>
      </div>

      {/* Uploading Status & Progress Bar */}
      {isUploading && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-white">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="truncate max-w-[200px]">{currentFile?.name}</span>
            <span className="text-red-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-red-600 h-full transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-left">
            جاري الرفع لـ Firebase Storage والمزامنة...
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => currentFile && processFile(currentFile)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Success Banner */}
      {uploadSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {renderFileIcon(uploadSuccess.fileType)}
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{uploadSuccess.fileName}</div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {uploadSuccess.fileType} • {formatBytes(uploadSuccess.fileSize)} • رفع بنجاح
              </div>
            </div>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </div>
      )}
    </div>
  );
};
