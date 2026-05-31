import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';

interface LoginProps {
  darkMode?: boolean;
}

export const Login: React.FC<LoginProps> = ({ darkMode = true }) => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/3 left-1/3 w-[30rem] h-[30rem] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[30rem] h-[30rem] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none select-none animate-glow-cyan" />

      {/* Main Container */}
      <div className={`w-full max-w-md rounded-3xl border p-8 flex flex-col items-center justify-between text-center relative overflow-hidden transition-all duration-500 hover:scale-[1.005] ${
        darkMode ? 'glass-panel-dark border-slate-800 shadow-2xl shadow-slate-950/50' : 'glass-panel-light border-slate-200'
      }`}>
        {/* Brand Icon */}
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto animate-float-slow">
            <img src={logo} alt="Atom FinAI Logo" className="w-full h-full object-contain rounded-2xl shadow-xl shadow-teal-500/10" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-display font-extrabold text-3xl tracking-tight m-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Atom FinAI
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-md tracking-wider animate-pulse">
                v1
              </span>
            </div>
            <span className="text-[10px] tracking-widest uppercase font-bold text-teal-400 mt-1 block">
              AI Wealth & Intelligence Coach
            </span>
          </div>
        </div>

        {/* Visual description */}
        <div className="my-8 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-[280px] mx-auto">
            Experience premium wealth intelligence. Manage budgets, log expenses, scan receipts, and consult your dedicated personal AI Financial Coach.
          </p>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl max-w-[300px] mx-auto">
              {error}
            </div>
          )}
        </div>

        {/* Login Action Area */}
        <div className="w-full space-y-4 font-semibold">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer select-none hover:scale-102"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin text-teal-500" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
            Secure oAuthentication Gateway
          </span>
        </div>

        {/* Security badges & Developer Credits */}
        <div className="mt-8 flex flex-col items-center gap-2 select-none">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-900/40 border border-slate-800/50 px-3 py-1.5 rounded-lg">
            <ShieldCheck size={12} className="text-teal-400 flex-shrink-0" />
            <span>Zero passwords or credit cards stored.</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wide mt-1 animate-pulse">
            Designed and Developed by Nidhin
          </span>
        </div>
      </div>
    </div>
  );
};
