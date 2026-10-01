# 🏫 VOKE Solutions SMS — Phase 4: Timetable & Substitute Management

> **System:** VOKE Solutions School Management System (SMS)  
> **Phase Target:** Phase 4 — Master Class Timetable Grid, Teacher Workload Matrices & Daily Substitute Teacher Auto-Assignment  
> **Documentation Style:** Point-to-Point Step-by-Step Guide with Clean Data Tables  
> **Language:** English  
> **Data Integrity:** 100% Relational Human-Readable Dataset — **Zero Raw GUIDs (Fully Linked to Phase 1, Phase 2 & Phase 3)**

---

## 📑 Phase 4 Navigation Overview

* [Screen 4.1: Master Class Timetable Grid (`/Timetable`)](#-screen-41-master-class-timetable-grid)
* [Screen 4.2: Teacher Weekly Schedule & Load Matrix (`/TeacherTimetable`)](#-screen-42-teacher-weekly-schedule--load-matrix)
* [Screen 4.3: Daily Substitute Teacher Auto-Assignment (`/SubstituteManagement`)](#-screen-43-daily-substitute-teacher-auto-assignment)

---

## 🗓️ Screen 4.1: Master Class Timetable Grid

### 📌 1. Screen Identity & Overview
* **Screen Name:** Master Class Timetable Generator & Weekly Grid
* **Navigation Route:** `/Timetable`
* **Source File Location:** `src/features/academics/Timetable.tsx`
* **Authorized Access:** Campus Principal, Academic Coordinator, Vice Principal

### 🎯 2. Operational Value & Business Purpose
* **Weekly Institutional Schedule:** Builds the full Monday-to-Saturday schedule for each grade and section, defining lecture timings, subjects, and assigned teachers.
* **Conflict Prevention Engine:** Real-time validation algorithm prevents double-booking a teacher or a physical room in the same time slot across different classes.
* **Student & Parent Portals Feed:** Published class schedules automatically sync to student and parent mobile portals so families know daily class timings.

### 📝 3. Form Fields & Input Information
* **Target Class & Section:** (e.g., `Grade 10 - Science`, `Section A (Quaid)`).
* **Day of Week:** Selection from Monday through Saturday.
* **Subject:** Selection from subjects mapped to this class in Screen 2.5 (e.g., `Mathematics - SUB-MTH-10`).
* **Assigned Teacher:** Selection from active teaching staff registered in Screen 3.1 (e.g., `Fatima Zahra - STF-1005`).
* **Start Time & End Time:** Specific period slot (e.g., `08:00 AM` to `08:45 AM`).
* **Room Name:** Specific classroom or science lab (e.g., `Room 201 - 2nd Floor`, `Physics Lab 1`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Section Scope:** Pick the Class (e.g., `Grade 10 - Science`) and Section (`Section A`) from top dropdowns.
2. **Review Timetable Grid:** The 6-day weekly grid renders, showing 6-8 periods per day with break intervals.
3. **Add / Schedule a Period:**
   * Click the **"+"** button inside any empty time cell (e.g., Monday Period 1).
   * Slide-over `<TimetablePeriodDrawer>` opens.
   * Select Subject (`Mathematics`), Assigned Teacher (`Fatima Zahra`), Start Time (`08:00 AM`), End Time (`08:45 AM`), and Room (`Room 201`).
   * Click **"Save Period Slot"**.
   * *Conflict Alert:* If the teacher is already scheduled in another section at 08:00 AM, a red conflict banner alerts the coordinator immediately.
4. **Switch View Mode:** Toggle between Interactive Matrix Grid and Printable Table View.
5. **Print / Export:** Click **"Download Timetable (PDF)"** to generate laminated classroom wall charts.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Class & Section | Day of Week | Period Slot | Timing Range | Subject Scheduled | Assigned Faculty | Room Allocated |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **Grade 10-A (SEC-10A)** | Monday | **Period 1** | 08:00 AM - 08:45 AM | Mathematics (`SUB-MTH-10`) | Fatima Zahra (`STF-1005`) | Room 201 |
| **Grade 10-A (SEC-10A)** | Monday | **Period 2** | 08:45 AM - 09:30 AM | Physics Theory (`SUB-PHY-10`) | Hina Qasim (`STF-1010`) | Room 201 |
| **Grade 10-A (SEC-10A)** | Monday | **Period 3** | 09:30 AM - 10:15 AM | Chemistry Lab (`SUB-CHM-10`) | Asad Ullah Khan (`STF-1009`)| Chemistry Lab 2 |
| **Grade 10-A (SEC-10A)** | Monday | **Break** | 10:15 AM - 10:45 AM | *Recess & Refreshment* | *Campus Duty Staff* | Main Courtyard |
| **Grade 10-A (SEC-10A)** | Monday | **Period 4** | 10:45 AM - 11:30 AM | English Literature (`SUB-ENG-10`)| Zainab Bibi (`STF-1011`) | Room 201 |
| **Grade 10-A (SEC-10A)** | Monday | **Period 5** | 11:30 AM - 12:15 PM | Urdu Compulsory (`SUB-URD-10`) | Muhammad Rashid (`STF-1006`)| Room 201 |
| **Grade 10-A (SEC-10A)** | Monday | **Period 6** | 12:15 PM - 01:00 PM | Computer Science (`SUB-CSC-10`)| Sana Mir (`STF-1008`) | Computer Lab 1 |
| **Grade 10-B (SEC-10B)** | Monday | **Period 1** | 08:00 AM - 08:45 AM | Physics Theory (`SUB-PHY-10`) | Hina Qasim (`STF-1010`) | Room 202 |
| **Grade 9-A (SEC-9A)** | Monday | **Period 1** | 08:00 AM - 08:45 AM | Urdu Compulsory (`SUB-URD-10`) | Muhammad Rashid (`STF-1006`)| Room 105 |

---

## 👩‍🏫 Screen 4.2: Teacher Weekly Schedule & Load Matrix

### 📌 1. Screen Identity & Overview
* **Screen Name:** Teacher Individual Schedule & Workload Balancer
* **Navigation Route:** `/TeacherTimetable`
* **Source File Location:** `src/features/academics/TeacherTimetable.tsx`
* **Authorized Access:** Campus Principal, Academic Coordinator, All Teaching Faculty

### 🎯 2. Operational Value & Business Purpose
* **Individual Teacher Schedule:** Isolates the complete weekly schedule for a single teacher across all grades and sections.
* **Faculty Workload Balancing:** Calculates total weekly lecture credit hours (e.g., *24 Periods/Week*) to prevent teacher burnout and ensure equitable workload distribution.
* **Free Period Identification:** Highlights exact time periods when a teacher has no assigned classes (free periods), enabling rapid substitute assignment during emergencies.

### 📝 3. Key Metrics & Controls
* **Teacher Selector:** `<SearchableSelect>` listing all active faculty members.
* **Weekly Load Metric:** Total Assigned Periods (e.g., `22 / 30 Max Weekly Periods`).
* **Daily Lecture Distribution:** Visual count of lectures per day (e.g., Mon: 4, Tue: 5, Wed: 4, Thu: 4, Fri: 3, Sat: 2).
* **View Modes:** Toggle between Weekly Matrix, Visual Class Cards, and Compact Table.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Select Teacher:** Choose teacher from the dropdown (e.g., `Fatima Zahra - STF-1005`).
2. **Review Weekly Commitment:** Inspect total lecture periods and free slots.
3. **Analyze Schedule Gaps:** Check for continuous back-to-back lectures or excessive gap hours.
4. **Print Personal Routine:** Click **"Print Teacher Routine (PDF)"** to issue personal pocket schedules to faculty.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Faculty Member | Designation | Weekly Lecture Load | Mon Periods | Tue Periods | Wed Periods | Thu Periods | Fri Periods | Free Slots / Wk |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Fatima Zahra (`STF-1005`)** | Senior Mathematics | **22 Periods / Wk** | 4 | 5 | 4 | 4 | 3 | 14 Free Slots |
| **Hina Qasim (`STF-1010`)** | Senior Physics | **20 Periods / Wk** | 4 | 4 | 4 | 4 | 3 | 16 Free Slots |
| **Asad Ullah Khan (`STF-1009`)**| Senior Chemistry | **21 Periods / Wk** | 4 | 4 | 5 | 4 | 3 | 15 Free Slots |
| **Muhammad Rashid (`STF-1006`)**| Urdu Lecturer / Librarian | **16 Periods / Wk** | 3 | 3 | 3 | 3 | 3 | 20 Free Slots |
| **Zainab Bibi (`STF-1011`)** | Junior English Teacher | **25 Periods / Wk** | 5 | 5 | 5 | 5 | 4 | 11 Free Slots |
| **Sana Mir (`STF-1008`)** | Computer Science Teacher | **18 Periods / Wk** | 3 | 4 | 3 | 4 | 3 | 18 Free Slots |

---

## 🔄 Screen 4.3: Daily Substitute Teacher Auto-Assignment

### 📌 1. Screen Identity & Overview
* **Screen Name:** Daily Substitute Teacher Management & Smart Proxy Engine
* **Navigation Route:** `/SubstituteManagement`
* **Source File Location:** `src/features/academics/SubstituteManagement.tsx`
* **Authorized Access:** Campus Principal, Vice Principal, Academic Coordinator

### 🎯 2. Operational Value & Business Purpose
* **Zero Classroom Downtime:** When a teacher is absent or on approved leave (from Screen 3.4), this engine automatically identifies all their scheduled lecture periods for today.
* **Smart Auto-Allocation Algorithm:** Evaluates all present teachers, checks who has a free period during that exact time slot, and recommends the best substitute with a single click.
* **Instant Proxy Notifications:** Dispatches push notifications/SMS alerts to substitute teachers informing them of their cover duty class and room number.

### 📝 3. Screen Controls & Information Elements
* **Target Date:** Defaults to today's date (`2026-08-28`).
* **Absent Teacher Selector:** Auto-populated from today's staff attendance records (or manual selection).
* **Uncovered Periods List:** Displays period number, class, section, room, and original subject.
* **Available Free Teachers Dropdown:** Real-time filtered list showing ONLY faculty members who are 100% free during that period.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Morning Absentee Alert:** Check top `<StatCards>`: Total Absent Teachers Today, Uncovered Periods, and Covered Proxies.
2. **Select Absent Teacher:** Choose absent faculty member (e.g., `Hina Qasim - STF-1010 on Medical Leave`).
3. **Inspect Affected Periods:** System displays all classes scheduled for Hina Qasim today (e.g., Period 1 in 10-B, Period 2 in 10-A).
4. **Assign Substitute:**
   * **One-Click Smart Auto-Assign:** Click **"Auto-Allocate All Proxies"** (system matches free teachers with matching subject competence).
   * **Or Manual Selection:** Pick from the *Available Free Teachers* dropdown for each period slot.
5. **Confirm & Notify:** Click **"Publish Proxy Schedule"** to dispatch alerts to substitute teachers and update the daily classroom board.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Absent Teacher | Scheduled Class | Period Slot | Time Range | Subject to Cover | Assigned Substitute Teacher | Substitute's Normal Subject | Proxy Status |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **Hina Qasim (`STF-1010`)** | Grade 10-B (Room 202) | **Period 1** | 08:00 AM - 08:45 AM | Physics | **Asad Ullah Khan (`STF-1009`)** | Chemistry (Free Slot) | `Covered & Notified` |
| **Hina Qasim (`STF-1010`)** | Grade 10-A (Room 201) | **Period 2** | 08:45 AM - 09:30 AM | Physics | **Fatima Zahra (`STF-1005`)** | Mathematics (Free Slot) | `Covered & Notified` |
| **Hina Qasim (`STF-1010`)** | Grade 9-B (Room 106) | **Period 4** | 10:45 AM - 11:30 AM | General Science | **Muhammad Rashid (`STF-1006`)**| Urdu / Library (Free Slot)| `Covered & Notified` |
| **Hina Qasim (`STF-1010`)** | Grade 8-A (Room 101) | **Period 5** | 11:30 AM - 12:15 PM | Physics Intro | **Sana Mir (`STF-1008`)** | Computer Science (Free) | `Covered & Notified` |
| **Zainab Bibi (`STF-1011`)** | Grade 1-A (Room G-02) | **Period 1** | 08:00 AM - 08:45 AM | English Reading | **Mrs. Ayesha Kamran** | Junior In-Charge | `Covered & Notified` |
| **Zainab Bibi (`STF-1011`)** | Grade 1-A (Room G-02) | **Period 3** | 09:30 AM - 10:15 AM | Activity Math | **Fatima Zahra (`STF-1005`)** | Mathematics (Free Slot) | `Covered & Notified` |

---

## 🎯 Phase 4 Milestone Completed

Phase 4 completes the operational scheduling backbone:
* **Master class weekly timetables** are configured without any room or teacher conflicts.
* **Teacher workload distribution** is balanced across all faculty members.
* **Daily emergency substitute allocation engine** is active, ensuring 100% classroom supervision even during unexpected teacher leaves.

👉 **Next Phase:** We proceed directly to **Phase 5: Student Lifecycle, Inquiries & Admissions** (`Phase_05_Student_Lifecycle_and_Admissions.md`) covering Online Public Admissions, Inquiries, Student Enrollments, Master Directory, Behavior Logs, House Systems, and Annual Promotions!
