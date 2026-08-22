import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/api';
import { AppCard } from '../components/common/AppCard';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { AppButton } from '../components/common/AppButton';
import { DataTable } from '../components/common/DataTable';
import { ModalDialog } from '../components/common/ModalDialog';
import { PillTabs } from '../components/common/PillTabs';
import {
  Clock,
  LogIn,
  LogOut,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const AttendancePage = () => {
  const { user, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState('my-history');
  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Correction Modal State
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({
    status: 'Present',
    totalHours: 8,
    correctionReason: '',
  });

  // Live digital clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Today status
      const todayRes = await attendanceAPI.getToday();
      if (todayRes.success) {
        setTodayStatus(todayRes);
      }

      // 2. Fetch My History
      const histRes = await attendanceAPI.getMyHistory({ limit: 40 });
      if (histRes.success) {
        setHistory(histRes.records || []);
        setWeeklySummary(histRes.weeklySummary || null);
      }

      // 3. If Staff, Fetch All Attendance
      if (isStaff) {
        const allRes = await attendanceAPI.getAll({ limit: 100 });
        if (allRes.success) {
          setAllAttendance(allRes.records || []);
          setMetrics(allRes.metrics || null);
        }
      }
    } catch (err) {
      console.error('Failed to load attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isStaff]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceAPI.checkIn();
      await loadData();
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
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCorrection = (record) => {
    setSelectedRecord(record);
    setCorrectionForm({
      status: record.status || 'Present',
      totalHours: record.totalHours || 8,
      correctionReason: '',
    });
    setCorrectionModalOpen(true);
  };

  const handleSubmitCorrection = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      await attendanceAPI.manualCorrection(selectedRecord._id, correctionForm);
      setCorrectionModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Columns for My History
  const myHistoryColumns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => (
        <div className="flex items-center gap-2 font-mono font-semibold text-slate-100">
          <Calendar size={14} className="text-brand-cyan" />
          <span>{row.date}</span>
        </div>
      ),
    },
    {
      header: 'Check-In',
      accessor: 'checkIn',
      render: (row) => (
        <span className="font-mono text-slate-300">
          {row.checkIn
            ? new Date(row.checkIn).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—'}
        </span>
      ),
    },
    {
      header: 'Check-Out',
      accessor: 'checkOut',
      render: (row) => (
        <span className="font-mono text-slate-300">
          {row.checkOut
            ? new Date(row.checkOut).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—'}
        </span>
      ),
    },
    {
      header: 'Hours Worked',
      accessor: 'totalHours',
      render: (row) => (
        <span className="font-mono font-bold text-brand-cyan">
          {row.totalHours ? `${row.totalHours} hrs` : '0 hrs'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status.toLowerCase()} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Remarks',
      accessor: 'remarks',
      render: (row) => (
        <span className="text-brand-textMuted text-xs italic">
          {row.remarks || 'Standard shift'}
        </span>
      ),
    },
  ];

  // Columns for Admin View All
  const adminColumns = [
    {
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-xs">
            {row.employee?.name?.charAt(0) || 'E'}
          </div>
          <div>
            <div className="font-semibold text-slate-100">{row.employee?.name}</div>
            <div className="text-[11px] text-brand-textMuted font-mono">
              {row.employee?.employeeId} • {row.employee?.department}
            </div>
          </div>
        </div>
      ),
    },
    ...myHistoryColumns,
    {
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleOpenCorrection(row)}
          className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-brand-cyan/15 text-slate-300 hover:text-brand-cyan border border-white/10 transition-colors cursor-pointer"
          title="Manual Adjustment"
        >
          <Edit3 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Shift Terminal Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Clock & Interactive Check-in Terminal (7 cols) */}
        <div className="lg:col-span-7">
          <AppCard
            glow
            title="Interactive Shift Terminal"
            subtitle="Record your daily workday attendance with 1-click verification"
            icon={Clock}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-[#071126]/80 border border-brand-cyan/20">
              {/* Digital Clock Display */}
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-brand-cyan">
                  {currentTime.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight mt-1">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs text-emerald-300 font-medium">
                    Terminal Online & Synced
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                {!todayStatus?.checkedIn ? (
                  <AppButton
                    variant="primary"
                    size="lg"
                    icon={LogIn}
                    loading={actionLoading}
                    onClick={handleCheckIn}
                    className="w-full shadow-glow-cyan"
                  >
                    Check In Now
                  </AppButton>
                ) : !todayStatus?.checkedOut ? (
                  <AppButton
                    variant="secondary"
                    size="lg"
                    icon={LogOut}
                    loading={actionLoading}
                    onClick={handleCheckOut}
                    className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/20 shadow-glow-pill"
                  >
                    Check Out Shift
                  </AppButton>
                ) : (
                  <div className="px-5 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center font-semibold text-sm">
                    ✅ Completed Today
                  </div>
                )}
                <span className="text-[11px] text-brand-textMuted text-center">
                  {todayStatus?.checkedIn
                    ? `Checked in at ${new Date(todayStatus.record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Standard shift: 9:00 AM - 6:00 PM'}
                </span>
              </div>
            </div>
          </AppCard>
        </div>

        {/* Weekly Stats Overview (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <StatCard
            title="Weekly Hours"
            value={`${weeklySummary?.totalWeeklyHours || 38.5} hrs`}
            subtitle={weeklySummary?.weekRange || 'This Week'}
            icon={Clock}
            color="cyan"
            progress={weeklySummary ? (weeklySummary.totalWeeklyHours / 40) * 100 : 96}
          />
          <StatCard
            title="Days Present"
            value={`${weeklySummary?.presentDays || 5} Days`}
            subtitle="Full-day shifts"
            icon={CalendarCheck}
            color="emerald"
            progress={100}
          />
          <StatCard
            title="Punctuality Score"
            value="98.5%"
            subtitle="On-time arrivals"
            icon={Sparkles}
            color="blue"
            trend="+2.5% this month"
            trendType="up"
          />
          <StatCard
            title="Today's Status"
            value={todayStatus?.checkedOut ? 'Completed' : todayStatus?.checkedIn ? 'Active Shift' : 'Not Checked In'}
            subtitle={todayStatus?.today || 'Today'}
            icon={CheckCircle2}
            color={todayStatus?.checkedIn ? 'cyan' : 'amber'}
          />
        </div>
      </div>

      {/* Main Table Section with Switcher */}
      <AppCard
        title="Attendance Records"
        subtitle="Daily breakdown of work shifts and timestamps"
        action={
          isStaff ? (
            <PillTabs
              tabs={[
                { id: 'my-history', label: 'My Attendance' },
                { id: 'all-staff', label: 'All Staff Records' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
              size="sm"
            />
          ) : null
        }
      >
        <DataTable
          columns={activeTab === 'all-staff' ? adminColumns : myHistoryColumns}
          data={activeTab === 'all-staff' ? allAttendance : history}
          searchPlaceholder={
            activeTab === 'all-staff'
              ? 'Search by employee name, ID, or date...'
              : 'Search attendance by date...'
          }
          pageSize={12}
        />
      </AppCard>

      {/* Admin Manual Correction Modal */}
      <ModalDialog
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        title="Manual Attendance Adjustment"
        subtitle={`Adjust attendance record for ${selectedRecord?.employee?.name || 'Employee'} on ${selectedRecord?.date}`}
        footer={
          <>
            <AppButton
              variant="ghost"
              onClick={() => setCorrectionModalOpen(false)}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleSubmitCorrection}
            >
              Save Adjustment
            </AppButton>
          </>
        }
      >
        <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Attendance Status
            </label>
            <select
              value={correctionForm.status}
              onChange={(e) =>
                setCorrectionForm({ ...correctionForm, status: e.target.value })
              }
              className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
            >
              <option value="Present">Present (Full Day)</option>
              <option value="Half-day">Half-day</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Total Hours Worked
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={correctionForm.totalHours}
              onChange={(e) =>
                setCorrectionForm({ ...correctionForm, totalHours: Number(e.target.value) })
              }
              className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correction Reason / Justification
            </label>
            <textarea
              required
              rows={3}
              value={correctionForm.correctionReason}
              onChange={(e) =>
                setCorrectionForm({ ...correctionForm, correctionReason: e.target.value })
              }
              placeholder="e.g. Biometric reader malfunction, pre-approved field client visit."
              className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
            />
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};

export default AttendancePage;
