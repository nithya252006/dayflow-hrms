const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getAllAttendance,
  manualCorrection,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Employee actions
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/today', protect, getTodayStatus);
router.get('/my-history', protect, getMyHistory);

// Admin / HR actions
router.get('/all', protect, authorize('admin', 'hr'), getAllAttendance);
router.put('/:id', protect, authorize('admin', 'hr'), manualCorrection);

module.exports = router;
