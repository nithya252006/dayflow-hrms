const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// Ensure port for test
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const request = (method, urlPath, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${urlPath}`);
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = { raw: data };
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runVerification = async () => {
  console.log('\n======================================================');
  console.log('🧪 Starting Dayflow HRMS Backend End-to-End API Verification');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} -> ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.data.success, 'Health Check Endpoint (/api/health)');

    // 2. Auth Login - Admin
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@dayflow.com',
      password: 'Admin@123',
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin Authentication (/api/auth/login)', JSON.stringify(adminLogin.data));
    const adminToken = adminLogin.data.token;

    // 3. Auth Login - Employee
    const empLogin = await request('POST', '/auth/login', {
      email: 'alex.morgan@dayflow.com',
      password: 'User@123',
    });
    assert(empLogin.status === 200 && empLogin.data.token, 'Employee Authentication (/api/auth/login)');
    const empToken = empLogin.data.token;
    const empId = empLogin.data.user.id;

    // 4. Session Me endpoint
    const meRes = await request('GET', '/auth/me', null, empToken);
    assert(meRes.status === 200 && meRes.data.user.email === 'alex.morgan@dayflow.com', 'Get Current Profile (/api/auth/me)');

    // 5. RBAC Guard Test: Employee forbidden from viewing all employees
    const forbiddenRes = await request('GET', '/employees', null, empToken);
    assert(forbiddenRes.status === 403, 'RBAC Guard: Employee forbidden from Admin route (/api/employees -> 403)');

    // 6. Admin Get All Employees
    const allEmpRes = await request('GET', '/employees', null, adminToken);
    assert(allEmpRes.status === 200 && Array.isArray(allEmpRes.data.employees), `Admin Fetch All Employees (Count: ${allEmpRes.data.count})`);

    // 7. Department Summary
    const deptRes = await request('GET', '/employees/departments/summary', null, empToken);
    assert(deptRes.status === 200 && deptRes.data.departments.length > 0, `Department Analytics (Found ${deptRes.data.departments.length} depts)`);

    // 8. Attendance: Check today status
    const todayRes = await request('GET', '/attendance/today', null, empToken);
    assert(todayRes.status === 200, 'Get Today Attendance Status (/api/attendance/today)');

    // 9. Attendance: My History
    const historyRes = await request('GET', '/attendance/my-history', null, empToken);
    assert(historyRes.status === 200 && Array.isArray(historyRes.data.records), `Employee Attendance History (Found ${historyRes.data.records.length} records)`);

    // 10. Attendance: Admin View All
    const allAttendanceRes = await request('GET', '/attendance/all', null, adminToken);
    assert(allAttendanceRes.status === 200 && allAttendanceRes.data.metrics, 'Admin Attendance Overview & Metrics (/api/attendance/all)');

    // 11. Leaves: Get My Leaves & Balance
    const myLeavesRes = await request('GET', '/leaves/my-leaves', null, empToken);
    assert(myLeavesRes.status === 200 && myLeavesRes.data.balances, `Employee Leave Balances (Paid: ${myLeavesRes.data.balances.paid}, Sick: ${myLeavesRes.data.balances.sick})`);

    // 12. Leaves: Apply Leave with Validation
    const applyRes = await request(
      'POST',
      '/leaves/apply',
      {
        leaveType: 'Paid',
        startDate: new Date(Date.now() + 86400000 * 20),
        endDate: new Date(Date.now() + 86400000 * 22),
        reason: 'Automated verification test leave request',
      },
      empToken
    );
    assert(applyRes.status === 201 && applyRes.data.leave, 'Apply for Leave (/api/leaves/apply)');
    const createdLeaveId = applyRes.data.leave?._id;

    // 13. Leaves: Overlap Prevention Test
    const overlapRes = await request(
      'POST',
      '/leaves/apply',
      {
        leaveType: 'Paid',
        startDate: new Date(Date.now() + 86400000 * 21),
        endDate: new Date(Date.now() + 86400000 * 23),
        reason: 'Overlapping attempt',
      },
      empToken
    );
    assert(overlapRes.status === 400, 'Edge Case: Overlapping Leave Prevention (Rejected with 400)');

    // 14. Leaves: Admin Approve Leave
    if (createdLeaveId) {
      const approveRes = await request(
        'PATCH',
        `/leaves/${createdLeaveId}/status`,
        {
          status: 'Approved',
          adminComments: 'Approved by test verification runner',
        },
        adminToken
      );
      assert(approveRes.status === 200 && approveRes.data.leave.status === 'Approved', 'Admin Approve Leave Request (/api/leaves/:id/status)');
    }

    // 15. Payroll: Employee My Payroll View
    const myPayrollRes = await request('GET', '/payroll/my-payroll', null, empToken);
    assert(myPayrollRes.status === 200 && myPayrollRes.data.salaryStructure, `Employee Read-Only Payroll (Net Salary: ₹${myPayrollRes.data.salaryStructure.netSalary})`);

    // 16. Payroll: Admin Generate Monthly Payroll
    const genPayrollRes = await request(
      'POST',
      '/payroll/generate-monthly',
      {
        month: 1,
        year: 2026,
      },
      adminToken
    );
    assert(genPayrollRes.status === 200 && genPayrollRes.data.count > 0, `Admin Auto-Calculate Monthly Payroll (${genPayrollRes.data.count} payslips)`);

    // 17. Payroll: Update Salary Structure
    const updateSalaryRes = await request(
      'PUT',
      `/payroll/structure/${empId}`,
      {
        basic: 70000,
        hra: 28000,
        allowances: 15000,
      },
      adminToken
    );
    assert(updateSalaryRes.status === 200 && updateSalaryRes.data.salaryStructure.basic === 70000, 'Admin Update Employee Salary Structure (/api/payroll/structure/:id)');

    // 18. Dashboard Stats: Admin View
    const adminStatsRes = await request('GET', '/dashboard/stats', null, adminToken);
    assert(
      adminStatsRes.status === 200 && adminStatsRes.data.role === 'admin' && adminStatsRes.data.overview.totalEmployees > 0,
      `Admin Dashboard Analytics (Total Employees: ${adminStatsRes.data.overview.totalEmployees})`
    );

    // 19. Dashboard Stats: Employee View
    const empStatsRes = await request('GET', '/dashboard/stats', null, empToken);
    assert(
      empStatsRes.status === 200 && empStatsRes.data.role === 'employee' && empStatsRes.data.todayStatus,
      'Employee Dashboard Analytics (Today Status & Weekly Stats)'
    );

    // 20. Dashboard Activity Logs
    const actRes = await request('GET', '/dashboard/activity', null, adminToken);
    assert(actRes.status === 200 && Array.isArray(actRes.data.logs), `Activity Audit Trail (Found ${actRes.data.logs.length} logged events)`);

    console.log('\n======================================================');
    console.log(`📊 Test Summary: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
    console.log('======================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL BACKEND ENDPOINTS & EDGE CASES VERIFIED 100% OPERATIONAL!\n');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test execution error:', err.message);
    process.exit(1);
  }
};

// Execute if run directly
if (require.main === module) {
  runVerification();
}

module.exports = { runVerification };
