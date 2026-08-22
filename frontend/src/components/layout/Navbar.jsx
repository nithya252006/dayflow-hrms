import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { EmployeeSwitcher } from './EmployeeSwitcher';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Receipt,
  Users,
  Moon,
  Sun,
  CloudMoon,
  LogOut,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';
import clsx from 'clsx';

export const Navbar = ({ activePage, setActivePage, onOpenProfileModal }) => {
  const { user, isStaff, logout, perspectiveUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leaves', icon: CalendarDays },
    { id: 'payroll', label: 'Payroll', icon: Receipt },
    { id: 'employees', label: 'Employees', icon: Users, staffOnly: true },
  ];

  const visibleNavItems = navItems.filter((item) => !item.staffOnly || isStaff);

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-4 backdrop-blur-xl bg-[#060b19]/80 border-b border-brand-cyan/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-cyan to-brand-blue p-0.5 shadow-glow-cyan">
            <div className="w-full h-full bg-[#071126] rounded-[14px] flex items-center justify-center">
              <Sparkles size={20} className="text-brand-cyan group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit']">
                Day<span className="text-brand-cyan">flow</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan hidden sm:inline-block">
                HRMS
              </span>
            </div>
            <p className="text-[11px] text-brand-textMuted hidden sm:block -mt-0.5">
              Every workday, perfectly aligned.
            </p>
          </div>
        </div>

        {/* Center Pill Navigation Bar (Matching Reference Image) */}
        <nav className="hidden lg:flex items-center bg-[#071126]/90 p-1.5 rounded-2xl border border-brand-cyan/20 shadow-glow-card backdrop-blur-md">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'glow-pill-active text-white font-bold'
                    : 'text-brand-textMuted hover:text-slate-200 hover:bg-white/[0.04]'
                )}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Employee Switcher, Theme Switcher & Profile Dropdown */}
        <div className="flex items-center gap-2.5">
          {/* Quick Perspective Switcher for Admin */}
          <EmployeeSwitcher />

          {/* Theme Mode Toggle (Dark Luxury / Slate / Light) */}
          <button
            type="button"
            title={`Current Theme: ${theme.toUpperCase()} (Click to toggle)`}
            onClick={() => toggleTheme()}
            className="w-9 h-9 rounded-2xl bg-[#09152e] hover:bg-[#0f2148] border border-brand-cyan/20 text-brand-cyan flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            {theme === 'dark' && <Moon size={16} />}
            {theme === 'slate' && <CloudMoon size={16} />}
            {theme === 'light' && <Sun size={16} />}
          </button>

          {/* User Profile Avatar with Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1 rounded-2xl border border-brand-cyan/20 hover:border-brand-cyan/50 bg-[#09152e] transition-all cursor-pointer"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-blue text-white font-bold text-xs flex items-center justify-center">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden sm:block text-left pr-2">
                <div className="text-xs font-semibold text-slate-100 max-w-[100px] truncate leading-tight">
                  {user?.name?.split(' ')[0]}
                </div>
                <div className="text-[10px] text-brand-cyan uppercase font-medium">
                  {user?.role}
                </div>
              </div>
            </button>

            {/* Profile Dropdown Popover */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl border border-brand-cyan/25 shadow-glow-cyan/25 z-50 p-2 text-xs">
                  <div className="px-3 py-3 border-b border-white/[0.06] mb-1">
                    <div className="font-bold text-sm text-white">{user?.name}</div>
                    <div className="text-brand-textMuted text-[11px] mt-0.5">{user?.email}</div>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-brand-cyan font-medium">
                      <ShieldCheck size={13} />
                      <span>{user?.jobTitle} • {user?.department}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      if (onOpenProfileModal) onOpenProfileModal(user);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/[0.05] transition-colors cursor-pointer"
                  >
                    <User size={15} className="text-brand-cyan" />
                    <span>My Profile & Documents</span>
                  </button>

                  <div className="my-1 border-t border-white/[0.06]" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden mt-3 flex items-center justify-around bg-[#071126]/95 p-1 rounded-2xl border border-brand-cyan/15 overflow-x-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
              className={clsx(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all duration-200 cursor-pointer whitespace-nowrap',
                isActive
                  ? 'glow-pill-active text-white font-semibold'
                  : 'text-brand-textMuted hover:text-slate-200'
              )}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

export default Navbar;
