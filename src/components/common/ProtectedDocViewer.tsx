import React, { useState } from 'react';
import { 
  FileText, Lock, Download, Maximize2, Minimize2, ZoomIn, ZoomOut, AlertTriangle, Eye 
} from 'lucide-react';
import { CourseMaterial } from '../../types';

interface ProtectedDocViewerProps {
  material: CourseMaterial;
  downloadAllowed?: boolean;
  onClose?: () => void;
}

export const ProtectedDocViewer: React.FC<ProtectedDocViewerProps> = ({
  material,
  downloadAllowed = false,
  onClose
}) => {
  const [zoom, setZoom] = useState(100);
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
      {/* Viewer Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{material.titleAr}</h3>
            <p className="text-[10px] text-slate-400">
              {material.fileType || 'PDF'} • قارئ المستندات المحمي
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download Button (Only if allowed!) */}
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

      {/* Viewer Body */}
      <div 
        className="flex-1 bg-slate-900 overflow-auto p-4 flex justify-center items-start select-none"
        onContextMenu={(e) => e.preventDefault()} // Disable right-click for protected content
      >
        {fileUrl ? (
          <div 
            className="transition-all duration-200 w-full max-w-4xl h-full shadow-2xl rounded-xl overflow-hidden bg-white"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* Embed PDF using Google Docs Viewer or Native object iframe with toolbar disabled */}
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true#toolbar=0&navpanes=0`}
              title={material.titleAr}
              className="w-full h-full border-none"
            />
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 space-y-2">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <p className="text-sm font-bold">لا يوجد رابط مستند متاح للعرض.</p>
          </div>
        )}
      </div>
    </div>
  );
};
