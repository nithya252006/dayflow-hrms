const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getMonthName = (month, year) => {
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

const calculateMonthlyPayroll = (employee, attendanceRecords = [], month, year, totalWorkingDays = 22) => {
  const salaryStructure = employee.salaryStructure || {
    basic: 40000,
    hra: 16000,
    allowances: 10000,
    deductions: { pf: 4800, tax: 3200 },
  };

  const basic = Number(salaryStructure.basic || 0);
  const hra = Number(salaryStructure.hra || 0);
  const allowances = Number(salaryStructure.allowances || 0);
  const grossEarnings = basic + hra + allowances;

  // Analyze attendance in that month
  let presentDays = 0;
  let halfDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let absentDays = 0;

  attendanceRecords.forEach((record) => {
    if (record.status === 'Present') {
      presentDays += 1;
    } else if (record.status === 'Half-day') {
      halfDays += 1;
    } else if (record.status === 'Leave') {
      if (record.remarks?.toLowerCase().includes('unpaid')) {
        unpaidLeaveDays += 1;
      } else {
        paidLeaveDays += 1;
      }
    } else if (record.status === 'Absent') {
      absentDays += 1;
    }
  });

  // Calculate Loss of Pay (LOP)
  // Per day salary rate based on basic salary
  const perDayBasic = basic / totalWorkingDays;
  const lopDays = unpaidLeaveDays + absentDays + halfDays * 0.5;
  const lopDeduction = Math.round(lopDays * perDayBasic);

  const pfDeduction = Number(salaryStructure.deductions?.pf || Math.round(basic * 0.12));
  const taxDeduction = Number(salaryStructure.deductions?.tax || Math.round(grossEarnings * 0.05));
  const totalDeductions = pfDeduction + taxDeduction + lopDeduction;

  const netPay = Math.max(0, grossEarnings - totalDeductions);

  return {
    month,
    year,
    monthName: getMonthName(month, year),
    totalWorkingDays,
    presentDays,
    halfDays,
    paidLeaveDays,
    unpaidLeaveDays,
    absentDays,
    basic,
    hra,
    allowances,
    grossEarnings,
    lopDeduction,
    pfDeduction,
    taxDeduction,
    totalDeductions,
    netPay,
    status: 'Generated',
  };
};

module.exports = {
  MONTH_NAMES,
  getMonthName,
  calculateMonthlyPayroll,
};
