import React, { useState, useEffect, useRef } from 'react';
import { SimulationDef, SimulationComponent, SimulationType, ContentTarget } from '../../types';
import { db } from '../../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Save, X, Cpu, Move, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export const SimulationBuilderCMS: React.FC = () => {
  const [simulations, setSimulations] = useState<SimulationDef[]>([]);
  const [editingSim, setEditingSim] = useState<SimulationDef | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<SimulationDef>>({
    titleAr: '',
    descriptionAr: '',
    type: 'CIRCUIT_BUILDER',
    difficulty: 'BEGINNER',
    status: 'DRAFT',
    components: [],
    rules: [],
    target: { targetType: 'EVERYONE', targetIds: [] }
  });

  // Canvas State
  const [selectedComponent, setSelectedComponent] = useState<SimulationComponent | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'simulations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SimulationDef));
      setSimulations(data);
    }, (err) => console.warn('Simulations snapshot error:', err));
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      if (editingSim) {
        await updateDoc(doc(db, 'simulations', editingSim.id), {
          ...formData,
        });
      } else {
        await addDoc(collection(db, 'simulations'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      setShowForm(false);
      setEditingSim(null);
      setFormData({
        titleAr: '', descriptionAr: '', type: 'CIRCUIT_BUILDER', difficulty: 'BEGINNER', status: 'DRAFT', components: [], rules: [], target: { targetType: 'EVERYONE', targetIds: [] }
      });
    } catch (error) {
      console.error('Error saving simulation:', error);
      alert('حدث خطأ أثناء الحفظ.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المحاكاة؟')) {
      await deleteDoc(doc(db, 'simulations', id));
    }
  };

  const addComponentToCanvas = (type: string) => {
    const newComponent: SimulationComponent = {
      id: `comp_${Date.now()}`,
      type,
      x: 100,
      y: 100,
      rotation: 0,
      properties: {}
    };
    setFormData(prev => ({
      ...prev,
      components: [...(prev.components || []), newComponent]
    }));
  };

  const handleComponentDragEnd = (id: string, e: any, info: any) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components?.map(c => 
        c.id === id ? { ...c, x: c.x + info.offset.x, y: c.y + info.offset.y } : c
      )
    }));
  };

  return (
    <div className="space-y-6">
      {!showForm ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" /> إدارة المختبرات والمحاكاة التفاعلية
            </h3>
            <button
              onClick={() => {
                setEditingSim(null);
                setFormData({
                  titleAr: '', descriptionAr: '', type: 'CIRCUIT_BUILDER', difficulty: 'BEGINNER', status: 'DRAFT', components: [], rules: [], target: { targetType: 'EVERYONE', targetIds: [] }
                });
                setShowForm(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> إنشاء محاكاة جديدة
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="p-3">عنوان المحاكاة</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">المستوى</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">المكونات</th>
                  <th className="p-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {simulations.map((sim) => (
                  <tr key={sim.id}>
                    <td className="p-3 text-slate-900 dark:text-white">{sim.titleAr}</td>
                    <td className="p-3 text-indigo-600">{sim.type}</td>
                    <td className="p-3 text-slate-500">{sim.difficulty}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] ${sim.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {sim.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{sim.components?.length || 0}</td>
                    <td className="p-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingSim(sim);
                          setFormData(sim);
                          setShowForm(true);
                        }}
                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sim.id)}
                        className="p-1.5 rounded bg-red-100 dark:bg-red-950/30 hover:bg-red-200 text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[800px] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              {editingSim ? 'تعديل المحاكاة' : 'بناء محاكاة جديدة (Visual Builder)'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> حفظ
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar: Components Library */}
            <div className="w-64 bg-slate-50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-800 p-4 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">المكتبة</h4>
              <div className="space-y-2">
                {['Arduino UNO', 'ESP32', 'LED', 'Resistor', 'Battery', 'DC Motor', 'Servo Motor', 'Breadboard'].map(comp => (
                  <div
                    key={comp}
                    onClick={() => addComponentToCanvas(comp)}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:border-indigo-500 hover:shadow-md transition flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" />
                    {comp}
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Visual Canvas */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 flex items-center gap-4">
                 <input 
                    type="text" 
                    placeholder="اسم المحاكاة..."
                    value={formData.titleAr}
                    onChange={e => setFormData({...formData, titleAr: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold w-48"
                 />
                 <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as SimulationType})}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold"
                 >
                   <option value="CIRCUIT_BUILDER">Circuit Builder</option>
                   <option value="ARDUINO_LAB">Arduino Lab</option>
                   <option value="ROBOT_BUILDER">Robot Builder</option>
                   <option value="BLOCK_PROGRAMMING">Block Programming</option>
                 </select>
                 <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold"
                 >
                   <option value="DRAFT">مسودة</option>
                   <option value="PUBLISHED">منشور</option>
                   <option value="ARCHIVED">مؤرشف</option>
                 </select>
              </div>

              {/* Canvas Area */}
              <div 
                ref={canvasRef}
                className="flex-1 relative overflow-auto"
                style={{
                  backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              >
                {formData.components?.map(comp => (
                  <motion.div
                    key={comp.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(e, info) => handleComponentDragEnd(comp.id, e, info)}
                    initial={{ x: comp.x, y: comp.y }}
                    onClick={() => setSelectedComponent(comp)}
                    className={`absolute p-4 rounded-xl cursor-move shadow-lg font-bold text-xs flex flex-col items-center justify-center gap-2 border-2 ${
                      selectedComponent?.id === comp.id 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <Move className="w-4 h-4 text-slate-400" />
                    {comp.type}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Sidebar: Properties */}
            <div className="w-72 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 p-4">
              <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">خصائص العنصر</h4>
              {selectedComponent ? (
                <div className="space-y-4">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">النوع</div>
                    <div className="text-sm text-indigo-600 font-mono">{selectedComponent.type}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1">X</label>
                      <input type="number" value={Math.round(selectedComponent.x)} readOnly className="w-full bg-slate-100 dark:bg-slate-800 rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Y</label>
                      <input type="number" value={Math.round(selectedComponent.y)} readOnly className="w-full bg-slate-100 dark:bg-slate-800 rounded px-2 py-1" />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        components: prev.components?.filter(c => c.id !== selectedComponent.id)
                      }));
                      setSelectedComponent(null);
                    }}
                    className="w-full py-2 bg-red-100 text-red-600 rounded-xl font-bold text-xs hover:bg-red-200 transition"
                  >
                    حذف العنصر
                  </button>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 py-10">
                  اختر عنصر من مساحة العمل لعرض خصائصه
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
