import React, { useState } from 'react';
import { Course } from '../../types';
import { Plus, Edit2, Trash2, Save, X, BookOpen, Clock, Tag } from 'lucide-react';
import { saveCourseToFirestore, deleteCourseFromFirestore } from '../../services/firebaseService';

interface AdminCoursesCMSProps {
  courses: Course[];
}

export const AdminCoursesCMS: React.FC<AdminCoursesCMSProps> = ({ courses }) => {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Course>>({
    titleAr: '',
    originalPrice: 1500,
    discountPrice: 1200,
    category: 'programming',
    ageMin: 6,
    ageMax: 12,
    mode: 'Hybrid',
    code: 'NEW-101'
  });

  const handleSave = async (courseToSave: Course | Partial<Course>) => {
    try {
      const isNew = !courseToSave.id;
      const courseId = isNew ? `course-${Date.now()}` : courseToSave.id!;
      const fullCourse: Course = {
        ...(isNew ? {
          id: courseId,
          title: courseToSave.titleAr || 'Untitled',
          description: 'No description',
          descriptionAr: '',
          duration: '12 weeks',
          lessons: 12,
          students: 0,
          rating: 5.0,
          image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80',
          features: [],
          skills: [],
          instructor: 'TBD',
          curriculum: [],
          status: 'ACTIVE'
        } : (editingCourse as Course)),
        ...courseToSave,
        id: courseId
      } as Course;
      
      await saveCourseToFirestore(fullCourse);
      
      if (isNew) {
        setShowAddForm(false);
      } else {
        setEditingCourse(null);
      }
      
      // Need a way to refresh courses in parent or here
      alert('تم حفظ الكورس بنجاح في قاعدة البيانات. قم بتحديث الصفحة لرؤية التغييرات.');
      
    } catch (err) {
      console.error(err);
      alert('Error saving course');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكورس نهائياً من قاعدة البيانات؟')) {
      await deleteCourseFromFirestore(id);
      alert('تم الحذف بنجاح. قم بتحديث الصفحة.');
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="flex items-center justify-between bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BookOpen className="text-red-500 w-6 h-6" />
            إدارة الكورسات الرئيسية
          </h2>
          <p className="text-slate-400 text-sm mt-1">إضافة، تعديل، وتسعير الكورسات</p>
        </div>
        <button 
          onClick={() => {
            setShowAddForm(true);
            setFormData({
              titleAr: '',
              originalPrice: 1500,
              discountPrice: 1200,
              category: 'programming',
              ageMin: 6,
              ageMax: 12,
              mode: 'Hybrid',
              code: `C-${Date.now().toString().slice(-4)}`
            });
          }}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة كورس جديد
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold">كورس جديد</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم الكورس (عربي)</label>
              <input 
                type="text" 
                value={formData.titleAr || ''}
                onChange={(e) => setFormData({...formData, titleAr: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">كود الكورس</label>
              <input 
                type="text" 
                value={formData.code || ''}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">التصنيف</label>
              <select
                value={formData.category || 'programming'}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
              >
                <option value="programming">برمجة</option>
                <option value="robotics">روبوتكس</option>
                <option value="ai">ذكاء اصطناعي</option>
                <option value="design">تصميم 3D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">السعر الأساسي</label>
              <input 
                type="number" 
                value={formData.originalPrice || 0}
                onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">السعر بعد الخصم</label>
              <input 
                type="number" 
                value={formData.discountPrice || 0}
                onChange={(e) => setFormData({...formData, discountPrice: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => handleSave(formData)}
                className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700"
              >
                حفظ وإنشاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                <img src={course.image} alt={course.titleAr} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-md">
                    {course.code || 'NO-CODE'}
                  </span>
                  <h3 className="font-bold text-lg">{course.titleAr}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Tag className="w-4 h-4"/> {course.category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {course.duration}</span>
                  <span className="font-bold text-red-500">{course.discountPrice} ج.م</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setEditingCourse(course)}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleDelete(course.id)}
                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            لا توجد كورسات حالياً.
          </div>
        )}
      </div>

    </div>
  );
};
