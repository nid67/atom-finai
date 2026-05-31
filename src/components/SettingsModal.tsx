import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Save, Sliders, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  darkMode = true 
}) => {
  const { userData, updateOnboarding } = useAuth();
  
  // Base State Declarations
  const [fullName, setFullName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('₹');
  const [financialGoal, setFinancialGoal] = useState('');

  // Student specific funding parameters
  const [isStudent, setIsStudent] = useState(false);
  const [studentFundingSource, setStudentFundingSource] = useState<'earn' | 'parents' | 'both' | ''>('');
  const [parentFundingInterval, setParentFundingInterval] = useState<'daily' | 'weekly' | 'monthly' | 'irregular' | ''>('');
  const [parentFundingAmount, setParentFundingAmount] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  // Hydrate states when user profile details load
  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || '');
      setOccupation(userData.occupation || '');
      setMonthlyIncome(userData.monthlyIncome?.toString() || '');
      setPreferredCurrency(userData.preferredCurrency || '₹');
      setFinancialGoal(userData.financialGoal || '');
      
      const lower = (userData.occupation || '').toLowerCase();
      const isStud = lower.includes('student') || lower.includes('college') || lower.includes('university') || lower.includes('school') || !!userData.isStudent;
      setIsStudent(isStud);
      
      setStudentFundingSource(userData.studentFundingSource || '');
      setParentFundingInterval(userData.parentFundingInterval || '');
      setParentFundingAmount(userData.parentFundingAmount?.toString() || '');
      
      if (userData.createdAt) {
        const dateObj = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
        setCreatedAt(dateObj.toISOString().split('T')[0]);
      }
    }
  }, [userData, isOpen]);

  if (!isOpen) return null;

  const handleOccupationChange = (val: string) => {
    setOccupation(val);
    const lower = val.toLowerCase();
    const isStud = lower.includes('student') || lower.includes('college') || lower.includes('university') || lower.includes('school');
    setIsStudent(isStud);
    if (!isStud) {
      setStudentFundingSource('');
      setParentFundingInterval('');
      setParentFundingAmount('');
    }
  };

  const handleParentFundingChange = (amountStr: string, intervalStr: string) => {
    setParentFundingAmount(amountStr);
    setParentFundingInterval(intervalStr as any);
    const amt = parseFloat(amountStr) || 0;
    if (amt <= 0 || !intervalStr) return;

    let computedMonthly = 0;
    if (intervalStr === 'daily') {
      computedMonthly = amt * 30;
    } else if (intervalStr === 'weekly') {
      computedMonthly = amt * 4.33;
    } else if (intervalStr === 'monthly') {
      computedMonthly = amt;
    } else if (intervalStr === 'irregular') {
      computedMonthly = amt;
    }

    if (computedMonthly > 0) {
      setMonthlyIncome(Math.round(computedMonthly).toString());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !occupation.trim() || !monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      setError('Please fill in all required fields with valid values.');
      return;
    }

    if (isStudent && (studentFundingSource === 'parents' || studentFundingSource === 'both')) {
      if (!parentFundingInterval) {
        setError('Please select parent funding interval.');
        return;
      }
      if (!parentFundingAmount || parseFloat(parentFundingAmount) <= 0) {
        setError('Please enter a valid parent allowance amount.');
        return;
      }
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updateOnboarding({
        fullName,
        occupation,
        monthlyIncome: parseFloat(monthlyIncome),
        preferredCurrency,
        financialGoal,
        isStudent,
        studentFundingSource,
        parentFundingInterval,
        parentFundingAmount: parentFundingAmount ? parseFloat(parentFundingAmount) : 0,
        parentFundingIntervalLabel: parentFundingInterval === 'daily' ? 'Day wise' : 
                                    parentFundingInterval === 'weekly' ? 'Week wise' : 
                                    parentFundingInterval === 'monthly' ? 'Month wise' : 
                                    parentFundingInterval === 'irregular' ? 'When parents have money' : '',
        createdAt: new Date(createdAt)
      });

      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.8 }
      });
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl border p-6 relative max-h-[90vh] overflow-y-auto ${
        darkMode ? 'glass-panel-dark border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-850'
      }`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-250 cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display m-0">Wealth Intelligence Profile Settings</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 m-0 font-medium">Modify core indicators and funding intervals anytime.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-semibold">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle size={24} />
            </div>
            <h4 className="font-bold text-slate-100">Settings Saved!</h4>
            <p className="text-xs text-slate-400">Recalculating AI metrics and budgets...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-slate-400">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            {/* Occupation */}
            <div className="space-y-1.5">
              <label className="text-slate-400">Occupation</label>
              <input
                type="text"
                required
                value={occupation}
                onChange={(e) => handleOccupationChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            {/* Student Funding Subfields */}
            {isStudent && (
              <div className={`p-4 rounded-xl border space-y-4 ${
                darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                    Student Funding Source
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    {[
                      { id: 'earn', label: 'Earn Income' },
                      { id: 'parents', label: 'Parent Allowance' },
                      { id: 'both', label: 'Both' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setStudentFundingSource(opt.id as any);
                          if (opt.id === 'earn') {
                            setParentFundingInterval('');
                            setParentFundingAmount('');
                          }
                        }}
                        className={`py-2 px-1 rounded-lg border font-bold transition-all cursor-pointer ${
                          studentFundingSource === opt.id 
                            ? 'bg-teal-500/10 border-teal-500/35 text-teal-400' 
                            : darkMode ? 'border-slate-800 text-slate-350 hover:bg-slate-950/45' : 'border-slate-200 text-slate-650 hover:bg-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(studentFundingSource === 'parents' || studentFundingSource === 'both') && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                          Parent Funding Interval
                        </label>
                        <select
                          value={parentFundingInterval}
                          onChange={(e) => handleParentFundingChange(parentFundingAmount, e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-850'
                          }`}
                        >
                          <option value="">Select interval...</option>
                          <option value="daily">Day-wise (Daily)</option>
                          <option value="weekly">Week-wise (Weekly)</option>
                          <option value="monthly">Month-wise (Monthly)</option>
                          <option value="irregular">Irregular (When parents have money)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                          Allowance Amount ({preferredCurrency})
                        </label>
                        <input
                          type="number"
                          value={parentFundingAmount}
                          onChange={(e) => handleParentFundingChange(e.target.value, parentFundingInterval)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                          }`}
                        />
                      </div>
                    </div>

                    {parseFloat(parentFundingAmount) > 0 && parentFundingInterval && (
                      <div className="p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/10 text-[10px] text-teal-400 font-bold flex items-center gap-1.5">
                        <span>💡 Calculated parent allowance: {preferredCurrency}{Math.round(
                          parentFundingInterval === 'daily' ? parseFloat(parentFundingAmount) * 30 :
                          parentFundingInterval === 'weekly' ? parseFloat(parentFundingAmount) * 4.33 :
                          parseFloat(parentFundingAmount)
                        ).toLocaleString()}/month</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Currency and Monthly Income */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-400">Currency Symbol</label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <option value="₹">₹ (INR Rupee)</option>
                  <option value="$">$ (USD Dollar)</option>
                  <option value="€">€ (Euro)</option>
                  <option value="£">£ (GBP Pound)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Monthly Income ({preferredCurrency})</label>
                <input
                  type="number"
                  required
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
            </div>
            
            {/* Account Age Simulation */}
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-slate-400">Simulate Account Learning Age (Registration Date)</label>
              <input
                type="date"
                required
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
              <span className="text-[10px] text-slate-400 block font-normal mt-0.5 leading-snug">
                💡 Simulate your registration date in the past (e.g. 21 days ago) to instantly see your Behavioral Profile, AI Coach confidence, and stage tracker metrics complete!
              </span>
            </div>

            {/* Goal statement */}
            <div className="space-y-1.5">
              <label className="text-slate-400">Primary Financial Goal Statement</label>
              <textarea
                required
                value={financialGoal}
                onChange={(e) => setFinancialGoal(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 hover:scale-101"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save size={14} />
                  <span>Update Base Profile Settings</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
