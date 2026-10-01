# 🏫 VOKE Solutions SMS — Phase 8: Daily Academic Delivery, LMS & Attendance

> **System:** VOKE Solutions School Management System (SMS)  
> **Phase Target:** Phase 8 — Daily Attendance Registers, Subject-Wise Attendance, Student Diary, Lesson Plans, Study Materials, LMS Homework & Live Virtual Classes  
> **Documentation Style:** Point-to-Point Step-by-Step Guide with Clean Data Tables  
> **Language:** English  
> **Data Integrity:** 100% Relational Human-Readable Dataset — **Zero Raw GUIDs (Fully Linked to Phase 1, Phase 2, Phase 3, Phase 4 & Phase 5)**

---

## 📑 Phase 8 Navigation Overview

* [Screen 8.1: Daily Student Attendance Register (`/StudentAttendance`)](#-screen-81-daily-student-attendance-register)
* [Screen 8.2: Proxy Attendance & Missing Swipe Correction (`/ProxyAttendance`)](#-screen-82-proxy-attendance--missing-swipe-correction)
* [Screen 8.3: Subject-Wise Period Attendance (`/SubjectWiseAttendance`)](#-screen-83-subject-wise-period-attendance)
* [Screen 8.4: Student Daily Diary & Homework Broadcast (`/StudentDiaryManager`)](#-screen-84-student-daily-diary--homework-broadcast)
* [Screen 8.5: Teacher Lesson Planning & Syllabus Tracker (`/LessonPlanning`)](#-screen-85-teacher-lesson-planning--syllabus-tracker)
* [Screen 8.6: Study Materials & Digital Repository (`/StudyMaterialRepository`)](#-screen-86-study-materials--digital-repository)
* [Screen 8.7: Homework Assignment Builder (`/HomeworkManagement`)](#-screen-87-homework-assignment-builder)
* [Screen 8.8: Homework Submissions Review & Grading (`/HomeworkSubmissions`)](#-screen-88-homework-submissions-review--grading)
* [Screen 8.9: Student Homework Portal & Submission Desk (`/StudentHomeworkPortal`)](#-screen-89-student-homework-portal--submission-desk)
* [Screen 8.10: Live Virtual Classes & Meetings (`/LiveClassesManager`)](#-screen-810-live-virtual-classes--meetings)

---

## 📋 Screen 8.1: Daily Student Attendance Register

### 📌 1. Screen Identity & Overview
* **Screen Name:** Daily Student Attendance Register & Morning Roll Call
* **Navigation Route:** `/StudentAttendance`
* **Source File Location:** `src/features/student-attendance/StudentAttendance.tsx`
* **Authorized Access:** Appointed Class Teachers (e.g., `Fatima Zahra - STF-1005`), Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Morning Roll Call Routine:** Class teachers mark morning attendance for their assigned classroom in under 30 seconds.
* **Biometric & RFID Sync:** Pre-populates attendance from RFID turnstiles and face scanners at the main entrance gate (Screen 1.5).
* **Automated Absence SMS to Parents:** At 08:30 AM, the system automatically triggers SMS broadcasts to parents of unexcused absent students.

### 📝 3. Attendance Status Codes & Controls
* **Status Flags:** `Present (P)` (Emerald Green), `Absent (A)` (Red), `Late (L)` (Amber), `Approved Leave (LV)` (Blue).
* **One-Click Quick Action:** **"Mark All as Present"** button with quick toggling of 2-3 absent students.
* **Monthly Attendance %:** Dynamically calculated per student (e.g., `96.5%`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Class Context:** Choose `Grade 10 - Science` ➔ `Section A (Room 201)`.
2. **Review Attendance Grid:** Students load alphabetically with roll numbers and recent attendance % badges.
3. **Mark Roll Call:**
   * Click **"Mark All as Present"**.
   * Toggle Roll # 105 (Usman Ghani Jr.) to `Absent`.
   * Toggle Roll # 104 (Bilal Hassan) to `Late (Arrived 08:15 AM)`.
4. **Save & Broadcast:** Click **"Save Morning Attendance"** ➔ Sends absent SMS to parent of Usman Ghani Jr.
5. **Print Register Sheet:** Click **"Download Weekly Attendance Sheet (PDF)"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Roll # | Admission # | Student Name | Enrolled Section | Morning Status | Check-In Time | Monthly Attendance % | Parent Notified? |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **101** | `AD-2026-0101` | Muhammad Ali Khan | Grade 10-A | `Present` | 07:42 AM (Biometric) | `98.0%` | No (Present) |
| **102** | `AD-2026-0102` | Hamza Tariq | Grade 10-A | `Present` | 07:44 AM (Biometric) | `96.0%` | No (Present) |
| **103** | `AD-2026-0103` | Ayesha Bibi | Grade 10-A | `Present` | 07:50 AM (Manual) | `100.0%` | No (Present) |
| **104** | `AD-2026-0104` | Bilal Hassan | Grade 10-A | `Late Arrival` | 08:15 AM (Manual) | `92.0%` | Yes (Late Alert) |
| **105** | `AD-2026-0105` | Usman Ghani Jr. | Grade 10-A | `Absent` | — | `84.0%` | Yes (Absence SMS) |
| **106** | `AD-2026-0108` | Omer Farooq | Grade 10-B | `Present` | 07:48 AM (Biometric) | `95.0%` | No (Present) |
| **201** | `AD-2026-0106` | Zainab Fatima | Grade 9-A | `Present` | 07:45 AM (Biometric) | `98.0%` | No (Present) |
| **301** | `AD-2026-0107` | Ahmed Raza | Grade 1-A | `Present` | 07:55 AM (Manual) | `94.0%` | No (Present) |

---

## 🔧 Screen 8.2: Proxy Attendance & Missing Swipe Correction

### 📌 1. Screen Identity & Overview
* **Screen Name:** Attendance Punch Correction & Missing Swipe Resolution
* **Navigation Route:** `/ProxyAttendance`
* **Source File Location:** `src/features/student-attendance/ProxyAttendance.tsx`
* **Authorized Access:** Campus Principal, Attendance Supervisor, IT Admin

### 🎯 2. Operational Value & Business Purpose
* **Punch Anomaly Correction:** Resolves hardware RFID scan failures when a student forgot their ID badge or the turnstile experienced power loss.
* **Audit Trail Accountability:** Requires operator to enter justification reason (e.g., *Gate turnstile power outage*, *Student badge damaged*).
* **Sync Re-Evaluation:** Correcting an anomaly recalculates the student's monthly attendance percentage and clears false absence alerts.

### 📝 3. Form Fields & Input Information
* **Student Name:** Search by roll number or name.
* **Target Incident Date:** Date swipe was missed.
* **Corrected Status:** Present, Late Arrival, Approved Leave.
* **Correction Reason:** Official justification note.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Search Unresolved Anomalies:** Filter by date or class to locate missing swipes.
2. **Apply Correction:** Select student (`Usman Ghani Jr.`), change status to `Present (Manual Verification)`, and enter gate security confirmation.
3. **Save Record:** Click **"Commit Punch Correction"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Correction # | Student Name | Class | Date of Anomaly | Original Machine Status | Corrected Status | Justification Reason | Corrected By |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **PATT-2026-01** | Bilal Hassan (`AD-2026-0104`) | Grade 10-A | 2026-08-26 | `Absent (No Swipe)` | `Present` | RFID Card broken; re-issued new badge | Fatima Zahra (`STF-1005`) |
| **PATT-2026-02** | Ahmed Raza (`AD-2026-0107`) | Grade 1-A | 2026-08-27 | `Absent (No Swipe)` | `Present` | Junior wing turnstile offline for 10 mins | Mrs. Ayesha Kamran |
| **PATT-2026-03** | Hamza Tariq (`AD-2026-0102`) | Grade 10-A | 2026-08-20 | `Absent` | `Approved Leave`| Parent applied sick leave retroactively | Fatima Zahra (`STF-1005`) |

---

## ⏱️ Screen 8.3: Subject-Wise Period Attendance

### 📌 1. Screen Identity & Overview
* **Screen Name:** Subject-Wise Lecture Attendance & Bunking Prevention
* **Navigation Route:** `/SubjectWiseAttendance`
* **Source File Location:** `src/features/student-attendance/SubjectWiseAttendance.tsx`
* **Authorized Access:** Subject Teachers (e.g., Mathematics, Physics, Chemistry Teachers)

### 🎯 2. Operational Value & Business Purpose
* **Bunking & Truancy Detection:** Subject teachers take quick 10-second attendance at the start of each lecture period (e.g., Period 2: Physics).
* **Cross-Verification:** If a student was marked `Present` during morning roll call but is `Absent` in Period 3 Chemistry Lab, a red bunking alert is flagged to the discipline committee.

### 📝 3. Form Fields & Screen Controls
* **Select Class & Section:** (e.g., `Grade 10 - Science ➔ Section A`).
* **Select Scheduled Period:** Pulls active lecture from Screen 4.1 (e.g., `Period 2: Physics - Hina Qasim`).
* **Mark Period Attendance:** Instant Present/Absent toggle list.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Open Period Attendance:** Teacher opens screen during their 45-minute lecture.
2. **Auto-Populate Roster:** System loads students who were marked present in morning roll call.
3. **Verify Physical Presence:** Confirm all students are seated in laboratory/classroom.
4. **Click Submit:** Click **"Lock Period Attendance"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Class & Section | Lecture Period | Subject | Teaching Faculty | Room Number | Total Enrolled | Present in Period | Missing / Bunking |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| **Grade 10-A** | **Period 1** (08:00 AM) | Mathematics | Fatima Zahra (`STF-1005`) | Room 201 | 38 Students | 37 Present | 0 Bunking |
| **Grade 10-A** | **Period 2** (08:45 AM) | Physics Theory | Hina Qasim (`STF-1010`) | Room 201 | 38 Students | 37 Present | 0 Bunking |
| **Grade 10-A** | **Period 3** (09:30 AM) | Chemistry Lab | Asad Ullah Khan (`STF-1009`)| Chemistry Lab 2 | 38 Students | 36 Present | 1 Missing (Bunk Alert) |
| **Grade 10-A** | **Period 5** (11:30 AM) | Urdu Literature | Muhammad Rashid (`STF-1006`)| Room 201 | 38 Students | 37 Present | 0 Bunking |

---

## 📖 Screen 8.4: Student Daily Diary & Homework Broadcast

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Daily Digital Diary & Parent Broadcast Desk
* **Navigation Route:** `/StudentDiaryManager`
* **Source File Location:** `src/features/academics/StudentDiaryManager.tsx`
* **Authorized Access:** Class Teachers, Subject Teachers, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Replaces Paper School Diaries:** Teachers publish daily classwork summaries, homework tasks, test announcements, and classroom conduct notes.
* **Instant Parent Portal Sync:** Published diary entries appear instantly on parent mobile apps at 01:30 PM dismissal.
* **Conduct Badges:** Assigns individual student conduct stars (⭐ *Excellent*, 👍 *Good*, ⚠️ *Needs Improvement*).

### 📝 3. Form Fields & Input Information
* **Publishing Mode:** `Bulk Entire Section Diary` or `Individual Student Special Note`.
* **Target Class & Section:** (e.g., `Grade 10 - Science`, `Section A`).
* **Date:** (e.g., `2026-08-28`).
* **Homework & Classwork Summary:** Bullet-point tasks for Math, Physics, English, and Urdu.
* **Conduct Rating:** `⭐ Excellent`, `👍 Good`, `🆗 Satisfactory`, `⚠️ Needs Improvement`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Open Diary Desk:** Click **"+ Post Section Diary"**.
2. **Input Daily Tasks:**
   * Math: *Solve Exercise 2.4 Questions 1 to 5 in homework notebook.*
   * Physics: *Learn definitions of Simple Harmonic Motion for tomorrow's quiz.*
   * Urdu: *Write essay on 'Allama Iqbal's Vision'.*
3. **Set Conduct Rating:** Choose general class conduct (`⭐ Excellent`).
4. **Publish to Parents:** Click **"Broadcast Diary to Parents"** ➔ Sends push notifications.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Diary Code | Target Class | Date | Homework Summary | Conduct Rating | Teacher Remarks | Broadcast Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **DIR-10A-0828** | Grade 10-A | 2026-08-28 | **Math:** Ex 2.4 Q1-5 \| **Physics:** SHM Definitions \| **Urdu:** Essay | ⭐ Excellent | Great discipline in physics lab today | `Broadcasted (38 Parents)` |
| **DIR-10B-0828** | Grade 10-B | 2026-08-28 | **Physics:** Numericals 10.1-10.4 \| **Eng:** Grammar Unit 3 | 👍 Good | Math test scheduled for Friday | `Broadcasted (36 Parents)` |
| **DIR-09A-0828** | Grade 9-A | 2026-08-28 | **Biology:** Cell Structure Diagram \| **Chem:** Periodic Table | ⭐ Excellent | Active participation in biology discussion| `Broadcasted (39 Parents)` |
| **DIR-01A-0828** | Grade 1-A | 2026-08-28 | **Eng:** Reading Page 12 \| **Math:** Tables 2 to 5 | ⭐ Excellent | Coloring activity completed | `Broadcasted (28 Parents)` |

---

## 📝 Screen 8.5: Teacher Lesson Planning & Syllabus Tracker

### 📌 1. Screen Identity & Overview
* **Screen Name:** Teacher Lesson Plans, Curriculum Milestones & Syllabus Tracker
* **Navigation Route:** `/LessonPlanning`
* **Source File Location:** `src/features/academics/LessonPlanning.tsx`
* **Authorized Access:** Academic Coordinator, Subject Teachers, Principal

### 🎯 2. Operational Value & Business Purpose
* **Curriculum Pacing:** Teachers plan weekly teaching units with pedagogical objectives, required science apparatus, and homework assignments.
* **Syllabus Progress Auditing:** Tracks percentage of textbook chapters completed ahead of midterm and final exams (e.g., *Syllabus 65% Completed*).
* **Principal Approval Workflow:** Principals inspect and approve weekly lesson plans before execution in classrooms.

### 📝 3. Form Fields & Input Information
* **Subject & Class:** (e.g., `Mathematics - Grade 10-A`).
* **Lesson Unit / Topic:** (e.g., `Chapter 2: Theory of Quadratic Equations`).
* **Planned Start & Completion Dates:** (e.g., `2026-08-25` to `2026-08-29`).
* **Total Planned Periods:** Estimated lecture hours (e.g., `5 Periods`).
* **Learning Objectives & Teaching Aids:** Multimedia projector, graph paper, scientific calculators.
* **Plan Status:** `Draft`, `Submitted for Approval`, `Approved by Principal`, `Completed in Class`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Create Weekly Lesson Plan:** Click **"+ New Lesson Plan"**.
2. **Enter Pedagogical Steps:** Specify learning outcomes, student activities, and homework questions.
3. **Submit to Principal:** Click **"Submit for HOD Approval"**.
4. **Track Completion:** Update status to `Completed in Class` after delivering lecture.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Plan Code | Subject | Class | Chapter / Topic Planned | Planned Periods | Target Dates | HOD Approval Status | Completion Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: | :---: |
| **LES-10-MTH-01** | Mathematics | Grade 10-A | Ch 2: Quadratic Equations & Roots | 5 Periods | Aug 25 - Aug 29 | `Approved by Principal` | **100% Completed** |
| **LES-10-PHY-01** | Physics | Grade 10-A | Ch 10: Simple Harmonic Motion & Waves| 6 Periods | Aug 25 - Aug 30 | `Approved by Principal` | **85% In Progress** |
| **LES-10-CHM-01** | Chemistry | Grade 10-A | Ch 9: Chemical Equilibrium & Kp | 5 Periods | Sep 01 - Sep 05 | `Approved by Principal` | **Upcoming** |
| **LES-09-BIO-01** | Biology | Grade 9-A | Ch 4: Cells and Tissues Microscopy | 4 Periods | Aug 25 - Aug 28 | `Approved by Principal` | **100% Completed** |

---

## 📁 Screen 8.6: Study Materials & Digital Repository

### 📌 1. Screen Identity & Overview
* **Screen Name:** Study Materials, Past Papers & Digital E-Learning Repository
* **Navigation Route:** `/StudyMaterialRepository`
* **Source File Location:** `src/features/academics/StudyMaterialRepository.tsx`
* **Authorized Access:** All Teachers, Enrolled Students, Parents

### 🎯 2. Operational Value & Business Purpose
* **Digital Academic Library:** Centralized repository for lecture slides, solved past exam papers, revision notes, and lab experiment manuals.
* **24/7 Student Download Portal:** Students download course PDFs and video lecture links anytime from their Student Portal (Screen 10.2).
* **Storage & Access Optimization:** Categorized by Class, Subject, and Chapter for instant retrieval.

### 📝 3. Form Fields & Repository Information
* **Material Title:** Descriptive name (e.g., *Grade 10 Math Chapter 2 Solved Past Papers (2020-2025)*).
* **Target Grade & Subject:** (e.g., `Grade 10 - Science ➔ Mathematics`).
* **Document File Upload:** PDF notes, PowerPoint slides, Word worksheets (Max 25MB).
* **External Video / URL Link:** (e.g., YouTube recorded lecture link).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Upload Study Resource:** Click **"+ Upload Study Material"**.
2. **Select Grade & Subject:** Pick `Grade 10 - Science` and `Mathematics`.
3. **Attach PDF File:** Upload `Grade10_Math_Ch2_SolvedNotes.pdf`.
4. **Publish:** Click **"Publish to Student Portal"** ➔ Visible to all Grade 10 students instantly.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Material Code | Document Title | Subject | Class | File Type & Size | Uploaded By | Total Downloads |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **MAT-10-MTH-01** | Class 10 Math Ch 2 Solved Notes & Past Papers | Mathematics | Grade 10-A | `PDF Document (4.2 MB)` | Fatima Zahra (`STF-1005`) | 128 Downloads |
| **MAT-10-PHY-01** | Physics Ch 10 SHM Formulas & Numerical Guide | Physics | Grade 10-A | `PDF Document (3.1 MB)` | Hina Qasim (`STF-1010`) | 115 Downloads |
| **MAT-10-CHM-01** | Chemistry Lab Manual - Acid Base Titration | Chemistry | Grade 10-A | `PDF Document (5.5 MB)` | Asad Ullah Khan (`STF-1009`)| 98 Downloads |
| **MAT-10-ENG-01** | English Literature Model Essays & Vocabulary | English | Grade 10-A | `Word Document (1.8 MB)` | Zainab Bibi (`STF-1011`) | 142 Downloads |
| **MAT-09-BIO-01** | Biology High-Resolution Plant Cell Diagrams | Biology | Grade 9-A | `PDF Document (6.0 MB)` | Fatima Zahra (`STF-1005`) | 85 Downloads |

---

## 📑 Screen 8.7: Homework Assignment Builder

### 📌 1. Screen Identity & Overview
* **Screen Name:** LMS Homework Creator & Assignment Dispatcher
* **Navigation Route:** `/HomeworkManagement`
* **Source File Location:** `src/features/lms/HomeworkManagement.tsx`
* **Authorized Access:** Teaching Faculty, Academic Coordinator

### 🎯 2. Operational Value & Business Purpose
* **Digital Homework Publishing:** Teachers build structured assignments with deadlines, attached worksheets, and maximum marks (e.g., 10 Marks).
* **Submission Deadline Enforcement:** Auto-closes student submissions after the due date (e.g., due by `2026-08-30 at 11:59 PM`).
* **Rich Text Instructions:** Supports embedded math formulas, diagram instructions, and downloadable exercise sheets using `<RichTextEditor>`.

### 📝 3. Form Fields & Input Information
* **Assignment Title:** (e.g., *Quadratic Equations Problem Set 2.4*).
* **Subject & Target Section:** (e.g., `Mathematics - Grade 10-A`).
* **Assignment Date & Due Date:** (e.g., Assigned: `Aug 28`, Due: `Aug 30`).
* **Maximum Grade Marks:** (e.g., `10 Marks`).
* **Detailed Task Instructions:** Formatted instructions via `<RichTextEditor>`.
* **Attachment Files:** Downloadable PDF problem sheet.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Create Assignment:** Click **"+ Create New Homework"**.
2. **Define Parameters:** Select Class (`10-A`), Subject (`Math`), Due Date (`Aug 30, 2026`), and Max Marks (`10`).
3. **Format Task Description:** Write instructions and attach worksheet file.
4. **Publish Assignment:** Click **"Publish Assignment"** ➔ Pushes alert to student homework desks.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Assignment # | Assignment Title | Subject | Class | Assigned Date | Due Date | Max Marks | Submissions Count | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **HW-2026-0801** | Quadratic Equations Problem Set 2.4 | Mathematics | Grade 10-A | 2026-08-28 | 2026-08-30 | 10 Marks | 36 / 38 Submitted | `Active (Open)` |
| **HW-2026-0802** | SHM Waves & Sound Numerical Problems| Physics | Grade 10-A | 2026-08-28 | 2026-08-31 | 15 Marks | 32 / 38 Submitted | `Active (Open)` |
| **HW-2026-0803** | English Essay: Role of Youth in Nation| English | Grade 10-A | 2026-08-27 | 2026-08-29 | 20 Marks | 38 / 38 Submitted | `Grading Closed` |
| **HW-2026-0804** | Chemical Equations Balancing Worksheet| Chemistry | Grade 10-A | 2026-08-26 | 2026-08-28 | 10 Marks | 37 / 38 Submitted | `Graded` |

---

## ✍️ Screen 8.8: Homework Submissions Review & Grading

### 📌 1. Screen Identity & Overview
* **Screen Name:** Homework Submissions Grading & Student Feedback Desk
* **Navigation Route:** `/HomeworkSubmissions`
* **Source File Location:** `src/features/lms/HomeworkSubmissions.tsx`
* **Authorized Access:** Subject Teachers (e.g., `Fatima Zahra - STF-1005`)

### 🎯 2. Operational Value & Business Purpose
* **Digital Paperless Grading:** Teachers review scanned PDF student homework submissions on-screen without carrying physical paper notebooks.
* **Rubric Scoring & Written Feedback:** Awards marks (e.g., *9 / 10*) and provides constructive teacher remarks (*Excellent solution steps; recheck Q4 algebra*).
* **Grade Book Feed:** Awarded homework scores sync directly into student academic dossiers.

### 📝 3. Screen Controls & Grading Elements
* **Student Submission Viewer:** In-browser PDF/Image document inspector.
* **Obtained Marks Input:** Number score (0 to Max Marks).
* **Teacher Remarks:** Written feedback visible on student app.
* **Submission Status:** `Submitted on Time`, `Late Submission`, `Graded`, `Needs Resubmission`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Assignment:** Choose `Quadratic Equations Problem Set 2.4 (HW-2026-0801)`.
2. **Review Student Submission:** Click on student row (`Muhammad Ali Khan`) to view attached solved worksheet.
3. **Award Marks & Remarks:** Enter Marks (`10 / 10`) and feedback (*Flawless quadratic formula application*).
4. **Save Grade:** Click **"Submit Grade & Feedback"** ➔ Notifies student and parent instantly.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Assignment # | Student Name | Roll # | Submission Date | Time Status | Obtained Score | Teacher Written Feedback | Grading Status |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| **HW-2026-0801** | Muhammad Ali Khan | 101 | 2026-08-29 04:15 PM | `On Time` | **10 / 10** | Flawless solution steps and neat presentation | `Graded` |
| **HW-2026-0801** | Hamza Tariq | 102 | 2026-08-29 05:30 PM | `On Time` | **9 / 10** | Minor calculation error in Q3; good attempt | `Graded` |
| **HW-2026-0801** | Ayesha Bibi | 103 | 2026-08-29 03:00 PM | `On Time` | **10 / 10** | Excellent working and accurate answers | `Graded` |
| **HW-2026-0801** | Bilal Hassan | 104 | 2026-08-30 08:20 PM | `Late (2 Hrs)` | **8 / 10** | Good effort; ensure on-time submissions | `Graded` |
| **HW-2026-0801** | Usman Ghani Jr. | 105 | — | `Missing` | **0 / 10** | Homework not submitted past deadline | `Pending Submission` |

---

## 💻 Screen 8.9: Student Homework Portal & Submission Desk

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Homework Desk & Upload Submission Center
* **Navigation Route:** `/StudentHomeworkPortal`
* **Source File Location:** `src/features/lms/StudentHomeworkPortal.tsx`
* **Authorized Access:** Enrolled Students (Self-Service Portal)

### 🎯 2. Operational Value & Business Purpose
* **Student Academic Workspace:** Logged-in students view all pending homework tasks organized by subject with countdown timers to deadlines.
* **Photo / PDF Upload Desk:** Students snap photos of their handwritten notebooks or attach PDF documents to submit homework from laptop or smartphone.
* **View Teacher Grades & Corrections:** Students inspect graded assignments and read personalized teacher feedback.

### 📝 3. Portal Information & Submission Elements
* **Active Tasks Filter:** `Pending Submission`, `Submitted & Under Review`, `Graded & Completed`.
* **Submission Countdown:** (e.g., `Due in 18 Hours`).
* **Upload Area:** Drag-and-drop mobile camera photos or scanned PDF files (Max 15MB).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Student Logs In:** Student logs into portal and opens **"My Homework Desk"**.
2. **Select Pending Homework:** Clicks on `Quadratic Equations Problem Set 2.4`.
3. **Upload Solved Work:** Attaches `Math_HW_AliKhan.pdf`.
4. **Submit:** Clicks **"Turn In Assignment"** ➔ Status changes to `Submitted on Time`.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Student Logged In | Subject | Assignment Title | Due Date | Deadline Countdown | Uploaded File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Muhammad Ali Khan (`AD-2026-0101`)**| Mathematics | Quadratic Equations Set 2.4 | Aug 30, 2026 | `Submitted on Time` | `Ali_Math_HW.pdf (1.8 MB)` | `Graded: 10/10` |
| **Muhammad Ali Khan (`AD-2026-0101`)**| Physics | SHM Waves & Sound Numericals | Aug 31, 2026 | `1 Day Remaining` | `Ali_Physics_HW.pdf (2.2 MB)`| `Turned In (Pending)` |
| **Muhammad Ali Khan (`AD-2026-0101`)**| English | English Essay: Role of Youth | Aug 29, 2026 | `Submitted on Time` | `Essay_AliKhan.docx (45 KB)` | `Graded: 19/20` |

---

## 🎥 Screen 8.10: Live Virtual Classes & Meetings

### 📌 1. Screen Identity & Overview
* **Screen Name:** Live Virtual Classes & Online Lecture Hub
* **Navigation Route:** `/LiveClassesManager`
* **Source File Location:** `src/features/academics/LiveClassesManager.tsx`
* **Authorized Access:** Teaching Faculty, Campus Principal, Enrolled Students

### 🎯 2. Operational Value & Business Purpose
* **Remote & Hybrid Learning:** Allows teachers to schedule and host live interactive video lectures (via Zoom, Microsoft Teams, or Google Meet integration) during school closures or weekend exam prep sessions.
* **One-Click Student Joining:** Students click **"Join Live Lecture"** directly from their timetable without searching for meeting links or passwords.
* **Attendance Auto-Logging:** System automatically records student join timestamps and duration spent in the virtual classroom.

### 📝 3. Form Fields & Meeting Information
* **Class & Subject:** (e.g., `Grade 10 - Science ➔ Mathematics`).
* **Meeting Title:** (e.g., *Grade 10 Trigonometry Live Problem Solving Session*).
* **Meeting Platform:** *Zoom Meetings*, *Microsoft Teams*, *Google Meet*.
* **Date, Start Time & Duration:** (e.g., `2026-08-30 at 05:00 PM (60 Minutes)`).
* **Meeting URL & Passcode:** Secure join link.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Teacher Schedules Lecture:** Click **"+ Schedule Live Class"** ➔ Select Grade 10-A, Date/Time, and paste Meeting Link ➔ Click **"Publish Lecture"**.
2. **Student Joins:** Students see active live class badge on their dashboard and click **"Join Now"**.
3. **Auto-Attendance:** System logs attendance for all participating students.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Session Code | Target Class | Subject | Host Teacher | Meeting Platform | Date & Time | Duration | Meeting Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **LIVE-10A-MTH** | Grade 10-A | Mathematics | Fatima Zahra (`STF-1005`) | Zoom Pro Integration | Aug 30, 2026 at 05:00 PM | 60 Mins | `Scheduled (Active)` |
| **LIVE-10A-PHY** | Grade 10-A | Physics Theory | Hina Qasim (`STF-1010`) | Microsoft Teams | Aug 31, 2026 at 06:00 PM | 45 Mins | `Scheduled (Active)` |
| **LIVE-09A-BIO** | Grade 9-A | Biology Lab Review | Fatima Zahra (`STF-1005`) | Google Meet | Aug 28, 2026 at 04:00 PM | 45 Mins | `Completed (36 Attended)`|

---

## 🎯 Phase 8 Milestone Completed

Phase 8 establishes the complete digital classroom & learning lifecycle:
* **Daily student morning attendance, biometric sync, and subject-wise lecture tracking** are running.
* **Digital student diaries, curriculum lesson planning, and study repository downloads** are operational.
* **Full paperless LMS homework assignment, student submission uploads, on-screen grading, and live video lectures** are active.

👉 **Next Phase:** We proceed directly to **Phase 9: Comprehensive Examination & Computer-Based Testing (CBT)** (`Phase_09_Comprehensive_Examination_and_CBT.md`) covering Exam Terms, Grading Scales, Date Sheets & Admit Cards, Marks Entry Dashboards, Question Banks, and Online CBT Quizzes!
