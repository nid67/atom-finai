export interface Expense {
  expenseId: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  merchantName: string;
  paymentMethod: string;
  sourceType: 'manual' | 'receipt';
  date: string; // YYYY-MM-DD
  createdAt: any;
  updatedAt: any;
}

export interface Budget {
  budgetId: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  spentAmount: number;
  remainingAmount: number;
  month: number;
  year: number;
}

export interface Goal {
  goalId: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string; // YYYY-MM-DD
  description: string;
  status: 'active' | 'achieved' | 'paused';
  createdAt: any;
}

export interface Subscription {
  subscriptionId: string;
  userId: string;
  merchantName: string;
  recurringAmount: number;
  frequency: 'monthly' | 'yearly';
  estimatedYearlyCost: number;
}

export interface AnalyticsSummary {
  currentMonthSpent: number;
  prevMonthSpent: number;
  momChangeSpentPercent: number;
  savingsRate: number;
  categorySpending: { [category: string]: number };
  prevCategorySpending: { [category: string]: number };
  categoryTrends: { [category: string]: { percentChange: number; direction: 'growth' | 'decline' | 'new' | 'stable' } };
  detectedSubscriptions: Omit<Subscription, 'subscriptionId' | 'userId'>[];
}

export class AnalyticsEngine {
  static isKnownSubscription(merchantName: string, description: string): boolean {
    const subscriptionKeywords = [
      'netflix', 'spotify', 'icloud', 'youtube', 'disney', 'hulu', 'amazon prime', 'prime video',
      'apple music', 'apple tv', 'apple one', 'chatgpt', 'openai', 'canva', 'github', 'adobe',
      'rent', 'electricity', 'broadband', 'internet', 'wifi', 'gym', 'office 365', 'microsoft 365',
      'linkedin premium', 'zoom', 'slack', 'nytimes', 'utilities'
    ];
    const m = (merchantName || '').toLowerCase();
    const d = (description || '').toLowerCase();
    return subscriptionKeywords.some(keyword => m.includes(keyword) || d.includes(keyword));
  }

  static getCleanMerchantName(merchantName: string, description: string): string {
    const subscriptionKeywords = [
      'netflix', 'spotify', 'icloud', 'youtube', 'disney', 'hulu', 'amazon prime', 'prime video',
      'apple music', 'apple tv', 'apple one', 'chatgpt', 'openai', 'canva', 'github', 'adobe',
      'rent', 'electricity', 'broadband', 'internet', 'wifi', 'gym', 'office 365', 'microsoft 365',
      'linkedin premium', 'zoom', 'slack', 'nytimes', 'utilities'
    ];
    const m = (merchantName || '').toLowerCase().trim();
    if (m && m !== 'direct expense' && m !== 'expense') {
      if (m.startsWith('netflix')) return 'Netflix';
      if (m.startsWith('spotify')) return 'Spotify';
      if (m.includes('icloud')) return 'iCloud';
      if (m.startsWith('youtube')) return 'YouTube Premium';
      if (m.startsWith('disney')) return 'Disney+';
      if (m.startsWith('amazon prime') || m.includes('prime video')) return 'Amazon Prime';
      if (m.startsWith('chatgpt') || m.includes('openai')) return 'ChatGPT Plus';
      if (m.startsWith('canva')) return 'Canva';
      if (m.startsWith('github')) return 'GitHub Copilot';
      if (m.startsWith('adobe')) return 'Adobe Creative Cloud';
      if (m.startsWith('rent')) return 'Monthly Rent';
      return merchantName.trim().charAt(0).toUpperCase() + merchantName.trim().slice(1);
    }
    const d = (description || '').toLowerCase();
    for (const keyword of subscriptionKeywords) {
      if (d.includes(keyword)) {
        if (keyword === 'netflix') return 'Netflix';
        if (keyword === 'spotify') return 'Spotify';
        if (keyword === 'icloud') return 'iCloud';
        if (keyword === 'youtube') return 'YouTube Premium';
        if (keyword === 'disney') return 'Disney+';
        if (keyword === 'amazon prime' || keyword === 'prime video') return 'Amazon Prime';
        if (keyword === 'chatgpt' || keyword === 'openai') return 'ChatGPT Plus';
        if (keyword === 'canva') return 'Canva';
        if (keyword === 'github') return 'GitHub Copilot';
        if (keyword === 'adobe') return 'Adobe Creative Cloud';
        if (keyword === 'rent') return 'Monthly Rent';
        return keyword.charAt(0).toUpperCase() + keyword.slice(1);
      }
    }
    return merchantName || 'Subscription';
  }

  static getMonthAndYear(dateStr: string): { month: number; year: number } {
    const d = new Date(dateStr);
    return {
      month: d.getMonth() + 1, // 1-12
      year: d.getFullYear()
    };
  }

  static analyze(expenses: Expense[], income: number): AnalyticsSummary {
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();

    const prevMonth = curMonth === 1 ? 12 : curMonth - 1;
    const prevYear = curMonth === 1 ? curYear - 1 : curYear;

    // Filter current and previous month expenses
    const curExpenses = expenses.filter(e => {
      const { month, year } = this.getMonthAndYear(e.date);
      return month === curMonth && year === curYear;
    });

    const prevExpenses = expenses.filter(e => {
      const { month, year } = this.getMonthAndYear(e.date);
      return month === prevMonth && year === prevYear;
    });

    // 1. Calculate Spent
    const currentMonthSpent = curExpenses.reduce((sum, e) => sum + e.amount, 0);
    const prevMonthSpent = prevExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 2. MOM change
    let momChangeSpentPercent = 0;
    if (prevMonthSpent > 0) {
      momChangeSpentPercent = ((currentMonthSpent - prevMonthSpent) / prevMonthSpent) * 100;
    } else if (currentMonthSpent > 0) {
      momChangeSpentPercent = 100; // went from 0 to something
    }

    // 3. Savings Rate
    const totalSaved = Math.max(0, income - currentMonthSpent);
    const savingsRate = income > 0 ? (totalSaved / income) * 100 : 0;

    // 4. Category breakdown current month
    const categorySpending: { [category: string]: number } = {};
    curExpenses.forEach(e => {
      const cat = e.category || 'Uncategorized';
      categorySpending[cat] = (categorySpending[cat] || 0) + e.amount;
    });

    // 5. Category breakdown previous month
    const prevCategorySpending: { [category: string]: number } = {};
    prevExpenses.forEach(e => {
      const cat = e.category || 'Uncategorized';
      prevCategorySpending[cat] = (prevCategorySpending[cat] || 0) + e.amount;
    });

    // 6. Category Trends
    const categoryTrends: { [category: string]: { percentChange: number; direction: 'growth' | 'decline' | 'new' | 'stable' } } = {};
    const allCategories = new Set([...Object.keys(categorySpending), ...Object.keys(prevCategorySpending)]);

    allCategories.forEach(cat => {
      const curVal = categorySpending[cat] || 0;
      const prevVal = prevCategorySpending[cat] || 0;

      if (prevVal === 0 && curVal > 0) {
        categoryTrends[cat] = { percentChange: 100, direction: 'new' };
      } else if (curVal === 0 && prevVal > 0) {
        categoryTrends[cat] = { percentChange: -100, direction: 'decline' };
      } else if (curVal === prevVal) {
        categoryTrends[cat] = { percentChange: 0, direction: 'stable' };
      } else {
        const change = ((curVal - prevVal) / prevVal) * 100;
        categoryTrends[cat] = {
          percentChange: change,
          direction: change > 0 ? 'growth' : 'decline'
        };
      }
    });

    // 7. Auto-detect Subscriptions (Recurring expenses)
    const detectedSubscriptions: Omit<Subscription, 'subscriptionId' | 'userId'>[] = [];

    // Step A: Auto-detect known subscriptions instantly (even with 1 transaction)
    const knownSubs: { [merchant: string]: Expense } = {};
    expenses.forEach(e => {
      if (AnalyticsEngine.isKnownSubscription(e.merchantName, e.description)) {
        const cleanName = AnalyticsEngine.getCleanMerchantName(e.merchantName, e.description);
        const existing = knownSubs[cleanName];
        if (!existing || new Date(e.date).getTime() > new Date(existing.date).getTime()) {
          knownSubs[cleanName] = e;
        }
      }
    });

    Object.keys(knownSubs).forEach(merchantName => {
      const exp = knownSubs[merchantName];
      detectedSubscriptions.push({
        merchantName: merchantName,
        recurringAmount: exp.amount,
        frequency: 'monthly',
        estimatedYearlyCost: exp.amount * 12
      });
    });

    // Step B: General analytical pattern-scanner for unrecognized/custom recurring expenses
    const nonSubscriptionExpenses = expenses.filter(e => !AnalyticsEngine.isKnownSubscription(e.merchantName, e.description));

    const merchantGroups: { [key: string]: Expense[] } = {};
    nonSubscriptionExpenses.forEach(e => {
      if (!e.merchantName || e.merchantName.trim() === '') return;
      const key = `${e.merchantName.trim().toLowerCase()}_${Math.round(e.amount)}`;
      if (!merchantGroups[key]) {
        merchantGroups[key] = [];
      }
      merchantGroups[key].push(e);
    });

    Object.keys(merchantGroups).forEach(key => {
      const list = merchantGroups[key];
      // Sort by date
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // If we have at least 2 occurrences
      if (list.length >= 2) {
        // Check average distance in days
        let recurring = false;
        let dayDifferences: number[] = [];

        for (let i = 1; i < list.length; i++) {
          const d1 = new Date(list[i - 1].date);
          const d2 = new Date(list[i].date);
          const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
          dayDifferences.push(diffDays);
        }

        // If average day difference is between 25 and 35 days, or 12 to 16 days (semi-monthly)
        const avgDiff = dayDifferences.reduce((sum, d) => sum + d, 0) / dayDifferences.length;
        if ((avgDiff >= 25 && avgDiff <= 35) || (avgDiff >= 12 && avgDiff <= 16)) {
          recurring = true;
        }

        // Alternative check: has it occurred in different calendar months?
        if (!recurring) {
          const monthsSeen = new Set(list.map(e => {
            const { month, year } = this.getMonthAndYear(e.date);
            return `${month}_${year}`;
          }));
          if (monthsSeen.size >= 2) {
            recurring = true;
          }
        }

        if (recurring) {
          const rep = list[0];
          const mName = rep.merchantName.trim().charAt(0).toUpperCase() + rep.merchantName.trim().slice(1);
          detectedSubscriptions.push({
            merchantName: mName,
            recurringAmount: rep.amount,
            frequency: 'monthly',
            estimatedYearlyCost: rep.amount * 12
          });
        }
      }
    });

    return {
      currentMonthSpent,
      prevMonthSpent,
      momChangeSpentPercent,
      savingsRate,
      categorySpending,
      prevCategorySpending,
      categoryTrends,
      detectedSubscriptions
    };
  }
}
