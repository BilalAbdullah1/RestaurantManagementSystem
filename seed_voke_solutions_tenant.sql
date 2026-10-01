-- ==============================================================================
-- MASTER SEED SCRIPT: VOKE SOLUTIONS TENANT, ROLES, RBAC, COA & ADMIN
-- Database: PostgreSQL (SMS Multi-Tenant Core)
-- ==============================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_admin_role_id UUID;
    v_teacher_role_id UUID;
    v_student_role_id UUID;
    v_parent_role_id UUID;
    v_staff_role_id UUID;
    v_admin_user_id UUID;
    v_password_hash VARCHAR := '2YQ9y6E+qF0f1CgNqf9h5g==.pYV7+P/x1Y9xX8bS5g8xX9y6E+qF0f1CgNqf9h5g2YQ='; -- Admin@123 standard pbkdf2 hash
BEGIN
    -- 1. Check or Insert 'Voke Solutions' Tenant
    SELECT id INTO v_tenant_id FROM public.tenants WHERE school_code = 'VOKE' OR school_name = 'Voke Solutions' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        v_tenant_id := gen_random_uuid();
        INSERT INTO public.tenants (
            id, school_name, school_code, subdomain, phone, email, address,
            principal_name, registration_no, website, currency, fiscal_year_start,
            primary_color, is_active, created_at
        ) VALUES (
            v_tenant_id,
            'Voke Solutions',
            'VOKE',
            'voke',
            '+92 300 0000000',
            'admin@vokesolutions.com',
            'Voke Solutions Innovation Campus, Main Boulevard',
            'System Administrator',
            'REG-VOKE-2026',
            'https://vokesolutions.com',
            'PKR',
            '04-01',
            '#2563eb',
            true,
            NOW()
        );
        RAISE NOTICE 'Inserted Tenant: Voke Solutions (ID: %)', v_tenant_id;
    ELSE
        RAISE NOTICE 'Found Existing Tenant: Voke Solutions (ID: %)', v_tenant_id;
    END IF;

    -- 2. Insert Standard Roles for Voke Solutions if missing
    -- Admin Role
    SELECT id INTO v_admin_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Admin' LIMIT 1;
    IF v_admin_role_id IS NULL THEN
        v_admin_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_admin_role_id, v_tenant_id, 'Admin', 'System generated Admin role', true, NOW());
    END IF;

    -- Teacher Role
    SELECT id INTO v_teacher_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Teacher' LIMIT 1;
    IF v_teacher_role_id IS NULL THEN
        v_teacher_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_teacher_role_id, v_tenant_id, 'Teacher', 'System generated Teacher role', true, NOW());
    END IF;

    -- Student Role
    SELECT id INTO v_student_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Student' LIMIT 1;
    IF v_student_role_id IS NULL THEN
        v_student_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_student_role_id, v_tenant_id, 'Student', 'System generated Student role', true, NOW());
    END IF;

    -- Parent Role
    SELECT id INTO v_parent_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Parent' LIMIT 1;
    IF v_parent_role_id IS NULL THEN
        v_parent_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_parent_role_id, v_tenant_id, 'Parent', 'System generated Parent role', true, NOW());
    END IF;

    -- Staff Role
    SELECT id INTO v_staff_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Staff' LIMIT 1;
    IF v_staff_role_id IS NULL THEN
        v_staff_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_staff_role_id, v_tenant_id, 'Staff', 'System generated Staff role', true, NOW());
    END IF;

    -- 3. Insert Master Permissions Catalog (if missing)
    INSERT INTO public.permissions (id, name, description, module_name) VALUES
    (gen_random_uuid(), 'View Student Directory', 'students.view', 'Students & Admissions'),
    (gen_random_uuid(), 'Register New Student', 'students.create', 'Students & Admissions'),
    (gen_random_uuid(), 'Edit Student Profile', 'students.edit', 'Students & Admissions'),
    (gen_random_uuid(), 'Delete Student Record', 'students.delete', 'Students & Admissions'),
    (gen_random_uuid(), 'Export Student Data', 'students.export', 'Students & Admissions'),
    (gen_random_uuid(), 'Mark Student Daily Attendance', 'attendance.mark', 'Students & Admissions'),
    (gen_random_uuid(), 'View Attendance Reports & Heatmap', 'attendance.view', 'Students & Admissions'),
    (gen_random_uuid(), 'Process Student Promotions & Transfers', 'students.promotions', 'Students & Admissions'),
    (gen_random_uuid(), 'Manage Student Behavior Logs', 'students.behavior', 'Students & Admissions'),
    (gen_random_uuid(), 'Manage Admissions Desk & CRM', 'admissions.manage', 'Students & Admissions'),
    (gen_random_uuid(), 'View Classes, Sections & Subjects', 'academic.view', 'Academic & Timetable'),
    (gen_random_uuid(), 'Manage Classes & Sections', 'classes.manage', 'Academic & Timetable'),
    (gen_random_uuid(), 'Manage Subjects Curriculum', 'subjects.manage', 'Academic & Timetable'),
    (gen_random_uuid(), 'Manage Master Class & Teacher Timetables', 'timetable.manage', 'Academic & Timetable'),
    (gen_random_uuid(), 'Manage Lesson Plans & Syllabus', 'lessonplans.manage', 'Academic & Timetable'),
    (gen_random_uuid(), 'Upload Study Materials & E-Books', 'studymaterials.manage', 'Academic & Timetable'),
    (gen_random_uuid(), 'View Examination Schedules', 'exams.view', 'Examinations & Grading'),
    (gen_random_uuid(), 'Create Exam Paper Setup & Datesheets', 'exams.manage', 'Examinations & Grading'),
    (gen_random_uuid(), 'Enter Student Subject Marks', 'marks.entry', 'Examinations & Grading'),
    (gen_random_uuid(), 'Lock & Finalize Examination Marks', 'marks.lock', 'Examinations & Grading'),
    (gen_random_uuid(), 'Configure Grading Scales & GPA', 'gradingscales.manage', 'Examinations & Grading'),
    (gen_random_uuid(), 'Generate Report Cards & Transcripts', 'reportcards.generate', 'Examinations & Grading'),
    (gen_random_uuid(), 'View Fee Structures & Concessions', 'fees.view', 'Finance & Accounts'),
    (gen_random_uuid(), 'Collect Student Fee Payments', 'fees.collect', 'Finance & Accounts'),
    (gen_random_uuid(), 'Generate Fee Challans & 3-Copy Vouchers', 'fees.vouchers', 'Finance & Accounts'),
    (gen_random_uuid(), 'Manage Chart of Accounts & General Ledger', 'accounts.manage', 'Finance & Accounts'),
    (gen_random_uuid(), 'View Financial Statements & P&L Reports', 'finance.reports', 'Finance & Accounts'),
    (gen_random_uuid(), 'Manage School Expenses & Vouchers', 'expenses.manage', 'Finance & Accounts'),
    (gen_random_uuid(), 'View Staff & Teacher Directory', 'staff.view', 'HR & Payroll'),
    (gen_random_uuid(), 'Manage Staff Profiles & Contracts', 'staff.manage', 'HR & Payroll'),
    (gen_random_uuid(), 'Process Staff Monthly Payroll & Slips', 'payroll.manage', 'HR & Payroll'),
    (gen_random_uuid(), 'Approve Staff Leave Applications', 'leaves.manage', 'HR & Payroll'),
    (gen_random_uuid(), 'Manage Staff Advances & Loans', 'loans.manage', 'HR & Payroll'),
    (gen_random_uuid(), 'Manage Transport Routes & Vehicles', 'transport.manage', 'Facilities & Transport'),
    (gen_random_uuid(), 'Manage Hostel Dormitories & Allocations', 'hostel.manage', 'Facilities & Transport'),
    (gen_random_uuid(), 'Manage Library Catalog & Book Loans', 'library.manage', 'Facilities & Transport'),
    (gen_random_uuid(), 'View & Post School Notices', 'notices.manage', 'Communication & Helpdesk'),
    (gen_random_uuid(), 'Broadcast SMS & Push Alerts', 'alerts.broadcast', 'Communication & Helpdesk'),
    (gen_random_uuid(), 'Manage Helpdesk & Parent Inquiries', 'helpdesk.manage', 'Communication & Helpdesk'),
    (gen_random_uuid(), 'Configure School Identity & Settings', 'settings.manage', 'System Administration'),
    (gen_random_uuid(), 'Manage User Accounts & Passwords', 'users.manage', 'System Administration'),
    (gen_random_uuid(), 'Configure Roles & Permissions Matrix', 'roles.manage', 'System Administration'),
    (gen_random_uuid(), 'View Security Audit Trail Logs', 'audit.view', 'System Administration')
    ON CONFLICT (name) DO NOTHING;

    -- 4. Grant All Master Permissions to Admin Role of Voke Solutions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_admin_role_id, p.id
    FROM public.permissions p
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- 5. Seed Chart of Accounts for Voke Solutions (Hierarchical 3-Tier Structure)
    -- 5a. Level 1 Master Heads
    INSERT INTO public.chart_of_accounts (id, tenant_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
    VALUES
    (gen_random_uuid(), v_tenant_id, '1000', 'ASSETS', 'Asset', 'Master Control Group', 1, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, '2000', 'LIABILITIES', 'Liability', 'Master Control Group', 1, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, '3000', 'EQUITY & CAPITAL', 'Equity', 'Master Control Group', 1, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, '4000', 'REVENUE & INCOME', 'Revenue', 'Master Control Group', 1, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, '5000', 'EXPENSES', 'Expense', 'Master Control Group', 1, 0.00, 'PKR', 1.0, true, true, NOW())
    ON CONFLICT (tenant_id, code) DO NOTHING;

    -- 5b. Level 2 Sub-Control Heads (linked to Level 1)
    INSERT INTO public.chart_of_accounts (id, tenant_id, parent_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
    VALUES
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1000' LIMIT 1), '1100', 'Current Assets', 'Asset', 'Current Asset', 2, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1000' LIMIT 1), '1200', 'Fixed & Non-Current Assets', 'Asset', 'Fixed Asset', 2, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '2000' LIMIT 1), '2100', 'Current Liabilities & Payables', 'Liability', 'Current Liability', 2, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '2000' LIMIT 1), '2200', 'Long-Term Liabilities', 'Liability', 'Long-Term Liability', 2, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '3000' LIMIT 1), '3100', 'Capital & Shareholder Reserves', 'Equity', 'Capital', 2, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '3000' LIMIT 1), '3200', 'Retained Surplus & Reserves', 'Equity', 'Retained Earnings', 2, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4000' LIMIT 1), '4100', 'Core Academic Tuition & Fee Income', 'Revenue', 'Operating Income', 2, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4000' LIMIT 1), '4200', 'Auxiliary & Facility Revenue', 'Revenue', 'Other Income', 2, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5000' LIMIT 1), '5100', 'Payroll & Staff Compensation', 'Expense', 'Operating Expense', 2, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5000' LIMIT 1), '5200', 'Campus Facility & Utilities Expenses', 'Expense', 'Operating Expense', 2, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5000' LIMIT 1), '5300', 'Academic, Administrative & Financial Costs', 'Expense', 'Operating Expense', 2, 0.00, 'PKR', 1.0, true, true, NOW())
    ON CONFLICT (tenant_id, code) DO NOTHING;

    -- 5c. Level 3 Operational Sub-Ledger Accounts (linked to Level 2)
    INSERT INTO public.chart_of_accounts (id, tenant_id, parent_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
    VALUES
    -- Current Assets (1100)
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1100' LIMIT 1), '1101', 'Petty Cash Vault (Custodian Float)', 'Asset', 'Cash & Cash Equivalents', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1100' LIMIT 1), '1102', 'Main School Bank Operating Account', 'Asset', 'Cash & Cash Equivalents', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1100' LIMIT 1), '1103', 'Student Fee Accounts Receivable', 'Asset', 'Current Asset', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1100' LIMIT 1), '1104', 'Student RFID Cashless Wallet Clearing', 'Asset', 'Current Asset', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1100' LIMIT 1), '1105', 'Short-Term Advances & Prepayments', 'Asset', 'Current Asset', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    -- Fixed Assets (1200)
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1200' LIMIT 1), '1201', 'School Land & Campus Infrastructure', 'Asset', 'Fixed Asset', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1200' LIMIT 1), '1202', 'Computer Labs & IT Equipment', 'Asset', 'Fixed Asset', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1200' LIMIT 1), '1203', 'Classroom Furniture & Lab Fixtures', 'Asset', 'Fixed Asset', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1200' LIMIT 1), '1204', 'School Buses & Transport Fleet Vehicles', 'Asset', 'Fixed Asset', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    -- Current Liabilities (2100)
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '2100' LIMIT 1), '2101', 'Accounts Payable & Vendor Dues', 'Liability', 'Current Liability', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '2100' LIMIT 1), '2102', 'Refundable Student Security Deposits', 'Liability', 'Current Liability', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '2100' LIMIT 1), '2103', 'Staff Salaries Payable', 'Liability', 'Current Liability', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '2100' LIMIT 1), '2104', 'Staff Provident Fund & Gratuity Liability', 'Liability', 'Current Liability', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '2100' LIMIT 1), '2105', 'Advance Student Fee Collections (Unearned)', 'Liability', 'Current Liability', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    -- Long-Term Liabilities (2200)
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '2200' LIMIT 1), '2201', 'Long-Term Commercial Bank Loans', 'Liability', 'Long-Term Liability', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    -- Equity (3100 & 3200)
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '3100' LIMIT 1), '3101', 'School Founder / Trust Capital', 'Equity', 'Capital', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '3100' LIMIT 1), '3102', 'Campus Infrastructure Reserve Surplus', 'Equity', 'Reserves', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '3200' LIMIT 1), '3201', 'Retained Earnings & Accumulated Surplus', 'Equity', 'Retained Earnings', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    -- Revenue (4100 & 4200)
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4100' LIMIT 1), '4101', 'Monthly Tuition Fee Income', 'Revenue', 'Operating Income', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4100' LIMIT 1), '4102', 'Admission & Registration Fee Income', 'Revenue', 'Operating Income', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4100' LIMIT 1), '4103', 'Annual Development & Exam Fee Income', 'Revenue', 'Operating Income', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4100' LIMIT 1), '4104', 'Science & Computer Lab Fee Income', 'Revenue', 'Operating Income', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4200' LIMIT 1), '4201', 'Transport Fleet Monthly Fee Income', 'Revenue', 'Operating Income', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4200' LIMIT 1), '4202', 'Hostel Lodging & Mess Fee Income', 'Revenue', 'Operating Income', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4200' LIMIT 1), '4203', 'Late Fee Fine Collections Income', 'Revenue', 'Other Income', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4200' LIMIT 1), '4204', 'Canteen & Uniform Commission Revenue', 'Revenue', 'Other Income', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    -- Expenses (5100, 5200, 5300)
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5100' LIMIT 1), '5101', 'Teaching & Academic Faculty Salaries', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5100' LIMIT 1), '5102', 'Administrative & Non-Teaching Staff Salaries', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5100' LIMIT 1), '5103', 'Staff Medical, Allowances & Bonuses', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5200' LIMIT 1), '5201', 'Utilities (Electricity, Water, Gas)', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5200' LIMIT 1), '5202', 'Building Rent & Campus Lease', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5200' LIMIT 1), '5203', 'Campus Maintenance, Janitorial & Repairs', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5200' LIMIT 1), '5204', 'Fuel, Transport Fleet & Generator Logistics', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5300' LIMIT 1), '5301', 'Stationery, Exam Papers & Printing Supplies', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5300' LIMIT 1), '5302', 'School Events, Sports, Annual Day & Celebrations', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5300' LIMIT 1), '5303', 'Marketing, Social Media & Admissions Advertising', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW()),
    (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5300' LIMIT 1), '5304', 'Bank Charges & Payment Gateway Fees', 'Expense', 'Financial Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW())
    ON CONFLICT (tenant_id, code) DO NOTHING;

    -- 6. Insert Default Admin User for Voke Solutions
    SELECT id INTO v_admin_user_id FROM public.users WHERE tenant_id = v_tenant_id AND email = 'admin@vokesolutions.com' LIMIT 1;
    IF v_admin_user_id IS NULL THEN
        v_admin_user_id := gen_random_uuid();
        INSERT INTO public.users (
            id, tenant_id, role_id, first_name, last_name, email, password_hash,
            phone_number, is_active, created_at
        ) VALUES (
            v_admin_user_id,
            v_tenant_id,
            v_admin_role_id,
            'Voke',
            'Admin',
            'admin@vokesolutions.com',
            v_password_hash,
            '+92 300 0000000',
            true,
            NOW()
        );
        RAISE NOTICE 'Inserted Admin User: admin@vokesolutions.com (Password: Admin@123)';
    END IF;

    RAISE NOTICE '=========================================================';
    RAISE NOTICE 'Voke Solutions Tenant and All Defaults Seeded Successfully!';
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Admin Role ID: %', v_admin_role_id;
    RAISE NOTICE 'Admin Email: admin@vokesolutions.com';
    RAISE NOTICE 'Admin Password: Admin@123';
    RAISE NOTICE '=========================================================';
END $$;
