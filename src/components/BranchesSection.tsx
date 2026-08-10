import React from 'react';
import { MapPin, Phone, Clock, Navigation, CheckCircle2, Building2 } from 'lucide-react';
import { INITIAL_BRANCHES } from '../data/seedData';
import { GoogleMap3DView } from './GoogleMap3DView';
import { GoogleReviewsWidget } from './GoogleReviewsWidget';

export const BranchesSection: React.FC = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white dir-rtl text-right border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-black text-[10px] uppercase tracking-widest">
            PHYSICAL TRAINING CENTERS & 3D MAP
          </span>
          <h2 className="text-3xl font-black text-white">فروع ومقرات مركز SmartTech التدريبي</h2>
          <p className="text-xs text-slate-400">
            تفضل بزيارتنا في مقراتنا المجهزة بأحدث معامل الكمبيوتر، كيتات الروبوتات والذكاء الاصطناعي مع إمكانية استكشافها بالخريطة ثلاثية الأبعاد 3D.
          </p>
        </div>

        {/* Google Map 3D View Component */}
        <GoogleMap3DView />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_BRANCHES.map((b) => (
            <div
              key={b.id}
              className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> المقر المعتمد
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold text-[10px] rounded-full border border-emerald-500/30">
                    مفتوح للزيارة والتسجيل
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white leading-snug">{b.nameAr}</h3>

                <p className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{b.addressAr}</span>
                </p>

                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>هاتف / واتساب: {b.phone}</span>
                </p>

                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{b.workingHoursAr}</span>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={b.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 transition w-full justify-center"
                >
                  <Navigation className="w-4 h-4" /> فتح الخريطة على Google Maps
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Google Reviews Widget */}
        <GoogleReviewsWidget />
      </div>
    </section>
  );
};
