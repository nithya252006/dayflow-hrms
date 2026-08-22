const Leave = require('../models/Leave');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');
const { formatDate } = require('../utils/attendanceCalculator');

// Helper: Calculate number of days between two dates (inclusive)
const calculateDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = Math.abs(e - s);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// @desc    Apply for Leave (Employee)
// @route   POST /api/leaves/apply
// @access  Private (Employee, HR, Admin)
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user._id;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leave type, start date, end date, and reason.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date.',
      });
    }

    const daysCount = calculateDays(start, end);

    // Check for overlapping leaves for this employee
    const overlapping = await Leave.findOne({
      employee: employeeId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: `You already have an existing ${overlapping.status.toLowerCase()} leave request overlapping with this period (${formatDate(overlapping.startDate)} to ${formatDate(overlapping.endDate)}).`,
      });
    }

    // Verify balance
    const user = await User.findById(employeeId);
    if (leaveType === 'Paid' && user.leaveBalances.paid < daysCount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Paid Leave balance. You have ${user.leaveBalances.paid} days remaining, but requested ${daysCount} days. Consider requesting Unpaid leave.`,
      });
    }

    if (leaveType === 'Sick' && user.leaveBalances.sick < daysCount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Sick Leave balance. You have ${user.leaveBalances.sick} days remaining, but requested ${daysCount} days.`,
      });
    }

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason: reason.trim(),
      status: 'Pending',
    });

    await ActivityLog.logActivity(
      employeeId,
      'LEAVE_APPLIED',
      'Leave Requested',
      `${req.user.name} applied for ${daysCount} days ${leaveType} leave (${formatDate(start)} to ${formatDate(end)})`
    );

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully for review.',
      leave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in employee's leave history & balance
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('leaveBalances name employeeId');
    const leaves = await Leave.find({ employee: req.user._id })
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    const stats = {
      paid: user.leaveBalances?.paid || 0,
      sick: user.leaveBalances?.sick || 0,
      unpaidUsed: user.leaveBalances?.unpaidUsed || 0,
      pendingCount: leaves.filter((l) => l.status === 'Pending').length,
      approvedCount: leaves.filter((l) => l.status === 'Approved').length,
      rejectedCount: leaves.filter((l) => l.status === 'Rejected').length,
    };

    res.status(200).json({
      success: true,
      balances: stats,
      leaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all leave applications (Admin / HR view with filters)
// @route   GET /api/leaves/all
// @access  Private (Admin, HR)
const getAllLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, department, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (leaveType && leaveType !== 'All') query.leaveType = leaveType;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let leaves = await Leave.find(query)
      .populate('employee', 'name employeeId email department jobTitle avatar leaveBalances')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    if (department && department !== 'All') {
      leaves = leaves.filter((l) => l.employee && l.employee.department === department);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      leaves = leaves.filter(
        (l) =>
          l.employee?.name?.toLowerCase().includes(searchLower) ||
          l.employee?.employeeId?.toLowerCase().includes(searchLower) ||
          l.reason?.toLowerCase().includes(searchLower)
      );
    }

    const total = leaves.length;
    const paginatedLeaves = leaves.slice(skip, skip + limitNum);

    const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
    const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
    const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      metrics: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      leaves: paginatedLeaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or Reject Leave Request (Admin / HR)
// @route   PATCH /api/leaves/:id/status
// @access  Private (Admin, HR)
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, adminComments = '' } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'.",
      });
    }

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    const employee = await User.findById(leave.employee._id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Associated employee not found.',
      });
    }

    const previousStatus = leave.status;
    leave.status = status;
    leave.adminComments = adminComments.trim();
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();

    // If newly approved, deduct leave balance and mark attendance records
    if (status === 'Approved' && previousStatus !== 'Approved') {
      if (leave.leaveType === 'Paid') {
        employee.leaveBalances.paid = Math.max(0, employee.leaveBalances.paid - leave.daysCount);
      } else if (leave.leaveType === 'Sick') {
        employee.leaveBalances.sick = Math.max(0, employee.leaveBalances.sick - leave.daysCount);
      } else if (leave.leaveType === 'Unpaid') {
        employee.leaveBalances.unpaidUsed = (employee.leaveBalances.unpaidUsed || 0) + leave.daysCount;
      }
      await employee.save();

      // Automatically sync leave dates to Attendance records
      const cur = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      while (cur <= end) {
        const dateStr = formatDate(cur);
        await Attendance.findOneAndUpdate(
          { employee: employee._id, date: dateStr },
          {
            employee: employee._id,
            date: dateStr,
            status: 'Leave',
            remarks: `Approved ${leave.leaveType} Leave`,
            totalHours: 0,
          },
          { upsert: true, new: true }
        );
        cur.setDate(cur.getDate() + 1);
      }
    }

    // If previously approved and now rejected, refund balance
    if (status === 'Rejected' && previousStatus === 'Approved') {
      if (leave.leaveType === 'Paid') {
        employee.leaveBalances.paid += leave.daysCount;
      } else if (leave.leaveType === 'Sick') {
        employee.leaveBalances.sick += leave.daysCount;
      } else if (leave.leaveType === 'Unpaid') {
        employee.leaveBalances.unpaidUsed = Math.max(0, employee.leaveBalances.unpaidUsed - leave.daysCount);
      }
      await employee.save();
    }

    await leave.save();

    await ActivityLog.logActivity(
      req.user._id,
      status === 'Approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      `Leave ${status}`,
      `Leave request for ${employee.name} (${leave.daysCount} days) was ${status.toLowerCase()} by ${req.user.name}`
    );

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully.`,
      leave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a pending leave request (Employee)
// @route   DELETE /api/leaves/:id
// @access  Private (Employee, HR, Admin)
const cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    const isOwner = leave.employee.toString() === req.user._id.toString();
    const isStaff = req.user.role === 'admin' || req.user.role === 'hr';

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot cancel another user’s leave.',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave that is already ${leave.status}. Please contact HR.`,
      });
    }

    leave.status = 'Cancelled';
    await leave.save();

    await ActivityLog.logActivity(
      req.user._id,
      'LEAVE_CANCELLED',
      'Leave Cancelled',
      `Leave request from ${formatDate(leave.startDate)} to ${formatDate(leave.endDate)} was cancelled.`
    );

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  cancelLeave,
};
