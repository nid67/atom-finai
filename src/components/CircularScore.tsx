import React from 'react';

interface CircularScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  darkMode?: boolean;
}

export const CircularScore: React.FC<CircularScoreProps> = ({
  score = 100,
  size = 180,
  strokeWidth = 14,
  darkMode = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine colors based on scores
  let strokeColor = 'url(#healthGradientCyan)';
  let scoreLabel = 'Excellent';
  let scoreColorClass = 'text-cyan-400';

  if (score < 40) {
    strokeColor = 'url(#healthGradientRose)';
    scoreLabel = 'Critical';
    scoreColorClass = 'text-rose-500';
  } else if (score < 75) {
    strokeColor = 'url(#healthGradientAmber)';
    scoreLabel = 'Stable';
    scoreColorClass = 'text-amber-500';
  } else {
    strokeColor = 'url(#healthGradientCyan)';
    scoreLabel = 'Elite';
    scoreColorClass = 'text-emerald-400';
  }

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Animated Shadow Glow */}
        <div 
          className={`absolute inset-3 rounded-full blur-2xl opacity-25 transition-all duration-1000 ${
            score < 40 
              ? 'bg-rose-500' 
              : score < 75 
                ? 'bg-amber-500' 
                : 'bg-emerald-500'
          }`} 
        />

        <svg width={size} height={size} className="transform -rotate-90 relative z-10">
          <defs>
            {/* Emerald/Cyan Gradient */}
            <linearGradient id="healthGradientCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            
            {/* Amber/Orange Gradient */}
            <linearGradient id="healthGradientAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>

            {/* Rose/Purple Gradient */}
            <linearGradient id="healthGradientRose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={darkMode ? '#1E293B' : '#E2E8F0'}
            strokeWidth={strokeWidth}
            className="transition-colors duration-300"
          />

          {/* Active Fill Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </svg>

        {/* Text Details Inside */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Health Score
          </span>
          <span className={`text-4xl font-display font-extrabold tracking-tight ${scoreColorClass} animate-pulse-slow`}>
            {score}
          </span>
          <span className={`text-xs font-bold uppercase tracking-wider ${scoreColorClass}`}>
            {scoreLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
