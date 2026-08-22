const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ['Paid', 'Sick', 'Unpaid'],
      required: [true, 'Please select a leave type (Paid, Sick, or Unpaid)'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    daysCount: {
      type: Number,
      required: [true, 'Days count is required'],
      min: [0.5, 'Leave must be at least 0.5 days'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for leave'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    adminComments: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for checking overlapping leave requests
leaveSchema.index({ employee: 1, startDate: 1, endDate: 1, status: 1 });

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
