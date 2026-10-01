# 🏫 VOKE Solutions SMS — Phase 3: Human Resources & Staff Management

> **System:** VOKE Solutions School Management System (SMS)  
> **Phase Target:** Phase 3 — Staff Directory, Biometric Attendance Sync, Leave Applications, Approvals, Loans, Appraisals & Final Clearance  
> **Documentation Style:** Point-to-Point Step-by-Step Guide with Clean Data Tables  
> **Language:** English  
> **Data Integrity:** 100% Relational Human-Readable Dataset — **Zero Raw GUIDs (Fully Linked to Phase 1 & Phase 2)**

---

## 📑 Phase 3 Navigation Overview

* [Screen 3.1: Staff Directory & Employee Profiles (`/StaffDirectory`)](#-screen-31-staff-directory--employee-profiles)
* [Screen 3.2: Staff Attendance & Biometric Synchronization (`/StaffAttendance`)](#-screen-32-staff-attendance--biometric-synchronization)
* [Screen 3.3: Staff Leave Application Portal (`/StaffLeaveApplication`)](#-screen-33-staff-leave-application-portal)
* [Screen 3.4: Staff Leave Approvals & Balances (`/LeaveApprovals`)](#-screen-34-staff-leave-approvals--balances)
* [Screen 3.5: Staff Loans, Advances & Deductions (`/StaffLoans`)](#-screen-35-staff-loans-advances--deductions)
* [Screen 3.6: Staff Performance Appraisals & KPIs (`/StaffAppraisals`)](#-screen-36-staff-performance-appraisals--kpis)
* [Screen 3.7: Staff Resignation & Clearance Manager (`/StaffClearance`)](#-screen-37-staff-resignation--clearance-manager)
* [Screen 3.8: Staff Self-Service Dashboard (`/staff-dashboard`)](#-screen-38-staff-self-service-dashboard)

---

## 👨‍🏫 Screen 3.1: Staff Directory & Employee Profiles

### 📌 1. Screen Identity & Overview
* **Screen Name:** Staff Master Directory & Employment Dossier
* **Navigation Route:** `/StaffDirectory`
* **Source File Location:** `src/features/hrPayroll/StaffDirectory.tsx`
* **Authorized Access:** Super Administrator, Campus Principal, HR Manager

### 🎯 2. Operational Value & Business Purpose
* **Centralized Personnel Registry:** Complete digital record of all teaching faculty, administrative officers, and support staff.
* **Payroll & Compliance Anchor:** Stores basic salary amounts, bank account details, national identity (CNIC), joining dates, and employment contracts.
* **Document Vault:** Securely stores uploaded scanned copies of CNIC, university degrees, experience certificates, and signed appointment letters.

### 📝 3. Form Fields & Input Information
* **Staff Code:** Unique employee identifier (e.g., `STF-1005`).
* **First & Last Name:** Full legal name of the employee.
* **Staff Category:** Selection (*Teaching Faculty*, *Non-Teaching Staff*, *Executive Management*).
* **Official Designation:** Job title (e.g., *Senior Mathematics Teacher*, *Head of Department*).
* **CNIC / National ID:** 13-digit national identity number (e.g., `37405-2233445-2`).
* **Basic Monthly Salary:** Fixed base pay in PKR (e.g., `Rs. 75,000`).
* **Date of Joining:** Official date employment commenced.
* **Qualification & Degree:** Highest educational attainment (e.g., *M.Sc. Mathematics, B.Ed.*).
* **Document Uploads:** Upload scanned CNIC, Degree, and Employment Contract using `<ImageUpload>`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Staff Metrics:** Inspect top `<StaffStats>` cards showing Total Staff, Teaching Faculty, Non-Teaching, and Monthly Salary Liability.
2. **Search & Filter:** Search by teacher name, staff code, or filter by department (*Teaching* vs *Management*).
3. **Register New Employee:**
   * Click **"+ Add New Staff"** button.
   * Slide-over `<StaffDrawer>` opens from the right.
   * Enter personal details, contact info, CNIC, designation, basic salary, and joining date.
   * Upload photograph and scanned certificates.
   * Click **"Save Staff Profile"**.
4. **Manage Staff Records (`...`):**
   * **View Dossier:** Inspect full printable employee profile.
   * **Edit Profile:** Update salary increments, contact phone, or qualification.
   * **Deactivate / Terminate:** Suspend former employees (routes to Clearance Screen 3.7).
5. **Export Registry:** Click **Export PDF** or **Export Excel** for institutional payroll audits.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Staff Code | Full Name | Staff Category | Designation | CNIC Number | Basic Salary | Joining Date | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **STF-1001** | Prof. Tariq Mehmood | Executive Management | Campus Principal | 37405-1122334-1 | Rs. 150,000 | 2020-01-15 | `Active` |
| **STF-1004** | Dr. Shahida Parveen | Executive Management | Girls Wing Principal | 37405-4455667-2 | Rs. 140,000 | 2021-03-01 | `Active` |
| **STF-1003** | Kamran Akmal | Non-Teaching (Finance) | Senior Finance Officer | 37405-9988776-1 | Rs. 85,000 | 2020-06-01 | `Active` |
| **STF-1005** | Fatima Zahra | Teaching Faculty | Senior Science/Math Teacher | 37405-2233445-2 | Rs. 75,000 | 2022-08-10 | `Active` |
| **STF-1010** | Hina Qasim | Teaching Faculty | Senior Physics Lecturer | 37405-6655443-2 | Rs. 70,000 | 2023-01-05 | `Active` |
| **STF-1006** | Muhammad Rashid | Non-Teaching (Library) | Chief Librarian | 37405-6677889-1 | Rs. 60,000 | 2022-09-01 | `Active` |
| **STF-1009** | Asad Ullah Khan | Teaching Faculty | Senior Chemistry / Warden | 37405-7788990-1 | Rs. 65,000 | 2022-02-01 | `Active` |
| **STF-1007** | Subhan Ali | Non-Teaching (Transport) | Transport Fleet In-Charge | 37405-8899001-1 | Rs. 55,000 | 2021-11-15 | `Active` |
| **STF-1008** | Sana Mir | Non-Teaching (Admin) | Senior Admissions Officer | 37405-1122998-2 | Rs. 50,000 | 2023-05-10 | `Active` |
| **STF-1011** | Zainab Bibi | Teaching Faculty | Junior Montessori Teacher | 37405-3322110-2 | Rs. 45,000 | 2024-08-01 | `Active` |

---

## ⏱️ Screen 3.2: Staff Attendance & Biometric Synchronization

### 📌 1. Screen Identity & Overview
* **Screen Name:** Staff Daily Attendance Register & Payroll Deduction Engine
* **Navigation Route:** `/StaffAttendance`
* **Source File Location:** `src/features/hrPayroll/StaffAttendance.tsx`
* **Authorized Access:** Campus Principal, HR Officer, Accountant

### 🎯 2. Operational Value & Business Purpose
* **Automated Time-Tracking:** Integrates directly with biometric machines (from Screen 1.5) to record daily Check-In, Check-Out, and Late Arrival timestamps.
* **Smart Late Penalty Rules:** Automatically computes salary penalties (e.g., 3 consecutive late arrivals = 1 half-day deduction).
* **Direct Payroll Feed:** Aggregates monthly totals (Presents, Absents, Leaves Without Pay, Deductible Days) feeding directly into the Monthly Salary Slips generator (Phase 6).

### 📝 3. View Modes & Attendance Statuses
* **Weekly Attendance Matrix:** Interactive matrix showing Mon-Sat status badges per teacher with exact punch times (e.g., `07:48 AM - 02:15 PM`).
* **Attendance Status Badges:** `Present` (Green), `Late` (Amber), `Half-Day` (Orange), `Approved Leave` (Blue), `Absent / LWP` (Red).
* **Monthly Payroll Impact Summary:** Calculates Total Present Days, Late Penalties, Unpaid Absents, and Net Deductible Amount.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Week & Session:** Pick the week starting date using `<DatePicker>`.
2. **Review Biometric Logs:** The grid automatically populates punches synchronized from hardware terminals.
3. **Manual Override (Principal Only):**
   * Click on any teacher's day cell to manually adjust a missed punch (e.g., official school duty outside campus).
   * Enter justification remark and save.
4. **Switch to Payroll Summary Tab:**
   * View the monthly attendance calculation table showing net deductible days per employee.
5. **Export Timesheet:** Click **"Download Attendance Sheet (PDF)"** for monthly HR signoff.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Staff Code | Staff Member Name | Designation | Monthly Presents | Late Arrivals | Approved Leaves | Unpaid Absents | Net Deductible Days | Attendance % |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **STF-1001** | Prof. Tariq Mehmood | Campus Principal | 24 Days | 0 | 0 | 0 | 0.0 Days | `100.0%` |
| **STF-1005** | Fatima Zahra | Senior Math Teacher | 23 Days | 1 | 1 Day | 0 | 0.0 Days | `96.0%` |
| **STF-1010** | Hina Qasim | Senior Physics Teacher | 22 Days | 3 (1 Penalty) | 0 | 1 Day | 1.5 Days | `92.0%` |
| **STF-1003** | Kamran Akmal | Senior Finance Officer | 24 Days | 0 | 0 | 0 | 0.0 Days | `100.0%` |
| **STF-1006** | Muhammad Rashid | Chief Librarian | 23 Days | 2 | 1 Day | 0 | 0.0 Days | `96.0%` |
| **STF-1009** | Asad Ullah Khan | Senior Chemistry / Warden | 21 Days | 1 | 2 Days | 1 Day | 1.0 Days | `88.0%` |
| **STF-1007** | Subhan Ali | Transport In-Charge | 24 Days | 0 | 0 | 0 | 0.0 Days | `100.0%` |
| **STF-1011** | Zainab Bibi | Junior Teacher | 20 Days | 4 (1 Penalty) | 2 Days | 2 Days | 2.5 Days | `84.0%` |

---

## 📝 Screen 3.3: Staff Leave Application Portal

### 📌 1. Screen Identity & Overview
* **Screen Name:** Staff Online Leave Application Desk
* **Navigation Route:** `/StaffLeaveApplication`
* **Source File Location:** `src/features/hrPayroll/StaffLeaveApplication.tsx`
* **Authorized Access:** All Registered Staff Members, Teachers, Administrators

### 🎯 2. Operational Value & Business Purpose
* **Paperless Leave Requests:** Teachers apply for leaves directly from their dashboard without physical paper chits.
* **Quota Transparency:** Displays real-time remaining quotas for Casual Leaves, Medical Leaves, and Annual Vacation allowances.
* **Substitute Alert:** When a teacher submits a leave, it flags Screen 4.3 (Substitute Management) to arrange classroom covers.

### 📝 3. Form Fields & Input Information
* **Leave Category:** Dropdown (*Casual Leave*, *Medical / Sick Leave*, *Maternity Leave*, *Hajj / Pilgrimage Leave*, *Leave Without Pay*).
* **Start Date & End Date:** Date duration requested.
* **Total Days:** Auto-calculated excluding gazetted holidays.
* **Reason / Justification:** Detailed explanation for absence.
* **Medical Certificate Upload:** Scanned doctor's note for medical leaves > 2 days.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Check Available Balances:** View remaining Casual Leaves (e.g., `8 Remaining`), Medical Leaves (`6 Remaining`).
2. **Fill Leave Request:**
   * Select the **Leave Category**.
   * Pick **Start Date** and **End Date** using `<DatePicker>`.
   * Type reason in the text box.
   * Attach medical prescription if applicable.
   * Click **"Submit Application"**.
3. **Track Application Status:** Watch real-time status tracker (*Pending Approval*, *Approved*, *Rejected*).

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Application # | Staff Member Name | Leave Category | Start Date | End Date | Duration | Reason Stated | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **LEV-2026-001** | Fatima Zahra (`STF-1005`) | Casual Leave | 2026-08-25 | 2026-08-25 | 1 Day | Family emergency / personal errand | `Approved` |
| **LEV-2026-002** | Hina Qasim (`STF-1010`) | Medical / Sick Leave | 2026-08-28 | 2026-08-29 | 2 Days | Severe viral flu & medical rest | `Approved` |
| **LEV-2026-003** | Asad Ullah Khan (`STF-1009`)| Casual Leave | 2026-09-02 | 2026-09-03 | 2 Days | Sister's wedding ceremony | `Pending` |
| **LEV-2026-004** | Zainab Bibi (`STF-1011`) | Medical Leave | 2026-09-05 | 2026-09-05 | 1 Day | Dental surgery appointment | `Pending` |
| **LEV-2026-005** | Muhammad Rashid (`STF-1006`)| Casual Leave | 2026-08-18 | 2026-08-18 | 1 Day | Official university degree collection | `Approved` |

---

## ⚖️ Screen 3.4: Staff Leave Approvals & Balances

### 📌 1. Screen Identity & Overview
* **Screen Name:** Staff Leave Approval Console & Entitlement Tracker
* **Navigation Route:** `/LeaveApprovals`
* **Source File Location:** `src/features/hrPayroll/LeaveApprovals.tsx`
* **Authorized Access:** Campus Principal, Vice Principal, HR Director

### 🎯 2. Operational Value & Business Purpose
* **Workflow Authorization:** Single-click approval or rejection of pending staff leave requests with administrative remarks.
* **Live Teacher Cover Check:** Shows how many teachers are already on leave on the requested date to prevent severe faculty shortages.
* **Auto-Sync to Attendance:** Approved leaves are automatically marked as `Approved Leave` in daily attendance registers, exempting the teacher from salary deductions.

### 📝 3. Screen Metrics & Controls
* **Top StatCards:** Total Pending Requests, Approved Today, Rejected This Month, Staff on Leave Today.
* **Action Drawer:** Review applicant's past leave history, available quota balance, and uploaded medical proofs before deciding.
* **Approval Decision:** `Approve with Pay`, `Approve Without Pay (LWP)`, or `Reject`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Pending Queue:** Filter applications by date or department.
2. **Open Decision Drawer:** Click **"Review Application"** on any pending row.
3. **Verify Quota Balances:** Check if applicant has sufficient casual/sick leave balance left.
4. **Take Action:**
   * Enter administrative feedback/notes.
   * Click **"Approve Application"** (dispatches SMS/Notification to teacher).
   * Or click **"Reject Application"** with mandatory justification reason.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Application # | Staff Member Name | Designation | Leave Type | Dates Requested | Paid Quota Available | Approver Decision | Approver Name |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **LEV-2026-001** | Fatima Zahra (`STF-1005`) | Senior Math Teacher | Casual Leave | Aug 25, 2026 (1 Day) | 8 Days | `Approved (Paid)` | Prof. Tariq Mehmood |
| **LEV-2026-002** | Hina Qasim (`STF-1010`) | Senior Physics Teacher | Medical Leave | Aug 28 - Aug 29 (2 Days)| 6 Days | `Approved (Paid)` | Prof. Tariq Mehmood |
| **LEV-2026-003** | Asad Ullah Khan (`STF-1009`)| Senior Chemistry Teacher| Casual Leave | Sep 02 - Sep 03 (2 Days)| 7 Days | `Pending Review` | Awaiting Principal |
| **LEV-2026-004** | Zainab Bibi (`STF-1011`) | Junior Montessori | Medical Leave | Sep 05, 2026 (1 Day) | 9 Days | `Pending Review` | Awaiting Principal |
| **LEV-2026-000** | Kamran Akmal (`STF-1003`) | Finance Officer | Casual Leave | Aug 10, 2026 (1 Day) | 10 Days | `Approved (Paid)` | Prof. Tariq Mehmood |

---

## 💰 Screen 3.5: Staff Loans, Advances & Deductions

### 📌 1. Screen Identity & Overview
* **Screen Name:** Staff Loan Sanctioning & Monthly Installment Ledger
* **Navigation Route:** `/StaffLoans`
* **Source File Location:** `src/features/hrPayroll/StaffLoansManager.tsx`
* **Authorized Access:** Super Administrator, Finance Director, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Staff Welfare & Emergency Advances:** Manages interest-free employee welfare loans and advance salary disbursements.
* **Automated Monthly Payroll Recovery:** Automatically deducts agreed monthly installments (e.g., Rs. 5,000/month) from the employee's monthly pay slip until balance reaches zero.
* **Clearance Protection:** Prevents resigning employees from receiving clearance certificates if loan balances remain unpaid.

### 📝 3. Form Fields & Input Information
* **Staff Member:** Select employee from `<SearchableSelect>`.
* **Sanctioned Loan Amount:** Total loan disbursed in PKR (e.g., `Rs. 50,000`).
* **Monthly Installment:** Amount to recover per month (e.g., `Rs. 5,000`).
* **Total Installment Months:** Auto-calculated tenure (e.g., `10 Months`).
* **Reason / Purpose:** Official justification (e.g., *Medical emergency*, *Home renovation*).
* **Disbursement Date:** Date loan was issued.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Check Loan Portfolio:** View Total Outstanding Loans, Active Borrowers, and Total Recovered This Month.
2. **Issue New Loan:**
   * Click **"+ Sanction New Loan"** button.
   * Select the employee and input the loan amount and monthly deduction installment.
   * Enter justification and click **"Approve & Disburse Loan"**.
3. **Track Repayment Ledger:**
   * Click **"View Ledger"** on any loan row to see month-by-month deduction history and remaining balance.
4. **Print Loan Voucher:** Click **Print Voucher** for signed employee acknowledgment.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Loan Code | Employee Name | Designation | Loan Sanctioned | Monthly Installment | Total Recovered | Remaining Balance | Loan Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **LON-2026-01** | Fatima Zahra (`STF-1005`) | Senior Math Teacher | Rs. 60,000 | Rs. 6,000 / Mo | Rs. 24,000 | Rs. 36,000 | `Active (Repaying)` |
| **LON-2026-02** | Muhammad Rashid (`STF-1006`)| Chief Librarian | Rs. 40,000 | Rs. 5,000 / Mo | Rs. 30,000 | Rs. 10,000 | `Active (Repaying)` |
| **LON-2026-03** | Subhan Ali (`STF-1007`) | Transport In-Charge | Rs. 50,000 | Rs. 5,000 / Mo | Rs. 50,000 | Rs. 0 | `Fully Repaid` |
| **LON-2026-04** | Hina Qasim (`STF-1010`) | Senior Physics Teacher | Rs. 30,000 | Rs. 5,000 / Mo | Rs. 10,000 | Rs. 20,000 | `Active (Repaying)` |
| **LON-2026-05** | Zainab Bibi (`STF-1011`) | Junior Teacher | Rs. 25,000 | Rs. 2,500 / Mo | Rs. 5,000 | Rs. 20,000 | `Active (Repaying)` |

---

## 🏆 Screen 3.6: Staff Performance Appraisals & KPIs

### 📌 1. Screen Identity & Overview
* **Screen Name:** Staff Annual Appraisals, KPI Ratings & Salary Increments
* **Navigation Route:** `/StaffAppraisals`
* **Source File Location:** `src/features/hrPayroll/StaffAppraisalsManager.tsx`
* **Authorized Access:** Campus Principal, Board of Directors, Academic Supervisor

### 🎯 2. Operational Value & Business Purpose
* **Merit-Based Evaluation:** Rates faculty performance across key metrics: Student Exam Pass Rate, Classroom Discipline, Punctuality, and Syllabus Completion.
* **Automated Salary Increments:** Recommends annual percentage salary increments (e.g., 10%) and automatically updates the employee's basic salary in the master database.
* **Teacher of the Month Awards:** Recognizes top-performing teachers with honors published on portal dashboards.

### 📝 3. Form Fields & Input Information
* **Staff Member:** Target employee being appraised.
* **Evaluation Year:** Academic session (e.g., `2026`).
* **Performance Score:** 1 to 5 Star Rating (e.g., `4.8 / 5.0 - Outstanding`).
* **Teacher of the Month:** Badge flag with month designation.
* **Recommended Increment %:** Percentage salary increase (e.g., `10.0%`).
* **New Basic Salary:** Auto-calculated revised base salary.
* **Principal's Confidential Appraisal Remarks:** Written evaluative summary.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Department Ratings:** View average institutional rating, total increments awarded, and honor rolls.
2. **Conduct New Appraisal:**
   * Click **"+ New Staff Appraisal"**.
   * Select faculty member from dropdown.
   * Rate parameters (Punctuality, Student Results, Pedagogical Quality).
   * Enter recommended increment percentage (e.g., `8.5%`).
   * Check **"Apply Increment to Payroll Immediately"** to update basic salary.
   * Click **"Save & Finalize Appraisal"**.
3. **Print Merit Certificate:** Click **"Print Appraisal Certificate"** for annual faculty awards.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Appraisal # | Faculty Member Name | Designation | Performance Rating | Teacher of Month? | Old Basic Salary | Increment % | New Basic Salary |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **APR-2026-01** | Fatima Zahra (`STF-1005`) | Senior Math Teacher | ⭐ 4.9 / 5.0 | `Yes (Aug 2026)` | Rs. 70,000 | +7.1% | **Rs. 75,000** |
| **APR-2026-02** | Dr. Shahida Parveen (`STF-1004`)| Girls Wing Principal| ⭐ 5.0 / 5.0 | `No` | Rs. 130,000 | +7.7% | **Rs. 140,000** |
| **APR-2026-03** | Hina Qasim (`STF-1010`) | Senior Physics Teacher | ⭐ 4.7 / 5.0 | `No` | Rs. 65,000 | +7.7% | **Rs. 70,000** |
| **APR-2026-04** | Kamran Akmal (`STF-1003`) | Senior Finance Officer | ⭐ 4.8 / 5.0 | `No` | Rs. 80,000 | +6.25% | **Rs. 85,000** |
| **APR-2026-05** | Muhammad Rashid (`STF-1006`)| Chief Librarian | ⭐ 4.5 / 5.0 | `No` | Rs. 55,000 | +9.1% | **Rs. 60,000** |
| **APR-2026-06** | Subhan Ali (`STF-1007`) | Transport In-Charge | ⭐ 4.6 / 5.0 | `No` | Rs. 50,000 | +10.0% | **Rs. 55,000** |

---

## 🚪 Screen 3.7: Staff Resignation & Clearance Manager

### 📌 1. Screen Identity & Overview
* **Screen Name:** Staff Resignation, End-of-Service Settlement & Clearance
* **Navigation Route:** `/StaffClearance`
* **Source File Location:** `src/features/hrPayroll/StaffClearanceManager.tsx`
* **Authorized Access:** Super Administrator, Campus Principal, HR Director

### 🎯 2. Operational Value & Business Purpose
* **Formal Exit Protocol:** Manages employee resignations, notice period tracking, and institutional asset recovery.
* **Automated Final Settlement:** Auto-calculates final payout: `(Unpaid Salary + Leave Encashment + Gratuity) - (Outstanding Loan Balances + Lost Library Books)`.
* **Multi-Department Signoff:** Ensures Library, IT, Finance, and Academics sign off before generating the official Experience & Relieving Certificate.

### 📝 3. Form Fields & Input Information
* **Resigning Employee:** Select staff member from directory.
* **Resignation Date & Relieving Date:** Official last working day.
* **Notice Period Days:** Number of days served (e.g., `30 Days`).
* **Unpaid Salary Balance:** Pro-rated salary for current month.
* **Leave Encashment Amount:** Pay for unused annual vacation days.
* **Outstanding Loan Deductions:** Auto-pulled balance from Screen 3.5.
* **Net Final Settlement:** Auto-calculated net payable/recoverable balance.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Initiate Clearance Case:** Click **"+ Start New Clearance"** and select departing employee.
2. **Auto-Compute Financials:** Click **"Calculate Settlement"** to pull unpaid salary and loan deductions.
3. **Verify Department Signoffs:** Ensure green checkmarks for *Library Books Returned*, *IT Assets Handed In*, and *Account Books Audited*.
4. **Approve Settlement:** Click **"Approve Final Settlement"** to release final cheque.
5. **Issue Documents:** Click **"Print Experience & Relieving Certificate"** and **"Print Clearance Slip"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Clearance # | Departing Employee | Designation | Relieving Date | Unpaid Salary | Leave Encashment | Loan Deduction | Net Final Payout | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **CLR-2026-01** | Subhan Ali (`STF-1007`) | Ex-Transport In-Charge | 2026-08-31 | Rs. 55,000 | Rs. 12,000 | - Rs. 0 (Paid) | **Rs. 67,000** | `Completed` |
| **CLR-2026-02** | Maryam Nawaz (`STF-0982`) | Junior English Teacher | 2026-07-31 | Rs. 40,000 | Rs. 8,000 | - Rs. 15,000 | **Rs. 33,000** | `Completed` |
| **CLR-2026-03** | Bilal Qureshi (`STF-0975`) | Lab Assistant | 2026-08-15 | Rs. 20,000 | Rs. 0 | - Rs. 5,000 | **Rs. 15,000** | `Completed` |
| **CLR-2026-04** | Naila Siddiqui (`STF-1002`) | Ex-Admissions Officer | 2026-09-15 | Rs. 50,000 | Rs. 10,000 | - Rs. 0 | **Rs. 60,000** | `Pending Signoff`|

---

## 💻 Screen 3.8: Staff Self-Service Dashboard

### 📌 1. Screen Identity & Overview
* **Screen Name:** Staff Personal Dashboard & Faculty Workspace
* **Navigation Route:** `/staff-dashboard`
* **Source File Location:** `src/features/hrPayroll/StaffDashboard.tsx`
* **Authorized Access:** All Teaching Faculty, Staff, and Administrators

### 🎯 2. Operational Value & Business Purpose
* **Personalized Faculty Hub:** Landing screen for logged-in teachers to view today's teaching timetable, pending homework submissions, and personal attendance statistics.
* **Institutional Circulars:** Displays digital noticeboard announcements directly from school management.
* **Quick Action Launchpad:** One-click shortcuts to Mark Attendance, Post Homework Diary, Apply for Leave, and Download Salary Slips.

### 📝 3. Dashboard Widgets & KPI Tiles
* **My Attendance Rate:** Real-time monthly attendance score (e.g., `96%`).
* **Available Leave Balance:** Remaining Casual/Medical leaves (e.g., `14 Days`).
* **Assigned Classes Count:** Number of active sections taught (e.g., `4 Classes`).
* **Today's Teaching Schedule:** List of lecture periods today with room numbers.
* **Recent School Announcements:** Official circulars and upcoming holiday alerts.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Log in as Teacher:** User logs in and is automatically routed to `/staff-dashboard`.
2. **Review Morning Schedule:** Check today's lecture schedule (e.g., *Period 1: Math in Room 201 - Grade 10-A*).
3. **Launch Daily Operations:**
   * Click **"Mark Class Attendance"** to jump to morning student register.
   * Click **"Post Student Diary"** to dispatch today's homework.
   * Click **"Apply Leave"** if planning an upcoming absence.
4. **Download Pay Slip:** Click **"Download My Salary Slip"** to view monthly compensation details.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Logged-In Teacher | Appointed Section | Monthly Attendance % | Remaining Leaves | Today's Assigned Periods | Noticeboard Unread | Next Class |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Fatima Zahra (`STF-1005`)** | Class Teacher: `Grade 10-A` | `96.0%` | 14 Days | 5 Periods Today | 2 New Notices | Period 1: Mathematics (Room 201) |
| **Hina Qasim (`STF-1010`)** | Class Teacher: `Grade 10-B` | `92.0%` | 12 Days | 4 Periods Today | 1 New Notice | Period 2: Physics (Room 202) |
| **Muhammad Rashid (`STF-1006`)** | Class Teacher: `Grade 9-A` | `96.0%` | 15 Days | 3 Periods Today | 0 Notices | Period 3: Urdu (Room 105) |
| **Asad Ullah Khan (`STF-1009`)** | Class Teacher: `Grade 9-B` | `88.0%` | 11 Days | 5 Periods Today | 3 New Notices | Period 1: Chemistry (Room 106) |
| **Zainab Bibi (`STF-1011`)** | Class Teacher: `Grade 1-A` | `84.0%` | 16 Days | 6 Periods Today | 2 New Notices | Period 1: English (Room G-02) |

---

## 🎯 Phase 3 Milestone Completed

Phase 3 establishes the complete human capital infrastructure:
* **All teaching faculty & staff profiles** are registered with basic salaries, CNICs, and credentials.
* **Biometric attendance time-tracking & late penalty algorithms** are active.
* **Staff leave applications, approvals, welfare loans, performance appraisals, and final clearance workflows** are operational.

👉 **Next Phase:** We proceed directly to **Phase 4: Timetable & Substitute Management** (`Phase_04_Timetable_and_Substitute_Management.md`) covering Master Class Timetables, Teacher Workload Matrices, and Daily Substitute Teacher Auto-Assignment!
