-- ==============================================================================
-- PRODUCTION PROVISIONING SCRIPT: AL HIDAYAH ACADEMY (AHA)
-- Database: PostgreSQL (Neon Serverless SMS Database)
-- Tenant: Al Hidayah Academy
-- Login: admin@alhidayah.edu.pk | Password: Admin@123
-- Theme: Emerald Green (#059669)
-- ==============================================================================

DO $$
DECLARE
    v_school_name   VARCHAR := 'Al Hidayah Academy';
    v_school_code   VARCHAR := 'AHA';
    v_subdomain     VARCHAR := 'alhidayah';
    v_admin_email   VARCHAR := 'admin@alhidayah.edu.pk';
    v_phone         VARCHAR := '+92 21 34567890';
    v_address       VARCHAR := 'Al Hidayah Academy, Block 4, Gulshan-e-Iqbal, Karachi';
    v_primary_color VARCHAR := '#059669'; -- Emerald Green Theme
    v_password_hash VARCHAR := '2YQ9y6E+qF0f1CgNqf9h5g==.pYV7+P/x1Y9xX8bS5g8xX9y6E+qF0f1CgNqf9h5g2YQ='; -- Admin@123

    v_tenant_id UUID;
    v_admin_role_id UUID;
    v_teacher_role_id UUID;
    v_student_role_id UUID;
    v_parent_role_id UUID;
    v_staff_role_id UUID;
    v_admin_user_id UUID;
BEGIN
    -- 1. Insert or Retrieve 'Al Hidayah Academy' Tenant
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
            v_admin_email, v_address, 'Principal Office', 'REG-AHA-2026',
            'https://alhidayah.edu.pk', 'PKR', '04-01',
            v_primary_color, true, NOW()
        );
        RAISE NOTICE 'Created Tenant: % (ID: %)', v_school_name, v_tenant_id;
    ELSE
        UPDATE public.tenants 
        SET school_name = v_school_name,
            school_code = v_school_code,
            primary_color = v_primary_color,
            email = v_admin_email
        WHERE id = v_tenant_id;
        RAISE NOTICE 'Found & Updated Existing Tenant: % (ID: %)', v_school_name, v_tenant_id;
    END IF;

    -- 2. Insert Standard Roles for Al Hidayah Academy
    -- Admin
    SELECT id INTO v_admin_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Admin' LIMIT 1;
    IF v_admin_role_id IS NULL THEN
        v_admin_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_admin_role_id, v_tenant_id, 'Admin', 'Academy Administrator with Full Operational Access', true, NOW());
    END IF;

    -- Teacher
    SELECT id INTO v_teacher_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Teacher' LIMIT 1;
    IF v_teacher_role_id IS NULL THEN
        v_teacher_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_teacher_role_id, v_tenant_id, 'Teacher', 'Academic Teacher & Subject Instructor', true, NOW());
    END IF;

    -- Student
    SELECT id INTO v_student_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Student' LIMIT 1;
    IF v_student_role_id IS NULL THEN
        v_student_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_student_role_id, v_tenant_id, 'Student', 'Student Portal User', true, NOW());
    END IF;

    -- Parent
    SELECT id INTO v_parent_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Parent' LIMIT 1;
    IF v_parent_role_id IS NULL THEN
        v_parent_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_parent_role_id, v_tenant_id, 'Parent', 'Guardian & Parent Portal User', true, NOW());
    END IF;

    -- Staff
    SELECT id INTO v_staff_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Staff' LIMIT 1;
    IF v_staff_role_id IS NULL THEN
        v_staff_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_staff_role_id, v_tenant_id, 'Staff', 'Accountant, Cashier & Reception Staff', true, NOW());
    END IF;

    -- 3. Grant All System Permissions to School Admin
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_admin_role_id, p.id 
    FROM public.permissions p
    ON CONFLICT DO NOTHING;

    -- 4. Create Initial Administrator Account
    SELECT id INTO v_admin_user_id FROM public.users 
    WHERE tenant_id = v_tenant_id AND email = v_admin_email LIMIT 1;
    
    IF v_admin_user_id IS NULL THEN
        v_admin_user_id := gen_random_uuid();
        INSERT INTO public.users (
            id, tenant_id, role_id, first_name, last_name, email,
            password_hash, phone_number, is_active, two_factor_enabled, created_at
        ) VALUES (
            v_admin_user_id, v_tenant_id, v_admin_role_id, 'Academy', 'Administrator',
            v_admin_email, v_password_hash, v_phone, true, false, NOW()
        );
        RAISE NOTICE 'Created Admin User: % (Password: Admin@123)', v_admin_email;
    ELSE
        UPDATE public.users 
        SET role_id = v_admin_role_id,
            password_hash = v_password_hash,
            is_active = true,
            two_factor_enabled = false
        WHERE id = v_admin_user_id;
        RAISE NOTICE 'Updated Existing Admin User: % (Password: Admin@123)', v_admin_email;
    END IF;

    -- 5. Seed Standard Chart of Accounts (COA)
    INSERT INTO public.chart_of_accounts (id, tenant_id, account_code, account_name, account_type, is_active, created_at)
    VALUES 
        (gen_random_uuid(), v_tenant_id, '1010', 'Cash on Hand', 'Asset', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '1020', 'Bank Al-Falah Main Operational', 'Asset', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '1030', 'Meezan Bank Fee Collection', 'Asset', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '1050', 'Accounts Receivable (Tuition Fees)', 'Asset', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '2010', 'Accounts Payable', 'Liability', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '2020', 'Salaries Payable', 'Liability', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '3010', 'School Capital', 'Equity', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '4010', 'Monthly Tuition Fee Revenue', 'Revenue', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '4020', 'Admission & Registration Revenue', 'Revenue', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '4030', 'Examination & Annual Charges', 'Revenue', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '5010', 'Teacher Salaries Expense', 'Expense', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '5020', 'Staff Payroll Expense', 'Expense', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '5030', 'Campus Utilities & Electricity', 'Expense', true, NOW()),
        (gen_random_uuid(), v_tenant_id, '5040', 'Stationery & Printing Supplies', 'Expense', true, NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'SUCCESS: Al Hidayah Academy fully provisioned with Emerald Green (#059669) branding!';
END $$;
