import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dayflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Format errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Employee Endpoints
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  uploadFile: (id, formData) =>
    api.post(`/employees/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDoc: (id, docId) => api.delete(`/employees/${id}/documents/${docId}`),
  delete: (id) => api.delete(`/employees/${id}`),
  getDepartments: () => api.get('/employees/departments/summary'),
};

// Attendance Endpoints
export const attendanceAPI = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getToday: () => api.get('/attendance/today'),
  getMyHistory: (params) => api.get('/attendance/my-history', { params }),
  getAll: (params) => api.get('/attendance/all', { params }),
  manualCorrection: (id, data) => api.put(`/attendance/${id}`, data),
};

// Leave Endpoints
export const leaveAPI = {
  apply: (data) => api.post('/leaves/apply', data),
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getAll: (params) => api.get('/leaves/all', { params }),
  updateStatus: (id, data) => api.patch(`/leaves/${id}/status`, data),
  cancel: (id) => api.delete(`/leaves/${id}`),
};

// Payroll Endpoints
export const payrollAPI = {
  getMyPayroll: () => api.get('/payroll/my-payroll'),
  getAll: (params) => api.get('/payroll/all', { params }),
  updateStructure: (id, data) => api.put(`/payroll/structure/${id}`, data),
  generateMonthly: (data) => api.post('/payroll/generate-monthly', data),
  getPayslipById: (id) => api.get(`/payroll/payslip/${id}`),
  markPaid: (id, data) => api.patch(`/payroll/${id}/pay`, data),
};

// Dashboard & Analytics Endpoints
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
};

export default api;
