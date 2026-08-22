import React from 'react';
import clsx from 'clsx';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = true,
  className,
}) => {
  const v = variant?.toLowerCase();

  const variantStyles = {
    // Attendance & Leave Positive Statuses
    present: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    approved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    paid: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',

    // Attendance & Leave Warning / In-progress
    'half-day': 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    draft: 'bg-amber-500/10 text-amber-300 border-amber-500/30',

    // Attendance & Leave Danger / Negative
    absent: 'bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    inactive: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    cancelled: 'bg-rose-500/10 text-rose-300 border-rose-500/30',

    // Informational / Leave types
    leave: 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30 shadow-glow-pill',
    sick: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    unpaid: 'bg-purple-500/10 text-purple-300 border-purple-500/30',

    // Roles
    admin: 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/40 shadow-glow-pill font-semibold',
    hr: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 font-semibold',
    employee: 'bg-slate-500/15 text-slate-300 border-slate-500/30',

    // Generic Color tokens
    cyan: 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30 shadow-glow-pill',
    blue: 'bg-brand-blue/15 text-blue-300 border-brand-blue/30',
    neutral: 'bg-white/[0.06] text-slate-300 border-white/10',
  };

  const dotColors = {
    present: 'bg-emerald-400',
    approved: 'bg-emerald-400',
    paid: 'bg-emerald-400',
    'half-day': 'bg-amber-400',
    pending: 'bg-amber-400',
    draft: 'bg-amber-400',
    absent: 'bg-rose-400',
    rejected: 'bg-rose-400',
    inactive: 'bg-rose-400',
    cancelled: 'bg-rose-400',
    leave: 'bg-brand-cyan',
    sick: 'bg-sky-400',
    unpaid: 'bg-purple-400',
    admin: 'bg-brand-cyan',
    hr: 'bg-indigo-400',
    employee: 'bg-slate-400',
    cyan: 'bg-brand-cyan',
    blue: 'bg-blue-400',
    neutral: 'bg-slate-400',
  };

  const activeStyle = variantStyles[v] || variantStyles.neutral;
  const activeDotColor = dotColors[v] || dotColors.neutral;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-all duration-200',
        size === 'sm' && 'px-2 py-0.5 text-[11px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        size === 'lg' && 'px-3.5 py-1.5 text-sm',
        activeStyle,
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', activeDotColor)} />
      )}
      {children}
    </span>
  );
};

export default Badge;
