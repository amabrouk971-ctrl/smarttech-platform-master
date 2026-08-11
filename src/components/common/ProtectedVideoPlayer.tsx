import React from 'react';
import { Video, Lock, Download, AlertTriangle } from 'lucide-react';
import { CourseMaterial } from '../../types';

interface ProtectedVideoPlayerProps {
  material: CourseMaterial;
  downloadAllowed?: boolean;
  onClose?: () => void;
}

export const ProtectedVideoPlayer: React.FC<ProtectedVideoPlayerProps> = ({
  material,
  downloadAllowed = false,
  onClose
}) => {
  const fileUrl = material.fileUrl || material.url || '';

  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800 text-white overflow-hidden flex flex-col dir-rtl w-full max-w-4xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center font-bold">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{material.titleAr}</h3>
            <p className="text-[10px] text-slate-400">مشغل الفيديو المباشر المحمي</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {downloadAllowed ? (
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> تحميل الفيديو
            </a>
          ) : (
            <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-xl flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> التحميل غير متاح
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
            >
              إغلاق
            </button>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div 
        className="bg-black aspect-video flex items-center justify-center relative select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {fileUrl ? (
          <video
            src={fileUrl}
            controls
            controlsList="nodownload"
            disablePictureInPicture
            className="w-full h-full max-h-[500px]"
          />
        ) : (
          <div className="text-center py-20 text-slate-400 space-y-2">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <p className="text-sm font-bold">رابط الفيديو غير صالح أو غير متاح.</p>
          </div>
        )}
      </div>
    </div>
  );
};
