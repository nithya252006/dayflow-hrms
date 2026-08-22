import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, attendanceAPI, leaveAPI } from '../services/api';
import { HeroGradientCard } from '../components/common/HeroGradientCard';
import { AppCard } from '../components/common/AppCard';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { AppButton } from '../components/common/AppButton';
import { AttendanceBarChart } from '../components/charts/AttendanceBarChart';
import { PayrollDonutChart } from '../components/charts/PayrollDonutChart';
import { DepartmentRadarChart } from '../components/charts/DepartmentRadarChart';
import { AttendanceWaveChart } from '../components/charts/AttendanceWaveChart';
import {
  Users,
  UserCheck,
  CalendarOff,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogIn,
  LogOut,
  CalendarDays,
  Sparkles,
} from 'lucide-react';

export const DashboardPage = ({ onNavigate, onOpenLeaveModal }) => {
  const { user, activeUser, isStaff } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardAPI.getStats();
      if (res.success) {
        setStats(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeUser]);

  // Handle Quick Check-In / Check-Out
  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceAPI.checkIn();
      await fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceAPI.checkOut();
      await fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle 1-click leave approve/reject by Admin/HR
  const handleLeaveDecision = async (leaveId, decision) => {
    try {
      await leaveAPI.updateStatus(leaveId, {
        status: decision,
        adminComments: `Quick decision via Dashboard (${decision})`,
      });
      await fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const todayStatus = stats?.todayStatus || {};
  const overview = stats?.overview || {};

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-3xl p-6 border border-brand-cyan/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hello, <span className="text-brand-cyan">{activeUser?.name?.split(' ')[0]}</span> 👋
            </h1>
            <Badge variant={activeUser?.role === 'admin' ? 'admin' : activeUser?.role === 'hr' ? 'hr' : 'cyan'}>
              {activeUser?.role?.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-brand-textMuted mt-1">
            {activeUser?.jobTitle} • {activeUser?.department} • Employee ID:{' '}
            <span className="font-mono text-brand-cyan">{activeUser?.employeeId}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Check-In / Check-Out Actions */}
          {!todayStatus.checkedIn ? (
            <AppButton
              variant="primary"
              icon={LogIn}
              loading={actionLoading}
              onClick={handleCheckIn}
              className="py-2.5 px-5 shadow-glow-cyan"
            >
              Daily Check-In
            </AppButton>
          ) : !todayStatus.checkedOut ? (
            <AppButton
              variant="secondary"
              icon={LogOut}
              loading={actionLoading}
              onClick={handleCheckOut}
              className="py-2.5 px-5 border-amber-500/30 text-amber-300 hover:bg-amber-500/15"
            >
              Check-Out Shift
            </AppButton>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 size={16} />
              <span>Shift Completed Today</span>
            </div>
          )}

          <AppButton
            variant="outline"
            icon={CalendarDays}
            onClick={() => onNavigate('leaves')}
          >
            Apply Leave
          </AppButton>
        </div>
      </div>

      {/* TOP ROW: Matches the reference image 3-card layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hero Card (Left: 3.5 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <HeroGradientCard
            title={isStaff ? 'Payroll Disbursed' : 'Monthly Salary'}
            value={
              isStaff
                ? `₹${(overview.totalEmployees * 82000 || 492000).toLocaleString()}`
                : `₹${activeUser?.salaryStructure?.netSalary?.toLocaleString() || '82,000'}`
            }
            subtitle={isStaff ? 'Active Workforce' : 'Total Monthly Net Pay'}
            subValue={
              isStaff
                ? `${overview.totalEmployees || 8} Staff Members`
                : `₹${activeUser?.salaryStructure?.netSalary?.toLocaleString() || '82,000'}`
            }
            badgeText={isStaff ? 'Attendance Rate' : 'Leave Balance'}
            badgePercent={
              isStaff
                ? `${Math.round(((overview.presentToday || 6) / (overview.totalEmployees || 8)) * 100)}%`
                : `${activeUser?.leaveBalances?.paid || 12}d`
            }
            maskedId={`EMP-****-${activeUser?.employeeId?.slice(-3) || '101'}`}
            changeText={
              isStaff
                ? `${overview.presentToday || 6} checked in today`
                : `Paid: ${activeUser?.leaveBalances?.paid || 12}d | Sick: ${activeUser?.leaveBalances?.sick || 8}d`
            }
            onClick={() => onNavigate('payroll')}
          />
        </div>

        {/* Center Bar Chart (5.5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <AppCard className="h-full">
            <AttendanceBarChart
              title={isStaff ? 'Company Work Hours' : 'My Hours Worked'}
              totalValue={isStaff ? '1,428 hrs' : `${stats?.weeklyStats?.hoursWorked || 38.5} hrs`}
            />
          </AppCard>
        </div>

        {/* Right Radar Chart (3 cols) */}
        <div className="lg:col-span-3 flex flex-col">
          <AppCard className="h-full">
            <DepartmentRadarChart />
          </AppCard>
        </div>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Present Today"
          value={overview.presentToday !== undefined ? `${overview.presentToday} Staff` : '6 / 8'}
          subtitle="On-time attendance rate"
          icon={UserCheck}
          color="cyan"
          trend="+12% vs last week"
          trendType="up"
          progress={overview.totalEmployees ? (overview.presentToday / overview.totalEmployees) * 100 : 75}
          onClick={() => onNavigate('attendance')}
        />

        <StatCard
          title="On Leave Today"
          value={overview.onLeaveToday !== undefined ? `${overview.onLeaveToday} Staff` : '1 Member'}
          subtitle="Approved planned leaves"
          icon={CalendarOff}
          color="blue"
          trend="Within quota"
          trendType="neutral"
          progress={15}
          onClick={() => onNavigate('leaves')}
        />

        <StatCard
          title="Pending Approvals"
          value={overview.pendingLeaves !== undefined ? `${overview.pendingLeaves} Requests` : '2 Requests'}
          subtitle="Requires HR / Admin action"
          icon={AlertCircle}
          color="amber"
          trend="Review pending"
          trendType="down"
          progress={40}
          onClick={() => onNavigate('leaves')}
        />

        <StatCard
          title="Total Workforce"
          value={overview.totalEmployees !== undefined ? `${overview.totalEmployees} Active` : '8 Employees'}
          subtitle="Across 6 departments"
          icon={Users}
          color="emerald"
          trend="100% Operational"
          trendType="up"
          progress={100}
          onClick={() => onNavigate('employees')}
        />
      </div>

      {/* MIDDLE ROW: Smooth Spline Wave Chart & Salary Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Spline Wave Chart (7.5 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <AppCard className="h-full">
            <AttendanceWaveChart />
          </AppCard>
        </div>

        {/* Salary Donut Ring Chart (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <AppCard className="h-full">
            <PayrollDonutChart
              totalAmount={
                isStaff
                  ? '₹4,92,000'
                  : `₹${activeUser?.salaryStructure?.netSalary?.toLocaleString() || '82,000'}`
              }
              totalLabel={isStaff ? 'Total Payroll' : 'Net Monthly Pay'}
            />
          </AppCard>
        </div>
      </div>

      {/* BOTTOM ROW: Recent Leave Applications Table & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leave Requests Table (8 cols) */}
        <div className="lg:col-span-8">
          <AppCard
            title="Recent Leave Requests"
            subtitle="Live status of time-off applications"
            icon={CalendarDays}
            action={
              <AppButton
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('leaves')}
              >
                View All
              </AppButton>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-white/[0.03] text-brand-textMuted uppercase font-semibold border-b border-white/[0.06]">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    {isStaff && <th className="px-4 py-3 text-right">Decision</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {stats?.recentLeaves && stats.recentLeaves.length > 0 ? (
                    stats.recentLeaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-brand-cyan/[0.02]">
                        <td className="px-4 py-3 font-semibold text-slate-100 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center text-[10px] font-bold">
                            {leave.employee?.name?.charAt(0) || 'E'}
                          </div>
                          <span>{leave.employee?.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={leave.leaveType.toLowerCase()} size="sm">
                            {leave.leaveType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-brand-cyan font-medium">
                          {leave.daysCount} days
                        </td>
                        <td className="px-4 py-3 text-slate-300 max-w-[150px] truncate">
                          {leave.reason}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={leave.status.toLowerCase()} size="sm">
                            {leave.status}
                          </Badge>
                        </td>
                        {isStaff && (
                          <td className="px-4 py-3 text-right">
                            {leave.status === 'Pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleLeaveDecision(leave._id, 'Approved')}
                                  className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 cursor-pointer"
                                  title="Approve"
                                >
                                  <CheckCircle2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleLeaveDecision(leave._id, 'Rejected')}
                                  className="p-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40 cursor-pointer"
                                  title="Reject"
                                >
                                  <XCircle size={15} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-brand-textMuted">Resolved</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-brand-textMuted">
                        No recent leave requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </AppCard>
        </div>

        {/* Live Activity Stream (4 cols) */}
        <div className="lg:col-span-4">
          <AppCard
            title="Activity Feed"
            subtitle="Real-time workspace events"
            icon={Sparkles}
          >
            <div className="space-y-3.5">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.slice(0, 5).map((act, idx) => (
                  <div
                    key={act._id || idx}
                    className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="w-8 h-8 rounded-xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={15} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-100 truncate">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-brand-textMuted mt-0.5 line-clamp-2">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-brand-cyan/70 font-mono mt-1 block">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-textMuted text-center py-4">
                  No activity recorded yet.
                </p>
              )}
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
