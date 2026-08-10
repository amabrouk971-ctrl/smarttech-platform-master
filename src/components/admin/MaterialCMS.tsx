import React, { useState, useEffect } from 'react';
import { Folder, Plus, FileText, Link, Download } from 'lucide-react';
import { CourseMaterial } from '../../types';
import { fetchMaterialsFromFirestore, saveMaterialToFirestore } from '../../services/firebaseService';

export const MaterialCMS: React.FC = () => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState<'PDF' | 'VIDEO' | 'DOC' | 'ZIP' | 'LINK'>('PDF');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const list = await fetchMaterialsFromFirestore();
    setMaterials(list);
  };

  const handleCreateMaterial = async () => {
    if (!title || !fileUrl) return;
    const newMat: CourseMaterial = {
      id: `mat-${Date.now()}`,
      titleAr: title,
      descriptionAr: desc,
      fileUrl,
      fileType,
      type: 'PDF',
      status: 'AVAILABLE',
      target: { type: 'EVERYONE' },
      createdAt: new Date().toISOString()
    };

    await saveMaterialToFirestore(newMat);
    setTitle('');
    setDesc('');
    setFileUrl('');
    loadMaterials();
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-black">المكتبة الرقمية والمواد التعليمية (Materials CMS)</h2>
        <p className="text-xs text-slate-400 mt-1">رفع وتوفير كتب PDF، أدلة الشرح، ومقاطع الفيديو التعليمية للطلاب.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-black text-sm border-b pb-2 text-slate-900 dark:text-white">إضافة ملف أو مادة تعليمية جديدة</h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">اسم المادة / الكتاب:</label>
            <input
              type="text"
              placeholder="مثال: كتاب البرمجة بلغة بايثون - المستوى الأول"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">رابط الملف / الفيديو (URL):</label>
            <input
              type="text"
              placeholder="https://example.com/material.pdf"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">نوع الملف:</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold"
            >
              <option value="PDF">كتيب PDF</option>
              <option value="VIDEO">مقطع فيديو شارح</option>
              <option value="ZIP">ملف مضغوط ZIP</option>
              <option value="LINK">رابط خارجي</option>
            </select>
          </div>

          <button
            onClick={handleCreateMaterial}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> إضافة للمكتبة
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-black text-sm border-b pb-2 text-slate-900 dark:text-white">المواد التعليمية بالمكتبة ({materials.length})</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {materials.map((m) => (
              <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{m.titleAr}</div>
                  <div className="text-slate-400 text-[10px]">{m.fileType}</div>
                </div>
                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-[10px]"
                >
                  تحميل
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
