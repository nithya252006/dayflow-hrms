const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const ActivityLog = require('../models/ActivityLog');
const { formatDate, getWeekRange } = require('../utils/attendanceCalculator');

// @desc    Get customized Dashboard metrics based on user role
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const todayStr = formatDate(new Date());
    const isStaff = req.user.role === 'admin' || req.user.role === 'hr';

    if (isStaff) {
      // 1. Total employees
      const totalEmployees = await User.countDocuments({ status: 'Active' });
      const totalStaff = await User.countDocuments({ role: { $in: ['admin', 'hr'] } });

      // 2. Today's attendance breakdown
      const todayAttendance = await Attendance.find({ date: todayStr }).populate(
        'employee',
        'name employeeId department avatar'
      );

      const presentCount = todayAttendance.filter((r) => r.status === 'Present').length;
      const halfDayCount = todayAttendance.filter((r) => r.status === 'Half-day').length;
      const onLeaveCount = todayAttendance.filter((r) => r.status === 'Leave').length;
      const absentCount = Math.max(0, totalEmployees - (presentCount + halfDayCount + onLeaveCount));

      // 3. Pending leave requests
      const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

      // 4. Department distribution
      const departmentDistribution = await User.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $project: { department: '$_id', count: 1, _id: 0 } },
      ]);

      // 5. Quick Employee Switcher List (for Admin dashboard)
      const employeeList = await User.find({ status: 'Active' })
        .select('name employeeId email department jobTitle role avatar')
        .sort({ name: 1 });

      // 6. Recent 5 leave requests
      const recentLeaves = await Leave.find()
        .populate('employee', 'name employeeId department avatar')
        .sort({ createdAt: -1 })
        .limit(5);

      // 7. Recent 5 activities
      const recentActivities = await ActivityLog.find()
        .populate('user', 'name employeeId avatar')
        .sort({ createdAt: -1 })
        .limit(8);

      return res.status(200).json({
        success: true,
        role: req.user.role,
        overview: {
          totalEmployees,
          totalStaff,
          presentToday: presentCount,
          halfDayToday: halfDayCount,
          onLeaveToday: onLeaveCount,
          absentToday: absentCount,
          pendingLeaves,
        },
        departmentDistribution,
        employeeList,
        todayAttendance: todayAttendance.slice(0, 10),
        recentLeaves,
        recentActivities,
      });
    } else {
      // Regular Employee Dashboard Payload
      const employeeId = req.user._id;

      // 1. Today's attendance
      const todayRecord = await Attendance.findOne({ employee: employeeId, date: todayStr });

      // 2. Weekly summary
      const week = getWeekRange(new Date());
      const weekRecords = await Attendance.find({
        employee: employeeId,
        date: { $gte: week.start, $lte: week.end },
      });
      const weeklyHours = weekRecords.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);

      // 3. User leave balances & pending requests
      const user = await User.findById(employeeId).select('leaveBalances salaryStructure jobTitle department joiningDate');
      const myRecentLeaves = await Leave.find({ employee: employeeId }).sort({ createdAt: -1 }).limit(5);

      // 4. Recent attendance history (last 7 records)
      const recentAttendance = await Attendance.find({ employee: employeeId }).sort({ date: -1 }).limit(7);

      // 5. Latest payslip
      const latestPayslip = await Payroll.findOne({ employee: employeeId }).sort({ year: -1, month: -1 });

      // 6. Recent activity for this employee
      const myActivities = await ActivityLog.find({ user: employeeId }).sort({ createdAt: -1 }).limit(5);

      return res.status(200).json({
        success: true,
        role: 'employee',
        todayStatus: {
          date: todayStr,
          checkedIn: !!todayRecord?.checkIn,
          checkedOut: !!todayRecord?.checkOut,
          checkInTime: todayRecord?.checkIn || null,
          checkOutTime: todayRecord?.checkOut || null,
          totalHours: todayRecord?.totalHours || 0,
          status: todayRecord?.status || 'Not Checked In',
        },
        weeklyStats: {
          weekRange: `${week.start} to ${week.end}`,
          hoursWorked: Math.round(weeklyHours * 100) / 100,
          daysPresent: weekRecords.filter((r) => r.status === 'Present').length,
        },
        leaveBalances: user.leaveBalances,
        salaryStructure: user.salaryStructure,
        recentAttendance,
        myRecentLeaves,
        latestPayslip,
        myActivities,
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get activity logs
// @route   GET /api/dashboard/activity
// @access  Private
const getActivityLogs = async (req, res, next) => {
  try {
    const isStaff = req.user.role === 'admin' || req.user.role === 'hr';
    const query = isStaff ? {} : { user: req.user._id };

    const logs = await ActivityLog.find(query)
      .populate('user', 'name employeeId avatar department role')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getActivityLogs };
