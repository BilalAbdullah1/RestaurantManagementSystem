# 🏫 VOKE Solutions SMS — Phase 1: System Foundation & Security Administration

> **System:** VOKE Solutions School Management System (SMS)  
> **Phase Target:** Phase 1 — Multi-Tenant Architecture, Security Infrastructure, Access Control & Device Integration  
> **Documentation Style:** Point-to-Point Step-by-Step Guide with Clean Data Tables  
> **Language:** English  
> **Data Integrity:** 100% Human-Readable Sample Data — **Zero Raw GUIDs**

---

## 📑 Phase 1 Navigation Overview

* [Screen 1.1: Campus & Multi-Tenant Setup (`/Tenants`)](#-screen-11-campus--multi-tenant-setup)
* [Screen 1.2: System Roles Management (`/Roles`)](#-screen-12-system-roles-management)
* [Screen 1.3: Granular Permissions Matrix (`/PermissionsMatrix`)](#-screen-13-granular-permissions-matrix)
* [Screen 1.4: System User Accounts & Access Control (`/UserManagement`)](#-screen-14-system-user-accounts--access-control)
* [Screen 1.5: Biometric Attendance Devices Integration (`/BiometricDevices`)](#-screen-15-biometric-attendance-devices-integration)
* [Screen 1.6: Academic Calendar & Holiday Planner (`/HolidayCalendar`)](#-screen-16-academic-calendar--holiday-planner)
* [Screen 1.7: System Security Settings & 2FA Policies (`/SecuritySettings`)](#-screen-17-system-security-settings--2fa-policies)
* [Screen 1.8: System Audit Logs & Activity Trail (`/SystemAudits`)](#-screen-18-system-audit-logs--activity-trail)
* [Screen 1.9: Data Migration Tool (Excel/CSV Bulk Import) (`/DataMigration`)](#-screen-19-data-migration-tool-excelcsv-bulk-import)
* [Screen 1.10: Database Backup & Recovery Manager (`/DatabaseBackup`)](#-screen-110-database-backup--recovery-manager)
* [Screen 1.11: Executive Multi-Campus Master Dashboard (`/ExecutiveMasterDashboard`)](#-screen-111-executive-multi-campus-master-dashboard)

---

## 🏢 Screen 1.1: Campus & Multi-Tenant Setup

### 📌 1. Screen Identity & Overview
* **Screen Name:** Campus & Multi-Tenant Workspace Configuration
* **Navigation Route:** `/Tenants`
* **Source File Location:** `src/features/settings/Tenants.tsx`
* **Authorized Access:** Super Administrator, School Board, Executive Director

### 🎯 2. Operational Value & Business Purpose
* **Multi-Branch Support:** Allows a school system to register multiple branches (e.g., Boys Campus, Girls Campus, Junior Wing) in one unified system.
* **Complete Data Segregation:** Guarantees that students, fee structures, and attendance records of one branch do not mix with another branch.
* **Centralized Oversight:** Enables head-office executives to monitor all branches from one master login while branch staff only see their own branch data.

### 📝 3. Form Fields & Input Information
* **Campus Code:** Unique alphanumeric short code for the branch (e.g., `EIS-MAIN-01`).
* **Campus Name:** Full registered name of the school branch (e.g., *Excellence School Main Boys Wing*).
* **Domain Slug:** URL-safe sub-identifier (e.g., `main-campus`).
* **Principal / In-Charge Name:** Full name of the campus head.
* **Official Email:** Dedicated email for campus communications and system alerts.
* **Contact Phone:** Primary telephone number for parent and administrative contact.
* **Student Capacity:** Maximum physical enrollment capacity (e.g., `1,500`).
* **Physical Address:** Complete street address printed on student fee challans and reports.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Check KPI Summary:** Review top cards displaying *Total Campuses*, *Active Campuses*, *Total Student Capacity*, and *Suspended Campuses*.
2. **Search / Filter:** Type branch keywords in the search bar or use the status dropdown to filter Active or Suspended branches.
3. **Add a New Campus:**
   * Click the **"+ Add New Campus"** button on the top right.
   * A slide-over drawer form opens from the right side.
   * Enter all required fields: Campus Code, Campus Name, Principal Name, Email, Phone, Capacity, and Address.
   * Click **"Save Campus"** to generate the new branch workspace.
4. **Manage Existing Campuses (Row Action Menu `...`):**
   * **Edit Campus:** Update principal name, contact phone, or address.
   * **Switch Workspace:** Instantly switch your current admin session into that specific campus.
   * **Toggle Status:** Mark branch as *Active*, *Inactive*, or *Under Maintenance*.
5. **Export Records:** Click **Export CSV** or **Export PDF** to download the complete campus directory.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Campus Code | Campus Name | City / Location | Principal In-Charge | Official Email | Contact Phone | Max Capacity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EIS-MAIN-01** | Excellence School (Main Boys Wing) | Islamabad (Sector H-8) | Prof. Tariq Mehmood | `main@excellence.edu.pk` | +92-51-2244111 | 1,500 | `Active` |
| **EIS-GIRLS-02** | Excellence School (Girls Senior Wing) | Islamabad (Sector F-7) | Dr. Shahida Parveen | `girls@excellence.edu.pk` | +92-51-2244222 | 1,200 | `Active` |
| **EIS-JUN-03** | Excellence Junior & Montessori Wing | Rawalpindi (Saddar Cantt) | Mrs. Ayesha Kamran | `junior@excellence.edu.pk` | +92-51-5566333 | 800 | `Active` |
| **EIS-WEST-04** | Excellence City Campus (Westridge) | Rawalpindi (Westridge) | Engr. Farhan Qureshi | `west@excellence.edu.pk` | +92-51-5588444 | 1,000 | `Active` |
| **EIS-LHR-05** | Excellence Model Town Campus | Lahore (Model Town C) | Mr. Usman Ghani | `lhr@excellence.edu.pk` | +42-35889911 | 2,000 | `Active` |
| **EIS-KHI-06** | Excellence Gulshan Campus | Karachi (Gulshan Block 4)| Ms. Naila Siddiqui | `khi@excellence.edu.pk` | +21-34981122 | 1,800 | `Active` |
| **EIS-PESH-07** | Excellence University Town Campus | Peshawar (University Town) | Dr. Asfandyar Khan | `pesh@excellence.edu.pk` | +91-58442211 | 900 | `Maintenance` |

---

## 🛡️ Screen 1.2: System Roles Management

### 📌 1. Screen Identity & Overview
* **Screen Name:** Organizational Roles Definition & Governance
* **Navigation Route:** `/Roles`
* **Source File Location:** `src/features/settings/Roles.tsx`
* **Authorized Access:** Super Administrator

### 🎯 2. Operational Value & Business Purpose
* **Job Function Segregation:** Defines official job roles (e.g., Principal, Class Teacher, Accountant, Fee Collector, Transport Manager, Parent, Student).
* **Security Boundaries:** Ensures staff only see menus and screens relevant to their job and prevents unauthorized access to fee collections or student grades.
* **System Protection:** Core administrative roles are locked to prevent accidental deletion or privilege lockout.

### 📝 3. Form Fields & Input Information
* **Role Code:** Unique system key with uppercase prefix (e.g., `ROLE-ACCOUNTANT`).
* **Role Name:** User-friendly display title (e.g., *Senior Finance Officer*).
* **Department / Category:** Department group (*Administrative*, *Academic*, *Finance*, *Support*, *Portal User*).
* **Scope Description:** Clear summary of job responsibilities and privileges.
* **System Protected Flag:** Toggle indicating if this is a non-deletable system-level role.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Roles Directory:** View total roles count, system-locked roles, and total assigned active users.
2. **Filter by Department:** Click category tabs to isolate Academic, Finance, or Support roles.
3. **Create a Custom Role:**
   * Click **"+ Create New Role"** button.
   * In the drawer modal, enter Role Code, Role Name, Department, and Description.
   * Click **"Save Role"** to register.
4. **Manage Role Actions (`...`):**
   * **Assign Permissions:** Navigates directly to Screen 1.3 to configure checkbox privileges for this role.
   * **View Assigned Users:** Displays all staff or parents currently holding this role.
   * **Duplicate Role:** Clones the permission profile of an existing role to quickly create a junior/senior variant.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Role Code | Role Name | Category / Department | Scope Description | Assigned Users | System Protected | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **ROLE-SUPERADMIN** | Super Administrator | Executive Management | Full unrestricted access across all campuses, finance, and system settings | 3 Users | `Yes (Locked)` | `Active` |
| **ROLE-PRINCIPAL** | Campus Principal | Campus Administration | Academic supervision, staff leaves approval, and exam broadsheet signoff | 7 Users | `Yes (Locked)` | `Active` |
| **ROLE-TEACHER** | Academic Teacher | Academic Faculty | Daily attendance, student diary, homework creation, and marks entry | 85 Users | `Yes (Locked)` | `Active` |
| **ROLE-ACCOUNTANT** | Senior Finance Officer | Finance & Accounts | Fee structure creation, challan generation, POS collections, and ledger | 6 Users | `No` | `Active` |
| **ROLE-ADMISSION** | Admissions Officer | Front Office & Desk | Inquiries handling, student registration, visitor passes, and gate passes | 4 Users | `No` | `Active` |
| **ROLE-LIBRARIAN** | Chief Librarian | Auxiliary Services | Book catalog management, barcode issue/return scanning, and fine waivers | 3 Users | `No` | `Active` |
| **ROLE-TRANSPORT** | Transport In-Charge | Logistics & Fleet | Bus routes, vehicle fleet maintenance, driver mapping, and bus stops | 2 Users | `No` | `Active` |
| **ROLE-HOSTEL** | Hostel Warden | Residential Services | Hostel room setup, bed allocation, student check-in/out, and mess billing | 2 Users | `No` | `Active` |
| **ROLE-PARENT** | Parent / Guardian | Self-Service Portal | View child attendance, fee challans online payment, and report cards | 1,420 Users | `Yes (Locked)` | `Active` |
| **ROLE-STUDENT** | Enrolled Student | Self-Service Portal | View timetable, submit homework, take online CBT exams, and view diary | 2,150 Users | `Yes (Locked)` | `Active` |

---

## 🔐 Screen 1.3: Granular Permissions Matrix

### 📌 1. Screen Identity & Overview
* **Screen Name:** Role-Based Access Control (RBAC) Permissions Matrix
* **Navigation Route:** `/PermissionsMatrix`
* **Source File Location:** `src/features/settings/PermissionsMatrixManager.tsx`
* **Authorized Access:** Super Administrator

### 🎯 2. Operational Value & Business Purpose
* **Atomic Access Control:** Gives administrators granular control over what each role can do (e.g., can a teacher *view* fees? No. Can a teacher *enter exam marks*? Yes).
* **Module Grouping:** Organizes permissions into clean modules (*Academics*, *Finance*, *HR*, *Exams*, *Front Office*, *Security*).
* **Standard Presets:** Allows one-click application of recommended security templates for standard school roles.

### 📝 3. Matrix Structure & Available Privileges
* **Finance Permissions:** Fee Challan Generate, Fee Collect at POS, Concession Approval, Ledger View, Salary Slip Process.
* **Academic Permissions:** Master Timetable Edit, Daily Diary Post, Lesson Plan Review, Study Material Upload.
* **Examination Permissions:** Exam Setup Create, Marks Entry, Grade Lock, Broadsheet Finalize, Admit Card Print.
* **HR & Staff Permissions:** Staff Registration, Biometric Sync, Leave Approval, Loan Disbursement, Staff Appraisal.
* **Security & Audits:** System Audit Trail View, Database Backup Run, User Password Reset.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Target Role:** Choose a role from the top dropdown (e.g., `ROLE-ACCOUNTANT` or `ROLE-TEACHER`).
2. **Expand / Collapse Modules:** Use the accordion headers to navigate through Finance, Academics, Exams, or HR.
3. **Toggle Permissions:**
   * Check or uncheck individual permission checkboxes.
   * Click **"Select All in Module"** to grant full access to that functional area.
4. **Use Preset Templates:** Click **"Reset to Recommended Presets"** if you want to apply default industry-standard permissions.
5. **Save Changes:** Click the primary **"Save Permissions Matrix"** button to apply updates immediately across the server.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Module Category | Permission Key | Human-Readable Description | Super Admin | Principal | Accountant | Teacher |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Finance** | `finance.challan.generate` | Bulk generate monthly student fee challans | `Granted` | `Granted` | `Granted` | `Denied` |
| **Finance** | `finance.fee.collect` | Receive fee payments via Cash / POS counter | `Granted` | `Denied` | `Granted` | `Denied` |
| **Finance** | `finance.concession.approve` | Approve fee discounts and sibling concessions | `Granted` | `Granted` | `Denied` | `Denied` |
| **Academics** | `academics.timetable.edit` | Create and alter class master timetables | `Granted` | `Granted` | `Denied` | `Denied` |
| **Academics** | `academics.diary.post` | Publish daily homework and diary entries | `Granted` | `Granted` | `Denied` | `Granted` |
| **Exams** | `exams.marks.entry` | Enter and update student subject marks | `Granted` | `Granted` | `Denied` | `Granted` |
| **Exams** | `exams.marks.lock` | Permanently lock final broadsheet grades | `Granted` | `Granted` | `Denied` | `Denied` |
| **HR & Staff** | `hr.payroll.generate` | Process monthly staff salary vouchers | `Granted` | `Denied` | `Granted` | `Denied` |
| **Student Care** | `students.leave.approve` | Approve online student leave applications | `Granted` | `Granted` | `Denied` | `Granted` |
| **Security** | `settings.audit.view` | Inspect system forensic and financial audit trails | `Granted` | `Denied` | `Denied` | `Denied` |

---

## 👥 Screen 1.4: System User Accounts & Access Control

### 📌 1. Screen Identity & Overview
* **Screen Name:** User Accounts Management & Identity Directory
* **Navigation Route:** `/UserManagement`
* **Source File Location:** `src/features/settings/UserManagement.tsx`
* **Authorized Access:** Super Administrator, HR Administrator

### 🎯 2. Operational Value & Business Purpose
* **Login Accounts Hub:** Central repository where all staff, administrators, and management logins are created and maintained.
* **Role & Campus Binding:** Binds each login email to a specific campus workspace and security role.
* **Account Lifecycle:** Allows instant suspension of departing staff and sends password reset links.

### 📝 3. Form Fields & Input Information
* **First Name & Last Name:** Full name of the employee or administrator.
* **Official Email Address:** Unique email used as the system login username.
* **Initial Password:** Secure password (with show/hide eye toggle).
* **Contact Phone Number:** Mobile number for SMS alerts and 2FA OTP codes.
* **Assigned Role:** Selection from active roles (e.g., *Campus Principal*, *Academic Teacher*).
* **Assigned Campus:** Selection of tenant branch (e.g., *Main Boys Campus*).
* **Profile Picture:** Upload passport photo for ID badges and header avatar.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Search Users:** Search by user name or official email, or filter by Role dropdown.
2. **Add a New User:**
   * Click the **"+ Add New User"** button.
   * Enter First Name, Last Name, Official Email, Phone Number, and Password.
   * Select the Assigned Role and Campus Workspace.
   * Upload an optional avatar photo.
   * Click **"Create User Account"**.
3. **Manage Account Status (Row Actions):**
   * **Suspend / Activate:** Instantly lock or restore login access.
   * **Trigger Password Reset:** Sends a secure reset link to the user's email.
   * **Edit Profile:** Update phone number or change role assignments.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| User Code | Full Name | Official Email | Assigned Role | Assigned Campus | Phone Number | Account Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **USR-1001** | Tariq Mehmood | `principal.main@excellence.edu.pk` | Campus Principal | Main Boys Campus | +92-300-1122334 | `Active` |
| **USR-1002** | Bilal Abdullah | `admin@excellence.edu.pk` | Super Administrator | All Campuses (Global) | +92-333-5566778 | `Active` |
| **USR-1003** | Kamran Akmal | `k.akmal@excellence.edu.pk` | Senior Finance Officer | Main Boys Campus | +92-321-9988776 | `Active` |
| **USR-1004** | Dr. Shahida Parveen | `principal.girls@excellence.edu.pk` | Campus Principal | Girls Senior Campus | +92-301-4455667 | `Active` |
| **USR-1005** | Fatima Zahra | `f.zahra@excellence.edu.pk` | Academic Teacher | Girls Senior Campus | +92-345-2233445 | `Active` |
| **USR-1006** | Muhammad Rashid | `m.rashid@excellence.edu.pk` | Chief Librarian | Main Boys Campus | +92-312-6677889 | `Active` |
| **USR-1007** | Subhan Ali | `s.ali@excellence.edu.pk` | Transport In-Charge | Main Boys Campus | +92-302-8899001 | `Active` |
| **USR-1008** | Sana Mir | `s.mir@excellence.edu.pk` | Admissions Officer | Main Boys Campus | +92-334-1122998 | `Active` |
| **USR-1009** | Asad Ullah Khan | `a.ullah@excellence.edu.pk` | Hostel Warden | Main Boys Campus | +92-315-7788990 | `Active` |
| **USR-1010** | Hina Qasim | `h.qasim@excellence.edu.pk` | Academic Teacher | Junior Wing | +92-322-6655443 | `Active` |

---

## 📟 Screen 1.5: Biometric Attendance Devices Integration

### 📌 1. Screen Identity & Overview
* **Screen Name:** Biometric Hardware Terminals & Auto-Sync Manager
* **Navigation Route:** `/BiometricDevices`
* **Source File Location:** `src/features/settings/BiometricDevicesManager.tsx`
* **Authorized Access:** IT Administrator, Super Administrator

### 🎯 2. Operational Value & Business Purpose
* **Automated Clock-In:** Connects physical biometric attendance machines (fingerprint, facial recognition, RFID card) directly to the school database.
* **Eliminates Manual Errors:** Prevents proxy attendance and automates staff morning check-in and late arrival penalties.
* **Multi-Brand Compatibility:** Supports major hardware brands including ZKTeco, Hikvision, Dahua, and Realtime.

### 📝 3. Form Fields & Input Information
* **Device Name:** Descriptive terminal name (e.g., *Main Gate Turnstile Face Terminal*).
* **Static IP Address:** Local network IP assigned to the machine (e.g., `192.168.1.201`).
* **Port Number:** TCP communication port (e.g., `4370` for ZKTeco, `8000` for Hikvision/Dahua).
* **Hardware Brand:** Brand selection (*ZKTeco*, *Hikvision*, *Dahua*, *Realtime*).
* **Physical Location:** Placement area within the campus (e.g., *Senior Staff Room*, *Main Gate*).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Monitor Terminal Health:** Check live green (*Online*) or red (*Offline*) status badges.
2. **Add a Biometric Device:**
   * Click **"+ Add Biometric Device"** button.
   * Enter Device Name, Static IP Address, Port Number, Brand, and Physical Location.
   * Click **"Test Connection"** to verify communication with the physical hardware.
   * Click **"Save Device"** to activate background sync.
3. **Trigger Manual Sync:** Click **"Sync All Logs Now"** to instantly pull today's latest check-in/out timestamps into staff and student attendance sheets.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Device Code | Device Name | IP Address : Port | Hardware Brand | Physical Location | Status | Last Successful Sync |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **BIO-DEV-01** | Main Entrance Face Terminal | `192.168.1.201:4370` | ZKTeco SpeedFace | Main Campus Entry Turnstile | `Online` | 2 Mins Ago (100% Synced) |
| **BIO-DEV-02** | Senior Staff Room Scanner | `192.168.1.202:4370` | Hikvision DS-K1T | Senior Faculty Lounge 1st Floor | `Online` | 5 Mins Ago (100% Synced) |
| **BIO-DEV-03** | Boys Hostel Palm Reader | `192.168.1.203:8000` | Dahua ASI7213X | Boys Hostel Reception Lobby | `Online` | 8 Mins Ago (100% Synced) |
| **BIO-DEV-04** | Girls Campus RFID Terminal | `192.168.2.201:4370` | ZKTeco ProCapture | Girls Campus Main Foyer | `Online` | 1 Min Ago (100% Synced) |
| **BIO-DEV-05** | Transport Terminal Scanner | `192.168.1.205:5005` | Realtime T52 | Bus Terminal & Driver Dispatch | `Offline` | 4 Hours Ago (Timeout) |
| **BIO-DEV-06** | Junior Wing Montessori Gate | `192.168.3.101:4370` | ZKTeco SpeedFace | Junior Branch Drop-off Porch | `Online` | 3 Mins Ago (100% Synced) |

---

## 📅 Screen 1.6: Academic Calendar & Holiday Planner

### 📌 1. Screen Identity & Overview
* **Screen Name:** Academic Session Calendar & Institutional Holiday Planner
* **Navigation Route:** `/HolidayCalendar`
* **Source File Location:** `src/features/settings/HolidayCalendar.tsx`
* **Authorized Access:** Campus Principal, Academic Coordinator

### 🎯 2. Operational Value & Business Purpose
* **Institutional Scheduling:** Maintains official calendar for national holidays, religious vacations, exam prep breaks, and summer recess.
* **Auto-Locks Attendance:** Automatically marks scheduled holiday dates as non-working days, preventing false absence records.
* **Parent & Student Alerts:** Displays vacation countdown banners on student and parent mobile portals.

### 📝 3. Form Fields & Input Information
* **Holiday / Event Title:** Official title (e.g., *Eid-ul-Fitr Holidays*, *Winter Recess*).
* **Start Date:** First day of the vacation/event.
* **End Date:** Final day of the vacation/event.
* **Target Audience:** Who the holiday applies to (*All School*, *Students Only*, *Staff Only*).
* **Official Circular #:** Government or board notification reference number.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Switch Views:** Toggle between the Monthly Interactive Calendar View and the Tabular List View.
2. **Add a Holiday / Break:**
   * Click **"+ Add Holiday / Event"** button.
   * Enter the Event Title and official circular reference.
   * Pick Start and End dates using the date picker.
   * Choose target audience (*All School* vs *Students Only*).
   * Click **"Publish to Calendar"**.
3. **Manage Holidays:** Use the edit or delete buttons on any holiday card to reschedule dates or cancel an event.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Event Code | Event / Holiday Title | Start Date | End Date | Duration | Target Scope | Circular Reference | Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **HOL-2026-01** | Kashmir Solidarity Day | 2026-02-05 | 2026-02-05 | 1 Day | All School | Govt Circular # F.1/2026 | `Observed` |
| **HOL-2026-02** | Pakistan National Day | 2026-03-23 | 2026-03-23 | 1 Day | All School | Federal Notification # 04/26 | `Upcoming` |
| **HOL-2026-03** | Eid-ul-Fitr Holidays | 2026-03-20 | 2026-03-24 | 5 Days | All School | Ministry of Interior # 102 | `Upcoming` |
| **HOL-2026-04** | Labour Day | 2026-05-01 | 2026-05-01 | 1 Day | All School | Public Holiday Circular | `Upcoming` |
| **HOL-2026-05** | Summer Vacations 2026 | 2026-06-01 | 2026-08-14 | 75 Days | Students & Faculty | Annual Summer Break # 88 | `Scheduled` |
| **HOL-2026-06** | Independence Day Celebrations| 2026-08-14 | 2026-08-14 | 1 Day | All School | Flag Hoisting Ceremony | `Scheduled` |
| **HOL-2026-07** | Ashura (9th & 10th Muharram)| 2026-07-26 | 2026-07-27 | 2 Days | All School | Religious Gazetted Holiday | `Scheduled` |
| **HOL-2026-08** | Winter Recess 2026 | 2026-12-24 | 2026-12-31 | 8 Days | All School | Winter Vacation Notification | `Scheduled` |

---

## 🔒 Screen 1.7: System Security Settings & 2FA Policies

### 📌 1. Screen Identity & Overview
* **Screen Name:** Cybersecurity Policies, Session Governance & 2FA
* **Navigation Route:** `/SecuritySettings`
* **Source File Location:** `src/features/settings/SecuritySettings.tsx`
* **Authorized Access:** Super Administrator, Chief Security Officer

### 🎯 2. Operational Value & Business Purpose
* **Institutional Governance:** Enforces strict password standards, idle session auto-logouts, and brute-force lockout rules.
* **Two-Factor Authentication (2FA):** Secures sensitive administrative and financial roles (Accountants, Principals) with OTP verification.
* **Campus IP Lockdown:** Restricts cashier fee collection desks to verified campus IP addresses to prevent offsite tampering.

### 📝 3. Configurable Security Controls
* **2FA Enforcement Policy:** Mandatory, Optional, or Disabled by role.
* **Idle Inactivity Timeout:** Session duration in minutes before automatic logout (e.g., 15 minutes).
* **Failed Login Lockout:** Number of permitted failed login attempts before temporary ban (e.g., 5 attempts).
* **Password Complexity Rules:** Enforce minimum length, uppercase, digits, and special symbols.
* **IP Whitelist Subnet:** Allowed static IP ranges for fee collection counters.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Set 2FA Rules:** Toggle 2FA to *Mandatory* for Super Admin and Finance roles.
2. **Configure Session Timeout:** Move the inactivity slider to 15 minutes for administrative terminals.
3. **Set Lockout Thresholds:** Define 5 failed attempts triggering a 15-minute temporary lockout.
4. **Define IP Restrictions:** Add static IP ranges for cashier desks to block off-campus fee collection.
5. **Save Policies:** Click **"Apply Security Policies"** to enforce rules immediately.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Policy Key | Policy Name | Current Setting Value | Enforcement Level | Impacted Roles |
| :--- | :--- | :--- | :---: | :--- |
| **SEC-POL-01** | Two-Factor Authentication (2FA) | `Mandatory (TOTP / SMS)` | High | Super Admin, Principal, Senior Accountant |
| **SEC-POL-02** | Idle Session Auto-Logout | `15 Minutes Inactivity` | Medium | All Administrative & Teaching Faculty |
| **SEC-POL-03** | Max Failed Login Lockout | `5 Attempts (15 Min Ban)` | High | Global System-Wide |
| **SEC-POL-04** | Password Complexity Rule | `8+ Chars (Upper+Lower+Num+Symbol)` | Medium | All Users (Staff, Parents, Students) |
| **SEC-POL-05** | Password Expiry Cycle | `Every 90 Days Rotation` | Low | Finance Officers & Database Operators |
| **SEC-POL-06** | Financial IP Whitelist | `Active (182.185.140.0/24)` | High | Restricted to Cashier POS Desks Only |

---

## 📜 Screen 1.8: System Audit Logs & Activity Trail

### 📌 1. Screen Identity & Overview
* **Screen Name:** Immutable System Audit Trail & Forensic Transaction Log
* **Navigation Route:** `/SystemAudits`
* **Source File Location:** `src/features/settings/SystemAudits.tsx`
* **Authorized Access:** Super Administrator, Internal / External Auditor

### 🎯 2. Operational Value & Business Purpose
* **Fraud Prevention:** Keeps an immutable, time-stamped record of all sensitive actions (fee discounts, mark changes, record deletions).
* **Forensic Accountability:** Shows exactly who performed an action, when it happened, from which IP address, and compares previous vs updated values.
* **Legal & Board Compliance:** Provides printable certified audit logs for school board reviews.

### 📝 3. Information Captured in Each Audit Log
* **Operator Name & Role:** Staff member who performed the operation.
* **Action Type:** `INSERT`, `UPDATE`, `DELETE`, `PERMISSION_OVERRIDE`.
* **Affected Module & Entity:** (e.g., *Finance / Fee Concession*, *Exams / Midterm Marks*).
* **Target Record Reference:** Human-readable ID of the modified item.
* **Before / After Diff:** Red (old value) versus Green (new value) comparison.
* **Timestamp & IP Address:** Exact date, time, and workstation IP.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Search & Filter:** Filter logs by Date Range, Operator Name, or Module (*Finance*, *Exams*, *Admissions*).
2. **Inspect Diff:** Click any row to open the diff inspector showing the exact before/after data modification.
3. **Export Audit Trail:** Click **"Export Audit Log (PDF)"** to download a digitally signed forensic report.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Audit Log ID | Operator Name | Action Performed | Module Affected | Target Record Reference | Timestamp | IP Address |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AUD-2026-801** | Kamran Akmal (Accountant) | `Fee Concession Approved` | Finance | `CONC-2026-0042 (Ali Khan)` | 2026-08-28 10:15 AM | 192.168.1.45 |
| **AUD-2026-802** | Fatima Zahra (Teacher) | `Marks Updated (Math Midterm)`| Exams | `MRK-GR10A-MATH (Roll # 104)` | 2026-08-28 11:30 AM | 192.168.1.88 |
| **AUD-2026-803** | Bilal Abdullah (Super Admin) | `Role Permissions Modified` | Settings | `ROLE-ACCOUNTANT` | 2026-08-28 02:45 PM | 182.185.140.12 |
| **AUD-2026-804** | Sana Mir (Admissions) | `New Student Registered` | Admissions | `STD-2026-0105 (Hamza Tariq)` | 2026-08-28 03:20 PM | 192.168.1.30 |
| **AUD-2026-805** | Subhan Ali (Transport) | `Bus Route Stop Added` | Transport | `ROUTE-03-F8 (Stop # 4)` | 2026-08-28 04:10 PM | 192.168.1.62 |
| **AUD-2026-806** | Dr. Shahida Parveen (Head) | `Staff Leave Approved` | HR / Payroll | `LEV-2026-0019 (Amina Begum)` | 2026-08-28 04:45 PM | 192.168.2.10 |

---

## 📥 Screen 1.9: Data Migration Tool (Excel/CSV Bulk Import)

### 📌 1. Screen Identity & Overview
* **Screen Name:** Bulk Data Onboarding & Excel Migration Engine
* **Navigation Route:** `/DataMigration`
* **Source File Location:** `src/features/settings/DataMigrationManager.tsx`
* **Authorized Access:** Super Administrator, IT Data Specialist

### 🎯 2. Operational Value & Business Purpose
* **Rapid School Onboarding:** Imports thousands of students, teachers, past fee arrears, and library books in minutes from existing Excel spreadsheets.
* **Pre-Import Data Validation:** Automatically checks for duplicate roll numbers, invalid CNICs, or missing emails before committing to the database.
* **Zero Data Loss:** Generates error reports for any failed rows without rejecting the valid records.

### 📝 3. Supported Entity Import Types
* **Student Master List:** Roll number, name, class, section, guardian CNIC, contact phone.
* **Staff Profiles:** Staff code, name, designation, CNIC, basic salary, join date.
* **Opening Fee Arrears:** Student roll number, outstanding fee head, due amount, due date.
* **Library Catalog:** ISBN, book title, author, category, total copies, rack location.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Download Template:** Choose entity (*Students*, *Staff*, *Fee Arrears*) and download the sample CSV template.
2. **Upload Populated Spreadsheet:** Drag and drop your completed file into the upload zone.
3. **Run Pre-Import Validation:** The system parses rows and highlights duplicates or syntax errors in red.
4. **In-Line Correction:** Correct any highlighted invalid values directly in the preview table.
5. **Execute Batch Import:** Click **"Commit Batch Import"** to safely insert clean records into the database.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Batch Reference | Import Entity Type | Source File Name | Total Rows | Clean Rows Imported | Rejected Rows | Migration Date |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **MIG-2026-01** | Student Master Directory | `Grade_01_to_10_Students.csv` | 1,250 | 1,245 | 5 (Duplicate CNIC) | 2026-08-20 |
| **MIG-2026-02** | Staff & Faculty Profiles | `Teaching_Staff_2026.xlsx` | 95 | 95 | 0 | 2026-08-21 |
| **MIG-2026-03** | Library Book Master Catalog | `Library_Book_Inventory.csv` | 4,500 | 4,480 | 20 (Missing ISBN) | 2026-08-22 |
| **MIG-2026-04** | Opening Student Fee Arrears | `Fee_Arrears_July2026.xlsx` | 320 | 320 | 0 | 2026-08-23 |
| **MIG-2026-05** | Parent Contact Registry | `Parent_Directory_Export.csv` | 1,100 | 1,092 | 8 (Invalid Phone) | 2026-08-24 |

---

## 💾 Screen 1.10: Database Backup & Recovery Manager

### 📌 1. Screen Identity & Overview
* **Screen Name:** Database Snapshots, Automated Cloud Backups & Recovery
* **Navigation Route:** `/DatabaseBackup`
* **Source File Location:** `src/features/settings/DatabaseBackupManager.tsx`
* **Authorized Access:** Super Administrator, Database Administrator

### 🎯 2. Operational Value & Business Purpose
* **Disaster Recovery:** Safeguards school data against server crashes, hardware failures, and accidental deletions.
* **Automated Cloud Sync:** Automatically uploads nightly encrypted backups to cloud storage (AWS S3 / Azure Blob).
* **Point-in-Time Restoration:** Allows administrators to revert the school database to an exact historical snapshot with OTP verification.

### 📝 3. Backup Tiers & Storage Policies
* **Nightly Auto Snapshot:** Executed daily at 02:00 AM (Retained for 30 days).
* **Weekly Full Archive:** Executed every Sunday at 03:00 AM (Retained for 1 full year).
* **Pre-Operation Manual Backup:** Created on demand before mass promotions or fee generation.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Inspect Backup Health:** Confirm green verified checkmark on the most recent backup file.
2. **Create Immediate Snapshot:** Click **"Create Backup Snapshot Now"** button for an instant manual backup.
3. **Download Backup File:** Click **Download** icon to store a local copy on an external encrypted drive.
4. **Restore Database:** Click **"Restore Snapshot"** (requires Super Admin OTP confirmation) to revert database state.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Backup Code | Snapshot Description | File Size | Backup Type | Storage Location | Created Date & Time | Verification Status |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **BAK-2026-0828** | Daily Automated Nightly Backup | 450 MB | Scheduled | Secure Cloud Storage (AWS S3) | 2026-08-28 02:00 AM | `Verified Safe` |
| **BAK-2026-0827** | Daily Automated Nightly Backup | 448 MB | Scheduled | Secure Cloud Storage (AWS S3) | 2026-08-27 02:00 AM | `Verified Safe` |
| **BAK-2026-0826** | Pre-Fee Generation Snapshot | 446 MB | Manual | Local + Cloud Backup Vault | 2026-08-26 11:30 PM | `Verified Safe` |
| **BAK-2026-0820** | Pre-Student Migration Snapshot | 420 MB | Manual | Local On-Premise Storage | 2026-08-20 09:00 AM | `Archived` |
| **BAK-2026-0801** | Monthly Full Session Backup | 410 MB | Scheduled | Long-Term Glacier Archive | 2026-08-01 03:00 AM | `Verified Safe` |

---

## 📊 Screen 1.11: Executive Multi-Campus Master Dashboard

### 📌 1. Screen Identity & Overview
* **Screen Name:** Executive Group Consolidation & Multi-Campus Analytics
* **Navigation Route:** `/ExecutiveMasterDashboard`
* **Source File Location:** `src/features/settings/ExecutiveMasterDashboard.tsx`
* **Authorized Access:** School Board of Directors, Trustees, Super Administrator

### 🎯 2. Operational Value & Business Purpose
* **Executive Summary:** Provides school owners and directors with real-time consolidated KPIs across all branches.
* **Cross-Campus Comparisons:** Highlights top-performing branches in terms of fee recovery percentages and student attendance rates.
* **One-Click Branch Switching:** Allows directors to jump directly into any branch's console with a single click.

### 📝 3. Key Telemetry Metrics
* **Total Group Enrollment:** Active students across all 7 campuses combined (`8,920 Students`).
* **Total Group Faculty:** Teaching and administrative staff headcount (`460 Employees`).
* **Fee Collection Efficiency:** Real-time percentage of paid vs outstanding fee vouchers (`95.4%`).
* **Today's Student Attendance:** Consolidated morning biometric attendance rate (`94.6%`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Branch Scope:** Choose *All Campuses (Consolidated)* or select an individual campus from the dropdown.
2. **Review Financial Performance:** Inspect branch-wise revenue vs operational expense comparison bars.
3. **Analyze Recovery Leaderboards:** Identify campuses with high fee defaults for targeted recovery action.
4. **Drill Down to Campus:** Click **"Open Campus Console"** on any campus card to inspect branch details.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Campus Branch | Total Students | Total Faculty | Today Attendance % | Monthly Fee Target | Collected Amount | Collection % | Performance Rank |
| :--- | :---: | :---: | :---: | :--- | :--- | :---: | :---: |
| **Girls Senior Campus (F-7)** | 1,150 | 72 Staff | 96.1% | Rs. 5,750,000 | Rs. 5,600,000 | `97.4%` | **# 1 (Top Performing)** |
| **Main Boys Campus (H-8)** | 1,420 | 85 Staff | 94.2% | Rs. 7,100,000 | Rs. 6,850,000 | `96.5%` | **# 2** |
| **Model Town Campus (Lahore)** | 1,850 | 110 Staff | 95.0% | Rs. 9,250,000 | Rs. 8,900,000 | `96.2%` | **# 3** |
| **City Campus (Westridge)** | 920 | 58 Staff | 93.8% | Rs. 4,600,000 | Rs. 4,320,000 | `93.9%` | **# 4** |
| **Junior Montessori (Saddar)** | 780 | 45 Staff | 91.5% | Rs. 3,900,000 | Rs. 3,650,000 | `93.6%` | **# 5** |
| **Gulshan Campus (Karachi)** | 1,600 | 98 Staff | 92.4% | Rs. 8,000,000 | Rs. 7,450,000 | `93.1%` | **# 6** |
| **University Town (Peshawar)** | 900 | 50 Staff | 90.2% | Rs. 4,100,000 | Rs. 3,650,000 | `89.0%` | **# 7 (Needs Review)** |

---

## 🎯 Phase 1 Milestone Summary

Phase 1 completes the entire administrative foundation of the School Management System:
* **Multi-branch tenant isolation** is established.
* **Roles, permissions, and user accounts** are securely configured.
* **Biometric hardware, academic calendar, audit logs, and cloud backups** are fully operational.

👉 **Next Step:** Proceed to **Phase 2: Academic Core Architecture** (`Phase_02_Academic_Core_Architecture.md`) covering Academic Sessions, Classes, Sections, Subjects, and Class-Subject Mapping.
