import React from 'react';
import clsx from 'clsx';

export const AppCard = ({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className,
  headerClassName,
  bodyClassName,
  noPadding = false,
  glow = false,
}) => {
  return (
    <div
      className={clsx(
        'glass-card rounded-3xl transition-all duration-300 relative overflow-hidden',
        glow && 'glow-cyan-border',
        className
      )}
    >
      {(title || action || Icon) && (
        <div
          className={clsx(
            'flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.04]',
            headerClassName
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-glow-pill">
                <Icon size={18} />
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-semibold text-base text-slate-100 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-brand-textMuted mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={clsx(!noPadding && 'p-6', bodyClassName)}>{children}</div>
    </div>
  );
};

export default AppCard;
