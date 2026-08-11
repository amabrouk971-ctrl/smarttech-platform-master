import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, Zap, ShoppingCart, Plus, Minus, Send, Search, Filter } from 'lucide-react';
import { Product, ContactPaymentSettings, StoreOrderItem } from '../types';
import { fetchProductsFromFirestore, createStoreOrderInFirestore, saveProductToFirestore } from '../services/firebaseService';
import { getPaymentSettings, buildWhatsAppUrl, getWhatsAppNumberForMethod, DEFAULT_CONTACT_PAYMENT_SETTINGS } from '../services/bookingService';

export const StoreSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ContactPaymentSettings>(DEFAULT_CONTACT_PAYMENT_SETTINGS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cart State: { [productId]: quantity }
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    loadStoreProducts();
    getPaymentSettings().then(setSettings).catch(console.error);
  }, []);

  const loadStoreProducts = async () => {
    setLoading(true);
    try {
      let prods = await fetchProductsFromFirestore();
      setProducts(prods);
    } catch (err) {
      console.error('Error loading store products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      if (newQty > prod.stockQuantity) {
        alert(`عذراً، المتاح بالمخزون حالياً هو ${prod.stockQuantity} قطعة فقط.`);
        return prev;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const cartItemCount: number = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);

  const cartItemsList: StoreOrderItem[] = Object.entries(cart).map(([prodId, qty]) => {
    const prod = products.find((p) => p.id === prodId)!;
    return {
      productId: prodId,
      productName: prod?.nameAr || prod?.name || 'منتج',
      price: Number(prod?.sellingPrice || prod?.price || 0),
      quantity: Number(qty),
      mainImagePath: prod?.mainImagePath || prod?.image || ''
    };
  });

  const cartTotal = cartItemsList.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleConfirmWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItemsList.length === 0 || !customerName.trim() || !customerPhone.trim()) {
      alert('يرجى اختيار منتج واحد على الأقل وإدخال الاسم ورقم الهاتف.');
      return;
    }

    setIsOrdering(true);
    try {
      const itemsFormatted = cartItemsList
        .map((it) => `• ${it.productName} (الكمية: ${it.quantity}) - بسعر: ${it.price * it.quantity} EGP`)
        .join('\n');

      const whatsAppMsg = `مرحباً SmartTech Store 👋\nأود طلب شراء المنتجات التالية:\n\n${itemsFormatted}\n\n إجمالي المبلغ: ${cartTotal} EGP\n 👤 اسم العميل: ${customerName}\n 📞 رقم الهاتف: ${customerPhone}\n\nشكراً لكم!`;

      // Save order in Firestore storeOrders
      await createStoreOrderInFirestore({
        orderId: `ORDER-${Date.now().toString().slice(-6)}`,
        customerName,
        phone: customerPhone,
        items: cartItemsList,
        totalAmount: cartTotal,
        whatsAppMessage: whatsAppMsg,
        status: 'NEW'
      });

      // Send to WhatsApp
      const targetPhone = getWhatsAppNumberForMethod('INQUIRY', settings);
      window.open(buildWhatsAppUrl(targetPhone, whatsAppMsg), '_blank');

      setCart({});
      setShowCheckoutModal(false);
      setCustomerName('');
      setCustomerPhone('');
      alert('تم تسجيل طلبك بنجاح وفتحت محادثة الواتساب لإكمال التأكيد والتسليم! 🚀');
      loadStoreProducts();
    } catch (err) {
      alert('حدث خطأ أثناء تسجيل الطلب.');
    } finally {
      setIsOrdering(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 dir-rtl text-right">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-black text-[10px] uppercase tracking-wider">
              SmartTech Hardware Store
            </span>
            <h2 className="text-3xl font-black mt-2">متجر حقائب المكونات وقطع الإلكترونيات</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              جميع القطع والحقائب مفحوصة ومستوردة بنسبة 100% للتطبيق العملي بالمركز والمجلس.
            </p>
          </div>

          {/* Floating Cart Badge */}
          {cartItemCount > 0 && (
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-red-600/30 flex items-center gap-3 transition cursor-pointer animate-bounce"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>مراجعة طلب الشراء ({cartItemCount})</span>
              <span className="bg-white text-red-600 px-2 py-0.5 rounded-full font-mono font-black">{cartTotal} EGP</span>
            </button>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن حقيبة، مكون، أو حسّاس..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs font-bold">
            {[
              { id: 'ALL', label: 'الكل' },
              { id: 'kits', label: 'حقائب المكونات 🧰' },
              { id: 'electronics', label: 'إلكترونيات وحساسات ⚡' },
              { id: 'robotics', label: 'قطع روبوتكس 🤖' },
              { id: 'books', label: 'كتب وملازم 📚' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white font-black shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-xs animate-pulse">
            جاري تحميل كتالوج متجر سمارتك من Firestore...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-800 dark:text-white">لا توجد منتجات متوفرة حالياً بالمتجر</h3>
            <p className="text-xs text-slate-500">يرجى الرجوع لاحقاً أو مراجعة إدارة المتجر عبر الواتساب.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((item) => {
              const qtyInCart = cart[item.id] || 0;
              const isOut = item.stockQuantity <= 0;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm hover:shadow-xl transition flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={item.mainImagePath || item.image}
                        alt={item.nameAr}
                        className="w-full h-44 object-cover rounded-2xl bg-slate-950"
                      />
                      {isOut && (
                        <span className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white font-extrabold text-[10px] rounded-full shadow">
                          نفد المخزون
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-950/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                      {item.nameAr}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        {item.sellingPrice || item.price} <span className="text-xs text-slate-500 font-sans">EGP</span>
                      </span>
                    </div>

                    {/* Quantity Controls or Add Button */}
                    {isOut ? (
                      <span className="text-xs text-red-500 font-bold">غير متوفر</span>
                    ) : qtyInCart > 0 ? (
                      <div className="flex items-center gap-2 bg-red-600 text-white rounded-xl p-1 font-mono font-bold">
                        <button
                          onClick={() => handleUpdateCartQty(item.id, -1)}
                          className="p-1 hover:bg-red-700 rounded-lg cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs">{qtyInCart}</span>
                        <button
                          onClick={() => handleUpdateCartQty(item.id, 1)}
                          className="p-1 hover:bg-red-700 rounded-lg cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpdateCartQty(item.id, 1)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> أضف للطلب
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CHECKOUT & WHATSAPP MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-white my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-extrabold text-lg text-amber-400 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> إرسال طلب الشراء عبر الواتساب
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-white font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cart Summary */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cartItemsList.map((item) => (
                <div key={item.productId} className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="font-bold text-white block">{item.productName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">الكمية: {item.quantity} × {item.price} EGP</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400">{item.price * item.quantity} EGP</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-300">الإجمالي الكلي:</span>
              <span className="font-mono font-black text-emerald-400 text-lg">{cartTotal} EGP</span>
            </div>

            {/* Customer Information Form */}
            <form onSubmit={handleConfirmWhatsAppOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">اسمك الكريـم (العميل)</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="أدخل اسمك بالكامل..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">رقم الواتساب للتواصل والتسليم</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="مثال: 01012345678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono font-bold focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={isOrdering}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Send className="w-4 h-4" />
                <span>{isOrdering ? 'جاري تجهيز الطلب...' : 'تأكيد الطلب وإرسال عبر الواتساب 🛒'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
