import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { AnalyticsEngine } from '../engines/AnalyticsEngine';
import type { Expense, Budget, Goal, Subscription, AnalyticsSummary } from '../engines/AnalyticsEngine';
import { ProfileEngine } from '../engines/ProfileEngine';
import type { UserProfileData } from '../engines/ProfileEngine';
import { RuleEngine } from '../engines/RuleEngine';
import type { AlertMessage } from '../engines/RuleEngine';

interface FinanceContextType {
  expenses: Expense[];
  budgets: Budget[];
  goals: Goal[];
  subscriptions: Subscription[];
  alerts: AlertMessage[];
  suggestions: string[];
  profile: UserProfileData | null;
  analytics: AnalyticsSummary | null;
  loading: boolean;
  
  // CRUD Operations
  addExpense: (expense: Omit<Expense, 'expenseId' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (expenseId: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  
  addBudget: (budget: Omit<Budget, 'budgetId' | 'userId'>) => Promise<void>;
  updateBudget: (budgetId: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;
  
  addGoal: (goal: Omit<Goal, 'goalId' | 'userId' | 'createdAt'>) => Promise<void>;
  updateGoal: (goalId: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userData, refreshUserData } = useAuth();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Core background sync and calculation hook
  useEffect(() => {
    if (!user || !userData) {
      setExpenses([]);
      setBudgets([]);
      setGoals([]);
      setSubscriptions([]);
      setAlerts([]);
      setSuggestions([]);
      setProfile(null);
      setAnalytics(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userId = user.uid;

    // Set up real-time listeners
    const qExpenses = query(collection(db, 'expenses'), where('userId', '==', userId));
    const qBudgets = query(collection(db, 'budgets'), where('userId', '==', userId));
    const qGoals = query(collection(db, 'goals'), where('userId', '==', userId));
    const qSubscriptions = query(collection(db, 'subscriptions'), where('userId', '==', userId));

    let expensesLoaded = false;
    let budgetsLoaded = false;
    let goalsLoaded = false;
    let subsLoaded = false;

    const checkLoadingFinished = () => {
      if (expensesLoaded && budgetsLoaded && goalsLoaded && subsLoaded) {
        setLoading(false);
      }
    };

    const unsubExpenses = onSnapshot(qExpenses, (snap) => {
      const list: Expense[] = [];
      snap.forEach((doc) => {
        list.push({ expenseId: doc.id, ...doc.data() } as Expense);
      });
      // Sort desc by date
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpenses(list);
      expensesLoaded = true;
      checkLoadingFinished();
    });

    const unsubBudgets = onSnapshot(qBudgets, (snap) => {
      const list: Budget[] = [];
      snap.forEach((doc) => {
        list.push({ budgetId: doc.id, ...doc.data() } as Budget);
      });
      setBudgets(list);
      budgetsLoaded = true;
      checkLoadingFinished();
    });

    const unsubGoals = onSnapshot(qGoals, (snap) => {
      const list: Goal[] = [];
      snap.forEach((doc) => {
        list.push({ goalId: doc.id, ...doc.data() } as Goal);
      });
      setGoals(list);
      goalsLoaded = true;
      checkLoadingFinished();
    });

    const unsubSubs = onSnapshot(qSubscriptions, (snap) => {
      const list: Subscription[] = [];
      snap.forEach((doc) => {
        list.push({ subscriptionId: doc.id, ...doc.data() } as Subscription);
      });
      setSubscriptions(list);
      subsLoaded = true;
      checkLoadingFinished();
    });

    return () => {
      unsubExpenses();
      unsubBudgets();
      unsubGoals();
      unsubSubs();
    };
  }, [user, !!userData]);

  // Hook for computing metrics whenever data updates
  useEffect(() => {
    if (!user || !userData || loading) return;

    const performCalcs = async () => {
      const income = userData?.monthlyIncome || 0;
      const createdAt = userData?.createdAt?.toDate ? userData.createdAt.toDate() : new Date();

      // 1. Run Analytics Engine
      const summary = AnalyticsEngine.analyze(expenses, income);
      setAnalytics(summary);

      // 2. Run Profile Engine
      const userProfile = ProfileEngine.calculateProfile(
        expenses, 
        budgets, 
        goals, 
        income, 
        createdAt,
        userData?.occupation || '',
        !!userData?.isStudent
      );
      setProfile(userProfile);

      // 3. Run Rule Engine
      const { alerts: evaluatedAlerts, suggestions: evaluatedSuggestions } = RuleEngine.evaluate(
        expenses,
        budgets,
        goals,
        income,
        userProfile.savingsRate
      );
      setAlerts(evaluatedAlerts);
      setSuggestions(evaluatedSuggestions);

      // 4. Budget progress linking (spentAmount calculation)
      const now = new Date();
      const curMonth = now.getMonth() + 1;
      const curYear = now.getFullYear();

      const batch = writeBatch(db);
      let budgetsUpdated = false;

      budgets.forEach(b => {
        if (b.month === curMonth && b.year === curYear) {
          const actualSpent = summary.categorySpending[b.category] || 0;
          if (b.spentAmount !== actualSpent) {
            budgetsUpdated = true;
            const bRef = doc(db, 'budgets', b.budgetId);
            batch.update(bRef, {
              spentAmount: actualSpent,
              remainingAmount: Math.max(0, b.monthlyLimit - actualSpent)
            });
          }
        }
      });

      // 5. Subscription Auto-detection write sync
      let subsUpdated = false;
      summary.detectedSubscriptions.forEach(ds => {
        // If not already in subscriptions list
        const exists = subscriptions.some(s => s.merchantName.toLowerCase() === ds.merchantName.toLowerCase() && Math.round(s.recurringAmount) === Math.round(ds.recurringAmount));
        if (!exists) {
          subsUpdated = true;
          const subRef = doc(collection(db, 'subscriptions'));
          batch.set(subRef, {
            ...ds,
            userId: user.uid,
            subscriptionId: subRef.id
          });
        }
      });

      // 6. Update user's Health Score & Personality on user doc
      if (userData?.financialHealthScore !== userProfile.healthScore || userData?.financialPersonality !== userProfile.personality) {
        const userRef = doc(db, 'users', user.uid);
        batch.update(userRef, {
          financialHealthScore: userProfile.healthScore,
          financialPersonality: userProfile.personality
        });
        setTimeout(() => refreshUserData(), 1500); // refresh auth state safely
      }

      // 7. Update AI Profile memory doc
      const profileRef = doc(db, 'user_profile', user.uid);
      batch.set(profileRef, {
        userId: user.uid,
        personality: userProfile.personality,
        healthScore: userProfile.healthScore,
        savingsRate: userProfile.savingsRate,
        topCategory: userProfile.topCategory,
        largestWeakness: userProfile.largestWeakness,
        strongestHabit: userProfile.strongestHabit,
        goalPriority: userProfile.goalPriority,
        budgetDiscipline: userProfile.budgetDiscipline,
        goalCommitment: userProfile.goalCommitment,
        riskLevel: userProfile.riskLevel,
        aiConfidence: userProfile.aiConfidence,
        lastUpdated: serverTimestamp()
      });

      // Create snapshot on monthly shifts or once a month
      const snapRef = doc(db, 'analytics_snapshots', `${user.uid}_${curMonth}_${curYear}`);
      const activeGoals = goals.filter(g => g.status === 'active');
      const goalProgress = activeGoals.length > 0 ? (activeGoals.reduce((sum, g) => sum + (g.savedAmount/g.targetAmount), 0) / activeGoals.length) * 100 : 0;
      
      batch.set(snapRef, {
        userId: user.uid,
        month: curMonth,
        year: curYear,
        totalSpent: summary.currentMonthSpent,
        totalSaved: Math.max(0, income - summary.currentMonthSpent),
        topCategory: userProfile.topCategory,
        healthScore: userProfile.healthScore,
        savingsRate: userProfile.savingsRate,
        goalProgress: goalProgress
      });

      if (budgetsUpdated || subsUpdated) {
        await batch.commit();
      }
    };

    performCalcs();
  }, [expenses, budgets, goals, loading, userData]);

  // --- EXPENSE CRUD ---
  const addExpense = async (exp: Omit<Expense, 'expenseId' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const ref = doc(collection(db, 'expenses'));
    await setDoc(ref, {
      ...exp,
      expenseId: ref.id,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const updateExpense = async (expenseId: string, exp: Partial<Expense>) => {
    const ref = doc(db, 'expenses', expenseId);
    await updateDoc(ref, {
      ...exp,
      updatedAt: serverTimestamp()
    });
  };

  const deleteExpense = async (expenseId: string) => {
    const ref = doc(db, 'expenses', expenseId);
    await deleteDoc(ref);
  };

  // --- BUDGET CRUD ---
  const addBudget = async (b: Omit<Budget, 'budgetId' | 'userId'>) => {
    if (!user) return;
    const ref = doc(collection(db, 'budgets'));
    await setDoc(ref, {
      ...b,
      budgetId: ref.id,
      userId: user.uid,
      spentAmount: 0,
      remainingAmount: b.monthlyLimit
    });
  };

  const updateBudget = async (budgetId: string, budget: Partial<Budget>) => {
    const ref = doc(db, 'budgets', budgetId);
    await updateDoc(ref, budget);
  };

  const deleteBudget = async (budgetId: string) => {
    const ref = doc(db, 'budgets', budgetId);
    await deleteDoc(ref);
  };

  // --- GOAL CRUD ---
  const addGoal = async (g: Omit<Goal, 'goalId' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const ref = doc(collection(db, 'goals'));
    await setDoc(ref, {
      ...g,
      goalId: ref.id,
      userId: user.uid,
      createdAt: serverTimestamp()
    });
  };

  const updateGoal = async (goalId: string, goal: Partial<Goal>) => {
    const ref = doc(db, 'goals', goalId);
    await updateDoc(ref, goal);
  };

  const deleteGoal = async (goalId: string) => {
    const ref = doc(db, 'goals', goalId);
    await deleteDoc(ref);
  };

  return (
    <FinanceContext.Provider value={{
      expenses,
      budgets,
      goals,
      subscriptions,
      alerts,
      suggestions,
      profile,
      analytics,
      loading,
      addExpense,
      updateExpense,
      deleteExpense,
      addBudget,
      updateBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
