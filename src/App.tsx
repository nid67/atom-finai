import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Budgets } from './pages/Budgets';
import { Goals } from './pages/Goals';
import { AICoach } from './pages/AICoach';
import { Subscriptions } from './pages/Subscriptions';
import { Share } from './pages/Share';
import { Support } from './pages/Support';
import { Privacy } from './pages/Privacy';
import { RefreshCw, Menu } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, userData, loading } = useAuth();
  
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync dark class on body element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = '#050811';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#F8FAFC';
    }
  }, [darkMode]);

  // Loading Splash Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-200">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center animate-spin shadow-lg shadow-teal-500/25 mb-4">
          <RefreshCw size={24} className="text-slate-950" />
        </div>
        <span className="text-xs uppercase font-bold tracking-widest text-slate-400 animate-pulse">
          Atom FinAI Loading...
        </span>
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return <Login darkMode={darkMode} />;
  }

  // Onboarding Guard
  if (userData && !userData.onboardingCompleted) {
    return <Onboarding darkMode={darkMode} />;
  }

  // Main Premium Dashboard Shell
  return (
    <FinanceProvider>
      <div className={`min-h-screen flex transition-colors duration-300 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}>
        {/* Left Navigation Sidebar */}
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setIsSidebarOpen(false);
          }} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Mobile Sidebar Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          />
        )}

        {/* Right Scrollable Content Pane */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8 relative flex flex-col">
          {/* Top Decorative Ambient Lights */}
          <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-gradient-to-br from-teal-500/5 to-cyan-500/5 blur-3xl pointer-events-none select-none animate-glow-cyan" />

          {/* Sticky Mobile Header Banner */}
          <header className={`lg:hidden flex items-center justify-between p-4 mb-4 rounded-2xl border backdrop-blur-md z-30 sticky top-0 ${
            darkMode ? 'bg-slate-950/80 border-slate-900' : 'bg-white/80 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Menu size={18} />
              </button>
              <h1 className="font-display font-extrabold text-lg m-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Atom FinAI
              </h1>
            </div>
            
            {userData && (
              <img 
                src={userData.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'} 
                alt="User profile" 
                className="w-8 h-8 rounded-full object-cover border border-teal-500"
              />
            )}
          </header>

          {/* Conditional View Router */}
          <div className="max-w-6xl mx-auto w-full relative z-10 flex-1">
            {currentTab === 'dashboard' && <Dashboard darkMode={darkMode} />}
            {currentTab === 'expenses' && <Expenses darkMode={darkMode} />}
            {currentTab === 'budgets' && <Budgets darkMode={darkMode} />}
            {currentTab === 'goals' && <Goals darkMode={darkMode} />}
            {currentTab === 'coach' && <AICoach darkMode={darkMode} />}
            {currentTab === 'subscriptions' && <Subscriptions darkMode={darkMode} />}
            {currentTab === 'share' && <Share darkMode={darkMode} />}
            {currentTab === 'support' && <Support darkMode={darkMode} />}
            {currentTab === 'privacy' && <Privacy darkMode={darkMode} />}
          </div>
        </main>
      </div>
    </FinanceProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
