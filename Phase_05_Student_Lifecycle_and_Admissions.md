# 🏫 VOKE Solutions SMS — Phase 5: Student Lifecycle, Inquiries & Admissions

> **System:** VOKE Solutions School Management System (SMS)  
> **Phase Target:** Phase 5 — Public Inquiries, Admissions Portal, Student Enrollment, Master Directory, Parents, House System & Annual Promotions  
> **Documentation Style:** Point-to-Point Step-by-Step Guide with Clean Data Tables  
> **Language:** English  
> **Data Integrity:** 100% Relational Human-Readable Dataset — **Zero Raw GUIDs (Fully Linked to Phase 1, Phase 2, Phase 3 & Phase 4)**

---

## 📑 Phase 5 Navigation Overview

* [Screen 5.1: Public Online Admission Portal (`/PublicAdmissionPortal`)](#-screen-51-public-online-admission-portal)
* [Screen 5.2: Admission Inquiries & Lead Management (`/AdmissionEnquiries`)](#-screen-52-admission-inquiries--lead-management)
* [Screen 5.3: Student Enrollment & Multi-Step Wizard (`/StudentEnrollments`)](#-screen-53-student-enrollment--multi-step-wizard)
* [Screen 5.4: Student Master Directory & Dossier (`/students`)](#-screen-54-student-master-directory--dossier)
* [Screen 5.5: Parent Directory & Family Links (`/parents`)](#-screen-55-parent-directory--family-links)
* [Screen 5.6: Student Behavior Logs & Discipline Points (`/StudentBehaviorLogs`)](#-screen-56-student-behavior-logs--discipline-points)
* [Screen 5.7: School House System & Leaderboards (`/HouseSystemDashboard`)](#-screen-57-school-house-system--leaderboards)
* [Screen 5.8: Student Leave Applications (`/StudentLeaveApplication`)](#-screen-58-student-leave-applications)
* [Screen 5.9: Student Annual Promotions & Class Rollover (`/StudentPromotions`)](#-screen-59-student-annual-promotions--class-rollover)
* [Screen 5.10: Alumni & Graduated Students Directory (`/AlumniDirectory`)](#-screen-510-alumni--graduated-students-directory)

---

## 🌐 Screen 5.1: Public Online Admission Portal

### 📌 1. Screen Identity & Overview
* **Screen Name:** Public Online Student Registration & Application Portal
* **Navigation Route:** `/PublicAdmissionPortal` (Publicly accessible URL for parents)
* **Source File Location:** `src/features/student-attendance/PublicAdmissionPortal.tsx`
* **Authorized Access:** Public (Parents & Prospective Students - No Login Required)

### 🎯 2. Operational Value & Business Purpose
* **Digital Front Desk:** Allows parents to apply for admission online from home via a responsive multi-step wizard.
* **Instant Tracking Reference:** Generates a unique tracking token (e.g., `APP-2026-0842`) for parents to check test/interview schedules.
* **Eliminates Manual Paper Entry:** Submitted public applications flow directly into the school's administrative inquiry queue for verification.

### 📝 3. Form Fields & Input Information
* **Child Personal Details:** Full Name, Date of Birth, Gender, B-Form / Birth Certificate #.
* **Parent / Guardian Details:** Father's Full Name, Father CNIC, Mother Name, Primary WhatsApp Contact, Home Address.
* **Target Grade:** Select applying class (e.g., *Grade 10 - Science*, *Montessori Junior*).
* **Previous School History:** Last school attended, previous grade, and total obtained marks %.
* **Uploads:** Scanned B-Form copy and recent passport-size photo.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Public Navigation:** Parent visits `yourschool.edu.pk/PublicAdmissionPortal`.
2. **Step 1 (Child Info):** Parent enters child's name, DOB, gender, and B-form number.
3. **Step 2 (Parent Info):** Parent enters father's name, CNIC, and WhatsApp phone.
4. **Step 3 (Class & History):** Select target class and previous school background.
5. **Step 4 (Submission & Reference):**
   * Click **"Submit Online Application"**.
   * System displays a digital receipt with tracking code `APP-2026-0842` and sends SMS confirmation.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Application # | Child Name | Applying For Class | Father / Guardian Name | Guardian Phone | Previous School Attended | Application Date | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **APP-2026-0841** | Muhammad Ali Khan | Grade 10 - Science | Tariq Mehmood Khan | 0300-1122334 | Beaconhouse School System | 2026-08-10 | `Accepted & Enrolled` |
| **APP-2026-0842** | Hamza Tariq | Grade 10 - Science | Tariq Mehmood Khan | 0300-1122334 | Beaconhouse School System | 2026-08-10 | `Accepted & Enrolled` |
| **APP-2026-0843** | Ayesha Bibi | Grade 10 - Science | Farooq Ahmed | 0321-4455667 | Army Public School | 2026-08-12 | `Accepted & Enrolled` |
| **APP-2026-0844** | Bilal Hassan | Grade 10 - Science | Hassan Mehmood | 0333-8899001 | Islamabad Model College | 2026-08-14 | `Accepted & Enrolled` |
| **APP-2026-0845** | Usman Ghani Jr. | Grade 10 - Science | Usman Ghani | 0345-2233112 | Lahore Grammar School | 2026-08-15 | `Accepted & Enrolled` |
| **APP-2026-0846** | Zainab Fatima | Grade 9 - Science | Farooq Ahmed | 0321-4455667 | Army Public School | 2026-08-16 | `Accepted & Enrolled` |
| **APP-2026-0847** | Ahmed Raza | Grade 1 | Raza Ali | 0312-5566778 | Froebel's International | 2026-08-18 | `Accepted & Enrolled` |

---

## 📞 Screen 5.2: Admission Inquiries & Lead Management

### 📌 1. Screen Identity & Overview
* **Screen Name:** Admission Inquiries, Walk-In Leads & Assessment Desk
* **Navigation Route:** `/AdmissionEnquiries`
* **Source File Location:** `src/features/student-attendance/AdmissionEnquiries.tsx`
* **Authorized Access:** Admissions Officer, Front Desk Receptionist, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Prospect Pipeline:** Tracks walk-in queries, phone calls, and web leads interested in school admissions.
* **Assessment & Test Scheduling:** Manages entrance test schedules, written assessment scores, and principal interview remarks.
* **One-Click Enrollment Conversion:** Converts qualified prospective students directly into enrolled students without re-entering data.

### 📝 3. Form Fields & Input Information
* **Prospect Name & Age:** Full name and age of the student.
* **Applying Class:** Target grade level.
* **Guardian Contact Details:** Parent name, CNIC, and phone number.
* **Inquiry Source:** Walk-in, Referral, Social Media, Newspaper Ad, Website.
* **Entrance Test Marks:** Written assessment score (e.g., `85 / 100`).
* **Inquiry Status:** `New Lead`, `Test Scheduled`, `Passed & Offered`, `Enrolled`, `Rejected`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Inquiries Pipeline:** Check top cards showing Total Inquiries, Tests Scheduled, Offers Accepted, and Enrollment Rate.
2. **Log Walk-In Inquiry:** Click **"+ Log New Inquiry"** and record parent queries.
3. **Record Entrance Assessment:** Enter written test and interview scores.
4. **Convert to Enrolled Student (`...`):**
   * Click **"Convert to Enrollment"** on an accepted lead.
   * Auto-populates all student and parent details into Screen 5.3 (Student Enrollment).

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Inquiry # | Student Name | Target Class | Parent Name | Phone Number | Entrance Test Score | Inquiry Status | Follow-Up Date |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **INQ-2026-101** | Muhammad Ali Khan | Grade 10 - Science | Tariq Mehmood Khan | 0300-1122334 | 92 / 100 (A+) | `Converted / Enrolled` | Enrolled |
| **INQ-2026-102** | Hamza Tariq | Grade 10 - Science | Tariq Mehmood Khan | 0300-1122334 | 88 / 100 (A) | `Converted / Enrolled` | Enrolled |
| **INQ-2026-103** | Ayesha Bibi | Grade 10 - Science | Farooq Ahmed | 0321-4455667 | 95 / 100 (A+) | `Converted / Enrolled` | Enrolled |
| **INQ-2026-104** | Danyal Qureshi | Grade 8 | Farhan Qureshi | 0300-5544332 | 78 / 100 (B) | `Offer Letter Sent` | 2026-08-30 |
| **INQ-2026-105** | Fatima Noor | Grade 1 | Dr. Naveed Akhtar | 0333-6677889 | 90 / 100 (A+) | `Test Scheduled` | 2026-09-01 |

---

## 📝 Screen 5.3: Student Enrollment & Multi-Step Wizard

### 📌 1. Screen Identity & Overview
* **Screen Name:** Formal Student Enrollment & Section Assignment
* **Navigation Route:** `/StudentEnrollments`
* **Source File Location:** `src/features/student-attendance/StudentEnrollments.tsx`
* **Authorized Access:** Admissions Officer, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Official Matriculation:** Issues the official **Admission Number** (e.g., `AD-2026-0101`) and assigns the student to an active Academic Year, Class, Section, and Roll Number.
* **Capacity Safeguard:** Checks Section Max Capacity (from Screen 2.3) and prevents over-enrollment.
* **Fee Structure Binding:** Enrollment automatically triggers Phase 6 fee voucher generation.

### 📝 3. Form Fields & Input Information
* **Student Identification:** Select registered student from database or create new.
* **Academic Session:** Select active year (e.g., `AY-2026-27`).
* **Class & Section:** Choose class (e.g., `Grade 10 - Science`) and section (`Section A`).
* **Roll Number:** Numeric classroom seat identifier (e.g., `101`, `102`).
* **Enrollment Status:** `Active`, `Transferred`, `Promoted`, `Dropped`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Launch Enrollment Wizard:** Click **"+ New Student Enrollment"**.
2. **Select Student & Class:** Choose student name, select Class and Section.
3. **Assign Roll Number:** System auto-suggests next available roll number in that section.
4. **Submit Enrollment:** Click **"Enroll Student"**.
5. **Print Documentation:** Click **"Print Enrollment Slip"** and **"Print Admission Order"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Admission # | Roll Number | Student Full Name | Enrolled Class | Assigned Section | Assigned Room | Academic Session | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **AD-2026-0101** | **101** | Muhammad Ali Khan | Grade 10 - Science | Section A (Quaid) | Room 201 | AY-2026-27 | `Active` |
| **AD-2026-0102** | **102** | Hamza Tariq | Grade 10 - Science | Section A (Quaid) | Room 201 | AY-2026-27 | `Active` |
| **AD-2026-0103** | **103** | Ayesha Bibi | Grade 10 - Science | Section A (Quaid) | Room 201 | AY-2026-27 | `Active` |
| **AD-2026-0104** | **104** | Bilal Hassan | Grade 10 - Science | Section A (Quaid) | Room 201 | AY-2026-27 | `Active` |
| **AD-2026-0105** | **105** | Usman Ghani Jr. | Grade 10 - Science | Section A (Quaid) | Room 201 | AY-2026-27 | `Active` |
| **AD-2026-0106** | **201** | Zainab Fatima | Grade 9 - Science | Section A (Sir Syed) | Room 105 | AY-2026-27 | `Active` |
| **AD-2026-0107** | **301** | Ahmed Raza | Grade 1 | Section A (Sunflowers) | Room G-02 | AY-2026-27 | `Active` |
| **AD-2026-0108** | **101** | Omer Farooq | Grade 10 - Science | Section B (Iqbal) | Room 202 | AY-2026-27 | `Active` |

---

## 🎒 Screen 5.4: Student Master Directory & Dossier

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Master Directory & 360-Degree Dossier
* **Navigation Route:** `/students`
* **Source File Location:** `src/features/students/StudentDirectory.tsx`
* **Authorized Access:** Campus Principal, Academic Teachers, Admissions Officer, Cashier

### 🎯 2. Operational Value & Business Purpose
* **360° Student Dossier:** Complete institutional profile containing academic grades, fee history, biometric attendance %, medical records, and family links.
* **Identity Documents & Photos:** Stores B-Form numbers, emergency medical blood groups, and passport photos.
* **School Leaving Certificates (SLC):** Issues transfer certificates with automatic fee dues clearance verification.

### 📝 3. Form Fields & Input Information
* **B-Form / Birth Cert #:** 13-digit National ID (e.g., `37405-1112233-1`).
* **Personal Details:** First Name, Last Name, Gender, DOB, Blood Group (e.g., `B+`).
* **Father & Guardian Info:** Father Name, Father CNIC, Emergency WhatsApp Phone.
* **Medical Profile:** Chronic allergies, emergency contact doctor, physical handicap notes.
* **Profile Photo:** Passport photo uploaded via `<ImageUpload>`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Search & Filter:** Search by student name, roll number, or filter by Class / Section.
2. **Open 360° Profile:** Click any student row to slide open `<StudentProfileDrawer>` with tabs for *Academics*, *Fee Challans*, *Attendance*, and *Behavior*.
3. **Edit Dossier:** Update emergency phone number or medical allergies.
4. **Issue Transfer Certificate:** In `<StudentActionMenu>`, click **"Generate SLC Certificate"** (validates fee clearance first).

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Admission # | Roll # | Student Name | Class & Section | Father Name | Guardian Phone | Blood Group | B-Form # | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **AD-2026-0101** | 101 | Muhammad Ali Khan | Grade 10-A | Tariq Mehmood Khan | 0300-1122334 | `B+` | 37405-1112233-1 | `Active` |
| **AD-2026-0102** | 102 | Hamza Tariq | Grade 10-A | Tariq Mehmood Khan | 0300-1122334 | `O+` | 37405-2223344-1 | `Active` |
| **AD-2026-0103** | 103 | Ayesha Bibi | Grade 10-A | Farooq Ahmed | 0321-4455667 | `A+` | 37405-3334455-2 | `Active` |
| **AD-2026-0104** | 104 | Bilal Hassan | Grade 10-A | Hassan Mehmood | 0333-8899001 | `AB+`| 37405-4445566-1 | `Active` |
| **AD-2026-0105** | 105 | Usman Ghani Jr. | Grade 10-A | Usman Ghani | 0345-2233112 | `B-` | 37405-5556677-1 | `Active` |
| **AD-2026-0106** | 201 | Zainab Fatima | Grade 9-A | Farooq Ahmed | 0321-4455667 | `A+` | 37405-6667788-2 | `Active` |
| **AD-2026-0107** | 301 | Ahmed Raza | Grade 1-A | Raza Ali | 0312-5566778 | `O+` | 37405-7778899-1 | `Active` |
| **AD-2026-0108** | 101 | Omer Farooq | Grade 10-B | Farooq Mehmood | 0301-9988776 | `B+` | 37405-8889900-1 | `Active` |

---

## 👨‍👩‍👧 Screen 5.5: Parent Directory & Family Links

### 📌 1. Screen Identity & Overview
* **Screen Name:** Parent Directory & Sibling Relationship Hub
* **Navigation Route:** `/parents`
* **Source File Location:** `src/features/parents/ParentDirectory.tsx`
* **Authorized Access:** Campus Principal, Admissions Officer, Finance Officer

### 🎯 2. Operational Value & Business Purpose
* **Family Linking & Sibling Consolidation:** Links multiple children from the same household (e.g., Muhammad Ali Khan in 10-A and Hamza Tariq in 10-A) to one Parent Account (`PRN-2026-001`).
* **Automated Sibling Concessions:** Feeds sibling links directly to Screen 6.5 (Fee Concessions) for automated multi-child discounts.
* **Single Parent Login:** Allows a parent with 3 enrolled children to view all report cards and pay fee challans from a single mobile login.

### 📝 3. Form Fields & Input Information
* **Parent Code:** Unique family master code (e.g., `PRN-2026-001`).
* **Father / Guardian Name & CNIC:** Verified 13-digit identity.
* **Mother Name & CNIC:** Mother's official details.
* **Primary Mobile / WhatsApp:** Official number for emergency automated SMS broadcasts.
* **Linked Children:** List of enrolled students tied to this family dossier.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Search Families:** Search by parent CNIC, father name, or mobile phone.
2. **Link New Sibling:**
   * Open `<ParentDrawer>` for a family.
   * Click **"Add Child to Family"** and select student admission number.
3. **Trigger Portal Activation:** Click **"Send Parent Portal Activation SMS"** to send username and password to parent's phone.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Parent Code | Father / Guardian Name | National CNIC | Primary WhatsApp | Occupation | Total Children Enrolled | Linked Student Names & Classes |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **PRN-2026-001** | Tariq Mehmood Khan | 37405-1122334-1 | 0300-1122334 | Businessman | **2 Students** | Muhammad Ali (10-A), Hamza Tariq (10-A) |
| **PRN-2026-002** | Farooq Ahmed | 37405-2233445-1 | 0321-4455667 | Civil Engineer | **2 Students** | Ayesha Bibi (10-A), Zainab Fatima (9-A) |
| **PRN-2026-003** | Hassan Mehmood | 37405-3344556-1 | 0333-8899001 | Banker | **1 Student** | Bilal Hassan (10-A) |
| **PRN-2026-004** | Usman Ghani | 37405-4455667-1 | 0345-2233112 | Chartered Accountant | **1 Student** | Usman Ghani Jr. (10-A) |
| **PRN-2026-005** | Raza Ali | 37405-5566778-1 | 0312-5566778 | Government Officer | **1 Student** | Ahmed Raza (1-A) |
| **PRN-2026-006** | Farooq Mehmood | 37405-6677889-1 | 0301-9988776 | Advocate Supreme Court | **1 Student** | Omer Farooq (10-B) |

---

## ⚖️ Screen 5.6: Student Behavior Logs & Discipline Points

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Behavior Logs & Discipline Point System
* **Navigation Route:** `/StudentBehaviorLogs`
* **Source File Location:** `src/features/students/StudentBehaviorLogs.tsx`
* **Authorized Access:** Class Teachers, Discipline Committee, Principal

### 🎯 2. Operational Value & Business Purpose
* **Merit & Demerit Points:** Awards positive points for academic excellence, leadership, and sportsmanship (+10 points) or demerits for late arrival and indiscipline (-10 points).
* **House Trophy Integration:** Positive and negative points directly affect the inter-house championship leaderboard on Screen 5.7.
* **Parent Transparency:** Critical disciplinary incidents automatically send instant alerts to parent dashboards.

### 📝 3. Predefined Incidents & Point Rules
* **Outstanding Project Work:** `+10 Points (Positive Merit)`
* **Extracurricular Achievement:** `+15 Points (Positive Merit)`
* **Helping Another Student:** `+5 Points (Positive Merit)`
* **Late Arrival to Class:** `-5 Points (Demerit)`
* **Incomplete Homework:** `-5 Points (Demerit)`
* **Disruptive Classroom Behavior:** `-10 Points (Demerit)`
* **Bullying / Physical Altercation:** `-20 Points (Demerit + Parent Call)`

### ⚙️ 4. Step-by-Step Operator Guide
1. **Log Disciplinary Event:** Click **"+ Log Incident"**.
2. **Select Student & Incident:** Choose student (`Muhammad Ali Khan - 10-A`) and select incident type from dropdown.
3. **Enter Action Taken:** Specify teacher counseling, detention, or certificate awarded.
4. **Save & Notify:** System logs the points and dispatches parent notification.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Log Code | Student Name | Class | Incident Logged | Points Impact | Action Taken | Reporting Teacher |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **BEH-2026-01** | Muhammad Ali Khan | Grade 10-A | Outstanding Project Work | `+10 Points` | Awarded Star of the Week | Fatima Zahra (`STF-1005`) |
| **BEH-2026-02** | Ayesha Bibi | Grade 10-A | Extracurricular Achievement | `+15 Points` | 1st Position in Debate Contest | Fatima Zahra (`STF-1005`) |
| **BEH-2026-03** | Usman Ghani Jr. | Grade 10-A | Disruptive Behavior in Class | `-10 Points` | Counseling & Warning Letter | Hina Qasim (`STF-1010`) |
| **BEH-2026-04** | Hamza Tariq | Grade 10-A | Helping Another Student | `+5 Points` | Commendation in Assembly | Fatima Zahra (`STF-1005`) |
| **BEH-2026-05** | Bilal Hassan | Grade 10-A | Late Arrival to School | `-5 Points` | Gate Pass Warning Issued | Muhammad Rashid (`STF-1006`) |

---

## 🏆 Screen 5.7: School House System & Leaderboards

### 📌 1. Screen Identity & Overview
* **Screen Name:** School House System & Inter-House Championship Leaderboard
* **Navigation Route:** `/HouseSystemDashboard`
* **Source File Location:** `src/features/academics/HouseSystemDashboard.tsx`
* **Authorized Access:** All Teachers, House Captains, Students, Principal

### 🎯 2. Operational Value & Business Purpose
* **Fosters School Spirit & Co-Curricular Engagement:** Allocates students and faculty to 4 traditional houses (*Jinnah Blue*, *Iqbal Green*, *Sir Syed Red*, *Liaquat Yellow*).
* **Live Championship Leaderboard:** Aggregates points earned from sports galas, debate contests, quizzes, and daily classroom merits.
* **Annual Trophy Award:** Automatically calculates the champion house at the annual sports and prize distribution ceremony.

### 📝 3. Screen Metrics & House Attributes
* **Jinnah House (Blue):** Motto: *Unity, Faith, Discipline* | House Master: Fatima Zahra (`STF-1005`).
* **Iqbal House (Green):** Motto: *Self-Realization & Wisdom* | House Master: Hina Qasim (`STF-1010`).
* **Sir Syed House (Red):** Motto: *Knowledge is Power* | House Master: Asad Ullah Khan (`STF-1009`).
* **Liaquat House (Yellow):** Motto: *Service & Sacrifice* | House Master: Muhammad Rashid (`STF-1006`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **View Live Leaderboard:** Inspect real-time rankings and cumulative points breakdown.
2. **Assign Student to House:** During enrollment (Screen 5.3), select house affiliation.
3. **Award Event Points:** Click **"+ Award House Points"** after inter-house football or quiz competitions.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| House Name | House Color | Appointed House Master | Student Strength | Academic Points | Sports Points | Total Points | Current Rank |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Sir Syed House** | Red | Asad Ullah Khan (`STF-1009`) | 340 Students | 450 Pts | 380 Pts | **830 Pts** | **# 1 (Leader)** |
| **Jinnah House** | Royal Blue | Fatima Zahra (`STF-1005`) | 355 Students | 420 Pts | 390 Pts | **810 Pts** | **# 2** |
| **Iqbal House** | Emerald Green | Hina Qasim (`STF-1010`) | 360 Students | 390 Pts | 400 Pts | **790 Pts** | **# 3** |
| **Liaquat House** | Gold Yellow | Muhammad Rashid (`STF-1006`)| 335 Students | 380 Pts | 340 Pts | **720 Pts** | **# 4** |

---

## 🩺 Screen 5.8: Student Leave Applications

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Leave Application & Class Teacher Approval
* **Navigation Route:** `/StudentLeaveApplication`
* **Source File Location:** `src/features/students/StudentLeaveApplication.tsx`
* **Authorized Access:** Parents, Class Teachers, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Parent-Submitted Absence Requests:** Parents apply for sick or casual leaves online without sending handwritten paper chits.
* **Attendance Auto-Exemption:** Approved leaves automatically mark student attendance as `Leave` (exempt from daily absence SMS alerts).

### 📝 3. Form Fields & Input Information
* **Student Name:** Child name (auto-selected in Parent Portal).
* **Leave Type:** Sick Leave, Family Outstation Leave, Emergency Leave.
* **Date Range:** Start date to end date.
* **Reason & Doctor's Prescription Upload:** Supporting details.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Parent Submits:** Parent fills form from Parent Portal.
2. **Teacher Reviews:** Class Teacher (e.g., Fatima Zahra for 10-A) gets notification on Staff Dashboard.
3. **Approve / Reject:** Teacher clicks **"Approve Leave"** with one click.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Application # | Student Name | Class & Section | Leave Type | Date Duration | Reason Stated | Approval Status | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **ST-LEV-01** | Muhammad Ali Khan | Grade 10-A | Sick Leave | Aug 28 (1 Day) | Severe fever & doctor rest | `Approved` | Fatima Zahra (`STF-1005`) |
| **ST-LEV-02** | Ayesha Bibi | Grade 10-A | Family Leave | Sep 01 - Sep 02 (2 Days)| Cousin wedding in Lahore | `Approved` | Fatima Zahra (`STF-1005`) |
| **ST-LEV-03** | Usman Ghani Jr. | Grade 10-A | Sick Leave | Sep 04 (1 Day) | Dental checkup | `Pending` | Awaiting Class Teacher |

---

## 📈 Screen 5.9: Student Annual Promotions & Class Rollover

### 📌 1. Screen Identity & Overview
* **Screen Name:** Annual Student Promotion, Class Rollover & Retention Engine
* **Navigation Route:** `/StudentPromotions`
* **Source File Location:** `src/features/students/StudentPromotions.tsx`
* **Authorized Access:** Campus Principal, Examination Controller

### 🎯 2. Operational Value & Business Purpose
* **Year-End Bulk Rollover:** Promotes an entire passing class (e.g., Grade 9-A students who passed annual exams) into Grade 10-A for the new session `AY-2027-28` in 5 seconds.
* **Retention Handling:** Allows holding back failing students in the same class while promoting the rest.
* **Graduation Transfer:** Automatically transitions final-year Grade 10 / A-Level students into Screen 5.10 (Alumni Directory).

### 📝 3. Screen Controls & Parameters
* **Source Session & Class:** (e.g., `Academic Session 2025-2026` ➔ `Grade 9 - Science` ➔ `Section A`).
* **Target Session & Class:** (e.g., `Academic Session 2026-2027` ➔ `Grade 10 - Science` ➔ `Section A`).
* **Student Selection Table:** Multi-select checkboxes with annual exam pass/fail status flags.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Source Class:** Choose `AY-2025-26`, `Grade 9 - Science`, `Section A`.
2. **Select Target Class:** Choose `AY-2026-27`, `Grade 10 - Science`, `Section A`.
3. **Review Promotion List:** Check students with passing status.
4. **Execute Mass Promotion:** Click **"Promote Selected Students"** (creates enrollment records for the new academic year).

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Admission # | Student Full Name | Previous Class (2025-26) | Annual Exam Result % | New Class (2026-27) | Promotion Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **AD-2026-0101** | Muhammad Ali Khan | Grade 9 - Section A | 91.5% (A+) | **Grade 10 - Section A** | `Promoted Successfully` |
| **AD-2026-0102** | Hamza Tariq | Grade 9 - Section A | 86.4% (A) | **Grade 10 - Section A** | `Promoted Successfully` |
| **AD-2026-0103** | Ayesha Bibi | Grade 9 - Section A | 94.2% (A+) | **Grade 10 - Section A** | `Promoted Successfully` |
| **AD-2026-0104** | Bilal Hassan | Grade 9 - Section A | 78.0% (B) | **Grade 10 - Section A** | `Promoted Successfully` |
| **AD-2026-0105** | Usman Ghani Jr. | Grade 9 - Section A | 72.5% (C) | **Grade 10 - Section A** | `Promoted Successfully` |

---

## 🎓 Screen 5.10: Alumni & Graduated Students Directory

### 📌 1. Screen Identity & Overview
* **Screen Name:** Alumni Directory & Graduated Student Records
* **Navigation Route:** `/AlumniDirectory`
* **Source File Location:** `src/features/students/AlumniDirectory.tsx`
* **Authorized Access:** Campus Principal, Admissions Officer, Public Relations

### 🎯 2. Operational Value & Business Purpose
* **Lifelong Institutional Archive:** Preserves permanent transcripts, board roll numbers, and graduation years for past graduates.
* **Transcript & Verification Requests:** Allows issuing duplicate transcripts, character certificates, and university recommendation letters years after graduation.

### 📝 3. Form Fields & Record Information
* **Graduation Year / Batch:** (e.g., `Batch of 2025 - Matric Science`).
* **Final Board Exam Marks:** Total score and grade achieved (e.g., `1042 / 1100 - A+ Grade`).
* **Higher Education Destination:** University enrolled (e.g., *NUST, FAST, King Edward Medical*).
* **Current Employment / Profile:** Career details.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Search Alumni:** Search by student name, graduation year, or admission number.
2. **Issue Duplicate Transcript:** Click **"Print Transcript Archive"** for embassy/university verifications.
3. **Update Alumni Profile:** Record university admissions and career achievements.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Admission # | Graduate Full Name | Graduation Batch | Final Board Score | Grade | Current University / Profession | Contact Email |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **AD-2024-0012** | Saad Tariq Khan | Class of 2025 | 1,054 / 1,100 | `A+` | NUST (Software Engineering) | `saad.tariq@alumni.edu.pk` |
| **AD-2024-0015** | Mahnoor Farooq | Class of 2025 | 1,068 / 1,100 | `A+` | King Edward Medical University | `mahnoor.f@alumni.edu.pk` |
| **AD-2024-0019** | Daniyal Ahmed | Class of 2025 | 980 / 1,100 | `A` | GIKI (Mechanical Engineering) | `daniyal.a@alumni.edu.pk` |
| **AD-2023-0045** | Kashif Mehmood | Class of 2024 | 1,012 / 1,100 | `A+` | FAST-NUCES (Cyber Security) | `kashif.m@alumni.edu.pk` |

---

## 🎯 Phase 5 Milestone Completed

Phase 5 completes the full student lifecycle:
* **Online public inquiries & admissions** are processed.
* **Students (`AD-2026-0101`, etc.)** are enrolled with classes, sections, roll numbers, and parent family links (`PRN-2026-001`).
* **Discipline points, house championships, leave applications, year-end promotions, and alumni registries** are active.

👉 **Next Phase:** We proceed directly to **Phase 6: Finance, Complete Fee Lifecycle & Payroll** (`Phase_06_Finance_Fee_Lifecycle_and_Payroll.md`) covering Chart of Accounts, Fee Heads, Concessions, Challan Generation & POS Collection, Student Digital Wallets, School Expenses, and Monthly Staff Payroll!
