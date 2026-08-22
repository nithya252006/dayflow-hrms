const express = require('express');
const router = express.Router();
const { getStats, getActivityLogs } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/activity', protect, getActivityLogs);

module.exports = router;
