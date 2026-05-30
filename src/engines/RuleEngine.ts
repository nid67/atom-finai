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
            message: `You are over budget in ${b.category} by ${b.spentAmount - b.monthlyLimit} ${b.remainingAmount < 0 ? 'units' : ''}. (Limit: ${b.monthlyLimit}, Spent: ${b.spentAmount})`,
            category: b.category
          });
          suggestions.push(`Immediately freeze non-essential purchases in ${b.category} to contain the overage.`);
        } else if (ratio >= 0.85) {
          alerts.push({
            id: `budget_warn_${b.category}`,
            type: 'warning',
            title: `Budget Warning`,
            message: `${b.category} budget is at ${Math.round(ratio * 100)}% capacity. Only ${b.monthlyLimit - b.spentAmount} remaining.`,
            category: b.category
          });
          suggestions.push(`Consider deferring discretionary items in ${b.category} until next month.`);
        }
      }
    });

    // 2. Savings Rate Checks
    if (savingsRate < 0) {
      alerts.push({
        id: 'savings_critical',
        type: 'alert',
        title: 'Deficit Alert',
        message: `Your spending this month exceeds your monthly income! Deficit is at ${Math.abs(Math.round(savingsRate))}% of income.`
      });
      suggestions.push("Audit recent transaction records to isolate and pause recurring non-essential expenses.");
      suggestions.push("Establish an automated 10% safety cushion transfer at the start of your next income cycle.");
    } else if (savingsRate < 15) {
      alerts.push({
        id: 'savings_warning',
        type: 'warning',
        title: 'Low Savings Rate',
        message: `Savings rate is currently at ${Math.round(savingsRate)}%. Premium target is 25%+ for optimal security.`
      });
      suggestions.push("Identify micro-spending patterns (dining, subscriptions) that are eroding your savings potential.");
    } else {
      alerts.push({
        id: 'savings_success',
        type: 'success',
        title: 'Healthy Savings',
        message: `Excellent savings performance! You are saving ${Math.round(savingsRate)}% of your income.`
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
              title: `Milestone Nearing`,
              message: `Goal "${g.goalName}" is due in ${diffDays} days. You are at ${Math.round(progressPercent)}% and need to save ${remainingToSave} more.`
            });
            suggestions.push(`Redirect discretionary funds to close the remaining gap for your "${g.goalName}" milestone.`);
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
        return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const prevSpent = expenses
      .filter(e => {
        const d = new Date(e.date);
        return (d.getMonth() + 1) === prevMonth && d.getFullYear() === prevYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    if (prevSpent > 0) {
      const growth = ((curSpent - prevSpent) / prevSpent) * 100;
      if (growth >= 40) {
        alerts.push({
          id: 'spending_volatility',
          type: 'alert',
          title: 'Volatility Warning',
          message: `Your spending spiked by ${Math.round(growth)}% this month compared to last month!`
        });
        suggestions.push("Check if this is a one-time essential purchase or a structural drift in regular spending habits.");
      }
    }

    // Default suggestions if list is empty
    if (suggestions.length === 0) {
      suggestions.push("Great job! Keep sustaining your present budget parameters and savings disciplines.");
      suggestions.push("Explore micro-investment buckets to accelerate growth on your idle savings reserves.");
    }

    return {
      alerts,
      suggestions: Array.from(new Set(suggestions)).slice(0, 4) // unique, max 4
    };
  }
}
