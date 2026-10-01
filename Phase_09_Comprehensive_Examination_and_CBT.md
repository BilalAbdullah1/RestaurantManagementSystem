# 🏫 VOKE Solutions SMS — Phase 9: Comprehensive Examination & Computer-Based Testing (CBT)

> **System:** VOKE Solutions School Management System (SMS)  
> **Phase Target:** Phase 9 — Examination Terms, Grading Scales, Date Sheets, Admit Cards, Marks Entry Dashboard, Question Bank & Online CBT Engine  
> **Documentation Style:** Point-to-Point Step-by-Step Guide with Clean Data Tables  
> **Language:** English  
> **Data Integrity:** 100% Relational Human-Readable Dataset — **Zero Raw GUIDs (Fully Linked to Phase 1, Phase 2, Phase 3 & Phase 5)**

---

## 📑 Phase 9 Navigation Overview

* [Screen 9.1: Exam Master Terms & Configuration (`/ExamSetups`)](#-screen-91-exam-master-terms--configuration)
* [Screen 9.2: Grading Scales & GPA Calculation Matrix (`/GradingScales`)](#-screen-92-grading-scales--gpa-calculation-matrix)
* [Screen 9.3: Exam Date Sheets & Hall Schedules (`/ExamSchedules`)](#-screen-93-exam-date-sheets--hall-schedules)
* [Screen 9.4: Student Admit Card / Roll Number Slip Generator (`/AdmitCardGenerator`)](#-screen-94-student-admit-card--roll-number-slip-generator)
* [Screen 9.5: Marks Entry Dashboard & Grade Lock (`/MarksEntryDashboard`)](#-screen-95-marks-entry-dashboard--grade-lock)
* [Screen 9.6: Question Bank Master Catalog (`/QuestionBank`)](#-screen-96-question-bank-master-catalog)
* [Screen 9.7: Online Exams & Quiz Builder (`/OnlineExams`)](#-screen-97-online-exams--quiz-builder)
* [Screen 9.8: Take Online Exam (Teacher / Admin View) (`/TakeOnlineExam`)](#-screen-98-take-online-exam-teacher--admin-view)
* [Screen 9.9: Student CBT Online Examination Center (`/StudentCBT`)](#-screen-99-student-cbt-online-examination-center)

---

## 🏛️ Screen 9.1: Exam Master Terms & Configuration

### 📌 1. Screen Identity & Overview
* **Screen Name:** Examination Master Terms & Annual Assessment Planner
* **Navigation Route:** `/ExamSetups`
* **Source File Location:** `src/features/exams/ExamSetups.tsx`
* **Authorized Access:** Campus Principal, Controller of Examinations, Super Admin

### 🎯 2. Operational Value & Business Purpose
* **Assessment Framework:** Defines major institutional exam terms (e.g., *First Term Midterm Exams*, *Final Annual Examinations 2026-27*).
* **Weightage Contribution:** Configures term weightage towards final annual CGPA (e.g., Midterms = 30%, Final Term = 70%).
* **Marks Entry Deadlines & Grade Lock:** Sets strict submission deadlines for teachers and provides a permanent master grade lock button to prevent retroactive grade tampering.

### 📝 3. Form Fields & Input Information
* **Exam Term Title:** (e.g., `Midterm Examination 2026-2027`).
* **Start Date & End Date:** (e.g., `2026-10-15` to `2026-10-25`).
* **Term Weightage (%):** Contribution percentage (e.g., `30.0%`).
* **Marks Submission Deadline:** Cutoff date for teachers to enter marks (e.g., `2026-10-28`).
* **Target Classes:** Multi-select checklist of participating grade levels (e.g., *Grade 1 through Grade 10*).
* **Status & Grade Lock:** `Upcoming`, `Ongoing`, `Completed`, `Locked`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Create Examination Term:** Click **"+ Create New Exam Setup"**.
2. **Define Parameters:** Enter Title (*Midterm Examination 2026*), Start Date (`2026-10-15`), End Date (`2026-10-25`), and Weightage (`30%`).
3. **Select Participating Classes:** Choose all grade levels.
4. **Publish Schedule:** Click **"Save Exam Setup"** ➔ Activates Date Sheet builder (Screen 9.3).
5. **Lock Final Term Grades:** After marks verification, click **"Lock Exam Grades"** to permanently secure results.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Exam Term Code | Examination Title | Academic Session | Start Date | End Date | Weightage % | Marks Entry Deadline | Term Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **EXM-2026-MID** | Midterm Examination 2026-27 | AY-2026-27 | 2026-10-15 | 2026-10-25 | **30%** | 2026-10-28 | `Upcoming / Active` |
| **EXM-2027-FIN** | Final Annual Examination 2026-27 | AY-2026-27 | 2027-03-10 | 2027-03-24 | **70%** | 2027-03-28 | `Draft / Scheduled` |
| **EXM-2026-Q1** | First Quarter Class Assessments | AY-2026-27 | 2026-09-20 | 2026-09-25 | **10%** | 2026-09-28 | `Upcoming` |
| **EXM-2026-PRE** | Cambridge O-Level Mock Exams | AY-2026-27 | 2027-01-10 | 2027-01-20 | **100% Mock**| 2027-01-25 | `Draft` |

---

## 🎯 Screen 9.2: Grading Scales & GPA Calculation Matrix

### 📌 1. Screen Identity & Overview
* **Screen Name:** Grading Scales, Percentage Thresholds & GPA Matrix
* **Navigation Route:** `/GradingScales`
* **Source File Location:** `src/features/exams/GradingScales.tsx`
* **Authorized Access:** Controller of Examinations, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Standardized Evaluation Scales:** Maps score percentages to letter grades and GPA quality points (e.g., 90-100% = A+ / 4.0 GPA, 80-89% = A / 3.7 GPA).
* **Matriculation vs Cambridge Support:** Allows separate grading scales for Matric Board (Percentage-based) and Cambridge O/A-Levels (Standard GPA/Letter scale).
* **Automatic Pass/Fail Determination:** Establishes minimum passing grade threshold (Grade D / 50% for Secondary, 33% for Primary).

### 📝 3. Form Fields & Input Information
* **Grade Name:** (e.g., `A+`, `A`, `B`, `C`, `D`, `F`).
* **Minimum & Maximum Percentage:** (e.g., Min: `90.00%`, Max: `100.00%`).
* **GPA Quality Points:** (e.g., `4.00`, `3.70`, `3.00`, `2.00`, `1.00`, `0.00`).
* **Official Evaluative Remarks:** (e.g., *Outstanding*, *Excellent*, *Needs Improvement*, *Fail*).
* **Is Passing Grade:** Toggle (Yes/No).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Scale Matrix:** Inspect active percentage thresholds and GPA distribution.
2. **Apply Standard Scale Presets:** Click **"Seed Standard Education Scale"** to load national/Cambridge templates in 1 click.
3. **Customize Grade Tier:** Click **"Edit"** on any grade row to adjust minimum mark thresholds.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Grade Name | Percentage Range | GPA Points | Evaluative Remarks | Is Passing Grade? | Badge Color | Target System |
| :---: | :---: | :---: | :--- | :---: | :---: | :--- |
| **A+** | 90.00% — 100.00% | **4.00 GPA** | Exceptional / Outstanding Achievement | `Yes` | `Emerald Green`| General / Matric |
| **A** | 80.00% — 89.99% | **3.70 GPA** | Excellent Mastery of Concepts | `Yes` | `Blue` | General / Matric |
| **B** | 70.00% — 79.99% | **3.00 GPA** | Good / Above Average Performance | `Yes` | `Cyan` | General / Matric |
| **C** | 60.00% — 69.99% | **2.00 GPA** | Satisfactory / Average Performance | `Yes` | `Amber` | General / Matric |
| **D** | 50.00% — 59.99% | **1.00 GPA** | Passing Threshold / Needs Improvement | `Yes` | `Orange` | General / Matric |
| **F** | 0.00% — 49.99% | **0.00 GPA** | Failed / Unsatisfactory | `No` | `Red` | General / Matric |

---

## 📅 Screen 9.3: Exam Date Sheets & Hall Schedules

### 📌 1. Screen Identity & Overview
* **Screen Name:** Master Exam Date Sheet Builder & Seating Hall Planner
* **Navigation Route:** `/ExamSchedules`
* **Source File Location:** `src/features/exams/ExamSchedules.tsx`
* **Authorized Access:** Controller of Examinations, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Date Sheet Publication:** Builds the official paper-by-paper timetable for each class (e.g., Math on Oct 15, Physics on Oct 17).
* **Invigilator Roster & Room Allocation:** Assigns teachers to examination hall invigilation duty (e.g., *Fatima Zahra in Main Examination Hall 1*) and prevents invigilator double-scheduling.
* **Paper Timings & Weightage:** Specifies paper start time, duration (e.g., 3 Hours), Total Theory Marks (75), and Practical Lab Marks (25).

### 📝 3. Form Fields & Input Information
* **Exam Term:** Select from active setups (e.g., `Midterm Examination 2026-27`).
* **Target Class & Subject:** (e.g., `Grade 10 - Science ➔ Mathematics`).
* **Exam Date & Paper Timings:** (e.g., `2026-10-15 from 09:00 AM to 12:00 PM`).
* **Total Marks & Passing Marks:** (e.g., Total: `100.00`, Passing: `33.00`).
* **Examination Room:** (e.g., `Main Hall 1`, `Room 201`).
* **Assigned Invigilator Teacher:** (e.g., `Hina Qasim - STF-1010`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Exam & Class:** Choose `Midterm Examination 2026-27` and `Grade 10 - Science`.
2. **Add Paper Slot:** Click **"+ Add Exam Schedule"** ➔ Select Subject (`Mathematics`), Date (`2026-10-15`), Room (`Exam Hall 1`), and Invigilator (`Hina Qasim`) ➔ Click **"Save Paper Slot"**.
3. **Publish Date Sheet:** Click **"Publish Date Sheet to Student Portal"**.
4. **Print Date Sheet:** Click **"Download Official Date Sheet (PDF)"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Exam Date | Paper Timings | Class | Subject Scheduled | Total Marks | Passing Marks | Allocated Exam Room | Assigned Invigilator |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **2026-10-15** | 09:00 AM - 12:00 PM | Grade 10-A | Mathematics (`SUB-MTH-10`) | 100 Marks | 33 Marks | Main Examination Hall 1 | Hina Qasim (`STF-1010`) |
| **2026-10-17** | 09:00 AM - 12:00 PM | Grade 10-A | Physics Theory (`SUB-PHY-10`) | 75 Marks | 25 Marks | Main Examination Hall 1 | Fatima Zahra (`STF-1005`) |
| **2026-10-18** | 09:00 AM - 11:00 AM | Grade 10-A | Physics Practical Lab | 25 Marks | 8 Marks | Physics Lab 1 | Asad Ullah Khan (`STF-1009`)|
| **2026-10-19** | 09:00 AM - 12:00 PM | Grade 10-A | Chemistry Theory (`SUB-CHM-10`)| 75 Marks | 25 Marks | Main Examination Hall 1 | Muhammad Rashid (`STF-1006`)|
| **2026-10-21** | 09:00 AM - 12:00 PM | Grade 10-A | English Literature (`SUB-ENG-10`)| 100 Marks | 33 Marks | Classroom Room 201 | Asad Ullah Khan (`STF-1009`)|
| **2026-10-23** | 09:00 AM - 12:00 PM | Grade 10-A | Urdu Compulsory (`SUB-URD-10`) | 100 Marks | 33 Marks | Classroom Room 201 | Zainab Bibi (`STF-1011`) |

---

## 🎫 Screen 9.4: Student Admit Card / Roll Number Slip Generator

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Examination Admit Cards & Roll Number Slips Generator
* **Navigation Route:** `/AdmitCardGenerator`
* **Source File Location:** `src/features/exams/AdmitCardGenerator.tsx`
* **Authorized Access:** Controller of Examinations, Cashier, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Official Entry Ticket:** Generates tamper-proof printable examination hall tickets containing student photo, board roll number, seat allocation, and complete date sheet schedule.
* **Fee Clearance Gatekeeper:** Automatically validates whether the student has cleared outstanding fee challans (Screen 6.6 & 6.7); blocks printing for overdue fee defaulters until accounts clear.
* **Barcode Verification:** Features scannable QR/barcodes for exam hall turnstile check-in.

### 📝 3. Admit Card Information Elements
* **Header & Campus Branding:** School name, campus logo, and exam session title.
* **Student Dossier:** Student Name, Father Name, Admission #, Roll #, Classroom Section, Photo.
* **Complete Exam Schedule Table:** Dates, subjects, paper timings, and assigned room numbers.
* **Candidate Instructions & Principal Signature:** Mandatory examination conduct rules.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Exam & Class:** Choose `Midterm Examination 2026` ➔ `Grade 10 - Science`.
2. **Review Fee Clearance Status:** Table highlights fee-cleared students in green and defaulters in red.
3. **Batch Generate Slips:** Click **"Generate All Admit Cards (Bulk PDF)"** to produce a 40-page print bundle for the section.
4. **Individual Download:** Students download their verified roll number slip directly from the Student Portal.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Admission # | Exam Roll # | Student Name | Class & Section | Candidate Photo | Fee Clearance Status | Admit Card Issued? | Seating Hall Assigned |
| :--- | :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **AD-2026-0101** | **101** | Muhammad Ali Khan | Grade 10-A | `Attached` | `100% Cleared (Paid)` | `Issued & Printed` | Main Hall 1 - Desk # 12 |
| **AD-2026-0102** | **102** | Hamza Tariq | Grade 10-A | `Attached` | `100% Cleared (Paid)` | `Issued & Printed` | Main Hall 1 - Desk # 14 |
| **AD-2026-0103** | **103** | Ayesha Bibi | Grade 10-A | `Attached` | `100% Cleared (Scholarship)`| `Issued & Printed`| Main Hall 1 - Desk # 16 |
| **AD-2026-0104** | **104** | Bilal Hassan | Grade 10-A | `Attached` | `100% Cleared (Paid)` | `Issued & Printed` | Main Hall 1 - Desk # 18 |
| **AD-2026-0105** | **105** | Usman Ghani Jr. | Grade 10-A | `Attached` | `Pending Dues (Rs. 12.5k)` | `On Hold (Defaulter)` | Unassigned |
| **AD-2026-0106** | **201** | Zainab Fatima | Grade 9-A | `Attached` | `100% Cleared (Paid)` | `Issued & Printed` | Main Hall 2 - Desk # 05 |

---

## 📊 Screen 9.5: Marks Entry Dashboard & Grade Lock

### 📌 1. Screen Identity & Overview
* **Screen Name:** Examination Marks Entry Dashboard & Assessment Matrix
* **Navigation Route:** `/MarksEntryDashboard`
* **Source File Location:** `src/features/exams/MarksEntryDashboard.tsx`
* **Authorized Access:** Subject Teachers, Class Teachers, Controller of Examinations

### 🎯 2. Operational Value & Business Purpose
* **Rapid Marks Entry Sheet:** Teachers enter student theory marks, practical lab marks, and assignment scores in a streamlined spreadsheet-style grid.
* **Auto-Computed Grades & GPA:** Instantly calculates Total Obtained, Percentage, Letter Grade (`A+`, `A`), and GPA Points based on Screen 9.2 scales.
* **Absentee Handling:** Toggle `Absent` flag automatically records zero marks and marks the subject as `Absent on Broadsheet`.

### 📝 3. Form Fields & Mark Attributes
* **Theory Marks:** (e.g., Max: 75.00).
* **Practical Marks:** (e.g., Max: 25.00).
* **Total Obtained Marks:** Auto-summed (`Theory + Practical`).
* **Is Absent Flag:** Checkbox for non-attendees.
* **Teacher Evaluative Remarks:** (e.g., *Subject Topper*, *Needs Improvement in Calculus*).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Filter Context:** Select Exam (`Midterm 2026`), Class (`Grade 10 - Science`), and Subject (`Mathematics`).
2. **Enter Student Scores:** Input theory and practical scores for all 38 students.
3. **Real-Time Validation:** System alerts if entered score exceeds maximum marks (e.g., entering 78 in a 75-mark field turns cell red).
4. **Save Draft / Submit:** Click **"Save Marks Sheet"** ➔ Pushes scores to broadsheet calculations.
5. **Print Subject Award List:** Click **"Download Subject Award List (PDF)"** for physical examination cell submission.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Roll # | Student Name | Theory (Max 75) | Practical (Max 25) | Total Obtained (100) | % Score | Letter Grade | GPA | Teacher Remarks |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **101** | Muhammad Ali Khan | **72** | **24** | **96 / 100** | 96.0% | `A+` | **4.00** | Exceptional analytical problem solving |
| **102** | Hamza Tariq | **65** | **22** | **87 / 100** | 87.0% | `A` | **3.70** | Strong performance in algebra |
| **103** | Ayesha Bibi | **74** | **25** | **99 / 100** | 99.0% | `A+` | **4.00** | **Subject Highest Score (Topper)** |
| **104** | Bilal Hassan | **56** | **20** | **76 / 100** | 76.0% | `B` | **3.00** | Good effort; revise geometry theorems |
| **105** | Usman Ghani Jr. | **40** | **15** | **55 / 100** | 55.0% | `D` | **1.00** | Marginal pass; requires remedial tutoring |
| **108** | Omer Farooq | **68** | **23** | **91 / 100** | 91.0% | `A+` | **4.00** | Excellent mathematical reasoning |

---

## 🧠 Screen 9.6: Question Bank Master Catalog

### 📌 1. Screen Identity & Overview
* **Screen Name:** Centralized Question Bank & Topic Repository
* **Navigation Route:** `/QuestionBank`
* **Source File Location:** `src/features/exams/QuestionBank.tsx`
* **Authorized Access:** Subject Teachers, Academic Coordinator, Principal

### 🎯 2. Operational Value & Business Purpose
* **Curriculum Question Vault:** Digital repository of thousands of Multiple Choice Questions (MCQs), Short Questions, and Long Descriptive Problems categorized by Subject, Chapter, and Cognitive Bloom's Level.
* **Difficulty Categorization:** Questions tagged as `Easy`, `Medium`, or `Hard` to generate balanced examination papers.
* **Auto-Paper Generation:** Enables teachers to auto-generate randomized online CBT quizzes and paper tests from the question bank.

### 📝 3. Form Fields & Question Elements
* **Target Class & Subject:** (e.g., `Grade 10 - Science ➔ Mathematics`).
* **Chapter / Topic:** (e.g., `Chapter 2: Quadratic Equations`).
* **Question Type:** `Multiple Choice (MCQ)`, `True/False`, `Short Answer`.
* **Question Text:** Formatted question with math notation.
* **4 Options (A, B, C, D) & Correct Option Key:** (e.g., `Option A`).
* **Difficulty Rating & Marks:** *Easy (1 Mark)*, *Medium (2 Marks)*, *Hard (3 Marks)*.
* **Step-by-Step Explanation:** Solution rationale shown to students during post-test reviews.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Filter Question Vault:** Select Class (`10-A`), Subject (`Math`), and Chapter (`Ch 2`).
2. **Add New Question:** Click **"+ Add Question"** ➔ Input question text, 4 choices, select correct option key, difficulty level, and explanation ➔ Click **"Save Question"**.
3. **Batch Excel Upload:** Click **"Import Questions from CSV"** to load 200+ questions at once.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Question Code | Subject | Chapter / Topic | Question Stem | Correct Option Key | Difficulty Level | Marks |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **Q-MTH-10-01** | Mathematics | Ch 2: Quadratic Equations | What is the discriminant of the quadratic equation $ax^2 + bx + c = 0$? | `Option A: b² - 4ac` | Easy | 1 Mark |
| **Q-MTH-10-02** | Mathematics | Ch 2: Quadratic Equations | If $b^2 - 4ac = 0$, what is the nature of the roots of the equation? | `Option C: Real and Equal` | Medium | 1 Mark |
| **Q-PHY-10-01** | Physics | Ch 10: Simple Harmonic Motion| Which of the following examples exhibits Simple Harmonic Motion? | `Option B: Motion of a Simple Pendulum`| Easy | 1 Mark |
| **Q-PHY-10-02** | Physics | Ch 10: Simple Harmonic Motion| In SHM, where is the acceleration of the vibrating body maximum? | `Option D: At Extreme Positions` | Hard | 2 Marks |
| **Q-CHM-10-01** | Chemistry | Ch 9: Chemical Equilibrium | What is the expression for the equilibrium constant Kc of $N_2 + 3H_2 \rightleftharpoons 2NH_3$? | `Option A: [NH3]² / [N2][H2]³` | Medium | 1 Mark |

---

## 💻 Screen 9.7: Online Exams & Quiz Builder

### 📌 1. Screen Identity & Overview
* **Screen Name:** Online Exam & Computer-Based Assessment Builder
* **Navigation Route:** `/OnlineExams`
* **Source File Location:** `src/features/exams/OnlineExams.tsx`
* **Authorized Access:** Subject Teachers, Academic Coordinator, Principal

### 🎯 2. Operational Value & Business Purpose
* **Digital Assessment Creator:** Configures timed online quizzes and CBT tests with auto-grading, randomized question shuffling, and proctoring rules.
* **Instant Automatic Grading:** When a student submits a 40-question online exam, the system scores the test instantly and logs results in the student dossier.
* **Anti-Cheating Safeguards:** Browser tab-switch detection, randomized question order per student, and strict countdown timer auto-submission.

### 📝 3. Form Fields & Exam Parameters
* **Exam Title:** (e.g., `Grade 10 Mathematics Chapter 2 Online Assessment`).
* **Duration in Minutes:** Countdown timer (e.g., `45 Minutes`).
* **Total Questions & Total Marks:** (e.g., `30 Questions = 30 Marks`).
* **Passing Percentage:** (e.g., `50%`).
* **Randomize Questions Toggle:** Shuffles question order for every student.
* **Active Availability Window:** Start time to expiration window.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Create Online Exam:** Click **"+ Create Online Exam"**.
2. **Configure Settings:** Enter Title, Duration (`45 Mins`), Pass % (`50%`), and select Grade 10-A.
3. **Attach Questions:** Pull 30 questions from Screen 9.6 Question Bank.
4. **Publish Exam:** Click **"Activate Online Exam"** ➔ Pushes exam to student CBT desks.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Exam Code | Online Exam Title | Target Class | Total Questions | Duration | Pass % | Total Students Attempted | Average Score | Exam Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **CBT-10-MTH-01** | Math Ch 2 Quadratic Equations Quiz | Grade 10-A | 30 MCQs | 45 Mins | 50% | 38 Students | **86.4%** | `Active Live` |
| **CBT-10-PHY-01** | Physics Waves & SHM Online Assessment| Grade 10-A | 25 MCQs | 40 Mins | 50% | 36 Students | **81.2%** | `Active Live` |
| **CBT-10-CHM-01** | Chemical Equilibrium Online Quiz | Grade 10-A | 20 MCQs | 30 Mins | 50% | 37 Students | **84.0%** | `Scheduled` |
| **CBT-09-BIO-01** | Biology Cells & Tissues Quiz | Grade 9-A | 25 MCQs | 35 Mins | 50% | 39 Students | **88.5%** | `Completed` |

---

## 👁️ Screen 9.8: Take Online Exam (Teacher / Admin View)

### 📌 1. Screen Identity & Overview
* **Screen Name:** Online Exam Live Proctoring & Preview Console
* **Navigation Route:** `/TakeOnlineExam`
* **Source File Location:** `src/features/exams/TakeOnlineExam.tsx`
* **Authorized Access:** Subject Teachers, Invigilators, Principal

### 🎯 2. Operational Value & Business Purpose
* **Pre-Flight Test Verification:** Allows teachers to preview and test the complete examination experience before deploying to students.
* **Live In-Progress Proctoring:** Monitors real-time student test attempts (shows who is currently online, time remaining on their screen, and flags tab-switching violations).

### 📝 3. Proctoring Telemetry Elements
* **Active Students Online:** Real-time count of connected candidates (e.g., `38 / 38 Connected`).
* **Live Candidate Progress:** Question completion tracker (e.g., `24 / 30 Questions Answered`).
* **Cheating Alerts:** Highlights candidates who switched browser tabs or lost network focus.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Active Exam:** Choose `Math Ch 2 Online Assessment (CBT-10-MTH-01)`.
2. **Monitor Live Grid:** View real-time progress of each student in the computer lab.
3. **Emergency Time Extension:** Grant +5 minutes to a candidate experiencing hardware/network issues.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Student Name | Roll # | Device IP | Questions Answered | Time Remaining | Tab Violations | Live Attempt Status |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| **Muhammad Ali Khan** | 101 | `192.168.1.101` | 30 / 30 (100%) | 12 Mins Left | 0 | `Completed & Submitted` |
| **Hamza Tariq** | 102 | `192.168.1.102` | 28 / 30 (93%) | 08 Mins Left | 0 | `In Progress` |
| **Ayesha Bibi** | 103 | `192.168.1.103` | 30 / 30 (100%) | 15 Mins Left | 0 | `Completed & Submitted` |
| **Bilal Hassan** | 104 | `192.168.1.104` | 25 / 30 (83%) | 05 Mins Left | 1 Warning | `In Progress` |
| **Usman Ghani Jr.** | 105 | `192.168.1.105` | 20 / 30 (66%) | 04 Mins Left | 0 | `In Progress` |

---

## 🖥️ Screen 9.9: Student CBT Online Examination Center

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Computer-Based Testing (CBT) Examination Center
* **Navigation Route:** `/StudentCBT`
* **Source File Location:** `src/features/exams/StudentCBT.tsx`
* **Authorized Access:** Enrolled Students (Self-Service Portal)

### 🎯 2. Operational Value & Business Purpose
* **Student Interactive Testing Interface:** Clean, distraction-free examination screen featuring live countdown clock, question palette, and instant answer selection.
* **Auto-Save Resilience:** Every selected answer is instantly saved to the database; if the computer reboots, the student resumes without losing progress.
* **Instant Score Review:** Displays total score, correct vs incorrect breakdown, and chapter analysis upon final submission.

### 📝 3. Student Interface Controls
* **Live Countdown Timer:** Prominent color-shifting timer (Green ➔ Amber ➔ Red).
* **Question Palette:** Grid showing Answered (Green), Unanswered (Gray), and Flagged for Review (Purple).
* **Question Stem & Radio Options:** Clean radio buttons for selecting Option A, B, C, or D.
* **Final Submission Modal:** Verification popup confirming all questions are answered before submitting.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Student Launches Exam:** Clicks **"Start Online Test"** ➔ Exam locks into full-screen mode.
2. **Navigate & Answer Questions:** Select radio options; click **"Next Question"** or use question palette.
3. **Flag Difficult Questions:** Mark question as *Flag for Review* to return before deadline.
4. **Submit Exam:** Click **"Submit Test"** ➔ System displays instant scorecard: *Score: 28 / 30 (93.3% - Passed)*.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Student Logged In | Attempted Exam Title | Total Questions | Correct Answers | Wrong Answers | Total Score | Percentage | Result Grade |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Muhammad Ali Khan (`AD-2026-0101`)**| Math Ch 2 Quadratic Equations | 30 MCQs | 29 | 1 | **29 / 30** | **96.7%** | `Passed (A+ Grade)` |
| **Hamza Tariq (`AD-2026-0102`)** | Math Ch 2 Quadratic Equations | 30 MCQs | 26 | 4 | **26 / 30** | **86.7%** | `Passed (A Grade)` |
| **Ayesha Bibi (`AD-2026-0103`)** | Math Ch 2 Quadratic Equations | 30 MCQs | 30 | 0 | **30 / 30** | **100.0%** | `Passed (A+ / 100%)`|
| **Bilal Hassan (`AD-2026-0104`)** | Math Ch 2 Quadratic Equations | 30 MCQs | 23 | 7 | **23 / 30** | **76.7%** | `Passed (B Grade)` |
| **Usman Ghani Jr. (`AD-2026-0105`)** | Math Ch 2 Quadratic Equations | 30 MCQs | 16 | 14 | **16 / 30** | **53.3%** | `Passed (D Grade)` |

---

## 🎯 Phase 9 Milestone Completed

Phase 9 completes the institutional assessment & examination lifecycle:
* **Exam terms, percentage grading scales, and GPA quality points** are defined.
* **Paper date sheets, hall invigilator rosters, fee-cleared admit card slips, and marks entry dashboards** are running.
* **Centralized question banks and online computer-based testing (CBT) engines** with instant automated grading are operational.

👉 **Next Phase:** We proceed directly to **Phase 10: Portals, Communication, Front Office & Institutional Reports** (`Phase_10_Portals_Communication_FrontOffice_and_Reports.md`) covering Student & Parent Dashboards, Multi-Channel Broadcasts, Visitor Logs, Certificates, and Comprehensive Board Broadsheet & Financial Balance Sheet Reports!
