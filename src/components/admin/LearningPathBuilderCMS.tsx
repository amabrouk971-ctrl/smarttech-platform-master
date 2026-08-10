import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, RefreshCw, 
  Save, Sliders, Layers, Sparkles, Eye, Play, ShieldAlert, ArrowUp, ArrowDown,
  Briefcase, Code2, Bot, Cpu, Gamepad2, Palette, Shield, Search, Filter, HelpCircle
} from 'lucide-react';
import { 
  LearningPath, Course, SpecializationInterest, RecommendationScoringWeights, 
  PathCourseRole, PathCourseSequenceItem, PathValidationResult 
} from '../../types';
import { 
  getLearningPathsFromFirestore, saveLearningPathToFirestore, deleteLearningPathFromFirestore,
  getInterestsFromFirestore, saveInterestToFirestore,
  getRecommendationRulesFromFirestore, saveRecommendationRulesToFirestore,
  seedFoundationAndPathsToFirestore, validateLearningPath,
  DEFAULT_SPECIALIZATION_INTERESTS, DEFAULT_RECOMMENDATION_WEIGHTS
} from '../../services/learningPathService';
import { generateRecommendations } from '../../services/recommendationEngine';

interface LearningPathBuilderCMSProps {
  courses: Course[];
}

export const LearningPathBuilderCMS: React.FC<LearningPathBuilderCMSProps> = ({ courses }) => {
  const [activeTab, setActiveTab] = useState<'PATHS' | 'INTERESTS' | 'RULES' | 'SIMULATOR'>('PATHS');
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [interests, setInterests] = useState<SpecializationInterest[]>([]);
  const [weights, setWeights] = useState<RecommendationScoringWeights>(DEFAULT_RECOMMENDATION_WEIGHTS);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Path Editing State
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [showPathModal, setShowPathModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Interest Editing State
  const [editingInterest, setEditingInterest] = useState<SpecializationInterest | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);

  // Simulator Test Profile State
  const [simAge, setSimAge] = useState<number>(10);
  const [simInterests, setSimInterests] = useState<string[]>(['Programming', 'Artificial Intelligence']);
  const [simGoals, setSimGoals] = useState<string[]>(['Build projects']);
  const [simCompletedCourses, setSimCompletedCourses] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const loadedPaths = await getLearningPathsFromFirestore();
      const loadedInterests = await getInterestsFromFirestore();
      const loadedRules = await getRecommendationRulesFromFirestore();

      setPaths(loadedPaths);
      setInterests(loadedInterests);
      setWeights(loadedRules);
    } catch (err) {
      console.error('Error loading path builder data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await seedFoundationAndPathsToFirestore();
      setMessage({
        text: `تم رفع وتحديث كورس الموظف الرقمي التأسيسي وعدد (${res.pathsCount}) مسارات احترافية في Firestore بنجاح!`,
        type: 'success'
      });
      await loadAllData();
    } catch (err) {
      setMessage({ text: 'حدث خطأ أثناء مزامنة المسارات مع Firestore.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // PATH BUILDER HANDLERS
  // =====================================
  const handleOpenNewPath = () => {
    const newPath: LearningPath = {
      id: `path-${Date.now()}`,
      titleAr: 'مسار تخصصي جديد',
      titleEn: 'New Learning Path',
      slug: `path-${Date.now()}`,
      ageRange: '6–16 سنة',
      targetAgeMin: 6,
      targetAgeMax: 16,
      descriptionAr: 'وصف المسار والأهداف البرمجية والتكنولوجية.',
      descriptionEn: 'Path description and outcomes.',
      color: '#3B82F6',
      iconName: 'Map',
      category: 'programming',
      interests: ['Programming'],
      difficulty: 'BEGINNER',
      foundationRequired: true,
      foundationCourseId: 'digital-employee',
      stages: [
        {
          id: `s-${Date.now()}-1`,
          titleAr: 'المرحلة الأولى: الموظف الرقمي والتأسيس',
          titleEn: 'Stage 1: Foundation',
          descriptionAr: 'تأسيس مهارات الحاسوب والإنتاجية الرقمية.',
          skills: ['Digital Employee', 'Computer Fundamentals']
        }
      ],
      courseSequence: [
        {
          courseId: 'digital-employee',
          stepNumber: 1,
          role: 'REQUIRED',
          reasonAr: 'التأسيس الرقمي الموحد لجميع المسارات.'
        }
      ],
      targetAudienceAr: 'الراغبون في تعلم المهارات الرقمية.',
      targetAudienceEn: 'Target audience description.',
      estimatedWeeks: 12,
      badgeReward: 'Tech Specialist 🎓',
      status: 'DRAFT',
      version: 1
    };
    setEditingPath(newPath);
    setShowPathModal(true);
  };

  const handleSavePath = async () => {
    if (!editingPath) return;

    // Validate path
    const valResult = validateLearningPath(editingPath, courses);
    if (!valResult.valid) {
      alert(`⚠️ تنبيهات صحة المسار:\n${valResult.errors.join('\n')}`);
    }

    setLoading(true);
    try {
      await saveLearningPathToFirestore(editingPath);
      setMessage({ text: 'تم حفظ المسار التخصصي وتحديثه في قاعدة البيانات بنجاح!', type: 'success' });
      setShowPathModal(false);
      await loadAllData();
    } catch (err) {
      setMessage({ text: 'خطأ أثناء حفظ المسار.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePath = async (pathId: string) => {
    if (!confirm('هل أنت تأكد من حذف هذا المسار التخصصي؟')) return;
    setLoading(true);
    try {
      await deleteLearningPathFromFirestore(pathId);
      setMessage({ text: 'تم حذف المسار بنجاح.', type: 'success' });
      await loadAllData();
    } catch (err) {
      setMessage({ text: 'خطأ أثناء حذف المسار.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Course sequence manipulation in modal
  const handleAddCourseToSequence = (courseId: string) => {
    if (!editingPath) return;
    const currentSeq = editingPath.courseSequence || [];
    if (currentSeq.some(s => s.courseId === courseId)) return; // prevent duplicate

    const newSeqItem: PathCourseSequenceItem = {
      courseId,
      stepNumber: currentSeq.length + 1,
      role: 'REQUIRED',
      reasonAr: 'خطوة تخصصية رئيسية في هذا المسار.'
    };

    setEditingPath({
      ...editingPath,
      courseSequence: [...currentSeq, newSeqItem]
    });
  };

  const handleRemoveCourseFromSequence = (courseId: string) => {
    if (!editingPath) return;
    const filtered = (editingPath.courseSequence || []).filter(s => s.courseId !== courseId);
    // re-index step numbers
    const reindexed = filtered.map((item, idx) => ({ ...item, stepNumber: idx + 1 }));
    setEditingPath({ ...editingPath, courseSequence: reindexed });
  };

  const handleMoveSequenceStep = (index: number, direction: 'UP' | 'DOWN') => {
    if (!editingPath || !editingPath.courseSequence) return;
    const seq = [...editingPath.courseSequence];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= seq.length) return;

    const temp = seq[index];
    seq[index] = seq[targetIdx];
    seq[targetIdx] = temp;

    const reindexed = seq.map((item, idx) => ({ ...item, stepNumber: idx + 1 }));
    setEditingPath({ ...editingPath, courseSequence: reindexed });
  };

  const handleChangeStepRole = (courseId: string, role: PathCourseRole) => {
    if (!editingPath || !editingPath.courseSequence) return;
    const updated = editingPath.courseSequence.map(s => 
      s.courseId === courseId ? { ...s, role } : s
    );
    setEditingPath({ ...editingPath, courseSequence: updated });
  };

  // =====================================
  // INTERESTS CMS HANDLERS
  // =====================================
  const handleSaveInterest = async () => {
    if (!editingInterest) return;
    setLoading(true);
    try {
      await saveInterestToFirestore(editingInterest);
      setMessage({ text: 'تم حفظ وتحديث مجال الاهتمام بنجاح!', type: 'success' });
      setShowInterestModal(false);
      await loadAllData();
    } catch (err) {
      setMessage({ text: 'خطأ أثناء حفظ مجال الاهتمام.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // SCORING RULES HANDLERS
  // =====================================
  const handleSaveRules = async () => {
    setLoading(true);
    try {
      await saveRecommendationRulesToFirestore(weights);
      setMessage({ text: 'تم حفظ أوزان معادلة التوصية الذكية في Firestore بنجاح!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'حدث خطأ أثناء حفظ قواعد التوصية.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // SIMULATOR RUNNER
  // =====================================
  const handleRunSimulation = () => {
    const result = generateRecommendations({
      age: simAge,
      interests: simInterests,
      goals: simGoals,
      courses,
      learningPaths: paths,
      completedCourseIds: simCompletedCourses,
      customWeights: weights
    });
    setSimulationResult(result);
  };

  // Validation check for active path modal
  const pathValidation = editingPath ? validateLearningPath(editingPath, courses) : null;

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Master Learning Path Engine CMS
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            مُحرك المسارات التعليمية والتوصية الديناميكية
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            إدارة مسارات التعلم التأسيسية (الموظف الرقمي)، الاهتمامات التخصصية، وقواعد معادلة التوصية الذكية.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDatabase}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            مزامنة الأساس والمسارات في Firestore
          </button>

          <button
            onClick={handleOpenNewPath}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إنشاء مسار تخصصي جديد
          </button>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
        }`}>
          <CheckCircle2 className="w-5 h-5" />
          {message.text}
        </div>
      )}

      {/* Admin Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('PATHS')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'PATHS'
              ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          المسارات التخصصية ({paths.length})
        </button>

        <button
          onClick={() => setActiveTab('INTERESTS')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'INTERESTS'
              ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          مجالات الاهتمامات ({interests.length})
        </button>

        <button
          onClick={() => setActiveTab('RULES')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'RULES'
              ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          أوزان التوصية الذكية
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'SIMULATOR'
              ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          محاكي تجربة الطالب Simulator
        </button>
      </div>

      {/* TAB 1: LEARNING PATHS CMS */}
      {activeTab === 'PATHS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم المسار أو التخصص..."
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">
              إجمالي المسارات: {paths.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths
              .filter(p => p.titleAr.includes(searchQuery) || p.titleEn.includes(searchQuery))
              .map((path) => {
                const val = validateLearningPath(path, courses);
                const isDigitalEmpPath = path.id.includes('digital-employee') || path.foundationRequired;

                return (
                  <div
                    key={path.id}
                    className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                          isDigitalEmpPath 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {isDigitalEmpPath ? 'الموظف الرقمي 🎓' : path.category || 'تخصصي'}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          path.status === 'PUBLISHED' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          {path.status || 'PUBLISHED'} (v{path.version || 1})
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {path.titleAr}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {path.descriptionAr}
                      </p>

                      {/* Validation Status Badge */}
                      {!val.valid && (
                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>تحذير: يوجد مشاكل صحة في خطة المسار</span>
                        </div>
                      )}

                      {/* Sequence Summary */}
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <span className="font-bold text-slate-400 block text-[10px]">
                          تسلسل الكورسات ({path.courseSequence?.length || 0}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {path.courseSequence?.slice(0, 3).map((seq, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                              {i + 1}. {courses.find(c => c.id === seq.courseId)?.titleAr || seq.courseId}
                            </span>
                          ))}
                          {(path.courseSequence?.length || 0) > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold">+المزيد</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setEditingPath(path);
                          setShowPathModal(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-amber-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> تعديل المسار
                      </button>

                      <button
                        onClick={() => handleDeletePath(path.id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: SPECIALIZATION INTERESTS CMS */}
      {activeTab === 'INTERESTS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              قائمة الاهتمامات المتاحة للاختيار في معالج الاستكشاف
            </h3>
            <button
              onClick={() => {
                setEditingInterest({
                  id: `int-${Date.now()}`,
                  nameAr: 'مجال اهتمام جديد',
                  nameEn: 'New Interest',
                  iconName: 'Sparkles',
                  color: '#3B82F6',
                  categoryTag: 'tech',
                  priority: interests.length + 1,
                  enabled: true,
                  assignedCourseIds: [],
                  assignedPathIds: []
                });
                setShowInterestModal(true);
              }}
              className="px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> إضافة مجال جديد
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {interests.map((interest) => (
              <div 
                key={interest.id}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black shadow-md"
                    style={{ backgroundColor: interest.color || '#3B82F6' }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    interest.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {interest.enabled ? 'مفعل' : 'معطل'}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {interest.nameAr}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {interest.nameEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>الأولوية: #{interest.priority}</span>
                  <button
                    onClick={() => {
                      setEditingInterest(interest);
                      setShowInterestModal(true);
                    }}
                    className="text-amber-500 font-bold hover:underline"
                  >
                    تعديل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RECOMMENDATION SCORING WEIGHTS */}
      {activeTab === 'RULES' && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              أوزان معادلة التوصية والتسلسل Multi-Factor Weights
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تحديد النقاط والأوزان الممنوحة للكورسات والمسارات عند حساب التوصية المناسبة لكل طالب.
            </p>

            <div className="space-y-4">
              {/* Interest Match Weight */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>وزن تطابق الاهتمامات (Interest Match Weight)</span>
                  <span className="text-amber-500 font-mono">+{weights.interestMatchWeight} نقطة</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.interestMatchWeight}
                  onChange={(e) => setWeights({ ...weights, interestMatchWeight: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Goal Match Weight */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>وزن تطابق الأهداف (Goal Match Weight)</span>
                  <span className="text-amber-500 font-mono">+{weights.goalMatchWeight} نقطة</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.goalMatchWeight}
                  onChange={(e) => setWeights({ ...weights, goalMatchWeight: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Age Match Weight */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>وزن الفئة العمرية (Age Match Weight)</span>
                  <span className="text-amber-500 font-mono">+{weights.ageMatchWeight} نقطة</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={weights.ageMatchWeight}
                  onChange={(e) => setWeights({ ...weights, ageMatchWeight: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Foundation Progression Weight */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>أولوية الموظف الرقمي التأسيسي (Digital Employee Boost)</span>
                  <span className="text-amber-500 font-mono">+{weights.foundationProgressionWeight} نقطة</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.foundationProgressionWeight}
                  onChange={(e) => setWeights({ ...weights, foundationProgressionWeight: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Prerequisite Match Weight */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>استيفاء المتطلبات السابقة (Prerequisites Met)</span>
                  <span className="text-amber-500 font-mono">+{weights.prerequisiteMatchWeight} نقطة</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={weights.prerequisiteMatchWeight}
                  onChange={(e) => setWeights({ ...weights, prerequisiteMatchWeight: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <button
              onClick={handleSaveRules}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> حفظ الأوزان في Firestore
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT EXPERIENCE SIMULATOR */}
      {activeTab === 'SIMULATOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-500" />
                تجهيز ملف الطالب الوهمي للتجربة
              </h3>

              {/* Age Slider */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  عمر الطالب: ({simAge} سنة)
                </label>
                <input
                  type="range"
                  min="5"
                  max="18"
                  value={simAge}
                  onChange={(e) => setSimAge(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Select Interests */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  الاهتمامات المختارة:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Programming', 'Artificial Intelligence', 'Robotics', 'Electronics', 'Creative Design'].map(int => {
                    const isSel = simInterests.includes(int);
                    return (
                      <button
                        key={int}
                        onClick={() => {
                          if (isSel) setSimInterests(simInterests.filter(i => i !== int));
                          else setSimInterests([...simInterests, int]);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          isSel ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {int}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Completed Courses Checkbox */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  الكورسات المكتملة سابقاً:
                </label>
                <button
                  onClick={() => {
                    if (simCompletedCourses.includes('digital-employee')) {
                      setSimCompletedCourses(simCompletedCourses.filter(c => c !== 'digital-employee'));
                    } else {
                      setSimCompletedCourses([...simCompletedCourses, 'digital-employee']);
                    }
                  }}
                  className={`w-full p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                    simCompletedCourses.includes('digital-employee')
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span>أتم كورس الموظف الرقمي التأسيسي (Digital Employee)</span>
                  {simCompletedCourses.includes('digital-employee') && <CheckCircle2 className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={handleRunSimulation}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> تشغيل المحاكاة واستخراج الخطة
              </button>
            </div>

            {/* Right Output Results */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 space-y-6">
              <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                نتيجة مخرجات التوصية الذكية
              </h3>

              {simulationResult ? (
                <div className="space-y-6 text-xs">
                  {/* Best Match */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950">
                      BEST MATCH - الكورس الأول
                    </span>
                    <h4 className="text-lg font-black text-white">
                      {simulationResult.bestMatch?.course.titleAr}
                    </h4>
                    <p className="text-slate-400 font-bold">
                      "{simulationResult.bestMatch?.reasonAr}"
                    </p>
                  </div>

                  {/* Course Sequence */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-400 block">تسلسل الكورسات الموصى به:</span>
                    <div className="space-y-2">
                      {simulationResult.courseSequence?.map((seq: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="font-bold text-amber-400">0{seq.stepNumber}. {seq.course.titleAr}</span>
                          <span className="text-[10px] text-slate-400">النقاط: {simulationResult.matchingScoreMap[seq.course.id]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-12">
                  اضغط على "تشغيل المحاكاة" لعرض الخطة الديناميكية والنتائج.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT PATH MODAL */}
      {showPathModal && editingPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <MapIcon className="w-5 h-5" /> تعديل المسار التخصصي ({editingPath.titleAr})
              </h3>
              <button onClick={() => setShowPathModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            {/* Path Validation Status Banner */}
            {pathValidation && (
              <div className={`p-4 rounded-2xl text-xs font-bold ${
                pathValidation.valid 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30 space-y-1'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{pathValidation.valid ? 'المسار متوافق ومكتمل صحياً' : 'تنبيهات جودة وتكامل المسار:'}</span>
                </div>
                {!pathValidation.valid && pathValidation.errors?.map((err, i) => (
                  <p key={i} className="text-[11px] font-normal">• {err}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">اسم المسار بالعربية</label>
                <input
                  type="text"
                  value={editingPath.titleAr}
                  onChange={(e) => setEditingPath({ ...editingPath, titleAr: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">اسم المسار بالإنجليزية</label>
                <input
                  type="text"
                  value={editingPath.titleEn}
                  onChange={(e) => setEditingPath({ ...editingPath, titleEn: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-bold">وصف المسار بالعربية</label>
                <textarea
                  value={editingPath.descriptionAr}
                  onChange={(e) => setEditingPath({ ...editingPath, descriptionAr: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 font-bold h-20"
                />
              </div>

              {/* Foundation Required Toggle */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-black text-slate-200 block">إلزامية كورس الموظف الرقمي التأسيسي (Digital Employee Foundation)</span>
                  <span className="text-[11px] text-slate-400">اشتراط إكمال الموظف الرقمي قبل الانتقال للمرحلة المتقدمة</span>
                </div>
                <input
                  type="checkbox"
                  checked={editingPath.foundationRequired !== false}
                  onChange={(e) => setEditingPath({ ...editingPath, foundationRequired: e.target.checked })}
                  className="w-5 h-5 accent-amber-500"
                />
              </div>
            </div>

            {/* Course Sequence Builder */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                تسلسل الكورسات المكونة للمسار (Course Sequence Manager)
              </h4>

              <div className="space-y-2">
                {editingPath.courseSequence?.map((step, idx) => {
                  const courseObj = courses.find(c => c.id === step.courseId);
                  return (
                    <div key={step.courseId} className="p-3 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                          0{step.stepNumber}
                        </span>
                        <div>
                          <span className="font-bold text-white block">
                            {courseObj?.titleAr || step.courseId}
                          </span>
                          <span className="text-[10px] text-slate-400">ID: {step.courseId}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Role Selector */}
                        <select
                          value={step.role}
                          onChange={(e) => handleChangeStepRole(step.courseId, e.target.value as PathCourseRole)}
                          className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-[11px] font-bold text-amber-400"
                        >
                          <option value="REQUIRED">إجباري (Required)</option>
                          <option value="RECOMMENDED">موصى به (Recommended)</option>
                          <option value="OPTIONAL">اختياري (Optional)</option>
                          <option value="ADVANCED">متقدم (Advanced)</option>
                        </select>

                        <button onClick={() => handleMoveSequenceStep(idx, 'UP')} className="p-1 text-slate-400 hover:text-white">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleMoveSequenceStep(idx, 'DOWN')} className="p-1 text-slate-400 hover:text-white">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRemoveCourseFromSequence(step.courseId)} className="p-1 text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Course Dropdown */}
              <div className="pt-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) handleAddCourseToSequence(e.target.value);
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300"
                >
                  <option value="">+ إدراج كورس إلى تسلسل المسار...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.titleAr} ({c.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button onClick={() => setShowPathModal(false)} className="px-5 py-2.5 rounded-2xl bg-slate-800 font-bold text-xs">
                إلغاء
              </button>
              <button onClick={handleSavePath} className="px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400">
                حفظ المسار التخصصي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INTEREST MODAL */}
      {showInterestModal && editingInterest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-base font-black text-amber-400">تعديل مجال الاهتمام</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم المجال بالعربية</label>
                <input
                  type="text"
                  value={editingInterest.nameAr}
                  onChange={(e) => setEditingInterest({ ...editingInterest, nameAr: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">اسم المجال بالإنجليزية</label>
                <input
                  type="text"
                  value={editingInterest.nameEn}
                  onChange={(e) => setEditingInterest({ ...editingInterest, nameEn: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الأولوية</label>
                <input
                  type="number"
                  value={editingInterest.priority}
                  onChange={(e) => setEditingInterest({ ...editingInterest, priority: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button onClick={() => setShowInterestModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">
                إلغاء
              </button>
              <button onClick={handleSaveInterest} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
