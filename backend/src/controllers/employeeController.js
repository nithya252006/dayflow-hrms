const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all employees with search, department filtering & pagination
// @route   GET /api/employees
// @access  Private (Admin, HR)
const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, role, page = 1, limit = 50 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      employees,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single employee details
// @route   GET /api/employees/:id
// @access  Private (Admin, HR or Self)
const getEmployeeById = async (req, res, next) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isStaff = req.user.role === 'admin' || req.user.role === 'hr';

    if (!isSelf && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own profile.',
      });
    }

    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new employee profile
// @route   POST /api/employees
// @access  Private (Admin, HR)
const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      name,
      email,
      password,
      role = 'employee',
      department,
      jobTitle,
      employmentType,
      phone,
      address,
      salaryStructure,
      leaveBalances,
    } = req.body;

    if (!employeeId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, full name, and email are required.',
      });
    }

    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId: employeeId.toUpperCase() }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this Email or Employee ID already exists.',
      });
    }

    const defaultPassword = password || 'User@123';

    const newEmployee = new User({
      employeeId: employeeId.toUpperCase().trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: defaultPassword,
      role: role.toLowerCase(),
      department: department || 'Engineering',
      jobTitle: jobTitle || 'Team Member',
      employmentType: employmentType || 'Full-time',
      phone: phone || '',
      address: address || '',
    });

    if (salaryStructure) {
      newEmployee.salaryStructure = {
        ...newEmployee.salaryStructure,
        ...salaryStructure,
      };
      newEmployee.recalculateSalary();
    }

    if (leaveBalances) {
      newEmployee.leaveBalances = {
        ...newEmployee.leaveBalances,
        ...leaveBalances,
      };
    }

    await newEmployee.save();

    await ActivityLog.logActivity(
      req.user._id,
      'EMPLOYEE_CREATED',
      'Employee Onboarded',
      `New employee ${newEmployee.name} (${newEmployee.employeeId}) created by ${req.user.name}`
    );

    const sanitized = newEmployee.toObject();
    delete sanitized.password;

    res.status(201).json({
      success: true,
      message: 'Employee successfully created.',
      employee: sanitized,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee profile (Field restrictions based on role)
// @route   PUT /api/employees/:id
// @access  Private (Admin, HR, or Self)
const updateEmployee = async (req, res, next) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isStaff = req.user.role === 'admin' || req.user.role === 'hr';

    if (!isSelf && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only edit your own profile.',
      });
    }

    let employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    // Role-based field filtering:
    // If regular employee, only allow phone, address, avatar
    if (!isStaff) {
      const allowedUpdates = ['phone', 'address', 'avatar'];
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          employee[field] = req.body[field];
        }
      });
    } else {
      // Admin / HR can update all fields
      const staffAllowedFields = [
        'name',
        'email',
        'role',
        'jobTitle',
        'department',
        'employmentType',
        'status',
        'phone',
        'address',
        'avatar',
        'joiningDate',
      ];

      staffAllowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          employee[field] = req.body[field];
        }
      });

      if (req.body.leaveBalances) {
        employee.leaveBalances = {
          ...employee.leaveBalances,
          ...req.body.leaveBalances,
        };
      }

      if (req.body.salaryStructure) {
        employee.salaryStructure = {
          ...employee.salaryStructure,
          ...req.body.salaryStructure,
        };
        employee.recalculateSalary();
      }
    }

    await employee.save();

    await ActivityLog.logActivity(
      req.user._id,
      'PROFILE_UPDATED',
      'Profile Updated',
      `Profile of ${employee.name} (${employee.employeeId}) was updated by ${req.user.name}`
    );

    const sanitized = employee.toObject();
    delete sanitized.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      employee: sanitized,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload profile picture or document
// @route   POST /api/employees/:id/upload
// @access  Private (Admin, HR, or Self)
const uploadFile = async (req, res, next) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isStaff = req.user.role === 'admin' || req.user.role === 'hr';

    if (!isSelf && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot upload files for another employee.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file.',
      });
    }

    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    const fileUrl = `/uploads/${req.file.fieldname === 'avatar' ? 'avatars' : 'documents'}/${req.file.filename}`;

    if (req.file.fieldname === 'avatar') {
      employee.avatar = fileUrl;
    } else {
      const title = req.body.title || req.file.originalname;
      employee.documents.push({
        title,
        fileUrl,
        fileType: req.file.mimetype.split('/')[1] || 'pdf',
        uploadedAt: new Date(),
      });
    }

    await employee.save();

    await ActivityLog.logActivity(
      req.user._id,
      'DOCUMENT_UPLOADED',
      'Document Uploaded',
      `File ${req.file.originalname} uploaded for ${employee.name}`
    );

    res.status(200).json({
      success: true,
      message: `${req.file.fieldname === 'avatar' ? 'Profile picture' : 'Document'} uploaded successfully.`,
      fileUrl,
      documents: employee.documents,
      avatar: employee.avatar,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a document from employee profile
// @route   DELETE /api/employees/:id/documents/:docId
// @access  Private (Admin, HR, or Self)
const deleteDocument = async (req, res, next) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isStaff = req.user.role === 'admin' || req.user.role === 'hr';

    if (!isSelf && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    employee.documents = employee.documents.filter(
      (doc) => doc._id.toString() !== req.params.docId
    );

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully.',
      documents: employee.documents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Deactivate employee account
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    employee.status = 'Inactive';
    await employee.save();

    await ActivityLog.logActivity(
      req.user._id,
      'PROFILE_UPDATED',
      'Employee Deactivated',
      `Account of ${employee.name} (${employee.employeeId}) was deactivated by ${req.user.name}`
    );

    res.status(200).json({
      success: true,
      message: `Employee ${employee.name} has been deactivated.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get department breakdown summary
// @route   GET /api/employees/departments/summary
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const summary = await User.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      departments: summary,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  uploadFile,
  deleteDocument,
  deleteEmployee,
  getDepartments,
};
