import React from 'react';
import { ShoppingBag, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { INITIAL_STORE_ITEMS } from '../data/seedData';

export const StoreSection: React.FC = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 dir-rtl text-right">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-black text-[10px] uppercase tracking-wider">
              SmartTech Hardware Store
            </span>
            <h2 className="text-3xl font-black mt-2">متجر حقائب المكونات وقطع الإلكترونيات</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              جميع القطع والحقائب مستوردة ومفحوصة بنسبة 100% للتطبيق العملي بالمجلس والمختبر.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_STORE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <img
                  src={item.image}
                  alt={item.titleAr || item.nameAr}
                  className="w-full h-40 object-cover rounded-xl bg-slate-900"
                />
                <span className="text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {item.categoryAr || item.category}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {item.titleAr || item.nameAr}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.descriptionAr}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">{item.price} <span className="text-xs text-slate-500">EGP</span></span>
                <button
                  onClick={() => alert(`تمت إضافة ${item.titleAr || item.nameAr} إلى السلة! للتأكيد اتصل بـ 01024434357`)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200 dark:shadow-none transition cursor-pointer"
                >
                  طلب الحقيبة 🛒
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
