import React from 'react';
import clsx from 'clsx';
import { CreditCard, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';

export const HeroGradientCard = ({
  title = 'Balance',
  value = '$2,102',
  subtitle = 'Total Flow',
  subValue = '$19,948',
  badgeText = 'Budget Load',
  badgePercent = '41%',
  changeText = 'Actual Change +$2.0k',
  maskedId = 'EMP-****-1001',
  icon: Icon = CreditCard,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative rounded-3xl p-6 overflow-hidden text-white transition-all duration-300',
        'bg-gradient-to-br from-[#0c2854] via-[#091738] to-[#060e24]',
        'border border-brand-cyan/25 shadow-glow-cyan/20 shadow-2xl',
        'hover:border-brand-cyan/40 hover:shadow-glow-cyan/30 cursor-pointer',
        className
      )}
    >
      {/* Ambient background glow circle */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-brand-cyan/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-blue/20 rounded-full blur-2xl pointer-events-none" />

      {/* Background Neon Wave line graphic */}
      <svg
        className="absolute bottom-2 left-0 right-0 w-full h-24 opacity-25 pointer-events-none"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cyanWave" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0078FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 C80,20 160,85 240,40 C320,5 360,70 400,30 L400,100 L0,100 Z"
          fill="url(#cyanWave)"
        />
        <path
          d="M0,60 C80,20 160,85 240,40 C320,5 360,70 400,30"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="2"
        />
      </svg>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-brand-cyan/80">
            {title}
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">{value}</h2>
        </div>

        {/* Circular load percentage pill */}
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-brand-cyan/20">
          <span className="text-[11px] text-slate-300">{badgeText}</span>
          <div className="w-7 h-7 rounded-full bg-brand-cyan/20 border border-brand-cyan text-brand-cyan text-xs font-bold flex items-center justify-center shadow-glow-pill">
            {badgePercent}
          </div>
        </div>
      </div>

      {/* Masked Card / Employee ID pill */}
      <div className="relative z-10 flex items-center gap-2 text-xs text-slate-300/80 mb-6 bg-white/[0.04] w-fit px-3 py-1 rounded-full border border-white/5">
        <Icon size={13} className="text-brand-cyan" />
        <span className="tracking-widest font-mono text-[11px]">{maskedId}</span>
      </div>

      {/* Main Stat & Flow */}
      <div className="relative z-10">
        <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
          {subValue}
        </div>
        <div className="text-xs text-brand-cyan/70 mt-0.5 font-medium">{subtitle}</div>
      </div>

      {/* Bottom Change chip */}
      <div className="relative z-10 mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-brand-cyan font-medium">
          <TrendingUp size={14} />
          <span>{changeText}</span>
        </div>
        <ArrowUpRight size={16} className="text-slate-400 group-hover:text-brand-cyan transition-colors" />
      </div>
    </div>
  );
};

export default HeroGradientCard;
