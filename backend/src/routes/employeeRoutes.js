const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  uploadFile,
  deleteDocument,
  deleteEmployee,
  getDepartments,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public/Shared authenticated routes
router.get('/departments/summary', protect, getDepartments);

// Specific employee actions
router.get('/:id', protect, getEmployeeById);
router.put('/:id', protect, updateEmployee);
router.post(
  '/:id/upload',
  protect,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'document', maxCount: 1 },
  ]),
  (req, res, next) => {
    // Map single field for uploadFile handler
    if (req.files?.avatar) req.file = req.files.avatar[0];
    else if (req.files?.document) req.file = req.files.document[0];
    next();
  },
  uploadFile
);
router.delete('/:id/documents/:docId', protect, deleteDocument);

// Staff management routes (Admin/HR)
router.get('/', protect, authorize('admin', 'hr'), getEmployees);
router.post('/', protect, authorize('admin', 'hr'), createEmployee);
router.delete('/:id', protect, authorize('admin'), deleteEmployee);

module.exports = router;
