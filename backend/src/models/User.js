const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'hr', 'employee'],
        message: '{VALUE} is not a valid role',
      },
      default: 'employee',
    },
    jobTitle: {
      type: String,
      default: 'Team Member',
      trim: true,
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
      default: 'Full-time',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    documents: [
      {
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, default: 'pdf' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    leaveBalances: {
      paid: { type: Number, default: 12, min: 0 },
      sick: { type: Number, default: 8, min: 0 },
      unpaidUsed: { type: Number, default: 0, min: 0 },
    },
    salaryStructure: {
      basic: { type: Number, default: 40000, min: 0 },
      hra: { type: Number, default: 16000, min: 0 },
      allowances: { type: Number, default: 10000, min: 0 },
      deductions: {
        pf: { type: Number, default: 4800, min: 0 },
        tax: { type: Number, default: 3200, min: 0 },
      },
      netSalary: { type: Number, default: 58000, min: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: Verify entered password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Helper: Calculate net salary on salary structure updates
userSchema.methods.recalculateSalary = function () {
  const basic = Number(this.salaryStructure.basic || 0);
  const hra = Number(this.salaryStructure.hra || 0);
  const allowances = Number(this.salaryStructure.allowances || 0);
  const pf = Number(this.salaryStructure.deductions?.pf || 0);
  const tax = Number(this.salaryStructure.deductions?.tax || 0);

  const gross = basic + hra + allowances;
  const totalDeductions = pf + tax;
  this.salaryStructure.netSalary = Math.max(0, gross - totalDeductions);
  return this.salaryStructure.netSalary;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
