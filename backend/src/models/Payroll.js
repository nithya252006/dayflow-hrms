const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    monthName: {
      type: String,
      required: true,
    },
    totalWorkingDays: {
      type: Number,
      default: 22,
    },
    presentDays: {
      type: Number,
      default: 0,
    },
    halfDays: {
      type: Number,
      default: 0,
    },
    paidLeaveDays: {
      type: Number,
      default: 0,
    },
    unpaidLeaveDays: {
      type: Number,
      default: 0,
    },
    absentDays: {
      type: Number,
      default: 0,
    },
    basic: {
      type: Number,
      required: true,
      default: 0,
    },
    hra: {
      type: Number,
      default: 0,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    grossEarnings: {
      type: Number,
      required: true,
      default: 0,
    },
    lopDeduction: {
      type: Number,
      default: 0, // Loss of Pay for unpaid leaves and unapproved absences
    },
    pfDeduction: {
      type: Number,
      default: 0,
    },
    taxDeduction: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      required: true,
      default: 0,
    },
    netPay: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Generated', 'Paid'],
      default: 'Generated',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: 'Direct Bank Transfer',
    },
    remarks: {
      type: String,
      default: 'Monthly automated payroll calculation',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate payslips for the same employee in the same month & year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);
module.exports = Payroll;
