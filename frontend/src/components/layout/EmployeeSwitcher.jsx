import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI } from '../../services/api';
import { Users, Check, ChevronDown, UserCheck } from 'lucide-react';
import clsx from 'clsx';

export const EmployeeSwitcher = () => {
  const { user, isStaff, perspectiveUser, setPerspectiveUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isStaff) {
      const fetchEmployees = async () => {
        try {
          const res = await employeeAPI.getAll({ limit: 50 });
          if (res.success && res.employees) {
            setEmployees(res.employees);
          }
        } catch (err) {
          console.error('Failed to load employee switcher list:', err);
        }
      };
      fetchEmployees();
    }
  }, [isStaff]);

  if (!isStaff) return null;

  const currentView = perspectiveUser || user;
  const isViewingSelf = !perspectiveUser || perspectiveUser._id === user._id;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-medium transition-all duration-200 cursor-pointer',
          !isViewingSelf
            ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-glow-pill'
            : 'bg-[#0a152e] border-brand-cyan/20 text-slate-300 hover:border-brand-cyan/40 hover:text-white'
        )}
      >
        <Users size={14} className="text-brand-cyan" />
        <span className="hidden md:inline text-brand-textMuted">View As:</span>
        <span className="font-semibold text-slate-100 max-w-[110px] truncate">
          {currentView?.name || 'Self'}
        </span>
        <ChevronDown size={13} className="text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 glass-card rounded-2xl border border-brand-cyan/25 shadow-glow-cyan/20 z-50 p-2 max-h-80 overflow-y-auto">
            <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
              <p className="text-xs font-semibold text-brand-cyan">
                Employee Perspective Switcher
              </p>
              <p className="text-[11px] text-brand-textMuted mt-0.5">
                Switch perspective to view dashboard as any employee
              </p>
            </div>

            {/* Reset to Self (Admin view) */}
            <button
              type="button"
              onClick={() => {
                setPerspectiveUser(null);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer',
                isViewingSelf
                  ? 'bg-brand-cyan/15 text-brand-cyan font-semibold'
                  : 'hover:bg-white/[0.05] text-slate-300'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-[10px]">
                  ADM
                </div>
                <div>
                  <div className="font-semibold">{user?.name} (My Admin View)</div>
                  <div className="text-[10px] text-brand-textMuted">{user?.role?.toUpperCase()}</div>
                </div>
              </div>
              {isViewingSelf && <Check size={14} className="text-brand-cyan" />}
            </button>

            <div className="my-1 border-t border-white/[0.06]" />

            {/* List of other employees */}
            {employees.map((emp) => {
              const isSelected = perspectiveUser?._id === emp._id;
              return (
                <button
                  key={emp._id}
                  type="button"
                  onClick={() => {
                    setPerspectiveUser(emp);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-brand-cyan/15 text-brand-cyan font-semibold'
                      : 'hover:bg-white/[0.05] text-slate-300'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {emp.avatar ? (
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-[10px] font-bold">
                        {emp.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-100">{emp.name}</div>
                      <div className="text-[10px] text-brand-textMuted">
                        {emp.jobTitle} • {emp.department}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-brand-cyan" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeSwitcher;
