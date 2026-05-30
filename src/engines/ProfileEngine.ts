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
    createdAtDate: Date
  ): UserProfileData {
    const now = new Date();
    const daysRegistered = Math.max(1, Math.ceil((now.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24)));

    // 1. Calculate Spent & Savings Rate
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const curExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
    });

    const currentSpent = curExpenses.reduce((sum, e) => sum + e.amount, 0);
    const savingsRate = income > 0 ? ((income - currentSpent) / income) * 100 : 0;

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
      const durationContribution = Math.min(70, daysRegistered * 5);
      const aiConfidence = Math.min(100, Math.max(10, durationContribution));
      let aiConfidenceLabel: 'Learning' | 'Understanding' | 'Personalized' | 'Highly Personalized' = 'Learning';
      if (aiConfidence > 75) aiConfidenceLabel = 'Highly Personalized';
      else if (aiConfidence > 50) aiConfidenceLabel = 'Personalized';
      else if (aiConfidence > 25) aiConfidenceLabel = 'Understanding';

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
    
    if (savingsRate >= 35 && budgetScore === 30) {
      personality = 'Smart Saver';
      strongestHabit = 'High saving rate and solid budget adherence';
      largestWeakness = 'Potential underspending on high-value life experiences';
      riskLevel = 'Conservative';
      budgetDiscipline = 'Exceptional';
    } else if (savingsRate >= 25 && goals.length > 0 && goalScore >= 15) {
      personality = 'Future Investor';
      strongestHabit = 'Consistent savings connected directly to long-term goals';
      largestWeakness = 'May lack liquidity due to long-term locks';
      riskLevel = 'Aggressive';
      goalCommitment = 'Excellent';
    } else if (isEntertainmentHeavy && savingsRate < 15) {
      personality = 'Experience Seeker';
      strongestHabit = 'Invests in memorable personal experiences';
      largestWeakness = 'Lifestyle inflation could compromise safety reserves';
      riskLevel = 'Moderate';
      budgetDiscipline = 'Needs improvement';
    } else if (savingsRate < 10 || budgetScore === 0) {
      personality = 'Impulse Buyer';
      strongestHabit = 'Drives commerce but struggles with reserves';
      largestWeakness = 'Susceptible to micro-expense accumulation and emotional shopping';
      riskLevel = 'Aggressive';
      budgetDiscipline = 'Critical Attention Required';
    } else {
      personality = 'Balanced Planner';
      strongestHabit = 'Sustains structural balance between spending and savings';
      largestWeakness = 'Needs automated rule enforcement for optimal acceleration';
      riskLevel = 'Moderate';
    }

    // 9. AI Confidence Level System
    // Confidence = (Days Registered * 5%) + (Number of Expenses * 2%)
    // Capped at 100%
    const durationContribution = Math.min(70, daysRegistered * 5);
    const volumeContribution = Math.min(30, expenses.length * 2);
    const aiConfidence = Math.min(100, Math.max(10, durationContribution + volumeContribution));

    let aiConfidenceLabel: 'Learning' | 'Understanding' | 'Personalized' | 'Highly Personalized' = 'Learning';
    if (aiConfidence > 75) aiConfidenceLabel = 'Highly Personalized';
    else if (aiConfidence > 50) aiConfidenceLabel = 'Personalized';
    else if (aiConfidence > 25) aiConfidenceLabel = 'Understanding';

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
