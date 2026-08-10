import React, { useState, useEffect } from 'react';
import { Course, CourseClass } from '../../types';
import { getClassesForCourse, saveClass, deleteClass } from '../../services/classService';
import { Calendar, Save, Trash2, Edit2, Plus, Clock, MapPin, Users } from 'lucide-react';

interface CourseClassesCMSProps {
  courses: Course[];
}

export const CourseClassesCMS: React.FC<CourseClassesCMSProps> = ({ courses }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingClass, setEditingClass] = useState<Partial<CourseClass> | null>(null);

  useEffect(() => {
    if (selectedCourseId) {
      loadClasses();
    }
  }, [selectedCourseId]);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const data = await getClassesForCourse(selectedCourseId);
      setClasses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    try {
      const classToSave: CourseClass = {
        ...(editingClass as CourseClass),
        courseId: selectedCourseId,
        id: editingClass.id || `cls-${Date.now()}`,
        createdAt: editingClass.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveClass(classToSave);
      setEditingClass(null);
      loadClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class');
    }
  };

  const handleDelete = async (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(classId);
        loadClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <Calendar className="w-8 h-8 text-emerald-400" />
        <div>
          <h2 className="text-2xl font-black text-white">Class & Schedule Management</h2>
          <p className="text-sm text-slate-400">Manage cohorts, capacity, and scheduling for your courses.</p>
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

        {selectedCourseId && (
          <div className="pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Classes / Cohorts</h3>
              <button
                onClick={() => setEditingClass({
                  name: '',
                  capacity: 20,
                  enrolledCount: 0,
                  startDate: '',
                  endDate: '',
                  registrationDeadline: '',
                  timeSlot: 'MORNING',
                  days: ['SATURDAY'],
                  deliveryMode: 'IN_PERSON',
                  status: 'PUBLISHED'
                })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Class
              </button>
            </div>

            {isLoading ? (
              <div className="text-slate-400 py-8 text-center">Loading classes...</div>
            ) : classes.length === 0 ? (
              <div className="text-slate-400 py-8 text-center bg-slate-950 rounded-xl border border-slate-800">
                No classes found for this course.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map(c => (
                  <div key={c.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-emerald-400 text-lg">{c.name}</h4>
                        <div className="flex items-center gap-2 text-xs font-bold mt-1">
                          <span className={`px-2 py-0.5 rounded ${c.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingClass(c)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-950 hover:bg-red-900 text-red-400 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mt-2">
                      <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> Start: {c.startDate}</div>
                      <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {c.timeSlot}</div>
                      <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {c.deliveryMode}</div>
                      <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-500" /> Seats: {c.capacity - (c.enrolledCount || 0)} / {c.capacity}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 my-8">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingClass.id ? 'Edit Class' : 'Create New Class'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Class Name</label>
                  <input
                    type="text"
                    required
                    value={editingClass.name || ''}
                    onChange={e => setEditingClass({...editingClass, name: e.target.value})}
                    placeholder="e.g. Cohort A, Saturday Morning"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Total Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingClass.capacity || 20}
                    onChange={e => setEditingClass({...editingClass, capacity: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={editingClass.startDate || ''}
                    onChange={e => setEditingClass({...editingClass, startDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingClass.endDate || ''}
                    onChange={e => setEditingClass({...editingClass, endDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={editingClass.timeSlot || 'MORNING'}
                    onChange={e => setEditingClass({...editingClass, timeSlot: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                  >
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                    <option value="EVENING">Evening</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                
                {editingClass.timeSlot === 'CUSTOM' && (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-300 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={editingClass.customStartTime || ''}
                        onChange={e => setEditingClass({...editingClass, customStartTime: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-300 mb-1">End Time</label>
                      <input
                        type="time"
                        value={editingClass.customEndTime || ''}
                        onChange={e => setEditingClass({...editingClass, customEndTime: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Delivery Mode</label>
                  <select
                    value={editingClass.deliveryMode || 'IN_PERSON'}
                    onChange={e => setEditingClass({...editingClass, deliveryMode: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                  >
                    <option value="IN_PERSON">In Person</option>
                    <option value="ONLINE">Online</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={editingClass.status || 'PUBLISHED'}
                    onChange={e => setEditingClass({...editingClass, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published (Visible)</option>
                    <option value="OPEN_FOR_ENROLLMENT">Open for Enrollment</option>
                    <option value="FULL">Full</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                
                {editingClass.deliveryMode === 'ONLINE' || editingClass.deliveryMode === 'HYBRID' ? (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Online Meeting Link (Private until enrolled)</label>
                    <input
                      type="url"
                      value={editingClass.meetingLink || ''}
                      onChange={e => setEditingClass({...editingClass, meetingLink: e.target.value})}
                      placeholder="https://zoom.us/j/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                ) : null}
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
