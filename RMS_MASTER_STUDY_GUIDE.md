# 📘 Restaurant Management System (RMS) - Master Interactive Study & Workflow Guide

Welcome to the comprehensive, step-by-step master study guide for the Restaurant Management System (RMS). This document tracks every single module, screen, data flow, API endpoint, database schema, Agent 1 UI design pattern compliance, and multi-scenario test dataset covered across our interactive turn-by-turn development cycle.

---

## 🏛️ System Architecture & Agent 1 UI Design Patterns

- **Backend Architecture:** .NET 10 Clean Architecture (`RMS.API`, `RMS.Application`, `RMS.Domain`, `RMS.Infrastructure`, EF Core, SQL Server / PostgreSQL).
- **Frontend Architecture:** Vite + React + TypeScript + TailwindCSS with dark mode support.
- **Agent 1 UI Design System Rules:**
  1. **Reusable Form Controls:**
     - Dropdowns MUST use `<SearchableSelect>` (`src/components/form/select/SearchableSelect.tsx`).
     - Dates MUST use `<DatePicker>` (`src/components/form/date-picker.tsx`).
     - Times MUST use `<TimePicker>` (`src/components/form/TimePicker.tsx`).
     - Multi-Select MUST use `<MultiSelect>` (`src/components/form/MultiSelect.tsx`).
     - Image Uploads MUST use `<ImageUpload>` (`src/components/form/ImageUpload.tsx`).
     - Rich Text MUST use `<RichTextEditor>` (`src/components/form/RichTextEditor.tsx`).
     - Labels MUST use `<Label required>` (`src/components/form/Label.tsx`).
     - Search inputs MUST use `<DebouncedSearch>` (`src/components/form/DebouncedSearch.tsx`).
  2. **Advanced UI Components:**
     - Toasts via `toast.success()`, `toast.error()`, `toast.info()` from `src/components/ui/Toast.tsx`.
     - Tooltips via `<Tooltip content="...">` (`src/components/ui/Tooltip.tsx`).
     - Loading Skeletons via `<Skeleton />` (`src/components/ui/Skeleton.tsx`).
     - Multi-step forms via `<Stepper />` (`src/components/ui/Stepper.tsx`).
     - Page navigation paths via `<Breadcrumb />` (`src/components/ui/Breadcrumb.tsx`).
  3. **Datatable & Directory Layouts:**
     - Top Summary Cards using `<StatCards>` (`src/components/ui/UIDesigns/StatCards.tsx`).
     - TanStack Table with global search, sorting, column filters, CSV/PDF exports, and custom pagination.
     - Table wrappers configured with `overflow-x-auto min-h-[250px]`.
  4. **Dropdown Actions (Portal Pattern):**
     - Action menus MUST use React Portals (`createPortal` to `document.body`) via `<ActionMenu>` (`src/components/ui/UIDesigns/ActionMenu.tsx`).
  5. **Form Views Standard:**
     - Small Forms & Details: Open in `<ProfileDrawer>` (`src/components/ui/UIDesigns/ProfileDrawer.tsx`).
     - Large Forms: Dedicated full-page view with Header "Back" button, grouped cards, and fixed bottom action bar.
  6. **Dark Mode Aesthetics:**
     - Full support for dark mode using Tailwind slate/gray configs (`dark:bg-gray-900`, `dark:border-gray-800`, `dark:text-gray-300`).

---

## 🔐 TURN 1: Authentication & Password Security

### Screen 1: Sign In & Authentication (`/signin`)
- **Primary Function:** Verifies user identity, issues JWT & Refresh tokens, handles 2FA authentication, and routes users to role-based dashboards (`Admin`, `Teacher`, `Student`, `Parent`, `Staff`).
- **Agent 1 & UI Pattern Compliance:**
  - Workspace selector with live primary branding theme synchronization.
  - Password Input with crisp Lucide `<Eye>` / `<EyeOff>` visibility toggle icons.
  - Conditional 2FA OTP code input field (`requires2FA`).
  - Auto-sliding School ERP features carousel (4-second interval).
  - Auto URL query cleanup for `session_expired` parameters to avoid duplicate alerts.
- **Backend API & Schema:**
  - Endpoint: `POST /api/users/login`
  - Tables: `Users`, `Tenants`, `Roles`, `UserRoles`.
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Standard Admin Login
```json
{
  "Workspace": "Voke Main Campus",
  "Email": "admin@voke.edu.pk",
  "Password": "AdminPassword123!",
  "Expected Result": "Navigates to /dashboard"
}
```

#### Test Case 2: Teacher Login
```json
{
  "Workspace": "Voke Main Campus",
  "Email": "teacher@voke.edu.pk",
  "Password": "TeacherPassword123!",
  "Expected Result": "Navigates to /dashboard with Teacher RBAC privileges"
}
```

#### Test Case 3: Invalid Credentials Test
```json
{
  "Workspace": "Voke Main Campus",
  "Email": "admin@voke.edu.pk",
  "Password": "WrongPassword999!",
  "Expected Result": "Displays red error banner 'Invalid email or password' (Session expired alert stays hidden)"
}
```

---

### Screen 2: Sign Up & Password Recovery (`/signup`, `/ForgotPassword`, `/ResetPassword`)
- **Primary Function:** Handles new user registration and 2-step password recovery (Request Token -> Verify Token -> Reset Password).
- **Agent 1 & UI Pattern Compliance:**
  - Registration Form: `First Name`, `Last Name`, `Role`, `Email`, `Password`, `Workspace`.
  - Password Reset Flow: Email verification -> 6-digit token input -> New password assignment.
- **Auto-Role Seeding Engine:**
  - `UsersController.cs` automatically seeds standard tenant roles (`Admin`, `Teacher`, `Student`, `Parent`, `Staff`) on demand if a newly registered workspace has unseeded roles.
- **Backend API & Schema:**
  - Endpoints: `POST /api/users/register`, `POST /api/users/forgot-password`, `POST /api/users/verify-token`, `POST /api/users/reset-password`.
  - Tables: `Users`, `Tenants`, `Roles`, `UserRoles`.
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Register New Teacher Account
```json
{
  "Workspace": "Voke Main Campus",
  "First Name": "Tariq",
  "Last Name": "Mahmood",
  "Role": "Teacher",
  "Email": "tariq.teacher@voke.edu.pk",
  "Password": "TeacherPass123!",
  "Expected Result": "Account created successfully -> Redirects to /signin"
}
```

#### Test Case 2: Register New Parent Account
```json
{
  "Workspace": "Voke Main Campus",
  "First Name": "Usman",
  "Last Name": "Ali",
  "Role": "Parent",
  "Email": "usman.parent@voke.edu.pk",
  "Password": "ParentPass123!",
  "Expected Result": "Account created successfully -> Redirects to /signin"
}
```

#### Test Case 3: Password Reset Flow
```json
{
  "Step 1 - Request Token": {
    "Workspace": "Voke Main Campus",
    "Email": "tariq.teacher@voke.edu.pk"
  },
  "Step 2 - Verify Token": {
    "Token": "849201 (or token logged in backend console)"
  },
  "Step 3 - Reset Password": {
    "New Password": "NewTeacherPass2026!",
    "Confirm Password": "NewTeacherPass2026!"
  }
}
```

---

## 📊 TURN 2: Dashboards & Omnichannel Announcements

### Screen 3: Executive Master Dashboard (`/dashboard`)
- **Primary Function:** Serves as the central executive command panel displaying real-time metrics, financial analytics, campus presence, class fee breakdown, and live activity feeds.
- **Agent 1 & UI Pattern Compliance:**
  - **Welcome Banner:** Glassmorphic banner showing live active enrollments and campus presence percentage.
  - **KPI Stat Cards:** Total Enrollment, Active Staff, MTD Revenue, and Live Attendance presence %.
  - **PDF Export Engine:** `jsPDF` + `autoTable` generating printable `EduERP_Dashboard_Report.pdf`.
  - **Revenue Insights Chart:** Recharts `<AreaChart>` tracking monthly collections vs targeted goals.
  - **Live Attendance Donut:** Recharts `<PieChart>` showing Present, Late, and Absent breakdown.
  - **Fee Status Table:** Class-wise paid vs pending fee progress bars.
  - **Activity Feed Timeline:** Real-time event log with color-coded icons.
- **Backend API & Schema:**
  - Endpoints: `GET /api/dashboard/stats`, `GET /api/notices/active/tenant/{tenantId}`.
  - Tables: `Students`, `Staff`, `StudentAttendance`, `StaffAttendance`, `FeeChallans`, `Classes`, `Notices`, `AuditLogs`.
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: PDF Analytics Report Generation
```json
{
  "Action": "Click 'Download Report' button at the top right of /dashboard",
  "Expected Result": "Generates and downloads 'EduERP_Dashboard_Report.pdf' containing snapshot table and class breakdown."
}
```

#### Test Case 2: Quick Action Navigation
```json
{
  "Action 1": "Click 'New Student' -> Opens /students directory",
  "Action 2": "Click 'Collect Fee' -> Opens /FeeChallans fee collection",
  "Action 3": "Click 'Attendance' -> Opens /StudentAttendance register",
  "Action 4": "Click 'Broadcast' -> Opens /Noticeboard announcements"
}
```

---

### Screen 4: Digital Notice Board & Announcements (`/Noticeboard`)
- **Primary Function:** Digital bulletin board for posting announcements targeted to `Everyone`, `Students`, `Teachers`, `Parents`, or `Staff`.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Panel:** Top summary cards for Total Announcements, Active Bulletins, and Urgent & High Priority counts.
  - **Audience & Priority Filters:** Interactive tab filters (`Everyone`, `Students`, `Teachers`, `Parents`, `Staff`) and priority tabs (`All`, `Normal`, `High`, `Urgent`).
  - **Pin-Tape Announcement Cards:** Rich glassmorphic card design with glowing urgent pulse badges.
  - **ActionMenu Portals:** `<ActionMenu>` (`src/components/ui/UIDesigns/ActionMenu.tsx`) using React Portals (`createPortal` to `document.body`) for Edit & Delete options (Rule 4 Compliance).
  - **Form Controls:** `<Label required>`, `<Input>`, `<SearchableSelect>` for Target Audience & Priority, and `<DatePicker>` for Expiry Date (Rule 1 Compliance).
- **Backend API & Schema:**
  - Endpoints: `GET /api/notices/tenant/{tenantId}`, `GET /api/notices/active/tenant/{tenantId}`, `POST /api/notices`, `PUT /api/notices/{id}`, `DELETE /api/notices/{id}`.
  - Table: `Notices` (`id`, `tenant_id`, `title`, `content`, `target_audience`, `priority`, `is_active`, `published_at`, `expires_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Urgent Sports Gala Announcement (Target: Everyone)
```json
{
  "Bulletin Title": "Annual Sports Gala 2026 Announcement",
  "Detailed Message Content": "We are excited to announce that the Annual Sports Gala 2026 will be held from August 15th to August 18th. All students and teachers are requested to complete registrations by next Monday.",
  "Target Audience": "Everyone (All)",
  "Priority": "Urgent",
  "Expiry Date": "2026-08-20",
  "Publish Immediately": true,
  "Expected Visual": "Red glowing animated pulse badge + Red gradient header title"
}
```

#### Test Case 2: Parent-Teacher Meeting Notice (Target: Parents)
```json
{
  "Bulletin Title": "First Term Parent-Teacher Meeting (PTM)",
  "Detailed Message Content": "Dear Parents, the First Term PTM is scheduled for Saturday, August 10th from 9:00 AM to 1:00 PM. Please arrive on time to discuss your child's progress.",
  "Target Audience": "Parents Only",
  "Priority": "High",
  "Expiry Date": "2026-08-11",
  "Publish Immediately": true,
  "Expected Visual": "Amber high priority badge + Violet audience badge"
}
```

#### Test Case 3: Teachers Staff Meeting Notice (Target: Teachers)
```json
{
  "Bulletin Title": "Academic Curriculum Review Meeting",
  "Detailed Message Content": "All faculty members are requested to attend the monthly curriculum review meeting in the main auditorium this Friday at 2:30 PM.",
  "Target Audience": "Teachers Only",
  "Priority": "Normal",
  "Expiry Date": "2026-08-08",
  "Publish Immediately": true,
  "Expected Visual": "Emerald audience badge + Slate normal priority badge"
}
```

#### Test Case 4: Expired Announcement Test
```json
{
  "Bulletin Title": "Past Library Book Return Notice",
  "Detailed Message Content": "Please return all borrowed library books before the summer break.",
  "Target Audience": "Students Only",
  "Priority": "Normal",
  "Expiry Date": "2026-06-01",
  "Publish Immediately": true,
  "Expected Visual": "Grayed out 60% opacity card + Red 'Expired: 01 June 2026' indicator"
}
```

---

## 📚 TURN 3: Core Academic Structure & Grade Level Management

### Screen 5: Academic Years Management (`/AcademicYears`)
- **Primary Function:** Manages school calendar sessions (e.g. `2025-2026`, `2026-2027`), designates the single active operational session for attendance and fee processing, and displays duration metrics.
- **Agent 1 & UI Pattern Compliance:**
  - **Active Session Hero Banner:** Dynamic gradient banner highlighting the active session with live progress bar (% complete), days remaining calculation, and total duration months.
  - **ActionMenu Portals:** `<ActionMenuPortal>` using React Portals (`createPortal` to `document.body`) for "Set as Active", "Edit Details", and "Delete Year" (Rule 4 Compliance).
  - **Form View:** Full-page form view with `<Label required>` for mandatory titles and Flatpickr `<DatePicker>` for start and end dates (Rule 1 & Rule 5 Compliance).
  - **Status Warnings:** SweetAlert2 confirmation modals before changing the active operational session.
- **Backend API & Schema:**
  - Endpoints: `GET /api/academicyears/tenant/{tenantId}`, `POST /api/academicyears`, `PUT /api/academicyears/{id}`, `DELETE /api/academicyears/{id}`.
  - Table: `AcademicYears` (`id`, `tenant_id`, `title`, `start_date`, `end_date`, `is_current`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Create Next Academic Session
```json
{
  "Title": "2026-2027 (Annual)",
  "Start Date": "2026-08-01",
  "End Date": "2027-06-30",
  "Set as Active": true,
  "Expected Result": "Creates new session and sets as current active session (deactivates previous session)"
}
```

#### Test Case 2: Create Past Completed Session
```json
{
  "Title": "2024-2025 (Completed)",
  "Start Date": "2024-08-01",
  "End Date": "2025-06-30",
  "Set as Active": false,
  "Expected Result": "Creates session in Other Sessions grid marked as 'Completed' with 100% progress"
}
```

---

### Screen 6: Classes Setup & Grade Levels (`/Classes`)
- **Primary Function:** Manages class grade levels (e.g., `Grade 1` to `Grade 10`, `O-Levels`, `Matric`), assigns short codes, and provides CSV/PDF ledger exports.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Stat Cards:** Top summary cards (`<StatCards>`) for Total Classes, Coded Grades, and Unnamed Forms (Rule 3 Compliance).
  - **Datatable Ledger:** TanStack Table with column sorting, global search filter, custom page size selector (10, 20, 50 rows), and `overflow-x-auto min-h-[250px]`.
  - **Slide-Over Drawer:** `<ClassFormDrawer>` with slide-over backdrop drawer pattern for small forms (Rule 5 Compliance) and `<Label required>` field labels.
  - **Action Menu Portals:** `<ClassActionMenu>` built with React Portals (`createPortal` to `document.body`) for View Details, Edit Record, and Delete actions (Rule 4 Compliance).
  - **Data Export:** Integrated `jsPDF` + `autoTable` PDF report generation and CSV download actions.
- **Backend API & Schema:**
  - Endpoints: `GET /api/classes/tenant/{tenantId}`, `POST /api/classes`, `PUT /api/classes/{id}`, `DELETE /api/classes/{id}`.
  - Table: `Classes` (`id`, `tenant_id`, `name`, `code`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Create Matriculation Grade
```json
{
  "Class Name": "Grade 10 (Matric Science)",
  "Short Code": "G10-SCI",
  "Expected Result": "Adds class to ledger with code badge 'G10-SCI'"
}
```

#### Test Case 2: Create Cambridge O-Levels Grade
```json
{
  "Class Name": "O-Levels Senior Year",
  "Short Code": "OL-SR",
  "Expected Result": "Adds class to ledger with code badge 'OL-SR'"
}
```

#### Test Case 3: Data Export Test
```json
{
  "Action 1": "Click CSV button -> Downloads 'classes_directory.csv'",
  "Action 2": "Click PDF button -> Downloads 'classes_directory.pdf'"
}
```

---

## 🏫 TURN 4: Classrooms, Sections & Subject Curriculum Catalog

### Screen 7: Sections & Classroom Allocation (`/Sections`)
- **Primary Function:** Divides class grade levels into specific sections/batches (e.g. `Section A`, `Section B`), assigns room numbers, and sets maximum student capacity limits per section.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Panel:** Top summary cards for Total Sections, Assigned Rooms, and Average Student Capacity.
  - **Class Filter Tabs:** Quick filter tabs for switching between specific classes or viewing `All Classes`.
  - **Slide-Over Form Drawer:** `<SectionFormDrawer>` with `<SearchableSelect>` for class selection, `<Label required>` for section names, and room capacity limits.
  - **Action Menu Portals:** `<SectionActionMenu>` built with React Portals (`createPortal` to `document.body`) for View Details, Edit Record, and Delete actions (Rule 4 Compliance).
  - **Data Export:** Integrated PDF and CSV exports for section allocations.
- **Backend API & Schema:**
  - Endpoints: `GET /api/sections/tenant/{tenantId}`, `POST /api/sections`, `PUT /api/sections/{id}`, `DELETE /api/sections/{id}`.
  - Table: `Sections` (`id`, `tenant_id`, `class_id`, `name`, `room_number`, `max_capacity`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Standard Science Section Allocation
```json
{
  "Class": "Grade 10 (Matric Science)",
  "Section Name": "Section A (Bio-Science)",
  "Room Number": "Room 102",
  "Max Capacity": 45,
  "Expected Result": "Adds section with badge 'Max 45 Students / Section' and room icon 'Room 102'"
}
```

#### Test Case 2: Computer Science Lab Section
```json
{
  "Class": "Grade 10 (Matric Science)",
  "Section Name": "Section B (Computer)",
  "Room Number": "CS Lab 1",
  "Max Capacity": 35,
  "Expected Result": "Adds lab section with capacity limit 35 seats"
}
```

---

### Screen 8: Academic Subjects Catalog (`/Subjects`)
- **Primary Function:** Defines the school's subject curriculum catalog, categorizing courses into `Core Requirements` (e.g. Mathematics, English) and `Electives` (e.g. Computer Science, Biology, Fine Arts).
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Stat Cards:** Top summary cards for Total Subjects, Core Subjects, and Elective Subjects.
  - **Type Filter Tabs:** Sleek tab filters (`All Subjects`, `Core Only`, `Elective Only`) for curriculum browsing.
  - **Slide-Over Form Drawer:** `<SubjectFormDrawer>` with `<Label required>` for subject titles, subject code inputs, and elective checkbox flags.
  - **Action Menu Portals:** `<SubjectActionMenu>` using React Portals (`createPortal` to `document.body`) for View Details, Edit Record, and Delete actions.
  - **Type Badges:** Dynamic color badges (Emerald for Core, Amber for Elective) with initial avatar badges.
- **Backend API & Schema:**
  - Endpoints: `GET /api/subjects/tenant/{tenantId}`, `POST /api/subjects`, `PUT /api/subjects/{id}`, `DELETE /api/subjects/{id}`.
  - Table: `Subjects` (`id`, `tenant_id`, `name`, `code`, `is_elective`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Create Mandatory Core Subject
```json
{
  "Subject Name": "Mathematics",
  "Subject Code": "MATH-101",
  "Is Elective Subject": false,
  "Expected Result": "Adds subject with Emerald 'Core' badge and initial avatar 'M'"
}
```

#### Test Case 2: Create Elective Science Subject
```json
{
  "Subject Name": "Computer Science",
  "Subject Code": "CS-102",
  "Is Elective Subject": true,
  "Expected Result": "Adds subject with Amber 'Elective' badge and initial avatar 'C'"
}
```

#### Test Case 3: Data Export Test
```json
{
  "Action 1": "Click CSV button -> Downloads 'subjects_directory.csv'",
  "Action 2": "Click PDF button -> Downloads 'subjects_directory.pdf'"
}
```

---

## 🗓️ TURN 5: Curriculum Matrix & Timetable Scheduler

### Screen 9: Class-Subject Mapping (`/ClassSubject`)
- **Primary Function:** Maps subjects from the global catalog to specific class grade levels (e.g. mapping `Mathematics` to `Grade 10`) and defines evaluation criteria like `Total Marks` (100) and `Passing Marks` (33).
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Panel:** Top summary cards for Subjects Assigned, Cumulative Total Marks, and Available Classes count.
  - **Class Selector:** `<SearchableSelect>` for filtering allocated subjects by class grade level.
  - **Slide-Over Form Drawer:** `<ClassSubjectFormDrawer>` with `<SearchableSelect>` for target class and subject, `<Label required>` for marking parameters.
  - **Action Menu Portals:** `<ClassSubjectActionMenu>` built with React Portals (`createPortal` to `document.body`) for View Details and Delete mapping.
  - **Data Export:** Integrated PDF and CSV exports for class syllabus allocation reports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/classsubjects/class/{classId}`, `POST /api/classsubjects`, `DELETE /api/classsubjects/{id}`.
  - Table: `ClassSubjects` (`id`, `tenant_id`, `class_id`, `subject_id`, `total_marks`, `passing_marks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Assign Mathematics to Grade 10
```json
{
  "Target Class": "Grade 10 (Matric Science)",
  "Select Subject": "Mathematics (MATH-101)",
  "Total Marks": 100,
  "Passing Marks": 33,
  "Expected Result": "Maps Mathematics to Grade 10 with 100 total / 33 passing marks"
}
```

#### Test Case 2: Assign Biology to O-Levels
```json
{
  "Target Class": "O-Levels Senior Year",
  "Select Subject": "Biology (BIO-101)",
  "Total Marks": 75,
  "Passing Marks": 25,
  "Expected Result": "Maps Biology with practical exam weightage (75 total / 25 passing)"
}
```

---

### Screen 10: Timetable & Routine Scheduler (`/Timetable`)
- **Primary Function:** Constructs the master weekly routine schedule for each class section, allocating daily periods, time slots, subject courses, assigned teachers, and classroom locations. Includes Smart Auto-Schedule generation!
- **Agent 1 & UI Pattern Compliance:**
  - **Class & Section Dropdown Selectors:** Top searchable selectors for filtering the weekly grid by class and section.
  - **Interactive Weekly Grid:** 6-day (Monday to Saturday) period timeline grid with period cards, time badges, teacher names, and location icons.
  - **Slide-Over Form Drawer:** `<TimetablePeriodDrawer>` with Flatpickr `<TimePicker>` for start and end times, `<SearchableSelect>` for subject and teacher allocation, and `<Label required>`.
  - **Smart Auto-Scheduler Engine:** One-click automated timetable generator algorithm allocating unassigned periods without teacher time conflicts.
  - **Export Action:** Generates printable weekly `Weekly_Timetable_[Class].pdf` reports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/timetable/section/{sectionId}`, `POST /api/timetable`, `POST /api/timetable/auto-generate`, `DELETE /api/timetable/{id}`.
  - Table: `Timetables` (`id`, `tenant_id`, `class_id`, `section_id`, `subject_id`, `staff_id`, `day_of_week`, `start_time`, `end_time`, `room_name`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Manual Period Schedule Assignment
```json
{
  "Target Class": "Grade 10 (Matric Science)",
  "Section": "Section A",
  "Day": "Monday",
  "Start Time": "08:00 AM",
  "End Time": "08:45 AM",
  "Subject": "Mathematics",
  "Teacher": "Prof. Tariq Mahmood",
  "Room / Location": "Room 102",
  "Expected Result": "Adds period card to Monday 08:00 - 08:45 AM slot"
}
```

#### Test Case 2: Smart Auto-Generate Timetable
```json
{
  "Action": "Click 'Auto Generate' button for Grade 10 Section A",
  "Expected Result": "Triggers backend AI conflict-free scheduler and populates full weekly timetable grid"
}
```

#### Test Case 3: Timetable PDF Export Test
```json
{
  "Action": "Click 'Print Timetable' button -> Downloads 'Weekly_Timetable_Grade_10.pdf'"
}
```

---

## 👩‍🏫 TURN 6: Teacher Routines & Student Directory Register (Group B Start!)

### Screen 11: Teacher Timetable View (`/TeacherTimetable`)
- **Primary Function:** Provides an individualized weekly routine schedule view for any selected teacher faculty member, highlighting assigned periods, class sections, room locations, and free non-teaching slots across all 6 days.
- **Agent 1 & UI Pattern Compliance:**
  - **Teacher Selection:** `<SearchableSelect>` with `<Label required>` for selecting any staff faculty member.
  - **Weekly Faculty Schedule Matrix:** Clean day-by-day table matrix displaying indigo-accented period cards, subject names, class-section badges, and location indicators.
  - **Free Period Detection:** Highlights non-teaching days with a green badge: *"Teacher is completely free on this day"*.
- **Backend API & Schema:**
  - Endpoints: `GET /api/timetableperiods/tenant/{tenantId}/teacher/{teacherId}`, `GET /api/staff/tenant/{tenantId}`.
  - Table: `Timetables` (`id`, `tenant_id`, `class_id`, `section_id`, `subject_id`, `staff_id`, `day_of_week`, `start_time`, `end_time`, `room_name`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Faculty Routine Inspection
```json
{
  "Select Teacher": "Prof. Tariq Mahmood",
  "Expected Result": "Renders weekly schedule showing assigned periods, class section badges, and free days"
}
```

---

### Screen 12: Student Directory & Master Register (`/StudentDirectory`)
- **Primary Function:** The core master registry for all student enrollments in the school. Manages student bio-data (B-Form, GR/Admission Number, DOB), parent account linking, student portal credential generation, medical records, and Transfer Certificates (TC).
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Panel:** Top summary cards (`<StudentStats>`) for Total Students, Active Enrollments, Inactive Students, and Gender Ratio breakdown (Rule 3 Compliance).
  - **TanStack Table Registry:** `<DataTable>` with global search filter, status tabs (`All`, `Active`, `Inactive`), column sorting, and custom pagination.
  - **Slide-Over Profile Drawer:** `<StudentProfileDrawer>` for viewing full student bio-data, guardian details, and emergency contacts (Rule 5 Compliance).
  - **Action Menu Portals:** `<StudentActionMenu>` built with React Portals (`createPortal` to `document.body`) for View Profile, Edit Record, Fee Challan, ID Card, Generate Login, Medical Record, Transfer Certificate (TC), and Delete (Rule 4 Compliance).
  - **Form Controls:** `<Label required>`, Flatpickr `<DatePicker>`, `<SearchableSelect>` for parent account linking, and `<ImageUpload>` for student avatar photos (Rule 1 Compliance).
  - **Auto GR Number Generator:** One-click automated GR/Admission Number generator engine.
- **Backend API & Schema:**
  - Endpoints: `GET /api/students/tenant/{tenantId}`, `POST /api/students`, `PUT /api/students/{id}`, `DELETE /api/students/{id}`, `POST /api/students/{id}/generate-account`, `GET /api/students/tenant/{tenantId}/generate-gr`.
  - Tables: `Students` (`id`, `tenant_id`, `user_id`, `parent_id`, `b_form_number`, `first_name`, `last_name`, `gender`, `date_of_birth`, `admission_date`, `admission_number`, `father_name`, `father_cnic`, `guardian_phone`, `address`, `blood_group`, `is_active`, `profile_picture_url`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Register New Student Admission
```json
{
  "First Name": "Zain",
  "Last Name": "Ahmed",
  "Gender": "Male",
  "B-Form / CNIC": "42101-1234567-1",
  "Date of Birth": "2012-05-15",
  "Admission Date": "2026-08-01",
  "Father Name": "Ahmed Hassan",
  "Father CNIC": "42101-9876543-1",
  "Guardian Phone": "0300-1234567",
  "Address": "House 123, Block 4, Gulshan-e-Iqbal, Karachi",
  "Blood Group": "B+",
  "Expected Result": "Registers student, auto-generates GR number, and adds to master register"
}
```

#### Test Case 2: Generate Student Self-Service Login
```json
{
  "Action": "Open Student ActionMenu -> Click 'Generate Login'",
  "Expected Result": "Creates User account with role 'Student' and displays generated Username & Password"
}
```

#### Test Case 3: Medical Record & Transfer Certificate (TC) Test
```json
{
  "Action 1": "Open ActionMenu -> Click 'Medical Record' -> Opens medical entry drawer",
  "Action 2": "Open ActionMenu -> Click 'Transfer Certificate' -> Generates official printable TC document"
}
```

---

## 🎒 TURN 7: Student Class Enrollment & Parent Directory Register

### Screen 13: Student Class Enrollment & Promotions (`/StudentEnrollments`)
- **Primary Function:** Handles the academic lifecycle allocation of students into specific Academic Years, Classes, Sections, and Roll Numbers. Manages 3 core workflows: **New Enrollment**, **Lateral Section Transfer**, and **Next-Grade Year Promotions**.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Panel:** Top summary cards (`<EnrollmentStats>`) for Total Enrolled Students, Active Enrollments, Transferred Students, and Promoted Students.
  - **TanStack Table Register:** Datatable inventory with filtering by Academic Year, Class Focus, and Section Grid, plus global search and pagination.
  - **Slide-Over Pipeline Drawer:** `<EnrollmentFormDrawer>` with `<SearchableSelect>` for target student, year, class, section, and `<Label required>` for Roll Number.
  - **Action Menu Portals:** `<EnrollmentActionMenu>` built with React Portals (`createPortal` to `document.body`) for Section Transfer, Grade Promotion, and Timeline History.
  - **Historical Timeline Modal:** `<EnrollmentHistoryModal>` displaying student's multi-year enrollment footprint.
  - **Data Export:** Integrated PDF and CSV exports for class roll-call registers.
- **Backend API & Schema:**
  - Endpoints: `GET /api/studentenrollments/list`, `POST /api/studentenrollments/enroll`, `PUT /api/studentenrollments/transfer`, `POST /api/studentenrollments/promote`, `GET /api/studentenrollments/student/{studentId}/history`.
  - Table: `StudentEnrollments` (`id`, `tenant_id`, `student_id`, `academic_year_id`, `class_id`, `section_id`, `roll_number`, `status`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Enroll Student into Grade 10 Section A
```json
{
  "Target Student": "Zain Ahmed (GR-2026-001)",
  "Target Session": "Academic Session 2026-2027",
  "Destination Class": "Grade 10 (Matric Science)",
  "Target Section": "Section A",
  "Assigned Roll Number": 1,
  "Expected Result": "Initializes enrollment with 'Active' status badge and Roll # 1"
}
```

#### Test Case 2: Lateral Section Transfer
```json
{
  "Action": "Open Enrollment ActionMenu -> Click 'Transfer Section'",
  "New Section": "Section B",
  "New Roll Number": 15,
  "Expected Result": "Updates student section allocation to Section B with Roll # 15"
}
```

---

### Screen 14: Guardian & Parent Directory (`/parents`)
- **Primary Function:** Manages parent/guardian user accounts for the Parent Portal. Allows creating parent login credentials, linking multiple child students to a parent account, and managing portal access status.
- **Agent 1 & UI Pattern Compliance:**
  - **TanStack Table Directory:** `<DataTable>` listing Parent Name, Email, Phone Number, Linked Children Count badge (`1 Child` / `2 Children`), and Account Status (`Active` / `Inactive`).
  - **Slide-Over Profile Drawer:** `<ParentProfileDrawer>` for inspecting parent contact details and managing linked child students.
  - **Form Controls:** Dual-view slide form with `<Input>`, `<Label required>`, and `<SearchableSelect>` for Account Status.
- **Backend API & Schema:**
  - Endpoints: `GET /api/users/tenant/{tenantId}`, `POST /api/users/register`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`, `GET /api/students/tenant/{tenantId}`.
  - Tables: `Users` (`id`, `tenant_id`, `role_id`, `first_name`, `last_name`, `email`, `phone_number`, `is_active`), `Students` (`parent_id` foreign key).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Create Parent Account
```json
{
  "First Name": "Ahmed",
  "Last Name": "Hassan",
  "Email Address": "ahmed.hassan@example.com",
  "Phone Number": "0300-1234567",
  "Password": "SecurePassword123!",
  "Account Status": "Active (Can Login)",
  "Expected Result": "Creates Parent user account with role 'Parent' for mobile portal access"
}
```

#### Test Case 2: Link Student to Parent Account
```json
{
  "Action": "Open Parent Profile Drawer -> Click 'Link Child' -> Select 'Zain Ahmed'",
  "Expected Result": "Updates Zain Ahmed's parent_id foreign key and updates 'Linked Students' badge"
}
```

---

## 🎒 TURN 8: Admissions CRM Leads & Public Admission Portal Desk

### Screen 15: Admissions CRM & Lead Enquiries (`/AdmissionEnquiries`)
- **Primary Function:** Comprehensive lead tracking pipeline for managing prospective student inquiries. Tracks leads across 4 lifecycle stages (**Enquiry**, **Follow-Up**, **Registered**, **Closed**), offers Dual-View (**Kanban Board** & **TanStack Table**), and converts qualified leads directly into active student records.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Panel:** Top summary cards (`<EnquiryStats>`) displaying Total Leads, Active Pipeline Count, Converted Ratio, and Closed/Rejected Leads.
  - **Dual View Layout:** Seamless toggle between interactive visual **Kanban Pipeline Board** (`<KanbanBoard>`) and detailed **TanStack Datatable Grid**.
  - **Slide-Over Capture Drawer:** `<CaptureLeadDrawer>` with `<SearchableSelect>` for target class, `<Input>`, and `<Label required>` components.
  - **Slide-Over Detail View:** `<EnquiryDetails>` panel for lead inspection and follow-up logging.
  - **Action Menu Portals:** React Portals (`createPortal` to `document.body`) for lead operations (View, Convert to Student, Delete).
  - **Lead Conversion Engine:** One-click conversion (`POST /api/admissionenquiries/{id}/convert`) that auto-populates a new official `Student` record and updates lead status to `Registered`.
- **Backend API & Schema:**
  - Endpoints: `GET /api/admissionenquiries/tenant/{tenantId}`, `POST /api/admissionenquiries`, `PUT /api/admissionenquiries/{id}/status`, `POST /api/admissionenquiries/{id}/convert`, `DELETE /api/admissionenquiries/{id}`.
  - Table: `AdmissionEnquiries` (`id`, `tenant_id`, `child_name`, `father_name`, `phone_number`, `class_id`, `status`, `remarks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Capture Walk-in Admission Lead
```json
{
  "Child Name": "Mustafa Ali",
  "Father Name": "Tariq Mahmood",
  "Phone / WhatsApp": "0312-9876543",
  "Target Class": "Grade 9 (Computer Science)",
  "Remarks": "Parents visited campus today, interested in sports facilities",
  "Expected Result": "Saves new lead with status 'Enquiry' and displays on Kanban board"
}
```

#### Test Case 2: Convert Lead to Official Student Record
```json
{
  "Action": "Click 'Convert' in Action Menu or drag card to 'Registered' column",
  "Confirmation": "Confirm 'Convert to Student' dialog prompt",
  "Expected Result": "Creates new record in Students database table and updates lead status to 'Registered'"
}
```

---

### Screen 16: Public Admission Portal Desk (`/PublicAdmissionPortal`)
- **Primary Function:** Public-facing self-service online application desk for prospective parents. Allows parents to submit online admission forms without logging into the portal, auto-generating a unique Application Reference ID for status tracking.
- **Agent 1 & UI Pattern Compliance:**
  - **Multi-Step Wizard:** 3-step wizard workflow (**Child's Info** -> **Parent Info** -> **Class & Notes**) with live progress bar.
  - **Custom Form Controls:** Integrated `<SearchableSelect>` for gender and target class choices, eliminating raw HTML select elements.
  - **Success Reference Generator:** Auto-generates readable reference number (e.g. `ADM-2026-8941`) and confirmation screen upon submission.
  - **Tenant Branding:** Dynamically fetches school name, logo, address, and contact phone by tenant ID URL parameter.
- **Backend API & Schema:**
  - Endpoints: `GET /api/tenants/{tenantId}`, `GET /api/classes/tenant/{tenantId}`, `POST /api/admissionenquiries/public-apply`.
  - Table: `AdmissionEnquiries` (`id`, `tenant_id`, `child_name`, `father_name`, `phone_number`, `class_id`, `status='Enquiry'`, `remarks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Parent Online Self-Service Application
```json
{
  "Step 1 (Child)": "Child Name: Bilal Raza, Gender: Male, DOB: 2014-03-20",
  "Step 2 (Parent)": "Father Name: Raza Hussain, Phone: 0333-1122334, CNIC: 42101-5544332-1",
  "Step 3 (Class)": "Target Class: Grade 5, Remarks: Requesting morning transport",
  "Expected Result": "Generates Reference ID ADM-2026-XXXX and pushes lead into Admissions CRM pipeline"
}
```

---

## 🎒 TURN 9: Student Attendance Register Desk & Proxy Attendance Feed

### Screen 17: Weekly Student Attendance Matrix Desk (`/StudentAttendance`)
- **Primary Function:** Comprehensive weekly matrix grid for monitoring and logging class-wide student attendance. Displays attendance statuses across 7-day calendar view with automatic percentage calculation, continuous absent risk indicators, and batch editing capabilities.
- **Agent 1 & UI Pattern Compliance:**
  - **Interactive Matrix Grid:** Sticky student profile column with real-time attendance percentage bar (`emerald-500` if >=75%, `red-500` if <75%) and 3-consecutive-absent risk alert badge (`⚠️`).
  - **Batch Edit Mode:** One-click edit mode toggle (`Edit Mode` -> `Save Changes` / `Discard`), plus header `✔️ All` button for marking all students present for a specific day.
  - **Form Controls:** Filters bar built with `<SearchableSelect>` for Academic Year, Class, Section, and `<DatePicker>` for starting week date.
  - **Export Engine:** Integrated PDF report generation (`Export PDF`) exporting formatted landscape attendance register.
- **Backend API & Schema:**
  - Endpoints: `GET /api/studentattendances/weekly-matrix`, `POST /api/studentattendances/bulk-mark`.
  - Table: `StudentAttendances` (`id`, `tenant_id`, `academic_year_id`, `student_id`, `date`, `status`, `remarks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Weekly Class Matrix Load & Audit
```json
{
  "Academic Year": "Academic Session 2026-2027",
  "Class": "Grade 10",
  "Section": "Section A",
  "Week Start Date": "2026-08-03 (Monday)",
  "Expected Result": "Loads 7-day grid showing Present, Absent, Late, and Leave records with overall attendance %"
}
```

#### Test Case 2: Batch Mark All Present & Risk Alert Trigger
```json
{
  "Action 1": "Enable Edit Mode -> Click '✔️ All' on Monday column -> Mark all students Present",
  "Action 2": "Click Save Changes -> Saves batch records and updates attendance percentage bars",
  "Expected Result": "Saves all records in single transaction; shows ⚠️ warning badge if a student has 3 consecutive absents"
}
```

---

### Screen 18: Proxy & Rapid Attendance Desk (`/ProxyAttendance`)
- **Primary Function:** Rapid single-day attendance desk for class teachers and proxy invigilators. Allows quick one-click marking (`Mark All Present`, `Mark All Absent`) and single-student status overrides.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumb Header:** Navigation path `<Breadcrumb items={[{ label: "Attendance" }, { label: "Proxy Attendance" }]} />`.
  - **KPI Stats Cards:** Top `<StatCards>` displaying Total Students, Present Count, Absent Count, and Late/Leave Count.
  - **Action Menu Portals:** React Portals `<ActionMenu>` for single-row quick actions (`Mark Present`, `Mark Absent`).
  - **Form Controls:** Built with `<SearchableSelect>`, `<DatePicker>`, and `<Skeleton>` loading states.
- **Backend API & Schema:**
  - Endpoints: `GET /api/studentattendances/daily-list`, `POST /api/studentattendances/bulk-mark`.
  - Table: `StudentAttendances` (`id`, `tenant_id`, `academic_year_id`, `student_id`, `date`, `status`, `remarks`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Rapid Class Proxy Attendance
```json
{
  "Date": "2026-08-04",
  "Class": "Grade 10",
  "Section": "Section B",
  "Action": "Click 'Mark All Present' -> Override 2 students to 'Absent'",
  "Expected Result": "Saves daily attendance and triggers instant success toast notification"
}
```

---

## 🎒 TURN 10: Subject-wise Period Attendance & Master Analytics Reports

### Screen 19: Subject-wise / Period Attendance Grid (`/SubjectWiseAttendance`)
- **Primary Function:** Period-by-period subject attendance tracking desk for subject teachers. Allows tracking attendance for specific timetable periods (e.g. `Physics - Period 1 (08:00 - 08:45 AM)`) rather than just daily homeroom attendance.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumb Header:** Navigation path `<Breadcrumb items={[{ label: "Attendance" }, { label: "Subject-wise Attendance" }]} />`.
  - **KPI Stat Cards:** Top `<StatCards>` displaying Period Strength, Present Count, and Absent Count.
  - **Form Controls:** Filters bar built with `<SearchableSelect>` for Class, Section, Timetable Period, and `<DatePicker>` for target date.
  - **Action Menu Portals:** React Portals `<ActionMenu>` for single-row period status updates (`Mark Present`, `Mark Absent`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/timetableperiods/tenant/{tenantId}/section/{sectionId}`, `GET /api/studentsubjectattendance/by-period`, `POST /api/studentsubjectattendance/bulk-mark`.
  - Tables: `StudentSubjectAttendances` (`id`, `tenant_id`, `period_id`, `student_id`, `date`, `status`, `remarks`, `created_at`), `TimetablePeriods`.
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Log Period 2 Physics Attendance
```json
{
  "Class": "Grade 10 (Matric Science)",
  "Section": "Section A",
  "Period": "Physics (08:45 AM - 09:30 AM)",
  "Date": "2026-08-04",
  "Action": "Select status overrides and click 'Save Period Attendance'",
  "Expected Result": "Saves period-specific subject attendance record into database"
}
```

---

### Screen 20: Master Attendance Reports & Analytics (`/AttendanceReport`)
- **Primary Function:** Executive reporting and analytics dashboard for tracking long-term attendance trends. Provides daily class heatmaps, critical low attendance day identifiers (<75%), individual student summaries, and PDF report exporting.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Metric Cards:** Top analytics cards for Average Attendance %, Critical Low Days Count (<75%), and Tracked Class Size with trend direction indicators (`TrendingUp` / `TrendingDown`).
  - **Daily Attendance Heatmap:** Interactive color-coded heatmap grid (Green: >=90%, Light Green: 75%-90%, Yellow: 60%-75%, Red: <60%) with hover card count breakdowns.
  - **Student Summary Table:** Individual student register with progress bars, present/absent/late/leave counts, and global search filter.
  - **Form Controls:** Dynamic filter bar using `<SearchableSelect>` for Year, Class, Section, and `<DatePicker>` for From/To date ranges.
  - **PDF Export Engine:** Executive PDF report export generating detailed class attendance summaries.
- **Backend API & Schema:**
  - Endpoints: `GET /api/StudentAttendances/heatmap-stats`, `GET /api/StudentAttendances/report-stats`.
  - Tables: `StudentAttendances`, `Students`, `Classes`, `Sections`.
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Generate Monthly Class Attendance Heatmap & Report
```json
{
  "Academic Year": "Academic Session 2026-2027",
  "Class": "Grade 10",
  "Section": "Section A",
  "From Date": "2026-07-01",
  "To Date": "2026-07-30",
  "Expected Result": "Compiles 30-day color-coded heatmap, calculates class average %, and lists individual student attendance %"
}
```

#### Test Case 2: Export Executive PDF Attendance Summary
```json
{
  "Action": "Click 'Export PDF' button on top header",
  "Expected Result": "Generates and downloads official printable PDF report with headers and table rows"
}
```

---

## 🎒 TURN 11: Student Behavior Logs & Bulk ID Card Generator

### Screen 21: Student Behavior Logs & Discipline Desk (`/StudentBehaviorLogs`)
- **Primary Function:** Centralized conduct tracking system for logging merits, demerits, disciplinary actions, and positive achievements. Tracks cumulative points impact per student across academic sessions.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** Top summary cards displaying Total Behavior Logs, Cumulative Positive Points (+Pts), and Cumulative Negative Points (-Pts).
  - **TanStack Table Register:** Datatable inventory with sorting, global search, and pagination.
  - **Form Controls:** Incident creation view built with `<SearchableSelect>` for target student, `<DatePicker>` for incident date, and `<Label required>` components.
  - **Predefined Presets:** Built-in incident preset selector (e.g. `Outstanding Project Work (+10)`, `Late Arrival (-5)`, `Bullying (-20)`).
  - **Data Export:** Integrated PDF and CSV exports for conduct reports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/studentbehaviorlogs/tenant/{tenantId}/year/{yearId}`, `POST /api/studentbehaviorlogs`, `DELETE /api/studentbehaviorlogs/{id}`.
  - Table: `StudentBehaviorLogs` (`id`, `tenant_id`, `academic_year_id`, `student_id`, `reported_by_user_id`, `incident_date`, `incident_type`, `points_affected`, `action_taken`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Log Positive Achievement Merit
```json
{
  "Target Student": "Zain Ahmed (GR-2026-001)",
  "Incident Date": "2026-08-04",
  "Preset": "Extracurricular Achievement (+15)",
  "Action Taken / Remarks": "Secured 1st position in Annual Inter-School Science Fair",
  "Expected Result": "Saves behavior log with +15 points badge and updates student discipline profile"
}
```

#### Test Case 2: Log Disciplinary Demerit
```json
{
  "Target Student": "Mustafa Ali",
  "Incident Date": "2026-08-04",
  "Preset": "Disruptive Behavior in Class (-10)",
  "Action Taken / Remarks": "Issued verbal warning and sent notice to guardian",
  "Expected Result": "Logs -10 points demerit and updates negative points stat card"
}
```

---

### Screen 22: Bulk Student ID Card Generator (`/IDCardGenerator`)
- **Primary Function:** High-speed bulk student ID card generator for producing print-ready, standardized student identity cards with avatars, GR numbers, class/section allocations, blood groups, and school branding.
- **Agent 1 & UI Pattern Compliance:**
  - **Interactive Cards Grid:** Responsive 4-column cards grid previewing exact physical CR80 card dimensions (85mm x 54mm) with avatar gradients, header strips, and student info.
  - **Form Controls:** Filtering bar built with `<SearchableSelect>` for filtering cards by specific Class or All Active Students.
  - **Dual Output Engines:** One-click `Print` button (utilizing CSS `@media print` layout) and `Export PDF` button (using `jsPDF` vector rendering).
- **Backend API & Schema:**
  - Endpoints: `GET /api/students/tenant/{tenantId}`, `GET /api/classes/tenant/{tenantId}`, `GET /api/studentenrollments/tenant/{tenantId}`, `GET /api/tenants/{tenantId}`.
  - Tables: `Students`, `Classes`, `StudentEnrollments`, `Tenants`.
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Filter & Bulk Print Grade 10 ID Cards
```json
{
  "Filter Class": "Grade 10 (Matric Science)",
  "Cards Count": "15 Cards Ready",
  "Action 1": "Click 'Export PDF' -> Generates 2-column vector PDF document for physical printing",
  "Action 2": "Click 'Print' -> Opens browser print dialog with print-only CSS stylesheet",
  "Expected Result": "Generates 85mm x 54mm ID cards formatted for standard plastic card printers"
}
```

---

## 🎓 TURN 12: Alumni Directory Network & Biometric IoT Hardware Engine

### Screen 23: Alumni Student Directory & Higher Studies (`/AlumniDirectory`)
- **Primary Function:** Comprehensive alumni tracking and graduate networking portal. Maintains post-graduation career records, higher education details, current organizations, and contact networks of school graduates.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** Top summary cards using `<AlumniStats>` displaying Total Alumni Count, Recent Graduates (last 2 years), Employed Count, and Top Employer Sector.
  - **Alumni Profile Cards:** Responsive card layout (`<AlumniCard>`) rendering graduate avatar gradients, batch badge, occupation, company, and phone contact info.
  - **Form Drawers & Modals:** Slide-over drawer (`<AlumniFormDrawer>`) for profile creation/editing and modal dialog (`<AlumniProfileModal>`) for detailed profile inspection.
  - **Form Controls:** Built with `<SearchableSelect>` for student choice and batch year filtering.
  - **Data Export:** Integrated PDF and CSV exports for alumni directory reports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/alumniprofiles/tenant/{tenantId}`, `POST /api/alumniprofiles`, `PUT /api/alumniprofiles/{id}`, `DELETE /api/alumniprofiles/{id}`.
  - Table: `AlumniProfiles` (`id`, `tenant_id`, `student_id`, `graduation_year`, `current_occupation`, `current_organization`, `higher_education_details`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Register New Graduate Alumni Profile
```json
{
  "Student": "Usman Tariq (GR-2024-089)",
  "Graduation Year": 2024,
  "Current Job Title": "Software Engineer",
  "Company": "Systems Limited",
  "Higher Education": "BS Computer Science - FAST NUCES Lahore",
  "Expected Result": "Registers alumni profile and updates alumni stats summary cards"
}
```

---

### Screen 24: Biometric & RFID IoT Hardware Devices Manager (`/BiometricDevices`)
- **Primary Function:** Centralized IoT hardware integration engine for configuring, monitoring, and synchronizing ZKTeco, Hikvision, and Dahua facial recognition and fingerprint attendance machines.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumb Header:** Navigation path `<Breadcrumb items={[{ label: "System Settings" }, { label: "Biometric & IoT Hardware Integration Engine" }]} />`.
  - **KPI Stats Cards:** Top `<StatCards>` displaying Connected Biometric Machines Count, Online TCP/IP Status Count, and Active Hardware Push Protocol.
  - **Datatables Integration:** Built with `<DataTable>` featuring column sorting, global search, and export capabilities.
  - **Row Action Menu:** React Portals `<ActionMenu>` for single-row hardware actions (`Ping Terminal Status`).
  - **Live Ingestion Engine:** `Trigger Instant Hardware Sync` button simulating ZKTeco ADMS and Hikvision ISAPI live punch log ingestion.
  - **Form Controls:** Terminal registration drawer using `<SearchableSelect>` for hardware protocol and `<Label required>` for IP/Port specs.
- **Backend API & Schema:**
  - Endpoints: `POST /api/BiometricSync/sync-all`, `GET /api/BiometricDevices`.
  - Table: `BiometricDevices` (`id`, `tenant_id`, `device_name`, `ip_address`, `port`, `brand`, `location`, `status`, `last_sync_time`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Register ZKTeco Facial Terminal & Trigger Live Sync
```json
{
  "Device Name": "Main Gate Face Recognition Terminal",
  "IP Address": "192.168.1.201",
  "Port": 4370,
  "Brand Protocol": "ZKTeco ADMS / Standalone",
  "Location": "Main School Entrance Gate",
  "Action": "Click 'Connect Terminal' -> Click 'Trigger Instant Hardware Sync'",
  "Expected Result": "Registers hardware device, tests TCP/IP latency, and ingests live punch logs into daily attendance"
}
```

---

## 👨‍🏫 TURN 13: Staff Directory & Staff Attendance & Payroll Engine

### Screen 25: Staff & Teacher Directory (`/StaffDirectory`)
- **Primary Function:** Comprehensive Human Resources (HR) directory for registering teachers, administrative officers, and management personnel. Manages credentials, payroll baselines, document vault (CNIC/Degrees), and user account generation.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** Top summary cards (`<StaffStats>`) displaying Total Staff, Active Staff Count, Inactive Staff Count, and Average Monthly Salary (PKR).
  - **TanStack Datatable Register:** Tabbed datatable inventory (`All Staff`, `Teaching Faculty`, `Non-Teaching Staff`, `Management`, `Inactive`) with global search and sorting.
  - **Slide-Over Profile Drawer:** Detailed drawer (`<StaffDrawer>`) inspecting staff profile picture, CNIC, qualifications, document vault links, and credentials.
  - **Row Action Menu:** React Portals `<StaffActionMenu>` for actions (`View Details`, `Edit Profile`, `Generate Login Account`, `Remove Staff`).
  - **Full-Page Form View:** Multi-card registration form with grouped card sections, `<ImageUpload>`, `<SearchableSelect>`, `<DatePicker>`, and `<Label required>` components.
  - **Data Export:** Integrated PDF and CSV exports for staff register reports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/staff/tenant/{tenantId}`, `POST /api/staff`, `PUT /api/staff/{id}`, `DELETE /api/staff/{id}`, `POST /api/staff/{id}/generate-account`.
  - Table: `Staff` (`id`, `tenant_id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `cnic`, `staff_type`, `designation`, `qualification`, `basic_salary`, `joining_date`, `is_active`, `profile_picture_url`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Register Senior Teacher & Generate Login Credentials
```json
{
  "First Name": "Tariq",
  "Last Name": "Mahmood",
  "Staff Type": "Teaching Faculty",
  "Designation": "Senior Teacher",
  "Qualification": "M.Phil Physics - Punjab University",
  "CNIC": "42101-9876543-1",
  "Phone": "0312-9876543",
  "Email": "tariq.mahmood@school.edu.pk",
  "Basic Salary": 75000,
  "Joining Date": "2026-08-01",
  "Action": "Click 'Save Staff Record' -> Click 'Generate Login Account' from Action Menu",
  "Expected Result": "Registers staff member and auto-generates secure login account credentials"
}
```

---

### Screen 26: Staff Attendance & Monthly Payroll Deductions Engine (`/StaffAttendance`)
- **Primary Function:** Dual-mode staff time-tracking and automated payroll deduction engine. Combines weekly 7-day attendance grid with 1-click biometric machine sync, time override popup modal, and automated monthly salary deduction calculation.
- **Agent 1 & UI Pattern Compliance:**
  - **Dual Mode Header Tabs:** Header tabs switching between `📅 Weekly Grid & Time Tracking` and `💸 Monthly Payroll Deductions`.
  - **Interactive Weekly Grid:** Sticky profile column with staff attendance percentage bar, 7-day matrix grid, batch edit mode (`✔️ All`), and double-click time modal (Check-In / Check-Out times).
  - **Biometric Sync Engine:** `Sync Device` button importing biometric/RFID punch logs directly from ZKTeco/Hikvision terminals.
  - **Automated Payroll Engine:** Rule-based salary deduction calculator applying configurable rules:
    - `Lates = 1 Absent` (e.g. 3 Lates = 1 Absent)
    - `Half-Days = 1 Absent` (e.g. 2 Half-Days = 1 Absent)
    - `Allowed Free Leaves` (e.g. 2 Allowed Leaves per month)
    - Auto-calculates per-day salary deduction and displays Net Payable Salary (PKR).
  - **Form Controls:** Filters bar built with `<SearchableSelect>`, `<DatePicker>`, and PDF export capabilities.
- **Backend API & Schema:**
  - Endpoints: `GET /api/staffattendances/weekly-matrix`, `POST /api/staffattendances/bulk-mark`, `POST /api/staffattendances/sync-biometric`, `GET /api/staffattendances/payroll-summary`.
  - Table: `StaffAttendances` (`id`, `tenant_id`, `staff_id`, `date`, `status`, `check_in`, `check_out`, `remarks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Weekly Staff Attendance Edit & Time Entry
```json
{
  "Week Start": "2026-08-03 (Monday)",
  "Action 1": "Enable Edit Mode -> Double-click Monday cell for Tariq Mahmood -> Set Check-In 07:55 AM, Check-Out 02:00 PM",
  "Action 2": "Click Save Changes",
  "Expected Result": "Saves check-in/check-out timestamp records and updates staff weekly matrix"
}
```

#### Test Case 2: Run Automated Monthly Payroll Deductions Engine
```json
{
  "Month / Year": "August 2026",
  "Rules Configuration": "3 Lates = 1 Absent, 2 Half-Days = 1 Absent, 2 Allowed Free Leaves",
  "Action": "Click 'Calculate Engine'",
  "Expected Result": "Calculates actual absents, penalty absents, LWP days, total deductible amount, and net payable salary per staff member"
}
```

---

## 📚 TURN 14: Class Subjects Allocation & Academic Years Sessions Engine

### Screen 27: Class Subjects & Subject Allocations (`/ClassSubject`)
- **Primary Function:** Academic curriculum mapping engine for allocating subjects (e.g. Mathematics, Physics, English) to classes (e.g. Class 10-A) and configuring total marks / passing marks parameters.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Stats Summary Cards:** Top summary cards displaying Subjects Assigned Count, Total Marks baseline, and Available Classes Count.
  - **Class Filter Header:** `<SearchableSelect>` for filtering subjects dynamically by class.
  - **TanStack Datatable Inventory:** Datatable with subject name, avatar initial badge, subject code, total marks, passing marks, and column sorting.
  - **Slide-Over Form Drawer:** `<ClassSubjectFormDrawer>` for mapping new subjects with total/passing marks parameters.
  - **Row Action Menu:** React Portals `<ClassSubjectActionMenu>` for actions (`View Parameters`, `Remove Subject`).
  - **Data Export:** Integrated PDF and CSV exports for class syllabus subject lists.
- **Backend API & Schema:**
  - Endpoints: `GET /api/classsubjects/class/{classId}`, `POST /api/classsubjects`, `DELETE /api/classsubjects/{id}`.
  - Table: `ClassSubjects` (`id`, `tenant_id`, `class_id`, `subject_id`, `total_marks`, `passing_marks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Assign Mathematics Subject to Class 10
```json
{
  "Target Class": "Class 10-A",
  "Subject": "Mathematics (MATH-10)",
  "Total Marks": 100,
  "Passing Marks": 33,
  "Action": "Click '+ Assign Subject' -> Select Mathematics -> Click 'Assign Subject'",
  "Expected Result": "Maps Mathematics to Class 10-A with 100 total marks baseline"
}
```

---

### Screen 28: Academic Years & Sessions Setup (`/AcademicYears`)
- **Primary Function:** System-wide academic session lifecycle manager. Controls session start/end dates, session progress percentage bar, days remaining counter, and active session toggle.
- **Agent 1 & UI Pattern Compliance:**
  - **Active Session Hero Banner:** Vibrant gradient card for active session displaying title, start/end dates, session progress %, days remaining countdown, and months duration.
  - **Other Sessions Grid:** Cards grid displaying upcoming and past sessions with progress bar and status badges (`Active`, `Upcoming`, `Completed`).
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Set as Active`, `Edit Details`, `Delete Year`).
  - **Form View:** Full-page form view with `<DatePicker>`, `<Label required>`, title input, and active session checkbox.
- **Backend API & Schema:**
  - Endpoints: `GET /api/academicyears/tenant/{tenantId}`, `POST /api/academicyears`, `PUT /api/academicyears/{id}`, `DELETE /api/academicyears/{id}`.
  - Table: `AcademicYears` (`id`, `tenant_id`, `title`, `start_date`, `end_date`, `is_current`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Create New Academic Year 2026-2027 & Set Active
```json
{
  "Session Title": "Academic Session 2026-2027",
  "Start Date": "2026-08-01",
  "End Date": "2027-05-31",
  "Is Active": true,
  "Action": "Click '+ Add Academic Year' -> Save form",
  "Expected Result": "Creates new session and sets it as the active session across the Restaurant Management System"
}
```

---

## 🏫 TURN 15: Classes Directory & Class Sections Setup Engine

### Screen 29: Classes Directory & Grade Levels Setup (`/Classes`)
- **Primary Function:** Centralized grade level configuration desk for defining school academic levels (e.g. Nursery, Class 1, Class 10, O-Levels) and class codes.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** Top 3 KPI cards displaying Total Classes Count, Coded Grades Count, and Unnamed Forms.
  - **TanStack Datatable Register:** Datatable featuring Class Name, Class Code badge, column sorting, and global search.
  - **Slide-Over Form Drawer:** `<ClassFormDrawer>` with input fields for class name and class code.
  - **Row Action Menu:** React Portals `<ClassActionMenu>` for actions (`View Details`, `Edit Class`, `Delete Class`).
  - **Data Export:** Integrated PDF and CSV exports for class grade rosters.
- **Backend API & Schema:**
  - Endpoints: `GET /api/classes/tenant/{tenantId}`, `POST /api/classes`, `PUT /api/classes/{id}`, `DELETE /api/classes/{id}`.
  - Table: `Classes` (`id`, `tenant_id`, `name`, `code`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Add New Class Grade 10
```json
{
  "Class Name": "Class 10 (Metric)",
  "Class Code": "CLS-10",
  "Action": "Click '+ Add New Class' -> Enter Name & Code -> Save",
  "Expected Result": "Registers Class 10 in school grade hierarchy"
}
```

---

### Screen 30: Class Sections & Capacity Allocation (`/Sections`)
- **Primary Function:** Class room and section capacity partitioning engine for dividing grade levels into manageable class sections (e.g. Section A, Section B, Section Blue) with room assignments and max capacity limits.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** Top summary cards displaying Total Sections Count, Assigned Rooms Count, and Average Capacity Seats.
  - **Class Filter Header Tabs:** Horizontal filter tabs filtering section lists by specific class.
  - **TanStack Datatable Register:** Datatable featuring Class / Grade Name, Section Name, Room Number badge, Max Capacity limit tag, and column sorting.
  - **Slide-Over Form Drawer:** `<SectionFormDrawer>` with `<SearchableSelect>` for class selection, room number, and max capacity.
  - **Row Action Menu:** React Portals `<SectionActionMenu>` for actions (`View Details`, `Edit Section`, `Delete Section`).
  - **Data Export:** Integrated PDF and CSV exports for section capacity reports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/sections/tenant/{tenantId}`, `POST /api/sections`, `PUT /api/sections/{id}`, `DELETE /api/sections/{id}`.
  - Table: `Sections` (`id`, `tenant_id`, `class_id`, `name`, `room_number`, `max_capacity`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Create Section 10-A with Room & 40 Students Capacity
```json
{
  "Target Class": "Class 10 (Metric)",
  "Section Name": "Section A",
  "Room Number": "Room 204 (Science Block)",
  "Max Capacity": 40,
  "Action": "Click '+ Add New Section' -> Select Class 10 -> Save",
  "Expected Result": "Creates Section 10-A with room assignment and 40-student seat limit"
}
```

---

## 📖 TURN 16: Subjects Master Directory & Class Timetable Planner Engine

### Screen 31: Subjects Master Directory & Codes (`/Subjects`)
- **Primary Function:** Centralized master subjects catalog for registering core subjects (e.g. Mathematics, English) and elective courses (e.g. Computer Science, Biology, Urdu Literature) with unique subject codes.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** Top 3 KPI cards displaying Total Subjects Count, Core Subjects Count, and Elective Subjects Count.
  - **Sleek Subject Tabs:** Tabs filtering subject inventory (`All Subjects`, `Core Only`, `Elective Only`).
  - **TanStack Datatable Inventory:** Datatable featuring subject name, gradient avatar initial badge, subject code font mono badge, type badge (`Core` / `Elective`), and column sorting.
  - **Slide-Over Form Drawer:** `<SubjectFormDrawer>` with input fields for subject name, subject code, and elective checkbox.
  - **Row Action Menu:** React Portals `<SubjectActionMenu>` for actions (`View Details`, `Edit Subject`, `Delete Subject`).
  - **Data Export:** Integrated PDF and CSV exports for subject master lists.
- **Backend API & Schema:**
  - Endpoints: `GET /api/subjects/tenant/{tenantId}`, `POST /api/subjects`, `PUT /api/subjects/{id}`, `DELETE /api/subjects/{id}`.
  - Table: `Subjects` (`id`, `tenant_id`, `name`, `code`, `is_elective`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Register Core Subject Mathematics (MATH-10)
```json
{
  "Subject Name": "Mathematics",
  "Subject Code": "MATH-10",
  "Is Elective": false,
  "Action": "Click '+ Add Subject' -> Fill Name & Code -> Save",
  "Expected Result": "Registers Mathematics as a core subject in the master syllabus catalog"
}
```

---

### Screen 32: Class Timetable & Period Schedule Planner (`/Timetable`)
- **Primary Function:** Weekly class schedule planner and period allocation matrix. Features smart timetable auto-generation, day-by-day period stacks, teacher/room conflict prevention, and time slot popups.
- **Agent 1 & UI Pattern Compliance:**
  - **Class & Section Dropdowns Header:** Dual `<SearchableSelect>` filters for selecting Class and Section.
  - **Smart Auto-Generate Engine:** `✨ Auto-Generate` button triggering heuristic algorithm for conflict-free period schedule generation.
  - **Weekly Period Stacks Grid:** 6-day column cards (Monday-Saturday) displaying scheduled periods with color-coded subject cards, teacher names, room numbers, and time slots.
  - **Slide-Over Period Drawer:** `<TimetablePeriodDrawer>` featuring `<TimePicker>`, `<SearchableSelect>` for Subject & Teacher, and Room Assignment.
  - **Data Export:** Integrated PDF and CSV exports for weekly class timetables.
- **Backend API & Schema:**
  - Endpoints: `GET /api/timetableperiods/tenant/{tenantId}/section/{sectionId}`, `POST /api/timetableperiods`, `POST /api/timetableperiods/auto-generate`, `DELETE /api/timetableperiods/{id}`.
  - Table: `TimetablePeriods` (`id`, `tenant_id`, `class_id`, `section_id`, `subject_id`, `staff_id`, `day_of_week`, `start_time`, `end_time`, `room_name`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Schedule Monday Period 1 Mathematics with Teacher & Room
```json
{
  "Target Class": "Class 10 (Metric)",
  "Target Section": "Section A",
  "Day of Week": "Monday",
  "Time Slot": "08:00 AM - 08:45 AM",
  "Subject": "Mathematics",
  "Teacher": "Tariq Mahmood",
  "Room": "Room 204",
  "Action": "Click '+' on Monday -> Set Time, Subject, Teacher & Room -> Click Save",
  "Expected Result": "Adds Period 1 slot to Monday timetable for Class 10-A"
}
```

#### Test Case 2: Run Smart Auto-Generate Timetable
```json
{
  "Target Class": "Class 10 (Metric)",
  "Target Section": "Section A",
  "Action": "Click '✨ Auto-Generate'",
  "Expected Result": "Automatically generates conflict-free weekly timetable mapping assigned class subjects to available teachers"
}
```

---

## 👩‍🏫 PHASE 2 - TURN 6: Teacher Timetable & Student Directory Master Register

### Screen 11: Teacher Timetable & Free Period Slot Finder (`/TeacherTimetable`)
- **Primary Function:** Faculty weekly schedule and free period finder desk. Allows administration and staff to select any teacher and view their weekly period breakdown (Monday-Saturday), assigned classes, room locations, and free periods for proxy substitution.
- **Agent 1 & UI Pattern Compliance:**
  - **Teacher Selection Field:** `<SearchableSelect>` with `<Label required>` for quick teacher lookup.
  - **Weekly Faculty Schedule Matrix:** 6-day rows displaying period cards with subject name, time slot, class name, section, and room location.
  - **Free Slot Indicator:** Green badge (`Teacher is completely free on this day`) indicating free periods.
- **Backend API & Schema:**
  - Endpoints: `GET /api/timetableperiods/tenant/{tenantId}/teacher/{teacherId}`, `GET /api/staff/tenant/{tenantId}`.
  - Table: `TimetablePeriods` (`id`, `tenant_id`, `class_id`, `section_id`, `subject_id`, `staff_id`, `day_of_week`, `start_time`, `end_time`, `room_name`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Inspect Teacher Weekly Timetable & Free Slots
```json
{
  "Selected Teacher": "Tariq Mahmood",
  "Action": "Select 'Tariq Mahmood' from SearchableSelect dropdown",
  "Expected Result": "Renders 6-day weekly schedule matrix highlighting assigned class periods and free days"
}
```

---

### Screen 12: Student Directory & Master Register (`/StudentDirectory`)
- **Primary Function:** Comprehensive student master register for managing student bio-data, B-Form / CNIC, guardian details, medical histories, transfer certificates, and account generation.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** Top summary cards (`<StudentStats>`) displaying Total Enrolled Students, Male/Female ratios, and Active Status.
  - **TanStack Datatable Register:** Tabbed datatable inventory with avatar gradient initials, admission number, class/section, guardian contact, and column sorting.
  - **Slide-Over Profile Drawer:** Detailed drawer (`<StudentProfileDrawer>`) inspecting student profile, guardian details, and medical logs.
  - **Row Action Menu:** React Portals `<StudentActionMenu>` for actions (`View Profile`, `Edit Profile`, `Medical Form`, `Transfer Certificate`, `Delete`).
  - **Full-Page Form View:** Multi-card student registration form with `<ImageUpload>`, `<SearchableSelect>`, `<DatePicker>`, and `<Label required>`.
  - **Data Export:** Integrated PDF and CSV exports for student directory rosters.
- **Backend API & Schema:**
  - Endpoints: `GET /api/students/tenant/{tenantId}`, `POST /api/students`, `PUT /api/students/{id}`, `DELETE /api/students/{id}`, `POST /api/students/{id}/generate-account`.
  - Table: `Students` (`id`, `tenant_id`, `first_name`, `last_name`, `admission_number`, `father_name`, `father_cnic`, `guardian_phone`, `gender`, `date_of_birth`, `address`, `b_form_number`, `is_active`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Register New Student & View Master Profile
```json
{
  "First Name": "Mustafa",
  "Last Name": "Ali",
  "Gender": "Male",
  "DOB": "2014-03-20",
  "B-Form": "42101-1234567-1",
  "Father Name": "Tariq Mahmood",
  "Guardian Phone": "0312-9876543",
  "Father CNIC": "42101-9876543-1",
  "Action": "Click 'Save Student Record' -> Inspect profile in Datatable",
  "Expected Result": "Registers student profile and maps all guardian and bio-data fields cleanly"
}
```

---

## 📝 LEAVE & SUBSTITUTE MODULE: Student Leave Portal & Teacher Substitutes Manager

### Screen 20: Student Leave Application Portal (`/StudentLeaveApplication`)
- **Primary Function:** Online student leave application submission and tracking portal. Allows students and parents to submit sick leave or casual leave applications with reasons and file attachments (e.g. medical certificates) and track approval status.
- **Agent 1 & UI Pattern Compliance:**
  - **Status Badges:** Status badges (`Approved` green, `Rejected` red, `Pending` amber).
  - **Leave Application Modal:** `<Modal>` window featuring `<SearchableSelect>` for leave types, `<DatePicker>` for start/end dates, `<Label required>`, and file upload.
  - **Approver Notes:** Inline display of administration review comments.
- **Backend API & Schema:**
  - Endpoints: `GET /api/leaveapplications/tenant/{tenantId}/student/{studentId}`, `POST /api/leaveapplications`, `POST /api/uploads`.
  - Table: `LeaveApplications` (`id`, `tenant_id`, `student_id`, `leave_type`, `start_date`, `end_date`, `reason`, `attachment_url`, `status`, `approver_notes`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Apply for Sick Leave with Medical Certificate Attachment
```json
{
  "Leave Type": "Sick Leave",
  "Start Date": "2026-08-05",
  "End Date": "2026-08-06",
  "Reason": "High fever and medical rest advised by doctor",
  "Attachment": "Medical certificate image/pdf upload",
  "Action": "Click 'Apply Leave' -> Fill details -> Click 'Submit Application'",
  "Expected Result": "Submits leave application and displays 'Pending' status badge"
}
```

---

### Screen 25: Teacher Substitutes & Swap Manager (`/SubstituteManagement`)
- **Primary Function:** Real-time absent teacher substitution allocator. Automatically queries the timetable period matrix for absent faculty members and fetches a list of available free teachers during those specific time slots for 1-click proxy allocation.
- **Agent 1 & UI Pattern Compliance:**
  - **Absence Date & Teacher Selectors:** `<DatePicker>` for date of absence and `<SearchableSelect>` for absent teacher selection.
  - **Classes to Cover Cards:** List of period cards showing time slot badge, subject name, class/section, room location, and coverage status (`Covered` green badge).
  - **Real-Time Free Teacher Lookup:** Dropdown populated with teachers who have no assigned classes during that exact period slot.
- **Backend API & Schema:**
  - Endpoints: `GET /api/timetableperiods/tenant/{tenantId}/teacher/{teacherId}`, `GET /api/timetableperiods/tenant/{tenantId}/free-teachers`, `POST /api/timetableproxies`, `DELETE /api/timetableproxies/{id}`.
  - Table: `TimetableProxies` (`id`, `tenant_id`, `timetable_period_id`, `date_of_proxy`, `absent_staff_id`, `substitute_staff_id`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Allocate Substitute Teacher for Absent Period Slot
```json
{
  "Date of Absence": "2026-08-05",
  "Absent Teacher": "Tariq Mahmood",
  "Target Period": "09:00 AM - 09:45 AM (Mathematics - Class 10-A)",
  "Selected Free Substitute": "Ali Raza",
  "Action": "Select 'Ali Raza' from free substitute dropdown -> Click 'Allocate Substitute'",
  "Expected Result": "Allocates Ali Raza as substitute teacher and marks period slot as Covered"
}
```

---

## 📚 TURN 14: Digital Library & Virtual Classroom Manager

### Screen 27: Study Material & E-Books Repository (`/StudyMaterialRepository`)
- **Primary Function:** Centralized digital repository for uploading, organizing, and distributing lecture notes, worksheets, past papers, reference e-books, and video tutorials mapped to specific classes and subjects.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Repository Files, Lecture Notes count, Past Papers count, and Video Tutorials count.
  - **TanStack Datatable Inventory:** Datatable featuring resource title, material type badge (`Notes`, `Past Paper`, `Video`, `Book`), class & subject labels, and direct resource/video launch actions.
  - **Slide-Over Form Drawer & Direct File Upload:** `<ProfileDrawer>` featuring **`Upload File`** button (direct local PDF/Doc upload via `/api/uploads`) + external URL link input, `<SearchableSelect>` for Material Type, Target Class, and Subject.
  - **Embedded Video Player Modal:** Lightbox modal for streaming embedded YouTube / Vimeo video lectures directly inside the app.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Delete Resource`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/studymaterials/tenant/{tenantId}`, `POST /api/studymaterials`, `DELETE /api/studymaterials/{id}`.
  - Table: `StudyMaterials` (`id`, `tenant_id`, `class_id`, `subject_id`, `title`, `description`, `material_type`, `file_url`, `video_url`, `uploaded_by`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Upload Physics Lecture Notes PDF Link
```json
{
  "Resource Title": "Physics Ch 3 Motion & Kinematics Notes",
  "Material Type": "Lecture Notes",
  "Target Class": "Class 10 (Metric)",
  "Subject": "Physics",
  "File Link": "https://drive.google.com/file/d/sample-notes-pdf/view",
  "Description": "Comprehensive chapter 3 formula sheet and numerical exercises",
  "Action": "Click '+ Upload Material' -> Fill details -> Click 'Publish Material'",
  "Expected Result": "Publishes material and makes 'View Resource' button active in repository table"
}
```

#### Test Case 2: Embed YouTube Video Lecture
```json
{
  "Resource Title": "Organic Chemistry Reaction Mechanism Video",
  "Material Type": "Video Tutorial",
  "Target Class": "Class 10 (Metric)",
  "Subject": "Chemistry",
  "Video Link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "Action": "Select Material Type 'Video' -> Paste URL -> Publish",
  "Expected Result": "Renders 'Watch Video' button opening inline video player modal"
}
```

---

### Screen 28: Live Online Video Classes Manager (`/LiveClassesManager`)
- **Primary Function:** Virtual classroom scheduling engine. Enables teachers and administration to schedule Zoom, Google Meet, or Microsoft Teams online video sessions with target classes, meeting links, start date/time, and duration.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Live Sessions, Live Now 🔴 count, Upcoming Scheduled count, and Completed count.
  - **TanStack Datatable Register:** Datatable featuring session topic, meeting platform badge, class & subject labels, host teacher name, formatted date & time, status badge (`Live Now 🔴`, `Scheduled`, `Ended`), and `Launch Class` button.
  - **Slide-Over Schedule Drawer:** `<ProfileDrawer>` with `<SearchableSelect>` for Platform, Class, Subject, Host Teacher, datetime picker, and duration input.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Cancel Session`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/liveclasses/tenant/{tenantId}`, `POST /api/liveclasses`, `DELETE /api/liveclasses/{id}`.
  - Table: `LiveClasses` (`id`, `tenant_id`, `class_id`, `subject_id`, `teacher_id`, `topic`, `platform`, `meeting_link`, `start_time`, `duration_minutes`, `status`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Schedule Live Google Meet Chemistry Session
```json
{
  "Class Topic": "Organic Chemistry Live Q&A & Numerical Solving",
  "Meeting Platform": "Google Meet",
  "Meeting Link": "https://meet.google.com/abc-defg-hij",
  "Target Class": "Class 10 (Metric)",
  "Subject": "Chemistry",
  "Host Teacher": "Tariq Mahmood",
  "Start Date & Time": "2026-08-01 10:00 AM",
  "Duration": 45,
  "Action": "Click '+ Schedule Live Class' -> Fill form -> Click 'Schedule Class'",
  "Expected Result": "Schedules live class session and displays 'Scheduled' status badge with Launch Class button"
}
```

---

## 📖 TURN 15: Student Diaries & Co-Curricular House System

### Screen 29: Student Daily Diaries & Homework Notes (`/StudentDiaryManager`)
- **Primary Function:** Daily student communication desk for class teachers to publish daily remarks, conduct grades (`Excellent`, `Good`, `Satisfactory`, `Needs Improvement`), and homework summaries to student and parent portals. Supports both single student entries and 1-click **Bulk Class Diary** publishing.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Published Notes, Today's Class Diaries, Excellent Remarks count, and Active Students count.
  - **TanStack Datatable Log:** Datatable featuring student GR number, class & section, remarks text, conduct badge, date, and column sorting.
  - **Dual Drawer Mode (Single vs Bulk):** `<ProfileDrawer>` supporting individual student diary entry OR bulk publishing to an entire class section.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Delete Diary Entry`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/studentdiaries/tenant/{tenantId}`, `POST /api/studentdiaries`, `POST /api/studentdiaries/bulk`, `DELETE /api/studentdiaries/{id}`.
  - Table: `StudentDiaries` (`id`, `tenant_id`, `student_id`, `class_id`, `section_id`, `date`, `remarks`, `homework_summary`, `conduct`, `created_by`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Publish Single Student Daily Diary Note
```json
{
  "Target Student": "Mustafa Ali (GR: ADM-1029)",
  "Date": "2026-08-01",
  "Remarks": "Participated actively in Science experiment today. Showed great interest.",
  "Homework Summary": "Read Chapter 4 pages 45-50",
  "Conduct Grade": "Excellent",
  "Action": "Click '+ Single Note' -> Fill form -> Click 'Publish Diary Note'",
  "Expected Result": "Publishes diary entry to student's profile with 'Excellent' conduct badge"
}
```

#### Test Case 2: Broadcast Bulk Diary Note to Class 10-A
```json
{
  "Target Class": "Class 10 (Metric)",
  "Target Section": "Section A",
  "Date": "2026-08-01",
  "Remarks": "Complete Math Exercise 4.2 Questions 1-10 for tomorrow's check.",
  "Action": "Click 'Bulk Class Diary' -> Select Class 10-A -> Click 'Publish Diary Note'",
  "Expected Result": "Broadcasts diary note to all enrolled students in Class 10-A simultaneously"
}
```

---

### Screen 30: House System & Student Points Leaderboard (`/HouseSystemDashboard`)
- **Primary Function:** Co-curricular House System and merit points gamification dashboard. Tracks points for Red, Blue, Green, and Yellow houses for sports victories, debates, academic excellence, and disciplinary penalties.
- **Agent 1 & UI Pattern Compliance:**
  - **Visual House Leaderboard Cards:** 4 Gradient-accented House Cards (Red, Blue, Green, Yellow) displaying total points, enrolled student count, and animated **`🏆 LEADER`** trophy badge for the current top house.
  - **KPI Summary Cards:** `<StatCards>` displaying Leader House, Total Award Logs, Red House Points, and Blue House Points.
  - **TanStack Datatable Log:** Datatable featuring house badge, points awarded (`+10 Pts` / `-5 Pts`), reason/achievement description, recipient student name, award date, and column sorting.
  - **Award Points Drawer:** `<ProfileDrawer>` with `<SearchableSelect>` for House Name, Points input, Reason textarea, and optional individual student recipient.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Revoke Points`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/housepoints/tenant/{tenantId}`, `POST /api/housepoints`, `DELETE /api/housepoints/{id}`.
  - Table: `HousePointLogs` (`id`, `tenant_id`, `house_name`, `student_id`, `points`, `reason`, `awarded_by`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Award 20 Points to Red House for Debate Championship
```json
{
  "Target House": "Red House",
  "Points Amount": 20,
  "Reason / Achievement": "1st Place in All-City Inter-School Debate Championship",
  "Individual Student": "Mustafa Ali",
  "Action": "Click '+ Award House Points' -> Fill details -> Click 'Award Points'",
  "Expected Result": "Adds 20 points to Red House total score and updates leaderboard cards"
}
```

---

## 🎒 PHASE 4: LMS, QUESTION BANK & EXAMINATION SYSTEM

## 📝 TURN 16: Homework Management & Submissions Grading Engine

### Screen 31: Homework Management & Assignments (`/HomeworkManagement`)
- **Primary Function:** Homework creation and assignment distribution desk. Enables subject teachers to create assignments with rich text instructions (`<RichTextEditor>`), due dates, max points, and file/link attachments for target class sections.
- **Agent 1 & UI Pattern Compliance:**
  - **Class & Section Selectors:** Dual `<SearchableSelect>` filters for selecting Class and Section.
  - **Assignment Cards Grid:** Visual cards displaying assignment title, subject pill badge, assignment date, due date (rose badge), max points green badge, and trash action.
  - **Rich Text Assignment Modal:** Modal window featuring `<RichTextEditor>` for detailed instructions, `<DatePicker>` for due dates, `<Label required>`, and direct file upload + URL attachment links.
- **Backend API & Schema:**
  - Endpoints: `GET /api/homeworks/tenant/{tenantId}/class/{classId}/section/{sectionId}`, `POST /api/homeworks`, `DELETE /api/homeworks/{id}`, `POST /api/uploads`.
  - Table: `Homeworks` (`id`, `tenant_id`, `class_id`, `section_id`, `subject_id`, `staff_id`, `title`, `description`, `homework_date`, `due_date`, `max_marks`, `attachment_urls`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Create Science Homework Assignment with File Attachment
```json
{
  "Target Class": "Class 10 (Metric)",
  "Target Section": "Section A",
  "Title": "Chapter 4 Physics Numerical Worksheet",
  "Subject": "Physics",
  "Assign Date": "2026-08-01",
  "Due Date": "2026-08-05",
  "Max Points": 50,
  "Attachment": "Worksheet PDF file upload",
  "Action": "Click '+ Assign Homework' -> Fill details -> Click 'Assign Homework'",
  "Expected Result": "Schedules assignment for Class 10-A and renders homework card"
}
```

---

### Screen 32: Homework Submissions & Teacher Grading (`/HomeworkSubmissions`)
- **Primary Function:** Student homework submission inspection and teacher grading desk. Allows faculty members to review uploaded student work, inspect student notes/attachments, and award marks obtained with detailed teacher feedback remarks.
- **Agent 1 & UI Pattern Compliance:**
  - **Cascading Filter Header:** Triple `<SearchableSelect>` filters for Class, Section, and Homework assignment.
  - **Submission Register Table:** Table displaying student name with avatar badge, submission status (`Submitted` blue, `Graded` green, `Pending` yellow), submission date/time, marks obtained, and Grade button.
  - **Grading & Review Modal:** Lightbox modal displaying student's notes, clickable submission attachment links, `<InputField>` for marks obtained, and `<Label>` with teacher remarks textarea.
- **Backend API & Schema:**
  - Endpoints: `GET /api/homeworksubmissions/tenant/{tenantId}/homework/{homeworkId}`, `PUT /api/homeworksubmissions/{id}/grade`.
  - Table: `HomeworkSubmissions` (`id`, `tenant_id`, `homework_id`, `student_id`, `submission_date`, `student_notes`, `attachment_urls`, `status`, `marks_obtained`, `teacher_remarks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Grade Student Submission with Feedback
```json
{
  "Target Homework": "Chapter 4 Physics Numerical Worksheet",
  "Student": "Mustafa Ali",
  "Marks Obtained": 45,
  "Teacher Remarks": "Excellent work! Solved all numerical steps correctly.",
  "Action": "Click 'Grade' -> Input 45 marks & remarks -> Click 'Save Grade'",
  "Expected Result": "Updates submission status to 'Graded' and saves 45/50 marks"
}
```

---

## 🎒 TURN 17: Student Homework Portal & Exam Terms Setup

### Screen 33: Student Homework Portal (`/StudentHomeworkPortal`)
- **Primary Function:** Student LMS portal for viewing assigned homeworks, checking due dates, reading teacher instructions & attachments, submitting rich text notes & uploaded files, and viewing graded scores & teacher feedback.
- **Agent 1 & UI Pattern Compliance:**
  - **Assignment Cards Grid:** Color-coded border cards (`Graded` green, `Submitted` blue, `Overdue` red, `Pending` yellow).
  - **Submission Modal:** Modal featuring `<RichTextEditor>` for student response, `<Label>`, and file attachment upload via `POST /api/uploads`.
  - **Graded Score Feedback Box:** Green callout box displaying score obtained vs max points and teacher feedback remarks.
- **Backend API & Schema:**
  - Endpoints: `GET /api/homeworks/tenant/{tenantId}`, `GET /api/homeworksubmissions/tenant/{tenantId}/student/{studentId}`, `POST /api/homeworksubmissions/submit`.
  - Table: `HomeworkSubmissions` (`id`, `tenant_id`, `homework_id`, `student_id`, `submission_date`, `student_notes`, `attachment_urls`, `status`, `marks_obtained`, `teacher_remarks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Submit Homework Response with File Attachment
```json
{
  "Homework": "Chapter 4 Physics Numerical Worksheet",
  "Student Notes": "Attached completed numerical solutions for problems 1 to 10.",
  "Attachment": "Uploaded solved worksheet PDF",
  "Action": "Click 'Submit Work' -> Type notes -> Upload PDF -> Click 'Turn In'",
  "Expected Result": "Submits work, updates status to 'Submitted', and makes work available for teacher grading"
}
```

---

### Screen 34: Exam Terms Setup & Lock Management (`/ExamSetups`)
- **Primary Function:** Master examination terms setup & lock control desk. Enables administration to configure examination terms (e.g. Mid-Term 2026, Final Exams 2026), set start & end dates, define exam status (`Upcoming`, `Ongoing`, `Completed`), and toggle **Marks Entry Lock** to prevent unauthorized marks modifications.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Page navigation path `<Breadcrumb items={[{ label: 'Examinations' }, { label: 'Exam Setup' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Upcoming Exams, Ongoing Exams, and Completed Exams count.
  - **TanStack Datatable Register:** Tabbed datatable (`All Exams`, `Upcoming`, `Ongoing`, `Completed`), status badges, lock status indicator, and column sorting.
  - **Full-Page Form View:** Dual card full-page form view with `<InputField>`, `<DatePicker>`, `<SearchableSelect>`, and `<Label required>`.
  - **Slide-Over Detail Drawer:** `<ProfileDrawer>` displaying exam schedule, status badge, and exam instructions.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`View Details`, `Edit Exam`, `Lock Marks / Unlock Marks`, `Delete`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/examsetups/tenant/{tenantId}`, `POST /api/examsetups`, `PUT /api/examsetups/{id}`, `DELETE /api/examsetups/{id}`, `POST /api/examsetups/{id}/toggle-lock`.
  - Table: `ExamSetups` (`id`, `tenant_id`, `title`, `start_date`, `end_date`, `status`, `is_locked`, `description`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Register Mid-Term 2026 Exam & Toggle Marks Lock
```json
{
  "Exam Title": "Mid-Term Examination 2026",
  "Start Date": "2026-09-01",
  "End Date": "2026-09-15",
  "Status": "Upcoming",
  "Description": "Mid-term examinations covering Term 1 syllabus",
  "Action": "Click '+ Add New Exam' -> Save -> Toggle Lock Marks from ActionMenu",
  "Expected Result": "Registers exam term and toggles is_locked flag to lock marks entry"
}
```

---

## 🏆 TURN 18: Exam Schedules, Date Sheets & Grading Scales Engine

### Screen 35: Exam Schedules & Date Sheet (`/ExamSchedules`)
- **Primary Function:** Examination date sheet scheduler and paper slot allocation manager. Enables academic coordination to schedule subject paper slots, set date/time windows, and configure total & passing marks benchmarks per class and exam term.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Examinations' }, { label: 'Exam Date Sheets' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Total Papers scheduled, First Exam date badge, and Final Exam date benchmark.
  - **Cascading Filter Header:** Dual `<SearchableSelect>` filters for Exam Term and Target Class.
  - **TanStack Datatable Register:** Filtered datatable (`<DebouncedSearch>`), custom page size selector, CSV export, PDF date sheet generator, and column sorting.
  - **Slide-Over Form Drawer:** `<ProfileDrawer>` style drawer featuring `<SearchableSelect>` for Subject, `<DatePicker>`, `<InputField>` timing & marks benchmarks, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Modify Paper`, `Delete Paper Slot`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/examschedules/tenant/{tenantId}/datesheet`, `POST /api/examschedules`, `PUT /api/examschedules/{id}`, `DELETE /api/examschedules/{id}`.
  - Table: `ExamSchedules` (`id`, `tenant_id`, `exam_setup_id`, `class_id`, `subject_id`, `exam_date`, `start_time`, `end_time`, `total_marks`, `passing_marks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Add Physics Paper Slot to Mid-Term Date Sheet
```json
{
  "Exam Term": "Mid-Term Examination 2026",
  "Class": "Class 10 (Metric)",
  "Subject": "Physics",
  "Date": "2026-09-02",
  "Timing": "09:00 AM - 12:00 PM",
  "Total Marks": 100,
  "Passing Marks": 40,
  "Action": "Click '+ Add Paper Slot' -> Fill slot details -> Click 'Lock Paper Slot'",
  "Expected Result": "Schedules Physics paper slot and adds entry to printable date sheet"
}
```

---

### Screen 36: Grading Scales & Pass Criteria (`/GradingScales`)
- **Primary Function:** Centralized grading rules and GPA configuration engine. Allows administration to define letter grades (`A+`, `A`, `B`, `C`, `F`), percentage range boundaries (`Min %` to `Max %`), GPA points, and evaluation remarks.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Active Grading Rules count, Highest Grade badge, and Max GPA point.
  - **TanStack Datatable Register:** Datatable with `<DebouncedSearch>`, CSV export, PDF grading rule report generator, color-coded grade badges, and column sorting.
  - **Slide-Over Form Drawer:** Drawer featuring `<InputField>` for Grade Name, Min %, Max %, GPA Point, Remarks, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Edit Rule`, `Delete Rule`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/gradingscales/tenant/{tenantId}`, `POST /api/gradingscales`, `PUT /api/gradingscales/{id}`, `DELETE /api/gradingscales/{id}`.
  - Table: `GradingScales` (`id`, `tenant_id`, `grade_name`, `min_percentage`, `max_percentage`, `gpa_point`, `remarks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Configure Grade A+ Scale Rule
```json
{
  "Grade Name": "A+",
  "Min %": 85.00,
  "Max %": 100.00,
  "GPA Point": 4.00,
  "Remarks": "Outstanding Distinction",
  "Action": "Click '+ Add Grading Rule' -> Fill scale details -> Click 'Save Rule'",
  "Expected Result": "Creates A+ scale rule (85-100% = 4.0 GPA) and updates grading engine matrix"
}
```

---

## 🏆 TURN 19: Marks Entry Register & Academic Report Card Engine

### Screen 37: Subject Marks Entry Register (`/MarksEntryDashboard`)
- **Primary Function:** Fast spreadsheet-style subject marks entry desk for teachers and exam cell operators. Enables bulk entry of Theory, Practical, and Assignment marks, absentee toggling (`is_absent`), real-time score summation, and single-click bulk saving.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Examinations' }, { label: 'Marks Entry' }]} />`.
  - **KPI Summary Cards:** Real-time `<StatCards>` displaying Total Enrolled, Absentees count, and live Class Average score.
  - **Cascading Filter Header:** Triple `<SearchableSelect>` filters for Exam Term, Target Class, and Subject with `<Label required>`.
  - **Spreadsheet Datatable Register:** High-speed inline input grid (`Theory`, `Practical`, `Assignment`, `Remarks`), red-tinted absentee rows, CSV export, PDF marksheet generator, and `<DebouncedSearch>`.
  - **Sticky Action Bar:** Fixed bottom action bar displaying total records updated and single-click **Save Marks** action.
- **Backend API & Schema:**
  - Endpoints: `GET /api/exammarks/tenant/{tenantId}/sheet?examId={examId}&classId={classId}&subjectId={subjectId}`, `POST /api/exammarks/bulk-save`.
  - Table: `ExamMarks` (`id`, `tenant_id`, `exam_setup_id`, `class_id`, `subject_id`, `student_id`, `theory_marks`, `practical_marks`, `assignment_marks`, `obtained_marks`, `is_absent`, `remarks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Enter Physics Marks for Class 10
```json
{
  "Exam Term": "Mid-Term Examination 2026",
  "Class": "Class 10 (Metric)",
  "Subject": "Physics",
  "Student": "Mustafa Ali",
  "Theory Marks": 65,
  "Practical Marks": 20,
  "Assignment Marks": 10,
  "Action": "Select filters -> Click 'Load Roster' -> Type marks -> Click 'Save Marks'",
  "Expected Result": "Automatically sums 65+20+10 = 95 Total Marks and saves to DB"
}
```

---

### Screen 38: Exam Marks Sheets & Tabulation (`/ReportCardManager`)
- **Primary Function:** Academic result aggregation engine, position holders spotlight, and official student report card transcript printer. Computes cumulative marks, percentages, letter grades (using `GradingScales`), GPA points, and pass/fail outcome per student.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Examinations' }, { label: 'Report Cards' }]} />`.
  - **Position Holders Spotlight:** Cards spotlighting 1st Position (Valedictorian - Gold Trophy), 2nd Position (Silver Medal), and 3rd Position (Bronze Award) with student name and percentage.
  - **Cascading Filter Header:** Dual `<SearchableSelect>` filters for Exam Setup Scope and Target Class Group with `<Label required>`.
  - **Result Ledger Datatable:** Tabulation register with `<DebouncedSearch>`, rank badges (`#1`, `#2`), outcome badges (`PASS` green, `FAIL` red), class CSV export, and class PDF report generator.
  - **Automated PDF Transcript Printer:** 1-Click **Print Slip** action generating multi-course official academic transcripts with letterhead, subject breakdown table, cumulative GPA, and principal signature lines.
- **Backend API & Schema:**
  - Endpoints: `GET /api/examresults/tenant/{tenantId}/class/{classId}?examId={examId}`, `POST /api/examresults/generate`.
  - Tables: `ExamResults` (`id`, `tenant_id`, `exam_setup_id`, `class_id`, `student_id`, `total_max_marks`, `total_obtained_marks`, `percentage`, `grade`, `gpa`, `status`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Run Result Compilation Engine for Class 10
```json
{
  "Exam Scope": "Mid-Term Examination 2026",
  "Target Class": "Class 10 (Metric)",
  "Action": "Select Scope & Class -> Click 'Compile Engine'",
  "Expected Result": "Aggregates all subject marks, computes GPA/Grades, spotlights top 3 position holders, and generates student transcript print slips"
}
```

---

## 🏆 TURN 20: Online Question Bank & CBT Exam Center Engine (PHASE 4 COMPLETE 🎉)

### Screen 39: Online Question Bank Repository (`/QuestionBank`)
- **Primary Function:** Centralized MCQ question bank management engine. Enables subject faculty and academic heads to author multiple-choice questions, set options (A, B, C, D), specify correct key, assign marks weightage, and tag difficulty level (`Easy`, `Medium`, `Hard`).
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Examinations' }, { label: 'Question Bank' }]} />`.
  - **KPI Summary Cards:** Real-time `<StatCards>` displaying Total Questions count, Easy/Medium questions ratio, and Hard questions count.
  - **TanStack Datatable Register:** Filtered datatable (`<DebouncedSearch>`), class & subject filter dropdowns (`<SearchableSelect>`), difficulty badges (`Easy` green, `Medium` yellow, `Hard` red), and column sorting.
  - **Full-Page Form View:** Form view featuring `<SearchableSelect>` for Class & Subject, `<Input>` for question text and options A-D, `<Label required>`, correct option selector, marks, and difficulty level dropdown.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Edit`, `Delete`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/questionbanks/tenant/{tenantId}`, `POST /api/questionbanks`, `PUT /api/questionbanks/{id}`, `DELETE /api/questionbanks/{id}`.
  - Table: `QuestionBanks` (`id`, `tenant_id`, `class_id`, `subject_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `marks`, `difficulty_level`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Create Physics MCQ Question in Bank
```json
{
  "Class": "Class 10 (Metric)",
  "Subject": "Physics",
  "Question": "What is the SI unit of Force?",
  "Option A": "Joule",
  "Option B": "Newton",
  "Option C": "Watt",
  "Option D": "Pascal",
  "Correct Option": "Option B",
  "Marks": 1,
  "Difficulty": "Easy",
  "Action": "Click '+ Add Question' -> Fill details -> Click 'Save Question'",
  "Expected Result": "Registers question in CBT question bank for Class 10 Physics"
}
```

---

### Screen 40: Online CBT Exam Center & Deployer (`/OnlineExams`)
- **Primary Function:** Computer-Based Testing (CBT) exam authoring and deployment center. Allows examination cell to schedule online test sessions, set duration timers (e.g. 60 minutes), configure pass thresholds, and dynamically map MCQs from the Question Bank into active online tests.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Examinations' }, { label: 'Online CBT Exams' }]} />`.
  - **TanStack Datatable Register:** Datatable featuring test title, exam date, timer badge (`60 Mins`), benchmark badges (`Total: 100`, `Pass: 40`), `<DebouncedSearch>`, and column sorting.
  - **Full-Page Form & MCQ Mapping Grid:** Full-page form view featuring `<SearchableSelect>` for Exam Term, Class, Section, and Subject, `<DatePicker>`, `<Input>` for duration/marks, `<Label required>`, and an **Interactive Question Selector Grid** displaying subject MCQs with checkboxes and selected question counters.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Delete`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/onlineexams/tenant/{tenantId}`, `POST /api/onlineexams`, `DELETE /api/onlineexams/{id}`.
  - Tables: `OnlineExams` (`id`, `tenant_id`, `exam_setup_id`, `class_id`, `section_id`, `subject_id`, `title`, `exam_date`, `duration_minutes`, `total_marks`, `passing_marks`, `created_at`), `OnlineExamQuestions` (`id`, `online_exam_id`, `question_bank_id`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Deploy 30-Minute Physics CBT Exam
```json
{
  "Exam Term": "Mid-Term Examination 2026",
  "Class": "Class 10 (Metric)",
  "Subject": "Physics",
  "Title": "Mid-Term Physics Online MCQ Test",
  "Date": "2026-09-05",
  "Duration": 30,
  "Total Marks": 25,
  "Passing Marks": 10,
  "Mapped Questions": "Select 25 MCQs from Question Bank grid",
  "Action": "Fill exam parameters -> Check 25 MCQs -> Click 'Deploy Exam'",
  "Expected Result": "Deploys online CBT exam session and makes test ready for student attempts"
}
```

---

## 💰 PHASE 5: ACCOUNTS, FEE SYSTEM & PAYROLL

## 💳 TURN 21: Fee Structures Allocation & Scholarship Concessions Engine

### Screen 41: Class Fee Structures & Allocation (`/FeeStructures`)
- **Primary Function:** Class-wise fee structure allocation and fee head pricing engine. Enables finance officers to configure annual/monthly fee heads (Tuition Fee, Admission Fee, Computer Lab Fee) and assign pricing rules per class and category (`Normal`, `Staff Child`, `Orphan`, `Merit`).
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Finance & Accounts' }, { label: 'Class Fee Structure Allocation' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Total Structure Rules count, Classes Covered count, and Avg Fee Head Amount.
  - **Academic Year Selector:** Top filter card featuring `<SearchableSelect>` for selecting target Academic Year with `<Label required>`.
  - **TanStack Datatable Register:** Filtered datatable (`<DataTable>`), CSV & Excel export, frequency badges (`Monthly` blue, `Annually` yellow, `One-Time` cyan), category badges, and amount formatted in green currency (`Rs. 5,000`).
  - **Slide-Over Form Drawer:** `<FeeStructuresDrawer>` featuring `<SearchableSelect>` for Academic Year, Class, Category, and Fee Type, `<InputField>` for amount, and `<Label required>`.
  - **Row Action Menu:** React Portals `<FeeStructuresActionMenu>` for actions (`Edit Fee Amount`, `Delete Fee Allocation`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/feestructures/tenant/{tenantId}/year/{yearId}`, `POST /api/feestructures`, `PUT /api/feestructures/{id}`, `DELETE /api/feestructures/{id}`.
  - Table: `FeeStructures` (`id`, `tenant_id`, `academic_year_id`, `class_id`, `fee_type_id`, `category`, `amount`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Assign Monthly Tuition Fee to Class 10
```json
{
  "Academic Year": "2026-2027",
  "Class": "Class 10 (Metric)",
  "Category": "Normal Student",
  "Fee Type": "Tuition Fee (Monthly)",
  "Amount": 5500,
  "Action": "Click '+ Assign Class Fee' -> Select parameters -> Input 5500 -> Click 'Allocate Fee'",
  "Expected Result": "Assigns Rs. 5,500 monthly tuition fee structure rule to Class 10"
}
```

---

### Screen 42: Student Fee Concessions & Waivers (`/FeeConcessionsManager`)
- **Primary Function:** Merit scholarships, orphan quotas, and staff-child fee discount approval manager. Enables finance administration to grant percentage discounts (e.g. 50% OFF) or flat cash waivers (e.g. Rs. 2,000 Flat) to individual students on specific fee heads.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Finance & Accounts' }, { label: 'Fee Concession & Scholarship Manager' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Total Granted Concessions count, Active Percent Discounts count, and Flat Amount Discounts count.
  - **TanStack Datatable Register:** Datatable (`<DataTable>`), CSV export, discount badges (`25% OFF` blue, `Rs. 1000 FLAT` green), active status badges (`ACTIVE` green), and search bar.
  - **Slide-Over Grant Drawer:** Drawer featuring `<SearchableSelect>` for Student (Search Name / Roll #), Target Fee Head, Scholarship Category (`Merit`, `Orphan`, `Staff Child`, `Need-based`), Discount Mechanism (`Percentage` vs `FixedAmount`), `<InputField>`, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Revoke Concession`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/feeconcessions/tenant/{tenantId}`, `POST /api/feeconcessions`, `DELETE /api/feeconcessions/{id}`.
  - Table: `FeeConcessions` (`id`, `tenant_id`, `student_id`, `fee_type_id`, `name`, `discount_type`, `discount_value`, `is_active`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Grant 50% Merit Scholarship to Top Student
```json
{
  "Student": "Mustafa Ali (Roll # 1001)",
  "Target Fee Head": "Tuition Fee",
  "Quota Category": "Merit Academic Scholarship",
  "Discount Mechanism": "Percentage",
  "Discount Value": 50,
  "Action": "Click '+ Grant Scholarship' -> Fill student & discount details -> Click 'Approve Concession'",
  "Expected Result": "Grants 50% tuition discount to student and automatically applies discount during fee voucher generation"
}
```

---

### Screen 43: Automated Fee Challan Vouchers (`/FeeChallans`)
- **Primary Function:** High-speed monthly bulk fee voucher generator and 3-copy PDF print engine. Allows finance managers to trigger batch bill generation for entire classes in 1 click, set issue and due dates, track billing metrics, and print tri-copy official fee slips (`Bank Copy`, `School Copy`, `Student Copy`).
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Finance & Accounts' }, { label: 'Fee Challans & Collection' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Total Billed amount, Revenue Collected amount, and Pending Dues amount.
  - **Cascading Filter Toolbar:** Dual `<SearchableSelect>` filters for Billing Month and Class Scope.
  - **TanStack Datatable Register:** Datatable (`<DataTable>`), CSV export, status badges (`PAID` green, `UNPAID` yellow, `OVERDUE` red, `PARTIAL` cyan), and search bar.
  - **Bulk Generation Drawer:** `<FeeChallansDrawer>` featuring `<SearchableSelect>` for Academic Year, Billing Month, and Class, `<DatePicker>` for Issue Date and Due Date, and `<Label required>`.
  - **3-Copy PDF Challan Printer:** 1-Click **Print PDF** action generating 3-copy official printable vouchers with fee breakdown tables, late fee rules, and signature blocks.
- **Backend API & Schema:**
  - Endpoints: `GET /api/feechallans/tenant/{tenantId}?billingMonth={month}&classId={classId}`, `POST /api/feechallans/generate-bulk`, `POST /api/feechallans/{id}/send-reminder`.
  - Table: `FeeChallans` (`id`, `tenant_id`, `academic_year_id`, `class_id`, `student_id`, `challan_number`, `billing_month`, `issue_date`, `due_date`, `net_payable`, `status`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Auto-Generate Bulk Bills for Class 10
```json
{
  "Academic Year": "2026-2027",
  "Billing Month": "August 2026",
  "Target Class": "Class 10 (Metric)",
  "Issue Date": "2026-08-01",
  "Due Date": "2026-08-10",
  "Action": "Click 'Auto-Generate Bulk Bills' -> Select parameters -> Click 'Run Engine'",
  "Expected Result": "Generates individual fee challan vouchers for all enrolled students in Class 10 with applied concessions"
}
```

---

### Screen 44: Fee Collection & Counter Receipts (`ReceivePaymentModal.tsx` / `/FeeChallans`)
- **Primary Function:** Counter fee receipt desk and multi-gateway payment processing desk. Allows school cashier to receive full or partial fee payments, record payment methods (`Cash`, `Bank Transfer`, `Cheque`, `JazzCash/EasyPaisa`, `Stripe/Card`), deduct from student's RFID wallet balance, and print instant payment receipts.
- **Agent 1 & UI Pattern Compliance:**
  - **Slide-Over Payment Drawer:** `<ReceivePaymentModal>` displaying net payable balance banner, `<Input>` for amount received, payment method `<SearchableSelect>`, card/mobile wallet input fields, wallet deduction checkbox, and `<Label required>`.
  - **Multi-Gateway Payment Support:** Cash, Cheque, Bank Transfer, JazzCash/EasyPaisa, Stripe Credit/Debit card support.
  - **Automated Ledger Update:** Automatically updates challan status (`PAID` or `PARTIALLY PAID`) and updates financial audit trail.
- **Backend API & Schema:**
  - Endpoints: `PUT /api/feechallans/{id}/pay`.
  - Table: `FeePayments` (`id`, `tenant_id`, `fee_challan_id`, `amount_received`, `payment_method`, `remarks`, `payment_date`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Collect Cash Payment at School Counter
```json
{
  "Student": "Mustafa Ali (Challan # CH-2026-08-1001)",
  "Net Payable": 5500,
  "Amount Received": 5500,
  "Payment Method": "Cash",
  "Remarks": "Full monthly fee paid at counter",
  "Action": "Click 'Receive Payment' -> Input 5500 -> Select Cash -> Click 'Confirm Payment'",
  "Expected Result": "Marks challan as PAID, updates total revenue collected KPI, and generates payment receipt"
}
```

---

### Screen 45: Fee Defaulters & Late Fine Manager (`/FeeDefaulters`)
- **Primary Function:** Overdue fee defaulters tracking and 1-Click WhatsApp & SMS reminder engine. Automatically filters all unpaid fee challans past their due date, computes accrued daily late fines (e.g. Rs. 50/day), and dispatches instant WhatsApp alerts to guardians.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Finance & Accounts' }, { label: 'Late Fee Fine & Defaulters Tracker' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Total Fee Defaulters count, Total Overdue Amount, and Reminder Channels (`WhatsApp + SMS`).
  - **TanStack Datatable Register:** Filtered datatable (`<DataTable>`), CSV report export, red days-overdue badges (`15 Days Overdue`), red-highlighted total dues + late fine amounts, and search bar.
  - **1-Click WhatsApp Action:** Row action button triggering single-click WhatsApp fee alert to guardian.
- **Backend API & Schema:**
  - Endpoints: `GET /api/feechallans/tenant/{tenantId}`, `POST /api/feechallans/{id}/send-reminder`.
  - Tables: `FeeChallans`, `FinancialAuditLogs`.
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Dispatch WhatsApp Alert to Defaulter Guardian
```json
{
  "Challan": "CH-2026-07-1002",
  "Student": "Hamza Tariq",
  "Days Overdue": 18,
  "Base Fee": 5000,
  "Late Fine": 900,
  "Action": "Click 'WhatsApp Alert' button on student row",
  "Expected Result": "Dispatches automated WhatsApp message with fee breakdown link to parent"
}
```

---

### Screen 46: Student RFID Wallets & Canteen POS (`/StudentWallets`)
- **Primary Function:** Cashless campus digital wallet and RFID micro-transaction desk. Enables school administration and canteen staff to issue RFID student card tags, recharge wallet balances via counter cash or digital wallets, and deduct canteen purchases or library fines.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Finance & Accounts' }, { label: 'Student Wallet & Micro-Transactions' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Total Student Wallets count, Total Active Balance pool, and Low Balance Wallets count (< Rs. 100).
  - **TanStack Datatable Register:** Datatable (`<DataTable>`), RFID card tag badges (`RFID-1004`), balance badges with low-balance alerts, and search bar.
  - **Recharge Slide-Over Drawer:** Top-up drawer with `<SearchableSelect>` for Student and Payment Channel, `<Input>` for recharge amount, and `<Label required>`.
  - **Canteen Deduction Drawer:** Purchase deduction drawer with `<SearchableSelect>` for Student and Deduction Tag Reason (`Canteen Food`, `Bookshop`, `Library Fine`), `<Input>`, balance sufficiency validator, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Top-Up Balance`, `Deduct Purchase`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/students/tenant/{tenantId}`, wallet ledger endpoints.
  - Tables: `StudentWallets` (`id`, `tenant_id`, `student_id`, `balance`, `rfid_card_tag`, `last_topup_date`, `created_at`), `WalletTransactions` (`id`, `wallet_id`, `transaction_type`, `amount`, `reason`, `payment_channel`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Recharge Student RFID Wallet with Rs. 1,000 Cash
```json
{
  "Student": "Mustafa Ali (Adm # 1001)",
  "Top-Up Amount": 1000,
  "Payment Channel": "Counter Cash Collection",
  "Action": "Click 'Re-charge Top-Up' -> Select student -> Input 1000 -> Click 'Confirm Top-Up'",
  "Expected Result": "Adds Rs. 1,000 to student wallet balance and updates RFID transaction ledger"
}
```

---

### Screen 47: School Expenses & Vendor Tracker (`/SchoolExpensesTracker`)
- **Primary Function:** Operational expenditure recording and vendor payment management desk. Enables school accountant to record day-to-day campus expenses (`Utilities`, `Maintenance`, `Events`, `Salaries`, `Marketing`), view live **Revenue vs Expense Trend Charts** (ApexCharts), and track vendor payables.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Finance & Accounts' }, { label: 'School Expenses & Vendor Management' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Total Monthly Expense, Top Spending Category, and Recorded Vouchers count.
  - **ApexCharts Trend Widget:** Interactive dual bar chart comparing 12-month Fee Revenue Collections vs Operational Expenditures.
  - **TanStack Datatable Register:** Datatable (`<DataTable>`), category badges (`Utilities` cyan, `Maintenance` yellow, `Salaries` green, `Marketing` red), negative red currency amounts (`- Rs. 45,000`), and CSV export.
  - **Expense Voucher Drawer:** `<SchoolExpensesDrawer>` featuring category `<SearchableSelect>`, `<DatePicker>`, expense title, amount, and `<Label required>`.
  - **Row Action Menu:** React Portals `<SchoolExpensesActionMenu>` for actions (`Edit Expense`, `Delete Expense`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/schoolexpenses/tenant/{tenantId}?month={month}&year={year}`, `POST /api/schoolexpenses`, `PUT /api/schoolexpenses/{id}`, `DELETE /api/schoolexpenses/{id}`, `GET /api/Dashboard/finance-trend`.
  - Table: `SchoolExpenses` (`id`, `tenant_id`, `category`, `title`, `amount`, `expense_date`, `description`, `recorded_by_user_id`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Record Monthly Electric Utility Bill
```json
{
  "Category": "Utilities (Electric / Water / Gas)",
  "Title": "KESC / Electricity Bill August 2026",
  "Amount": 85000,
  "Date": "2026-08-05",
  "Description": "Paid main campus electricity bill via bank transfer",
  "Action": "Click '+ Record Expense' -> Fill details -> Click 'Save Expense'",
  "Expected Result": "Records Rs. 85,000 expense, updates total expenditure KPI, and updates ApexCharts trend"
}
```

---

### Screen 48: Double-Entry Chart of Accounts & General Ledger (`/ChartOfAccounts`)
- **Primary Function:** Standard double-entry financial accounting ledger structure. Allows financial controllers to establish and organize 5 core account heads (`Asset`, `Liability`, `Equity`, `Income`, `Expense`), sub-categories (`Current Assets`, `Fixed Assets`, `Operating Income`, `Operating Expenses`), opening balances, and account codes (e.g. `1010 Cash`, `4010 Tuition Income`).
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Finance' }, { label: 'Chart of Accounts' }]} />`.
  - **KPI Summary Cards:** Metric cards displaying Total Assets, Total Liabilities, Total Income YTD, and Total Expenses YTD.
  - **TanStack Datatable Register:** Filtered datatable (`<DebouncedSearch>`), type filter dropdown (`<SearchableSelect>`), account code badges (`1010`), account type badges (`Asset` primary, `Income` success, `Expense` danger, `Liability` warning), and status badges (`Active`).
  - **Slide-Over Account Drawer:** Drawer featuring account code input, title input, account type `<SearchableSelect>`, sub-category group input, opening balance, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Edit Account`, `Delete`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/chartofaccounts/tenant/{tenantId}`, `POST /api/chartofaccounts`, `PUT /api/chartofaccounts/{id}`, `DELETE /api/chartofaccounts/{id}`.
  - Table: `ChartOfAccounts` (`id`, `tenant_id`, `code`, `name`, `type`, `sub_category`, `balance`, `is_active`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Create New Petty Cash Account Head
```json
{
  "Account Code": "1015",
  "Account Name": "School Canteen Petty Cash",
  "Account Type": "Asset",
  "Sub Category": "Current Assets",
  "Opening Balance": 25000,
  "Action": "Click '+ Add Account Head' -> Fill code 1015 -> Click 'Create Account'",
  "Expected Result": "Creates 1015 Asset account head and updates Chart of Accounts ledger"
}
```

---

## 🏆 TURN 25: Staff Payroll Engine & Financial Audit Trail (PHASE 5 COMPLETE 🎉)

### Screen 49: Staff Payroll & Monthly Salary Slips (`/SalarySlipsManager`)
- **Primary Function:** Automated staff payroll calculation engine and itemized PDF salary slip generator. Automatically syncs with staff attendance records (lates, half-days, unexcused absents), calculates basic pay, house rent allowance (HRA), medical allowance, provident fund (PF), loan recoveries, income tax deductions, and prints official salary slips.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Header breadcrumb navigation path `Finance & Accounts -> Staff Payroll & Salary Slips`.
  - **KPI Summary Cards:** Metric cards displaying Total Payable Salary amount, Total Disbursed amount, and Pending Salaries amount.
  - **Cascading Filter Header:** Month selector `<SearchableSelect>` and staff search `<InputField>`.
  - **TanStack Datatable Register:** Datatable featuring basic pay, deduction badges (`- Rs. 3,500`), net salary in indigo font (`Rs. 65,000`), status badges (`PAID` green, `UNPAID` yellow), CSV export, and PDF list export.
  - **Automated PDF Pay Slip Printer:** 1-Click **Print PDF** action generating official itemized pay slips with school letterhead, earnings breakdown, deduction breakdown, net pay, and dual signature lines (`HR Manager`, `Employee`).
  - **Payroll Engine Drawer:** `<PayrollEngineDrawer>` featuring Target Month & Year `<SearchableSelect>`, deduction rules configuration (`Lates = 1 Absent`, `Half-days = 1 Absent`, `Allowed Leaves`), and `<Label required>`.
  - **Row Action Menu:** React Portals `<SalarySlipActionMenu>` for actions (`Print Pay Slip`, `Disburse / Mark Paid`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/salaryslips/tenant/{tenantId}?salaryMonth={month}`, `POST /api/salaryslips/generate-bulk`, `POST /api/salaryslips/{id}/pay`.
  - Table: `SalarySlips` (`id`, `tenant_id`, `staff_id`, `salary_month`, `basic_salary`, `allowance_amount`, `deduction_amount`, `provident_fund_deduction`, `loan_deduction`, `income_tax_deduction`, `net_salary`, `status`, `payment_date`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Run Payroll Engine for August 2026
```json
{
  "Salary Month": "August 2026",
  "Lates Rule": 3,
  "Half-Days Rule": 2,
  "Allowed Leaves": 2,
  "Action": "Click 'Run Payroll Engine' -> Select Month & Rules -> Click 'Run Engine & Generate'",
  "Expected Result": "Calculates staff attendance deductions, generates salary slips for all active staff, and enables PDF slip printing"
}
```

---

### Screen 50: Financial Audit Trail & Executive Logs (`/FinancialAuditLogs`)
- **Primary Function:** Immutable financial auditing and cashier operation log. Tracks all fee payments, refunds, fee waivers, scholarship approvals, expense vouchers, and cashier wallet top-ups with timestamps, staff user names, IP addresses, and exact transaction details.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Finance & Accounts' }, { label: 'Financial Auditing & Audit Logs' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Total Audit Events count, Payment Transactions count, and Concessions & Waivers count.
  - **TanStack Datatable Register:** Filtered datatable (`<DataTable>`), action event badges (`FEE_PAYMENT_RECEIVED` green, `EXPENSE_RECORDED` yellow, `CONCESSION_GRANTED` purple), timestamp display with IP address, transaction detail description, and CSV export.
- **Backend API & Schema:**
  - Endpoints: `GET /api/auditlogs/tenant/{tenantId}`.
  - Table: `FinancialAuditLogs` (`id`, `tenant_id`, `user_name`, `action`, `module`, `details`, `ip_address`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Inspect Cashier Audit Trail for Fee Collection
```json
{
  "Action Event": "FEE_PAYMENT_RECEIVED",
  "User": "Admin User",
  "Expected Details": "Processed payment Rs. 4,500 for Challan # CHLN-2026-1004 (Cash)",
  "Expected Result": "Displays immutable timestamped audit log entry for cashier transaction audit"
}
```

---

## 🚌 PHASE 6: Transport, Hostel, Library & Inventory Management (TURNS 26 - 30)

### Screen 51: School Transport Vehicles & Fleet (`/TransportSetup`)
- **Primary Function:** School transport fleet management desk. Enables transport manager to register buses, vans, and minibuses with seating capacities, driver names, phone numbers, driving license numbers, and operational status.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Fleet, Active Vehicles in Service count, and Total Seating Capacity.
  - **TanStack Datatable Register:** Filtered datatable (`<Input>`), vehicle number font mono, vehicle type badges (`Bus` primary, `Van` success, `Minibus` warning), driver details, and status badges (`Active` / `Inactive`).
  - **Full-Page Form View:** Dedicated full-page form view for vehicle registration featuring grouped cards (`Vehicle Information`, `Driver Information`), vehicle type `<SearchableSelect>`, status `<SearchableSelect>`, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Edit Vehicle`, `Delete`).
  - **Data Export:** CSV and PDF fleet exports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/transportvehicles/tenant/{tenantId}`, `POST /api/transportvehicles`, `PUT /api/transportvehicles/{id}`, `DELETE /api/transportvehicles/{id}`.
  - Table: `transport_vehicles` (`id`, `tenant_id`, `vehicle_number`, `vehicle_type`, `model`, `capacity`, `driver_name`, `driver_phone`, `driver_license_number`, `is_active`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Register New School Transport Bus
```json
{
  "Vehicle Number": "LEA-2026-09",
  "Vehicle Type": "Bus",
  "Model": "Hino Coaster 2025",
  "Capacity": 45,
  "Driver Name": "Muhammad Rashid",
  "Driver Phone": "0300-9876543",
  "License Number": "LHR-99881-2021",
  "Action": "Click '+ Add Vehicle' -> Fill details -> Click 'Register Vehicle'",
  "Expected Result": "Registers LEA-2026-09 in fleet registry and updates total seating capacity KPI"
}
```

---

### Screen 52: Transport Routes & Driver Allocations (`/TransportRoutes`)
- **Primary Function:** Transport route creation and vehicle allocation desk. Allows transport officer to configure routes (`Route Name`, `Start Point`, `End Point`, `Stops`), assign monthly transport fees per route (e.g. Rs. 4,500/month), and allocate specific vehicles to routes.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Routes count and Active Routes count.
  - **TanStack Datatable Register:** Route datatable featuring route name, start/end points, monthly fee in brand blue font (`Rs. 4,500`), assigned vehicle tag, and status badges.
  - **Slide-Over Route Drawer:** Custom React Portals slide-over drawer featuring vehicle selection `<SearchableSelect>`, status `<SearchableSelect>`, inputs, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Edit Route`, `Delete`).
  - **Data Export:** CSV and PDF route reports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/transportroutes/tenant/{tenantId}`, `POST /api/transportroutes`, `PUT /api/transportroutes/{id}`, `DELETE /api/transportroutes/{id}`.
  - Table: `transport_routes` (`id`, `tenant_id`, `route_name`, `start_point`, `end_point`, `stops`, `monthly_fee`, `vehicle_id`, `is_active`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Create Gulberg Express Route
```json
{
  "Route Name": "Gulberg Express - Route # 4",
  "Start Point": "Gulberg Main Market",
  "End Point": "School Main Campus",
  "Stops": "Liberty Roundabout, MM Alam Road, Kalma Chowk",
  "Monthly Fee": 4500,
  "Assigned Vehicle": "LEA-2026-09 (Bus)",
  "Action": "Click '+ Create Route' -> Fill details -> Select Vehicle -> Click 'Save Route'",
  "Expected Result": "Creates Gulberg Express route with Rs. 4,500 fee and binds bus LEA-2026-09"
}
```

---

### Screen 53: Student Transport Allocations (`/StudentTransport`)
- **Primary Function:** Student transport assignment and pickup point mapping desk. Links registered students to configured transport routes, specifies pickup/drop-off stop locations, assigns start dates, and manages active/inactive transport subscriptions.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Transport Assignments count and Active Subscriptions count.
  - **TanStack Datatable Register:** Filtered datatable (`<Input>`), student lookup by full name and admission number, route lookup name display, pickup point description, start/end dates (`<DatePicker>`), and status badges (`Active` green, `Inactive` gray).
  - **Full-Page Assignment Form:** Form view featuring student selection `<SearchableSelect>`, route selection `<SearchableSelect>`, pickup point input, start date `<DatePicker>`, optional end date `<DatePicker>`, status `<SearchableSelect>`, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Edit Assignment`, `Delete`).
  - **Data Export:** CSV and PDF transport subscriber list exports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/studenttransport/tenant/{tenantId}`, `POST /api/studenttransport`, `PUT /api/studenttransport/{id}`, `DELETE /api/studenttransport/{id}`.
  - Table: `student_transport` (`id`, `tenant_id`, `student_id`, `route_id`, `pickup_point`, `start_date`, `end_date`, `status`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Assign Student to Transport Route
```json
{
  "Student": "Ali Hamza (Adm # 1004)",
  "Route": "Gulberg Express - Route # 4",
  "Pickup Point": "Main Gate, Liberty Roundabout",
  "Start Date": "2026-08-01",
  "Status": "Active",
  "Action": "Click '+ Assign Student' -> Select Student & Route -> Input Pickup Point -> Click 'Create Assignment'",
  "Expected Result": "Assigns student Ali Hamza to transport route and updates active subscriptions count"
}
```

---

### Screen 54: Hostel Rooms & Bed Inventory (`/HostelSetup`)
- **Primary Function:** Hostel room setup and bed capacity inventory manager. Enables hostel warden to define hostel rooms, room types (`Single`, `Double`, `Triple`, `Dormitory`), total bed capacities, monthly hostel room fees (e.g. Rs. 15,000/month), and room availability status.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Rooms count, Available Rooms count, and Total Bed Capacity across hostel blocks.
  - **TanStack Datatable Register:** Filtered datatable (`<Input>`), room number in bold font, room type badges (`Single` primary, `Dormitory`), bed capacity, monthly fee in currency format, and status badges (`Available` green, `Unavailable` red).
  - **Full-Page Room Form:** Form view featuring room number input, room type `<SearchableSelect>`, capacity number input, monthly fee input, status checkbox, description input, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Edit`, `Delete`).
  - **Data Export:** CSV and PDF hostel room inventory reports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/HostelRooms/tenant/{tenantId}`, `POST /api/HostelRooms`, `PUT /api/HostelRooms/{id}`, `DELETE /api/HostelRooms/{id}`.
  - Table: `hostel_rooms` (`id`, `tenant_id`, `room_number`, `room_type`, `capacity`, `monthly_fee`, `is_available`, `description`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Add New Double Bed Hostel Room
```json
{
  "Room Number": "Block-A 204",
  "Room Type": "Double",
  "Capacity": 2,
  "Monthly Fee": 15000,
  "Status": "Available",
  "Description": "Air-conditioned double bed room with attached bath",
  "Action": "Click '+ Add Room' -> Fill details -> Click 'Save Room'",
  "Expected Result": "Creates room Block-A 204 with 2 bed capacity and updates available hostel room inventory"
}
```

---

### Screen 55: Student Hostel Bed Allocations (`/HostelAllocations`)
- **Primary Function:** Student hostel room allocation and vacating management desk. Binds resident students to specific hostel rooms, tracks allocation start dates, records vacating dates upon checkout, and tracks active vs. vacated hostel statuses.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Allocations count, Active Resident Students count, and Vacated Rooms count.
  - **TanStack Datatable Register:** Filtered datatable (`<Input>`), student full name lookup, room number lookup, allocation date (`<DatePicker>`), vacating date (`<DatePicker>`), and status badges (`Active` green, `Vacated` dark).
  - **Full-Page Allocation Form:** Form view featuring student selection `<SearchableSelect>`, room selection `<SearchableSelect>`, allocation date `<DatePicker>`, status `<SearchableSelect>`, conditional vacating date `<DatePicker>`, remarks, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Edit`, `Delete`).
  - **Data Export:** CSV and PDF hostel resident list exports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/HostelAllocations/tenant/{tenantId}`, `POST /api/HostelAllocations`, `PUT /api/HostelAllocations/{id}`, `DELETE /api/HostelAllocations/{id}`.
  - Table: `HostelAllocations` (`id`, `tenant_id`, `student_id`, `room_id`, `allocation_date`, `vacating_date`, `status`, `remarks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Allocate Hostel Bed to Resident Student
```json
{
  "Student": "Usman Tariq (Adm # 1008)",
  "Hostel Room": "Block-A 204 (Double)",
  "Allocation Date": "2026-08-01",
  "Status": "Active",
  "Action": "Click '+ Allocate Room' -> Select Student & Room -> Click 'Save Allocation'",
  "Expected Result": "Allocates room Block-A 204 to resident student Usman Tariq and increments active resident KPI"
}
```

---

### Screen 56: Library Book Catalog & Inventory (`/LibraryBooks` / `/BookCatalog`)
- **Primary Function:** School library cataloging and book inventory manager. Allows librarian to index books by Title, Author, ISBN number, Publisher, Category (`Science`, `Mathematics`, `Literature`, `History`, `Computer`), shelf rack location (e.g. `A1-Rack2`), total copy quantities, and available copies.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Titles count, Total Copies count across library, and Available Copies count.
  - **TanStack Datatable Register:** Filtered datatable (`<Input>`), title & ISBN font-mono subtitle, author name, category badges (`Science` primary), availability ratio text (`4 / 5`), and action column.
  - **Full-Page Book Form:** Form view featuring title input, author input, category `<SearchableSelect>`, ISBN input, total copies number input, shelf location input, publisher input, price input, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Edit`, `Delete`).
  - **Data Export:** CSV and PDF book catalog exports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/LibraryBooks/tenant/{tenantId}`, `POST /api/LibraryBooks`, `PUT /api/LibraryBooks/{id}`, `DELETE /api/LibraryBooks/{id}`.
  - Table: `library_books` (`id`, `tenant_id`, `title`, `author`, `isbn`, `publisher`, `publication_year`, `category`, `shelf_location`, `total_copies`, `available_copies`, `price`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Index New Physics Textbook in Library
```json
{
  "Title": "Advanced Physics for High School Vol 1",
  "Author": "Dr. H. C. Verma",
  "Category": "Science",
  "ISBN": "978-0-123456-78-9",
  "Total Copies": 10,
  "Shelf Location": "B-Rack4",
  "Action": "Click '+ Add Book' -> Fill details -> Click 'Save Book'",
  "Expected Result": "Indexes 10 copies of Physics textbook in catalog with shelf location B-Rack4"
}
```

---

### Screen 57: Book Issuance & Return Circulation Desk (`/IssueBooks`)
- **Primary Function:** Library book checkout and return circulation desk. Tracks book loans to students and staff members, manages return due dates, records book check-ins, and calculates fine amounts for late returns.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Transactions count, Currently Issued books count, and Overdue Returns count.
  - **TanStack Datatable Register:** Filtered datatable (`<Input>`), book title lookup, borrower name & type display (`Student` / `Staff`), issue date (`<DatePicker>`), due date (`<DatePicker>`), status badges (`Issued` primary, `Returned` success, `Overdue` red error row), and pagination.
  - **Book Checkout Form View:** Form view featuring book selection `<SearchableSelect>`, borrower type `<SearchableSelect>`, student/staff selection `<SearchableSelect>`, issue date `<DatePicker>`, due date `<DatePicker>`, and `<Label required>`.
  - **Book Return View:** Dedicated return view calculating fine amounts, return dates, and remarks.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Return Book`, `Delete`).
  - **Data Export:** CSV and PDF circulation exports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/BookIssuances/tenant/{tenantId}`, `POST /api/BookIssuances`, `PUT /api/BookIssuances/{id}/return`, `DELETE /api/BookIssuances/{id}`.
  - Table: `library_issues` (`id`, `tenant_id`, `book_id`, `user_id`, `issue_date`, `due_date`, `return_date`, `fine_amount`, `status`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Issue Book to Student
```json
{
  "Book": "Advanced Physics for High School Vol 1",
  "Borrower Type": "Student",
  "Student": "Ali Hamza (Adm # 1004)",
  "Issue Date": "2026-08-01",
  "Due Date": "2026-08-15",
  "Action": "Click '+ Issue Book' -> Select Book & Student -> Set Due Date -> Click 'Issue Book'",
  "Expected Result": "Issues book to Ali Hamza and decrements available book copy count by 1"
}
```

---

### Screen 58: Overdue Library Fines & Fines Collector (`/LibraryFines`)
- **Primary Function:** Overdue library fines tracking and counter fine recovery desk. Automatically calculates accrued penalties for overdue books (Rs. 20/day overdue), tracks total outstanding library fines, and collects payments via Counter Cash, Student RFID Wallet deduction, or JazzCash.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Library' }, { label: 'Overdue Fines & Recovery' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Overdue Books count, Total Accrued Fines amount (Rs.), and Daily Fine Rate (Rs. 20/Day).
  - **TanStack Datatable Register:** Filtered datatable (`<Input>`), book title, borrower name, due date, days overdue badge (`14 Days Overdue` red), accrued fine amount (`Rs. 280`), and action menu.
  - **Fine Collection Slide-Over Drawer:** Drawer featuring book title readout, borrower readout, editable fine amount input, payment method `<SearchableSelect>` (`Counter Cash`, `Student RFID Wallet`, `JazzCash`, `Fine Waived`), and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Collect Fine & Return`).
  - **Data Export:** CSV and PDF overdue fine list exports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/BookIssuances/tenant/{tenantId}`, `PUT /api/BookIssuances/{id}/return`.
  - Table: `library_issues` (`id`, `tenant_id`, `book_id`, `user_id`, `due_date`, `return_date`, `fine_amount`, `status`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Collect Fine for 14-Day Overdue Book
```json
{
  "Book": "Advanced Physics for High School Vol 1",
  "Borrower": "Ali Hamza (Adm # 1004)",
  "Days Overdue": 14,
  "Accrued Fine": 280,
  "Payment Method": "Counter Cash Collection",
  "Action": "Click 'Collect Fine & Return' -> Select Cash -> Click 'Confirm Collection & Return'",
  "Expected Result": "Collects Rs. 280 fine, records return, and restores book copy to available inventory"
}
```

---

### Screen 59: Campus Stock Catalog & Assets Inventory (`/StockCatalog`)
- **Primary Function:** Campus inventory cataloging and asset management desk. Allows store manager to register consumable supplies (`Stationery`, `Cleaning`) and fixed assets (`Furniture`, `Electronics`, `Sports`, `Lab Equipment`), specify unit prices, set reorder threshold alerts, and track physical storage locations.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Item Types count, Total Stock Asset Value ($), and Low Stock Alerts count.
  - **TanStack Datatable Register:** Filtered datatable (`<Input>`), item name & description, category badges (`Stationery` primary, `Furniture` success), quantity badge with low stock red alert highlight (`12 Pcs LOW`), unit price, storage location, and pagination.
  - **Full-Page Item Form:** Form view featuring item name input, category `<SearchableSelect>`, initial quantity input, unit `<SearchableSelect>`, unit price input, reorder level input, supplier input, storage location input, description, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Edit`, `Delete`).
  - **Data Export:** CSV and PDF inventory catalog exports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/InventoryItems/tenant/{tenantId}`, `POST /api/InventoryItems`, `PUT /api/InventoryItems/{id}`, `DELETE /api/InventoryItems/{id}`.
  - Table: `inventory_items` (`id`, `tenant_id`, `item_name`, `category`, `description`, `quantity`, `reorder_level`, `unit`, `unit_price`, `supplier_name`, `location`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Register A4 Paper Reams in Stock Catalog
```json
{
  "Item Name": "A4 Paper Reams (80 GSM)",
  "Category": "Stationery",
  "Initial Quantity": 100,
  "Unit": "Box",
  "Unit Price": 1250,
  "Reorder Level": 15,
  "Supplier": "Lahore Paper Mart",
  "Location": "Main Store Room - Rack 3",
  "Action": "Click '+ Add Item' -> Fill details -> Click 'Save Item'",
  "Expected Result": "Registers 100 boxes of A4 paper reams in stock catalog with Rs. 1,250 unit price"
}
```

---

### Screen 60: Stock Issue Ledger & Operational Expenditure Logs (`/StockLedger`)
- **Primary Function:** Inventory transaction journal and stock issuance ledger. Logs stock receipts (`Purchase`), department checkouts (`Issue`), store returns (`Return`), and stock audit adjustments (`Adjustment`), updating physical stock counts automatically.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Transactions count, Stock Purchases count, and Stock Issues count.
  - **TanStack Datatable Register:** Filtered datatable (`<Input>`), transaction date (`<DatePicker>`), item name lookup, transaction type badges (`Purchase` green, `Issue` yellow, `Return` primary), quantity, recipient / reference number, and action menu.
  - **Full-Page Transaction Form:** Form view featuring item selection `<SearchableSelect>`, transaction type `<SearchableSelect>`, quantity number input, transaction date `<DatePicker>`, recipient text input, reference PO number, and `<Label required>`.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Delete`).
  - **Data Export:** CSV and PDF stock movement ledger exports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/InventoryTransactions/tenant/{tenantId}`, `POST /api/InventoryTransactions`, `DELETE /api/InventoryTransactions/{id}`.
  - Table: `inventory_transactions` (`id`, `tenant_id`, `item_id`, `transaction_type`, `quantity`, `issued_to`, `purpose`, `reference_number`, `transaction_date`, `remarks`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Issue 5 Boxes of A4 Paper to Science Department
```json
{
  "Item": "A4 Paper Reams (80 GSM)",
  "Transaction Type": "Issue",
  "Quantity": 5,
  "Transaction Date": "2026-08-01",
  "Issued To": "Science Department - Lab 2",
  "Ref Number": "REQ-2026-88",
  "Action": "Click '+ New Transaction' -> Select Item & Issue -> Input Quantity 5 -> Click 'Save Transaction'",
  "Expected Result": "Logs stock issue of 5 boxes to Science Dept and decrements catalog stock to 95 boxes"
}
```

---

## 🚀 PHASE 7: PARENT PORTAL, ATTENDANCE, REPORTS & SYSTEM ADMINISTRATION (Screens 61 - 70)

---

### Screen 61: Parent Portal Executive Dashboard (`/parent-dashboard`)
- **Primary Function:** Parent portal dashboard for multi-child monitoring. Allows parents to switch between enrolled children, view attendance percentage, review pending fee challans, view recent homework, inspect exam results, download PDF term report cards, print fee challans, and complete online fee checkout via payment gateway.
- **Agent 1 & UI Pattern Compliance:**
  - **Child Selector Bar:** Multi-child avatar cards with class & section details and active selection highlighting.
  - **KPI Summary Cards:** Attendance percentage (`92%`), Total Pending Fees (`Rs. 15,000`), Recent Exams count, and Homeworks count.
  - **Interactive FullCalendar Attendance Widget:** Month-view calendar displaying daily attendance events (`Present` green, `Absent` red, `Late` yellow).
  - **Pending Fee Challans Datatable:** Table with 3-part bank/school/parent PDF challan generator, late fee surcharge calculator (Rs. 500), checkable bulk payment selector, and 1-click Pay Now checkout modal.
  - **PDF Term Report Card Generator:** Auto-generates official PDF report cards complete with student info box, subject breakdown table, percentage calculation, grade assignment, and teacher/principal signature lines.
- **Backend API & Schema:**
  - Endpoints: `GET /api/parent/kids`, `GET /api/parent/dashboard-summary/{studentId}`, `GET /api/parent/attendance/{studentId}`.
  - Tables: `students`, `fee_challans`, `student_attendances`, `exam_marks`, `homeworks`.
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Download PDF Term Report Card for Enrolled Child
```json
{
  "Child": "Ali Hamza (Class 5 - A)",
  "Attendance": "94%",
  "Action": "Select Child 'Ali Hamza' -> Scroll to Exam Results -> Click 'Download Report Card'",
  "Expected Result": "Generates and downloads official PDF report card with subject breakdown and principal signature line"
}
```

---

### Screen 62: Parent Student Attendance & Monthly Leave Request (`/ApplyLeave`)
- **Primary Function:** Parent online student leave application submission desk. Enables parents to submit leave applications for their children specifying Leave Type (`Sick`, `Casual`, `Urgent Work`), Start/End dates (`<DatePicker>`), medical certificate attachments (`<ImageUpload>`), and detailed reasons.
- **Agent 1 & UI Pattern Compliance:**
  - **Form Layout:** Centered card layout with header icon and clean form grouping.
  - **Agent 1 Components:** Leave type selection `<SearchableSelect>`, medical certificate attachment `<ImageUpload>`, start/end dates `<DatePicker>`, reason textarea, and `<Label required>`.
  - **Action Button:** Submits application via `<Button variant="primary">` with loading spinner indicator.
  - **Notifications:** Success toast alerts upon submission.
- **Backend API & Schema:**
  - Endpoints: `POST /api/leaveapplications`, `GET /api/leaveapplications/student/{studentId}`.
  - Table: `leave_applications` (`id`, `tenant_id`, `student_id`, `leave_type`, `start_date`, `end_date`, `reason`, `attachment_url`, `status`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Submit Sick Leave Application for Student
```json
{
  "Student": "Ali Hamza",
  "Leave Type": "Sick Leave",
  "Start Date": "2026-08-05",
  "End Date": "2026-08-07",
  "Reason": "Severe fever and doctor advised 3 days rest",
  "Attachment": "Medical_Certificate.jpg",
  "Action": "Select Sick Leave -> Pick Dates -> Upload Certificate -> Click 'Submit Application'",
  "Expected Result": "Submits leave request for admin approval and notifies class teacher"
}
```

---

### Screen 63: Parent Fee Online Payment & Transaction History (`/FeePaymentHistory`)
- **Primary Function:** Parent online fee checkout and paid receipt ledger desk. Enables parents to clear pending fee challans online, review paid payment history, download official computer-generated PDF receipts, and export CSV payment logs.
- **Agent 1 & UI Pattern Compliance:**
  - **Breadcrumbs:** Navigation path `<Breadcrumb items={[{ label: 'Parent Portal' }, { label: 'Online Fee Payment & Receipts' }]} />`.
  - **KPI Summary Cards:** `<StatCards>` displaying Total Fees Paid YTD (Rs.), Pending Dues Balance (Rs.), and Total Payment Receipts count.
  - **TanStack Datatable Register:** Filtered datatable (`<Input>`), challan number font-mono bold, student name, amount paid in emerald font, payment date, method badge (`Online Banking` green), and action menu.
  - **Online Payment Checkout Modal:** `<PaymentCheckoutModal>` with card/bank payment options, late fee surcharge calculator (Rs. 500), and receipt upload.
  - **Row Action Menu:** React Portals `<ActionMenu>` for actions (`Download PDF Receipt`).
  - **Data Export:** CSV and PDF fee transaction list exports.
- **Backend API & Schema:**
  - Endpoints: `GET /api/feechallans/tenant/{tenantId}`, `POST /api/payments/checkout`.
  - Table: `fee_challans` (`id`, `tenant_id`, `student_id`, `challan_number`, `net_payable`, `due_date`, `paid_date`, `payment_method`, `status`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Download PDF Receipt for Paid Fee Challan
```json
{
  "Challan #": "CH-2026-104",
  "Student": "Ali Hamza",
  "Amount Paid": 15000,
  "Method": "Online Banking",
  "Action": "Click 'Download PDF Receipt' action menu item",
  "Expected Result": "Generates and downloads official green-themed PAID receipt PDF with computer verification note"
}
```

---

### Screen 64: Student Portal Executive Dashboard (`/student-dashboard`)
- **Primary Function:** Student self-service learning and academic portal. Enables enrolled students to track personal attendance percentage, review assigned homework deadlines, inspect exam performance marks & grades, view class timetable events, and download PDF term report cards.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** Personal Attendance percentage (`94%`), Pending Dues balance, Recent Exams count, and Assigned Homeworks count.
  - **Interactive FullCalendar Attendance Widget:** Month-view calendar displaying daily attendance events (`Present` green, `Absent` red, `Late` yellow).
  - **Recent Homework Register:** Interactive list of assigned homeworks with subject tags, due date badges, and submission status (`Submitted` green, `Pending` orange).
  - **PDF Term Report Card Generator:** 1-Click **"Report Card"** generator creating official student report card PDF with subject breakdown, percentage, grade, and principal signature lines.
- **Backend API & Schema:**
  - Endpoints: `GET /api/student-portal/my-dashboard`, `GET /api/student-portal/my-attendance`.
  - Tables: `students`, `student_enrollments`, `student_attendances`, `exam_marks`, `homeworks`.
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Inspect Personal Attendance Calendar
```json
{
  "Student": "Ali Hamza",
  "Month": "August 2026",
  "Action": "Log in as Student -> View FullCalendar Attendance Widget -> Click Month Navigation",
  "Expected Result": "Renders color-coded daily attendance badges (Present green, Absent red, Late yellow) for August 2026"
}
```

---

### Screen 65: Student Online Homework Submission Portal (`/StudentHomeworkPortal`)
- **Primary Function:** Student online assignment view and submission desk. Enables students to review assigned homework details, attach submission files (`PDF`, `DOCX`, `ZIP`), write student notes using rich text editor, and track grading scores & teacher feedback remarks.
- **Agent 1 & UI Pattern Compliance:**
  - **Assignment Cards Grid:** Color-coded status side border (`Graded` green, `Submitted` blue, `Pending` yellow, `Overdue` red).
  - **Status & Subject Badges:** Subject category tag, due date countdown indicator, and score display badge (`Score: 18 / 20`).
  - **Submission Drawer Modal:** File upload input `<Input type="file">`, student notes rich text editor, and primary submission button `<Button variant="primary">`.
- **Backend API & Schema:**
  - Endpoints: `GET /api/homeworks/tenant/{tenantId}`, `GET /api/homeworksubmissions/tenant/{tenantId}/student/{studentId}`, `POST /api/homeworksubmissions/submit`.
  - Tables: `homeworks`, `homework_submissions` (`id`, `tenant_id`, `homework_id`, `student_id`, `student_notes`, `attachment_urls`, `obtained_marks`, `teacher_remarks`, `status`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Submit Science Lab Assignment Online
```json
{
  "Homework Title": "Physics Optics Experiment Report",
  "Subject": "Physics",
  "Student": "Ali Hamza",
  "Attachment": "Optics_Experiment_LabReport.pdf",
  "Notes": "Completed all 5 refraction trials and attached raw calculation table.",
  "Action": "Click 'Submit Work' -> Upload PDF -> Add Notes -> Click 'Submit Homework'",
  "Expected Result": "Submits assignment, updates status badge to 'Submitted' blue, and notifies subject teacher"
}
```

---

### Screen 66: Student Live Online Classes & Virtual Classroom (`/LiveClassesManager`)
- **Primary Function:** Virtual classroom scheduling and live online video session launcher desk. Enables teachers and admins to schedule live video sessions via Zoom, Google Meet, or Microsoft Teams, and allows students to join active live streams with 1-click launch buttons.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Live Sessions, Live Now 🔴 (pulsing red theme), Upcoming Scheduled, and Completed Sessions.
  - **Agent 1 Form Drawer:** `<ProfileDrawer>` with topic input, platform selection `<SearchableSelect>`, start date/time `<DatePicker>`, duration minutes input, and meeting link URL input.
  - **Interactive Datatable:** Platform badges (Zoom 💻, Google Meet 🟢, Teams 🟣), topic details, teacher host name, and 1-Click **"Join Live Class"** button launching meeting URL in new browser tab.
  - **Action Menu:** React Portals `<ActionMenu>` for actions (`Join Session`, `Edit Class`, `Cancel Session`).
- **Backend API & Schema:**
  - Endpoints: `GET /api/liveclasses/tenant/{tenantId}`, `POST /api/liveclasses`, `DELETE /api/liveclasses/{id}`.
  - Table: `live_classes` (`id`, `tenant_id`, `class_id`, `subject_id`, `teacher_id`, `topic`, `platform`, `meeting_link`, `start_time`, `duration_minutes`, `status`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Join Scheduled Zoom Physics Live Class
```json
{
  "Topic": "Quantum Mechanics & Wave Function",
  "Platform": "Zoom",
  "Class": "Class 10 - A",
  "Host": "Dr. Arshad Mahmood",
  "Status": "Live 🔴",
  "Action": "Click 'Join Live Class' button on active session row",
  "Expected Result": "Opens Zoom meeting link in new browser window and logs student participation event"
}
```

---

### Screen 67: Online Computer-Based Testing (CBT) Exam Desk (`/StudentCBT`)
- **Primary Function:** Student interactive online examination desk. Enables students to start assigned CBT exams, view real-time countdown timer, navigate question palette, select multiple-choice option answers, and auto-submit test attempts upon completion or timeout.
- **Agent 1 & UI Pattern Compliance:**
  - **Exam Selection Register:** Cards listing active CBT tests, subject name, total questions count, total marks, and duration minutes.
  - **Real-Time Countdown Header:** Fixed header bar featuring remaining test time countdown (`00:45:00`) with low-time warning indicator (`< 5 Mins` red pulse).
  - **Question Palette & Answer Selection:** Multiple-choice option radio buttons (`A`, `B`, `C`, `D`), marks display badge, question index selector, and finish exam button.
- **Backend API & Schema:**
  - Endpoints: `GET /api/onlineexams/tenant/{tenantId}`, `POST /api/studentexamattempts/start`, `GET /api/onlineexams/{id}/questions`, `POST /api/studentexamattempts/submit`.
  - Tables: `online_exams`, `question_banks`, `student_exam_attempts` (`id`, `tenant_id`, `online_exam_id`, `student_id`, `start_time`, `end_time`, `responses_json`, `score`, `status`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Attempt Computer Science Multiple-Choice CBT Exam
```json
{
  "Exam Title": "CS Midterm CBT Exam",
  "Subject": "Computer Science",
  "Duration": "45 Mins",
  "Questions": 20,
  "Action": "Click 'Start Now' -> Select Option B for Q1 -> Click Next -> Finish Test",
  "Expected Result": "Records responses JSON, calculates score instantly, updates status to 'Completed', and locks re-attempts"
}
```

---

### Screen 68: Student Attendance & Leave Application Desk (`/StudentLeaveApplication`)
- **Primary Function:** Student leave application desk and history tracker. Enables students to submit digital leave requests, specify start/end dates (`<DatePicker>`), upload supporting documents (`<ImageUpload>`), and monitor approval status (`Approved` green, `Pending` yellow, `Rejected` red).
- **Agent 1 & UI Pattern Compliance:**
  - **Leave Application Modal:** `<Modal>` with leave type `<SearchableSelect>`, start/end dates `<DatePicker>`, reason textarea, and attachment uploader.
  - **Status Badges:** Color-coded status badges (`Approved` green with Check icon, `Pending` yellow with Clock icon, `Rejected` red with X icon).
  - **Table Layout:** Datatable displaying leave type, applied date, date range, reason summary, attachment link, and approver notes.
- **Backend API & Schema:**
  - Endpoints: `GET /api/leaveapplications/tenant/{tenantId}/student/{studentId}`, `POST /api/leaveapplications`.
  - Table: `leave_applications` (`id`, `tenant_id`, `student_id`, `leave_type`, `start_date`, `end_date`, `reason`, `attachment_url`, `status`, `approver_notes`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Apply for Casual Family Function Leave
```json
{
  "Student": "Ali Hamza",
  "Leave Type": "Casual Leave",
  "Start Date": "2026-08-10",
  "End Date": "2026-08-11",
  "Reason": "Attending elder brother's wedding ceremony in Lahore.",
  "Action": "Click 'Apply Student Leave' -> Select Casual Leave -> Pick Dates -> Submit",
  "Expected Result": "Submits application to class teacher, displays status 'Pending' yellow, and notifies school admin"
}
```

---

### Screen 69: System Audit Logs & Real-Time Security Trail (`/SystemAudits`)
- **Primary Function:** System-wide audit log monitor and security compliance tracker. Tracks all database CRUD mutations (`Added` green, `Modified` blue, `Deleted` red), IP addresses, timestamp, user IDs, table names, and JSON diffs of old/new values.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Total Logs, Inserts count, Updates count, and Deletions count.
  - **Audit Trail Datatable:** TanStack Table displaying timestamp, action badge, target table name, monospace record ID, IP address, and collapsible JSON preformatted old/new value diffs.
- **Backend API & Schema:**
  - Endpoint: `GET /api/AuditLogs/tenant/{tenantId}`.
  - Table: `audit_logs` (`id`, `tenant_id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `created_at`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Track Student Fee Payment Mutation Event
```json
{
  "Target Table": "fee_challans",
  "Action": "Modified",
  "Record ID": "FC-99081",
  "IP Address": "192.168.1.45",
  "New Values": "{\"status\": \"Paid\", \"paid_amount\": 15000}",
  "Action": "Open System Audit Logs -> Search 'FC-99081'",
  "Expected Result": "Renders audit log entry with modified action badge, IP address, and JSON diff snippet"
}
```

---

### Screen 70: System Security Settings & 2FA Authenticator (`/SecuritySettings`)
- **Primary Function:** Account security and Two-Factor Authentication (2FA) setup desk. Enables admins, staff, teachers, and parents to configure 2FA TOTP authenticators (Google Authenticator, Authy), scan QR codes, and verify 6-digit OTP codes.
- **Agent 1 & UI Pattern Compliance:**
  - **2FA Setup Wizard:** Centered card wizard with QR code renderer (`<QRCode>`), manual secret key copy box, and 6-digit OTP verification input.
  - **Action Buttons:** Setup 2FA button, Verify & Enable button, and Cancel button.
- **Backend API & Schema:**
  - Endpoints: `POST /api/users/generate-2fa`, `POST /api/users/enable-2fa`.
  - Table: `users` (`two_factor_enabled`, `two_factor_secret`).
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Enable Google Authenticator 2FA for User Account
```json
{
  "User": "System Administrator",
  "OTP Code": "847291",
  "Action": "Click 'Setup 2FA' -> Scan QR Code -> Input 6-Digit OTP '847291' -> Click 'Verify & Enable'",
  "Expected Result": "Verifies TOTP algorithm, enables 2FA on user account, and requires OTP on future logins"
}
```

---

### Screen 71: Master School Reports & Analytics Hub (`/ReportsCenter`)
- **Primary Function:** Comprehensive school reporting engine providing printable broadsheets, 3-part A4 fee payment vouchers (`Bank Copy`, `School Copy`, `Parent Copy`), official School Leaving Certificates (SLC), monthly attendance summaries, staff payroll digests, and bulk student ID cards.
- **Agent 1 & UI Pattern Compliance:**
  - **KPI Summary Cards:** `<StatCards>` displaying Compiled Reports count, Broadsheet Accuracy %, Print Resolution, and Export Capabilities.
  - **Interactive Report Tabs:** Broadsheet Result Sheet, 3-Copy Fee Voucher, School Leaving Certificate, Attendance Summary, Staff Payroll, and Bulk ID Cards Grid.
  - **Print CSS Integration:** Custom `@media print` styling for pixel-perfect A4 printing.
- **Backend API & Schema:**
  - Endpoints: `GET /api/academicYears/tenant/{tenantId}`, `GET /api/classes/tenant/${tenantId}`, `GET /api/students/tenant/${tenantId}`.
- **🧪 Multi-Scenario Test Datasets:**

#### Test Case 1: Compile Class 10th Result Broadsheet Matrix
```json
{
  "Class": "Class 10th",
  "Section": "Section A",
  "Action": "Select Class 10th -> Click 'Compile Broadsheet'",
  "Expected Result": "Renders broadsheet matrix table with student marks in Math, English, Science, Urdu, total obtained, percentage, grade, and 1st/2nd/3rd rank badges with print preview"
}
```

---
🎉 **CONGRATULATIONS! MASTER REPORTS CENTER MODULE IS NOW 100% COMPLETE & VERIFIED!** 🎉
