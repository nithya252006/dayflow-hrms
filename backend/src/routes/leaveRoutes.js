const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

// Employee leave endpoints
router.post('/apply', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.delete('/:id', protect, cancelLeave);

// Admin / HR leave endpoints
router.get('/all', protect, authorize('admin', 'hr'), getAllLeaves);
router.patch('/:id/status', protect, authorize('admin', 'hr'), updateLeaveStatus);

module.exports = router;
