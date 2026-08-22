import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, Shield, User, Briefcase, Palette, UserPlus, IdCard } from 'lucide-react';
import { AppButton } from '../components/common/AppButton';

export const LoginPage = () => {
  const { login, register, quickDemoLogin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    employeeId: `EMP${Math.floor(100 + Math.random() * 900)}`,
  });

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(regForm);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleKey) => {
    setError('');
    setDemoLoading(roleKey);
    try {
      await quickDemoLogin(roleKey);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setDemoLoading('');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#060b19] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="bg-ambient-glow" />

      {/* Decorative Cyan Grid and Glow Rings */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Tagline */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-brand-cyan to-brand-blue p-0.5 shadow-glow-cyan mb-3">
            <div className="w-full h-full bg-[#071126] rounded-[22px] flex items-center justify-center">
              <Sparkles size={28} className="text-brand-cyan" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            Day<span className="text-brand-cyan">flow</span>
          </h1>
          <p className="text-xs text-brand-textMuted mt-1 font-medium">
            Human Resource Management System
          </p>
        </div>

        {/* Login / Register Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-brand-cyan/25 shadow-glow-cyan/20">
          {/* Segmented Capsule Tabs: Sign In / Create Account */}
          <div className="flex items-center bg-[#081226] p-1 rounded-2xl border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isSignUp
                  ? 'glow-pill-active text-white'
                  : 'text-brand-textMuted hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isSignUp
                  ? 'glow-pill-active text-white'
                  : 'text-brand-textMuted hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <h2 className="text-lg font-bold text-white mb-1">
            {isSignUp ? 'Create New Account' : 'Sign In to Workspace'}
          </h2>
          <p className="text-xs text-brand-textMuted mb-5">
            {isSignUp
              ? 'Register your profile to access Dayflow'
              : 'Enter your credentials to access your workspace'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {!isSignUp ? (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-textMuted"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#081226]/80 text-sm text-slate-100 placeholder:text-brand-textMuted pl-10 pr-4 py-2.5 rounded-2xl border border-brand-cyan/15 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-textMuted"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#081226]/80 text-sm text-slate-100 placeholder:text-brand-textMuted pl-10 pr-4 py-2.5 rounded-2xl border border-brand-cyan/15 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all"
                  />
                </div>
              </div>

              <AppButton
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full mt-2 py-3"
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign In to Workspace
              </AppButton>
            </form>
          ) : (
            /* Sign Up / Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="e.g. Pavithra Sakthivel"
                  className="w-full bg-[#081226]/80 text-xs text-slate-100 placeholder:text-brand-textMuted p-2.5 rounded-2xl border border-brand-cyan/15 focus:border-brand-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="pavithrasakthivel252006@gmail.com"
                  className="w-full bg-[#081226]/80 text-xs text-slate-100 placeholder:text-brand-textMuted p-2.5 rounded-2xl border border-brand-cyan/15 focus:border-brand-cyan focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#081226]/80 text-xs text-slate-100 placeholder:text-brand-textMuted p-2.5 rounded-2xl border border-brand-cyan/15 focus:border-brand-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role & Access
                  </label>
                  <select
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    className="w-full bg-[#081226]/80 text-xs text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/15 focus:border-brand-cyan focus:outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="hr">HR Officer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={regForm.department}
                    onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                    className="w-full bg-[#081226]/80 text-xs text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/15 focus:border-brand-cyan focus:outline-none"
                  >
                    {['Engineering', 'Design', 'Human Resources', 'Marketing', 'Sales', 'Finance'].map(
                      (d) => (
                        <option key={d} value={d}>{d}</option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.jobTitle}
                    onChange={(e) => setRegForm({ ...regForm, jobTitle: e.target.value })}
                    placeholder="Product Engineer"
                    className="w-full bg-[#081226]/80 text-xs text-slate-100 placeholder:text-brand-textMuted p-2.5 rounded-2xl border border-brand-cyan/15 focus:border-brand-cyan focus:outline-none"
                  />
                </div>
              </div>

              <AppButton
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full mt-3 py-3"
                icon={UserPlus}
                iconPosition="right"
              >
                Register & Enter Workspace
              </AppButton>
            </form>
          )}

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-4 border-t border-white/[0.08]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-cyan mb-2.5 text-center">
              ⚡ Instant 1-Click Demo Logins
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={!!demoLoading}
                className="flex items-center gap-2 p-2 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold transition-all cursor-pointer shadow-glow-pill disabled:opacity-50"
              >
                <Shield size={14} />
                <span>Admin (Eleanor)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('hr')}
                disabled={!!demoLoading}
                className="flex items-center gap-2 p-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <Briefcase size={14} />
                <span>HR (Marcus)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('alex')}
                disabled={!!demoLoading}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                <User size={14} />
                <span>Tech Lead (Alex)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('sarah')}
                disabled={!!demoLoading}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                <Palette size={14} />
                <span>Design Lead (Sarah)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
