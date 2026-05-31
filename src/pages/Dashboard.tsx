import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { CircularScore } from '../components/CircularScore';
import { QuickAlerts } from '../components/QuickAlerts';
import { 
  TrendingUp, 
  TrendingDown, 
  Award,
  Sparkles,
  Calendar,
  Activity
} from 'lucide-react';

interface DashboardProps {
  darkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ darkMode = true }) => {
  const { userData } = useAuth();
  const { profile, analytics, alerts, suggestions } = useFinance();

  const income = userData?.monthlyIncome || 0;
  const currency = userData?.preferredCurrency || '₹';

  const totalSpent = analytics?.currentMonthSpent || 0;
  const totalSaved = Math.max(0, income - totalSpent);
  const savingsRate = analytics?.savingsRate || 0;

  // MOM Spent details
  const momChange = analytics?.momChangeSpentPercent || 0;
  const isMomSpike = momChange > 0;

  // Calculate profile progression (21 days tracker)
  const daysRegistered = profile?.daysRegistered || 1;
  const profileProgress = Math.min(21, daysRegistered);
  const profileProgressPercent = (profileProgress / 21) * 100;
  const isPersonalizedActive = daysRegistered >= 21;

  // Format currency helper
  const fNum = (num: number) => {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // Categories with high spendings
  const categoriesList = Object.keys(analytics?.categorySpending || {}).map(cat => ({
    name: cat,
    amount: analytics?.categorySpending[cat] || 0
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* Upper Welcome Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight m-0">
            Wealth Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 m-0">
            Welcome back, {userData?.fullName}. Here is your real-time financial coach intelligence.
          </p>
        </div>

        {/* 21 Day Learning Progress Bar - Hides after 21 days */}
        {!isPersonalizedActive ? (
          <div className={`p-4 rounded-xl border flex items-center gap-4 relative overflow-hidden group ${
            darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Profile Learning Stage
                </span>
                <span className="text-xs font-bold text-teal-400">
                  {profileProgress} / 21 Days
                </span>
              </div>
              <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5 border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-1000" 
                  style={{ width: `${profileProgressPercent}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500 block mt-1.5 font-bold">
                🔒 {21 - daysRegistered} more days to get a detailed & personalized experience.
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Main Core Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Circular gauge (Health Score) */}
        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden h-[300px] ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <CircularScore score={profile?.healthScore || 100} darkMode={darkMode} />
          
          <div className="flex gap-4 mt-6 text-center text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Savings Cushion</span>
              <span className="text-slate-200 font-bold text-sm">{savingsRate.toFixed(0)}%</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-slate-400 block font-semibold">Discipline</span>
              <span className="text-slate-200 font-bold text-sm">{profile?.budgetDiscipline}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-slate-400 block font-semibold">Risk profile</span>
              <span className="text-slate-200 font-bold text-sm">{profile?.riskLevel}</span>
            </div>
          </div>
        </div>

        {/* Center Column: Personality Card */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between h-[300px] ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-extrabold text-teal-400 tracking-wider">
                Behavioral Profile
              </span>
              <Sparkles size={16} className="text-teal-400" />
            </div>
            
            <h3 className="text-2xl font-bold font-display mt-2 m-0 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {profile?.personality || 'Balanced Planner'}
            </h3>
            
            <div className="mt-4 space-y-3.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">
                  Strongest Habit
                </span>
                <p className="text-xs mt-1 text-slate-200 font-medium m-0 leading-snug">
                  {profile?.strongestHabit}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">
                  Largest Weakness
                </span>
                <p className="text-xs mt-1 text-rose-300 font-medium m-0 leading-snug">
                  {profile?.largestWeakness}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/40 text-slate-400">
            <Award size={14} className="text-amber-500" />
            <span>Profile accuracy increases as transactions accumulate.</span>
          </div>
        </div>

        {/* Right Column: Key Alerts Card */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between overflow-y-auto h-[300px] ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs uppercase font-extrabold text-rose-400 tracking-wider">
                Coach Alerts & Stress Checks
              </span>
              <Activity size={16} className="text-rose-400 animate-pulse" />
            </div>
            
            <div className="max-h-[200px] overflow-y-auto space-y-3 pr-1.5">
              <QuickAlerts alerts={alerts} darkMode={darkMode} />
              {alerts.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  All systems healthy! No budget overages or structural alerts triggered.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Income */}
        <div className={`p-4 rounded-xl border flex flex-col justify-center ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/50 border-slate-200'
        }`}>
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
            Monthly Inflow
          </span>
          <span className="text-2xl font-display font-extrabold tracking-tight mt-1">
            {currency}{fNum(income)}
          </span>
        </div>

        {/* Spent */}
        <div className={`p-4 rounded-xl border flex flex-col justify-center ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
              Total Spent
            </span>
            {momChange !== 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${
                isMomSpike ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {isMomSpike ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                {Math.abs(Math.round(momChange))}% MoM
              </span>
            )}
          </div>
          <span className="text-2xl font-display font-extrabold tracking-tight mt-1 text-rose-400">
            {currency}{fNum(totalSpent)}
          </span>
        </div>

        {/* Saved */}
        <div className={`p-4 rounded-xl border flex flex-col justify-center ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/50 border-slate-200'
        }`}>
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
            Total Saved
          </span>
          <span className="text-2xl font-display font-extrabold tracking-tight mt-1 text-emerald-400">
            {currency}{fNum(totalSaved)}
          </span>
        </div>

        {/* Savings Rate */}
        <div className={`p-4 rounded-xl border flex flex-col justify-center ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/50 border-slate-200'
        }`}>
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
            Savings Rate
          </span>
          <span className="text-2xl font-display font-extrabold tracking-tight mt-1 text-cyan-400">
            {savingsRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Spending Breakdown and Coach Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Spending Breakdown SVG Bar Chart */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div>
            <h3 className="text-xl font-bold font-display m-0">Category Weightings</h3>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Distribution of your monthly cash outflow. Limit your high-weight discretionary items.
            </p>

            <div className="mt-6 space-y-4">
              {categoriesList.slice(0, 5).map((cat) => {
                const totalExpensesAmount = totalSpent || 1;
                const ratio = (cat.amount / totalExpensesAmount) * 100;
                
                // Colors based on category
                let barColor = 'bg-cyan-500';
                if (cat.name === 'Food & Dining') barColor = 'bg-orange-400';
                if (cat.name === 'Shopping') barColor = 'bg-rose-400';
                if (cat.name === 'Bills & Utilities') barColor = 'bg-indigo-400';
                if (cat.name === 'Groceries') barColor = 'bg-emerald-400';

                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span>{cat.name}</span>
                      <span className="text-slate-400">
                        {currency}{fNum(cat.amount)} ({ratio.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                );
              })}

              {categoriesList.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No expense records logged this month. Navigate to the Expenses tab to populate records!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Local Coach Suggestions */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div>
            <h3 className="text-xl font-bold font-display m-0">Immediate Coach Strategy</h3>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Rule-based coaching directives mapped automatically from your current metrics.
            </p>

            <div className="mt-6 space-y-4">
              {suggestions.map((sug, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border flex gap-3 text-xs leading-relaxed ${
                    darkMode 
                      ? 'bg-slate-900/30 border-slate-800/40 text-slate-300' 
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <p className="m-0">{sug}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
