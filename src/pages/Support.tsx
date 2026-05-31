import { Heart, Hourglass } from 'lucide-react';

interface SupportProps {
  darkMode?: boolean;
}

export const Support: React.FC<SupportProps> = ({ darkMode = true }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      {/* Dynamic ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-rose-500/5 blur-3xl pointer-events-none select-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full bg-purple-500/5 blur-3xl pointer-events-none select-none" />

      {/* Hero Badge */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/15 to-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-6 animate-float-slow shadow-lg shadow-rose-500/5">
          <Heart size={32} className="fill-rose-500/20" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight m-0 bg-gradient-to-r from-purple-400 via-rose-450 to-pink-400 bg-clip-text text-transparent">
          Direct Support FinAI
        </h2>
        
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest bg-rose-500/10 text-rose-450 border border-rose-500/20 rounded-full">
          <Hourglass size={12} className="animate-spin text-rose-400" />
          <span>Undergoing Upgrade</span>
        </span>
      </div>

      {/* Info Card Container */}
      <div className={`p-8 md:p-12 rounded-3xl border text-center space-y-6 max-w-2xl mx-auto relative overflow-hidden transition-all duration-350 hover:scale-[1.005] ${
        darkMode ? 'glass-panel-dark border-slate-800 shadow-2xl' : 'glass-panel-light border-slate-200'
      }`}>
        <div className="space-y-3 font-semibold">
          <h3 className="text-xl font-bold font-display m-0 text-slate-100">
            Premium Support Portal Coming Soon!
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto m-0 font-medium">
            We are overhauling our secure payment routing and direct UPI integrations to institute advanced multi-currency support, tax compliance, and instant tier activations.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-xs text-left leading-relaxed space-y-3 font-semibold max-w-md mx-auto">
          <div className="flex gap-2">
            <span className="text-teal-400 text-sm leading-none">•</span>
            <p className="m-0 text-slate-350 font-medium">
              **100% Secure**: Upgrading from direct UPI strings to formal bank-level stripe and institutional checkouts.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-teal-400 text-sm leading-none">•</span>
            <p className="m-0 text-slate-350 font-medium">
              **Tier Benefits**: Earn premium badges, unlimited daily AI consultations, and custom financial forecasting graphs.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/40 pt-6 space-y-4 max-w-md mx-auto">
          <p className="text-[11px] text-slate-500 font-bold m-0 leading-relaxed">
            In the meantime, we value your feedback! If there are custom features or specific subscription perks you want us to add, let us know!
          </p>
        </div>
      </div>
    </div>
  );
};
