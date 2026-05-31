import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, Zap, MessageSquare, Hourglass } from 'lucide-react';

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
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Ambient glowing gradient highlights */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-teal-500/5 blur-3xl pointer-events-none select-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none select-none" />

      {/* Header section */}
      <div>
        <h2 className="text-3xl font-display font-extrabold tracking-tight m-0 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          User Guide & Support Hub
        </h2>
        <p className="text-sm text-slate-400 mt-1.5 m-0 font-medium">
          Learn how to maximize your financial intelligence and use Atom FinAI for the best experience.
        </p>
      </div>

      {/* Interactive Quick Help / Guide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Adding Inflows (Income) */}
        <div className={`p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-teal-500/30 ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
            <Zap size={20} />
          </div>
          <h3 className="text-lg font-bold font-display m-0 text-slate-200">How to Log Unexpected Inflows</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
            Keep track of side income, cash gifts, or pocket allowance from parents easily:
          </p>
          <ul className="text-xs text-slate-350 space-y-2 pl-4 list-disc font-semibold mt-3">
            <li>Go to the <span className="text-teal-400">Expenses</span> page.</li>
            <li>Click on <span className="text-teal-400">Add Expense</span>.</li>
            <li>In the Category dropdown, select <span className="text-teal-400">Unexpected Inflow</span>.</li>
            <li>The form will instantly simplify to only collect the Amount, Date, and Source Description!</li>
          </ul>
          <span className="text-[10px] text-teal-400 font-bold block mt-4 bg-teal-500/10 px-2.5 py-1 rounded-lg w-max">
            💡 Added directly to your Monthly Inflow!
          </span>
        </div>

        {/* Card 2: Getting the Best Experience */}
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
          <ul className="text-xs text-slate-350 space-y-2 pl-4 list-disc font-semibold mt-3">
            <li><span className="text-cyan-400">Add daily expenses</span>: Consistency ensures accurate habit and weakness tracking.</li>
            <li><span className="text-cyan-400">Track for 21 Active Days</span>: The AI needs 21 calendar days of expense data to construct your Spending Personality.</li>
            <li><span className="text-cyan-400">Define realistic goals</span>: Set milestones in Settings to guide your savings advisor.</li>
          </ul>
        </div>

        {/* Card 3: Behavioral Profiles */}
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

        {/* Card 4: Direct Ticket Support (Coming Soon) */}
        <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-450 flex items-center justify-center mb-4 animate-pulse">
              <MessageSquare size={20} className="text-rose-400" />
            </div>
            <h3 className="text-lg font-bold font-display m-0 text-slate-200">Premium Ticket Support</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
              We are currently overhauling our secure ticketing dashboard and direct coach chat channels to support instant resolution times.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl w-max mt-4">
            <Hourglass size={10} className="animate-spin" />
            <span>Direct Support Coming Soon!</span>
          </div>
        </div>

      </div>

    </div>
  );
};
