const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (Employee or HR)
// @route   POST /api/auth/register
// @access  Public (or Admin invite)
const register = async (req, res, next) => {
  try {
    const { employeeId, name, email, password, role, department, jobTitle, phone, address } = req.body;

    if (!employeeId || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Employee ID, full name, email, and password.',
      });
    }

    // Check if employeeId or email already exists
    const existingEmployeeId = await User.findOne({ employeeId: employeeId.trim().toUpperCase() });
    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: `An employee with ID '${employeeId.toUpperCase()}' already exists.`,
      });
    }

    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `An account with email '${email.toLowerCase()}' is already registered.`,
      });
    }

    // Role validation: Defaults to 'employee' if invalid or not provided
    const validRoles = ['employee', 'hr', 'admin'];
    const assignedRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'employee';

    const user = await User.create({
      employeeId: employeeId.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: assignedRole,
      department: department || 'General',
      jobTitle: jobTitle || (assignedRole === 'hr' ? 'HR Officer' : 'Team Member'),
      phone: phone || '',
      address: address || '',
    });

    const token = generateToken(user._id, user.role);

    // Log activity
    await ActivityLog.logActivity(
      user._id,
      'PROFILE_UPDATED',
      'Account Created',
      `New user ${user.name} registered with role ${user.role} (${user.employeeId})`
    );

    res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        jobTitle: user.jobTitle,
        avatar: user.avatar,
        status: user.status,
        leaveBalances: user.leaveBalances,
        salaryStructure: user.salaryStructure,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Query user by email and select password field
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User with this email does not exist.',
      });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password is incorrect.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        jobTitle: user.jobTitle,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        status: user.status,
        leaveBalances: user.leaveBalances,
        salaryStructure: user.salaryStructure,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
