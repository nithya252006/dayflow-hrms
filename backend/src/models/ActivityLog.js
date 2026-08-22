const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CHECK_IN',
        'CHECK_OUT',
        'LEAVE_APPLIED',
        'LEAVE_APPROVED',
        'LEAVE_REJECTED',
        'LEAVE_CANCELLED',
        'PAYROLL_GENERATED',
        'SALARY_STRUCTURE_UPDATED',
        'PROFILE_UPDATED',
        'EMPLOYEE_CREATED',
        'DOCUMENT_UPLOADED',
      ],
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to log activity
activityLogSchema.statics.logActivity = async function (user, action, title, description, metadata = {}) {
  try {
    return await this.create({
      user,
      action,
      title,
      description,
      metadata,
    });
  } catch (err) {
    console.error('Error logging activity:', err.message);
  }
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
