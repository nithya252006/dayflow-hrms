import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export const AppButton = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-2xl active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-xl',
    md: 'px-4 py-2 text-sm gap-2 rounded-2xl',
    lg: 'px-6 py-2.5 text-base gap-2.5 rounded-2xl',
    icon: 'p-2 rounded-xl',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-glow-cyan hover:shadow-glow-cyan-lg hover:brightness-110 border border-white/20 font-semibold',
    secondary:
      'bg-[#122146] hover:bg-[#182c5c] text-slate-200 border border-brand-cyan/20 hover:border-brand-cyan/40 shadow-sm',
    danger:
      'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 hover:border-rose-500/50',
    success:
      'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50',
    ghost:
      'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white',
    outline:
      'bg-transparent border border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/10 hover:border-brand-cyan/60 shadow-glow-pill',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin text-current" />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 17} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={size === 'sm' ? 14 : 17} />
      )}
    </button>
  );
};

export default AppButton;
