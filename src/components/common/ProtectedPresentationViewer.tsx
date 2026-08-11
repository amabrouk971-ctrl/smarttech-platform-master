import React, { useState } from 'react';
import { 
  Presentation, ChevronRight, ChevronLeft, Maximize2, Minimize2, Lock, Download, AlertTriangle 
} from 'lucide-react';
import { CourseMaterial } from '../../types';

interface ProtectedPresentationViewerProps {
  material: CourseMaterial;
  downloadAllowed?: boolean;
  onClose?: () => void;
}

export const ProtectedPresentationViewer: React.FC<ProtectedPresentationViewerProps> = ({
  material,
  downloadAllowed = false,
  onClose
}) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileUrl = material.fileUrl || material.url || '';

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`
      bg-slate-950 rounded-3xl border border-slate-800 text-white overflow-hidden flex flex-col dir-rtl
      ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'w-full h-[650px] shadow-2xl'}
    `}>
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center font-bold">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{material.titleAr}</h3>
            <p className="text-[10px] text-slate-400">
              {material.fileType || 'PPTX'} • العرض التقديمي المحمي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Slide Navigation Controls */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 text-xs font-bold gap-2">
            <button
              onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
              disabled={currentSlide <= 1}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-30"
              title="الشريحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-amber-400">
              الشريحة {currentSlide} من {totalSlides}
            </span>
            <button
              onClick={() => setCurrentSlide(Math.min(totalSlides, currentSlide + 1))}
              disabled={currentSlide >= totalSlides}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-30"
              title="الشريحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {downloadAllowed ? (
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> تحميل
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

      {/* Presentation Stage */}
      <div 
        className="flex-1 bg-slate-900 p-4 flex justify-center items-center select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {fileUrl ? (
          <div className="w-full max-w-5xl h-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative flex items-center justify-center">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
              title={material.titleAr}
              className="w-full h-full border-none"
            />
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 space-y-2">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <p className="text-sm font-bold">لا يوجد ملف عرض أوفيس متاح.</p>
          </div>
        )}
      </div>
    </div>
  );
};
