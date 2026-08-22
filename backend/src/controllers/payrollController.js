const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');
const { calculateMonthlyPayroll, getMonthName } = require('../utils/payrollCalculator');

// @desc    Get logged in employee's salary structure & historical payslips (Read-only)
// @route   GET /api/payroll/my-payroll
// @access  Private (Employee, HR, Admin)
const getMyPayroll = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('name employeeId department jobTitle salaryStructure joiningDate');
    const payslips = await Payroll.find({ employee: req.user._id }).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      salaryStructure: user.salaryStructure,
      employee: {
        id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        department: user.department,
        jobTitle: user.jobTitle,
        joiningDate: user.joiningDate,
      },
      payslips,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all employees' payroll records (Admin / HR)
// @route   GET /api/payroll/all
// @access  Private (Admin, HR)
const getAllPayrolls = async (req, res, next) => {
  try {
    const { month, year, department, search, status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (month) query.month = parseInt(month, 10);
    if (year) query.year = parseInt(year, 10);
    if (status && status !== 'All') query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let payslips = await Payroll.find(query)
      .populate('employee', 'name employeeId email department jobTitle avatar salaryStructure')
      .sort({ year: -1, month: -1, createdAt: -1 });

    if (department && department !== 'All') {
      payslips = payslips.filter((p) => p.employee && p.employee.department === department);
    }

    if (search) {
      const s = search.toLowerCase();
      payslips = payslips.filter(
        (p) =>
          p.employee?.name?.toLowerCase().includes(s) ||
          p.employee?.employeeId?.toLowerCase().includes(s) ||
          p.monthName?.toLowerCase().includes(s)
      );
    }

    const total = payslips.length;
    const paginatedPayslips = payslips.slice(skip, skip + limitNum);

    const totalPayrollAmount = payslips.reduce((acc, p) => acc + (p.netPay || 0), 0);
    const paidCount = payslips.filter((p) => p.status === 'Paid').length;
    const pendingCount = payslips.filter((p) => p.status !== 'Paid').length;

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      summary: {
        totalDisbursed: totalPayrollAmount,
        paidCount,
        pendingCount,
      },
      payslips: paginatedPayslips,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee salary structure (Admin / HR)
// @route   PUT /api/payroll/structure/:employeeId
// @access  Private (Admin, HR)
const updateSalaryStructure = async (req, res, next) => {
  try {
    const { basic, hra, allowances, pf, tax } = req.body;

    const employee = await User.findById(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    if (basic !== undefined) employee.salaryStructure.basic = Number(basic);
    if (hra !== undefined) employee.salaryStructure.hra = Number(hra);
    if (allowances !== undefined) employee.salaryStructure.allowances = Number(allowances);
    if (pf !== undefined) {
      if (!employee.salaryStructure.deductions) employee.salaryStructure.deductions = {};
      employee.salaryStructure.deductions.pf = Number(pf);
    }
    if (tax !== undefined) {
      if (!employee.salaryStructure.deductions) employee.salaryStructure.deductions = {};
      employee.salaryStructure.deductions.tax = Number(tax);
    }

    employee.recalculateSalary();
    await employee.save();

    await ActivityLog.logActivity(
      req.user._id,
      'SALARY_STRUCTURE_UPDATED',
      'Salary Structure Updated',
      `Salary structure for ${employee.name} (${employee.employeeId}) updated by ${req.user.name}`
    );

    res.status(200).json({
      success: true,
      message: `Salary structure updated for ${employee.name}. Net monthly salary: ₹${employee.salaryStructure.netSalary}`,
      salaryStructure: employee.salaryStructure,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Auto-calculate & generate monthly payroll (Admin / HR)
// @route   POST /api/payroll/generate-monthly
// @access  Private (Admin, HR)
const generateMonthlyPayroll = async (req, res, next) => {
  try {
    const { month, year, employeeId, workingDays = 22 } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please specify month (1-12) and year (e.g. 2026).',
      });
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    // Target employees
    const empQuery = { status: 'Active' };
    if (employeeId) {
      empQuery._id = employeeId;
    }

    const employees = await User.find(empQuery);
    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active employees found to generate payroll.',
      });
    }

    // Date range for the requested month
    const startStr = `${y}-${String(m).padStart(2, '0')}-01`;
    const endStr = `${y}-${String(m).padStart(2, '0')}-31`;

    const results = [];

    for (const emp of employees) {
      // Find attendance records for this employee in that month
      const attendanceRecords = await Attendance.find({
        employee: emp._id,
        date: { $gte: startStr, $lte: endStr },
      });

      const payrollData = calculateMonthlyPayroll(emp, attendanceRecords, m, y, workingDays);

      const payslip = await Payroll.findOneAndUpdate(
        { employee: emp._id, month: m, year: y },
        {
          employee: emp._id,
          ...payrollData,
        },
        { upsert: true, new: true, runValidators: true }
      ).populate('employee', 'name employeeId department jobTitle email');

      results.push(payslip);
    }

    await ActivityLog.logActivity(
      req.user._id,
      'PAYROLL_GENERATED',
      'Monthly Payroll Generated',
      `Payroll generated for ${getMonthName(m, y)} (${results.length} employees) by ${req.user.name}`
    );

    res.status(200).json({
      success: true,
      message: `Successfully generated payroll for ${getMonthName(m, y)} for ${results.length} employee(s).`,
      count: results.length,
      payslips: results,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single detailed payslip
// @route   GET /api/payroll/payslip/:id
// @access  Private (Admin, HR or Self)
const getPayslipById = async (req, res, next) => {
  try {
    const payslip = await Payroll.findById(req.params.id).populate(
      'employee',
      'name employeeId email department jobTitle phone address avatar joiningDate'
    );

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found.',
      });
    }

    const isSelf = req.user._id.toString() === payslip.employee._id.toString();
    const isStaff = req.user.role === 'admin' || req.user.role === 'hr';

    if (!isSelf && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own payslips.',
      });
    }

    res.status(200).json({
      success: true,
      payslip,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update payslip payment status (Admin / HR)
// @route   PATCH /api/payroll/:id/pay
// @access  Private (Admin, HR)
const updatePayrollStatus = async (req, res, next) => {
  try {
    const { status = 'Paid', paymentMethod = 'Direct Bank Transfer' } = req.body;

    const payslip = await Payroll.findById(req.params.id).populate('employee', 'name employeeId');
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found.',
      });
    }

    payslip.status = status;
    payslip.paymentDate = status === 'Paid' ? new Date() : null;
    payslip.paymentMethod = paymentMethod;

    await payslip.save();

    res.status(200).json({
      success: true,
      message: `Payslip for ${payslip.employee?.name} marked as ${status}.`,
      payslip,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyPayroll,
  getAllPayrolls,
  updateSalaryStructure,
  generateMonthlyPayroll,
  getPayslipById,
  updatePayrollStatus,
};
