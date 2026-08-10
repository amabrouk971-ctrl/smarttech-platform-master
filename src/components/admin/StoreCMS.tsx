import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  ShoppingBag, Plus, Search, Filter, Edit, Trash2, Eye, TrendingUp, AlertTriangle, 
  DollarSign, Package, RefreshCw, Upload, Image as ImageIcon, CheckCircle, XCircle, 
  ArrowUpRight, ArrowDownRight, Layers, FileText, Send, MessageSquare, BarChart2, Shield,
  Truck, ClipboardList, CheckSquare, Wrench, Cpu, Users, FileSpreadsheet, Download,
  CornerDownLeft, FileCheck, Tag, Zap, Clock, ShieldAlert, AlertCircle, Printer, X
} from 'lucide-react';
import { 
  Product, ProductType, ProductCategory, Supplier, PurchaseRequest, PurchaseOrder, 
  ReceivingRecord, PurchaseReturn, StoreExpense, StockAdjustment, InventoryTransaction, StoreOrder 
} from '../../types';
import { 
  fetchProductsFromFirestore, saveProductToFirestore, deleteProductFromFirestore,
  fetchSuppliersFromFirestore, saveSupplierToFirestore, deleteSupplierFromFirestore,
  fetchProductCategoriesFromFirestore, saveProductCategoryToFirestore, deleteProductCategoryFromFirestore,
  fetchPurchaseRequestsFromFirestore, savePurchaseRequestToFirestore, updatePurchaseRequestStatusInFirestore, addPurchaseRequestCommentInFirestore,
  fetchPurchaseOrdersFromFirestore, savePurchaseOrderToFirestore, updatePurchaseOrderStatusInFirestore, generateUniquePoNumber,
  fetchReceivingRecordsFromFirestore, processReceivingGoodsInFirestore,
  fetchPurchaseReturnsFromFirestore, savePurchaseReturnToFirestore,
  fetchStoreExpensesFromFirestore, saveStoreExpenseToFirestore,
  recordStockAdjustmentInFirestore,
  fetchInventoryTransactionsFromFirestore, recordInventoryTransaction,
  fetchStoreOrdersFromFirestore, updateStoreOrderStatusInFirestore
} from '../../services/firebaseService';

export const StoreCMS: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 'products' | 'categories' | 'spare_parts' | 'smart_accessories' |
    'suppliers' | 'purchase_requests' | 'purchase_orders' | 'receiving' |
    'inventory' | 'stock_adjustments' | 'returns' | 'expenses' | 'analytics' | 'import_export'
  >('dashboard');

  // Core Store States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [receivingRecords, setReceivingRecords] = useState<ReceivingRecord[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);
  const [storeExpenses, setStoreExpenses] = useState<StoreExpense[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Modal & Drawer States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);

  const [showPrModal, setShowPrModal] = useState(false);
  const [editingPr, setEditingPr] = useState<Partial<PurchaseRequest> | null>(null);
  const [viewPr, setViewPr] = useState<PurchaseRequest | null>(null);
  const [prCommentText, setPrCommentText] = useState('');

  const [showPoModal, setShowPoModal] = useState(false);
  const [editingPo, setEditingPo] = useState<Partial<PurchaseOrder> | null>(null);
  const [printPo, setPrintPo] = useState<PurchaseOrder | null>(null);

  const [showReceivingModal, setShowReceivingModal] = useState(false);
  const [receivingPo, setReceivingPo] = useState<PurchaseOrder | null>(null);
  const [receivingItemsState, setReceivingItemsState] = useState<any[]>([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<ProductCategory> | null>(null);

  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState<Partial<StockAdjustment>>({});

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Partial<StoreExpense>>({});

  useEffect(() => {
    loadAllStoreData();
  }, [activeSubTab]);

  const loadAllStoreData = async () => {
    setLoading(true);
    try {
      const [
        prodsData, catsData, supsData, prsData, posData, recsData, retsData, expsData, txsData, ordersData
      ] = await Promise.all([
        fetchProductsFromFirestore(),
        fetchProductCategoriesFromFirestore(),
        fetchSuppliersFromFirestore(),
        fetchPurchaseRequestsFromFirestore(),
        fetchPurchaseOrdersFromFirestore(),
        fetchReceivingRecordsFromFirestore(),
        fetchPurchaseReturnsFromFirestore(),
        fetchStoreExpensesFromFirestore(),
        fetchInventoryTransactionsFromFirestore(),
        fetchStoreOrdersFromFirestore()
      ]);

      setProducts(prodsData);
      setCategories(catsData);
      setSuppliers(supsData);
      setPurchaseRequests(prsData);
      setPurchaseOrders(posData);
      setReceivingRecords(recsData);
      setPurchaseReturns(retsData);
      setStoreExpenses(expsData);
      setInventoryTransactions(txsData);
      setStoreOrders(ordersData);
    } catch (err) {
      console.error('Error loading store data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Helper
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          
          setEditingProduct((prev) => ({
            ...prev,
            mainImagePath: compressedDataUrl,
            image: compressedDataUrl,
            images: prev?.images ? [...prev.images, compressedDataUrl] : [compressedDataUrl]
          }));
        } else {
          const base64Url = event.target?.result as string;
          setEditingProduct((prev) => ({
            ...prev,
            mainImagePath: base64Url,
            image: base64Url,
            images: prev?.images ? [...prev.images, base64Url] : [base64Url]
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setLoading(true);
      const saved = await saveProductToFirestore(editingProduct);
      alert(`تم حفظ المنتج (${saved.nameAr}) بنجاح!`);
      setShowProductModal(false);
      setEditingProduct(null);
      loadAllStoreData();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ المنتج في Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت تأكد من حذف المنتج (${name}) نهائياً؟`)) return;
    try {
      await deleteProductFromFirestore(id);
      loadAllStoreData();
    } catch (err) {
      alert('تعذر حذف المنتج.');
    }
  };

  // Supplier Actions
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    try {
      setLoading(true);
      await saveSupplierToFirestore(editingSupplier);
      alert('تم حفظ بيانات المورد بنجاح!');
      setShowSupplierModal(false);
      setEditingSupplier(null);
      loadAllStoreData();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ المورد.');
    } finally {
      setLoading(false);
    }
  };

  // Purchase Request Actions
  const handleSavePr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPr || !editingPr.supplierId || !editingPr.items || editingPr.items.length === 0) {
      alert('يرجى اختيار المورد وإضافة منتج واحد على الأقل.');
      return;
    }
    try {
      setLoading(true);
      const saved = await savePurchaseRequestToFirestore(editingPr);
      alert(`تم إنشاء طلب الشراء رقم (${saved.requestId}) بنجاح!`);
      setShowPrModal(false);
      setEditingPr(null);
      loadAllStoreData();
    } catch (err) {
      alert('حدث خطأ أثناء تقديم طلب الشراء.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePr = async (prId: string) => {
    if (!window.confirm('هل تريد الموافقة على طلب الشراء؟')) return;
    try {
      await updatePurchaseRequestStatusInFirestore(prId, 'APPROVED', 'تمت الموافقة من قبل مدير النظام', { id: 'admin', name: 'مدير النظام' });
      alert('تمت الموافقة على طلب الشراء!');
      loadAllStoreData();
    } catch (err) {
      alert('حدث خطأ أثناء اعتماد الطلب.');
    }
  };

  const handleConvertPrToPo = async (pr: PurchaseRequest) => {
    try {
      setLoading(true);
      const newPo = await savePurchaseOrderToFirestore({
        purchaseRequestId: pr.id,
        supplierId: pr.supplierId,
        supplierName: pr.supplierName,
        createdBy: 'admin',
        createdByName: 'مدير النظام',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: pr.requiredDate || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        items: pr.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitCost: item.estimatedUnitPrice,
          totalCost: item.estimatedSubtotal,
          receivedQuantity: 0,
          damagedQuantity: 0,
          missingQuantity: 0
        })),
        subtotal: pr.totalEstimatedCost,
        status: 'PENDING_APPROVAL',
        paymentStatus: 'UNPAID',
        deliveryStatus: 'PENDING'
      });

      await updatePurchaseRequestStatusInFirestore(pr.id, 'CONVERTED_TO_PO');
      alert(`تم تحويل طلب الشراء إلى أمر شراء رسمي برقم (${newPo.poNumber}) !`);
      loadAllStoreData();
    } catch (err) {
      alert('حدث خطأ أثناء تحويل الطلب لـ PO.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrComment = async () => {
    if (!viewPr || !prCommentText.trim()) return;
    try {
      await addPurchaseRequestCommentInFirestore(viewPr.id, {
        userId: 'admin',
        userName: 'مدير النظام',
        userRole: 'ADMIN',
        comment: prCommentText.trim()
      });
      setPrCommentText('');
      loadAllStoreData();
    } catch (err) {
      alert('تعذر إضافة التعليق.');
    }
  };

  // Purchase Order Actions
  const handleSavePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPo || !editingPo.supplierId || !editingPo.items || editingPo.items.length === 0) {
      alert('يرجى اختيار المورد وإضافة بنود لأمر الشراء.');
      return;
    }
    try {
      setLoading(true);
      const saved = await savePurchaseOrderToFirestore(editingPo);
      alert(`تم حفظ أمر الشراء رقم (${saved.poNumber}) بنجاح!`);
      setShowPoModal(false);
      setEditingPo(null);
      loadAllStoreData();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ أمر الشراء.');
    } finally {
      setLoading(false);
    }
  };

  // Process Receiving Goods
  const handleOpenReceivingModal = (po: PurchaseOrder) => {
    setReceivingPo(po);
    setReceivingItemsState(
      po.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        orderedQuantity: item.quantity,
        previouslyReceivedQuantity: item.receivedQuantity || 0,
        currentlyReceivedQuantity: Math.max(0, item.quantity - (item.receivedQuantity || 0)),
        damagedQuantity: 0,
        missingQuantity: 0,
        rejectedQuantity: 0
      }))
    );
    setShowReceivingModal(true);
  };

  const handleProcessReceiving = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPo) return;

    try {
      setLoading(true);
      const recRecord = await processReceivingGoodsInFirestore({
        poId: receivingPo.id,
        poNumber: receivingPo.poNumber,
        supplierId: receivingPo.supplierId,
        supplierName: receivingPo.supplierName,
        receivedBy: 'admin',
        receivedByName: 'مسؤول المستودع',
        receivedDate: new Date().toISOString().split('T')[0],
        items: receivingItemsState
      });

      alert(`تم تسجيل استلام البضائع برقم (${recRecord.receivingNumber}) وتحديث المخزون آلياً!`);
      setShowReceivingModal(false);
      setReceivingPo(null);
      loadAllStoreData();
    } catch (err) {
      alert('حدث خطأ أثناء استلام البضائع.');
    } finally {
      setLoading(false);
    }
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await saveProductCategoryToFirestore(editingCategory);
      setShowCategoryModal(false);
      setEditingCategory(null);
      loadAllStoreData();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ التصنيف.');
    }
  };

  // Stock Adjustment Action
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentForm.productId) {
      alert('يرجى اختيار المنتج المراد تعديله.');
      return;
    }
    try {
      await recordStockAdjustmentInFirestore(adjustmentForm);
      alert('تمت تسوية وتحديث المخزون بنجاح!');
      setShowAdjustmentModal(false);
      setAdjustmentForm({});
      loadAllStoreData();
    } catch (err) {
      alert('حدث خطأ أثناء تعديل المخزون.');
    }
  };

  // Expense Action
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveStoreExpenseToFirestore(editingExpense);
      alert('تم تسجيل المصروف بنجاح!');
      setShowExpenseModal(false);
      setEditingExpense({});
      loadAllStoreData();
    } catch (err) {
      alert('حدث خطأ أثناء تسجيل المصروف.');
    }
  };

  // Export Data Action
  const handleExportStoreExcel = () => {
    const wb = XLSX.utils.book_new();

    const prodsSheet = XLSX.utils.json_to_sheet(
      products.map((p) => ({
        'اسم المنتج': p.nameAr,
        'SKU': p.sku,
        'الباركود': p.barcode || '',
        'التصنيف': p.category,
        'نوع المنتج': p.productType,
        'سعر التكلفة': p.costPrice,
        'سعر البيع': p.sellingPrice,
        'الكمية الحالية': p.stockQuantity,
        'الحد الأدنى': p.minimumStock,
        'الحالة': p.status
      }))
    );
    XLSX.utils.book_append_sheet(wb, prodsSheet, 'المنتجات');

    const posSheet = XLSX.utils.json_to_sheet(
      purchaseOrders.map((po) => ({
        'رقم أمر الشراء': po.poNumber,
        'المورد': po.supplierName,
        'التاريخ': po.orderDate,
        'التكلفة الإجمالية': po.totalCost,
        'حالة الدفع': po.paymentStatus,
        'حالة التوريد': po.deliveryStatus,
        'الحالة': po.status
      }))
    );
    XLSX.utils.book_append_sheet(wb, posSheet, 'أوامر الشراء');

    XLSX.writeFile(wb, `SmartTech_Store_Report_${Date.now()}.xlsx`);
  };

  // Metric Computations
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stockQuantity * p.costPrice), 0);
  const totalPotentialRevenue = products.reduce((acc, p) => acc + (p.stockQuantity * p.sellingPrice), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minimumStock).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;
  const pendingPrsCount = purchaseRequests.filter((pr) => ['SUBMITTED', 'UNDER_REVIEW'].includes(pr.status)).length;
  const pendingPosCount = purchaseOrders.filter((po) => ['APPROVED', 'SENT_TO_SUPPLIER', 'PARTIALLY_RECEIVED'].includes(po.status)).length;
  const totalProcurementSpend = purchaseOrders.filter((po) => ['APPROVED', 'RECEIVED', 'PARTIALLY_RECEIVED'].includes(po.status)).reduce((s, po) => s + po.totalCost, 0);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchesCat = selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 p-6 sm:p-8 rounded-3xl border border-red-500/30 text-white shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-widest border border-red-400 flex items-center gap-1.5 w-fit">
            <ShoppingBag className="w-3.5 h-3.5" /> SMARTTECH STORE & PROCUREMENT SYSTEM
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">إدارة المستودع، التوريدات، وقطع الغيار الشاملة</h2>
          <p className="text-xs text-slate-400">
            إدارة طلبات الشراء، أوامر التوريد، الفحص والاستلام، الموردين، وإعادة التعبئة التلقائية المرتبطة بـ Firestore.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setEditingPr({
                employeeName: 'موظف سمارت تك',
                priority: 'MEDIUM',
                requiredDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
                items: []
              });
              setShowPrModal(true);
            }}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-2xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4 text-amber-400" /> + طلب شراء جديد (PR)
          </button>
          <button
            onClick={() => {
              setEditingProduct({
                nameAr: '',
                nameEn: '',
                sku: `SKU-${Date.now().toString().slice(-6)}`,
                barcode: '',
                productType: 'REGULAR_PRODUCT',
                category: 'kits',
                costPrice: 500,
                sellingPrice: 850,
                stockQuantity: 10,
                minimumStock: 2,
                unit: 'قطعة',
                status: 'ACTIVE',
                mainImagePath: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                description: 'منتج جديد'
              });
              setShowProductModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-600 text-white font-black text-xs rounded-2xl shadow-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> إضافة منتج جديد 📦
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'dashboard', label: 'لوحة التحكم والمؤشرات 📊', icon: BarChart2 },
          { id: 'products', label: 'دليل المنتجات 📦', icon: Package },
          { id: 'categories', label: 'التصنيفات والأنواع 🏷️', icon: Tag },
          { id: 'spare_parts', label: 'قطع الغيار 🔧', icon: Wrench },
          { id: 'smart_accessories', label: 'الإكسسوارات الذكية 🔌', icon: Cpu },
          { id: 'suppliers', label: 'الموردين 🏢', icon: Users },
          { id: 'purchase_requests', label: 'طلبات الشراء (PR) 📑', icon: ClipboardList },
          { id: 'purchase_orders', label: 'أوامر الشراء (PO) 🛒', icon: ShoppingBag },
          { id: 'receiving', label: 'استلام البضائع 🚚', icon: Truck },
          { id: 'inventory', label: 'حركات المخزون 🔄', icon: Layers },
          { id: 'stock_adjustments', label: 'تعديلات الجرد ⚙️', icon: RefreshCw },
          { id: 'returns', label: 'مرتجعات الموردين ↩️', icon: CornerDownLeft },
          { id: 'expenses', label: 'مصاريف المتجر 💵', icon: DollarSign },
          { id: 'analytics', label: 'التحليلات المالية 📈', icon: TrendingUp },
          { id: 'import_export', label: 'استيراد وتصدير 📑', icon: FileSpreadsheet }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-3 rounded-2xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-black'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: STORE MANAGEMENT DASHBOARD */}
      {/* ========================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">قيمة المخزون الحالي</span>
              <span className="text-xl font-black font-mono text-emerald-400">{totalInventoryValue.toLocaleString()} EGP</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">منتجات مخزونها منخفض</span>
              <span className="text-xl font-black font-mono text-amber-400">{lowStockCount} منتج</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">منتجات نافدة (Zero)</span>
              <span className="text-xl font-black font-mono text-red-400">{outOfStockCount} منتج</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">طلبات شراء قيد المراجعة</span>
              <span className="text-xl font-black font-mono text-cyan-400">{pendingPrsCount} طلب</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">أوامر شراء معتمدة</span>
              <span className="text-xl font-black font-mono text-blue-400">{pendingPosCount} أمر</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">إجمالي مشتريات الموردين</span>
              <span className="text-xl font-black font-mono text-purple-400">{totalProcurementSpend.toLocaleString()} EGP</span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 text-white space-y-3">
            <h3 className="text-xs font-bold text-slate-400">إجراءات سريعة للمستودع والتوريدات:</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => { setEditingProduct({}); setShowProductModal(true); }} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition">
                + إضافة منتج
              </button>
              <button onClick={() => { setEditingPr({ items: [] }); setShowPrModal(true); }} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition">
                + طلب شراء جديد
              </button>
              <button onClick={() => { setEditingSupplier({}); setShowSupplierModal(true); }} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition">
                + إضافة مورد جديد
              </button>
              <button onClick={() => setActiveSubTab('receiving')} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition">
                🚚 استلام بضائع
              </button>
              <button onClick={handleExportStoreExcel} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition">
                📊 تصدير Excel
              </button>
            </div>
          </div>

          {/* Low Stock Warning Section */}
          {lowStockCount > 0 && (
            <div className="bg-amber-950/30 border border-amber-500/30 p-6 rounded-3xl text-amber-300 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" /> تنبيه: يوجد {lowStockCount} منتج وصل للحد الأدنى من المخزون!
                </h3>
                <span className="text-xs text-amber-400 font-bold">يوصى بإنشاء طلب شراء فوراً</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.filter((p) => p.stockQuantity <= p.minimumStock).slice(0, 6).map((p) => (
                  <div key={p.id} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-xs text-white">{p.nameAr}</p>
                      <p className="text-[10px] text-slate-400">المخزون الحالي: <span className="font-bold text-red-400">{p.stockQuantity}</span> / الحد الأدنى: {p.minimumStock}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingPr({
                          supplierId: p.supplierId || '',
                          supplierName: p.supplier || '',
                          items: [
                            {
                              productId: p.id,
                              productName: p.nameAr,
                              sku: p.sku,
                              quantity: p.minimumStock * 3,
                              estimatedUnitPrice: p.costPrice,
                              estimatedSubtotal: p.costPrice * p.minimumStock * 3
                            }
                          ]
                        });
                        setShowPrModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-[11px] rounded-xl hover:bg-amber-400 transition"
                    >
                      طلب شراء ⚡
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Inventory Transactions Activity */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> آخر حركات التوريد والمخزون
            </h3>

            <div className="space-y-3">
              {inventoryTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-xl text-white font-bold text-[10px] ${
                      tx.type === 'PURCHASE_RECEIVE' ? 'bg-emerald-600' : 'bg-slate-800'
                    }`}>
                      {tx.type}
                    </span>
                    <div>
                      <p className="font-bold text-white">{tx.productName}</p>
                      <p className="text-[10px] text-slate-400">{tx.reason || tx.notes}</p>
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <p className="font-extrabold text-emerald-400">+{tx.quantity} قطعة</p>
                    <p className="text-[10px] text-slate-500">{tx.createdAt.split('T')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: PRODUCTS CATALOGUE */}
      {/* ========================================================= */}
      {activeSubTab === 'products' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث باسم المنتج، الكود SKU، أو الباركود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
              >
                <option value="ALL">جميع التصنيفات</option>
                <option value="kits">حقائب المكونات (Kits)</option>
                <option value="electronics">المكونات والحساسات (Electronics)</option>
                <option value="robotics">قطع الروبوتكس (Robotics)</option>
                <option value="books">الكتب والملازم (Books)</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden text-white">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-extrabold border-b border-slate-800">
                  <tr>
                    <th className="p-4">المنتج والرمز</th>
                    <th className="p-4">النوع / التصنيف</th>
                    <th className="p-4">سعر التكلفة</th>
                    <th className="p-4">سعر البيع</th>
                    <th className="p-4">المخزون الحالي</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {filteredProducts.map((p) => {
                    const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.minimumStock;
                    const isOut = p.stockQuantity <= 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.mainImagePath || p.image}
                            alt={p.nameAr}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800"
                          />
                          <div>
                            <h4 className="font-extrabold text-white text-sm">{p.nameAr}</h4>
                            <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                            {p.productType || 'REGULAR'} / {p.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-400">{p.costPrice} EGP</td>
                        <td className="p-4 font-mono font-black text-emerald-400">{p.sellingPrice} EGP</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-sm">{p.stockQuantity} {p.unit || 'قطعة'}</span>
                            {isOut && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold text-[10px]">نفد</span>}
                            {isLowStock && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">منخفض</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {p.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewProduct(p)}
                              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                              title="معاينة"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setShowProductModal(true);
                              }}
                              className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.nameAr)}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 4: SPARE PARTS SECTION */}
      {/* ========================================================= */}
      {activeSubTab === 'spare_parts' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-amber-400 flex items-center gap-2">
                <Wrench className="w-6 h-6" /> مستودع قطع الغيار والمكونات الإلكترونية
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                عرض وإدارة قطع غيار الكمبيوتر، الحساسات، والمكونات المحددة بالنوع SPARE_PART.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct({
                  productType: 'SPARE_PART',
                  category: 'قطع غيار إلكترونية',
                  unit: 'قطعة',
                  status: 'ACTIVE'
                });
                setShowProductModal(true);
              }}
              className="px-5 py-3 bg-amber-500 text-slate-950 font-black text-xs rounded-2xl hover:bg-amber-400 transition"
            >
              + إضافة قطعة غيار جديدة 🔧
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products.filter((p) => p.productType === 'SPARE_PART').map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white space-y-3">
                <div className="flex items-center gap-3">
                  <img src={p.mainImagePath || p.image} alt={p.nameAr} className="w-12 h-12 rounded-xl object-cover bg-slate-950" />
                  <div>
                    <h4 className="font-extrabold text-sm">{p.nameAr}</h4>
                    <p className="text-[10px] text-slate-400">{p.sku}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">المخزون: <strong className="text-white">{p.stockQuantity} {p.unit}</strong></span>
                  <span className="font-mono font-bold text-emerald-400">{p.sellingPrice} EGP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 5: SMART ACCESSORIES SECTION */}
      {/* ========================================================= */}
      {activeSubTab === 'smart_accessories' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-cyan-400 flex items-center gap-2">
                <Cpu className="w-6 h-6" /> قسم الإكسسوارات والأجهزة الذكية
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                إدارة الإكسسوارات التعليمية المحددة بالنوع SMART_ACCESSORY.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct({
                  productType: 'SMART_ACCESSORY',
                  category: 'إكسسوارات ذكية',
                  unit: 'قطعة',
                  status: 'ACTIVE'
                });
                setShowProductModal(true);
              }}
              className="px-5 py-3 bg-cyan-500 text-slate-950 font-black text-xs rounded-2xl hover:bg-cyan-400 transition"
            >
              + إضافة إكسسوار جديد 🔌
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products.filter((p) => p.productType === 'SMART_ACCESSORY').map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white space-y-3">
                <div className="flex items-center gap-3">
                  <img src={p.mainImagePath || p.image} alt={p.nameAr} className="w-12 h-12 rounded-xl object-cover bg-slate-950" />
                  <div>
                    <h4 className="font-extrabold text-sm">{p.nameAr}</h4>
                    <p className="text-[10px] text-slate-400">{p.sku}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">المخزون: <strong className="text-white">{p.stockQuantity} {p.unit}</strong></span>
                  <span className="font-mono font-bold text-cyan-400">{p.sellingPrice} EGP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 6: SUPPLIERS DIRECTORY */}
      {/* ========================================================= */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-400" /> دليل الموردين المعتمدين
              </h3>
              <p className="text-xs text-slate-400">قائمة الشركات والموردين المعتمدين لتجهيزات حقائب سمارت تك.</p>
            </div>
            <button
              onClick={() => {
                setEditingSupplier({ status: 'ACTIVE', paymentTerms: '30 يوماً' });
                setShowSupplierModal(true);
              }}
              className="px-5 py-3 bg-amber-500 text-slate-950 font-black text-xs rounded-2xl hover:bg-amber-400 transition"
            >
              + إضافة مورد جديد 🏢
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div key={sup.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-base text-amber-400">{sup.companyName}</h4>
                    <p className="text-xs text-slate-300">مسؤول التواصل: {sup.contactName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                    {sup.supplierId}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p>📞 الهاتف: {sup.phone}</p>
                  <p>💬 واتساب: {sup.whatsapp}</p>
                  <p>✉️ البريد: {sup.email || 'غير مدخل'}</p>
                  <p>💳 شروط الدفع: {sup.paymentTerms}</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setEditingSupplier(sup);
                      setShowSupplierModal(true);
                    }}
                    className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold"
                  >
                    تعديل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 7: PURCHASE REQUESTS (PR) */}
      {/* ========================================================= */}
      {activeSubTab === 'purchase_requests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white">
            <div>
              <h3 className="text-xl font-black text-cyan-400 flex items-center gap-2">
                <ClipboardList className="w-6 h-6" /> طلبات الشراء الداخلية (Purchase Requests - PR)
              </h3>
              <p className="text-xs text-slate-400">طلبات الموظفين لاحتياجات المتجر والمستودع والموافقة الإدارية.</p>
            </div>
            <button
              onClick={() => {
                setEditingPr({
                  employeeName: 'موظف سمارت تك',
                  priority: 'MEDIUM',
                  requiredDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
                  items: []
                });
                setShowPrModal(true);
              }}
              className="px-5 py-3 bg-cyan-500 text-slate-950 font-black text-xs rounded-2xl hover:bg-cyan-400 transition"
            >
              + إنشاء طلب شراء جديد 📑
            </button>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden text-white">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-extrabold border-b border-slate-800">
                <tr>
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">الموظف الطالب</th>
                  <th className="p-4">المورد المقترح</th>
                  <th className="p-4">التكلفة التقديرية</th>
                  <th className="p-4">الأولوية</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {purchaseRequests.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-amber-400">{pr.requestId}</td>
                    <td className="p-4">{pr.employeeName}</td>
                    <td className="p-4 text-slate-300">{pr.supplierName}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">{pr.totalEstimatedCost} EGP</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        pr.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {pr.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-[10px]">
                        {pr.status}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2 space-x-reverse">
                      <button onClick={() => setViewPr(pr)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200">
                        معاينة
                      </button>
                      {['SUBMITTED', 'UNDER_REVIEW'].includes(pr.status) && (
                        <>
                          <button onClick={() => handleApprovePr(pr.id)} className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">
                            موافقة
                          </button>
                          <button onClick={() => handleConvertPrToPo(pr)} className="p-1.5 bg-amber-500 text-slate-950 font-black rounded-lg">
                            تحويل لـ PO ⚡
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 8: PURCHASE ORDERS (PO) */}
      {/* ========================================================= */}
      {activeSubTab === 'purchase_orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white">
            <div>
              <h3 className="text-xl font-black text-amber-400 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" /> أوامر الشراء الرسمية (Purchase Orders - PO)
              </h3>
              <p className="text-xs text-slate-400">أوامر التوريد الصادرة للموردين والطباعة والتتبع.</p>
            </div>
            <button
              onClick={async () => {
                const poNum = await generateUniquePoNumber();
                setEditingPo({
                  poNumber: poNum,
                  createdBy: 'admin',
                  createdByName: 'مدير النظام',
                  orderDate: new Date().toISOString().split('T')[0],
                  expectedDeliveryDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
                  items: [],
                  status: 'DRAFT',
                  paymentStatus: 'UNPAID',
                  deliveryStatus: 'PENDING'
                });
                setShowPoModal(true);
              }}
              className="px-5 py-3 bg-amber-500 text-slate-950 font-black text-xs rounded-2xl hover:bg-amber-400 transition"
            >
              + أمر شراء جديد 🛒
            </button>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden text-white">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-extrabold border-b border-slate-800">
                <tr>
                  <th className="p-4">رقم أمر الشراء</th>
                  <th className="p-4">المورد</th>
                  <th className="p-4">تاريخ الأمر</th>
                  <th className="p-4">التكلفة الإجمالية</th>
                  <th className="p-4">حالة التوريد</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-amber-400">{po.poNumber}</td>
                    <td className="p-4 font-bold">{po.supplierName}</td>
                    <td className="p-4 text-slate-400">{po.orderDate}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">{po.totalCost} EGP</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        po.deliveryStatus === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {po.deliveryStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 font-bold text-[10px]">
                        {po.status}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2 space-x-reverse">
                      <button onClick={() => setPrintPo(po)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200">
                        طباعة / PDF 🖨️
                      </button>
                      {po.deliveryStatus !== 'DELIVERED' && (
                        <button onClick={() => handleOpenReceivingModal(po)} className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">
                          استلام بضائع 🚚
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ========================================================= */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white space-y-6 dir-rtl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="font-black text-lg text-white">
                {editingProduct.id ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم المنتج (عربي) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.nameAr || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم المنتج (إنجليزي)</label>
                  <input
                    type="text"
                    value={editingProduct.nameEn || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">رمز المنتج SKU *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الباركود Barcode</label>
                  <input
                    type="text"
                    value={editingProduct.barcode || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">نوع المنتج Product Type *</label>
                  <select
                    value={editingProduct.productType || 'REGULAR_PRODUCT'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-red-500 outline-none"
                  >
                    <option value="REGULAR_PRODUCT">منتج عادي (Regular Product)</option>
                    <option value="SPARE_PART">قطعة غيار (Spare Part)</option>
                    <option value="SMART_ACCESSORY">إكسسوار ذكي (Smart Accessory)</option>
                    <option value="EDUCATIONAL_COMPONENT">مكون تعليمي (Educational Component)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">التصنيف الرئيسي Category *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">سعر التكلفة Cost Price (EGP) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.costPrice ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">سعر البيع Selling Price (EGP) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.sellingPrice ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value), price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الكمية بالمخزون Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stockQuantity ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">حد التنبيه الأدنى Min Stock *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.minimumStock ?? 2}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minimumStock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">صورة المنتج (رابط أو رفع من الجهاز)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingProduct.mainImagePath || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, mainImagePath: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-red-500 outline-none"
                  />
                  <label className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer flex items-center gap-1">
                    <Upload className="w-4 h-4" /> رفع
                    <input type="file" accept="image/*" onChange={handleProductImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold">
                  إلغاء
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl">
                  {loading ? 'جاري الحفظ...' : 'حفظ المنتج في Firestore 💾'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PRINTABLE PURCHASE ORDER DOCUMENT */}
      {/* ========================================================= */}
      {printPo && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl p-8 w-full max-w-3xl space-y-6 dir-rtl font-sans shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <span className="text-xs font-black text-red-600 tracking-wider">SMARTTECH ACADEMY & HARDWARE STORE</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">أمر شراء رسمي (PURCHASE ORDER)</h2>
                <p className="text-xs text-slate-500">رقم أمر الشراء: <strong className="font-mono text-slate-900">{printPo.poNumber}</strong></p>
              </div>
              <button onClick={() => setPrintPo(null)} className="p-2 text-slate-400 hover:text-slate-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
              <div className="space-y-1">
                <p className="font-bold text-slate-400">المورد الموجه إليه Order To:</p>
                <p className="font-black text-sm text-slate-900">{printPo.supplierName}</p>
                <p className="text-slate-600">تاريخ أمر الشراء: {printPo.orderDate}</p>
                <p className="text-slate-600">التاريخ المتوقع للتسليم: {printPo.expectedDeliveryDate}</p>
              </div>
              <div className="space-y-1 text-left">
                <p className="font-bold text-slate-400">الجهة المصدرة Issued By:</p>
                <p className="font-black text-sm text-slate-900">SmartTech Store Management</p>
                <p className="text-slate-600">بواسطة: {printPo.createdByName}</p>
                <p className="text-slate-600">الحالة: {printPo.status}</p>
              </div>
            </div>

            <table className="w-full text-right text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-extrabold text-slate-700">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">المنتج / البند</th>
                  <th className="p-3 font-mono">SKU</th>
                  <th className="p-3">الكمية المطلوبة</th>
                  <th className="p-3">سعر الوحدة</th>
                  <th className="p-3">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {printPo.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold">{item.productName}</td>
                    <td className="p-3 font-mono text-slate-500">{item.sku}</td>
                    <td className="p-3 font-bold font-mono">{item.quantity}</td>
                    <td className="p-3 font-mono">{item.unitCost} EGP</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{item.totalCost} EGP</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-60 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي Subtotal:</span>
                  <span className="font-mono font-bold">{printPo.subtotal} EGP</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                  <span>الإجمالي الكلي Total:</span>
                  <span className="font-mono text-emerald-600">{printPo.totalCost} EGP</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-8">
              <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2">
                <Printer className="w-4 h-4" /> طباعة المستند
              </button>
              <button onClick={() => setPrintPo(null)} className="px-6 py-2.5 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
