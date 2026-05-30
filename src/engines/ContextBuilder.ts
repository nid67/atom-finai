import type { Budget, Goal } from './AnalyticsEngine';
import type { UserProfileData } from './ProfileEngine';
import type { AlertMessage } from './RuleEngine';
import type { UserData } from '../context/AuthContext';

export class ContextBuilder {
  static buildCoachContext(
    userData: UserData,
    profile: UserProfileData,
    budgets: Budget[],
    goals: Goal[],
    subscriptions: { merchantName: string; recurringAmount: number; frequency: string; estimatedYearlyCost: number }[],
    alerts: AlertMessage[],
    userQuery: string
  ): string {
    const formattedBudgets = budgets
      .map(b => `- ${b.category}: Limit: ${userData.preferredCurrency}${b.monthlyLimit}, Spent: ${userData.preferredCurrency}${b.spentAmount}, Status: ${b.spentAmount > b.monthlyLimit ? 'OVER BUDGET' : 'Within limit'}`)
      .join('\n');

    const formattedGoals = goals
      .map(g => `- ${g.goalName}: Target: ${userData.preferredCurrency}${g.targetAmount}, Saved: ${userData.preferredCurrency}${g.savedAmount} (${Math.round((g.savedAmount/g.targetAmount)*100)}%), Target Date: ${g.targetDate}, Status: ${g.status}`)
      .join('\n');

    const formattedSubscriptions = subscriptions
      .map(s => `- ${s.merchantName}: ${userData.preferredCurrency}${s.recurringAmount}/${s.frequency} (Est. Yearly Cost: ${userData.preferredCurrency}${s.estimatedYearlyCost})`)
      .join('\n');

    const formattedAlerts = alerts
      .map(a => `[${a.type.toUpperCase()}] ${a.title}: ${a.message}`)
      .join('\n');

    return `
SYSTEM PROFILE CONTEXT FOR ATOM FINAI COACH:
- User Name: ${userData.fullName}
- Occupation: ${userData.occupation || 'Not Specified'}
- Monthly Income: ${userData.preferredCurrency}${userData.monthlyIncome}
- Savings Rate: ${Math.round(profile.savingsRate)}%
- Financial Health Score: ${profile.healthScore}/100
- Spending Personality: ${profile.personality}
- Strongest Habit: ${profile.strongestHabit}
- Top Category: ${profile.topCategory}
- Largest Weakness: ${profile.largestWeakness}
- AI Profiling Stage: ${profile.aiConfidence}% (${profile.aiConfidenceLabel})

ACTIVE MONTHLY BUDGETS:
${formattedBudgets || 'No budgets configured.'}

LONG-TERM FINANCIAL GOALS:
${formattedGoals || 'No active goals configured.'}

DETECTED RECURRING SUBSCRIPTIONS:
${formattedSubscriptions || 'No subscriptions detected.'}

SYSTEM ALERTS & STRESS INDICATORS:
${formattedAlerts || 'System status normal. No immediate alerts.'}

USER DIRECT INQUIRY:
"${userQuery}"
`;
  }
}
