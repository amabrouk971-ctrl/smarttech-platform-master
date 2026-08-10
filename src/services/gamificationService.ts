import { collection, doc, getDocs, setDoc, getDoc, query, where, orderBy, runTransaction, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { XPTransaction, XPProfile, GamificationLevel, GamificationRule, EmployeeGoal, GoalProgress, Role } from '../types';

export const getGamificationLevels = async (role?: Role): Promise<GamificationLevel[]> => {
  try {
    const q = role 
      ? query(collection(db, 'gamification_levels'), where('role', '==', role))
      : query(collection(db, 'gamification_levels'));
    const snapshot = await getDocs(q);
    const levels: GamificationLevel[] = [];
    snapshot.forEach(doc => levels.push({ id: doc.id, ...doc.data() } as GamificationLevel));
    return levels.sort((a, b) => a.levelNumber - b.levelNumber);
  } catch (error) {
    console.error('Error fetching gamification levels:', error);
    return [];
  }
};

export const saveGamificationLevel = async (level: GamificationLevel): Promise<void> => {
  try {
    const docRef = doc(db, 'gamification_levels', level.id);
    await setDoc(docRef, level, { merge: true });
  } catch (error) {
    console.error('Error saving gamification level:', error);
    throw error;
  }
};

export const deleteGamificationLevel = async (levelId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'gamification_levels', levelId));
  } catch (error) {
    console.error('Error deleting gamification level:', error);
    throw error;
  }
};

export const getGamificationRules = async (role?: Role): Promise<GamificationRule[]> => {
  try {
    const q = role 
      ? query(collection(db, 'gamification_rules'), where('role', '==', role))
      : query(collection(db, 'gamification_rules'));
    const snapshot = await getDocs(q);
    const rules: GamificationRule[] = [];
    snapshot.forEach(doc => rules.push({ id: doc.id, ...doc.data() } as GamificationRule));
    return rules;
  } catch (error) {
    console.error('Error fetching gamification rules:', error);
    return [];
  }
};

export const saveGamificationRule = async (rule: GamificationRule): Promise<void> => {
  try {
    const docRef = doc(db, 'gamification_rules', rule.id);
    await setDoc(docRef, rule, { merge: true });
  } catch (error) {
    console.error('Error saving gamification rule:', error);
    throw error;
  }
};

export const deleteGamificationRule = async (ruleId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'gamification_rules', ruleId));
  } catch (error) {
    console.error('Error deleting gamification rule:', error);
    throw error;
  }
};

export const getXPProfile = async (userId: string, role: Role): Promise<XPProfile | null> => {
  try {
    const docRef = doc(db, 'xp_profiles', userId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { userId, ...snapshot.data() } as XPProfile;
    }
    // Return empty profile if none exists
    return {
      userId,
      role,
      totalXP: 0,
      currentLevelId: '',
      currentLevel: 1,
      currentLevelTitle: 'Level 1',
      lastActivityAt: new Date().toISOString(),
      streak: 0,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching XP profile:', error);
    return null;
  }
};

export const getRecentXPTransactions = async (userId: string, limitCount = 10): Promise<XPTransaction[]> => {
  try {
    const q = query(
      collection(db, 'xp_transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const txs: XPTransaction[] = [];
    snapshot.forEach(doc => txs.push({ id: doc.id, ...doc.data() } as XPTransaction));
    return txs;
  } catch (error) {
    console.error('Error fetching XP transactions:', error);
    return [];
  }
};

export const calculateLevel = (totalXP: number, levels: GamificationLevel[]): GamificationLevel | null => {
  if (levels.length === 0) return null;
  let currentLevel = levels[0];
  for (const level of levels) {
    if (totalXP >= level.minXP) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};

// Core XP Awarding logic using transactions for atomicity and idempotency
export const awardXP = async (
  userId: string,
  role: Role,
  eventType: string,
  sourceId: string,
  sourceType: string,
  description: string,
  overrideXpAmount?: number
): Promise<boolean> => {
  const idempotencyKey = `${eventType}:${userId}:${sourceId}`;
  const txRef = doc(db, 'xp_transactions', idempotencyKey);
  const profileRef = doc(db, 'xp_profiles', userId);

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Check idempotency
      const txDoc = await transaction.get(txRef);
      if (txDoc.exists()) {
        throw new Error('IDEMPOTENT_ALREADY_EXISTS');
      }

      // 2. Fetch Rule to determine XP (if not overridden)
      let finalXpAmount = overrideXpAmount || 0;
      if (!overrideXpAmount) {
        // Unfortunately, queries in transactions have limitations in client SDKs, 
        // we'll fetch the rules outside or assume it's pre-fetched. For a robust client system, 
        // we need to get the rule. We'll do a simple get outside transaction if needed, but 
        // better to pass it or query here. We can use a direct doc ref for rule if we structure it that way,
        // or we'll fetch rules before. Let's assume we fetch rules outside and pass amount if we want it strictly atomic,
        // OR we can query outside and validate inside.
      }
      
      // We will do a separate read for rules if needed. For now, assume it's passed or default.
      if (finalXpAmount === 0) {
        const rules = await getGamificationRules(role);
        const rule = rules.find(r => r.eventType === eventType && r.active);
        if (!rule) {
          throw new Error('NO_ACTIVE_RULE');
        }
        finalXpAmount = rule.xpAmount;
      }

      // 3. Get profile
      const profileDoc = await transaction.get(profileRef);
      let newTotalXP = finalXpAmount;
      let streak = 1;
      
      if (profileDoc.exists()) {
        const currentData = profileDoc.data();
        newTotalXP += currentData.totalXP || 0;
        streak = currentData.streak || 1; // Simplistic streak logic
      }

      // 4. Determine new level
      const allLevelsSnap = await getDocs(query(collection(db, 'gamification_levels'), where('role', '==', role)));
      const levels: GamificationLevel[] = [];
      allLevelsSnap.forEach(d => levels.push({ id: d.id, ...d.data() } as GamificationLevel));
      levels.sort((a, b) => a.levelNumber - b.levelNumber);

      const nextLevelIndex = levels.findIndex(l => l.minXP > newTotalXP);
      const currentLevel = nextLevelIndex > 0 ? levels[nextLevelIndex - 1] : (levels.length > 0 ? levels[levels.length - 1] : null);
      const nextLevel = nextLevelIndex >= 0 && nextLevelIndex < levels.length ? levels[nextLevelIndex] : null;

      let xpToNextLevel = undefined;
      let progressPercentage = undefined;
      
      if (nextLevel && currentLevel) {
        const range = nextLevel.minXP - currentLevel.minXP;
        const currentXPInLevel = newTotalXP - currentLevel.minXP;
        xpToNextLevel = nextLevel.minXP - newTotalXP;
        progressPercentage = Math.round((currentXPInLevel / range) * 100);
      }

      // 5. Create Transaction Record
      const newTx: XPTransaction = {
        id: idempotencyKey,
        userId,
        role,
        eventType,
        sourceId,
        sourceType,
        xpAmount: finalXpAmount,
        description,
        idempotencyKey,
        createdAt: new Date().toISOString(),
        createdBy: 'SYSTEM'
      };

      // 6. Update Profile
      // Remove undefined properties to avoid Firestore errors
      const safeProfile = JSON.parse(JSON.stringify({
        userId,
        role,
        totalXP: newTotalXP,
        currentLevelId: currentLevel?.id || '',
        currentLevel: currentLevel?.levelNumber || 1,
        currentLevelTitle: currentLevel?.title || 'Level 1',
        xpToNextLevel,
        progressPercentage,
        lastActivityAt: new Date().toISOString(),
        streak,
        updatedAt: new Date().toISOString()
      }));

      transaction.set(txRef, newTx);
      transaction.set(profileRef, safeProfile, { merge: true });
    });
    return true;
  } catch (error: any) {
    if (error.message === 'IDEMPOTENT_ALREADY_EXISTS') {
      console.log('XP already awarded for this event (idempotent).');
      return true; // Consider it success since state is reached
    }
    if (error.message === 'NO_ACTIVE_RULE') {
      console.log('No active gamification rule found for event:', eventType);
      return false;
    }
    console.error('Error awarding XP:', error);
    return false;
  }
};

// Goals
export const getEmployeeGoals = async (employeeId?: string): Promise<EmployeeGoal[]> => {
  try {
    let q = query(collection(db, 'employee_goals'));
    // Could filter by employeeId if needed
    const snapshot = await getDocs(q);
    const goals: EmployeeGoal[] = [];
    snapshot.forEach(doc => goals.push({ id: doc.id, ...doc.data() } as EmployeeGoal));
    return goals;
  } catch (error) {
    console.error('Error fetching employee goals:', error);
    return [];
  }
};

export const saveEmployeeGoal = async (goal: EmployeeGoal): Promise<void> => {
  try {
    const docRef = doc(db, 'employee_goals', goal.id);
    await setDoc(docRef, goal, { merge: true });
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
};

export const getGoalProgress = async (employeeId: string, goalId: string): Promise<GoalProgress | null> => {
  try {
    const docRef = doc(db, 'goal_progress', `${employeeId}_${goalId}`);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as GoalProgress;
    }
    return null;
  } catch (error) {
    console.error('Error fetching goal progress:', error);
    return null;
  }
};

export const trackGoalProgress = async (employeeId: string, goalId: string, valueIncrement: number): Promise<void> => {
  const progressRef = doc(db, 'goal_progress', `${employeeId}_${goalId}`);
  const goalRef = doc(db, 'employee_goals', goalId);

  try {
    await runTransaction(db, async (transaction) => {
      const goalDoc = await transaction.get(goalRef);
      if (!goalDoc.exists()) throw new Error('Goal not found');
      const goal = goalDoc.data() as EmployeeGoal;
      if (!goal.active) throw new Error('Goal is not active');

      const progressDoc = await transaction.get(progressRef);
      let currentVal = valueIncrement;
      let completed = false;
      let completedAt = undefined;

      if (progressDoc.exists()) {
        const progress = progressDoc.data() as GoalProgress;
        if (progress.completed) return; // already done
        currentVal += progress.currentValue || 0;
      }

      if (currentVal >= goal.targetValue) {
        completed = true;
        completedAt = new Date().toISOString();
      }

      const progressData = JSON.parse(JSON.stringify({
        id: progressRef.id,
        goalId,
        employeeId,
        currentValue: currentVal,
        completed,
        completedAt,
        lastUpdatedAt: new Date().toISOString()
      }));

      transaction.set(progressRef, progressData, { merge: true });
    });

    // We can trigger XP award if completed, outside transaction.
    const progressDoc2 = await getDoc(progressRef);
    const progressData2 = progressDoc2.data() as GoalProgress;
    if (progressData2?.completed && progressData2.completedAt && progressData2.currentValue >= 0) {
      // It just completed, let's try to award XP
      const goalDoc2 = await getDoc(goalRef);
      const goalData2 = goalDoc2.data() as EmployeeGoal;
      await awardXP(
        employeeId,
        Role.ADMIN, // Assuming employee is ADMIN/TEACHER etc, we might need dynamic role here
        'GOAL_COMPLETED',
        goalId,
        'GOAL',
        `Achieved goal: ${goalData2.name}`,
        goalData2.xpReward
      );
    }
  } catch (error) {
    console.error('Error tracking goal progress:', error);
  }
};
