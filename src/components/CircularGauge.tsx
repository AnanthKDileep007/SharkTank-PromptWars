import React from 'react';

interface CircularGaugeProps {
  score: number;
  max?: number;
  label: string;
  color?: 'emerald' | 'amber' | 'rose' | 'cyan';
  size?: number;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  score,
  max = 100,
  label,
  color = 'cyan',
  size = 110
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score / max, 0), 1);
  const strokeDashoffset = circumference - progress * circumference;

  const getColorClasses = () => {
    switch (color) {
      case 'rose':
        return {
          stroke: '#F43F5E',
          glow: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]',
          text: 'text-rose-400'
        };
      case 'emerald':
        return {
          stroke: '#10B981',
          glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]',
          text: 'text-emerald-400'
        };
      case 'amber':
        return {
          stroke: '#F59E0B',
          glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]',
          text: 'text-amber-400'
        };
      case 'cyan':
      default:
        return {
          stroke: '#06B6D4',
          glow: 'drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]',
          text: 'text-cyan-400'
        };
    }
  };

  const c = getColorClasses();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={c.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className={`transition-all duration-1000 ease-out ${c.glow}`}
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-100 font-mono tracking-tight leading-none">
            {score}
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
            /{max}
          </span>
        </div>
      </div>

      <span className="text-xs font-semibold text-slate-400 mt-2.5 text-center">
        {label}
      </span>
    </div>
  );
};
