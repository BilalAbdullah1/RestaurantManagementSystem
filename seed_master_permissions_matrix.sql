-- ====================================================================
-- MASTER ENTERPRISE PERMISSIONS MATRIX & RBAC SEED SCRIPT
-- Seeds all 38 System Permissions and configures Default Role Access
-- Run this in PgAdmin / DBeaver to initialize complete RBAC security
-- ====================================================================

-- 1. Ensure Table Structure Exists
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    module_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 2. Insert Master Catalog of 38 System Directives / Permissions
INSERT INTO permissions (id, name, description, module_name)
SELECT 
    gen_random_uuid(),
    p.name,
    p.description,
    p.module_name
FROM (
    VALUES
        -- 1. Students & SIS Module
        ('View Student Directory', 'students.view', 'Students & Admissions'),
        ('Register New Student', 'students.create', 'Students & Admissions'),
        ('Edit Student Profile', 'students.edit', 'Students & Admissions'),
        ('Delete Student Record', 'students.delete', 'Students & Admissions'),
        ('Export Student Data', 'students.export', 'Students & Admissions'),
        ('Mark Student Daily Attendance', 'attendance.mark', 'Students & Admissions'),
        ('View Attendance Reports & Heatmap', 'attendance.view', 'Students & Admissions'),
        ('Process Student Promotions & Transfers', 'students.promotions', 'Students & Admissions'),
        ('Manage Student Behavior Logs', 'students.behavior', 'Students & Admissions'),
        ('Manage Admissions Desk & CRM', 'admissions.manage', 'Students & Admissions'),

        -- 2. Academic & Timetable
        ('View Classes, Sections & Subjects', 'academic.view', 'Academic & Timetable'),
        ('Manage Classes & Sections', 'classes.manage', 'Academic & Timetable'),
        ('Manage Subjects Curriculum', 'subjects.manage', 'Academic & Timetable'),
        ('Manage Master Class & Teacher Timetables', 'timetable.manage', 'Academic & Timetable'),
        ('Manage Lesson Plans & Syllabus', 'lessonplans.manage', 'Academic & Timetable'),
        ('Upload Study Materials & E-Books', 'studymaterials.manage', 'Academic & Timetable'),

        -- 3. Examinations & Grading
        ('View Examination Schedules', 'exams.view', 'Examinations & Grading'),
        ('Create Exam Paper Setup & Datesheets', 'exams.manage', 'Examinations & Grading'),
        ('Enter Student Subject Marks', 'marks.entry', 'Examinations & Grading'),
        ('Lock & Finalize Examination Marks', 'marks.lock', 'Examinations & Grading'),
        ('Configure Grading Scales & GPA', 'gradingscales.manage', 'Examinations & Grading'),
        ('Generate Report Cards & Transcripts', 'reportcards.generate', 'Examinations & Grading'),

        -- 4. Finance, Fees & Accounts
        ('View Fee Structures & Concessions', 'fees.view', 'Finance & Accounts'),
        ('Collect Student Fee Payments', 'fees.collect', 'Finance & Accounts'),
        ('Generate Fee Challans & 3-Copy Vouchers', 'fees.vouchers', 'Finance & Accounts'),
        ('Manage Chart of Accounts & General Ledger', 'accounts.manage', 'Finance & Accounts'),
        ('View Financial Statements & P&L Reports', 'finance.reports', 'Finance & Accounts'),
        ('Manage School Expenses & Vouchers', 'expenses.manage', 'Finance & Accounts'),

        -- 5. HR & Staff Payroll
        ('View Staff & Teacher Directory', 'staff.view', 'HR & Payroll'),
        ('Manage Staff Profiles & Contracts', 'staff.manage', 'HR & Payroll'),
        ('Process Staff Monthly Payroll & Slips', 'payroll.manage', 'HR & Payroll'),
        ('Approve Staff Leave Applications', 'leaves.manage', 'HR & Payroll'),
        ('Manage Staff Advances & Loans', 'loans.manage', 'HR & Payroll'),

        -- 6. Transport, Hostel & Library
        ('Manage Transport Routes & Vehicles', 'transport.manage', 'Facilities & Transport'),
        ('Manage Hostel Dormitories & Allocations', 'hostel.manage', 'Facilities & Transport'),
        ('Manage Library Catalog & Book Loans', 'library.manage', 'Facilities & Transport'),

        -- 7. Communication & System Settings
        ('View & Post School Notices', 'notices.manage', 'Communication & Helpdesk'),
        ('Broadcast SMS & Push Alerts', 'alerts.broadcast', 'Communication & Helpdesk'),
        ('Manage Helpdesk & Parent Inquiries', 'helpdesk.manage', 'Communication & Helpdesk'),
        ('Configure School Identity & Settings', 'settings.manage', 'System Administration'),
        ('Manage User Accounts & Passwords', 'users.manage', 'System Administration'),
        ('Configure Roles & Permissions Matrix', 'roles.manage', 'System Administration'),
        ('View Security Audit Trail Logs', 'audit.view', 'System Administration')
) AS p(name, description, module_name)
WHERE NOT EXISTS (
    SELECT 1 FROM permissions WHERE permissions.description = p.description
);

-- 3. Grant SuperAdmin Roles Full Access to all Directives
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE LOWER(r.name) IN ('admin', 'principal')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 4. Grant Teacher Roles Academic, Attendance, and Marks Entry Access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE LOWER(r.name) = 'teacher'
  AND (
      p.module_name IN ('Academic & Timetable', 'Examinations & Grading')
      OR p.description IN ('students.view', 'attendance.mark', 'attendance.view', 'notices.manage')
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 5. Grant Staff Roles General Operations Access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE LOWER(r.name) = 'staff'
  AND p.description IN ('students.view', 'attendance.view', 'staff.view', 'notices.manage', 'helpdesk.manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;
