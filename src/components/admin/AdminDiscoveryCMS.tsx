import React, { useState, useEffect } from 'react';
import { 
  Settings, Sliders, BarChart3, Plus, Trash2, Edit2, CheckCircle2, 
  HelpCircle, Eye, RefreshCw, Save, Layers, Sparkles, AlertCircle
} from 'lucide-react';
import { DiscoveryConfig, DiscoveryQuestion, DiscoveryQuestionOption } from '../../types';
import { 
  getDiscoveryConfig, saveDiscoveryConfig, 
  fetchDiscoveryAnalyticsFromFirestore, DEFAULT_DISCOVERY_CONFIG 
} from '../../services/discoveryService';

export const AdminDiscoveryCMS: React.FC = () => {
  const [config, setConfig] = useState<DiscoveryConfig>(DEFAULT_DISCOVERY_CONFIG);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'QUESTIONS' | 'RULES' | 'ANALYTICS'>('QUESTIONS');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<DiscoveryQuestion | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const loadedConfig = await getDiscoveryConfig();
      setConfig(loadedConfig);
      const analyticsData = await fetchDiscoveryAnalyticsFromFirestore();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading discovery config:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveDiscoveryConfig(config);
      setMessage({ text: 'تم حفظ إعدادات محرك الاستكشاف والتوصيات بنجاح!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'حدث خطأ أثناء حفظ التغييرات.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (qIndex: number, optIndex: number, field: keyof DiscoveryQuestionOption, value: string) => {
    const updated = { ...config };
    updated.questions[qIndex].options[optIndex] = {
      ...updated.questions[qIndex].options[optIndex],
      [field]: value
    };
    setConfig(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = { ...config };
    const newOptId = `opt-${Date.now()}`;
    updated.questions[qIndex].options.push({
      id: newOptId,
      textAr: 'خيار جديد',
      textEn: 'New Option',
      iconName: 'Sparkles',
      value: `option_${newOptId}`
    });
    setConfig(updated);
  };

  const handleDeleteOption = (qIndex: number, optIndex: number) => {
    const updated = { ...config };
    updated.questions[qIndex].options.splice(optIndex, 1);
    setConfig(updated);
  };

  // Analytics computation
  const totalStarted = analytics.filter(a => a.eventType === 'discovery_started').length;
  const totalCompleted = analytics.filter(a => a.eventType === 'discovery_completed').length;
  const completionRate = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

  // Most selected interests aggregation
  const interestCounts: Record<string, number> = {};
  analytics.forEach(a => {
    if (a.selectedInterests && Array.isArray(a.selectedInterests)) {
      a.selectedInterests.forEach((interest: string) => {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1;
      });
    }
  });

  const sortedInterests = Object.entries(interestCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">إدارة محرك الاستكشاف والتوصيات الذكية</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            تخصيص أسئلة الاستكشاف بالصفحة الرئيسية وقواعد محرك التوصيات الديناميكي بناءً على بيانات Firebase
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>حفظ التغييرات</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
          <AlertCircle className="w-5 h-5" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {[
          { id: 'QUESTIONS', label: 'أسئلة الاستكشاف', icon: HelpCircle },
          { id: 'RULES', label: 'قواعد وأوزان التوصية', icon: Sliders },
          { id: 'ANALYTICS', label: 'تحليلات الأداء', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-2xl font-extrabold text-sm flex items-center gap-2 transition-all cursor-pointer ${isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Questions Tab */}
      {activeTab === 'QUESTIONS' && (
        <div className="space-y-8">
          {(config.questions || []).map((question, qIdx) => (
            <div key={question.id} className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center">
                    Q{question.step}
                  </span>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">{question.titleAr}</h3>
                    <p className="text-xs text-slate-500 font-medium">{question.subtitleAr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.enabled}
                      onChange={(e) => {
                        const updated = { ...config };
                        updated.questions[qIdx].enabled = e.target.checked;
                        setConfig(updated);
                      }}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    مفعلة بالصفحة الرئيسية
                  </label>
                  <button
                    onClick={() => handleAddOption(qIdx)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة خيار</span>
                  </button>
                </div>
              </div>

              {/* Options list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(question.options || []).map((opt, optIdx) => (
                  <div key={opt.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative group">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">خيار #{optIdx + 1}</span>
                      <button
                        onClick={() => handleDeleteOption(qIdx, optIdx)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="حذف الخيار"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">النص بالعربية</label>
                        <input
                          type="text"
                          value={opt.textAr}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, 'textAr', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">النص بالإنجليزية</label>
                        <input
                          type="text"
                          value={opt.textEn}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, 'textEn', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendation Rules Tab */}
      {activeTab === 'RULES' && (
        <div className="space-y-6 max-w-2xl">
          <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-red-500" />
              أوزان معادلة التوصية الذكية
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              تحديد أولوية المعايير عند مطابقة الطالب مع دورات Firebase
            </p>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">وزن مطابقة السن (Age Match)</span>
                  <span className="text-red-600 font-black">{config.recommendationRules.ageWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.recommendationRules.ageWeight}
                  onChange={(e) => setConfig({
                    ...config,
                    recommendationRules: { ...config.recommendationRules, ageWeight: Number(e.target.value) }
                  })}
                  className="w-full accent-red-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">وزن مطابقة الاهتمامات (Interests Match)</span>
                  <span className="text-red-600 font-black">{config.recommendationRules.interestWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.recommendationRules.interestWeight}
                  onChange={(e) => setConfig({
                    ...config,
                    recommendationRules: { ...config.recommendationRules, interestWeight: Number(e.target.value) }
                  })}
                  className="w-full accent-red-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">وزن الأهداف (Goals Match)</span>
                  <span className="text-red-600 font-black">{config.recommendationRules.goalWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.recommendationRules.goalWeight}
                  onChange={(e) => setConfig({
                    ...config,
                    recommendationRules: { ...config.recommendationRules, goalWeight: Number(e.target.value) }
                  })}
                  className="w-full accent-red-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">حافز المقاعد المتاحة بـ Firebase (Class Availability Boost)</span>
                  <span className="text-red-600 font-black">+{config.recommendationRules.availabilityBoost} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={config.recommendationRules.availabilityBoost}
                  onChange={(e) => setConfig({
                    ...config,
                    recommendationRules: { ...config.recommendationRules, availabilityBoost: Number(e.target.value) }
                  })}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-8">
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500">عدد مرات بدء الاستكشاف</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{totalStarted}</h4>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500">عدد الإكتمالات الكاملة</p>
              <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{totalCompleted}</h4>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500">نسبة التحويل للإكتمال</p>
              <h4 className="text-3xl font-black text-red-600 dark:text-red-400 mt-2">{completionRate}%</h4>
            </div>
          </div>

          {/* Popular Interests */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-white">أكثر الاهتمامات اختياراً من الزوار</h3>
            {sortedInterests.length === 0 ? (
              <p className="text-xs text-slate-400">لا توجد تفاعلات مسجلة بعد.</p>
            ) : (
              <div className="space-y-3">
                {sortedInterests.map(([interest, count]) => (
                  <div key={interest} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{interest}</span>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-black text-xs rounded-full">
                      {count} اختيار
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
