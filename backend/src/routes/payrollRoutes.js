const express = require('express');
const router = express.Router();
const {
  getMyPayroll,
  getAllPayrolls,
  updateSalaryStructure,
  generateMonthlyPayroll,
  getPayslipById,
  updatePayrollStatus,
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

// Employee routes
router.get('/my-payroll', protect, getMyPayroll);
router.get('/payslip/:id', protect, getPayslipById);

// Admin / HR routes
router.get('/all', protect, authorize('admin', 'hr'), getAllPayrolls);
router.put('/structure/:employeeId', protect, authorize('admin', 'hr'), updateSalaryStructure);
router.post('/generate-monthly', protect, authorize('admin', 'hr'), generateMonthlyPayroll);
router.patch('/:id/pay', protect, authorize('admin', 'hr'), updatePayrollStatus);

module.exports = router;
