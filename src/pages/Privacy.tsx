import React from 'react';
import { Shield, Check, X, ShieldCheck } from 'lucide-react';

interface PrivacyProps {
  darkMode?: boolean;
}

export const Privacy: React.FC<PrivacyProps> = ({ darkMode = true }) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-4 animate-float-slow shadow-md">
          <Shield size={24} />
        </div>
        <h2 className="text-3xl font-display font-extrabold tracking-tight m-0 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Privacy & Security Trust
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          We understand that financial logs require strict confidentiality. Atom FinAI operates on strict zero-exposure rules.
        </p>
      </div>

      {/* Stored vs Not Stored comparison grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Left Side: Stored */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Check size={18} className="flex-shrink-0" />
            <h3 className="text-lg font-bold font-display m-0">What is Stored</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed m-0">
            We store only the necessary metadata elements required to compile your calculations and build your behavioral coach profile:
          </p>
          <ul className="space-y-2 text-xs font-semibold text-slate-300 pl-4 list-disc">
            <li>Expenses: category, amount, merchant, date</li>
            <li>Budgets: limits, category spent totals</li>
            <li>Goals: milestone name, target date, saved reserves</li>
            <li>Profile Preferences: monthly income and occupations</li>
            <li>AI Coach queries used today (tracked for daily quota limit)</li>
          </ul>
        </div>

        {/* Right Side: NEVER Stored */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5 text-rose-400">
            <X size={18} className="flex-shrink-0" />
            <h3 className="text-lg font-bold font-display m-0">What is NEVER Stored</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed m-0">
            We never request or store sensitive banking authenticators, card numbers, or transaction routes:
          </p>
          <ul className="space-y-2 text-xs font-semibold text-slate-300 pl-4 list-disc">
            <li>Bank credentials or account numbers</li>
            <li>Credit/Debit Card PINs, CVVs, or expirations</li>
            <li>SMS OTP codes or transaction validation parameters</li>
            <li>Raw uploaded receipt image binary blobs (processed and deleted)</li>
            <li>Passwords (authenticated exclusively via secure Google OAuth tokens)</li>
          </ul>
        </div>
      </div>

      {/* Security highlights */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5 text-teal-400">
          <ShieldCheck size={18} className="flex-shrink-0" />
          <h3 className="text-lg font-bold font-display m-0">Architecture Integrity</h3>
        </div>
        
        <div className="space-y-3 text-xs leading-relaxed text-slate-300 font-semibold">
          <p className="m-0">
            <strong className="font-extrabold text-slate-100">1. User Data Isolation</strong>: Every Firestore operation runs under strict security rules comparing requests directly to Google Authentication UID strings. No other user can scan or identify your records.
          </p>
          <p className="m-0">
            <strong className="font-extrabold text-slate-100">2. Secure AI Context Gateway</strong>: Raw, detailed historical transaction lists are never exported to Gemini. The Context Builder summarizes data into high-level vectors (savings rate, goals, budget caps) to form coaching reasoning parameters safely.
          </p>
        </div>
      </div>
    </div>
  );
};
