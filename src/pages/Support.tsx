import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, MessageSquare, Hourglass, PiggyBank, Target, Receipt } from 'lucide-react';

interface SupportProps {
  darkMode?: boolean;
}

export const Support: React.FC<SupportProps> = ({ darkMode = true }) => {
  const { userData } = useAuth();
  
  const isStudent = userData?.isStudent || 
                    (userData?.occupation || '').toLowerCase().includes('student') || 
                    (userData?.occupation || '').toLowerCase().includes('college') || 
                    (userData?.occupation || '').toLowerCase().includes('university') || 
                    (userData?.occupation || '').toLowerCase().includes('school');

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4">
      {/* Ambient glowing gradient highlights */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-teal-500/5 blur-3xl pointer-events-none select-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none select-none" />

      {/* Header section */}
      <div>
        <h2 className="text-3xl font-display font-extrabold tracking-tight m-0 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          User Guide & Support Hub
        </h2>
        <p className="text-sm text-slate-400 mt-1.5 m-0 font-medium">
          Your complete manual to tracking expenses, budgeting, planning goals, and unlocking AI-powered financial intelligence.
        </p>
      </div>

      {/* Section 1: Core Action Guide (Expenses, Budgets, Goals) */}
      <div className="space-y-4 animate-fade-in">
        <h3 className="text-lg font-bold font-display text-slate-200 m-0 flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-teal-400 block" />
          The Core Actions: How to Manage Your Money
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1.1: Expense Tracking */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${
            darkMode ? 'glass-panel-dark border-slate-800/80' : 'glass-panel-light border-slate-200'
          }`}>
            <div>
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <Receipt size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-255 m-0">1. Expense Tracking</h4>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-medium">
                Keep a flawless record of where your money goes. Go to the Expenses page to add transactions manually or upload visual receipt scans for automatic OCR extraction.
              </p>
            </div>
            <span className="text-[9px] text-teal-400 font-bold block mt-4 border-t border-slate-800/40 pt-3">
              💡 Tip: Log transactions daily for perfect accuracy!
            </span>
          </div>

          {/* Card 1.2: Budget Management */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${
            darkMode ? 'glass-panel-dark border-slate-800/80' : 'glass-panel-light border-slate-200'
          }`}>
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <PiggyBank size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-255 m-0">2. Category-Specific Budgets</h4>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-medium">
                Set monthly boundaries for categories like Food, Shopping, or Transport. Atom monitors your spent percentage and displays instant glowing alerts when you use more than 85% of your limit.
              </p>
            </div>
            <span className="text-[9px] text-purple-400 font-bold block mt-4 border-t border-slate-800/40 pt-3">
              💡 Tip: Avoid category overspending to save more cushion!
            </span>
          </div>

          {/* Card 1.3: Goal Planning */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${
            darkMode ? 'glass-panel-dark border-slate-800/80' : 'glass-panel-light border-slate-200'
          }`}>
            <div>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Target size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-255 m-0">3. Goals & Milestones</h4>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-medium">
                Plan for high-value targets (e.g. Laptop, Bike, emergency Reserve). Enter target amounts and dates, and allocate savings toward them. Atom gives you a live countdown of remaining days.
              </p>
            </div>
            <span className="text-[9px] text-cyan-400 font-bold block mt-4 border-t border-slate-800/40 pt-3">
              💡 Tip: Set up clear milestone descriptions in settings!
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Best Practices for Strategic Coaching */}
      <div className="grid grid-cols-1 gap-6">

        {/* Getting Best Experience Card */}
        <div className={`p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-cyan-500/30 ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold font-display m-0 text-slate-200">Tips for the Best Experience</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
            Follow these essential guidelines to let Atom give you hyper-personalized strategic coaching:
          </p>
          <ul className="text-xs text-slate-350 space-y-2.5 pl-4 list-disc font-semibold mt-3">
            <li><span className="text-cyan-400">Add daily expenses</span>: Consistency ensures accurate habit and weakness tracking.</li>
            <li><span className="text-cyan-400">Track for 21 Active Days</span>: The AI needs 21 calendar days of expense data to construct your Spending Personality.</li>
            <li><span className="text-cyan-400">Define realistic goals</span>: Set milestones in Settings to guide your savings advisor.</li>
          </ul>
        </div>

      </div>

      {/* Section 3: Spending Personalities & Personal AI Coach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 3.1: Personality Classifications */}
        <div className={`p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
            <BookOpen size={20} />
          </div>
          <h3 className="text-lg font-bold font-display m-0 text-slate-200">Understanding Your Profile</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
            {isStudent 
              ? "Based on your student status, Atom evaluates you using hyper-focused student spending classes:" 
              : "Based on your professional profile, Atom evaluates you using strategic wealth-building spending classes:"}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-400 font-bold">
            {isStudent ? (
              <>
                <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/40 text-center">🎓 Scholar Saver</span>
                <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/40 text-center">⚖️ Balanced Academic</span>
                <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/40 text-center">🛍️ Lifestyle Scholar</span>
                <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/40 text-center">💼 Smart Saver</span>
              </>
            ) : (
              <>
                <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/40 text-center">💼 Smart Saver</span>
                <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/40 text-center">📈 Future Investor</span>
                <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/40 text-center">🌟 Experience Seeker</span>
                <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/40 text-center">🛍️ Impulse Buyer</span>
              </>
            )}
          </div>
        </div>

        {/* Card 3.2: AI Coaching Conversations */}
        <div className={`p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
            <MessageSquare size={20} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold font-display m-0 text-slate-200">Personal AI Coach: Atom</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
            Ask Atom deep financial reasoning questions or run purchase simulations like:
          </p>
          <ul className="text-xs text-slate-350 space-y-1.5 pl-4 list-disc font-semibold mt-3">
            <li>"Can I buy a laptop this month?"</li>
            <li>"How can I cut down my food budget?"</li>
            <li>"Analyze my budget rules and give me a customized savings strategy."</li>
          </ul>
        </div>

      </div>

      {/* Section 4: Premium Ticket Support Notice */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${
        darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
      }`}>
        <div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-450 flex items-center justify-center mb-4 animate-pulse">
            <MessageSquare size={20} className="text-rose-400" />
          </div>
          <h3 className="text-lg font-bold font-display m-0 text-slate-200">Premium Ticket Support Hub</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
            Need direct help or have a database question? We are currently overhauling our secure ticketing dashboard and direct coach chat channels to support instant, formal resolution times.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl w-max mt-4">
          <Hourglass size={10} className="animate-spin" />
          <span>Direct Support Gateways Coming Soon!</span>
        </div>
      </div>

    </div>
  );
};
