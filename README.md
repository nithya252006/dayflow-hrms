# ⚡ Dayflow - Human Resource Management System (HRMS)
> *Every workday, perfectly aligned.*

Dayflow is a modern, high-performance Human Resource Management System (HRMS) built for hackathons with the **MERN Stack** (MongoDB, Express, React, Node.js) and styled with a **Dark Obsidian & Electric Cyan Luxury Theme**.

---

## 🌟 Key Highlights & Features

- 💎 **Luxury Fintech / HRMS Aesthetic**: Obsidian dark canvas, glassmorphism cards, glowing electric cyan accents, and capsule pill switchers with 3-mode theme switcher (**Dark Luxury**, **Slate Blue**, **Clean Light**).
- 🔐 **Role-Based Authentication (RBAC)**: Distinct permissions for **Admin**, **HR Officer**, and **Employee** with JWT & bcrypt security.
- ⏱️ **Interactive Attendance Tracking**: Live shift terminal, 1-Click Check-In/Out with real-time timers, duplicate check-in prevention, and auto-status determination (`Present`, `Half-day`, `Absent`).
- 🏖️ **Leave & Time-Off Workflows**: Live quota balances (`Paid`, `Sick`, `Unpaid`), date sanity checks, overlap prevention, and 1-Click Admin Approvals with automatic attendance and quota synchronization.
- 💰 **Automated Payroll & LOP Engine**: 1-Click Monthly Payroll generator with automatic Loss of Pay (LOP) calculations `(Basic / WorkingDays) * UnpaidLeaves`, and formal printable digital payslips.
- 👥 **Employee Directory & Dossier**: Grid & Table views, department filtering, and comprehensive profile modals with an integrated **Document Repository Manager** (upload/download attachments).
- 🔄 **Admin Perspective Switcher**: 1-Click perspective switcher in top navbar to view the workspace as any employee during live jury demonstrations.
- 🚀 **Zero-Friction Dual-Mode Database**: Supports MongoDB Atlas URI as well as an automatic embedded in-memory database with pre-seeded demo accounts.

---

## 🔑 Demo Credentials (Pre-seeded)

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | Eleanor Vance | `admin@dayflow.com` | `Admin@123` |
| **💼 HR Officer** | Marcus Sterling | `hr@dayflow.com` | `Hr@123` |
| **💻 Tech Lead** | Alex Morgan | `alex.morgan@dayflow.com` | `User@123` |
| **🎨 Design Lead** | Sarah Chen | `sarah.chen@dayflow.com` | `User@123` |
| **☁️ DevOps Engineer** | David Kim | `david.kim@dayflow.com` | `User@123` |

---

## 🏗️ Project Architecture

```
dayflow-hrms/
├── backend/
│   ├── server.js                  # Main Express server entry & static production serving
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config/db.js           # Resilient dual-mode MongoDB connection
│   │   ├── models/                # User, Attendance, Leave, Payroll, ActivityLog
│   │   ├── middleware/            # JWT Protect, Role Authorize, Multer Upload, ErrorHandler
│   │   ├── controllers/           # Auth, Employee, Attendance, Leave, Payroll, Dashboard
│   │   ├── routes/                # REST API route handlers
│   │   ├── utils/                 # Token generator, Attendance & Payroll calculators
│   │   └── seeder/seedData.js     # Pre-populated realistic workforce dataset
│   └── tests/api_verify.js        # 20-point automated E2E API verification suite
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js         # Custom luxury theme tokens, glows, gradients
│   ├── vercel.json
│   └── src/
│       ├── App.jsx
│       ├── context/               # AuthContext, ThemeContext
│       ├── services/api.js        # Axios API client with interceptors
│       ├── components/
│       │   ├── common/            # AppCard, HeroGradientCard, PillTabs, Badge, AppButton, DataTable, ModalDialog, StatCard
│       │   ├── layout/            # Navbar, EmployeeSwitcher
│       │   └── charts/            # AttendanceBarChart, PayrollDonutChart, DepartmentRadarChart, AttendanceWaveChart
│       └── pages/                 # LoginPage, DashboardPage, AttendancePage, LeavesPage, PayrollPage, EmployeesPage
└── package.json                   # Root monorepo script for 1-click cloud deployment
```

---

## 🚀 Running Locally

### 1. Prerequisites
- Node.js (v18+) & npm

### 2. Quick Start

#### Start Backend (`http://localhost:5000`):
```bash
cd backend
npm install
npm start
```

#### Start Frontend (`http://localhost:5173`):
```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser and click any 1-Click Demo Login button!

---

## 🧪 Automated API Verification

Run the automated test suite against the backend:
```bash
cd backend
npm run test:api
```
*Result: 20/20 Endpoints & Edge Cases Passed.*

---

## ☁️ Deployment

### 1-Click All-in-One Deployment (Render)
1. Link repository to [Render.com](https://render.com) as a **Web Service**.
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. Both Frontend UI and Backend API will be live on a single URL!

---

## 📄 License
MIT License • Built for Odoo Hackathon
