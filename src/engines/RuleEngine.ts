import type { Expense, Budget, Goal } from './AnalyticsEngine';

export interface AlertMessage {
  id: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  title: string;
  message: string;
  category?: string;
}

export class RuleEngine {
  static evaluate(
    expenses: Expense[],
    budgets: Budget[],
    goals: Goal[],
    _income: number,
    savingsRate: number
  ): { alerts: AlertMessage[]; suggestions: string[] } {
    const alerts: AlertMessage[] = [];
    const suggestions: string[] = [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Budget Checks
    budgets.forEach(b => {
      if (b.month === currentMonth && b.year === currentYear) {
        const ratio = b.spentAmount / b.monthlyLimit;
        // calculated for rule tracking
        
        if (ratio >= 1.0) {
          alerts.push({
            id: `budget_alert_${b.category}`,
            type: 'alert',
            title: `Budget Exceeded`,
            message: `You spent more than your limit for ${b.category} by ${b.spentAmount - b.monthlyLimit}! (Limit: ${b.monthlyLimit}, Spent: ${b.spentAmount})`,
            category: b.category
          });
          suggestions.push(`Try to stop spending on ${b.category} for the rest of this month.`);
        } else if (ratio >= 0.85) {
          alerts.push({
            id: `budget_warn_${b.category}`,
            type: 'warning',
            title: `Budget Warning`,
            message: `You have used ${Math.round(ratio * 100)}% of your ${b.category} budget. You only have ${b.monthlyLimit - b.spentAmount} left.`,
            category: b.category
          });
          suggestions.push(`Try to wait until next month before buying more things in ${b.category}.`);
        }
      }
    });

    // 2. Savings Rate Checks
    if (savingsRate < 0) {
      alerts.push({
        id: 'savings_critical',
        type: 'alert',
        title: 'Overspending Alert',
        message: `You have spent more than you earned this month! You spent ${Math.abs(Math.round(savingsRate))}% more than your income.`
      });
      suggestions.push("Take a quick look at your recent expenses and pause things you don't really need.");
      suggestions.push("Try setting aside 10% of your pocket money at the start of next month before you begin spending.");
    } else if (savingsRate < 15) {
      alerts.push({
        id: 'savings_warning',
        type: 'warning',
        title: 'Low Savings Rate',
        message: `You saved ${Math.round(savingsRate)}% of your income this month. Try to aim for 20% or more to build a nice cushion!`
      });
      suggestions.push("Look out for small expenses like dining out or subscriptions that can add up quickly.");
    } else {
      alerts.push({
        id: 'savings_success',
        type: 'success',
        title: 'Healthy Savings',
        message: `Awesome job! You saved ${Math.round(savingsRate)}% of your money this month. Keep it up!`
      });
    }

    // 3. Goal Target Deadlines
    goals.forEach(g => {
      if (g.status === 'active') {
        const targetD = new Date(g.targetDate);
        const diffTime = targetD.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const remainingToSave = g.targetAmount - g.savedAmount;

        if (diffDays > 0 && diffDays <= 45) {
          const progressPercent = (g.savedAmount / g.targetAmount) * 100;
          if (progressPercent < 80) {
            alerts.push({
              id: `goal_deadline_${g.goalId}`,
              type: 'warning',
              title: `Goal Deadline Nearing`,
              message: `Your goal "${g.goalName}" is ending in ${diffDays} days! You are at ${Math.round(progressPercent)}% and need to save ${remainingToSave} more to reach it.`,
            });
            suggestions.push(`Put a little extra money towards your "${g.goalName}" goal this week to help reach it on time.`);
          }
        }
      }
    });

    // 4. Volatility Spikes MoM
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const curSpent = expenses
      .filter(e => {
        const d = new Date(e.date);
        return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear && e.category !== 'Unexpected Inflow';
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const prevSpent = expenses
      .filter(e => {
        const d = new Date(e.date);
        return (d.getMonth() + 1) === prevMonth && d.getFullYear() === prevYear && e.category !== 'Unexpected Inflow';
      })
      .reduce((sum, e) => sum + e.amount, 0);

    if (prevSpent > 0) {
      const growth = ((curSpent - prevSpent) / prevSpent) * 100;
      if (growth >= 40) {
        alerts.push({
          id: 'spending_volatility',
          type: 'alert',
          title: 'Spending Spike Warning',
          message: `You spent ${Math.round(growth)}% more this month compared to last month!`
        });
        suggestions.push("Think if this extra spending was for a one-time emergency or if you are spending more on daily things.");
      }
    }

    // Default suggestions if list is empty
    if (suggestions.length === 0) {
      suggestions.push("Great job! Keep staying within your budgets and saving money.");
      suggestions.push("Consider putting some of your extra savings into a piggy bank or low-risk savings account.");
    }

    return {
      alerts,
      suggestions: Array.from(new Set(suggestions)).slice(0, 4) // unique, max 4
    };
  }
}
