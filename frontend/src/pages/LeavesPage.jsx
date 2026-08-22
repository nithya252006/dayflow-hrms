import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveAPI } from '../services/api';
import { AppCard } from '../components/common/AppCard';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { AppButton } from '../components/common/AppButton';
import { DataTable } from '../components/common/DataTable';
import { ModalDialog } from '../components/common/ModalDialog';
import { PillTabs } from '../components/common/PillTabs';
import {
  CalendarDays,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Calendar,
  Sparkles,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const LeavesPage = () => {
  const { user, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [balances, setBalances] = useState({ paid: 12, sick: 8, unpaidUsed: 0 });
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply Leave Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Paid',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Admin Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('Approved');
  const [adminComments, setAdminComments] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch My Leaves & Balance
      const myRes = await leaveAPI.getMyLeaves();
      if (myRes.success) {
        setBalances(myRes.balances || { paid: 12, sick: 8, unpaidUsed: 0 });
        setMyLeaves(myRes.leaves || []);
      }

      // 2. If Staff, Fetch All Leaves
      if (isStaff) {
        const allRes = await leaveAPI.getAll({ limit: 100 });
        if (allRes.success) {
          setAllLeaves(allRes.leaves || []);
          setMetrics(allRes.metrics || null);
        }
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isStaff]);

  // Recalculate working days whenever dates change
  useEffect(() => {
    if (applyForm.startDate && applyForm.endDate) {
      const s = new Date(applyForm.startDate);
      const e = new Date(applyForm.endDate);
      if (s <= e) {
        const diffTime = Math.abs(e - s);
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(days);
      } else {
        setCalculatedDays(0);
      }
    } else {
      setCalculatedDays(0);
    }
  }, [applyForm.startDate, applyForm.endDate]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplyLoading(true);

    try {
      const res = await leaveAPI.apply(applyForm);
      if (res.success) {
        setApplyModalOpen(false);
        setApplyForm({ leaveType: 'Paid', startDate: '', endDate: '', reason: '' });
        await loadData();
      }
    } catch (err) {
      setApplyError(err.message || 'Failed to submit leave application.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!confirm('Are you sure you want to cancel this pending leave application?')) return;
    try {
      await leaveAPI.cancel(leaveId);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenReview = (leave, decision) => {
    setSelectedLeave(leave);
    setReviewDecision(decision);
    setAdminComments('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setReviewLoading(true);
    try {
      await leaveAPI.updateStatus(selectedLeave._id, {
        status: reviewDecision,
        adminComments: adminComments.trim(),
      });
      setReviewModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  // Columns for My Leaves Table
  const myLeavesColumns = [
    {
      header: 'Leave Type',
      accessor: 'leaveType',
      render: (row) => (
        <Badge variant={row.leaveType.toLowerCase()} size="md">
          {row.leaveType} Leave
        </Badge>
      ),
    },
    {
      header: 'Period',
      render: (row) => (
        <div className="flex items-center gap-2 font-mono text-xs text-slate-200">
          <Calendar size={13} className="text-brand-cyan" />
          <span>
            {new Date(row.startDate).toLocaleDateString()} →{' '}
            {new Date(row.endDate).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Days',
      accessor: 'daysCount',
      render: (row) => (
        <span className="font-mono font-bold text-brand-cyan">
          {row.daysCount} days
        </span>
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => (
        <span className="text-slate-300 max-w-[200px] truncate block text-xs">
          {row.reason}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status.toLowerCase()} size="md">
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Reviewer Feedback',
      render: (row) => (
        <span className="text-xs text-brand-textMuted italic">
          {row.adminComments || (row.reviewedBy ? `Reviewed by ${row.reviewedBy.name}` : 'Awaiting review')}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (row) =>
        row.status === 'Pending' ? (
          <button
            type="button"
            onClick={() => handleCancelLeave(row._id)}
            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/25 transition-colors cursor-pointer"
            title="Cancel Application"
          >
            <Trash2 size={14} />
          </button>
        ) : (
          <span className="text-[11px] text-brand-textMuted">—</span>
        ),
    },
  ];

  // Columns for All Leaves (Admin / HR)
  const allLeavesColumns = [
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
    myLeavesColumns[0], // Type
    myLeavesColumns[1], // Period
    myLeavesColumns[2], // Days
    myLeavesColumns[3], // Reason
    myLeavesColumns[4], // Status
    {
      header: 'Decision Actions',
      render: (row) => (
        row.status === 'Pending' ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenReview(row, 'Approved')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Approve</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenReview(row, 'Rejected')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer"
            >
              <XCircle size={13} />
              <span>Reject</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-brand-textMuted font-medium">
            {row.status} by {row.reviewedBy?.name?.split(' ')[0] || 'Staff'}
          </span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Apply Leave Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-3xl p-6 border border-brand-cyan/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Leave & Time-Off Management
          </h1>
          <p className="text-xs sm:text-sm text-brand-textMuted mt-1">
            Apply for planned leaves, view remaining balance quotas, and track approval workflows.
          </p>
        </div>

        <AppButton
          variant="primary"
          icon={PlusCircle}
          onClick={() => {
            setApplyError('');
            setApplyModalOpen(true);
          }}
          className="shadow-glow-cyan py-2.5 px-5"
        >
          Apply for Leave
        </AppButton>
      </div>

      {/* Quota Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Paid Leave Quota"
          value={`${balances.paid} Days Left`}
          subtitle="Annual allocated vacation"
          icon={CalendarDays}
          color="cyan"
          progress={(balances.paid / 15) * 100}
        />
        <StatCard
          title="Sick Leave Quota"
          value={`${balances.sick} Days Left`}
          subtitle="Medical & wellness leaves"
          icon={Sparkles}
          color="blue"
          progress={(balances.sick / 10) * 100}
        />
        <StatCard
          title="Unpaid Leaves Taken"
          value={`${balances.unpaidUsed} Days Used`}
          subtitle="Loss of Pay (LOP) impact"
          icon={AlertCircle}
          color="amber"
          trend="Deducted at payroll"
          trendType="neutral"
        />
      </div>

      {/* Main Leave Requests Table */}
      <AppCard
        title="Leave Applications"
        subtitle="Chronological log of submitted time-off requests"
        action={
          isStaff ? (
            <PillTabs
              tabs={[
                { id: 'my-leaves', label: 'My Requests' },
                { id: 'all-leaves', label: 'All Staff Applications' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
              size="sm"
            />
          ) : null
        }
      >
        <DataTable
          columns={activeTab === 'all-leaves' ? allLeavesColumns : myLeavesColumns}
          data={activeTab === 'all-leaves' ? allLeaves : myLeaves}
          searchPlaceholder={
            activeTab === 'all-leaves'
              ? 'Search by employee name, ID, or leave type...'
              : 'Search leave requests by reason or type...'
          }
          pageSize={10}
        />
      </AppCard>

      {/* Apply Leave Modal */}
      <ModalDialog
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Time-Off / Leave"
        subtitle="Submit your leave application for approval"
        footer={
          <>
            <AppButton
              variant="ghost"
              onClick={() => setApplyModalOpen(false)}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              loading={applyLoading}
              onClick={handleApplySubmit}
            >
              Submit Application ({calculatedDays} Days)
            </AppButton>
          </>
        }
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 text-xs sm:text-sm">
          {applyError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {applyError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Leave Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Paid', 'Sick', 'Unpaid'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setApplyForm({ ...applyForm, leaveType: type })}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-semibold ${
                    applyForm.leaveType === type
                      ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-glow-pill'
                      : 'bg-[#081226] border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div>{type} Leave</div>
                  <div className="text-[10px] text-brand-textMuted mt-0.5 font-normal">
                    {type === 'Paid'
                      ? `${balances.paid}d available`
                      : type === 'Sick'
                      ? `${balances.sick}d available`
                      : 'Loss of Pay'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                required
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
              />
            </div>
          </div>

          {calculatedDays > 0 && (
            <div className="p-3 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/25 flex items-center justify-between text-xs text-brand-cyan">
              <span className="font-medium">Total Duration Requested:</span>
              <span className="font-bold text-sm font-mono">{calculatedDays} Working Days</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reason / Remarks for Time-Off
            </label>
            <textarea
              required
              rows={3}
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              placeholder="e.g. Attending family wedding / Scheduled medical appointment..."
              className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
            />
          </div>
        </form>
      </ModalDialog>

      {/* Admin Review Leave Modal */}
      <ModalDialog
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Confirm Leave Decision: ${reviewDecision}`}
        subtitle={`Reviewing ${selectedLeave?.daysCount} days ${selectedLeave?.leaveType} leave for ${selectedLeave?.employee?.name}`}
        footer={
          <>
            <AppButton
              variant="ghost"
              onClick={() => setReviewModalOpen(false)}
            >
              Cancel
            </AppButton>
            <AppButton
              variant={reviewDecision === 'Approved' ? 'success' : 'danger'}
              loading={reviewLoading}
              onClick={handleSubmitReview}
            >
              Confirm {reviewDecision}
            </AppButton>
          </>
        }
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-[#081226] border border-white/10 space-y-2">
            <div className="flex justify-between">
              <span className="text-brand-textMuted">Employee:</span>
              <span className="font-semibold text-white">{selectedLeave?.employee?.name} ({selectedLeave?.employee?.employeeId})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-textMuted">Leave Period:</span>
              <span className="font-mono text-brand-cyan">
                {selectedLeave?.startDate ? new Date(selectedLeave.startDate).toLocaleDateString() : ''} →{' '}
                {selectedLeave?.endDate ? new Date(selectedLeave.endDate).toLocaleDateString() : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-textMuted">Reason Provided:</span>
              <span className="text-slate-200">{selectedLeave?.reason}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Comments / Feedback to Employee
            </label>
            <textarea
              rows={3}
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              placeholder={
                reviewDecision === 'Approved'
                  ? 'Approved. Have a restful time off!'
                  : 'Specify reason for rejection...'
              }
              className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
            />
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};

export default LeavesPage;
