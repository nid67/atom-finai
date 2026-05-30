import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Landmark, Compass, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingProps {
  darkMode?: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ darkMode = true }) => {
  const { userData, updateOnboarding } = useAuth();
  
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(userData?.fullName || '');
  const [occupation, setOccupation] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('₹');
  const [financialGoal, setFinancialGoal] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStep = () => {
    if (step === 1 && !fullName.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (step === 2 && (!occupation.trim() || !monthlyIncome || parseFloat(monthlyIncome) <= 0)) {
      setError('Please enter your occupation and a valid monthly income.');
      return;
    }
    if (step === 3 && !financialGoal.trim()) {
      setError('Please state your primary financial goal.');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      await updateOnboarding({
        fullName,
        occupation,
        monthlyIncome: parseFloat(monthlyIncome),
        preferredCurrency,
        financialGoal
      });
      // Trigger canvas confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit onboarding profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Absolute Decorative Glow Rings */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none select-none" />

      {/* Main Card */}
      <div className={`w-full max-w-lg rounded-2xl border p-8 relative overflow-hidden transition-all duration-300 ${
        darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
      }`}>
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step 
                    ? 'w-8 bg-teal-500' 
                    : s < step 
                      ? 'w-4 bg-emerald-400' 
                      : 'w-4 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Step {step} of 3
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* --- STEP 1: Basic Identity --- */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <Sparkles size={24} />
              </div>
              <h2 className="text-2xl font-bold font-display m-0">Welcome to Atom FinAI</h2>
              <p className="text-sm text-slate-400 mt-2 m-0">
                Let's start your personalized wealth management journey. What should your financial coach call you?
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  darkMode 
                    ? 'bg-slate-900/60 border-slate-800 text-slate-100 placeholder-slate-500' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
            
            <button
              onClick={nextStep}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20 mt-4 cursor-pointer"
            >
              Continue
            </button>
          </div>
        )}

        {/* --- STEP 2: Occupation & Income --- */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <Landmark size={24} />
              </div>
              <h2 className="text-2xl font-bold font-display m-0">Income & Occupation</h2>
              <p className="text-sm text-slate-400 mt-2 m-0">
                Your coach requires monthly income indicators to construct budget targets and calculate savings volatility.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Currency Symbol
                </label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                    darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200'
                  }`}
                >
                  <option value="₹">₹ (INR Rupee)</option>
                  <option value="$">$ (USD Dollar)</option>
                  <option value="€">€ (Euro)</option>
                  <option value="£">£ (GBP Pound)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Monthly Income
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="e.g. 50000"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                    darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-200 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Occupation
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Software Engineer, Student, Entrepreneur"
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-200 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={prevStep}
                className={`flex-1 py-3.5 border rounded-xl font-bold transition-all cursor-pointer ${
                  darkMode ? 'border-slate-800 hover:bg-slate-900/40' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: Goals --- */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <Compass size={24} />
              </div>
              <h2 className="text-2xl font-bold font-display m-0">Define Your Core Goal</h2>
              <p className="text-sm text-slate-400 mt-2 m-0">
                What is the primary target your financial coach should keep in focus?
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Financial Goal Statement
              </label>
              <textarea
                value={financialGoal}
                onChange={(e) => setFinancialGoal(e.target.value)}
                placeholder="e.g. Save ₹2,00,000 for emergency backup, purchase a home down payment, clear credit card deficits."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none ${
                  darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-200 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={prevStep}
                className={`flex-1 py-3.5 border rounded-xl font-bold transition-all cursor-pointer ${
                  darkMode ? 'border-slate-800 hover:bg-slate-900/40' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Initializing Coach...' : (
                  <>
                    <CheckCircle size={18} />
                    <span>Launch Coach</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
