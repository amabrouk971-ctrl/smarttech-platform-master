import React, { useState, useEffect } from 'react';
import { Offer, Course, OfferDiscountType, OfferTargetType, OfferStatus } from '../../types';
import { fetchOffers, saveOffer, deleteOffer } from '../../services/offerService';
import { Tag, Plus, Edit2, Trash2, Calendar, Clock, DollarSign, Percent, Zap, Award, Layers, AlertTriangle, CheckCircle, Eye, RefreshCw, Layers3 } from 'lucide-react';
import { OfferCountdownTimer } from '../OfferCountdownTimer';

interface OffersCMSProps {
  courses: Course[];
}

export const OffersCMS: React.FC<OffersCMSProps> = ({ courses }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [formData, setFormData] = useState<Partial<Offer>>({
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    duration: 'ONE_WEEK',
    startAt: new Date().toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    status: 'ACTIVE',
    targetType: 'ALL',
    targetIds: [],
    maxUses: 100,
    maxUsesPerCustomer: 1,
    priority: 1,
    allowStacking: false,
    promoCode: '',
    bannerUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    terms: 'يسري العرض حتى انتهاء المدة المحددة ولا يدمج مع العروض الأخرى إلا في حال تفعيل الجمع.'
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    const data = await fetchOffers();
    setOffers(data);
    setLoading(false);
  };

  const handleDurationPreset = (preset: 'ONE_DAY' | 'ONE_WEEK' | 'ONE_MONTH') => {
    const start = new Date();
    let end = new Date();

    if (preset === 'ONE_DAY') {
      end = new Date(start.getTime() + 86400000);
    } else if (preset === 'ONE_WEEK') {
      end = new Date(start.getTime() + 7 * 86400000);
    } else if (preset === 'ONE_MONTH') {
      end = new Date(start.getTime() + 30 * 86400000);
    }

    setFormData(prev => ({
      ...prev,
      duration: preset,
      startAt: start.toISOString().slice(0, 16),
      endAt: end.toISOString().slice(0, 16)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('يرجى كتابة اسم العرض');
      return;
    }

    await saveOffer({
      ...formData,
      id: editingOffer?.id,
      name: formData.name!
    });

    setShowModal(false);
    setEditingOffer(null);
    loadOffers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت تأكد من حذف هذا العرض؟')) {
      await deleteOffer(id);
      loadOffers();
    }
  };

  // Metrics
  const activeCount = offers.filter(o => o.status === 'ACTIVE').length;
  const expiredCount = offers.filter(o => o.status === 'EXPIRED').length;
  const scheduledCount = offers.filter(o => o.status === 'SCHEDULED').length;
  const totalUsage = offers.reduce((acc, curr) => acc + (curr.usageCount || 0), 0);

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">جاري تحميل نظام العروض والخصومات...</div>;

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-bold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mb-2">
            <Tag className="w-4 h-4" /> SALES & MARKETING DISCOUNTS ENGINE
          </span>
          <h2 className="text-2xl font-black">إدارة العروض والتخفيضات الأوتوماتيكية</h2>
          <p className="text-xs text-slate-400 mt-1">أنشئ عروضاً محددة بمدد زمنية تبدأ وتنتهي تلقائياً مع محرك احتساب الأسعار الموحد.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadOffers} 
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setEditingOffer(null);
              setFormData({
                name: '',
                description: '',
                discountType: 'PERCENTAGE',
                discountValue: 20,
                duration: 'ONE_WEEK',
                startAt: new Date().toISOString().slice(0, 16),
                endAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
                status: 'ACTIVE',
                targetType: 'ALL',
                targetIds: [],
                maxUses: 100,
                maxUsesPerCustomer: 1,
                priority: 1,
                allowStacking: false,
                promoCode: '',
                bannerUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
                terms: 'يسري العرض حتى انتهاء المدة المحددة.'
              });
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-5 h-5" /> إضافة عرض جديد
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">العروض النشطة حالياً</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">العروض المجدولة</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{scheduledCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">العروض المنتهية تلقائياً</span>
          <span className="text-2xl font-black text-slate-400">{expiredCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي استخدام العروض</span>
          <span className="text-2xl font-black text-amber-500">{totalUsage} عملية</span>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map(offer => {
          const isExpired = new Date(offer.endAt).getTime() <= Date.now();
          const targetCourses = courses.filter(c => offer.targetIds.includes(c.id));

          return (
            <div key={offer.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between">
              <div>
                <div className="relative h-36 bg-slate-950 overflow-hidden">
                  <img src={offer.bannerUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80'} alt={offer.name} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        offer.status === 'ACTIVE' && !isExpired ? 'bg-emerald-500 text-white' :
                        offer.status === 'SCHEDULED' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {offer.status === 'ACTIVE' && !isExpired ? 'نشط أوتوماتيكياً' : offer.status === 'SCHEDULED' ? 'مجدول' : 'منتهي'}
                      </span>
                      <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">
                        {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% خصم` : `${offer.discountValue} ج.م خصم`}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white">{offer.name}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{offer.description || 'لا يوجد وصف تفصيلي.'}</p>

                  <div className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <div className="flex justify-between">
                      <span className="text-slate-500">النطاق المستهدف:</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {offer.targetType === 'ALL' ? 'جميع الكورسات' :
                         offer.targetType === 'COURSE' ? `${offer.targetIds.length} كورس محدد` :
                         offer.targetType === 'PATH' ? 'مسار تعليمي محدد' : 'فئة محددة'}
                      </span>
                    </div>

                    {targetCourses.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {targetCourses.map(tc => (
                          <span key={tc.id} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] rounded-md">
                            {tc.titleAr}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">أولوية الخصم:</span>
                      <span>رقم #{offer.priority} {offer.allowStacking ? '(يسمح بالجمع)' : '(بدون جمع)'}</span>
                    </div>
                  </div>

                  {offer.status === 'ACTIVE' && !isExpired && (
                    <OfferCountdownTimer endAtIso={offer.endAt} onExpire={loadOffers} />
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">الاستخدام: {offer.usageCount} مرة</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingOffer(offer);
                      setFormData(offer);
                      setShowModal(true);
                    }}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl transition font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating / Editing Offer */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-right dir-rtl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                {editingOffer ? 'تعديل العرض الحالي' : 'إنشاء عرض تخفيض جديد'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">اسم العرض</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: أسبوع الذكاء الاصطناعي - AI WEEK"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">وصف العرض</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="خصومات تصل إلى 30% على جميع كورسات البرمجة والمستقبل"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl h-20 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">نوع الخصم</label>
                  <select
                    value={formData.discountType}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value as OfferDiscountType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                  >
                    <option value="PERCENTAGE">نسبة مئوية (%)</option>
                    <option value="FIXED">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">قيمة الخصم</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue || 0}
                    onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Duration Presets */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-2">مدة العرض التلقائية</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDurationPreset('ONE_DAY')}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-xl transition"
                  >
                    يوم واحد (24 ساعة)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDurationPreset('ONE_WEEK')}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-xl transition"
                  >
                    أسبوع كامل (7 أيام)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDurationPreset('ONE_MONTH')}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-xl transition"
                  >
                    شهر كامل (30 يوم)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">تاريخ ووقت البداية</label>
                  <input
                    type="datetime-local"
                    value={formData.startAt ? formData.startAt.slice(0, 16) : ''}
                    onChange={e => setFormData({ ...formData, startAt: new Date(e.target.value).toISOString() })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">تاريخ ووقت النهاية (يتوقف تلقائياً)</label>
                  <input
                    type="datetime-local"
                    value={formData.endAt ? formData.endAt.slice(0, 16) : ''}
                    onChange={e => setFormData({ ...formData, endAt: new Date(e.target.value).toISOString() })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">الكورسات المستهدفة بالعرض</label>
                <select
                  value={formData.targetType}
                  onChange={e => setFormData({ ...formData, targetType: e.target.value as OfferTargetType })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold mb-2"
                >
                  <option value="ALL">جميع الكورسات والبرامج</option>
                  <option value="COURSE">كورسات محددة بالاسم</option>
                </select>

                {formData.targetType === 'COURSE' && (
                  <div className="max-h-36 overflow-y-auto bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    {courses.map(c => {
                      const isSelected = formData.targetIds?.includes(c.id);
                      return (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const current = formData.targetIds || [];
                              if (e.target.checked) {
                                setFormData({ ...formData, targetIds: [...current, c.id] });
                              } else {
                                setFormData({ ...formData, targetIds: current.filter(id => id !== c.id) });
                              }
                            }}
                            className="rounded text-amber-500 focus:ring-amber-500"
                          />
                          <span>{c.titleAr} ({c.originalPrice} ج.م)</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">رقم الأولوية (Priority)</label>
                  <input
                    type="number"
                    value={formData.priority || 1}
                    onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowStacking || false}
                      onChange={e => setFormData({ ...formData, allowStacking: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                    <span>السماح بجمع الخصم (ALLOW DISCOUNT STACKING)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">صورة بنر العرض (رابط / Storage)</label>
                <input
                  type="text"
                  value={formData.bannerUrl || ''}
                  onChange={e => setFormData({ ...formData, bannerUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                  حفظ ونشر العرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
