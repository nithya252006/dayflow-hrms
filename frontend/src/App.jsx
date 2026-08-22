import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavesPage } from './pages/LeavesPage';
import { PayrollPage } from './pages/PayrollPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { Loader2 } from 'lucide-react';

export function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="text-brand-cyan animate-spin shadow-glow-pill" />
          <p className="text-xs text-brand-textMuted font-mono animate-pulse">
            Connecting to Dayflow Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100 relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="bg-ambient-glow" />

      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenProfileModal={() => setActivePage('employees')}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 relative z-10">
        {activePage === 'dashboard' && (
          <DashboardPage onNavigate={setActivePage} />
        )}
        {activePage === 'attendance' && <AttendancePage />}
        {activePage === 'leaves' && <LeavesPage />}
        {activePage === 'payroll' && <PayrollPage />}
        {activePage === 'employees' && <EmployeesPage />}
      </main>

      {/* Simple Footer */}
      <footer className="w-full py-6 text-center text-xs text-brand-textMuted border-t border-white/[0.04] relative z-10">
        <p>
          Dayflow HRMS • Odoo Hackathon Edition • Designed with Luxury Dark Cyan Aesthetics
        </p>
      </footer>
    </div>
  );
}

export default App;
