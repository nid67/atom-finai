import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  Target, 
  MessageSquareCode, 
  MessageSquare,
  BellRing, 
  Share2, 
  HeartHandshake, 
  Lock, 
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Sliders,
  X
} from 'lucide-react';
import logo from '../assets/logo.png';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  darkMode, 
  setDarkMode,
  isOpen = false,
  onClose,
  onOpenSettings
}) => {
  const { userData, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'goals', label: 'Goals & Targets', icon: Target },
    { id: 'coach', label: 'AI Coach', icon: MessageSquareCode, badge: userData?.aiQueriesUsedToday !== undefined ? `${userData.aiQueriesUsedToday}/10` : undefined },
    { id: 'subscriptions', label: 'Subscriptions', icon: BellRing },
    { id: 'share', label: 'Share App', icon: Share2 },
    { id: 'support', label: 'Support FinAI', icon: HeartHandshake },
    { id: 'feedback', label: 'Feedback & Ideas', icon: MessageSquare },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
  ];

  return (
    <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex-shrink-0 flex flex-col justify-between border-r p-6 transition-transform duration-350 lg:static lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } ${
      darkMode 
        ? 'bg-slate-950/95 border-slate-900 text-slate-200' 
        : 'bg-white text-slate-700 border-slate-200 shadow-xl lg:shadow-none'
    }`}>
      {/* Top Brand Logo */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <img src={logo} alt="Atom FinAI Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl tracking-tight m-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Atom FinAI
              </h1>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-teal-500">
                Wealth Coach
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Quick Info */}
        {userData && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 relative overflow-hidden ${
            darkMode 
              ? 'bg-brand-panel-dark/40 border-slate-800' 
              : 'bg-slate-50 border-slate-100'
          }`}>
            <img 
              src={userData.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'} 
              alt="User profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate m-0 leading-tight">
                {userData.fullName}
              </p>
              <p className="text-[10px] text-slate-400 truncate m-0 leading-tight">
                {userData.occupation || 'Personal Finance'}
              </p>
              <div className="flex items-center gap-1 mt-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold w-fit">
                <Sparkles size={10} />
                <span>{userData.financialPersonality}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-290px)] pr-1 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm group ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border-l-4 border-teal-500 text-teal-400 font-semibold' 
                    : darkMode 
                      ? 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={`transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-teal-400' : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive 
                      ? 'bg-teal-500/20 text-teal-400' 
                      : darkMode 
                        ? 'bg-slate-800 text-slate-400' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Toggles & Sign Out */}
      <div className="flex flex-col gap-4 mt-6">
        {/* Light/Dark Toggle */}
        <div className={`flex items-center justify-between p-3 rounded-xl border ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-xs font-semibold">Appearance</span>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              darkMode ? 'bg-slate-800 text-amber-400' : 'bg-white text-indigo-600 shadow'
            }`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Profile Settings */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-xs font-bold text-slate-400 hover:text-slate-250 cursor-pointer ${
              darkMode ? 'border-slate-800/80 hover:bg-slate-900/50' : 'border-slate-200 hover:bg-slate-50 text-slate-650'
            }`}
          >
            <Sliders size={14} className="text-teal-400" />
            <span>Wealth Profile Settings</span>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent transition-all text-sm font-semibold text-red-400 hover:bg-red-500/10 ${
            darkMode ? 'hover:border-red-500/20' : 'hover:border-red-500/10'
          }`}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
