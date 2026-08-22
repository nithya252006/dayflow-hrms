const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');
const { formatDate, calculateHours, determineStatus, getWeekRange } = require('../utils/attendanceCalculator');

// @desc    Employee Check-in for the day
// @route   POST /api/attendance/check-in
// @access  Private (Employee, HR, Admin)
const checkIn = async (req, res, next) => {
  try {
    const todayStr = formatDate(new Date());
    const employeeId = req.user._id;

    // Check if record already exists for today
    let record = await Attendance.findOne({ employee: employeeId, date: todayStr });

    if (record) {
      if (record.checkIn && !record.checkOut) {
        return res.status(400).json({
          success: false,
          message: `You are already checked in for today since ${new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          record,
        });
      }
      if (record.checkOut) {
        return res.status(400).json({
          success: false,
          message: 'You have already checked out for today.',
          record,
        });
      }
    } else {
      const now = new Date();
      const hour = now.getHours();
      const remarks = hour > 10 ? 'Late check-in' : 'On time';

      record = await Attendance.create({
        employee: employeeId,
        date: todayStr,
        checkIn: now,
        status: 'Present',
        remarks,
      });

      await ActivityLog.logActivity(
        employeeId,
        'CHECK_IN',
        'Check-In Recorded',
        `${req.user.name} checked in at ${now.toLocaleTimeString()}`
      );
    }

    res.status(200).json({
      success: true,
      message: 'Check-in successful. Have a productive workday!',
      record,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Employee Check-out for the day
// @route   POST /api/attendance/check-out
// @access  Private (Employee, HR, Admin)
const checkOut = async (req, res, next) => {
  try {
    const todayStr = formatDate(new Date());
    const employeeId = req.user._id;

    const record = await Attendance.findOne({ employee: employeeId, date: todayStr });

    if (!record || !record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check out: You have not checked in yet today.',
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: `You have already checked out today at ${new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        record,
      });
    }

    const now = new Date();
    record.checkOut = now;
    const hours = calculateHours(record.checkIn, now);
    record.totalHours = hours;
    record.status = determineStatus(hours);

    if (record.status === 'Half-day') {
      record.remarks = `${record.remarks ? record.remarks + ' | ' : ''}Half-day (${hours} hrs)`;
    }

    await record.save();

    await ActivityLog.logActivity(
      employeeId,
      'CHECK_OUT',
      'Check-Out Recorded',
      `${req.user.name} checked out at ${now.toLocaleTimeString()} (${hours} hrs worked)`
    );

    res.status(200).json({
      success: true,
      message: `Check-out successful. Total worked today: ${hours} hours.`,
      record,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's today attendance status
// @route   GET /api/attendance/today
// @access  Private
const getTodayStatus = async (req, res, next) => {
  try {
    const todayStr = formatDate(new Date());
    const record = await Attendance.findOne({
      employee: req.user._id,
      date: todayStr,
    });

    res.status(200).json({
      success: true,
      today: todayStr,
      checkedIn: !!record?.checkIn,
      checkedOut: !!record?.checkOut,
      record: record || null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in employee's attendance history (daily & weekly view)
// @route   GET /api/attendance/my-history
// @access  Private
const getMyHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const employeeId = req.user._id;

    const query = { employee: employeeId };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit, 10));

    // Get current week stats
    const week = getWeekRange(new Date());
    const weekRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: week.start, $lte: week.end },
    });

    const totalWeeklyHours = weekRecords.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const presentWeeklyDays = weekRecords.filter((r) => r.status === 'Present').length;

    res.status(200).json({
      success: true,
      count: records.length,
      records,
      weeklySummary: {
        weekRange: `${week.start} to ${week.end}`,
        totalWeeklyHours: Math.round(totalWeeklyHours * 100) / 100,
        presentDays: presentWeeklyDays,
        records: weekRecords,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all attendance records (Admin / HR view with filters)
// @route   GET /api/attendance/all
// @access  Private (Admin, HR)
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, startDate, endDate, department, status, employeeId, page = 1, limit = 50 } = req.query;

    const query = {};

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // If department filter is requested, filter via User population
    let recordsQuery = Attendance.find(query)
      .populate('employee', 'name employeeId email department jobTitle avatar')
      .sort({ date: -1, createdAt: -1 });

    let records = await recordsQuery;

    if (department && department !== 'All') {
      records = records.filter((r) => r.employee && r.employee.department === department);
    }

    const total = records.length;
    const paginatedRecords = records.slice(skip, skip + limitNum);

    // Summary counts for the filtered date/dataset
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const halfDayCount = records.filter((r) => r.status === 'Half-day').length;
    const leaveCount = records.filter((r) => r.status === 'Leave').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      metrics: {
        present: presentCount,
        halfDay: halfDayCount,
        onLeave: leaveCount,
        absent: absentCount,
      },
      records: paginatedRecords,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin / HR manual correction of attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin, HR)
const manualCorrection = async (req, res, next) => {
  try {
    const { checkIn, checkOut, status, totalHours, correctionReason, remarks } = req.body;

    let record = await Attendance.findById(req.params.id).populate('employee', 'name employeeId');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found.',
      });
    }

    if (checkIn) record.checkIn = new Date(checkIn);
    if (checkOut) record.checkOut = new Date(checkOut);
    if (status) record.status = status;
    if (remarks) record.remarks = remarks;

    if (record.checkIn && record.checkOut) {
      record.totalHours = totalHours !== undefined ? Number(totalHours) : calculateHours(record.checkIn, record.checkOut);
    }

    record.isManualCorrection = true;
    record.correctedBy = req.user._id;
    record.correctionReason = correctionReason || 'Administrative adjustment';

    await record.save();

    await ActivityLog.logActivity(
      req.user._id,
      'PROFILE_UPDATED',
      'Attendance Adjusted',
      `Attendance for ${record.employee?.name} on ${record.date} adjusted by ${req.user.name}`
    );

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.',
      record,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getAllAttendance,
  manualCorrection,
};
