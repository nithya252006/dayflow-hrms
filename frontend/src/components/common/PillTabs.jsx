import React from 'react';
import clsx from 'clsx';

export const PillTabs = ({ tabs, activeTab, onChange, className, size = 'md' }) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center bg-[#071126]/90 p-1 rounded-2xl border border-brand-cyan/15 backdrop-blur-md',
        className
      )}
    >
      {tabs.map((tab) => {
        const tabKey = typeof tab === 'string' ? tab : tab.key || tab.id;
        const tabLabel = typeof tab === 'string' ? tab : tab.label || tab.name;
        const tabIcon = typeof tab === 'object' ? tab.icon : null;
        const isActive = activeTab === tabKey;

        return (
          <button
            key={tabKey}
            type="button"
            onClick={() => onChange(tabKey)}
            className={clsx(
              'flex items-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer',
              size === 'sm' && 'px-3 py-1 text-xs',
              size === 'md' && 'px-4 py-1.5 text-xs sm:text-sm',
              size === 'lg' && 'px-5 py-2 text-sm',
              isActive
                ? 'glow-pill-active text-white font-semibold'
                : 'text-brand-textMuted hover:text-slate-200 hover:bg-white/[0.04]'
            )}
          >
            {tabIcon && <span className="text-current">{tabIcon}</span>}
            <span>{tabLabel}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PillTabs;
