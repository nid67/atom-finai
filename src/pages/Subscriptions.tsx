import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { BellRing, AlertCircle } from 'lucide-react';

interface SubscriptionsProps {
  darkMode?: boolean;
}

export const Subscriptions: React.FC<SubscriptionsProps> = ({ darkMode = true }) => {
  const { userData } = useAuth();
  const { subscriptions } = useFinance();
  const currency = userData?.preferredCurrency || '₹';

  // Calculate sums
  const totalMonthlyCost = subscriptions.reduce((sum, s) => sum + s.recurringAmount, 0);
  const totalYearlyCost = totalMonthlyCost * 12;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-display font-extrabold tracking-tight m-0">
          Auto-detected Subscriptions
        </h2>
        <p className="text-sm text-slate-400 mt-1 m-0">
          Atom's analytical pattern-scanner automatically tracks recurring costs (recurring merchants and identical amounts separated by 25-35 days).
        </p>
      </div>

      {/* Aggregate metrics strips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Monthly Outflow
          </span>
          <h3 className="text-3xl font-display font-extrabold tracking-tight mt-2 m-0 text-slate-100">
            {currency}{totalMonthlyCost.toLocaleString()}/mo
          </h3>
        </div>

        <div className={`p-6 rounded-2xl border ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Estimated Outflow Per Annum
          </span>
          <h3 className="text-3xl font-display font-extrabold tracking-tight mt-2 m-0 text-purple-400">
            {currency}{totalYearlyCost.toLocaleString()}/yr
          </h3>
        </div>
      </div>

      {/* Detail description banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        darkMode ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-800'
      }`}>
        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
        <p className="text-xs m-0 leading-relaxed font-semibold">
          <strong className="font-extrabold text-slate-100">Privacy Compliance Directive</strong>: Atom does not establish direct integrations with bank credentials, card details, or OTP readers. 
          All recurring indicators are compiled locally by scanning user-submitted manual transactions or scanned receipts.
        </p>
      </div>

      {/* List items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subscriptions.map((sub) => (
          <div 
            key={sub.subscriptionId}
            className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${
              darkMode 
                ? 'glass-panel-dark border-slate-800' 
                : 'glass-panel-light border-slate-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <BellRing size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm m-0 text-slate-100">{sub.merchantName}</h4>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Recurring monthly</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-extrabold text-slate-200 block">
                {currency}{sub.recurringAmount.toLocaleString()}/mo
              </span>
              <span className="text-[10px] text-slate-500 font-bold block">
                Est. {currency}{sub.estimatedYearlyCost.toLocaleString()}/yr
              </span>
            </div>
          </div>
        ))}

        {subscriptions.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-500 text-xs">
            No recurring subscription outflows identified yet. Log regular monthly transactions (Netflix, Spotify, Rent, Utilities) to enable auto-detection!
          </div>
        )}
      </div>
    </div>
  );
};
