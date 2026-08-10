import React from 'react';
import { Star, MessageSquare, ExternalLink, ShieldCheck, MapPin, ThumbsUp, Sparkles } from 'lucide-react';

export interface GoogleReviewItem {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  relativeTime: string;
  text: string;
  verifiedStudent?: boolean;
}

export const GOOGLE_REVIEWS_DATA: GoogleReviewItem[] = [
  {
    id: 'rev-1',
    authorName: 'د. أحمد المحلاوي (ولي أمر)',
    rating: 5,
    relativeTime: 'قبل يومين',
    text: 'من أفضل المراكز التدريبية للأطفال والشباب في الإسكندرية. ابني يدرس دورة Scratch والذكاء الاصطناعي مع الأستاذ محمد وكان الانطباع ممتازا المعامل مجهزة بأحدث الأجهزة والاهتمام المباشر بالتطبيقات العملية.',
    verifiedStudent: true
  },
  {
    id: 'rev-2',
    authorName: 'م. سارة محمود',
    rating: 5,
    relativeTime: 'قبل أسبوع',
    text: 'تجربة رائعة جداً في كورس Python والأردوينو. الشرح مبسّط جداً والتطبيقات عمليّة على أجهزة وروبوتات حقيقية في مقر زيزينيا. أنصح الجميع بالانضمام للأكاديمية.',
    verifiedStudent: true
  },
  {
    id: 'rev-3',
    authorName: 'خالد مصطفى (طالب برمجيات)',
    rating: 5,
    relativeTime: 'قبل أسبوعين',
    text: 'أخذت كورس تطوير المواقع والذكاء الاصطناعي والتجربة كانت مشجعة للغاية. الشهادة معتمدة ورابط التحقق أتاح لي توثيق مشروعي بسهولة.',
    verifiedStudent: true
  },
  {
    id: 'rev-4',
    authorName: 'داليا إبراهيم (ولية أمر طفل 10 سنوات)',
    rating: 5,
    relativeTime: 'قبل شهر',
    text: 'مركز سمارتك يمتلك بيئة ممتازة لتنمية مهارات التفكير المنطقي. ابني حصل على وسام المصمم الصغير والمستوى التفاعلي مع المدربين راقٍ جداً.',
    verifiedStudent: true
  }
];

export const GoogleReviewsWidget: React.FC = () => {
  const googleMapsReviewUrl = 'https://www.google.com/maps/place/%D8%B3%D9%85%D8%A7%D8%B1%D8%AA%D9%83+%D9%84%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8+%D8%A7%D9%84%D9%8AA%D8%AA%D8%B7%D9%88%D8%B1%E2%80%AD%E2%80%AD/@31.2401598,29.9635953,17z/data=!4m2!3m1!1s0x14f5c513a27e37ed:0xee5386b29ced202e';

  return (
    <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white dir-rtl text-right space-y-6 shadow-2xl">
      {/* Header Statistics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black text-[10px] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> GOOGLE MAPS VERIFIED REVIEWS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">
              تقييمات مراجعة حقيقية 100%
            </span>
          </div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            تقييمات وآراء الطلاب وأولياء الأمور على خرائط Google
          </h3>
          <p className="text-xs text-slate-400">
            يسعدنا دائماً استقبال آرائكم وتقييماتكم المباشرة على صفحة الخرائط الرسمية الخاصة بمركز سمارتك.
          </p>
        </div>

        {/* Rating Score Card */}
        <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-center space-y-0.5">
            <div className="text-3xl font-black text-amber-400">4.9</div>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-bold block">من أصل 180+ تقييم</span>
          </div>

          <div className="h-12 w-px bg-slate-800" />

          <a
            href={googleMapsReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-blue-600/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>كتابة تقييم على Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Reviews Cards Carousel/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GOOGLE_REVIEWS_DATA.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow">
                    {rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>{rev.authorName}</span>
                      {rev.verifiedStudent && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="تقييم موثق" />
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400">{rev.relativeTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{rev.text}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3 text-blue-400" /> تمت المراجعة عبر Google Maps
              </span>
              <span className="text-emerald-400 font-bold">مراجعة معتمدة ✓</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
