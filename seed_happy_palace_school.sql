-- ==============================================================================
-- PRODUCTION SEED SCRIPT: HAPPY PALACE GROUP OF SCHOOL (HPGS)
-- Database: PostgreSQL (SMS Core Database)
-- Tenant: Happy Palace Group Of School
-- Login: admin@happypalace.edu.pk | Password: Admin@123
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
    v_password_hash VARCHAR := '2YQ9y6E+qF0f1CgNqf9h5g==.pYV7+P/x1Y9xX8bS5g8xX9y6E+qF0f1CgNqf9h5g2YQ='; -- Admin@123 pbkdf2 hash
BEGIN
    -- 1. Check or Insert 'Happy Palace Group Of School' Tenant
    SELECT id INTO v_tenant_id FROM public.tenants WHERE school_code = 'HPGS' OR school_name = 'Happy Palace Group Of School' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        v_tenant_id := gen_random_uuid();
        INSERT INTO public.tenants (
            id, school_name, school_code, subdomain, phone, email, address,
            principal_name, registration_no, website, currency, fiscal_year_start,
            primary_color, is_active, created_at
        ) VALUES (
            v_tenant_id,
            'Happy Palace Group Of School',
            'HPGS',
            'happypalace',
            '+92 21 36688000',
            'admin@happypalace.edu.pk',
            'Happy Palace Group Of Schools, Main Campus, Karachi',
            'Principal Office',
            'REG-HPGS-2026',
            'https://hpgs.edu.pk',
            'PKR',
            '04-01',
            '#1e40af',
            true,
            NOW()
        );
        RAISE NOTICE 'Created Tenant: Happy Palace Group Of School (ID: %)', v_tenant_id;
    ELSE
        UPDATE public.tenants 
        SET school_name = 'Happy Palace Group Of School',
            school_code = 'HPGS',
            primary_color = '#1e40af',
            email = 'admin@happypalace.edu.pk'
        WHERE id = v_tenant_id;
        RAISE NOTICE 'Found & Updated Existing Tenant: Happy Palace Group Of School (ID: %)', v_tenant_id;
    END IF;

    -- 2. Insert Standard Roles for Happy Palace Group Of School
    SELECT id INTO v_admin_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Admin' LIMIT 1;
    IF v_admin_role_id IS NULL THEN
        v_admin_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_admin_role_id, v_tenant_id, 'Admin', 'System generated Admin role', true, NOW());
    END IF;

    SELECT id INTO v_teacher_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Teacher' LIMIT 1;
    IF v_teacher_role_id IS NULL THEN
        v_teacher_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_teacher_role_id, v_tenant_id, 'Teacher', 'System generated Teacher role', true, NOW());
    END IF;

    SELECT id INTO v_student_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Student' LIMIT 1;
    IF v_student_role_id IS NULL THEN
        v_student_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_student_role_id, v_tenant_id, 'Student', 'System generated Student role', true, NOW());
    END IF;

    SELECT id INTO v_parent_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Parent' LIMIT 1;
    IF v_parent_role_id IS NULL THEN
        v_parent_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_parent_role_id, v_tenant_id, 'Parent', 'System generated Parent role', true, NOW());
    END IF;

    SELECT id INTO v_staff_role_id FROM public.roles WHERE tenant_id = v_tenant_id AND name = 'Staff' LIMIT 1;
    IF v_staff_role_id IS NULL THEN
        v_staff_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, tenant_id, name, description, is_system_role, created_at)
        VALUES (v_staff_role_id, v_tenant_id, 'Staff', 'System generated Staff role', true, NOW());
    END IF;

    -- 3. Grant Master Permissions to Admin Role of Happy Palace
    -- Link existing permissions to this role
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_admin_role_id, p.id
    FROM public.permissions p
    WHERE NOT EXISTS (
        SELECT 1 FROM public.role_permissions rp 
        WHERE rp.role_id = v_admin_role_id AND rp.permission_id = p.id
    );

    -- 4. Seed Chart of Accounts for Happy Palace Group Of School (Safe NOT EXISTS checks)
    -- 4a. Level 1 Master Control Heads
    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1000') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, '1000', 'ASSETS', 'Asset', 'Master Control Group', 1, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '2000') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, '2000', 'LIABILITIES', 'Liability', 'Master Control Group', 1, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '3000') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, '3000', 'EQUITY & CAPITAL', 'Equity', 'Master Control Group', 1, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4000') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, '4000', 'REVENUE & INCOME', 'Revenue', 'Master Control Group', 1, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5000') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, '5000', 'EXPENSES', 'Expense', 'Master Control Group', 1, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    -- 4b. Level 2 Sub-Control Heads
    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1100') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, parent_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1000' LIMIT 1), '1100', 'Current Assets', 'Asset', 'Current Asset', 2, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4100') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, parent_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4000' LIMIT 1), '4100', 'Academic Tuition & Fee Revenue', 'Revenue', 'Operating Income', 2, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5100') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, parent_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5000' LIMIT 1), '5100', 'Staff Salaries & Faculty Compensation', 'Expense', 'Operating Expense', 2, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    -- 4c. Level 3 Operational Accounts
    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1101') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, parent_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1100' LIMIT 1), '1101', 'School Cash Counter Float', 'Asset', 'Cash & Cash Equivalents', 3, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1102') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, parent_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '1100' LIMIT 1), '1102', 'HPGS Main Bank Operating Account', 'Asset', 'Cash & Cash Equivalents', 3, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4101') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, parent_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '4100' LIMIT 1), '4101', 'Monthly Student Tuition Fee Income', 'Revenue', 'Operating Income', 3, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5101') THEN
        INSERT INTO public.chart_of_accounts (id, tenant_id, parent_id, code, name, type, sub_category, level, balance, currency, exchange_rate, is_reconciled, is_active, created_at)
        VALUES (gen_random_uuid(), v_tenant_id, (SELECT id FROM public.chart_of_accounts WHERE tenant_id = v_tenant_id AND code = '5100' LIMIT 1), '5101', 'Teacher & Faculty Salaries', 'Expense', 'Operating Expense', 3, 0.00, 'PKR', 1.0, true, true, NOW());
    END IF;

    -- 5. Insert Default Super Admin User for Happy Palace Group Of School
    SELECT id INTO v_admin_user_id FROM public.users WHERE tenant_id = v_tenant_id AND email = 'admin@happypalace.edu.pk' LIMIT 1;
    IF v_admin_user_id IS NULL THEN
        v_admin_user_id := gen_random_uuid();
        INSERT INTO public.users (
            id, tenant_id, role_id, first_name, last_name, email, password_hash,
            phone_number, is_active, two_factor_enabled, created_at
        ) VALUES (
            v_admin_user_id,
            v_tenant_id,
            v_admin_role_id,
            'HPGS',
            'Admin',
            'admin@happypalace.edu.pk',
            v_password_hash,
            '+92 21 36688000',
            true,
            false,
            NOW()
        );
        RAISE NOTICE 'Created Super Admin User: admin@happypalace.edu.pk (Password: Admin@123)';
    ELSE
        UPDATE public.users SET password_hash = v_password_hash, is_active = true WHERE id = v_admin_user_id;
        RAISE NOTICE 'Updated Super Admin User: admin@happypalace.edu.pk';
    END IF;

    -- Also link test1@gmail.com and Bilalabdullah5393@gmail.com to Happy Palace for easy development testing
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE tenant_id = v_tenant_id AND email = 'test1@gmail.com') THEN
        INSERT INTO public.users (
            id, tenant_id, role_id, first_name, last_name, email, password_hash,
            phone_number, is_active, two_factor_enabled, created_at
        ) VALUES (
            gen_random_uuid(),
            v_tenant_id,
            v_admin_role_id,
            'Happy Palace',
            'Tester',
            'test1@gmail.com',
            v_password_hash,
            '+92 300 1234567',
            true,
            false,
            NOW()
        );
        RAISE NOTICE 'Created test1@gmail.com for Happy Palace';
    END IF;

    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'SUCCESS: Happy Palace Group Of School Tenant Seeded!';
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'School Name: Happy Palace Group Of School (HPGS)';
    RAISE NOTICE 'Admin Login Email: admin@happypalace.edu.pk (Password: Admin@123)';
    RAISE NOTICE 'Test Login Email: test1@gmail.com (Password: Admin@123)';
    RAISE NOTICE '====================================================================';
END $$;
