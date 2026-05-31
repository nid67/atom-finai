import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import type { Budget } from '../engines/AnalyticsEngine';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X
} from 'lucide-react';

interface BudgetsProps {
  darkMode?: boolean;
}

export const Budgets: React.FC<BudgetsProps> = ({ darkMode = true }) => {
  const { userData } = useAuth();
  const { budgets, addBudget, updateBudget, deleteBudget } = useFinance();
  const currency = userData?.preferredCurrency || '₹';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form States
  const [category, setCategory] = useState('Food & Dining');
  const [limit, setLimit] = useState('');

  const categories = [
    "Food & Dining",
    "Groceries",
    "Shopping",
    "Transport",
    "Bills & Utilities",
    "Entertainment",
    "Health & Wellness",
    "Unexpected Inflow",
    "Others"
  ];

  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  // Filter current month budgets
  const activeBudgets = budgets.filter(b => b.month === curMonth && b.year === curYear);

  // Submit new budget
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit || parseFloat(limit) <= 0) return;
    
    // Check if category already has a budget this month
    const exists = activeBudgets.some(b => b.category === category);
    if (exists) {
      alert(`A budget for ${category} is already set for this month. Modify that budget limit instead.`);
      return;
    }

    try {
      await addBudget({
        category,
        monthlyLimit: parseFloat(limit),
        spentAmount: 0,
        remainingAmount: parseFloat(limit),
        month: curMonth,
        year: curYear
      });
      setLimit('');
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit edit budget
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget || !limit || parseFloat(limit) <= 0) return;

    try {
      await updateBudget(editingBudget.budgetId, {
        monthlyLimit: parseFloat(limit),
        remainingAmount: Math.max(0, parseFloat(limit) - editingBudget.spentAmount)
      });
      setLimit('');
      setEditingBudget(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger edit setup
  const startEdit = (b: Budget) => {
    setEditingBudget(b);
    setLimit(b.monthlyLimit.toString());
    setCategory(b.category);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight m-0">
            Budgets & Thresholds
          </h2>
          <p className="text-sm text-slate-400 mt-1 m-0">
            Define category ceilings for this month. Atom's rule engine will notify you when spending hits capacity.
          </p>
        </div>

        <button
          onClick={() => {
            setLimit('');
            setCategory('Food & Dining');
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"
        >
          <Plus size={14} />
          <span>Configure Budget</span>
        </button>
      </div>

      {/* Budgets Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeBudgets.map((b) => {
          const ratio = b.spentAmount / b.monthlyLimit;
          const ratioPercent = Math.min(100, ratio * 100);
          
          let colorClass = 'bg-emerald-500';
          let borderClass = 'border-emerald-500/20';
          let textClass = 'text-emerald-400';
          let stateLabel = 'Under limit';

          if (ratio >= 1.0) {
            colorClass = 'bg-rose-500';
            borderClass = 'border-rose-500/25';
            textClass = 'text-rose-400';
            stateLabel = 'Ceiling Exceeded';
          } else if (ratio >= 0.85) {
            colorClass = 'bg-amber-500';
            borderClass = 'border-amber-500/25';
            textClass = 'text-amber-400';
            stateLabel = 'Critical capacity';
          }

          return (
            <div 
              key={b.budgetId} 
              className={`p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                darkMode 
                  ? 'glass-panel-dark border-slate-800' 
                  : 'glass-panel-light border-slate-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Monthly Limit
                    </span>
                    <h4 className="text-lg font-bold font-display m-0 mt-0.5 text-slate-100">
                      {b.category}
                    </h4>
                  </div>

                  {/* Warning Icon Badge */}
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${borderClass} ${textClass}`}>
                    {stateLabel}
                  </span>
                </div>

                {/* Progress Visual Dial Indicator */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Spent: {currency}{b.spentAmount.toLocaleString()}</span>
                    <span className="font-bold text-slate-200">{ratioPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className={`h-full ${colorClass} rounded-full transition-all duration-1000`} style={{ width: `${ratioPercent}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center text-xs border-t border-slate-800/40 pt-4">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Budget Limit</span>
                    <span className="font-extrabold text-slate-200">{currency}{b.monthlyLimit.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Remaining</span>
                    <span className={`font-extrabold ${ratio >= 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {ratio >= 1.0 ? '-' : ''}{currency}{Math.abs(b.monthlyLimit - b.spentAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-6 pt-2">
                <button
                  onClick={() => startEdit(b)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-800 text-[11px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer"
                >
                  <Edit2 size={11} />
                  <span>Update Limit</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove budget ceiling for ${b.category}?`)) {
                      deleteBudget(b.budgetId);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 border border-transparent text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 size={11} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          );
        })}

        {activeBudgets.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-500 text-xs">
            No budget caps established this month. Establish targets to enable the automated alert monitors!
          </div>
        )}
      </div>

      {/* --- ADD BUDGET MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border p-6 relative ${
            darkMode ? 'glass-panel-dark border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold font-display mb-4">Set Category Budget</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Monthly Limit ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 10000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow cursor-pointer mt-2"
              >
                Establish Ceiling
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT BUDGET MODAL --- */}
      {editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border p-6 relative ${
            darkMode ? 'glass-panel-dark border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => setEditingBudget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold font-display mb-4">Update Budget Ceiling</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400">Expense Category</label>
                <input
                  type="text"
                  disabled
                  value={category}
                  className={`w-full px-3 py-2 rounded-xl border opacity-50 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Monthly Limit ({currency})</label>
                <input
                  type="number"
                  required
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow cursor-pointer mt-2"
              >
                Apply Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
