import React from 'react';
import { Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

interface CustomerPreviewBarProps {
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
  adminName?: string;
}

export const CustomerPreviewBar: React.FC<CustomerPreviewBarProps> = ({
  isPreviewMode,
  onTogglePreviewMode,
  adminName = 'الإدارة'
}) => {
  if (!isPreviewMode) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-red-600 to-amber-500 text-white py-2.5 px-4 text-xs font-extrabold flex items-center justify-between shadow-lg sticky top-0 z-50 dir-rtl text-right">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
        <Eye className="w-4 h-4" />
        <span>وضع معاينة الزائر / العميل (Customer Preview Mode) — أنت تتصفح المنصة بصفة زائر حقيقي</span>
      </div>

      <button
        onClick={onTogglePreviewMode}
        className="px-4 py-1 bg-slate-950 hover:bg-slate-900 text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow border border-amber-500/40"
      >
        <span>الخروج من العرض والعودة للوحة الإدارة</span>
        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
      </button>
    </div>
  );
};
