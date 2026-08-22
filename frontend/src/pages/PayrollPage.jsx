import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { payrollAPI, employeeAPI } from '../services/api';
import { AppCard } from '../components/common/AppCard';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { AppButton } from '../components/common/AppButton';
import { DataTable } from '../components/common/DataTable';
import { ModalDialog } from '../components/common/ModalDialog';
import { PillTabs } from '../components/common/PillTabs';
import {
  Receipt,
  Wallet,
  Building2,
  TrendingDown,
  Sparkles,
  Calculator,
  Edit,
  Eye,
  CheckCircle2,
  Printer,
  Download,
  AlertCircle,
} from 'lucide-react';

export const PayrollPage = () => {
  const { user, activeUser, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState('my-payroll');
  const [myPayroll, setMyPayroll] = useState(null);
  const [allPayrolls, setAllPayrolls] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate Monthly Payroll Modal State
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [genForm, setGenForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    workingDays: 22,
  });
  const [genLoading, setGenLoading] = useState(false);

  // Salary Structure Edit Modal State
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [structureForm, setStructureForm] = useState({
    basic: 40000,
    hra: 16000,
    allowances: 10000,
    pf: 4800,
    tax: 3200,
  });
  const [structureLoading, setStructureLoading] = useState(false);

  // Payslip Detail Modal
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [activePayslip, setActivePayslip] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load My Payroll
      const myRes = await payrollAPI.getMyPayroll();
      if (myRes.success) {
        setMyPayroll(myRes);
      }

      // 2. If Staff, Load All Payrolls
      if (isStaff) {
        const allRes = await payrollAPI.getAll({ limit: 100 });
        if (allRes.success) {
          setAllPayrolls(allRes.payslips || []);
          setSummary(allRes.summary || null);
        }
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isStaff, activeUser]);

  const handleGenerateMonthly = async (e) => {
    e.preventDefault();
    setGenLoading(true);
    try {
      const res = await payrollAPI.generateMonthly(genForm);
      if (res.success) {
        alert(res.message);
        setGenModalOpen(false);
        await loadData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleOpenStructureModal = (emp) => {
    setSelectedEmployee(emp);
    const struct = emp.salaryStructure || {};
    setStructureForm({
      basic: struct.basic || 40000,
      hra: struct.hra || 16000,
      allowances: struct.allowances || 10000,
      pf: struct.deductions?.pf || 4800,
      tax: struct.deductions?.tax || 3200,
    });
    setStructureModalOpen(true);
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setStructureLoading(true);
    try {
      await payrollAPI.updateStructure(selectedEmployee._id || selectedEmployee.id, structureForm);
      setStructureModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setStructureLoading(false);
    }
  };

  const handleViewPayslip = async (payslip) => {
    setActivePayslip(payslip);
    setPayslipModalOpen(true);
  };

  const handleMarkPaid = async (payslipId) => {
    try {
      await payrollAPI.markPaid(payslipId, {
        status: 'Paid',
        paymentMethod: 'Direct Bank Transfer',
      });
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const struct = myPayroll?.salaryStructure || activeUser?.salaryStructure || {
    basic: 40000,
    hra: 16000,
    allowances: 10000,
    deductions: { pf: 4800, tax: 3200 },
    netSalary: 58000,
  };

  const grossSalary = (struct.basic || 0) + (struct.hra || 0) + (struct.allowances || 0);
  const totalDeductions = (struct.deductions?.pf || 0) + (struct.deductions?.tax || 0);

  // Columns for My Payslips
  const myPayslipColumns = [
    {
      header: 'Pay Period',
      accessor: 'monthName',
      render: (row) => (
        <div className="font-semibold text-slate-100 flex items-center gap-2">
          <Receipt size={14} className="text-brand-cyan" />
          <span>{row.monthName}</span>
        </div>
      ),
    },
    {
      header: 'Working Days',
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {row.presentDays} / {row.totalWorkingDays} days
        </span>
      ),
    },
    {
      header: 'Gross Salary',
      accessor: 'grossEarnings',
      render: (row) => (
        <span className="font-mono font-medium text-slate-200">
          ₹{row.grossEarnings?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'LOP / Deductions',
      render: (row) => (
        <div className="font-mono text-xs text-rose-300">
          -₹{(row.totalDeductions || 0).toLocaleString()}
          {row.lopDeduction > 0 && (
            <span className="text-[10px] text-amber-400 block">
              (incl. ₹{row.lopDeduction} LOP)
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Net Pay',
      accessor: 'netPay',
      render: (row) => (
        <span className="font-mono font-bold text-sm text-brand-cyan">
          ₹{row.netPay?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Payment Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status.toLowerCase()} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Slip',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleViewPayslip(row)}
          className="flex items-center gap-1 px-3 py-1 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs font-semibold cursor-pointer shadow-glow-pill"
        >
          <Eye size={13} />
          <span>View Slip</span>
        </button>
      ),
    },
  ];

  // Columns for All Staff Payrolls (Admin / HR)
  const allPayrollColumns = [
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
    myPayslipColumns[0], // Period
    myPayslipColumns[1], // Days
    myPayslipColumns[2], // Gross
    myPayslipColumns[3], // Deductions
    myPayslipColumns[4], // Net Pay
    myPayslipColumns[5], // Status
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleViewPayslip(row)}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 cursor-pointer"
            title="View Slip"
          >
            <Eye size={14} />
          </button>
          {row.status !== 'Paid' && (
            <button
              type="button"
              onClick={() => handleMarkPaid(row._id)}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
              title="Mark as Paid"
            >
              <CheckCircle2 size={13} />
              <span>Mark Paid</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with 1-Click Monthly Generator for Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-3xl p-6 border border-brand-cyan/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Payroll & Salary Management
          </h1>
          <p className="text-xs sm:text-sm text-brand-textMuted mt-1">
            Transparent salary structures, automatic Loss of Pay (LOP) calculations, and instant digital payslips.
          </p>
        </div>

        {isStaff && (
          <div className="flex items-center gap-3">
            <AppButton
              variant="primary"
              icon={Calculator}
              onClick={() => setGenModalOpen(true)}
              className="shadow-glow-cyan py-2.5 px-5"
            >
              1-Click Monthly Payroll Generator
            </AppButton>
          </div>
        )}
      </div>

      {/* Salary Breakdown Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Net Monthly Salary"
          value={`₹${struct.netSalary?.toLocaleString() || '58,000'}`}
          subtitle="Direct bank deposit"
          icon={Wallet}
          color="cyan"
          trend="Calculated payout"
          trendType="up"
        />
        <StatCard
          title="Basic Pay"
          value={`₹${struct.basic?.toLocaleString() || '40,000'}`}
          subtitle="Fixed base component"
          icon={Building2}
          color="blue"
          progress={(struct.basic / grossSalary) * 100}
        />
        <StatCard
          title="HRA & Allowances"
          value={`₹${((struct.hra || 0) + (struct.allowances || 0)).toLocaleString()}`}
          subtitle="Housing & special perks"
          icon={Sparkles}
          color="emerald"
        />
        <StatCard
          title="Standard Deductions"
          value={`₹${totalDeductions.toLocaleString()}`}
          subtitle="PF (₹4,800) + Tax (₹3,200)"
          icon={TrendingDown}
          color="rose"
        />
      </div>

      {/* Main Table Section */}
      <AppCard
        title="Payslips & Salary Archive"
        subtitle="Itemized breakdown of generated monthly paystubs"
        action={
          isStaff ? (
            <PillTabs
              tabs={[
                { id: 'my-payroll', label: 'My Payslips' },
                { id: 'all-payroll', label: 'Company Payroll' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
              size="sm"
            />
          ) : null
        }
      >
        <DataTable
          columns={activeTab === 'all-payroll' ? allPayrollColumns : myPayslipColumns}
          data={activeTab === 'all-payroll' ? allPayrolls : myPayroll?.payslips || []}
          searchPlaceholder={
            activeTab === 'all-payroll'
              ? 'Search payroll by employee name, ID, or month...'
              : 'Search payslips by month...'
          }
          pageSize={10}
        />
      </AppCard>

      {/* 1-Click Monthly Payroll Generator Modal */}
      <ModalDialog
        isOpen={genModalOpen}
        onClose={() => setGenModalOpen(false)}
        title="Generate Monthly Payroll"
        subtitle="Auto-calculates salaries, working hours, and Loss of Pay (LOP) for all active employees"
        footer={
          <>
            <AppButton
              variant="ghost"
              onClick={() => setGenModalOpen(false)}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              loading={genLoading}
              onClick={handleGenerateMonthly}
            >
              Run Automated Calculation
            </AppButton>
          </>
        }
      >
        <form onSubmit={handleGenerateMonthly} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Month (1 - 12)
              </label>
              <select
                value={genForm.month}
                onChange={(e) => setGenForm({ ...genForm, month: Number(e.target.value) })}
                className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((m, idx) => (
                  <option key={idx} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Year
              </label>
              <input
                type="number"
                value={genForm.year}
                onChange={(e) => setGenForm({ ...genForm, year: Number(e.target.value) })}
                className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Standard Working Days in Month
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={genForm.workingDays}
              onChange={(e) => setGenForm({ ...genForm, workingDays: Number(e.target.value) })}
              className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/25 text-xs text-brand-cyan space-y-1">
            <p className="font-semibold">⚡ Edge Case Logic Included:</p>
            <p>• Unpaid leaves and unapproved absences trigger exact per-day LOP deductions: <code>(Basic / WorkingDays) * UnpaidLeaves</code>.</p>
            <p>• Half-day shifts count as 0.5 day LOP if exceeding permissible quota.</p>
          </div>
        </form>
      </ModalDialog>

      {/* Interactive Printable Digital Payslip Modal */}
      <ModalDialog
        isOpen={payslipModalOpen}
        onClose={() => setPayslipModalOpen(false)}
        title="Official Digital Payslip"
        subtitle={`Salary statement for ${activePayslip?.monthName}`}
        maxWidth="max-w-3xl"
        footer={
          <>
            <AppButton
              variant="ghost"
              onClick={() => setPayslipModalOpen(false)}
            >
              Close
            </AppButton>
            <AppButton
              variant="primary"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Payslip
            </AppButton>
          </>
        }
      >
        {activePayslip && (
          <div className="p-6 rounded-3xl bg-[#071126] border border-white/10 space-y-6 text-slate-200">
            {/* Payslip Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Day<span className="text-brand-cyan">flow</span> Technologies Inc.
                </h2>
                <p className="text-xs text-brand-textMuted mt-0.5">
                  100 Innovation Way, Suite 400, San Francisco, CA
                </p>
              </div>
              <div className="text-right">
                <Badge variant={activePayslip.status.toLowerCase()} size="lg">
                  {activePayslip.status}
                </Badge>
                <div className="text-xs text-brand-cyan font-mono mt-1">
                  Slip #{activePayslip._id?.slice(-8).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Employee Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-xs">
              <div>
                <span className="text-brand-textMuted block">Employee Name:</span>
                <span className="font-bold text-white text-sm">{activePayslip.employee?.name || user?.name}</span>
              </div>
              <div>
                <span className="text-brand-textMuted block">Employee ID:</span>
                <span className="font-mono font-bold text-brand-cyan">{activePayslip.employee?.employeeId || user?.employeeId}</span>
              </div>
              <div>
                <span className="text-brand-textMuted block">Department:</span>
                <span className="font-semibold text-slate-200">{activePayslip.employee?.department || user?.department}</span>
              </div>
              <div>
                <span className="text-brand-textMuted block">Pay Period:</span>
                <span className="font-semibold text-slate-200">{activePayslip.monthName}</span>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown Tables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Earnings */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-cyan mb-3">
                  Earnings
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Basic Salary</span>
                    <span className="font-mono font-semibold">₹{activePayslip.basic?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">House Rent Allowance (HRA)</span>
                    <span className="font-mono font-semibold">₹{activePayslip.hra?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Special Allowances</span>
                    <span className="font-mono font-semibold">₹{activePayslip.allowances?.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-emerald-400">
                    <span>Total Gross Earnings</span>
                    <span className="font-mono">₹{activePayslip.grossEarnings?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3">
                  Deductions & LOP
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Provident Fund (PF)</span>
                    <span className="font-mono font-semibold">₹{activePayslip.pfDeduction?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Professional Tax (PT)</span>
                    <span className="font-mono font-semibold">₹{activePayslip.taxDeduction?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Loss of Pay (LOP)</span>
                    <span className="font-mono font-semibold text-amber-400">
                      ₹{activePayslip.lopDeduction?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-rose-400">
                    <span>Total Deductions</span>
                    <span className="font-mono">₹{activePayslip.totalDeductions?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Summary Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-cyan/20 to-brand-blue/20 border border-brand-cyan/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">
                  Net Disbursed Salary
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Payment Method: {activePayslip.paymentMethod || 'Direct Bank Transfer'}
                </p>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono tracking-tight shadow-glow-pill">
                ₹{activePayslip.netPay?.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  );
};

export default PayrollPage;
