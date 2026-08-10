import React, { useState, useEffect } from 'react';
import { GamificationLevel, GamificationRule, EmployeeGoal, Role } from '../../types';
import { getGamificationLevels, saveGamificationLevel, getGamificationRules, saveGamificationRule, getEmployeeGoals, saveEmployeeGoal } from '../../services/gamificationService';
import { Trophy, Star, Target, Settings, Save, Plus, Edit2, Trash2 } from 'lucide-react';

export const GamificationCMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'levels' | 'rules' | 'goals'>('levels');
  const [levels, setLevels] = useState<GamificationLevel[]>([]);
  const [rules, setRules] = useState<GamificationRule[]>([]);
  const [goals, setGoals] = useState<EmployeeGoal[]>([]);
  
  const [editingLevel, setEditingLevel] = useState<Partial<GamificationLevel> | null>(null);
  const [editingRule, setEditingRule] = useState<Partial<GamificationRule> | null>(null);
  const [editingGoal, setEditingGoal] = useState<Partial<EmployeeGoal> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const l = await getGamificationLevels();
    setLevels(l);
    const r = await getGamificationRules();
    setRules(r);
    const g = await getEmployeeGoals();
    setGoals(g);
  };

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel) return;
    try {
      const levelToSave = {
        ...editingLevel,
        id: editingLevel.id || `lvl-${Date.now()}`,
        active: editingLevel.active !== false
      } as GamificationLevel;
      await saveGamificationLevel(levelToSave);
      setEditingLevel(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Error saving level');
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    try {
      const ruleToSave = {
        ...editingRule,
        id: editingRule.id || `rule-${Date.now()}`,
        active: editingRule.active !== false
      } as GamificationRule;
      await saveGamificationRule(ruleToSave);
      setEditingRule(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Error saving rule');
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    try {
      const goalToSave = {
        ...editingGoal,
        id: editingGoal.id || `goal-${Date.now()}`,
        active: editingGoal.active !== false
      } as EmployeeGoal;
      await saveEmployeeGoal(goalToSave);
      setEditingGoal(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Error saving goal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-400" /> Gamification Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">Manage XP, Levels, Rules, and Goals for Customers and Employees.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('levels')}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'levels' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          <Trophy className="w-4 h-4 inline mr-1" /> Levels
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'rules' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          <Settings className="w-4 h-4 inline mr-1" /> XP Rules
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'goals' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          <Target className="w-4 h-4 inline mr-1" /> Employee Goals
        </button>
      </div>

      {activeTab === 'levels' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Configured Levels</h3>
            <button
              onClick={() => setEditingLevel({ role: Role.STUDENT, levelNumber: levels.length + 1, minXP: 100, active: true })}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Level
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {levels.map(l => (
              <div key={l.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">Level {l.levelNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${l.role === Role.STUDENT ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>{l.role}</span>
                  </div>
                  <h4 className="font-bold text-white text-lg">{l.title}</h4>
                  <p className="text-sm text-slate-400 font-mono mt-1">{l.minXP.toLocaleString()} XP</p>
                </div>
                <div className="mt-4 flex gap-2 justify-end">
                  <button onClick={() => setEditingLevel(l)} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingLevel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-white mb-4">{editingLevel.id ? 'Edit Level' : 'New Level'}</h3>
                <form onSubmit={handleSaveLevel} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target Role</label>
                    <select
                      value={editingLevel.role || Role.STUDENT}
                      onChange={e => setEditingLevel({...editingLevel, role: e.target.value as Role})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                    >
                      <option value={Role.STUDENT}>Student / Customer</option>
                      <option value={Role.ADMIN}>Employee / Admin</option>
                      <option value={Role.TEACHER}>Teacher</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Level Number</label>
                      <input
                        type="number"
                        required
                        value={editingLevel.levelNumber || ''}
                        onChange={e => setEditingLevel({...editingLevel, levelNumber: parseInt(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Minimum XP</label>
                      <input
                        type="number"
                        required
                        value={editingLevel.minXP || 0}
                        onChange={e => setEditingLevel({...editingLevel, minXP: parseInt(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Level Title (e.g., Novice, Expert)</label>
                    <input
                      type="text"
                      required
                      value={editingLevel.title || ''}
                      onChange={e => setEditingLevel({...editingLevel, title: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <button type="button" onClick={() => setEditingLevel(null)} className="px-4 py-2 bg-slate-800 text-white rounded-xl">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-xl flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">XP Triggers & Rules</h3>
            <button
              onClick={() => setEditingRule({ role: Role.STUDENT, active: true })}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map(r => (
              <div key={r.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.role === Role.STUDENT ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>{r.role}</span>
                    <span className="text-emerald-400 font-bold text-sm">+{r.xpAmount} XP</span>
                  </div>
                  <h4 className="font-bold text-white text-md">{r.description}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">Event: {r.eventType}</p>
                </div>
                <button onClick={() => setEditingRule(r)} className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {editingRule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-white mb-4">{editingRule.id ? 'Edit Rule' : 'New Rule'}</h3>
                <form onSubmit={handleSaveRule} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target Role</label>
                    <select
                      value={editingRule.role || Role.STUDENT}
                      onChange={e => setEditingRule({...editingRule, role: e.target.value as Role})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                    >
                      <option value={Role.STUDENT}>Student / Customer</option>
                      <option value={Role.ADMIN}>Employee / Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Event Type (e.g. COURSE_COMPLETED)</label>
                    <input
                      type="text"
                      required
                      value={editingRule.eventType || ''}
                      onChange={e => setEditingRule({...editingRule, eventType: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                    <input
                      type="text"
                      required
                      value={editingRule.description || ''}
                      onChange={e => setEditingRule({...editingRule, description: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">XP Amount</label>
                    <input
                      type="number"
                      required
                      value={editingRule.xpAmount || 0}
                      onChange={e => setEditingRule({...editingRule, xpAmount: parseInt(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <button type="button" onClick={() => setEditingRule(null)} className="px-4 py-2 bg-slate-800 text-white rounded-xl">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-xl flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Employee Goals</h3>
            <button
              onClick={() => setEditingGoal({ goalType: 'MONTHLY', active: true, targetValue: 10, xpReward: 500 })}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Goal
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(g => (
              <div key={g.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400">{g.goalType}</span>
                    <span className="text-amber-400 font-bold text-sm">+{g.xpReward} XP</span>
                  </div>
                  <h4 className="font-bold text-white text-lg">{g.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{g.description}</p>
                  <p className="text-sm font-bold text-emerald-400 mt-2">Target: {g.targetValue}</p>
                </div>
                <div className="mt-4 flex gap-2 justify-end">
                  <button onClick={() => setEditingGoal(g)} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingGoal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-white mb-4">{editingGoal.id ? 'Edit Goal' : 'New Goal'}</h3>
                <form onSubmit={handleSaveGoal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Goal Name</label>
                    <input
                      type="text"
                      required
                      value={editingGoal.name || ''}
                      onChange={e => setEditingGoal({...editingGoal, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                    <input
                      type="text"
                      required
                      value={editingGoal.description || ''}
                      onChange={e => setEditingGoal({...editingGoal, description: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Goal Type</label>
                      <select
                        value={editingGoal.goalType || 'MONTHLY'}
                        onChange={e => setEditingGoal({...editingGoal, goalType: e.target.value as any})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Target Value</label>
                      <input
                        type="number"
                        required
                        value={editingGoal.targetValue || 0}
                        onChange={e => setEditingGoal({...editingGoal, targetValue: parseInt(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">XP Reward</label>
                    <input
                      type="number"
                      required
                      value={editingGoal.xpReward || 0}
                      onChange={e => setEditingGoal({...editingGoal, xpReward: parseInt(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <button type="button" onClick={() => setEditingGoal(null)} className="px-4 py-2 bg-slate-800 text-white rounded-xl">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-xl flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
