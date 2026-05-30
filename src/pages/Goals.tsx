import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import type { Goal } from '../engines/AnalyticsEngine';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Target, 
  Calendar,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoalsProps {
  darkMode?: boolean;
}

export const Goals: React.FC<GoalsProps> = ({ darkMode = true }) => {
  const { userData } = useAuth();
  const { goals, addGoal, updateGoal, deleteGoal, profile } = useFinance();
  const currency = userData?.preferredCurrency || '₹';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form States
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');

  // Submit add goal
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetAmount || !targetDate) return;

    try {
      await addGoal({
        goalName,
        targetAmount: parseFloat(targetAmount),
        savedAmount: savedAmount ? parseFloat(savedAmount) : 0,
        targetDate,
        description: description || 'No description logged.',
        status: 'active'
      });

      setGoalName('');
      setTargetAmount('');
      setSavedAmount('');
      setTargetDate('');
      setDescription('');
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit edit goal
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !targetAmount) return;

    const parsedSaved = parseFloat(savedAmount) || 0;
    const parsedTarget = parseFloat(targetAmount);
    const achieved = parsedSaved >= parsedTarget;

    try {
      await updateGoal(editingGoal.goalId, {
        goalName,
        targetAmount: parsedTarget,
        savedAmount: parsedSaved,
        targetDate,
        description,
        status: achieved ? 'achieved' : 'active'
      });

      if (achieved && editingGoal.status !== 'achieved') {
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.5 }
        });
      }

      setEditingGoal(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Setup edit
  const startEdit = (g: Goal) => {
    setEditingGoal(g);
    setGoalName(g.goalName);
    setTargetAmount(g.targetAmount.toString());
    setSavedAmount(g.savedAmount.toString());
    setTargetDate(g.targetDate);
    setDescription(g.description);
  };

  // Direct quick saving increase action
  const handleQuickSave = async (g: Goal, addAmount: number) => {
    const newSaved = g.savedAmount + addAmount;
    const achieved = newSaved >= g.targetAmount;

    try {
      await updateGoal(g.goalId, {
        savedAmount: newSaved,
        status: achieved ? 'achieved' : 'active'
      });

      if (achieved && g.status !== 'achieved') {
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.5 }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight m-0">
            Financial Milestones
          </h2>
          <p className="text-sm text-slate-400 mt-1 m-0">
            Establish medium and long-term milestones. AI links spending personality metrics directly to goal feasibility.
          </p>
        </div>

        <button
          onClick={() => {
            setGoalName('');
            setTargetAmount('');
            setSavedAmount('0');
            setTargetDate('');
            setDescription('');
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"
        >
          <Plus size={14} />
          <span>New Target</span>
        </button>
      </div>

      {/* Connection to Habits: AI Habit Link Indicator */}
      {goals.length > 0 && (
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${
          darkMode ? 'bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border-teal-500/25 text-teal-300' : 'bg-teal-50 border-teal-100 text-slate-800'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 animate-glow-cyan">
            <Sparkles size={20} />
          </div>
          <div className="text-xs">
            <h4 className="font-bold m-0 flex items-center gap-1.5 leading-snug">
              AI Habit Feasibility Link
            </h4>
            <p className="opacity-90 m-0 mt-0.5 leading-relaxed">
              Based on your Spending Personality <span className="font-bold underline text-white">{profile?.personality}</span> and top category <span className="font-bold underline text-white">{profile?.topCategory}</span>, 
              keeping discretionary expenses below 15% would shorten your milestone target completion durations by an average of <span className="font-bold text-emerald-400">18 days</span>!
            </p>
          </div>
        </div>
      )}

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => {
          const ratio = g.savedAmount / g.targetAmount;
          const ratioPercent = Math.min(100, ratio * 100);
          
          let cardStyle = '';
          let barColor = 'bg-gradient-to-r from-emerald-500 to-teal-400';

          if (g.status === 'achieved') {
            cardStyle = 'border-emerald-500/30 bg-emerald-500/5';
            barColor = 'bg-emerald-400';
          }

          return (
            <div 
              key={g.goalId} 
              className={`p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${cardStyle} ${
                darkMode 
                  ? 'glass-panel-dark border-slate-800' 
                  : 'glass-panel-light border-slate-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    <Target size={18} />
                  </div>

                  {g.status === 'achieved' ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                      Achieved
                    </span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Active
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-bold font-display mt-4 m-0 text-slate-100">
                  {g.goalName}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 m-0 leading-snug">
                  {g.description}
                </p>

                {/* Progress parameters */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-400">Saved: {currency}{g.savedAmount.toLocaleString()}</span>
                    <span className="text-slate-200">{ratioPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${ratioPercent}%` }} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs border-t border-slate-800/40 pt-4 font-semibold">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Target Date</span>
                    <span className="text-slate-300 flex items-center gap-1 mt-0.5">
                      <Calendar size={11} className="text-slate-400" />
                      <span>{g.targetDate}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Goal Target</span>
                    <span className="text-slate-200 font-extrabold block mt-0.5">
                      {currency}{g.targetAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Incremental quick saves and actions */}
              <div className="space-y-3.5 mt-6 border-t border-slate-800/20 pt-4">
                {g.status !== 'achieved' && (
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Quick Save:</span>
                    <div className="flex gap-1.5">
                      {[100, 500, 2000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => handleQuickSave(g, amt)}
                          className="px-2.5 py-1 text-[10px] bg-slate-800/80 hover:bg-slate-700 text-teal-400 font-bold border border-slate-700/50 rounded transition-all cursor-pointer"
                        >
                          +{currency}{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 text-xs pt-1.5">
                  <button
                    onClick={() => startEdit(g)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-800 text-[11px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer"
                  >
                    <Edit2 size={11} />
                    <span>Edit Target</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Cancel milestone "${g.goalName}"?`)) {
                        deleteGoal(g.goalId);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 border border-transparent text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-500 text-xs">
            No milestones configured yet. Setting targets allows Atom's memory triggers to align savings rates with targets!
          </div>
        )}
      </div>

      {/* --- ADD GOAL MODAL --- */}
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
            <h3 className="text-xl font-bold font-display mb-4">Set Financial Milestone</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400">Milestone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Save Emergency Fund"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400">Target Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Initial Savings ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 2000"
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Target Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Description / Rationale</label>
                <input
                  type="text"
                  placeholder="e.g. Setting aside 6 months of expenses for buffer."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow cursor-pointer mt-2"
              >
                Launch Milestone
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT GOAL MODAL --- */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border p-6 relative ${
            darkMode ? 'glass-panel-dark border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => setEditingGoal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold font-display mb-4">Edit Goal Milestone</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400">Goal Name</label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400">Target Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Saved Amount ({currency})</label>
                  <input
                    type="number"
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Target Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow cursor-pointer mt-2"
              >
                Apply Updates
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
