-- ==============================================================================
-- UNIVERSAL CLIENT PROVISIONING TEMPLATE (POSTGRESQL)
-- Project: School Management System (SMS) Multi-Tenant Engine
-- How to Use:
-- 1. Replace the 4 VARIABLES below with your new client's details.
-- 2. Run this script in Neon SQL Editor.
-- 3. That's it! School, Roles, Permissions & Admin User are provisioned.
-- ==============================================================================

DO $$
DECLARE
    -- >>> CONFIGURE YOUR NEW SCHOOL HERE <<<
    v_school_name   VARCHAR := 'The City School';               -- Full School Name
    v_school_code   VARCHAR := 'TCS01';                         -- Unique Short Code (e.g. TCS01, BSS, APS)
    v_subdomain     VARCHAR := 'cityschool';                    -- Subdomain identifier
    v_admin_email   VARCHAR := 'admin@cityschool.edu.pk';       -- School Admin Email
    v_phone         VARCHAR := '+92 300 1234567';               -- School Contact Phone
    v_address       VARCHAR := 'Main Campus, Karachi';          -- School Address
    v_primary_color VARCHAR := '#047857';                       -- School Brand Color (Hex)
    v_password_hash VARCHAR := '2YQ9y6E+qF0f1CgNqf9h5g==.pYV7+P/x1Y9xX8bS5g8xX9y6E+qF0f1CgNqf9h5g2YQ='; -- Hash for 'Admin@123'
    
    -- Internal Variables
    v_tenant_id UUID;
    v_admin_role_id UUID;
    v_teacher_role_id UUID;
    v_student_role_id UUID;
    v_parent_role_id UUID;
    v_staff_role_id UUID;
    v_admin_user_id UUID;
BEGIN
    -- 1. Insert or Retrieve Tenant
    SELECT id INTO v_tenant_id FROM public.tenants 
    WHERE school_code = v_school_code OR school_name = v_school_name LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        v_tenant_id := gen_random_uuid();
        INSERT INTO public.tenants (
            id, school_name, school_code, subdomain, phone, email, address,
            principal_name, registration_no, website, currency, fiscal_year_start,
            primary_color, is_active, created_at
        ) VALUES (
            v_tenant_id, v_school_name, v_school_code, v_subdomain, v_phone,
            v_admin_email, v_address, 'Principal Office', 'REG-' || v_school_code,
            'https://' || v_subdomain || '.edu.pk', 'PKR', '04-01',
            v_primary_color, true, NOW()
        );
        RAISE NOTICE 'Provisioned New Tenant: % (ID: %)', v_school_name, v_tenant_id;
    ELSE
        UPDATE public.tenants 
        SET school_name = v_school_name,
            school_code = v_school_code,
            primary_color = v_primary_color,
            email = v_admin_email
        WHERE id = v_tenant_id;
        RAISE NOTICE 'Updated Existing Tenant: % (ID: %)', v_school_name, v_tenant_id;
    END IF;

    -- 2. Insert Standard Roles for This Tenant
    -- Admin Role
    SELECT id INTO v_admin_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Admin' LIMIT 1;
    IF v_admin_role_id IS NULL THEN
        v_admin_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_admin_role_id, v_tenant_id, 'Admin', 'School Administrator with Full Management Access', true, NOW());
    END IF;

    -- Teacher Role
    SELECT id INTO v_teacher_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Teacher' LIMIT 1;
    IF v_teacher_role_id IS NULL THEN
        v_teacher_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_teacher_role_id, v_tenant_id, 'Teacher', 'Academic Instructor & Attendance Marker', true, NOW());
    END IF;

    -- Student Role
    SELECT id INTO v_student_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Student' LIMIT 1;
    IF v_student_role_id IS NULL THEN
        v_student_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_student_role_id, v_tenant_id, 'Student', 'Student Learning Portal User', true, NOW());
    END IF;

    -- Parent Role
    SELECT id INTO v_parent_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Parent' LIMIT 1;
    IF v_parent_role_id IS NULL THEN
        v_parent_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_parent_role_id, v_tenant_id, 'Parent', 'Guardian & Parent Fee Portal User', true, NOW());
    END IF;

    -- Staff Role
    SELECT id INTO v_staff_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Staff' LIMIT 1;
    IF v_staff_role_id IS NULL THEN
        v_staff_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_staff_role_id, v_tenant_id, 'Staff', 'Accountant, Receptionist & Operations Staff', true, NOW());
    END IF;

    -- 3. Grant All System Permissions to School Admin Role
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_admin_role_id, p.id 
    FROM public.permissions p
    ON CONFLICT DO NOTHING;

    -- 4. Create Initial School Administrator User
    SELECT id INTO v_admin_user_id FROM public.users 
    WHERE tenant_id = v_tenant_id AND email = v_admin_email LIMIT 1;
    
    IF v_admin_user_id IS NULL THEN
        v_admin_user_id := gen_random_uuid();
        INSERT INTO public.users (
            id, tenant_id, role_id, first_name, last_name, email,
            password_hash, phone_number, is_active, two_factor_enabled, created_at
        ) VALUES (
            v_admin_user_id, v_tenant_id, v_admin_role_id, 'School', 'Administrator',
            v_admin_email, v_password_hash, v_phone, true, false, NOW()
        );
        RAISE NOTICE 'Created School Admin User: % (Password: Admin@123)', v_admin_email;
    ELSE
        UPDATE public.users 
        SET role_id = v_admin_role_id,
            password_hash = v_password_hash,
            is_active = true,
            two_factor_enabled = false
        WHERE id = v_admin_user_id;
        RAISE NOTICE 'Updated Existing School Admin User: % (Password: Admin@123)', v_admin_email;
    END IF;

    -- 5. Standard Chart of Accounts (COA) Seeding
    INSERT INTO public.chart_of_accounts (id, tenant_id, account_code, account_name, account_type, is_active, created_at)
    VALUES 
        (gen_random_uuid(), v_tenant_id, '1010', 'Cash in Hand', 'Asset', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '1020', 'Bank Al-Habib Main Operational', 'Asset', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '1030', 'Meezan Bank Tuition Collection', 'Asset', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '1050', 'Accounts Receivable (Student Fees)', 'Asset', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '2010', 'Accounts Payable (Vendors)', 'Liability', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '2020', 'Salaries Payable', 'Liability', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '3010', 'School Retained Capital', 'Equity', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '4010', 'Tuition Fee Revenue', 'Revenue', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '4020', 'Admission & Registration Revenue', 'Revenue', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '4030', 'Examination & Annual Charges', 'Revenue', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '5010', 'Teaching Faculty Salaries Expense', 'Expense', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '5020', 'Administrative Staff Payroll Expense', 'Expense', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '5030', 'Campus Electricity & Utilities', 'Expense', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '5040', 'School Printing, Stationery & Lab Supplies', 'Expense', true, NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'SUCCESS: % successfully initialized on Multi-Tenant Platform!', v_school_name;
END $$;
