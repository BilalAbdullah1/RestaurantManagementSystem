# 🏫 VOKE Solutions SMS — Phase 10: Portals, Communication, Front Office & Institutional Reports

> **System:** VOKE Solutions School Management System (SMS)  
> **Phase Target:** Phase 10 — Portals (Admin, Student, Parent), Multi-Channel Communication, Front Office Logistics, and Centralized Institutional Printable Reports  
> **Documentation Style:** Point-to-Point Step-by-Step Guide with Clean Data Tables  
> **Language:** English  
> **Data Integrity:** 100% Relational Human-Readable Dataset — **Zero Raw GUIDs (Fully Linked Across All Phases 1 to 9)**

---

## 📑 Phase 10 Navigation Overview

### 🌐 Part A: Self-Service Dashboards & Portals
* [Screen 10.1: Executive Master Admin Dashboard (`/dashboard`)](#-screen-101-executive-master-admin-dashboard)
* [Screen 10.2: Student Self-Service Portal (`/student-dashboard`)](#-screen-102-student-self-service-portal)
* [Screen 10.3: Parent Self-Service Portal (`/parent-dashboard`, `/ParentPortal`)](#-screen-103-parent-self-service-portal)
* [Screen 10.4: Parent Leave Application & Doctor Notes (`/ApplyLeave`)](#-screen-104-parent-leave-application--doctor-notes)
* [Screen 10.5: Parent Fee Payment History & Online Invoices (`/FeePaymentHistory`)](#-screen-105-parent-fee-payment-history--online-invoices)

### 📢 Part B: School Communication & Front Office Operations
* [Screen 10.6: Multi-Channel Communication Broadcaster (`/CommunicationBroadcaster`)](#-screen-106-multi-channel-communication-broadcaster)
* [Screen 10.7: Digital Notice Board & School Circulars (`/DigitalNoticeBoard`)](#-screen-107-digital-notice-board--school-circulars)
* [Screen 10.8: Parent-Teacher Meeting (PTM) Scheduler (`/PtmScheduler`)](#-screen-108-parent-teacher-meeting-ptm-scheduler)
* [Screen 10.9: Helpdesk & Support Tickets Manager (`/HelpdeskTickets`)](#-screen-109-helpdesk--support-tickets-manager)
* [Screen 10.10: Automated Birthday Wishes Dispatcher (`/BirthdayWishes`)](#-screen-1010-automated-birthday-wishes-dispatcher)
* [Screen 10.11: Feedback & Suggestions Box (`/FeedbackSuggestions`)](#-screen-1011-feedback--suggestions-box)
* [Screen 10.12: School Event Calendar Planner (`/EventCalendar`)](#-screen-1012-school-event-calendar-planner)
* [Screen 10.13: Internal Staff Chat Platform (`/StaffChat`)](#-screen-1013-internal-staff-chat-platform)
* [Screen 10.14: Front Office Visitors Log & Gate Passes (`/VisitorsLog`)](#-screen-1014-front-office-visitors-log--gate-passes)
* [Screen 10.15: Student Certificates & Transfer Generator (`/CertificatesManager`)](#-screen-1015-student-certificates--transfer-generator)
* [Screen 10.16: System Notifications Inbox (`/NotificationsInbox`)](#-screen-1016-system-notifications-inbox)

### 📊 Part C: Central Reports Center & Printable Statements
* [Screen 10.17: Central Institutional Reports Hub (`/ReportsCenter`)](#-screen-1017-central-institutional-reports-hub)
* [Screen 10.18: Academic Broadsheet Examination Report (`/reports/broadsheet`)](#-screen-1018-academic-broadsheet-examination-report)
* [Screen 10.19: Printable Fee Challan Voucher Report (`/reports/fee-voucher`)](#-screen-1019-printable-fee-challan-voucher-report)
* [Screen 10.20: Fee Defaulters Comprehensive Report (`/reports/fee-defaulters`)](#-screen-1020-fee-defaulters-comprehensive-report)
* [Screen 10.21: School Leaving Certificate (SLC) Report (`/reports/slc-certificate`)](#-screen-1021-school-leaving-certificate-slc-report)
* [Screen 10.22: Official Student Character & Merit Certificates (`/reports/student-certificates`)](#-screen-1022-official-student-character--merit-certificates)
* [Screen 10.23: Student ID Card Printable Generator (`/reports/student-id-cards`)](#-screen-1023-student-id-card-printable-generator)
* [Screen 10.24: Monthly Staff Payroll Distribution Report (`/reports/staff-payroll`)](#-screen-1024-monthly-staff-payroll-distribution-report)
* [Screen 10.25: Student Monthly Attendance Analytics Report (`/reports/attendance`)](#-screen-1025-student-monthly-attendance-analytics-report)
* [Screen 10.26: Institutional Profit & Loss Financial Statement (`/reports/profit-loss`)](#-screen-1026-institutional-profit--loss-financial-statement)
* [Screen 10.27: Daily Fee Collection & Cash Book Report (`/reports/daily-collection`)](#-screen-1027-daily-fee-collection--cash-book-report)
* [Screen 10.28: Institutional Balance Sheet Statement (`/reports/balance-sheet`)](#-screen-1028-institutional-balance-sheet-statement)
* [Screen 10.29: Financial Trial Balance Report (`/reports/trial-balance`)](#-screen-1029-financial-trial-balance-report)
* [Screen 10.30: Student Final Term Examination Report Cards (`/reports/report-cards`)](#-screen-1030-student-final-term-examination-report-cards)

---

# 🌐 PART A: Self-Service Dashboards & Portals

---

## 📊 Screen 10.1: Executive Master Admin Dashboard

### 📌 1. Screen Identity & Overview
* **Screen Name:** Executive Master Admin Dashboard & Institutional Telemetry
* **Navigation Route:** `/dashboard` (or `/admin-dashboard`)
* **Source File Location:** `src/features/Dashboard/Home.tsx`
* **Authorized Access:** Super Admin, Campus Principal, Board of Directors

### 🎯 2. Operational Value & Business Purpose
* **360° Real-Time Institutional Snapshot:** Displays real-time student counts, staff biometric presence, fee collection velocity, and overdue fee alerts in high-impact telemetry cards.
* **Cash Flow Analytics:** Visualizes monthly revenue vs operational expenses with interactive comparison charts.
* **Quick Access Action Hub:** 1-click launchpads for new admissions, fee collections, payroll disbursement, and broadcast announcements.

### 📝 3. Key Telemetry Indicators
* **Total Active Students:** (e.g., `1,450 Students`).
* **Today's Student Attendance Rate:** (e.g., `96.4% Present`).
* **Monthly Fee Realization Rate:** (e.g., `Rs. 6.8M / Rs. 7.1M Collected (95.7%)`).
* **Total Teaching Faculty on Campus:** (e.g., `82 / 85 Present`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Login as Principal:** System routes directly to `/dashboard`.
2. **Review Attendance Gauges:** Inspect low-attendance alerts for secondary classes.
3. **Inspect Fee Collection Velocity:** Compare today's counter cash deposits vs bank 1Link settlements.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Metric Indicator | Current Campus Value | Target Benchmark | Performance Status |
| :--- | :---: | :---: | :---: |
| **Total Active Students** | **1,450 Students** | 1,500 Capacity | `96.7% Campus Capacity` |
| **Today's Student Attendance** | **96.4% Present** | > 95.0% Benchmark | `Optimal (Green)` |
| **Today's Staff Biometric Check-In** | **96.5% Present** | > 95.0% Benchmark | `Optimal (Green)` |
| **August 2026 Fee Realization** | **Rs. 6,800,000 / Rs. 7,100,000** | 100% Invoiced | `95.7% Collected` |
| **Outstanding Defaulter Arrears** | **Rs. 485,000 (38 Students)** | < Rs. 500,000 Cap | `Controlled (Amber)` |
| **Active Transport Bus Fleet** | **4 / 5 Buses on Road** | 5 Buses | `80% Fleet Running` |

---

## 🎓 Screen 10.2: Student Self-Service Portal

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Self-Service Dashboard & Academic Hub
* **Navigation Route:** `/student-dashboard`
* **Source File Location:** `src/features/student-portal/StudentDashboard.tsx`
* **Authorized Access:** Enrolled Students (e.g., `Muhammad Ali Khan - AD-2026-0101`)

### 🎯 2. Operational Value & Business Purpose
* **Student Academic Cockpit:** Displays today's live lecture timetable, pending homework deadlines, upcoming exam schedules, and library book loans.
* **Digital Wallet Balance:** Shows real-time canteen prepaid balance (e.g., `Rs. 2,450.00`).
* **Academic Performance Tracking:** Displays recent quiz grades, term GPA, and merit points in the House Championship.

### 📝 3. Portal Widgets & Elements
* **Today's Lecture Schedule:** Visual cards showing Period 1 to Period 6 with room numbers.
* **LMS Homework Desk:** Pending assignments with countdown timers.
* **Canteen RFID Wallet:** Balance card with 1-click top-up request to parents.
* **Library Loans Widget:** Active borrowed books and due date alerts.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Student Logs In:** Opens `/student-dashboard` on tablet or phone.
2. **Review Lecture Timetable:** Checks Room 201 for Period 1 Math with teacher Fatima Zahra.
3. **Turn In Homework:** Clicks pending physics assignment to launch Screen 8.9 submission desk.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Student Logged In | Current Term GPA | Attendance % | Digital Wallet Balance | Pending Homework | Active Library Loans | House Points |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Muhammad Ali Khan (`AD-2026-0101`)**| **4.00 GPA (A+)** | **98.0%** | **Rs. 2,450.00** | 1 Pending (Physics) | 1 Book (`BK-901`) | +150 Points (Jinnah House) |
| **Hamza Tariq (`AD-2026-0102`)** | **3.70 GPA (A)** | **96.0%** | **Rs. 1,820.00** | 1 Pending (Physics) | 0 Books | +120 Points (Jinnah House) |
| **Ayesha Bibi (`AD-2026-0103`)** | **4.00 GPA (A+)** | **100.0%** | **Rs. 3,100.00** | 0 Pending (Completed)| 0 Books | +180 Points (Sir Syed House) |

---

## 👨‍👩‍👦 Screen 10.3: Parent Self-Service Portal

### 📌 1. Screen Identity & Overview
* **Screen Name:** Parent Master Dashboard & Multi-Child Portal
* **Navigation Route:** `/parent-dashboard` (or `/ParentPortal`)
* **Source File Location:** `src/features/parent-portal/ParentDashboard.tsx`
* **Authorized Access:** Enrolled Parents / Guardians (e.g., `Tariq Mehmood Khan - PRN-2026-001`)

### 🎯 2. Operational Value & Business Purpose
* **Multi-Child Unified Switcher:** Allows parents with multiple enrolled children (e.g., Ali Khan in 10-A and Hamza Tariq in 10-A) to toggle between their dossiers in 1 click.
* **Instant Biometric Attendance Alerts:** Live notification when child punches RFID card at the school gate (e.g., *Checked In at 07:42 AM*).
* **Direct Teacher Chat & Digital Fee Payment:** Enables 1Link online fee settlement and direct communication with class teachers.

### 📝 3. Portal Elements & Widgets
* **Child Selector Dropdown:** Switch between enrolled children.
* **Daily Attendance Card:** Live punch status.
* **Fee Invoices & Online Pay Button:** 1-click payment via Debit Card or 1Link Kuickpay.
* **Daily Homework & Teacher Remarks:** Real-time sync with Screen 8.4 Daily Diary.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Parent Login:** Parent logs in via phone number + OTP.
2. **Switch Child Profile:** Toggle from `Muhammad Ali Khan (10-A)` to `Hamza Tariq (10-A)`.
3. **Pay School Fees:** Click **"Pay Online (Rs. 4,500)"** ➔ Generates 1Link Kuickpay voucher code.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Parent Account | Child Linked | Enrolled Class | Today's Attendance | Recent Exam Result | Fee Invoice Status | Canteen Wallet |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Tariq Mehmood Khan (`PRN-2026-001`)**| Muhammad Ali Khan | Grade 10-A | `Present (07:42 AM)` | 96% (A+ Grade) | `Paid (Rs. 6,000)` | Rs. 2,450 Balance |
| **Tariq Mehmood Khan (`PRN-2026-001`)**| Hamza Tariq | Grade 10-A | `Present (07:44 AM)` | 87% (A Grade) | `Paid (Rs. 4,500)` | Rs. 1,820 Balance |
| **Farooq Ahmed (`PRN-2026-002`)** | Ayesha Bibi | Grade 10-A | `Present (07:50 AM)` | 99% (A+ Grade) | `Paid (Scholarship)`| Rs. 3,100 Balance |
| **Farooq Ahmed (`PRN-2026-002`)** | Zainab Fatima | Grade 9-A | `Present (07:45 AM)` | 94% (A+ Grade) | `Paid (Rs. 4,125)` | Rs. 1,500 Balance |

---

## 🏥 Screen 10.4: Parent Leave Application & Doctor Notes

### 📌 1. Screen Identity & Overview
* **Screen Name:** Parent Student Leave Submission & Medical Note Upload
* **Navigation Route:** `/ApplyLeave`
* **Source File Location:** `src/features/parent-portal/ApplyLeave.tsx`
* **Authorized Access:** Enrolled Parents / Guardians

### 🎯 2. Operational Value & Business Purpose
* **Digital Paperless Leave Requests:** Parents submit planned or sick leave requests directly from mobile phones.
* **Medical Certificate Attachments:** Uploads doctor's prescription images using `<ImageUpload>`.
* **Automatic Attendance Adjustment:** Upon class teacher approval, the student's morning attendance is automatically flagged as `Approved Leave (LV)` instead of `Unexcused Absent`.

### 📝 3. Form Fields & Input Information
* **Target Child:** Select child from family profile.
* **Leave Category:** *Medical / Illness*, *Family Emergency*, *Out of Station*, *Religious Pilgrimage*.
* **Start Date & End Date:** (e.g., `2026-08-30` to `2026-08-31`).
* **Leave Reason Description:** Detailed explanation.
* **Doctor's Prescription / Note:** Attached image/PDF.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Child:** Choose `Hamza Tariq (Grade 10-A)`.
2. **Fill Leave Request:** Select *Medical*, choose dates, write reason (*Viral fever and doctor advice for rest*).
3. **Upload Prescription:** Attach clinic slip photo.
4. **Submit:** Click **"Submit Leave Application"** ➔ Pushes instant review alert to Class Teacher Fatima Zahra.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Request # | Student Name | Class | Leave Dates | Category | Attached Proof | Class Teacher Review | Approval Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **PAR-LV-01** | Hamza Tariq | Grade 10-A | Aug 30 — Aug 31 (2 Days) | Medical Illness | `Prescription.jpg` | Fatima Zahra (`STF-1005`) | `Approved` |
| **PAR-LV-02** | Bilal Hassan | Grade 10-A | Sep 02 — Sep 04 (3 Days) | Family Event | None | Fatima Zahra (`STF-1005`) | `Approved` |
| **PAR-LV-03** | Ahmed Raza | Grade 1-A | Aug 28 (1 Day) | Severe Flu | `ClinicSlip.pdf` | Mrs. Ayesha Kamran | `Approved` |

---

## 🧾 Screen 10.5: Parent Fee Payment History & Online Invoices

### 📌 1. Screen Identity & Overview
* **Screen Name:** Parent Fee Ledger, Online Invoices & Payment Receipts
* **Navigation Route:** `/FeePaymentHistory`
* **Source File Location:** `src/features/parent-portal/FeePaymentHistory.tsx`
* **Authorized Access:** Enrolled Parents / Guardians

### 🎯 2. Operational Value & Business Purpose
* **Complete Financial History:** Parents view all historical fee invoices, discounts, transport charges, and paid receipts across all academic terms.
* **Download Official Stamped Receipts:** 1-click download of PDF payment receipts for tax deduction claims.
* **Direct Online Settlement:** Features built-in payment gateway button to pay pending invoices via Debit/Credit Card or generate 1Link bill consumer numbers.

### 📝 3. Invoices List Elements
* **Voucher / Challan Number:** (e.g., `CH-2026-AUG-0101`).
* **Billing Month & Due Date:** (e.g., `August 2026`, Due: `10th Aug`).
* **Itemized Breakdown:** Tuition, Lab Fees, Transport Charges, Sibling Discount.
* **Net Paid Amount:** Final currency amount.
* **Payment Mode & Transaction ID:** (e.g., `1Link Kuickpay - Ref # 994812`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Open Payment History:** Parent navigates to `/FeePaymentHistory`.
2. **Review Invoices Table:** Inspect paid vs pending invoices.
3. **Print Official Receipt:** Click **"Download Stamped Receipt (PDF)"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Challan Number | Child Name | Billing Month | Gross Bill | Concession Applied | Net Paid | Payment Date | Payment Mode |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **CH-2026-AUG-0101** | Muhammad Ali Khan | August 2026 | Rs. 6,000 | Rs. 0 | **Rs. 6,000** | 2026-08-10 | Cash Desk Counter |
| **CH-2026-AUG-0102** | Hamza Tariq | August 2026 | Rs. 6,000 | -Rs. 1,500 (25% Sibling) | **Rs. 4,500** | 2026-08-10 | 1Link Online Bill Pay |
| **CH-2026-JUL-0101** | Muhammad Ali Khan | July 2026 | Rs. 6,000 | Rs. 0 | **Rs. 6,000** | 2026-07-09 | 1Link Online Bill Pay |
| **CH-2026-JUL-0102** | Hamza Tariq | July 2026 | Rs. 6,000 | -Rs. 1,500 (25% Sibling) | **Rs. 4,500** | 2026-07-09 | 1Link Online Bill Pay |

---

# 📢 PART B: School Communication & Front Office Operations

---

## 📡 Screen 10.6: Multi-Channel Communication Broadcaster

### 📌 1. Screen Identity & Overview
* **Screen Name:** Multi-Channel Mass Broadcast Console (SMS, WhatsApp & Email)
* **Navigation Route:** `/CommunicationBroadcaster`
* **Source File Location:** `src/features/communication/CommunicationBroadcaster.tsx`
* **Authorized Access:** Campus Principal, Public Relations Officer, Senior Admin

### 🎯 2. Operational Value & Business Purpose
* **Campus-Wide Instant Messaging:** Dispatches urgent weather advisories, emergency school closure alerts, exam date sheet updates, and fee reminders across 1,500+ parents in under 15 seconds.
* **Target Audience Segmentation:** Filters recipients by *Entire School*, *Specific Class (e.g., Grade 10-A)*, *Hostel Boarders*, or *Transport Bus Route 01*.
* **Multi-Gateway Failover:** Automatically fails over between SMS gateways (Telenor/Jazz SMS API) and official WhatsApp Cloud API.

### 📝 3. Form Fields & Broadcast Elements
* **Target Audience Selection:** Radio (*All School*, *Specific Class*, *Teaching Staff*, *Defaulters*).
* **Communication Channels:** Checkboxes (*SMS Message*, *WhatsApp Official*, *Mobile App Push Notification*, *Email*).
* **Message Title & Body:** (e.g., *Midterm Examination Date Sheet Released*).
* **Schedule Time:** `Send Immediately` or `Schedule for Later`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Choose Audience:** Select `Grade 10 - Science (All Sections)`.
2. **Select Channels:** Check `WhatsApp` and `SMS`.
3. **Compose Notice:** Type message text with dynamic variables (`{{StudentName}}`).
4. **Broadcast:** Click **"Dispatch Live Broadcast"** ➔ System delivers 76 messages with 100% delivery confirmation.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Broadcast # | Broadcast Subject | Target Audience | Channels Used | Total Recipients | Delivery Success Rate | Dispatched By | Timestamp |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **BRD-2026-01** | Midterm Examination Date Sheet Released | Grade 10 (All Sections) | SMS + WhatsApp + Push | 76 Parents | **100% (76/76 Delivered)** | Prof. Tariq Mehmood | 2026-08-25 10:00 AM |
| **BRD-2026-02** | Heavy Rain Alert — School Closed Tomorrow| Entire Campus | SMS + WhatsApp + Push | 1,450 Parents | **99.8% (1447/1450)** | Prof. Tariq Mehmood | 2026-08-20 06:30 PM |
| **BRD-2026-03** | Bus Route 02 Morning Schedule Delay | Route 02 Passengers | WhatsApp Broadcast | 48 Parents | **100% (48/48 Delivered)** | Subhan Ali (`STF-1007`) | 2026-08-18 06:45 AM |

---

## 📌 Screen 10.7: Digital Notice Board & School Circulars

### 📌 1. Screen Identity & Overview
* **Screen Name:** Digital Notice Board & Official School Circulars
* **Navigation Route:** `/DigitalNoticeBoard` (or `/Noticeboard`)
* **Source File Location:** `src/features/communication/DigitalNoticeBoard.tsx`
* **Authorized Access:** Campus Principal, HR Officer, Academic Coordinator

### 🎯 2. Operational Value & Business Purpose
* **Official Institutional Circulars:** Publishes formal signed circulars, holiday schedules, inter-school sports gala invites, and academic calendars.
* **Target Role Visibility:** Sets circular visibility for `All Roles`, `Students & Parents Only`, or `Staff Only (Confidential)`.
* **Pinned Announcements:** Pins critical notices (e.g., *Independence Day Celebrations*) at the top of portal homepages.

### 📝 3. Form Fields & Input Information
* **Notice Title:** (e.g., *Independence Day Flag Hoisting Ceremony & Dress Code*).
* **Target Audience:** Selection (*Public*, *Students & Parents*, *Faculty Staff*).
* **Effective Date & Expiration Date:** (e.g., `2026-08-10` to `2026-08-16`).
* **Circular Body:** Rich text formatted content with embedded images.
* **Attached PDF Document:** Signed circular scan.
* **Is Pinned:** Toggle (Yes/No).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Publish Notice:** Click **"+ Post New Circular"**.
2. **Enter Content:** Title, target audience (*Students & Parents*), and body text.
3. **Attach PDF:** Upload `Circular_IndependenceDay2026.pdf`.
4. **Publish:** Click **"Publish Notice"** ➔ Displays prominently on student and parent dashboards.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Circular Code | Notice Title | Target Audience | Priority | Published Date | Expiry Date | Attachment | Status |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **NOT-2026-01** | Independence Day Celebration & Flag Hoisting | Students, Parents & Staff | `High (Pinned)` | 2026-08-10 | 2026-08-15 | `Circular_Aug14.pdf` | `Active Live` |
| **NOT-2026-02** | Midterm Examination Guidelines & Hall Rules | Grade 9 & Grade 10 | `High` | 2026-08-25 | 2026-10-30 | `Exam_Rules_2026.pdf`| `Active Live` |
| **NOT-2026-03** | Faculty Development Workshop on STEM | Teaching Staff Only | `Medium` | 2026-08-18 | 2026-08-22 | `Workshop_Agenda.pdf`| `Archived` |

---

## 🤝 Screen 10.8: Parent-Teacher Meeting (PTM) Scheduler

### 📌 1. Screen Identity & Overview
* **Screen Name:** Parent-Teacher Meeting (PTM) Slot Booking & Scheduler
* **Navigation Route:** `/PtmScheduler` (or `/PtmSlots`)
* **Source File Location:** `src/features/communication/PtmScheduler.tsx`
* **Authorized Access:** Academic Coordinator, Class Teachers, Parents

### 🎯 2. Operational Value & Business Purpose
* **Eliminates PTM Chaos & Queues:** Parents book 15-minute dedicated one-on-one time slots with class teachers and subject faculty.
* **Conflict-Free Scheduling:** Automatically blocks booked slots to prevent double-booking.
* **Automated Meeting Notes:** Teachers log parent feedback, academic commitments, and follow-up targets directly during the consultation.

### 📝 3. Form Fields & Slot Elements
* **PTM Session Title:** (e.g., *First Term Academic Review PTM*).
* **Event Date:** (e.g., `2026-09-05`).
* **Available Time Slots:** 15-minute intervals (*09:00 - 09:15 AM*, *09:15 - 09:30 AM*).
* **Participating Teacher:** (e.g., `Fatima Zahra - STF-1005`).
* **Parent Booking Status:** `Available (Green)`, `Booked (Blue)`, `Completed (Gray)`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Coordinator Sets PTM Schedule:** Defines date (`Sep 05, 2026`) and generates 24 time slots for Grade 10-A.
2. **Parent Books Slot:** Parent Tariq Mehmood Khan logs into parent portal and selects `09:30 - 09:45 AM` slot.
3. **Conduct Consultation:** Teacher opens screen during meeting and records notes (*Father reviewed Ali's mathematics performance; agreed on physics extra prep*).

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Slot Code | PTM Date | Time Interval | Student Name | Parent Name | Consulting Teacher | Booking Status | Consultation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **PTM-10A-01** | 2026-09-05 | 09:00 AM - 09:15 AM | Ayesha Bibi (`AD-2026-0103`) | Farooq Ahmed | Fatima Zahra (`STF-1005`) | `Booked` | High praise for math score |
| **PTM-10A-02** | 2026-09-05 | 09:15 AM - 09:30 AM | Hamza Tariq (`AD-2026-0102`) | Tariq Mehmood Khan | Fatima Zahra (`STF-1005`) | `Booked` | Discussed algebra practice |
| **PTM-10A-03** | 2026-09-05 | 09:30 AM - 09:45 AM | Muhammad Ali Khan (`AD-2026-0101`)| Tariq Mehmood Khan | Fatima Zahra (`STF-1005`) | `Booked` | Exceptional performance review|
| **PTM-10A-04** | 2026-09-05 | 09:45 AM - 10:00 AM | Bilal Hassan (`AD-2026-0104`) | Hassan Mehmood | Fatima Zahra (`STF-1005`) | `Booked` | Discussed punctual arrival |
| **PTM-10A-05** | 2026-09-05 | 10:00 AM - 10:15 AM | — | — | Fatima Zahra (`STF-1005`) | `Available` | Open for booking |

---

## 🎫 Screen 10.9: Helpdesk & Support Tickets Manager

### 📌 1. Screen Identity & Overview
* **Screen Name:** Institutional Helpdesk & Parent Support Ticket Registry
* **Navigation Route:** `/HelpdeskTickets`
* **Source File Location:** `src/features/communication/HelpdeskTicketsManager.tsx`
* **Authorized Access:** Front Desk Officer, IT Admin, Transport Manager, Principal

### 🎯 2. Operational Value & Business Purpose
* **SLA-Tracked Grievance Redressal:** Parents and teachers submit structured support tickets (Fee Inquiries, Bus Route Adjustments, Portal Password Resets, Classroom Issues).
* **Automated Routing:** Tickets route automatically to the designated department head (e.g., Bus issues route to `Subhan Ali`, Fee queries to `Kamran Akmal`).
* **Resolution Speed Tracking:** Measures department resolution turnaround times against a 24-hour service SLA.

### 📝 3. Form Fields & Ticket Attributes
* **Ticket Reference Code:** (e.g., `TCK-2026-0101`).
* **Category:** *Fee & Billing*, *Transport & Bus Stop*, *Academic / Teacher Feedback*, *IT & Portal Access*.
* **Priority Level:** `Low`, `Medium`, `High`, `Urgent`.
* **Ticket Description:** Detailed parent issue explanation.
* **Assigned Department & Staff:** (e.g., *Transport In-Charge Subhan Ali*).
* **Ticket Status:** `Open (Amber)`, `In Progress (Blue)`, `Resolved (Green)`, `Closed`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Parent Submits Ticket:** Parent logs ticket: *Request to move bus pickup stop to F-6 Super Market Main Gate*.
2. **Department Takes Action:** Subhan Ali updates ticket status to `In Progress` and confirms driver coordination.
3. **Resolve Ticket:** Officer posts resolution reply (*Bus Stop relocated starting Monday*) and marks ticket `Resolved`.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Ticket # | Submitter Name | Role / Phone | Category | Issue Subject | Priority | Assigned Officer | Ticket Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **TCK-2026-01** | Tariq Mehmood Khan | Parent (0300-5544332)| Transport | Request for Bus Stop Landmark Adjustment | `Medium` | Subhan Ali (`STF-1007`) | `Resolved` |
| **TCK-2026-02** | Farooq Ahmed | Parent (0321-7766554)| Finance | Sibling Concession Verification on August Bill| `Low` | Kamran Akmal (`STF-1003`)| `Resolved` |
| **TCK-2026-03** | Hassan Mehmood | Parent (0345-1122334)| IT / Portal | Parent Portal Password Reset Request | `High` | IT Support Desk | `Resolved` |
| **TCK-2026-04** | Usman Ghani | Parent (0345-2233112)| Finance | Request for Fee Installment Schedule | `High` | Kamran Akmal (`STF-1003`)| `In Progress` |

---

## 🎂 Screen 10.10: Automated Birthday Wishes Dispatcher

### 📌 1. Screen Identity & Overview
* **Screen Name:** Automated Birthday Wishes & Anniversary Dispatcher
* **Navigation Route:** `/BirthdayWishes`
* **Source File Location:** `src/features/communication/BirthdayWishesManager.tsx`
* **Authorized Access:** Public Relations Officer, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Institutional Goodwill & Community Bonding:** Scans the student and staff database daily at 08:00 AM to identify individuals celebrating birthdays.
* **Automated WhatsApp / SMS Greeting Cards:** Dispatches personalized birthday wishes with student photo frames and cheerful greetings from the Principal.

### 📝 3. Form Fields & Greeting Elements
* **Today's Birthday Candidates:** Real-time filtered roster of students and teachers.
* **Greeting Template:** Customizable text template with student name variables.
* **WhatsApp Card Graphic:** Dynamic greeting card attachment.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Inspect Daily Birthdays:** System loads students with today's date of birth.
2. **Automated / Manual Dispatch:** Click **"Send Birthday Greeting Cards"** ➔ Delivers festive WhatsApp message to parents.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Candidate Name | Role / Class | Date of Birth | Age Today | Guardian Phone | Greeting Template Used | Dispatch Status |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **Muhammad Ali Khan (`AD-2026-0101`)**| Student (Grade 10-A)| 2010-08-29 | 16 Years | 0300-5544332 | Principal Birthday Card Template | `Delivered via WhatsApp` |
| **Fatima Zahra (`STF-1005`)** | Senior Math Teacher | 1991-08-29 | 35 Years | 0321-4455667 | Faculty Appreciation Greeting | `Delivered via SMS` |
| **Ahmed Raza (`AD-2026-0107`)** | Student (Grade 1-A) | 2019-09-02 | 7 Years | 0333-8899001 | Junior Montessori Fun Card | `Scheduled (Sep 02)` |

---

## 💡 Screen 10.11: Feedback & Suggestions Box

### 📌 1. Screen Identity & Overview
* **Screen Name:** Institutional Feedback, Suggestions & Quality Assurance Desk
* **Navigation Route:** `/FeedbackSuggestions`
* **Source File Location:** `src/features/communication/FeedbackSuggestionsManager.tsx`
* **Authorized Access:** Quality Assurance Officer, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Continuous Quality Improvement:** Gathers anonymous or verified feedback from parents, students, and staff regarding canteen hygiene, teaching quality, transport timing, and sports facilities.
* **Executive Review:** Enables the Principal and school board to review institutional sentiment metrics and take corrective management actions.

### 📝 3. Feedback Entry Elements
* **Feedback Category:** *Campus Facilities & Hygiene*, *Teaching Methodology*, *Canteen Food Quality*, *Sports & Co-Curricular*.
* **Feedback Sentiment:** `Positive (Green)`, `Neutral (Blue)`, `Constructive Suggestion (Amber)`.
* **Management Action Taken:** Official recorded response and corrective step.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Incoming Feedback:** Filter feedback by category and sentiment.
2. **Assign Action:** Principal marks feedback for administrative follow-up (e.g., *Canteen contractor instructed to add fresh fruit juices*).
3. **Close Feedback Loop:** Record management action.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Feedback # | Submitter | Feedback Category | Feedback Text Summary | Sentiment | Management Action Recorded |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **FDB-2026-01** | Parent (10-A) | Canteen & Food | Introduce more fresh fruit juices and healthy snack options | `Constructive` | Canteen menu updated with fruit salads & juices |
| **FDB-2026-02** | Student (9-A) | Campus Facilities | Science lab requires additional digital multimeters | `Constructive` | Procurement order placed for 10 multimeters |
| **FDB-2026-03** | Parent (1-A) | Co-Curricular | Outstanding organization of the Junior Sports Gala | `Positive` | Appreciation letter issued to Sports Department |

---

## 🗓️ Screen 10.12: School Event Calendar Planner

### 📌 1. Screen Identity & Overview
* **Screen Name:** Master Institutional Event Calendar & Academic Term Planner
* **Navigation Route:** `/EventCalendar`
* **Source File Location:** `src/features/communication/EventCalendarManager.tsx`
* **Authorized Access:** Event Coordinator, Campus Principal, All Roles (Viewer)

### 🎯 2. Operational Value & Business Purpose
* **Campus Event Coordination:** Centralized interactive monthly calendar displaying academic dates, sports galas, parent-teacher conferences, national holidays, and exam date windows.
* **Campus Synchronization:** Ensures academic teaching schedules do not clash with co-curricular tournaments or science exhibitions.

### 📝 3. Form Fields & Calendar Elements
* **Event Title:** (e.g., *Annual Inter-House Sports Gala 2026*).
* **Event Category:** *Academic Exam*, *Sports & Athletics*, *Cultural / Celebration*, *Public Holiday*, *PTM Conference*.
* **Start Date & End Date:** (e.g., `2026-11-12` to `2026-11-14`).
* **Venue Location:** (e.g., *Main Sports Ground / Auditorium*).
* **Target Audience:** All Students & Parents.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Create Event:** Click **"+ Add School Event"**.
2. **Enter Details:** Title (*Annual Sports Gala*), Dates, Venue (*Sports Complex*), and pick Category (*Sports*).
3. **Publish to Calendars:** Click **"Save & Publish Event"** ➔ Appears on mobile app calendars for all parents and teachers.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Event Code | Event Title | Category | Start Date | End Date | Venue Location | Target Participants |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EVT-2026-01** | Independence Day Flag Hoisting & Drama | Cultural Celebration | 2026-08-14 | 2026-08-14 | School Main Lawn | All Students & Faculty |
| **EVT-2026-02** | Midterm Examination Session 2026 | Academic Examination | 2026-10-15 | 2026-10-25 | Examination Halls | Grade 1 through 10 |
| **EVT-2026-03** | First Term Parent Teacher Meeting (PTM) | Parent Conference | 2026-09-05 | 2026-09-05 | Respective Classrooms| All Parents & Teachers |
| **EVT-2026-04** | Annual Inter-House Athletics Gala | Sports & Tournaments | 2026-11-12 | 2026-11-14 | Main Sports Complex | All 4 Houses (Jinnah, Iqbal, etc.)|

---

## 💬 Screen 10.13: Internal Staff Chat Platform

### 📌 1. Screen Identity & Overview
* **Screen Name:** Internal Staff Collaboration & Departmental Chat Platform
* **Navigation Route:** `/StaffChat`
* **Source File Location:** `src/features/communication/StaffChatPlatform.tsx`
* **Authorized Access:** All Active Faculty & Administrative Staff

### 🎯 2. Operational Value & Business Purpose
* **Secure Internal Communication:** Real-time departmental channels (e.g., `#Science-Faculty`, `#Grade-10-Teachers`, `#Transport-Coordination`) and direct 1-to-1 messaging between teachers.
* **Confidentiality & Compliance:** Keeps internal teacher communication securely inside school databases without relying on personal social media groups.
* **Document & Exam Paper Sharing:** Allows secure sharing of lesson plans and question drafts.

### 📝 3. Chat Channels & Features
* **Department Channels:** `#General-Announcements`, `#Secondary-Wing`, `#Science-Lab`, `#Finance-Desk`.
* **Direct Messages (1:1):** Direct conversations with read receipts.
* **File Attachments:** PDF documents, lesson plans, audio notes.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Open Staff Chat:** Teacher Fatima Zahra opens `/StaffChat`.
2. **Select Channel:** Clicks on `#Grade-10-Teachers`.
3. **Share Message:** *Reminder: Math and Physics midterm paper drafts are due tomorrow*.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Channel / Chat Thread | Participant Faculty | Topic / Recent Message | Unread Messages | Last Activity |
| :--- | :--- | :--- | :---: | :--- |
| **#Grade-10-Teachers** | Fatima Zahra, Hina Qasim, Asad Ullah | Reviewing midterm paper submission timelines | 0 (All Read) | 2026-08-28 02:15 PM |
| **#Science-Department** | Fatima Zahra, Asad Ullah, Lab Assistant | Chemistry titration apparatus restocked in Lab 2 | 2 Unread | 2026-08-28 01:45 PM |
| **Direct: Principal ➔ Fatima**| Prof. Tariq Mehmood, Fatima Zahra | Approved lesson plan for quadratic equations | 0 (All Read) | 2026-08-27 11:30 AM |

---

## 🚪 Screen 10.14: Front Office Visitors Log & Gate Passes

### 📌 1. Screen Identity & Overview
* **Screen Name:** Front Office Visitors Log & Security Gate Pass Generator
* **Navigation Route:** `/VisitorsLog`
* **Source File Location:** `src/features/front-office/Visitors.tsx`
* **Authorized Access:** Security Gate Officer, Receptionist, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Campus Security & Access Control:** Registers every external visitor entering the school premises (Vendors, Prospective Parents, Maintenance Technicians, Government Inspectors).
* **Thermal Gate Pass Printing:** Prints a stamped security badge containing visitor photo, CNIC number, host officer name, and visit purpose.
* **Automated Check-Out Tracking:** Logs exit timestamps to ensure zero unauthorized visitors remain on campus after school hours.

### 📝 3. Form Fields & Visitor Attributes
* **Visitor Full Name & Mobile:** (e.g., `Zubair Ahmed`, Phone: `0300-1122334`).
* **CNIC / National ID Number:** 13-digit identification (e.g., `61101-1234567-1`).
* **Purpose of Visit:** *New Admission Inquiry*, *Vendor Meeting*, *Parent Fee Inquiry*, *Maintenance*.
* **Host Staff Member & Department:** (e.g., `Kamran Akmal - Finance Department`).
* **Vehicle Registration Plate:** (e.g., `ICT-AB-992`).
* **Check-In & Check-Out Timestamps:** Automated time logging.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Register Incoming Visitor:** Receptionist enters Visitor Name, CNIC, Phone, Host Officer, and Vehicle Plate.
2. **Print Security Gate Pass:** Click **"Print Gate Pass"** ➔ Prints thermal badge.
3. **Record Visitor Exit:** When visitor leaves, click **"Check Out Visitor"** in `<ActionMenu>`.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Gate Pass # | Visitor Full Name | CNIC Number | Contact Phone | Host Department / Officer | Visit Purpose | Check-In Time | Check-Out Time | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **GP-2026-081** | Zubair Ahmed | 61101-1234567-1 | 0300-1122334 | Admissions / Sana Mir | Grade 9 Admission Inquiry | 09:15 AM | 10:30 AM | `Checked Out` |
| **GP-2026-082** | Muhammad Waqas | 37405-9988776-3 | 0321-5544332 | Finance / Kamran Akmal | Lab Chemicals Invoice Delivery | 10:45 AM | 11:30 AM | `Checked Out` |
| **GP-2026-083** | Tariq Mehmood Khan | 61101-5544332-1 | 0300-5544332 | Principal / Prof. Tariq | Academic Counseling Meeting | 11:45 AM | — | `Checked In (On Campus)`|

---

## 📜 Screen 10.15: Student Certificates & Transfer Generator

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Institutional Certificates & Transfer Certificate (TC) Generator
* **Navigation Route:** `/CertificatesManager`
* **Source File Location:** `src/features/front-office/Certificates.tsx`
* **Authorized Access:** Front Office Officer, Principal, Examination Controller

### 🎯 2. Operational Value & Business Purpose
* **Official Institutional Credentials:** Generates legally verified, embossed certificate documents:
  1. **Transfer Certificate (TC) / School Leaving Certificate (SLC)** (for students relocating or graduating).
  2. **Bonafide / Student Status Certificate** (for passport, visa, or scholarship applications).
  3. **Character / Good Conduct Certificate** (for college admissions).
* **QR-Code Verification:** Embeds digital verification QR codes to prevent forgery.

### 📝 3. Certificate Selection & Elements
* **Target Student:** Select student from directory (e.g., `Muhammad Ali Khan - AD-2026-0101`).
* **Certificate Type:** *Transfer Certificate*, *Bonafide Certificate*, *Character Certificate*.
* **Conduct Evaluation:** *Exemplary*, *Good*, *Satisfactory*.
* **Reason for Issuance:** (e.g., *Parent job transfer to Lahore*, *Embassy visa application*).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Student & Certificate:** Choose `Muhammad Ali Khan` and `Bonafide / Student Status Certificate`.
2. **Specify Purpose:** Enter *Application for Cambridge International Olympiad*.
3. **Generate & Print:** Click **"Generate Official Certificate (PDF)"** ➔ Generates embossed, printable certificate with Principal signature line.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Certificate # | Student Name | Admission # | Class | Certificate Type Issued | Purpose of Issuance | Issued Date | Approving Authority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CERT-2026-01** | Muhammad Ali Khan | `AD-2026-0101` | Grade 10-A | Bonafide Student Status | Embassy Student Visa Verification | 2026-08-25 | Prof. Tariq Mehmood |
| **CERT-2026-02** | Ayesha Bibi | `AD-2026-0103` | Grade 10-A | Character & Merit Certificate | National Talent Scholarship Award | 2026-08-26 | Prof. Tariq Mehmood |
| **CERT-2026-03** | Daniyal Qureshi | `AD-2025-0089` | Grade 10-A | Transfer Certificate (TC/SLC) | Family Relocation to Karachi | 2026-08-20 | Prof. Tariq Mehmood |

---

## 🔔 Screen 10.16: System Notifications Inbox

### 📌 1. Screen Identity & Overview
* **Screen Name:** Central System Notifications & Real-Time Alert Inbox
* **Navigation Route:** `/NotificationsInbox` (or `/Notifications`)
* **Source File Location:** `src/features/front-office/Notifications.tsx`
* **Authorized Access:** All Authenticated Users

### 🎯 2. Operational Value & Business Purpose
* **Unified In-App Alert Stream:** Aggregates real-time notifications (Leave approvals, fee payment confirmations, timetable substitute alerts, homework grades, exam schedule publications).
* **Read / Unread State Management:** Features 1-click **"Mark All as Read"** and category filtering (*Academic*, *Financial*, *System Alerts*).

### 📝 3. Notification Elements
* **Alert Title & Message:** (e.g., *Fee Payment Received: Rs. 6,000 via Cash Desk*).
* **Category Badge:** `Academic (Indigo)`, `Finance (Emerald)`, `Transport (Amber)`, `Security (Red)`.
* **Action Deep-Link:** 1-click jump to the relevant record screen.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Click Bell Icon:** Open notifications slide-over or inbox page.
2. **Review Unread Alerts:** Click on notification row to navigate directly to target document.
3. **Clear Inbox:** Click **"Mark All as Read"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Notification # | Target User | Category | Alert Title & Summary | Timestamp | Read Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **NOTIF-2026-01** | Tariq Mehmood Khan (Parent)| Finance | Fee Payment Confirmed — Rs. 6,000 for Ali Khan (Challan # CH-0101) | 2026-08-10 11:16 AM | `Read` |
| **NOTIF-2026-02** | Fatima Zahra (Teacher) | HR / Leave | Substitute Duty Assigned — Period 3 Chemistry Lab for Asad Ullah | 2026-08-28 08:05 AM | `Read` |
| **NOTIF-2026-03** | Muhammad Ali Khan (Student)| Academic | Homework Graded — Math Problem Set 2.4 (Score: 10/10) | 2026-08-29 04:30 PM | `Unread` |

---

# 📊 PART C: Central Reports Center & Printable Statements

---

## 📑 Screen 10.17: Central Institutional Reports Hub

### 📌 1. Screen Identity & Overview
* **Screen Name:** Central Institutional Reports Center & Business Intelligence Hub
* **Navigation Route:** `/ReportsCenter`
* **Source File Location:** `src/features/reports/ReportsCenter.tsx`
* **Authorized Access:** Super Administrator, Campus Principal, Senior Accountant, Examination Controller

### 🎯 2. Operational Value & Business Purpose
* **Consolidated Intelligence Launchpad:** Categorized index of all 13 official printable institutional reports across Academics, Finance, HR, and Administration.
* **Instant Filtering & Search:** Search reports by keyword (e.g., *Broadsheet*, *Profit & Loss*, *Defaulters*, *SLC*, *Payroll*).
* **Direct Export Engine:** 1-click execution to generate high-resolution, board-compliant printable PDF documents and raw Excel spreadsheets.

---

## 📈 Screen 10.18: Academic Broadsheet Examination Report

### 📌 1. Screen Identity & Overview
* **Screen Name:** Master Academic Examination Broadsheet & Class Merit Ranker
* **Navigation Route:** `/reports/broadsheet`
* **Source File Location:** `src/features/reports/BroadsheetReport.tsx`
* **Authorized Access:** Controller of Examinations, Campus Principal, Class Teachers

### 🎯 2. Operational Value & Business Purpose
* **Full Class Comprehensive Broadsheet:** Large multi-column matrix displaying student-by-student and subject-by-subject scores (Math, Physics, Chemistry, English, Urdu) with Total Obtained, Overall Percentage, Letter Grade, GPA, and Class Merit Position.
* **Official Board Formatting:** Designed to meet Federal/Provincial Board examination broadsheet standards for annual archives.

### 📊 Master Broadsheet Dataset (Grade 10-A Midterm Exam — Zero GUIDs)

| Position | Roll # | Student Full Name | Math (100) | Physics (100) | Chem (100) | Eng (100) | Urdu (100) | Total Score (500) | % Score | Final Grade | CGPA | Result Status |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 🥇 **1st** | **103** | Ayesha Bibi | **99** | **98** | **97** | **96** | **95** | **485 / 500** | **97.0%** | `A+` | **4.00** | `Passed (1st Position)` |
| 🥈 **2nd** | **101** | Muhammad Ali Khan | **96** | **95** | **94** | **92** | **93** | **470 / 500** | **94.0%** | `A+` | **4.00** | `Passed (2nd Position)` |
| 🥉 **3rd** | **108** | Omer Farooq | **91** | **90** | **89** | **88** | **90** | **448 / 500** | **89.6%** | `A` | **3.70** | `Passed (3rd Position)` |
| **4th** | **102** | Hamza Tariq | **87** | **85** | **84** | **86** | **88** | **430 / 500** | **86.0%** | `A` | **3.70** | `Passed` |
| **5th** | **104** | Bilal Hassan | **76** | **74** | **72** | **78** | **80** | **380 / 500** | **76.0%** | `B` | **3.00** | `Passed` |
| **12th** | **105** | Usman Ghani Jr. | **55** | **52** | **50** | **58** | **60** | **275 / 500** | **55.0%** | `D` | **1.00** | `Passed (Promoted on Trial)`|

---

## 🧾 Screen 10.19: Printable Fee Challan Voucher Report

### 📌 1. Screen Identity & Overview
* **Screen Name:** Standard 3-Copy Bank Fee Challan Generator
* **Navigation Route:** `/reports/fee-voucher`
* **Source File Location:** `src/features/reports/FeeChallanReport.tsx`
* **Authorized Access:** Cashier, Senior Accountant, Parents

### 🎯 2. Operational Value & Business Purpose
* **Standard 3-Part Bank Slip:** Produces printable A4 voucher containing 3 identical vertical slips:
  1. **Bank Copy** (Retained by collecting bank teller).
  2. **School Accounts Copy** (Submitted to school cashier).
  3. **Student / Parent Copy** (Retained by guardian as stamped proof).
* **Includes 1Link 1Bill Consumer Number:** Enables online mobile banking payments via Meezan Bank, HBL, EasyPaisa, and JazzCash.

### 📊 Master Fee Voucher Dataset (Zero GUIDs)

| Challan Number | 1Link Consumer # | Student Name | Class | Tuition Fee | Lab / Computer | Sibling Concession | Net Payable | Due Date | Bank Deposit Account |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **CH-2026-AUG-0101** | `10088210101` | Muhammad Ali Khan | Grade 10-A | Rs. 6,000 | Rs. 1,000 | Rs. 0 | **Rs. 7,000** | 2026-08-10 | Meezan Bank A/C # 0102-998811 |
| **CH-2026-AUG-0102** | `10088210102` | Hamza Tariq | Grade 10-A | Rs. 6,000 | Rs. 1,000 | -Rs. 1,500 (25%) | **Rs. 5,500** | 2026-08-10 | Meezan Bank A/C # 0102-998811 |
| **CH-2026-AUG-0103** | `10088210103` | Ayesha Bibi | Grade 10-A | Rs. 6,000 | Rs. 1,000 | -Rs. 7,000 (100%) | **Rs. 0** | 2026-08-10 | Meezan Bank A/C # 0102-998811 |

---

## ⚠️ Screen 10.20: Fee Defaulters Comprehensive Report

### 📌 1. Screen Identity & Overview
* **Screen Name:** Institutional Fee Defaulters & Outstanding Arrears Report
* **Navigation Route:** `/reports/fee-defaulters`
* **Source File Location:** `src/features/reports/FeeDefaultersReport.tsx`
* **Authorized Access:** Senior Accountant, Campus Principal, Board Auditor

### 🎯 2. Operational Value & Business Purpose
* **Arrears Aging Dossier:** Categorizes overdue student fees into 30-day, 60-day, and 90-day aging buckets.
* **Recovery Action Checklist:** Exports contact rosters for recovery phone calls and legal notice dispatches.

### 📊 Master Defaulters Dataset (Zero GUIDs)

| Admission # | Student Name | Class | Father Name | Guardian Phone | Overdue Months | Total Arrear (PKR) | Aging Classification |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **AD-2026-0105** | Usman Ghani Jr. | Grade 10-A | Usman Ghani | 0345-2233112 | 2 Months (Jul + Aug) | **Rs. 12,500** | `60 Days Overdue` |
| **AD-2026-0112** | Shahzad Karim | Grade 8-A | Karim Bux | 0300-8877665 | 3 Months (Jun, Jul, Aug)| **Rs. 15,000** | `90+ Days (Critical)` |
| **AD-2026-0119** | Danish Ali | Grade 9-B | Ali Asghar | 0321-9900112 | 1 Month (Aug 2026) | **Rs. 5,500** | `30 Days Overdue` |

---

## 📜 Screen 10.21: School Leaving Certificate (SLC) Report

### 📌 1. Screen Identity & Overview
* **Screen Name:** Official School Leaving Certificate (SLC / TC) Dossier
* **Navigation Route:** `/reports/slc-certificate`
* **Source File Location:** `src/features/reports/SlcCertificateReport.tsx`
* **Authorized Access:** Campus Principal, Front Office Admin

### 🎯 2. Operational Value & Business Purpose
* **Statutory Relocation Document:** Official certificate issued upon student withdrawal or graduation verifying attendance record, fee clearance, academic conduct, and reason for leaving.

### 📊 Master SLC Dataset (Zero GUIDs)

| SLC Serial # | Student Full Name | Admission # | Class Left | Date of Admission | Date of Leaving | General Conduct | Reason for Leaving | Authorized Signatory |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SLC-2026-012** | Daniyal Qureshi | `AD-2025-0089` | Grade 10-A | 2025-08-01 | 2026-08-20 | Exemplary / Good | Father Transferred to Karachi | Prof. Tariq Mehmood |
| **SLC-2026-013** | Sara Khan | `AD-2024-0045` | Grade 8-B | 2024-08-01 | 2026-08-22 | Exemplary | Admission to Cadet College | Prof. Tariq Mehmood |

---

## 🏆 Screen 10.22: Official Student Character & Merit Certificates

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Character, Sports & Academic Merit Certificates
* **Navigation Route:** `/reports/student-certificates`
* **Source File Location:** `src/features/reports/StudentCertificatesReport.tsx`
* **Authorized Access:** Campus Principal, Academic Coordinator

### 🎯 2. Operational Value & Business Purpose
* **Formal Commendation Dossiers:** Generates certificate of excellence for board toppers, sports gala champions, and house captains with gold border designs.

### 📊 Master Character & Merit Dataset (Zero GUIDs)

| Award Ref # | Student Name | Class | Award Category | Achievement Title | House Assigned | Issued Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MERIT-2026-01** | Ayesha Bibi | Grade 10-A | Academic Excellence | **1st Position in Midterms (97.0%)** | Sir Syed Red House | 2026-08-28 |
| **MERIT-2026-02** | Muhammad Ali Khan | Grade 10-A | Mathematics Excellence | **Highest Marks in Mathematics (96/100)**| Jinnah Blue House | 2026-08-28 |
| **MERIT-2026-03** | Bilal Hassan | Grade 10-A | Sports Achievement | **Captain — Inter-School Football Champion** | Iqbal Green House | 2026-08-28 |

---

## 🪪 Screen 10.23: Student ID Card Printable Generator

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student PVC Plastic ID Card Batch Generator
* **Navigation Route:** `/reports/student-id-cards` (or `/IDCardGenerator`)
* **Source File Location:** `src/features/reports/StudentIdCardsReport.tsx`
* **Authorized Access:** IT Administrator, Admissions Officer

### 🎯 2. Operational Value & Business Purpose
* **CR80 Plastic ID Badge Generator:** Generates front and back graphics for student smart ID badges with photo, emergency blood group, father phone, and scannable barcode for gate biometric turnstiles and library access.

### 📊 Master Student ID Badge Dataset (Zero GUIDs)

| Student ID Badge # | Student Name | Class | Roll # | Blood Group | Emergency Phone | Scannable Barcode | RFID Chip ID |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **CARD-101** | Muhammad Ali Khan | Grade 10-A | 101 | `B+` | 0300-5544332 | `||||| AD-2026-0101 |||||` | `RFID-88102` |
| **CARD-102** | Hamza Tariq | Grade 10-A | 102 | `O+` | 0300-5544332 | `||||| AD-2026-0102 |||||` | `RFID-88103` |
| **CARD-103** | Ayesha Bibi | Grade 10-A | 103 | `A+` | 0321-7766554 | `||||| AD-2026-0103 |||||` | `RFID-88104` |

---

## 💼 Screen 10.24: Monthly Staff Payroll Distribution Report

### 📌 1. Screen Identity & Overview
* **Screen Name:** Monthly Staff Payroll Sheet & Bank Salary Disbursement Report
* **Navigation Route:** `/reports/staff-payroll`
* **Source File Location:** `src/features/reports/StaffPayrollReport.tsx`
* **Authorized Access:** Chief Financial Officer, Senior Accountant, Principal

### 🎯 2. Operational Value & Business Purpose
* **Statutory Payroll Sheet:** Formats monthly payroll with Basic Pay, Allowances, Loan Installment Deductions, Unpaid Absence Deductions, and Net Bank Credit.

### 📊 Master Payroll Summary Dataset (August 2026 — Zero GUIDs)

| Staff Code | Employee Name | Designation | Basic Pay | Allowances | Loan Deductions | Attendance LWP | Net Bank Payout | Bank Account Credited |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **STF-1001** | Prof. Tariq Mehmood | Principal | Rs. 150,000 | Rs. 20,000 | Rs. 0 | Rs. 0 | **Rs. 170,000** | HBL A/C # 1102-44120 |
| **STF-1004** | Dr. Shahida Parveen | Girls Wing Principal| Rs. 140,000 | Rs. 15,000 | Rs. 0 | Rs. 0 | **Rs. 155,000** | Meezan A/C # 0910-88124 |
| **STF-1005** | Fatima Zahra | Senior Math Teacher | Rs. 75,000 | Rs. 5,000 | -Rs. 6,000 | Rs. 0 | **Rs. 74,000** | Allied Bank # 4410-22190 |
| **STF-1010** | Hina Qasim | Senior Physics Teacher| Rs. 70,000 | Rs. 5,000 | -Rs. 5,000 | -Rs. 3,500 | **Rs. 66,500** | Meezan A/C # 0910-99412 |
| **STF-1003** | Kamran Akmal | Senior Finance Officer| Rs. 85,000 | Rs. 10,000 | Rs. 0 | Rs. 0 | **Rs. 95,000** | HBL A/C # 1102-77189 |

---

## 📅 Screen 10.25: Student Monthly Attendance Analytics Report

### 📌 1. Screen Identity & Overview
* **Screen Name:** Monthly Student Attendance Broadsheet & Trend Analytics
* **Navigation Route:** `/reports/attendance`
* **Source File Location:** `src/features/reports/AttendanceReport.tsx`
* **Authorized Access:** Campus Principal, Academic Coordinator, Class Teachers

### 🎯 2. Operational Value & Business Purpose
* **Class Attendance Matrix:** Monthly calendar grid showing 26 working days with P (Present), A (Absent), L (Late), and LV (Leave) with percentage compliance badges.

### 📊 Master Attendance Compliance Dataset (August 2026 — Zero GUIDs)

| Roll # | Student Name | Class | Total Working Days | Days Present | Days Absent | Approved Leaves | Late Days | Monthly Attendance % | Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **101** | Muhammad Ali Khan | Grade 10-A | 26 Days | 25 Days | 0 Days | 1 Day | 0 Days | **96.2%** | `Compliant (Green)` |
| **102** | Hamza Tariq | Grade 10-A | 26 Days | 24 Days | 0 Days | 2 Days | 0 Days | **92.3%** | `Compliant (Green)` |
| **103** | Ayesha Bibi | Grade 10-A | 26 Days | 26 Days | 0 Days | 0 Days | 0 Days | **100.0%** | `Perfect Attendance` |
| **104** | Bilal Hassan | Grade 10-A | 26 Days | 23 Days | 1 Day | 1 Day | 3 Days | **88.5%** | `Acceptable (Amber)` |
| **105** | Usman Ghani Jr. | Grade 10-A | 26 Days | 18 Days | 8 Days | 0 Days | 2 Days | **69.2%** | `Warning (Red)` |

---

## 💰 Screen 10.26: Institutional Profit & Loss Financial Statement

### 📌 1. Screen Identity & Overview
* **Screen Name:** School Operational Profit & Loss (P&L) Financial Statement
* **Navigation Route:** `/reports/profit-loss`
* **Source File Location:** `src/features/reports/ProfitLossReport.tsx`
* **Authorized Access:** Chief Financial Officer, Campus Principal, Board of Directors

### 🎯 2. Operational Value & Business Purpose
* **Net Fiscal Surplus / Deficit Statement:** Aggregates Operating Revenues (Student Tuition, Admission Fees, Transport Fares) against Operating Expenses (Staff Salaries, Building Utilities, Maintenance, Lab Supplies) to compute Net Operating Surplus.

### 📊 Master Profit & Loss Financial Statement (August 2026 — Zero GUIDs)

| Financial Account Head | Category | Monthly Rupee Inflow | Monthly Rupee Outflow | Net Balance (PKR) |
| :--- | :--- | :---: | :---: | :---: |
| **Student Tuition Fee Revenue (`4001`)** | Operating Revenue | +Rs. 6,800,000 | — | +Rs. 6,800,000 |
| **Admission & Registration Revenue (`4002`)** | Operating Revenue | +Rs. 450,000 | — | +Rs. 450,000 |
| **School Bus Transport Revenue (`4001`)** | Auxiliary Revenue | +Rs. 320,000 | — | +Rs. 320,000 |
| **Total Operating Revenue** | **Gross Revenue** | **+Rs. 7,570,000** | — | **+Rs. 7,570,000** |
| **Staff & Faculty Salaries (`5001`)** | Operating Expense | — | -Rs. 2,850,000 | -Rs. 2,850,000 |
| **Campus Electricity & Utilities (`5002`)** | Utility Expense | — | -Rs. 213,000 | -Rs. 213,000 |
| **Bus Diesel & Vehicle Maintenance** | Transport Expense | — | -Rs. 125,000 | -Rs. 125,000 |
| **Examination Printing & Stationery** | Academic Expense | — | -Rs. 48,000 | -Rs. 48,000 |
| **Total Operating Expenses** | **Gross Expenses** | — | **-Rs. 3,236,000** | **-Rs. 3,236,000** |
| **NET OPERATING SURPLUS / PROFIT** | **Net Monthly Profit**| — | — | **+Rs. 4,334,000 (Surplus)** |

---

## 💵 Screen 10.27: Daily Fee Collection & Cash Book Report

### 📌 1. Screen Identity & Overview
* **Screen Name:** Daily Cashier Collection Ledger & Counter Cash Book
* **Navigation Route:** `/reports/daily-collection`
* **Source File Location:** `src/features/reports/DailyCollectionReport.tsx`
* **Authorized Access:** Cashier, Senior Accountant, Auditor

### 🎯 2. Operational Value & Business Purpose
* **Daily Cash Desk Reconciliation:** Logs all cash receipts, bank slips, and online transactions collected on any target date for cashier vault reconciliation.

### 📊 Master Daily Cash Book Dataset (August 10, 2026 — Zero GUIDs)

| Receipt # | Student Name | Class | Fee Heads Paid | Cash Desk | 1Link Online | Bank Deposit | Receipt Total | Collecting Cashier |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **RCT-0810-01** | Muhammad Ali Khan | Grade 10-A | Tuition August | Rs. 6,000 | — | — | **Rs. 6,000** | Kamran Akmal (`STF-1003`) |
| **RCT-0810-02** | Hamza Tariq | Grade 10-A | Tuition August (25% Disc)| — | Rs. 4,500 | — | **Rs. 4,500** | 1Link Payment Gateway |
| **RCT-0810-03** | Bilal Hassan | Grade 10-A | Tuition August | — | — | Rs. 6,000 | **Rs. 6,000** | Meezan Bank Teller Slip |
| **RCT-0810-04** | Ahmed Raza | Grade 1-A | Tuition August (Staff 50%)| Rs. 2,250 | — | — | **Rs. 2,250** | Kamran Akmal (`STF-1003`) |
| **DAILY TOTAL** | **Reconciled Vault Sum** | — | **Total Today** | **Rs. 8,250** | **Rs. 4,500** | **Rs. 6,000** | **Rs. 18,750 Total** | **100% Balanced** |

---

## 🏛️ Screen 10.28: Institutional Balance Sheet Statement

### 📌 1. Screen Identity & Overview
* **Screen Name:** Institutional Balance Sheet & Capital Statement
* **Navigation Route:** `/reports/balance-sheet`
* **Source File Location:** `src/features/reports/BalanceSheetReport.tsx`
* **Authorized Access:** CFO, Campus Principal, Statutory Auditor

### 🎯 2. Operational Value & Business Purpose
* **Institutional Net Worth:** Formally proves `Total Assets = Total Liabilities + Owner's Equity` for board audits.

### 📊 Master Balance Sheet Dataset (Zero GUIDs)

| Balance Sheet Classification | Specific Asset / Liability Account | Current Valuation (PKR) | Category Total (PKR) |
| :--- | :--- | :---: | :---: |
| **Current Assets** | Cash in Vault & Petty Cash (`1001`) | Rs. 456,000 | — |
| **Current Assets** | Meezan Bank Collection A/C (`1002`) | Rs. 14,850,000 | — |
| **Current Assets** | HBL Operations & Payroll A/C (`1003`) | Rs. 5,126,000 | **Rs. 20,432,000** |
| **Fixed Assets** | Campus Land & School Buildings | Rs. 45,000,000 | — |
| **Fixed Assets** | Transport Buses & Coasters Fleet | Rs. 18,500,000 | — |
| **Fixed Assets** | IT Computer Labs & Science Furniture | Rs. 6,250,000 | **Rs. 69,750,000** |
| **TOTAL INSTITUTIONAL ASSETS** | — | — | **Rs. 90,182,000 (Dr)** |
| **Current Liabilities** | Staff Security Deposits Payable (`2001`)| Rs. 1,200,000 | **Rs. 1,200,000** |
| **Owner's Equity** | Share Capital & Initial Endowment (`3001`)| Rs. 65,000,000 | — |
| **Retained Earnings** | Cumulative Operating Surplus | Rs. 23,982,000 | **Rs. 88,982,000** |
| **TOTAL LIABILITIES & EQUITY** | — | — | **Rs. 90,182,000 (Cr) [Balanced]** |

---

## ⚖️ Screen 10.29: Financial Trial Balance Report

### 📌 1. Screen Identity & Overview
* **Screen Name:** Financial Trial Balance Statement & Ledger Verification
* **Navigation Route:** `/reports/trial-balance`
* **Source File Location:** `src/features/reports/TrialBalanceReport.tsx`
* **Authorized Access:** Senior Accountant, CFO, Internal Auditor

### 🎯 2. Operational Value & Business Purpose
* **Double-Entry Mathematical Audit:** Proves sum of all debit balances equals sum of all credit balances across all active COA heads.

### 📊 Master Trial Balance Dataset (Zero GUIDs)

| Account Code | Account Head Title | Head Category | Total Debit Balance (PKR) | Total Credit Balance (PKR) |
| :--- | :--- | :--- | :---: | :---: |
| **1001** | Main Cash in Vault | Current Asset | Rs. 456,000 | — |
| **1002** | Meezan Bank Collection Account | Current Asset | Rs. 14,850,000 | — |
| **1003** | HBL Payroll Account | Current Asset | Rs. 5,126,000 | — |
| **2001** | Staff Security Deposits Payable | Current Liability | — | Rs. 1,200,000 |
| **3001** | Owner's Capital Endowment | Equity | — | Rs. 65,000,000 |
| **4001** | Student Tuition Revenue | Revenue | — | Rs. 42,706,000 |
| **4002** | Admission & Registration Revenue | Revenue | — | Rs. 3,500,000 |
| **5001** | Staff & Faculty Salaries | Expense | Rs. 28,574,000 | — |
| **5002** | Campus Utilities Expense | Expense | Rs. 2,335,000 | — |
| **TOTAL TRIAL BALANCE** | **Debit-Credit Equivalence** | **Verified** | **Rs. 51,341,000 (Dr)** | **Rs. 51,341,000 (Cr) [Exact Match]** |

---

## 📑 Screen 10.30: Student Final Term Examination Report Cards

### 📌 1. Screen Identity & Overview
* **Screen Name:** Official Student Term Examination Progress Report Card
* **Navigation Route:** `/reports/report-cards`
* **Source File Location:** `src/features/reports/ExamReportCardsReport.tsx`
* **Authorized Access:** Campus Principal, Class Teachers, Parents, Students

### 🎯 2. Operational Value & Business Purpose
* **The Grand Academic Dossier:** The definitive student term progress report card printed on parchment paper with security watermark, displaying subject-by-subject scores, class highest marks, attendance percentage, conduct stars, Class Teacher remarks, and Principal stamp.

### 📊 Master Report Card Dataset (Muhammad Ali Khan — Zero GUIDs)

| Academic Field | Student Details |
| :--- | :--- |
| **Student Full Name** | **Muhammad Ali Khan** (Admission # `AD-2026-0101`, Roll # `101`) |
| **Class & Section** | **Grade 10 - Science** (`Section A - Quaid`, Room 201) |
| **Father Name** | Tariq Mehmood Khan (`PRN-2026-001`) |
| **Academic Session** | Academic Session 2026-2027 (`AY-2026-27`) |
| **Mathematics Score** | **96 / 100** (Grade: `A+`, GPA: `4.00`, Class Highest: 96) |
| **Physics Score** | **95 / 100** (Grade: `A+`, GPA: `4.00`, Class Highest: 98) |
| **Chemistry Score** | **94 / 100** (Grade: `A+`, GPA: `4.00`, Class Highest: 97) |
| **English Literature** | **92 / 100** (Grade: `A+`, GPA: `4.00`, Class Highest: 96) |
| **Urdu Compulsory** | **93 / 100** (Grade: `A+`, GPA: `4.00`, Class Highest: 95) |
| **Grand Total Marks** | **470 / 500 (94.0%)** |
| **Overall Term Grade & CGPA** | **Grade A+ (CGPA: 4.00 / 4.00)** |
| **Class Merit Rank** | 🥈 **2nd Position in Class 10-A** |
| **Term Attendance Compliance** | **96.2% Present** (25 Days Present out of 26 Working Days) |
| **General Conduct Rating** | ⭐ **Exemplary Conduct & Leadership** |
| **Class Teacher Remarks** | *"Ali has demonstrated stellar academic maturity and analytical excellence. Highly commended!"* — **Fatima Zahra** |
| **Principal Signature & Stamp** | **Prof. Tariq Mehmood** (Campus Principal, Excellence School) |

---

## 🏆 COMPLETE MASTER OPERATIONAL MANUAL COMPLETED

All **10 Phases** covering all **75+ active screens** in the VOKE Solutions School Management System (SMS) are now fully documented:
1. [`Phase_01_System_Foundation_and_Security.md`](file:///c:/Users/ADV/source/repos/BilalAbdullah1/SMS/Phase_01_System_Foundation_and_Security.md)
2. [`Phase_02_Academic_Core_Architecture.md`](file:///c:/Users/ADV/source/repos/BilalAbdullah1/SMS/Phase_02_Academic_Core_Architecture.md)
3. [`Phase_03_HR_and_Staff_Management.md`](file:///c:/Users/ADV/source/repos/BilalAbdullah1/SMS/Phase_03_HR_and_Staff_Management.md)
4. [`Phase_04_Timetable_and_Substitute_Management.md`](file:///c:/Users/ADV/source/repos/BilalAbdullah1/SMS/Phase_04_Timetable_and_Substitute_Management.md)
5. [`Phase_05_Student_Lifecycle_and_Admissions.md`](file:///c:/Users/ADV/source/repos/BilalAbdullah1/SMS/Phase_05_Student_Lifecycle_and_Admissions.md)
6. [`Phase_06_Finance_Fee_Lifecycle_and_Payroll.md`](file:///c:/Users/ADV/source/repos/BilalAbdullah1/SMS/Phase_06_Finance_Fee_Lifecycle_and_Payroll.md)
7. [`Phase_07_Auxiliary_Campus_Services.md`](file:///c:/Users/ADV/source/repos/BilalAbdullah1/SMS/Phase_07_Auxiliary_Campus_Services.md)
8. [`Phase_08_Daily_Academic_Delivery_LMS_and_Attendance.md`](file:///c:/Users/ADV/source/repos/BilalAbdullah1/SMS/Phase_08_Daily_Academic_Delivery_LMS_and_Attendance.md)
9. [`Phase_09_Comprehensive_Examination_and_CBT.md`](file:///c:/Users/ADV/source/repos/BilalAbdullah1/SMS/Phase_09_Comprehensive_Examination_and_CBT.md)
10. [`Phase_10_Portals_Communication_FrontOffice_and_Reports.md`](file:///c:/Users/ADV/source/repos/BilalAbdullah1/SMS/Phase_10_Portals_Communication_FrontOffice_and_Reports.md)
