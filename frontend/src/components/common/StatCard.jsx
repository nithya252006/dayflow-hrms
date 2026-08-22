import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  progress,
  color = 'cyan', // 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose'
  className,
  onClick,
}) => {
  const colorMap = {
    cyan: {
      iconBg: 'bg-brand-cyan/10 border-brand-cyan/25 text-brand-cyan shadow-glow-pill',
      bar: 'bg-brand-cyan',
      glow: 'hover:border-brand-cyan/40',
    },
    blue: {
      iconBg: 'bg-brand-blue/15 border-brand-blue/30 text-blue-400',
      bar: 'bg-brand-blue',
      glow: 'hover:border-brand-blue/40',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
      bar: 'bg-emerald-400',
      glow: 'hover:border-emerald-500/40',
    },
    amber: {
      iconBg: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
      bar: 'bg-amber-400',
      glow: 'hover:border-amber-500/40',
    },
    rose: {
      iconBg: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
      bar: 'bg-rose-400',
      glow: 'hover:border-rose-500/40',
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div
      onClick={onClick}
      className={clsx(
        'glass-card rounded-3xl p-5 transition-all duration-300 relative overflow-hidden',
        onClick && 'cursor-pointer hover:scale-[1.01]',
        c.glow,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-brand-textMuted uppercase tracking-wider">
            {title}
          </span>
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            className={clsx(
              'w-10 h-10 rounded-2xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-105',
              c.iconBg
            )}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      {(subtitle || trend || progress !== undefined) && (
        <div className="mt-4 pt-3 border-t border-white/[0.04]">
          {progress !== undefined && (
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className={clsx('h-1.5 rounded-full transition-all duration-500', c.bar)}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            {subtitle && <span className="text-brand-textMuted">{subtitle}</span>}
            {trend && (
              <span
                className={clsx(
                  'inline-flex items-center gap-1 font-medium',
                  trendType === 'up' && 'text-emerald-400',
                  trendType === 'down' && 'text-rose-400',
                  trendType === 'neutral' && 'text-slate-400'
                )}
              >
                {trendType === 'up' && <TrendingUp size={13} />}
                {trendType === 'down' && <TrendingDown size={13} />}
                {trend}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
