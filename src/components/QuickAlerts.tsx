import type { AlertMessage } from '../engines/RuleEngine';
import { AlertOctagon, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface QuickAlertsProps {
  alerts: AlertMessage[];
  darkMode?: boolean;
}

export const QuickAlerts: React.FC<QuickAlertsProps> = ({ alerts, darkMode = true }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {alerts.map((alert) => {
        let cardStyle = '';
        let Icon = ShieldCheck;
        let iconColor = '';

        switch (alert.type) {
          case 'alert':
            cardStyle = darkMode 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
              : 'bg-rose-50 border-rose-100 text-rose-800';
            Icon = AlertOctagon;
            iconColor = 'text-rose-500';
            break;
          case 'warning':
            cardStyle = darkMode 
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
              : 'bg-amber-50 border-amber-100 text-amber-800';
            Icon = AlertTriangle;
            iconColor = 'text-amber-500';
            break;
          case 'success':
            cardStyle = darkMode 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-800';
            Icon = Sparkles;
            iconColor = 'text-emerald-500';
            break;
          default:
            cardStyle = darkMode 
              ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' 
              : 'bg-cyan-50 border-cyan-100 text-cyan-800';
            Icon = ShieldCheck;
            iconColor = 'text-cyan-500';
        }

        return (
          <div 
            key={alert.id}
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 shadow-sm ${cardStyle}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div>
              <h4 className="font-display font-semibold text-sm m-0 leading-snug">
                {alert.title}
              </h4>
              <p className="text-xs opacity-90 mt-1 m-0 leading-relaxed">
                {alert.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
