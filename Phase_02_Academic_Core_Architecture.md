# 🏫 VOKE Solutions SMS — Phase 2: Academic Core Architecture

> **System:** VOKE Solutions School Management System (SMS)  
> **Phase Target:** Phase 2 — Academic Sessions, Classes, Sections, Subjects Master Catalog & Curriculum Mapping  
> **Documentation Style:** Point-to-Point Step-by-Step Guide with Clean Data Tables  
> **Language:** English  
> **Data Integrity:** 100% Relational Human-Readable Dataset — **Zero Raw GUIDs (Fully Linked to Phase 1 Campuses & Staff)**

---

## 📑 Phase 2 Navigation Overview

* [Screen 2.1: Academic Sessions & Terms (`/AcademicYears`)](#-screen-21-academic-sessions--terms)
* [Screen 2.2: Classes & Grades Definition (`/Classes`)](#-screen-22-classes--grades-definition)
* [Screen 2.3: Sections & Capacity Manager (`/Sections`)](#-screen-23-sections--capacity-manager)
* [Screen 2.4: Subjects Master Catalog (`/Subjects`)](#-screen-24-subjects-master-catalog)
* [Screen 2.5: Class-Subject Curriculum Mapping (`/ClassSubject`)](#-screen-25-class-subject-curriculum-mapping)

---

## 🗓️ Screen 2.1: Academic Sessions & Terms

### 📌 1. Screen Identity & Overview
* **Screen Name:** Academic Years & Session Governance
* **Navigation Route:** `/AcademicYears`
* **Source File Location:** `src/features/academics/AcademicYears.tsx`
* **Authorized Access:** Super Administrator, Campus Principal, Academic Coordinator

### 🎯 2. Operational Value & Business Purpose
* **Institutional Timeline:** Defines the formal educational year (e.g., *2026-2027*) with precise start and end dates.
* **Active Session Lock:** Only one academic year can be set as `Current Active Session` per campus. All daily attendance, timetables, and fee challans are automatically tied to this active year.
* **Historical Data Retention:** When a new year starts, past years are archived rather than deleted, preserving historical broadsheets and student transcripts.

### 📝 3. Form Fields & Input Information
* **Session Title:** Descriptive name of the educational year (e.g., `Academic Session 2026-2027`).
* **Start Date:** First official day of classes (e.g., `2026-08-01`).
* **End Date:** Final day of the academic term/session (e.g., `2027-06-30`).
* **Is Current Active Session:** Toggle switch marking this as the live operational year for the school.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Session Registry:** Inspect list of existing past and upcoming academic years with status badges.
2. **Add a New Academic Session:**
   * Click **"+ Create Academic Year"** button.
   * Input the **Session Title** (e.g., *Academic Session 2026-2027*).
   * Pick **Start Date** and **End Date** using the `<DatePicker>`.
   * Check the **"Set as Current Active Year"** toggle if this session is starting immediately.
   * Click **"Save Academic Year"**.
3. **Manage Existing Sessions (`...`):**
   * **Set as Active:** Instantly sets the selected session as the global live context (automatically deactivates the previous year).
   * **Edit Dates:** Adjust start/end dates for session extensions.
   * **Archive Session:** Lock past years to prevent accidental grade or fee modifications.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Session Code | Session Title | Start Date | End Date | Duration | Is Current Active? | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **AY-2026-27** | Academic Session 2026-2027 | 2026-08-01 | 2027-06-30 | 11 Months | `Yes (Active Live)` | `Current` |
| **AY-2025-26** | Academic Session 2025-2026 | 2025-08-01 | 2026-06-30 | 11 Months | `No` | `Archived` |
| **AY-2024-25** | Academic Session 2024-2025 | 2024-08-01 | 2025-06-30 | 11 Months | `No` | `Archived` |
| **AY-2027-28** | Academic Session 2027-2028 (Planning) | 2027-08-01 | 2028-06-30 | 11 Months | `No` | `Draft / Upcoming` |

---

## 🏛️ Screen 2.2: Classes & Grades Definition

### 📌 1. Screen Identity & Overview
* **Screen Name:** Classes & Grade Levels Master Setup
* **Navigation Route:** `/Classes`
* **Source File Location:** `src/features/academics/Classes.tsx`
* **Authorized Access:** Campus Principal, Academic Coordinator, Super Admin

### 🎯 2. Operational Value & Business Purpose
* **Academic Hierarchy:** Establishes all grade levels taught at the campus (from Playgroup, Kindergarten to Grade 10 Matric and Cambridge O/A-Levels).
* **Fee Structure Anchor:** Monthly tuition fees, exam dues, and syllabus packages are configured at the class level.
* **Promotion Ladder:** Acts as the progression ladder when promoting students at the end of the academic year.

### 📝 3. Form Fields & Input Information
* **Class Code:** Short uppercase identifier (e.g., `CLS-G10-SCI`, `CLS-KG`).
* **Class Name:** Full title of the grade (e.g., *Grade 10 - Matric Science*, *Kindergarten Montessori*).
* **Academic Wing / Group:** (e.g., *Primary Wing*, *Middle School*, *Secondary / Matric*, *Cambridge O-Levels*).
* **Ordering Index:** Numeric sort order (1 to 15) to ensure classes display sequentially in dropdowns.

### ⚙️ 4. Step-by-Step Operator Guide
1. **View Class Directory:** View top KPI cards displaying *Total Registered Classes*, *Active Sections Count*, and *Total Enrolled Students*.
2. **Search Classes:** Use `<DebouncedSearch>` to filter classes by name or code.
3. **Create a New Class:**
   * Click **"+ Add New Class"** button on the top right.
   * The `<ProfileDrawer>` will slide open.
   * Enter **Class Code** (e.g., `CLS-G10-SCI`) and **Class Name** (e.g., *Grade 10 - Science*).
   * Click **"Save Class"**.
4. **Manage Classes (`...`):**
   * **Edit Details:** Rename class or adjust code.
   * **View Sections:** Direct link to Screen 2.3 filtered for this specific class.
   * **Delete Class:** Allowed only if zero students and zero fee structures are attached.
5. **Export Directory:** Click **Export PDF** or **Export CSV** for school prospectus documentation.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Class Code | Class Display Name | Academic Wing / Level | Sort Order | Total Active Sections | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **CLS-NUR** | Nursery / Early Years | Montessori Early Childhood | 1 | 2 Sections | `Active` |
| **CLS-KG** | Kindergarten (KG) | Montessori Early Childhood | 2 | 2 Sections | `Active` |
| **CLS-G1** | Grade 1 | Primary School Wing | 3 | 3 Sections | `Active` |
| **CLS-G5** | Grade 5 | Primary School Wing | 7 | 3 Sections | `Active` |
| **CLS-G8** | Grade 8 | Middle School Wing | 10 | 3 Sections | `Active` |
| **CLS-G9-SCI** | Grade 9 - Science (Matric) | Secondary School Wing | 11 | 2 Sections | `Active` |
| **CLS-G10-SCI** | Grade 10 - Science (Matric) | Secondary School Wing | 12 | 2 Sections | `Active` |
| **CLS-O1** | O-Level (Year 1 / Grade 9) | Cambridge International | 13 | 2 Sections | `Active` |
| **CLS-O2** | O-Level (Year 2 / Grade 10) | Cambridge International | 14 | 2 Sections | `Active` |

---

## 🚪 Screen 2.3: Sections & Capacity Manager

### 📌 1. Screen Identity & Overview
* **Screen Name:** Class Sections & Room Capacity Manager
* **Navigation Route:** `/Sections`
* **Source File Location:** `src/features/academics/Sections.tsx`
* **Authorized Access:** Campus Principal, Academic Coordinator

### 🎯 2. Operational Value & Business Purpose
* **Classroom Division:** Splits large classes into manageable classroom units (e.g., Section A, Section B, Section C).
* **Class Teacher Appointment:** Assigns a dedicated faculty member as the primary Class Teacher responsible for morning attendance and student welfare.
* **Physical Room Allocation & Seat Cap:** Sets max student seating capacity and assigns physical classroom room numbers (e.g., Room 201) to prevent classroom overcrowding.

### 📝 3. Form Fields & Input Information
* **Parent Class:** Select from registered classes (e.g., `Grade 10 - Science`).
* **Section Name:** Name of the section (e.g., *Section A - Blue Birds*, *Section B - Eagles*).
* **Physical Room Number:** Classroom location identifier (e.g., `Room 201 - 2nd Floor`).
* **Assigned Class Teacher:** Select from faculty staff registered in Phase 1 (e.g., *Fatima Zahra - `USR-1005`*).
* **Maximum Student Capacity:** Maximum allowed students before enrollment is blocked (e.g., `40 Students`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Filter by Class:** Select a class from the top `<SearchableSelect>` dropdown to view all sections in that grade.
2. **Add a New Section:**
   * Click **"+ Add Section"** button.
   * In the drawer form, choose the **Parent Class**.
   * Enter **Section Name** (e.g., `Section A`), **Room Number** (e.g., `Room 201`), and **Max Capacity** (e.g., `40`).
   * Select the designated **Class Teacher** from the staff dropdown.
   * Click **"Save Section"**.
3. **Monitor Enrollment Pressure:** Check visual capacity meters (e.g., `38 / 40 Enrolled - 95% Full`).
4. **Manage Section Actions (`...`):**
   * **Reassign Class Teacher:** Change the appointed class teacher.
   * **Update Room / Capacity:** Expand capacity or re-assign to a larger hall.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Section Code | Parent Class | Section Name | Physical Room | Appointed Class Teacher | Max Capacity | Enrolled Count |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **SEC-10A** | Grade 10 - Science | Section A (Quaid) | Room 201 (2nd Floor) | Fatima Zahra (`USR-1005`) | 40 | 38 Students |
| **SEC-10B** | Grade 10 - Science | Section B (Iqbal) | Room 202 (2nd Floor) | Hina Qasim (`USR-1010`) | 40 | 36 Students |
| **SEC-9A** | Grade 9 - Science | Section A (Sir Syed) | Room 105 (1st Floor) | Muhammad Rashid (`USR-1006`) | 40 | 39 Students |
| **SEC-9B** | Grade 9 - Science | Section B (Jauhar) | Room 106 (1st Floor) | Asad Ullah Khan (`USR-1009`) | 40 | 35 Students |
| **SEC-8A** | Grade 8 | Section A (Falcon) | Room 101 (1st Floor) | Sana Mir (`USR-1008`) | 40 | 40 (Full) |
| **SEC-1A** | Grade 1 | Section A (Sunflowers) | Room G-02 (Ground) | Mrs. Ayesha Kamran | 30 | 28 Students |
| **SEC-O1A** | O-Level (Year 1) | Section Cambridge-A | Room O-101 (O-Wing) | Dr. Shahida Parveen (`USR-1004`) | 25 | 22 Students |

---

## 📚 Screen 2.4: Subjects Master Catalog

### 📌 1. Screen Identity & Overview
* **Screen Name:** Subjects Master Catalog & Elective Groups
* **Navigation Route:** `/Subjects`
* **Source File Location:** `src/features/academics/Subjects.tsx`
* **Authorized Access:** Campus Principal, Head of Department (HOD)

### 🎯 2. Operational Value & Business Purpose
* **Curriculum Master Directory:** Houses all subjects taught across the entire institution (e.g., Mathematics, Physics, Chemistry, Urdu, Islamiat, Robotics).
* **Elective Group Management:** Categorizes subjects into Core (Compulsory) versus Elective Streams (e.g., *Group A: Pre-Medical*, *Group B: Computer Science*).
* **Grading & Report Card Engine:** Establishes subject codes printed on Board Exam registration forms and student report cards.

### 📝 3. Form Fields & Input Information
* **Subject Code:** Unique curriculum code (e.g., `SUB-MATH-10`, `SUB-PHY-10`).
* **Subject Name:** Full title of the course (e.g., *Mathematics (Compulsory)*, *Physics Theoretical & Lab*).
* **Subject Type:** Toggle between `Core Compulsory` and `Elective Subject`.
* **Elective Group Name:** (If Elective) Select from *Pre-Medical*, *Pre-Engineering*, *Computer Science & IT*, *Commerce & Economics*, *Humanities*, *Fine Arts*.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Switch Subject Tabs:** View *All Subjects*, *Core Compulsory Only*, or *Elective Streams Only*.
2. **Add a New Subject:**
   * Click **"+ Add New Subject"** button.
   * Enter **Subject Code** (e.g., `SUB-CS-10`) and **Subject Name** (e.g., *Computer Science & Programming*).
   * Toggle **"Is Elective?"** switch if students choose this as an optional stream.
   * Select the **Elective Group Name** if applicable.
   * Click **"Save Subject"**.
3. **Manage Subjects (`...`):**
   * **Edit Curriculum Info:** Rename course title or change elective grouping.
   * **View Assigned Classes:** Inspect all grades currently taking this course.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Subject Code | Subject Name | Subject Category | Elective Stream Group | Is Elective? | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **SUB-ENG-10** | English Language & Literature | Core Compulsory | N/A (Compulsory for All) | `No` | `Active` |
| **SUB-URD-10** | Urdu Compulsory | Core Compulsory | N/A (Compulsory for All) | `No` | `Active` |
| **SUB-ISL-10** | Islamic Studies / Ethics | Core Compulsory | N/A (Compulsory for All) | `No` | `Active` |
| **SUB-PST-10** | Pakistan Studies | Core Compulsory | N/A (Compulsory for All) | `No` | `Active` |
| **SUB-MTH-10** | Mathematics (General & Science) | Core Compulsory | N/A (Compulsory for All) | `No` | `Active` |
| **SUB-PHY-10** | Physics (Theory & Practical Lab) | Science Stream | Group B: Pre-Engineering & Science | `Yes` | `Active` |
| **SUB-CHM-10** | Chemistry (Theory & Lab) | Science Stream | Group A: Pre-Medical & Pre-Eng | `Yes` | `Active` |
| **SUB-BIO-10** | Biology (Zoology & Botany) | Medical Stream | Group A: Pre-Medical Stream | `Yes` | `Active` |
| **SUB-CSC-10** | Computer Science & Coding | IT Stream | Group C: Computer Science & IT | `Yes` | `Active` |
| **SUB-ART-10** | Fine Arts, Graphics & Design | Arts Stream | Group F: Fine Arts & Design | `Yes` | `Active` |

---

## 🔗 Screen 2.5: Class-Subject Curriculum Mapping

### 📌 1. Screen Identity & Overview
* **Screen Name:** Class-Subject Curriculum Mapping & Marks Weightage
* **Navigation Route:** `/ClassSubject`
* **Source File Location:** `src/features/academics/ClassSubject.tsx`
* **Authorized Access:** Campus Principal, Academic Coordinator, Examination Controller

### 🎯 2. Operational Value & Business Purpose
* **Curriculum Binding:** Binds specific subjects from Screen 2.4 to specific classes from Screen 2.2 (e.g., Grade 10-Science takes Mathematics, Physics, Chemistry, English, Urdu, Islamiat).
* **Assessment Benchmarks:** Sets official **Total Marks** (e.g., 100 or 75) and **Passing Marks Threshold** (e.g., 33% or 40%) for every subject in that class.
* **Automation for Exams & Timetable:** Timetable creation (Phase 4) and Marks Entry Dashboards (Phase 9) automatically pull only the subjects mapped here.

### 📝 3. Form Fields & Input Information
* **Target Class:** Select target grade from `<SearchableSelect>` (e.g., `Grade 10 - Science`).
* **Target Subject:** Select subject from master catalog (e.g., `Mathematics - SUB-MTH-10`).
* **Total Marks:** Maximum theoretical and practical marks combined (e.g., `100.00` or `75.00`).
* **Passing Marks:** Minimum score required to pass (e.g., `33.00` for Matric, `40.00` for Cambridge).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Filter by Class:** Choose `Grade 10 - Science` in the top filter to inspect its complete active curriculum.
2. **Map a New Subject to Class:**
   * Click **"+ Map Subject to Class"** button.
   * Select the **Class** and the **Subject** from the searchable dropdowns.
   * Enter **Total Marks** (`100.00`) and **Passing Marks** (`33.00`).
   * Click **"Save Mapping"**.
3. **Verify Total Marks Weightage:** Ensure the total combined marks across all mapped subjects match the annual examination criteria (e.g., 8 subjects = 800 total marks).
4. **Remove or Update Mapping (`...`):**
   * **Edit Marks:** Adjust passing mark criteria before an examination term begins.
   * **Unmap Subject:** Remove course from syllabus if curriculum changes.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Mapping Code | Target Class | Mapped Subject Name | Subject Code | Total Marks | Passing Marks | Passing % |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **MAP-10-MTH** | Grade 10 - Science | Mathematics | `SUB-MTH-10` | 100.00 | 33.00 | 33% |
| **MAP-10-PHY** | Grade 10 - Science | Physics (Theory + Lab) | `SUB-PHY-10` | 100.00 | 33.00 | 33% |
| **MAP-10-CHM** | Grade 10 - Science | Chemistry (Theory + Lab)| `SUB-CHM-10` | 100.00 | 33.00 | 33% |
| **MAP-10-ENG** | Grade 10 - Science | English Literature | `SUB-ENG-10` | 100.00 | 33.00 | 33% |
| **MAP-10-URD** | Grade 10 - Science | Urdu Compulsory | `SUB-URD-10` | 100.00 | 33.00 | 33% |
| **MAP-10-ISL** | Grade 10 - Science | Islamic Studies | `SUB-ISL-10` | 100.00 | 33.00 | 33% |
| **MAP-10-PST** | Grade 10 - Science | Pakistan Studies | `SUB-PST-10` | 50.00 | 17.00 | 34% |
| **MAP-10-CSC** | Grade 10 - Science | Computer Science & IT | `SUB-CSC-10` | 100.00 | 33.00 | 33% |
| **MAP-O1-MTH** | O-Level (Year 1) | Cambridge Mathematics | `SUB-MTH-10` | 100.00 | 40.00 | 40% |
| **MAP-O1-PHY** | O-Level (Year 1) | Cambridge Physics (5054)| `SUB-PHY-10` | 100.00 | 40.00 | 40% |

---

## 🎯 Phase 2 Milestone Completed

Phase 2 successfully establishes the complete academic foundation:
* **Live academic session `AY-2026-27`** is established.
* **Classes (`CLS-G10-SCI`, `CLS-O1`, etc.)** and **Sections (`SEC-10A`, `SEC-10B`)** are defined with appointed class teachers and room limits.
* **Subjects catalog** and **Class-Subject syllabus mappings** with marks weightages are configured.

👉 **Next Phase:** We will proceed to **Phase 3: Human Resources & Staff Management** (`Phase_03_HR_and_Staff_Management.md`) covering Staff Directory, Biometric Attendance, Leave Applications, Approvals, Loans, Appraisals, and Resignation Clearances.
