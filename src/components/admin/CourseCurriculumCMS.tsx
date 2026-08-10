import React, { useState, useEffect } from 'react';
import { Course, CourseUnit, CourseLesson } from '../../types';
import { getCurriculumForCourse, saveCurriculumUnit, deleteCurriculumUnit } from '../../services/curriculumService';
import { FileText, Save, Trash2, Edit2, Plus, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

interface CourseCurriculumCMSProps {
  courses: Course[];
}

export const CourseCurriculumCMS: React.FC<CourseCurriculumCMSProps> = ({ courses }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [units, setUnits] = useState<CourseUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUnit, setEditingUnit] = useState<CourseUnit | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedCourseId) {
      loadCurriculum();
    }
  }, [selectedCourseId]);

  const loadCurriculum = async () => {
    setIsLoading(true);
    try {
      const data = await getCurriculumForCourse(selectedCourseId);
      setUnits(data);
      // Expand all by default
      const exp: Record<string, boolean> = {};
      data.forEach(u => exp[u.id] = true);
      setExpandedUnits(exp);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedUnits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveUnit = async () => {
    if (!editingUnit) return;
    try {
      const unitToSave: CourseUnit = {
        ...editingUnit,
        courseId: selectedCourseId,
        id: editingUnit.id || `unit-${Date.now()}`,
        lessons: editingUnit.lessons || []
      };
      await saveCurriculumUnit(unitToSave);
      setEditingUnit(null);
      loadCurriculum();
    } catch (error) {
      console.error('Error saving unit:', error);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await deleteCurriculumUnit(unitId);
        loadCurriculum();
      } catch (error) {
        console.error('Error deleting unit:', error);
      }
    }
  };

  const handleAddLesson = () => {
    if (!editingUnit) return;
    const newLesson: CourseLesson = {
      id: `les-${Date.now()}`,
      unitId: editingUnit.id,
      titleAr: '',
      type: 'LESSON',
      order: editingUnit.lessons ? editingUnit.lessons.length : 0
    };
    setEditingUnit({
      ...editingUnit,
      lessons: [...(editingUnit.lessons || []), newLesson]
    });
  };

  const updateLesson = (index: number, updates: Partial<CourseLesson>) => {
    if (!editingUnit || !editingUnit.lessons) return;
    const newLessons = [...editingUnit.lessons];
    newLessons[index] = { ...newLessons[index], ...updates };
    setEditingUnit({ ...editingUnit, lessons: newLessons });
  };

  const removeLesson = (index: number) => {
    if (!editingUnit || !editingUnit.lessons) return;
    const newLessons = [...editingUnit.lessons];
    newLessons.splice(index, 1);
    setEditingUnit({ ...editingUnit, lessons: newLessons });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <FileText className="w-8 h-8 text-emerald-400" />
        <div>
          <h2 className="text-2xl font-black text-white">Curriculum Management</h2>
          <p className="text-sm text-slate-400">Manage course units, lessons, projects, and assessments.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Select Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- Select a Course --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.titleAr} ({c.code})</option>
            ))}
          </select>
        </div>

        {selectedCourseId && !editingUnit && (
          <div className="pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Curriculum Structure</h3>
              <button
                onClick={() => setEditingUnit({
                  id: '',
                  courseId: selectedCourseId,
                  titleAr: '',
                  order: units.length,
                  isVisible: true,
                  lessons: []
                })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Unit
              </button>
            </div>

            {isLoading ? (
              <div className="text-slate-400 py-8 text-center">Loading curriculum...</div>
            ) : units.length === 0 ? (
              <div className="text-slate-400 py-8 text-center bg-slate-950 rounded-xl border border-slate-800">
                No curriculum defined for this course yet.
              </div>
            ) : (
              <div className="space-y-4">
                {units.map(unit => (
                  <div key={unit.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition"
                      onClick={() => toggleExpand(unit.id)}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-slate-600 cursor-grab" />
                        <h4 className="font-bold text-emerald-400 text-lg">
                          Unit {unit.order + 1}: {unit.titleAr}
                        </h4>
                        {!unit.isVisible && (
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded">Hidden</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingUnit(unit); }} 
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id); }} 
                          className="p-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedUnits[unit.id] ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                      </div>
                    </div>
                    
                    {expandedUnits[unit.id] && unit.lessons && unit.lessons.length > 0 && (
                      <div className="p-4 pt-0 border-t border-slate-800 bg-slate-950/50">
                        <div className="space-y-2 mt-4 pl-8">
                          {unit.lessons.map((lesson, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                              <span className="text-slate-500 text-xs w-6">{idx + 1}.</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                lesson.type === 'PROJECT' ? 'bg-purple-500/20 text-purple-400' :
                                lesson.type === 'ASSESSMENT' ? 'bg-red-500/20 text-red-400' :
                                lesson.type === 'ACTIVITY' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-800 text-slate-300'
                              }`}>
                                {lesson.type}
                              </span>
                              <span className="text-sm font-bold text-slate-200">{lesson.titleAr}</span>
                              {lesson.durationMinutes && (
                                <span className="text-xs text-slate-500 ml-auto">{lesson.durationMinutes} min</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Unit Mode */}
        {editingUnit && (
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingUnit.id ? 'Edit Unit' : 'Create New Unit'}
              </h3>
              <button
                onClick={() => setEditingUnit(null)}
                className="text-sm text-slate-400 hover:text-white"
              >
                Back to Curriculum
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Unit Title</label>
                  <input
                    type="text"
                    value={editingUnit.titleAr}
                    onChange={e => setEditingUnit({...editingUnit, titleAr: e.target.value})}
                    placeholder="e.g. Introduction to Robotics"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Order (Sequence)</label>
                  <input
                    type="number"
                    value={editingUnit.order}
                    onChange={e => setEditingUnit({...editingUnit, order: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                  />
                </div>
                
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUnit.isVisible}
                      onChange={e => setEditingUnit({...editingUnit, isVisible: e.target.checked})}
                      className="w-5 h-5 accent-emerald-500 rounded bg-slate-800"
                    />
                    <span className="text-sm font-bold text-slate-300">Visible to Public</span>
                  </label>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl p-4 bg-slate-950">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white">Lessons & Content</h4>
                  <button
                    onClick={handleAddLesson}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Lesson
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(!editingUnit.lessons || editingUnit.lessons.length === 0) && (
                    <div className="text-center py-4 text-slate-500 text-xs">No lessons added yet.</div>
                  )}
                  {editingUnit.lessons?.map((lesson, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                      <GripVertical className="w-4 h-4 text-slate-600 cursor-grab shrink-0" />
                      <select
                        value={lesson.type}
                        onChange={e => updateLesson(idx, { type: e.target.value as any })}
                        className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white shrink-0"
                      >
                        <option value="LESSON">Lesson</option>
                        <option value="ACTIVITY">Activity</option>
                        <option value="PROJECT">Project</option>
                        <option value="ASSESSMENT">Assessment</option>
                      </select>
                      <input
                        type="text"
                        value={lesson.titleAr}
                        onChange={e => updateLesson(idx, { titleAr: e.target.value })}
                        placeholder="Lesson title..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white min-w-0"
                      />
                      <input
                        type="number"
                        value={lesson.durationMinutes || ''}
                        onChange={e => updateLesson(idx, { durationMinutes: parseInt(e.target.value) })}
                        placeholder="Mins"
                        className="w-16 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white shrink-0"
                      />
                      <button
                        onClick={() => removeLesson(idx)}
                        className="p-2 text-slate-500 hover:text-red-400 rounded shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleSaveUnit}
                  disabled={!editingUnit.titleAr}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Unit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
