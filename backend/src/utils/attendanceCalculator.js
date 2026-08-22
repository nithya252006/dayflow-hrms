// Helper: Format Date object to 'YYYY-MM-DD' in local/UTC normalized format
const formatDate = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Calculate difference in hours between two dates
const calculateHours = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return 0;
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diffMs = end - start;
  if (diffMs <= 0) return 0;
  const hours = diffMs / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100; // round to 2 decimal places
};

// Helper: Determine attendance status based on hours worked
const determineStatus = (hours) => {
  if (hours >= 7.5) {
    return 'Present';
  }
  if (hours >= 4) {
    return 'Half-day';
  }
  return 'Absent';
};

// Helper: Get start (Monday) and end (Sunday) of current week
const getWeekRange = (current = new Date()) => {
  const date = new Date(current);
  const day = date.getDay();
  const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(date.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: formatDate(monday),
    end: formatDate(sunday),
    startDate: monday,
    endDate: sunday,
  };
};

module.exports = {
  formatDate,
  calculateHours,
  determineStatus,
  getWeekRange,
};
