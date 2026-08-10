import React, { useState, useEffect } from 'react';
import { User, XPProfile, EmployeeGoal, GoalProgress } from '../../types';
import { getXPProfile, getEmployeeGoals, getGoalProgress } from '../../services/gamificationService';
import { Trophy, Target, Star, Activity, Zap } from 'lucide-react';

interface EmployeePerformanceProps {
  currentUser: User;
}

export const EmployeePerformance: React.FC<EmployeePerformanceProps> = ({ currentUser }) => {
  const [profile, setProfile] = useState<XPProfile | null>(null);
  const [goals, setGoals] = useState<(EmployeeGoal & { progress?: GoalProgress | null })[]>([]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    const p = await getXPProfile(currentUser.id, currentUser.role);
    setProfile(p);

    const g = await getEmployeeGoals();
    // Filter active goals applicable to this user/role
    const activeGoals = g.filter(goal => 
      goal.active && 
      (!goal.role || goal.role === currentUser.role) &&
      (!goal.employeeId || goal.employeeId === currentUser.id)
    );

    const goalsWithProgress = await Promise.all(activeGoals.map(async goal => {
      const progress = await getGoalProgress(currentUser.id, goal.id);
      return { ...goal, progress };
    }));

    setGoals(goalsWithProgress);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-emerald-400" /> My Performance
          </h2>
          <p className="text-sm text-slate-400 mt-1">Track your XP, goals, and achievements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Stats */}
        <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-emerald-500/30 flex items-center justify-center">
              <span className="text-3xl font-black text-white">{profile?.currentLevel || 1}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-xl">{currentUser.name}</h3>
              <p className="text-emerald-400 font-bold text-sm">{profile?.currentLevelTitle || 'Level 1'}</p>
            </div>
            <div className="w-full pt-4 border-t border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{profile?.totalXP || 0} XP</span>
                <span>{profile?.xpToNextLevel ? `${profile.xpToNextLevel} to next` : 'Max Level'}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${profile?.progressPercentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" /> Active Goals
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.length === 0 ? (
              <div className="sm:col-span-2 p-6 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-500 text-sm">
                No active goals assigned at the moment.
              </div>
            ) : (
              goals.map(goal => {
                const currentVal = goal.progress?.currentValue || 0;
                const percent = Math.min(100, Math.round((currentVal / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                    {goal.progress?.completed && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                        COMPLETED
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between items-start mb-2 pr-12">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400">{goal.goalType}</span>
                        <span className="text-amber-400 font-bold text-sm">+{goal.xpReward} XP</span>
                      </div>
                      <h4 className="font-bold text-white text-md leading-tight">{goal.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{goal.description}</p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-800/50">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-300">Progress</span>
                        <span className={goal.progress?.completed ? 'text-emerald-400' : 'text-slate-400'}>
                          {currentVal} / {goal.targetValue}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${goal.progress?.completed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
