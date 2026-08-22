const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const ActivityLog = require('../models/ActivityLog');
const { formatDate } = require('../utils/attendanceCalculator');
const { calculateMonthlyPayroll } = require('../utils/payrollCalculator');

const sampleEmployees = [
  {
    employeeId: 'ADM001',
    name: 'Eleanor Vance',
    email: 'admin@dayflow.com',
    password: 'Admin@123',
    role: 'admin',
    jobTitle: 'VP of Human Resources',
    department: 'Human Resources',
    employmentType: 'Full-time',
    phone: '+1 (555) 234-5678',
    address: '100 Innovation Way, Suite 400, San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    leaveBalances: { paid: 15, sick: 10, unpaidUsed: 0 },
    salaryStructure: {
      basic: 75000,
      hra: 30000,
      allowances: 20000,
      deductions: { pf: 9000, tax: 8000 },
      netSalary: 108000,
    },
  },
  {
    employeeId: 'HRO002',
    name: 'Marcus Sterling',
    email: 'hr@dayflow.com',
    password: 'Hr@123',
    role: 'hr',
    jobTitle: 'Senior HR Operations Officer',
    department: 'Human Resources',
    employmentType: 'Full-time',
    phone: '+1 (555) 345-6789',
    address: '450 Tech Plaza, Oakland, CA',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    leaveBalances: { paid: 14, sick: 8, unpaidUsed: 0 },
    salaryStructure: {
      basic: 55000,
      hra: 22000,
      allowances: 15000,
      deductions: { pf: 6600, tax: 5400 },
      netSalary: 80000,
    },
  },
  {
    employeeId: 'EMP101',
    name: 'Alex Morgan',
    email: 'alex.morgan@dayflow.com',
    password: 'User@123',
    role: 'employee',
    jobTitle: 'Lead Full-Stack Architect',
    department: 'Engineering',
    employmentType: 'Full-time',
    phone: '+1 (555) 456-7890',
    address: '742 Evergreen Terrace, San Jose, CA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    leaveBalances: { paid: 10, sick: 7, unpaidUsed: 1 },
    salaryStructure: {
      basic: 65000,
      hra: 26000,
      allowances: 18000,
      deductions: { pf: 7800, tax: 7200 },
      netSalary: 94000,
    },
  },
  {
    employeeId: 'EMP102',
    name: 'Sarah Chen',
    email: 'sarah.chen@dayflow.com',
    password: 'User@123',
    role: 'employee',
    jobTitle: 'Principal Product Designer',
    department: 'Design',
    employmentType: 'Full-time',
    phone: '+1 (555) 567-8901',
    address: '88 Market St, San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    leaveBalances: { paid: 11, sick: 6, unpaidUsed: 0 },
    salaryStructure: {
      basic: 58000,
      hra: 23200,
      allowances: 14000,
      deductions: { pf: 6960, tax: 5800 },
      netSalary: 82440,
    },
  },
  {
    employeeId: 'EMP103',
    name: 'David Kim',
    email: 'david.kim@dayflow.com',
    password: 'User@123',
    role: 'employee',
    jobTitle: 'Senior Cloud & DevOps Engineer',
    department: 'Engineering',
    employmentType: 'Full-time',
    phone: '+1 (555) 678-9012',
    address: '320 University Ave, Palo Alto, CA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    leaveBalances: { paid: 8, sick: 5, unpaidUsed: 2 },
    salaryStructure: {
      basic: 62000,
      hra: 24800,
      allowances: 16000,
      deductions: { pf: 7440, tax: 6800 },
      netSalary: 88560,
    },
  },
  {
    employeeId: 'EMP104',
    name: 'Priya Patel',
    email: 'priya.patel@dayflow.com',
    password: 'User@123',
    role: 'employee',
    jobTitle: 'Growth & Brand Marketing Lead',
    department: 'Marketing',
    employmentType: 'Full-time',
    phone: '+1 (555) 789-0123',
    address: '512 Grand Ave, Oakland, CA',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    leaveBalances: { paid: 12, sick: 8, unpaidUsed: 0 },
    salaryStructure: {
      basic: 48000,
      hra: 19200,
      allowances: 12000,
      deductions: { pf: 5760, tax: 4200 },
      netSalary: 69240,
    },
  },
  {
    employeeId: 'EMP105',
    name: 'Liam O’Connor',
    email: 'liam.oconnor@dayflow.com',
    password: 'User@123',
    role: 'employee',
    jobTitle: 'Enterprise Account Executive',
    department: 'Sales',
    employmentType: 'Full-time',
    phone: '+1 (555) 890-1234',
    address: '210 Mission St, San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    leaveBalances: { paid: 9, sick: 6, unpaidUsed: 0 },
    salaryStructure: {
      basic: 50000,
      hra: 20000,
      allowances: 25000,
      deductions: { pf: 6000, tax: 6500 },
      netSalary: 82500,
    },
  },
  {
    employeeId: 'EMP106',
    name: 'Elena Rostova',
    email: 'elena.rostova@dayflow.com',
    password: 'User@123',
    role: 'employee',
    jobTitle: 'Financial Planning & Analyst',
    department: 'Finance',
    employmentType: 'Full-time',
    phone: '+1 (555) 901-2345',
    address: '900 Fremont St, Santa Clara, CA',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    leaveBalances: { paid: 12, sick: 8, unpaidUsed: 0 },
    salaryStructure: {
      basic: 52000,
      hra: 20800,
      allowances: 13000,
      deductions: { pf: 6240, tax: 4800 },
      netSalary: 74760,
    },
  },
];

const seedDatabase = async (silent = false) => {
  try {
    if (!silent) console.log('🌱 Starting Dayflow HRMS Database Seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});
    await ActivityLog.deleteMany({});

    if (!silent) console.log('🧹 Cleaned existing records.');

    // 1. Create Users
    const createdUsers = [];
    for (const empData of sampleEmployees) {
      const user = new User(empData);
      user.recalculateSalary();
      await user.save();
      createdUsers.push(user);
    }
    if (!silent) console.log(`👥 Created ${createdUsers.length} user accounts.`);

    const admin = createdUsers.find((u) => u.role === 'admin');
    const hr = createdUsers.find((u) => u.role === 'hr');
    const employees = createdUsers.filter((u) => u.role === 'employee');

    // 2. Generate past 30 days of attendance for each user
    const attendanceBatch = [];
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayOfWeek = d.getDay();

      // Skip Saturdays (6) and Sundays (0)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dateStr = formatDate(d);

      for (const user of createdUsers) {
        // Deterministic variation
        const randomFactor = (user.employeeId.charCodeAt(3) + i) % 10;

        let status = 'Present';
        let checkInHour = 9;
        let checkInMin = (i * 3 + randomFactor * 4) % 45;
        let checkOutHour = 17;
        let checkOutMin = (i * 2 + randomFactor * 5) % 50 + 10;
        let totalHours = 8.2;
        let remarks = 'On time';

        if (randomFactor === 0) {
          status = 'Half-day';
          checkOutHour = 13;
          totalHours = 4.2;
          remarks = 'Half-day shift';
        } else if (randomFactor === 1 && i > 5) {
          status = 'Leave';
          totalHours = 0;
          remarks = 'Approved Paid Leave';
        }

        const checkIn = new Date(d);
        checkIn.setHours(checkInHour, checkInMin, 0, 0);

        let checkOut = null;
        if (status !== 'Leave') {
          // For today (i === 0), only check in some users without checkout yet to simulate active working day!
          if (i === 0) {
            if (randomFactor > 3) {
              checkOut = null;
              totalHours = 0;
            } else {
              checkOut = new Date(d);
              checkOut.setHours(checkOutHour, checkOutMin, 0, 0);
            }
          } else {
            checkOut = new Date(d);
            checkOut.setHours(checkOutHour, checkOutMin, 0, 0);
          }
        } else {
          checkIn.setHours(0, 0, 0, 0);
        }

        attendanceBatch.push({
          employee: user._id,
          date: dateStr,
          checkIn: status === 'Leave' ? null : checkIn,
          checkOut,
          totalHours: status === 'Leave' ? 0 : totalHours,
          status,
          remarks,
        });
      }
    }

    await Attendance.insertMany(attendanceBatch);
    if (!silent) console.log(`⏱️ Seeded ${attendanceBatch.length} attendance records across past 30 days.`);

    // 3. Seed Sample Leaves
    const sampleLeaves = [
      {
        employee: employees[0]._id, // Alex Morgan
        leaveType: 'Paid',
        startDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
        endDate: new Date(Date.now() + 86400000 * 5),
        daysCount: 3,
        reason: 'Attending NextGen Tech Conference & Workshop',
        status: 'Pending',
      },
      {
        employee: employees[1]._id, // Sarah Chen
        leaveType: 'Sick',
        startDate: new Date(Date.now() + 86400000 * 1),
        endDate: new Date(Date.now() + 86400000 * 2),
        daysCount: 2,
        reason: 'Scheduled dental procedure and recovery',
        status: 'Pending',
      },
      {
        employee: employees[2]._id, // David Kim
        leaveType: 'Paid',
        startDate: new Date(Date.now() - 86400000 * 12),
        endDate: new Date(Date.now() - 86400000 * 10),
        daysCount: 3,
        reason: 'Annual family vacation trip',
        status: 'Approved',
        reviewedBy: hr._id,
        reviewedAt: new Date(Date.now() - 86400000 * 13),
        adminComments: 'Approved. Enjoy your time off!',
      },
      {
        employee: employees[3]._id, // Priya Patel
        leaveType: 'Paid',
        startDate: new Date(Date.now() - 86400000 * 6),
        endDate: new Date(Date.now() - 86400000 * 5),
        daysCount: 2,
        reason: 'Personal family event',
        status: 'Approved',
        reviewedBy: admin._id,
        reviewedAt: new Date(Date.now() - 86400000 * 7),
        adminComments: 'Approved by HR Director.',
      },
      {
        employee: employees[4]._id, // Liam O'Connor
        leaveType: 'Unpaid',
        startDate: new Date(Date.now() - 86400000 * 20),
        endDate: new Date(Date.now() - 86400000 * 18),
        daysCount: 3,
        reason: 'Personal urgent relocation',
        status: 'Rejected',
        reviewedBy: hr._id,
        reviewedAt: new Date(Date.now() - 86400000 * 21),
        adminComments: 'Critical sales closing quarter week. Please reschedule.',
      },
    ];

    await Leave.insertMany(sampleLeaves);
    if (!silent) console.log(`🏖️ Seeded ${sampleLeaves.length} sample leave applications.`);

    // 4. Generate Payroll records for previous and current month
    const previousMonth = today.getMonth() === 0 ? 12 : today.getMonth();
    const previousYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

    const payrolls = [];
    for (const emp of createdUsers) {
      // Find past attendance for previous month
      const startStr = `${previousYear}-${String(previousMonth).padStart(2, '0')}-01`;
      const endStr = `${previousYear}-${String(previousMonth).padStart(2, '0')}-31`;

      const userAttendance = await Attendance.find({
        employee: emp._id,
        date: { $gte: startStr, $lte: endStr },
      });

      const pData = calculateMonthlyPayroll(emp, userAttendance, previousMonth, previousYear, 22);
      payrolls.push({
        employee: emp._id,
        ...pData,
        status: 'Paid',
        paymentDate: new Date(previousYear, previousMonth - 1, 28),
      });
    }

    await Payroll.insertMany(payrolls);
    if (!silent) console.log(`💵 Seeded ${payrolls.length} historical payroll records.`);

    // 5. Seed Activity Logs
    const activities = [
      {
        user: admin._id,
        action: 'EMPLOYEE_CREATED',
        title: 'System Initialized',
        description: 'Dayflow HRMS successfully deployed with company directory.',
      },
      {
        user: hr._id,
        action: 'LEAVE_APPROVED',
        title: 'Leave Approved',
        description: `Approved 3 days Paid leave for David Kim (EMP103).`,
      },
      {
        user: employees[0]._id,
        action: 'CHECK_IN',
        title: 'Check-In',
        description: `${employees[0].name} checked in today at 09:12 AM.`,
      },
      {
        user: employees[1]._id,
        action: 'LEAVE_APPLIED',
        title: 'Leave Requested',
        description: `${employees[1].name} requested 2 days Sick Leave.`,
      },
    ];

    await ActivityLog.insertMany(activities);
    if (!silent) console.log(`📋 Seeded activity logs.`);

    if (!silent) {
      console.log('\n======================================================');
      console.log('🎉 Dayflow HRMS Seed Data Completed Successfully!');
      console.log('------------------------------------------------------');
      console.log('🔑 ADMIN LOGIN:    admin@dayflow.com    / Admin@123');
      console.log('🔑 HR LOGIN:       hr@dayflow.com       / Hr@123');
      console.log('🔑 EMPLOYEE LOGIN: alex.morgan@dayflow.com / User@123');
      console.log('======================================================\n');
    }
  } catch (err) {
    console.error('❌ Error during database seed:', err);
  }
};

// If run directly from CLI (e.g. `node src/seeder/seedData.js`)
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  (async () => {
    await connectDB();
    await seedDatabase(false);
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { seedDatabase };
