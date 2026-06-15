import type { Expense, Budget, Goal } from './AnalyticsEngine';

export interface UserProfileData {
  personality: string;
  healthScore: number;
  savingsRate: number;
  topCategory: string;
  largestWeakness: string;
  strongestHabit: string;
  goalPriority: string;
  budgetDiscipline: string;
  goalCommitment: string;
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
  aiConfidence: number;
  aiConfidenceLabel: 'Learning' | 'Understanding' | 'Personalized' | 'Highly Personalized';
  daysRegistered: number;
}

export class ProfileEngine {
  static calculateProfile(
    expenses: Expense[],
    budgets: Budget[],
    goals: Goal[],
    income: number,
    createdAtDate: Date,
    occupation: string = '',
    isStudent: boolean = false
  ): UserProfileData {
    const now = new Date();
    
    // Calculate active learning/tracking days (number of unique dates with expense data)
    let daysRegistered = 0;
    if (expenses.length > 0) {
      const uniqueDates = new Set(expenses.map(e => e.date));
      daysRegistered = uniqueDates.size;
    } else if (createdAtDate) {
      // Reference variable to satisfy compiler
      daysRegistered = 0;
    }

    // 1. Calculate Spent & Savings Rate
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const curExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
    });

    // Separate regular expenses from unexpected inflows
    const curUnexpectedInflows = curExpenses.filter(e => e.category === 'Unexpected Inflow');
    const curRealExpenses = curExpenses.filter(e => e.category !== 'Unexpected Inflow');

    const curInflowSum = curUnexpectedInflows.reduce((sum, e) => sum + e.amount, 0);
    const effectiveIncome = income + curInflowSum;

    const currentSpent = curRealExpenses.reduce((sum, e) => sum + e.amount, 0);
    const savingsRate = effectiveIncome > 0 ? ((effectiveIncome - currentSpent) / effectiveIncome) * 100 : 0;

    // 2. Savings Score Component (40 pts)
    let savingsScore = 0;
    if (savingsRate >= 35) savingsScore = 40;
    else if (savingsRate >= 20) savingsScore = 30;
    else if (savingsRate >= 10) savingsScore = 20;
    else if (savingsRate >= 0) savingsScore = 10;
    else savingsScore = 0; // overspending

    // 3. Budget Adherence Component (30 pts)
    let budgetScore = 30; // base if no budgets
    if (budgets.length > 0) {
      const overBudgetsCount = budgets.filter(b => b.spentAmount > b.monthlyLimit).length;
      if (overBudgetsCount === 0) budgetScore = 30;
      else if (overBudgetsCount === 1) budgetScore = 20;
      else if (overBudgetsCount === 2) budgetScore = 10;
      else budgetScore = 0;
    }

    // 4. Goal Progress Component (20 pts)
    let goalScore = 20; // base if no active goals
    if (goals.length > 0) {
      const activeGoals = goals.filter(g => g.status === 'active');
      if (activeGoals.length > 0) {
        const avgProgress = activeGoals.reduce((sum, g) => sum + (g.savedAmount / g.targetAmount), 0) / activeGoals.length;
        if (avgProgress >= 0.75) goalScore = 20;
        else if (avgProgress >= 0.40) goalScore = 15;
        else if (avgProgress >= 0.10) goalScore = 10;
        else goalScore = 5;
      }
    }

    // 5. Expense Stability Component (10 pts)
    // Compare current month spent to previous month spent
    let stabilityScore = 10;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevSpent = expenses
      .filter(e => {
        const d = new Date(e.date);
        return (d.getMonth() + 1) === prevMonth && d.getFullYear() === prevYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    if (prevSpent > 0) {
      const diffPercent = Math.abs((currentSpent - prevSpent) / prevSpent) * 100;
      if (diffPercent <= 15) stabilityScore = 10;
      else if (diffPercent <= 30) stabilityScore = 7;
      else stabilityScore = 4;
    }

    // 6. Aggregate Health Score (0-100)
    const healthScore = Math.min(100, Math.max(0, savingsScore + budgetScore + goalScore + stabilityScore));

    // 7. Category Weights & topCategory
    const categorySpending: { [key: string]: number } = {};
    expenses.forEach(e => {
      categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
    });

    let topCategory = 'None';
    let topSpent = 0;
    Object.keys(categorySpending).forEach(cat => {
      if (categorySpending[cat] > topSpent) {
        topSpent = categorySpending[cat];
        topCategory = cat;
      }
    });

    // 8. Spending Personality Engine
    if (expenses.length === 0) {
      let aiConfidence = 0;
      let aiConfidenceLabel: 'Learning' | 'Understanding' | 'Personalized' | 'Highly Personalized' = 'Learning';

      if (daysRegistered >= 21) {
        aiConfidence = 100;
        aiConfidenceLabel = 'Highly Personalized';
      } else {
        const durationContribution = Math.min(60, (daysRegistered / 21) * 60);
        aiConfidence = Math.max(10, Math.round(durationContribution));
        if (aiConfidence > 70) aiConfidenceLabel = 'Personalized';
        else if (aiConfidence > 40) aiConfidenceLabel = 'Understanding';
        else aiConfidenceLabel = 'Learning';
      }

      return {
        personality: 'Balanced Planner',
        healthScore: 100,
        savingsRate: 0,
        topCategory: 'None',
        largestWeakness: 'Awaiting transactions to isolate weaknesses.',
        strongestHabit: 'Awaiting transactions to identify habits.',
        goalPriority: goals.length > 0 ? goals[0].goalName : 'Build safety net',
        budgetDiscipline: 'Awaiting data',
        goalCommitment: 'Awaiting data',
        riskLevel: 'Moderate',
        aiConfidence,
        aiConfidenceLabel,
        daysRegistered
      };
    }

    let personality = 'Balanced Planner';
    let strongestHabit = 'Maintains steady savings';
    let largestWeakness = 'Needs dedicated long-term goals';
    let riskLevel: 'Conservative' | 'Moderate' | 'Aggressive' = 'Moderate';
    let budgetDiscipline = 'Excellent';
    let goalCommitment = 'Moderate';

    // Personality classification
    const isEntertainmentHeavy = (categorySpending['Entertainment'] || 0) + (categorySpending['Dining Out'] || 0) > currentSpent * 0.35;
    const isStudentProfile = isStudent || occupation.toLowerCase().includes('student') || occupation.toLowerCase().includes('college') || occupation.toLowerCase().includes('university') || occupation.toLowerCase().includes('school');
    
    if (isStudentProfile) {
      if (savingsRate >= 30 && budgetScore === 30) {
        personality = 'Scholar Saver';
        strongestHabit = 'Saving a lot of your pocket money and not spending on unnecessary things';
        largestWeakness = 'Spending too little on hobbies, fun activities, or hanging out with friends';
        riskLevel = 'Conservative';
        budgetDiscipline = 'Exceptional';
      } else if (savingsRate >= 15) {
        personality = 'Balanced Academic';
        strongestHabit = 'Good balance between buying study materials, having fun, and saving pocket money';
        largestWeakness = 'Sudden extra expenses like books or trips might throw off your budget';
        riskLevel = 'Moderate';
        budgetDiscipline = 'Stable';
      } else {
        personality = 'Lifestyle Scholar';
        strongestHabit = 'Enjoying your college life and socializing with friends';
        largestWeakness = 'Saving very little pocket money; might need to ask parents for extra cash often';
        riskLevel = 'Aggressive';
        budgetDiscipline = 'Needs Attention';
      }
    } else if (savingsRate >= 35 && budgetScore === 30) {
      personality = 'Smart Saver';
      strongestHabit = 'Great at saving and always staying inside your budget limits';
      largestWeakness = 'Focusing so much on saving that you miss out on enjoying life experiences';
      riskLevel = 'Conservative';
      budgetDiscipline = 'Exceptional';
    } else if (savingsRate >= 25 && goals.length > 0 && goalScore >= 15) {
      personality = 'Future Investor';
      strongestHabit = 'Saving consistently to reach your future goals';
      largestWeakness = 'Locking up too much money, leaving you with little cash for daily needs';
      riskLevel = 'Aggressive';
      goalCommitment = 'Excellent';
    } else if (isEntertainmentHeavy && savingsRate < 15) {
      personality = 'Experience Seeker';
      strongestHabit = 'Willing to spend on great memories and life experiences';
      largestWeakness = 'Spending too much on fun, which can leave you without any emergency savings';
      riskLevel = 'Moderate';
      budgetDiscipline = 'Needs improvement';
    } else if (savingsRate < 10 || budgetScore === 0) {
      personality = 'Impulse Buyer';
      strongestHabit = 'Enjoys shopping, but struggles to save for the future';
      largestWeakness = 'Spending small amounts frequently on emotional or sudden purchases';
      riskLevel = 'Aggressive';
      budgetDiscipline = 'Needs Attention';
    } else {
      personality = 'Balanced Planner';
      strongestHabit = 'Keeping a healthy balance between your spending and savings';
      largestWeakness = 'Could benefit from automated savings to reach your goals faster';
      riskLevel = 'Moderate';
    }

    // 9. AI Confidence Level System mapped to 21-day timeline
    let aiConfidence = 0;
    let aiConfidenceLabel: 'Learning' | 'Understanding' | 'Personalized' | 'Highly Personalized' = 'Learning';

    if (daysRegistered >= 21) {
      aiConfidence = 100;
      aiConfidenceLabel = 'Highly Personalized';
    } else {
      // Linear scaling up to 90% based on days registered and expense volume
      const durationContribution = Math.min(60, (daysRegistered / 21) * 60);
      const volumeContribution = Math.min(30, expenses.length * 2);
      aiConfidence = Math.max(10, Math.round(durationContribution + volumeContribution));
      
      if (aiConfidence > 70) aiConfidenceLabel = 'Personalized';
      else if (aiConfidence > 40) aiConfidenceLabel = 'Understanding';
      else aiConfidenceLabel = 'Learning';
    }

    const goalPriority = goals.length > 0 ? goals[0].goalName : 'Build safety net';

    return {
      personality,
      healthScore,
      savingsRate,
      topCategory,
      largestWeakness,
      strongestHabit,
      goalPriority,
      budgetDiscipline,
      goalCommitment,
      riskLevel,
      aiConfidence,
      aiConfidenceLabel,
      daysRegistered
    };
  }
}
