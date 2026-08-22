import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeAPI } from '../services/api';
import { AppCard } from '../components/common/AppCard';
import { Badge } from '../components/common/Badge';
import { AppButton } from '../components/common/AppButton';
import { DataTable } from '../components/common/DataTable';
import { ModalDialog } from '../components/common/ModalDialog';
import { PillTabs } from '../components/common/PillTabs';
import {
  Users,
  UserPlus,
  Search,
  LayoutGrid,
  List,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Upload,
  Trash2,
  Edit,
  Shield,
  Eye,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const EmployeesPage = () => {
  const { user, isStaff } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Profile Dossier Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  // Create Employee Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: 'User@123',
    role: 'employee',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    phone: '',
    address: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Upload Document State
  const [uploadLoading, setUploadLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const empRes = await employeeAPI.getAll({ limit: 100 });
      if (empRes.success) {
        setEmployees(empRes.employees || []);
      }

      const deptRes = await employeeAPI.getDepartments();
      if (deptRes.success) {
        setDepartments(deptRes.departments || []);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenProfile = async (emp) => {
    setSelectedEmployee(emp);
    setEditForm({
      name: emp.name,
      jobTitle: emp.jobTitle,
      department: emp.department,
      phone: emp.phone || '',
      address: emp.address || '',
      role: emp.role,
    });
    setEditMode(false);
    setProfileModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setSaveLoading(true);
    try {
      const res = await employeeAPI.update(selectedEmployee._id, editForm);
      if (res.success) {
        setSelectedEmployee(res.employee);
        setEditMode(false);
        await loadData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFileUpload = async (e, type = 'document') => {
    const file = e.target.files[0];
    if (!file || !selectedEmployee) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append(type, file);
    if (type === 'document') {
      formData.append('title', file.name);
    }

    try {
      const res = await employeeAPI.uploadFile(selectedEmployee._id, formData);
      if (res.success) {
        setSelectedEmployee((prev) => ({
          ...prev,
          documents: res.documents || prev.documents,
          avatar: res.avatar || prev.avatar,
        }));
        await loadData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!selectedEmployee) return;
    try {
      const res = await employeeAPI.deleteDoc(selectedEmployee._id, docId);
      if (res.success) {
        setSelectedEmployee((prev) => ({
          ...prev,
          documents: res.documents,
        }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      const res = await employeeAPI.create(createForm);
      if (res.success) {
        setCreateModalOpen(false);
        setCreateForm({
          employeeId: '',
          name: '',
          email: '',
          password: 'User@123',
          role: 'employee',
          department: 'Engineering',
          jobTitle: 'Software Engineer',
          phone: '',
          address: '',
        });
        await loadData();
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create employee profile.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      !s ||
      emp.name?.toLowerCase().includes(s) ||
      emp.email?.toLowerCase().includes(s) ||
      emp.employeeId?.toLowerCase().includes(s) ||
      emp.jobTitle?.toLowerCase().includes(s);
    return matchesDept && matchesSearch;
  });

  // Columns for Table View
  const tableColumns = [
    {
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt={row.name}
              className="w-9 h-9 rounded-2xl object-cover border border-brand-cyan/30"
            />
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-cyan to-brand-blue text-white font-bold text-xs flex items-center justify-center">
              {row.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-100">{row.name}</div>
            <div className="text-[11px] text-brand-textMuted font-mono">
              {row.employeeId}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department & Role',
      render: (row) => (
        <div>
          <div className="text-slate-200 font-medium">{row.jobTitle}</div>
          <div className="text-xs text-brand-cyan/80">{row.department}</div>
        </div>
      ),
    },
    {
      header: 'Contact Email',
      accessor: 'email',
      render: (row) => <span className="text-xs text-slate-300">{row.email}</span>,
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <Badge variant={row.role} size="sm">
          {row.role.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'present' : 'absent'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleOpenProfile(row)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs font-semibold cursor-pointer shadow-glow-pill"
        >
          <Eye size={13} />
          <span>Dossier</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Onboard Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-3xl p-6 border border-brand-cyan/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Employee Directory & Dossier
          </h1>
          <p className="text-xs sm:text-sm text-brand-textMuted mt-1">
            Manage employee profiles, job titles, department assignments, and document repositories.
          </p>
        </div>

        {isStaff && (
          <AppButton
            variant="primary"
            icon={UserPlus}
            onClick={() => setCreateModalOpen(true)}
            className="shadow-glow-cyan py-2.5 px-5"
          >
            Onboard New Employee
          </AppButton>
        )}
      </div>

      {/* Filter & View Mode Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Department Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['All', 'Engineering', 'Design', 'Human Resources', 'Marketing', 'Sales', 'Finance'].map(
            (dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'glow-pill-active text-white'
                    : 'bg-[#081226] text-brand-textMuted hover:text-slate-200 border border-white/5'
                }`}
              >
                {dept}
              </button>
            )
          )}
        </div>

        {/* Search & Grid/Table Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-64">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-textMuted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search directory..."
              className="w-full bg-[#081226] text-xs text-slate-100 placeholder:text-brand-textMuted pl-9 pr-3 py-2 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-[#081226] p-1 rounded-2xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-brand-cyan/20 text-brand-cyan'
                  : 'text-brand-textMuted hover:text-white'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-brand-cyan/20 text-brand-cyan'
                  : 'text-brand-textMuted hover:text-white'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View of Employees */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((emp) => (
            <div
              key={emp._id}
              onClick={() => handleOpenProfile(emp)}
              className="glass-card rounded-3xl p-6 border border-brand-cyan/15 hover:border-brand-cyan/40 hover:shadow-glow-cyan/25 transition-all duration-300 cursor-pointer relative group flex flex-col justify-between"
            >
              <div>
                {/* Avatar & Role Badge */}
                <div className="flex items-start justify-between mb-4">
                  {emp.avatar ? (
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-cyan/30 shadow-glow-pill group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-cyan to-brand-blue text-white font-bold text-lg flex items-center justify-center shadow-glow-pill">
                      {emp.name.charAt(0)}
                    </div>
                  )}
                  <Badge variant={emp.role} size="sm">
                    {emp.role.toUpperCase()}
                  </Badge>
                </div>

                {/* Name & Job Title */}
                <h3 className="text-base font-bold text-white tracking-tight group-hover:text-brand-cyan transition-colors">
                  {emp.name}
                </h3>
                <p className="text-xs text-brand-cyan/90 font-medium mt-0.5">
                  {emp.jobTitle}
                </p>
                <div className="text-[11px] text-brand-textMuted mt-1">
                  Department: <span className="text-slate-300">{emp.department}</span>
                </div>

                {/* Contact Chips */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <Mail size={13} className="text-brand-textMuted shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-brand-textMuted shrink-0" />
                    <span>{emp.phone || 'Phone not added'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[11px] text-brand-cyan font-bold">
                  {emp.employeeId}
                </span>
                <span className="text-xs text-brand-cyan font-semibold flex items-center gap-1">
                  View Dossier →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AppCard>
          <DataTable
            columns={tableColumns}
            data={filteredEmployees}
            searchable={false}
            pageSize={10}
          />
        </AppCard>
      )}

      {/* Comprehensive Profile Dossier Modal */}
      <ModalDialog
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title={selectedEmployee ? `${selectedEmployee.name}'s Dossier` : 'Employee Profile'}
        subtitle={`Employee ID: ${selectedEmployee?.employeeId} • ${selectedEmployee?.department}`}
        maxWidth="max-w-3xl"
        footer={
          editMode ? (
            <>
              <AppButton
                variant="ghost"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                variant="primary"
                loading={saveLoading}
                onClick={handleSaveProfile}
              >
                Save Changes
              </AppButton>
            </>
          ) : (
            <>
              <AppButton
                variant="ghost"
                onClick={() => setProfileModalOpen(false)}
              >
                Close
              </AppButton>
              <AppButton
                variant="primary"
                icon={Edit}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </AppButton>
            </>
          )
        }
      >
        {selectedEmployee && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Header Bio Card */}
            <div className="p-5 rounded-3xl bg-[#081226] border border-brand-cyan/20 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                {selectedEmployee.avatar ? (
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="w-20 h-20 rounded-3xl object-cover border-2 border-brand-cyan/40 shadow-glow-pill"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-cyan to-brand-blue text-white font-bold text-2xl flex items-center justify-center">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-[11px] font-bold">
                  <Upload size={16} className="mr-1" /> Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                  />
                </label>
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {selectedEmployee.name}
                  </h3>
                  <Badge variant={selectedEmployee.role} size="sm">
                    {selectedEmployee.role.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-brand-cyan font-semibold mt-0.5">
                  {selectedEmployee.jobTitle} • {selectedEmployee.department}
                </p>
                <p className="text-[11px] text-brand-textMuted mt-1">
                  Joined {new Date(selectedEmployee.joiningDate || selectedEmployee.createdAt).toLocaleDateString()} • {selectedEmployee.employmentType || 'Full-time'}
                </p>
              </div>
            </div>

            {/* Edit / View Form */}
            {editMode ? (
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
                  >
                    {['Engineering', 'Design', 'Human Resources', 'Marketing', 'Sales', 'Finance'].map(
                      (d) => (
                        <option key={d} value={d}>{d}</option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
                  />
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-xs">
                <div>
                  <span className="text-brand-textMuted block">Email Address:</span>
                  <span className="font-semibold text-white">{selectedEmployee.email}</span>
                </div>
                <div>
                  <span className="text-brand-textMuted block">Phone:</span>
                  <span className="font-semibold text-white">{selectedEmployee.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-brand-textMuted block">Address:</span>
                  <span className="font-semibold text-white truncate block">{selectedEmployee.address || '—'}</span>
                </div>
                <div>
                  <span className="text-brand-textMuted block">Net Monthly Salary:</span>
                  <span className="font-mono font-bold text-brand-cyan">
                    ₹{selectedEmployee.salaryStructure?.netSalary?.toLocaleString() || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-brand-textMuted block">Paid Leave Balance:</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedEmployee.leaveBalances?.paid || 12} days left
                  </span>
                </div>
                <div>
                  <span className="text-brand-textMuted block">Sick Leave Balance:</span>
                  <span className="font-semibold text-sky-400">
                    {selectedEmployee.leaveBalances?.sick || 8} days left
                  </span>
                </div>
              </div>
            )}

            {/* Document Repository Section */}
            <div className="p-4 rounded-2xl bg-[#081226] border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-brand-cyan" />
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Attached Documents & Proofs ({selectedEmployee.documents?.length || 0})
                  </h4>
                </div>

                <label className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs font-semibold cursor-pointer shadow-glow-pill">
                  <Upload size={13} />
                  <span>Upload Document</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'document')}
                  />
                </label>
              </div>

              {selectedEmployee.documents && selectedEmployee.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedEmployee.documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={15} className="text-brand-cyan" />
                        <div>
                          <span className="font-semibold text-slate-100">{doc.title}</span>
                          <span className="text-[10px] text-brand-textMuted ml-2">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5000${doc.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-brand-cyan hover:underline text-xs"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc._id)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-brand-textMuted text-center py-4">
                  No documents attached to this dossier yet.
                </p>
              )}
            </div>
          </div>
        )}
      </ModalDialog>

      {/* Onboard New Employee Modal */}
      <ModalDialog
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Onboard New Employee"
        subtitle="Create a new employee profile in Dayflow HRMS"
        footer={
          <>
            <AppButton
              variant="ghost"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              loading={createLoading}
              onClick={handleCreateEmployee}
            >
              Create Account
            </AppButton>
          </>
        }
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs sm:text-sm">
          {createError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employee ID (e.g. EMP107)
              </label>
              <input
                type="text"
                required
                value={createForm.employeeId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, employeeId: e.target.value.toUpperCase() })
                }
                placeholder="EMP107"
                className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Work Email
              </label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="jane.doe@dayflow.com"
                className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role & Permissions
              </label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
              >
                <option value="employee">Employee (Standard Access)</option>
                <option value="hr">HR Officer (Management & Approvals)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                required
                value={createForm.jobTitle}
                onChange={(e) => setCreateForm({ ...createForm, jobTitle: e.target.value })}
                placeholder="Senior Product Designer"
                className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department
              </label>
              <select
                value={createForm.department}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                className="w-full bg-[#081226] text-slate-100 p-2.5 rounded-2xl border border-brand-cyan/20 focus:border-brand-cyan focus:outline-none"
              >
                {['Engineering', 'Design', 'Human Resources', 'Marketing', 'Sales', 'Finance'].map(
                  (d) => (
                    <option key={d} value={d}>{d}</option>
                  )
                )}
              </select>
            </div>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};

export default EmployeesPage;
