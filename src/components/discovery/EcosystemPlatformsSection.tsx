import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Layers, Building2, CheckCircle2, Headphones, Globe, Calculator } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { EcosystemPlatform } from '../../services/homepageCMS';

interface EcosystemPlatformsSectionProps {
  platforms: EcosystemPlatform[];
}

export const EcosystemPlatformsSection: React.FC<EcosystemPlatformsSectionProps> = ({ platforms }) => {
  const { isArabic } = useLanguage();

  const activePlatforms = platforms.filter(p => p.status === 'ACTIVE');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative bg-slate-900 text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-red-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>{isArabic ? 'منظومة منصات سمارتك' : 'SmartTech Platform Ecosystem'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {isArabic ? 'منصة تعليمية رسمية... ومنصة محاسبية مالية متخصصة' : 'Official Online Platform & Financial Accounting System'}
          </h2>

          <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
            {isArabic 
              ? 'المنصة الرسمية المعتمدة للتعلم الأونلاين عبر smart-courses.org، إلى جانب النظام المالي والمحاسبي المخصص للأكاديميات والمؤسسات.' 
              : 'Our official learning platform on smart-courses.org alongside our dedicated financial accounting system for academies and institutions.'}
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {activePlatforms.map((platform) => {
            const isAccounting = platform.id.includes('accounting') || platform.nameEn.toLowerCase().includes('accounting');

            return (
              <motion.div
                key={platform.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className={`
                  relative rounded-3xl p-8 border backdrop-blur-xl flex flex-col justify-between transition-all shadow-2xl overflow-hidden
                  ${isAccounting 
                    ? 'bg-gradient-to-br from-slate-900/90 via-slate-950 to-amber-950/40 border-amber-500/40 shadow-amber-950/30' 
                    : 'bg-gradient-to-br from-slate-900/90 via-slate-950 to-red-950/50 border-red-500/40 shadow-red-950/30'
                  }
                `}
              >
                {/* Card Background Image Overlay */}
                {platform.imageUrl && (
                  <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                    <img 
                      src={platform.imageUrl} 
                      alt={platform.nameEn} 
                      className="w-full h-full object-cover" 
                      loading="lazy" 
                    />
                  </div>
                )}

                <div className="relative z-10 space-y-6">
                  {/* Badge & Logo */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg ${isAccounting ? 'bg-gradient-to-br from-amber-600 to-emerald-600' : 'bg-gradient-to-br from-red-600 to-amber-600'}`}>
                        {isAccounting ? <Calculator className="w-6 h-6 text-amber-100" /> : <Headphones className="w-6 h-6 animate-pulse" />}
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                          {isAccounting ? (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isArabic ? 'منصة المحاسبة والمالية' : 'Financial Accounting Platform'}</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3.5 h-3.5 text-red-400" />
                              <span>{isArabic ? 'المنصة الرسمية أونلاين' : 'Official Online Platform'}</span>
                            </>
                          )}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                          {isArabic ? platform.nameAr : platform.nameEn}
                        </h3>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${isAccounting ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {isAccounting ? 'Accounting' : 'smart-courses.org'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 font-medium leading-relaxed text-sm sm:text-base">
                    {isArabic ? platform.descriptionAr : platform.descriptionEn}
                  </p>

                  {/* Key Features Bullet List */}
                  <div className="space-y-2 pt-2">
                    {(isArabic ? platform.featuresAr : platform.featuresEn).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 font-semibold">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${isAccounting ? 'text-amber-400' : 'text-red-400'}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Link Button */}
                <div className="relative z-10 pt-8 mt-auto">
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      w-full py-4 px-6 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer btn-micro
                      ${isAccounting 
                        ? 'bg-gradient-to-r from-amber-600 via-emerald-600 to-amber-600 hover:from-amber-500 hover:to-emerald-500 shadow-amber-600/30 ring-1 ring-amber-400/30' 
                        : 'bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 shadow-red-600/40 ring-1 ring-red-400/30'
                      }
                    `}
                  >
                    <span>{isArabic ? platform.ctaTextAr : platform.ctaTextEn}</span>
                    <ExternalLink className="w-5 h-5 shrink-0" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
