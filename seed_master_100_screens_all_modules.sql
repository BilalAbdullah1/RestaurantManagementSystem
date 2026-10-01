-- ==============================================================================
-- 🚀 SMS MASTER SEED SCRIPT: 100+ SCREENS (OPERATIONAL MODULES)
-- Target Database: PostgreSQL (Single-Tenant Auto-Propagated & Model Aligned)
-- Safe & Idempotent: ON CONFLICT DO NOTHING / Dynamic Variable Binding
-- ==============================================================================
-- NOTE: Tenants, Roles, Permissions, Users, and Chart of Accounts are assumed to
-- be seeded externally by the project setup. This script focuses on the application
-- operational flow.
-- ==============================================================================

DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000000';
    -- Existing user IDs assumed from previous seed
    v_admin_user_id UUID := 'c0000001-0000-0000-0000-000000000001';
    v_teacher_user_id UUID := 'c0000001-0000-0000-0000-000000000002';
    v_parent_user_id UUID := 'c0000001-0000-0000-0000-000000000007';
    v_student_user_id UUID := 'c0000001-0000-0000-0000-000000000009';
BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '🚀 Starting SMS Master Seed (Operational) for Tenant: %', v_tenant_id;
    RAISE NOTICE '=======================================================';

    -- =========================================================================
    -- PHASE 1: ACADEMIC FOUNDATION
    -- =========================================================================

    -- 1. Academic Years
    INSERT INTO public.academic_years (id, tenant_id, title, start_date, end_date, is_current, created_at)
    VALUES
    
    ('d0000001-0000-0000-0000-000000000001', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-000000000002', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-000000000003', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-000000000004', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-000000000005', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-000000000006', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-000000000007', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-000000000008', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-000000000009', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-00000000000a', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-00000000000b', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-00000000000c', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-00000000000d', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-00000000000e', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW()),
    ('d0000001-0000-0000-0000-00000000000f', v_tenant_id, 'Academic Year 2025-2026', '2025-04-01', '2026-03-31', true, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 2. Classes
    INSERT INTO public.classes (id, tenant_id, name, code, created_at)
    VALUES
    
    ('e0000001-0000-0000-0000-000000000001', v_tenant_id, 'Class 9th', 'CLS-09', NOW()),
    ('e0000001-0000-0000-0000-000000000002', v_tenant_id, 'Class 9th', 'CLS-010', NOW()),
    ('e0000001-0000-0000-0000-000000000003', v_tenant_id, 'Class 9th', 'CLS-011', NOW()),
    ('e0000001-0000-0000-0000-000000000004', v_tenant_id, 'Class 9th', 'CLS-012', NOW()),
    ('e0000001-0000-0000-0000-000000000005', v_tenant_id, 'Class 9th', 'CLS-013', NOW()),
    ('e0000001-0000-0000-0000-000000000006', v_tenant_id, 'Class 9th', 'CLS-014', NOW()),
    ('e0000001-0000-0000-0000-000000000007', v_tenant_id, 'Class 9th', 'CLS-015', NOW()),
    ('e0000001-0000-0000-0000-000000000008', v_tenant_id, 'Class 9th', 'CLS-016', NOW()),
    ('e0000001-0000-0000-0000-000000000009', v_tenant_id, 'Class 9th', 'CLS-017', NOW()),
    ('e0000001-0000-0000-0000-00000000000a', v_tenant_id, 'Class 9th', 'CLS-018', NOW()),
    ('e0000001-0000-0000-0000-00000000000b', v_tenant_id, 'Class 9th', 'CLS-019', NOW()),
    ('e0000001-0000-0000-0000-00000000000c', v_tenant_id, 'Class 9th', 'CLS-020', NOW()),
    ('e0000001-0000-0000-0000-00000000000d', v_tenant_id, 'Class 9th', 'CLS-021', NOW()),
    ('e0000001-0000-0000-0000-00000000000e', v_tenant_id, 'Class 9th', 'CLS-022', NOW()),
    ('e0000001-0000-0000-0000-00000000000f', v_tenant_id, 'Class 9th', 'CLS-023', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 3. Sections
    INSERT INTO public.sections (id, tenant_id, class_id, name, room_number, max_capacity, created_at)
    VALUES
    
    ('f0000001-0000-0000-0000-000000000001', v_tenant_id, 'e0000001-0000-0000-0000-000000000002', 'Section A', 'Room 101', 40, NOW()),
    ('f0000001-0000-0000-0000-000000000002', v_tenant_id, 'e0000001-0000-0000-0000-000000000003', 'Section B', 'Room 102', 40, NOW()),
    ('f0000001-0000-0000-0000-000000000003', v_tenant_id, 'e0000001-0000-0000-0000-000000000004', 'Section C', 'Room 103', 40, NOW()),
    ('f0000001-0000-0000-0000-000000000004', v_tenant_id, 'e0000001-0000-0000-0000-000000000005', 'Section D', 'Room 104', 40, NOW()),
    ('f0000001-0000-0000-0000-000000000005', v_tenant_id, 'e0000001-0000-0000-0000-000000000006', 'Section E', 'Room 105', 40, NOW()),
    ('f0000001-0000-0000-0000-000000000006', v_tenant_id, 'e0000001-0000-0000-0000-000000000007', 'Section A', 'Room 106', 40, NOW()),
    ('f0000001-0000-0000-0000-000000000007', v_tenant_id, 'e0000001-0000-0000-0000-000000000008', 'Section B', 'Room 107', 40, NOW()),
    ('f0000001-0000-0000-0000-000000000008', v_tenant_id, 'e0000001-0000-0000-0000-000000000009', 'Section C', 'Room 108', 40, NOW()),
    ('f0000001-0000-0000-0000-000000000009', v_tenant_id, 'e0000001-0000-0000-0000-00000000000a', 'Section D', 'Room 109', 40, NOW()),
    ('f0000001-0000-0000-0000-00000000000a', v_tenant_id, 'e0000001-0000-0000-0000-00000000000b', 'Section E', 'Room 110', 40, NOW()),
    ('f0000001-0000-0000-0000-00000000000b', v_tenant_id, 'e0000001-0000-0000-0000-00000000000c', 'Section A', 'Room 111', 40, NOW()),
    ('f0000001-0000-0000-0000-00000000000c', v_tenant_id, 'e0000001-0000-0000-0000-00000000000d', 'Section B', 'Room 112', 40, NOW()),
    ('f0000001-0000-0000-0000-00000000000d', v_tenant_id, 'e0000001-0000-0000-0000-00000000000e', 'Section C', 'Room 113', 40, NOW()),
    ('f0000001-0000-0000-0000-00000000000e', v_tenant_id, 'e0000001-0000-0000-0000-00000000000f', 'Section D', 'Room 114', 40, NOW()),
    ('f0000001-0000-0000-0000-00000000000f', v_tenant_id, 'e0000001-0000-0000-0000-000000000010', 'Section E', 'Room 115', 40, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 4. Subjects
    INSERT INTO public.subjects (id, tenant_id, name, code, is_elective, elective_group_name)
    VALUES
    
    ('09000001-0000-0000-0000-000000000001', v_tenant_id, 'Mathematics', 'SUB-100', false, NULL),
    ('09000001-0000-0000-0000-000000000002', v_tenant_id, 'Mathematics', 'SUB-101', false, NULL),
    ('09000001-0000-0000-0000-000000000003', v_tenant_id, 'Mathematics', 'SUB-102', false, NULL),
    ('09000001-0000-0000-0000-000000000004', v_tenant_id, 'Mathematics', 'SUB-103', false, NULL),
    ('09000001-0000-0000-0000-000000000005', v_tenant_id, 'Mathematics', 'SUB-104', false, NULL),
    ('09000001-0000-0000-0000-000000000006', v_tenant_id, 'Mathematics', 'SUB-105', false, NULL),
    ('09000001-0000-0000-0000-000000000007', v_tenant_id, 'Mathematics', 'SUB-106', false, NULL),
    ('09000001-0000-0000-0000-000000000008', v_tenant_id, 'Mathematics', 'SUB-107', false, NULL),
    ('09000001-0000-0000-0000-000000000009', v_tenant_id, 'Mathematics', 'SUB-108', false, NULL),
    ('09000001-0000-0000-0000-00000000000a', v_tenant_id, 'Mathematics', 'SUB-109', false, NULL),
    ('09000001-0000-0000-0000-00000000000b', v_tenant_id, 'Mathematics', 'SUB-1010', false, NULL),
    ('09000001-0000-0000-0000-00000000000c', v_tenant_id, 'Mathematics', 'SUB-1011', false, NULL),
    ('09000001-0000-0000-0000-00000000000d', v_tenant_id, 'Mathematics', 'SUB-1012', false, NULL),
    ('09000001-0000-0000-0000-00000000000e', v_tenant_id, 'Mathematics', 'SUB-1013', false, NULL),
    ('09000001-0000-0000-0000-00000000000f', v_tenant_id, 'Mathematics', 'SUB-1014', false, NULL)
    ON CONFLICT (id) DO NOTHING;

    -- 5. Class Subjects Mapping
    INSERT INTO public.class_subjects (id, tenant_id, class_id, subject_id, passing_marks, total_marks)
    VALUES
    
    ('10000001-0000-0000-0000-000000000001', v_tenant_id, 'e0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000001', 33.00, 100.00),
    ('10000001-0000-0000-0000-000000000002', v_tenant_id, 'e0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000002', 33.00, 100.00),
    ('10000001-0000-0000-0000-000000000003', v_tenant_id, 'e0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000003', 33.00, 100.00),
    ('10000001-0000-0000-0000-000000000004', v_tenant_id, 'e0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000004', 33.00, 100.00),
    ('10000001-0000-0000-0000-000000000005', v_tenant_id, 'e0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000005', 33.00, 100.00),
    ('10000001-0000-0000-0000-000000000006', v_tenant_id, 'e0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000006', 33.00, 100.00),
    ('10000001-0000-0000-0000-000000000007', v_tenant_id, 'e0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000007', 33.00, 100.00),
    ('10000001-0000-0000-0000-000000000008', v_tenant_id, 'e0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000008', 33.00, 100.00),
    ('10000001-0000-0000-0000-000000000009', v_tenant_id, 'e0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-000000000009', 33.00, 100.00),
    ('10000001-0000-0000-0000-00000000000a', v_tenant_id, 'e0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000a', 33.00, 100.00),
    ('10000001-0000-0000-0000-00000000000b', v_tenant_id, 'e0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000b', 33.00, 100.00),
    ('10000001-0000-0000-0000-00000000000c', v_tenant_id, 'e0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000c', 33.00, 100.00),
    ('10000001-0000-0000-0000-00000000000d', v_tenant_id, 'e0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000d', 33.00, 100.00),
    ('10000001-0000-0000-0000-00000000000e', v_tenant_id, 'e0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000e', 33.00, 100.00),
    ('10000001-0000-0000-0000-00000000000f', v_tenant_id, 'e0000001-0000-0000-0000-000000000010', '09000001-0000-0000-0000-00000000000f', 33.00, 100.00)
    ON CONFLICT (id) DO NOTHING;


    -- =========================================================================
    -- PHASE 2: HUMAN RESOURCES & STAFF
    -- =========================================================================

    -- 6. Staff Directory
    INSERT INTO public.staff (id, tenant_id, user_id, cnic, staff_type, designation, qualification, basic_salary, joining_date, is_active, cnic_doc_url, degree_doc_url, contract_doc_url, rfid_card_id, biometric_id, casual_leave_quota, medical_leave_quota, casual_leaves_used, medical_leaves_used)
    VALUES
    
    ('12000001-0000-0000-0000-000000000001', v_tenant_id, v_admin_user_id, '35202-1111101-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-000000000002', v_tenant_id, v_admin_user_id, '35202-1111102-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-000000000003', v_tenant_id, v_admin_user_id, '35202-1111103-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-000000000004', v_tenant_id, v_admin_user_id, '35202-1111104-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-000000000005', v_tenant_id, v_admin_user_id, '35202-1111105-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-000000000006', v_tenant_id, v_admin_user_id, '35202-1111106-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-000000000007', v_tenant_id, v_admin_user_id, '35202-1111107-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-000000000008', v_tenant_id, v_admin_user_id, '35202-1111108-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-000000000009', v_tenant_id, v_admin_user_id, '35202-1111109-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-00000000000a', v_tenant_id, v_admin_user_id, '35202-1111110-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-00000000000b', v_tenant_id, v_admin_user_id, '35202-1111111-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-00000000000c', v_tenant_id, v_admin_user_id, '35202-1111112-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-00000000000d', v_tenant_id, v_admin_user_id, '35202-1111113-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-00000000000e', v_tenant_id, v_admin_user_id, '35202-1111114-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1),
    ('12000001-0000-0000-0000-00000000000f', v_tenant_id, v_admin_user_id, '35202-1111115-1', 'Management', 'Campus Principal', 'PhD', 250000.00, '2020-01-15', true, 'url1', 'url2', 'url3', 'RFID-STF-01', 'BIO-STF-01', 14, 8, 2, 1)
    ON CONFLICT (id) DO NOTHING;

    -- 7. Staff Attendance
    INSERT INTO public.staff_attendance (id, tenant_id, staff_id, date, status, check_in, check_out, is_late, is_half_day, fine_amount, latitude, longitude, location_address)
    VALUES
    
    ('13000001-0000-0000-0000-000000000001', v_tenant_id, '12000001-0000-0000-0000-000000000001', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-000000000002', v_tenant_id, '12000001-0000-0000-0000-000000000002', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-000000000003', v_tenant_id, '12000001-0000-0000-0000-000000000003', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-000000000004', v_tenant_id, '12000001-0000-0000-0000-000000000004', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-000000000005', v_tenant_id, '12000001-0000-0000-0000-000000000005', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-000000000006', v_tenant_id, '12000001-0000-0000-0000-000000000006', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-000000000007', v_tenant_id, '12000001-0000-0000-0000-000000000007', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-000000000008', v_tenant_id, '12000001-0000-0000-0000-000000000008', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-000000000009', v_tenant_id, '12000001-0000-0000-0000-000000000009', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-00000000000a', v_tenant_id, '12000001-0000-0000-0000-00000000000a', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-00000000000b', v_tenant_id, '12000001-0000-0000-0000-00000000000b', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-00000000000c', v_tenant_id, '12000001-0000-0000-0000-00000000000c', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-00000000000d', v_tenant_id, '12000001-0000-0000-0000-00000000000d', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-00000000000e', v_tenant_id, '12000001-0000-0000-0000-00000000000e', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1'),
    ('13000001-0000-0000-0000-00000000000f', v_tenant_id, '12000001-0000-0000-0000-00000000000f', CURRENT_DATE, 'Present', CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '15:30:00', false, false, 0, 31.5204, 74.3587, 'Gate 1')
    ON CONFLICT (id) DO NOTHING;

    -- 8. Leave Applications
    INSERT INTO public.leave_applications (id, tenant_id, student_id, staff_id, leave_type, start_date, end_date, reason, attachment_url, status, approver_id, approver_notes, applied_on)
    VALUES
    
    ('14000001-0000-0000-0000-000000000001', v_tenant_id, NULL, '12000001-0000-0000-0000-000000000002', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-000000000002', v_tenant_id, NULL, '12000001-0000-0000-0000-000000000003', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-000000000003', v_tenant_id, NULL, '12000001-0000-0000-0000-000000000004', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-000000000004', v_tenant_id, NULL, '12000001-0000-0000-0000-000000000005', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-000000000005', v_tenant_id, NULL, '12000001-0000-0000-0000-000000000006', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-000000000006', v_tenant_id, NULL, '12000001-0000-0000-0000-000000000007', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-000000000007', v_tenant_id, NULL, '12000001-0000-0000-0000-000000000008', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-000000000008', v_tenant_id, NULL, '12000001-0000-0000-0000-000000000009', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-000000000009', v_tenant_id, NULL, '12000001-0000-0000-0000-00000000000a', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-00000000000a', v_tenant_id, NULL, '12000001-0000-0000-0000-00000000000b', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-00000000000b', v_tenant_id, NULL, '12000001-0000-0000-0000-00000000000c', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-00000000000c', v_tenant_id, NULL, '12000001-0000-0000-0000-00000000000d', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-00000000000d', v_tenant_id, NULL, '12000001-0000-0000-0000-00000000000e', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-00000000000e', v_tenant_id, NULL, '12000001-0000-0000-0000-00000000000f', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW()),
    ('14000001-0000-0000-0000-00000000000f', v_tenant_id, NULL, '12000001-0000-0000-0000-000000000010', 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Wedding', NULL, 'Approved', v_admin_user_id, 'Approved.', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 9. Salary Slips
    INSERT INTO public.salary_slips (id, tenant_id, staff_id, salary_month, basic_salary, house_rent_allowance, medical_allowance, allowance_amount, deduction_amount, provident_fund_deduction, loan_deduction, income_tax_deduction, net_salary, status, payment_date, created_at)
    VALUES
    
    ('15000001-0000-0000-0000-000000000001', v_tenant_id, '12000001-0000-0000-0000-000000000001', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-000000000002', v_tenant_id, '12000001-0000-0000-0000-000000000002', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-000000000003', v_tenant_id, '12000001-0000-0000-0000-000000000003', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-000000000004', v_tenant_id, '12000001-0000-0000-0000-000000000004', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-000000000005', v_tenant_id, '12000001-0000-0000-0000-000000000005', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-000000000006', v_tenant_id, '12000001-0000-0000-0000-000000000006', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-000000000007', v_tenant_id, '12000001-0000-0000-0000-000000000007', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-000000000008', v_tenant_id, '12000001-0000-0000-0000-000000000008', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-000000000009', v_tenant_id, '12000001-0000-0000-0000-000000000009', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-00000000000a', v_tenant_id, '12000001-0000-0000-0000-00000000000a', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-00000000000b', v_tenant_id, '12000001-0000-0000-0000-00000000000b', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-00000000000c', v_tenant_id, '12000001-0000-0000-0000-00000000000c', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-00000000000d', v_tenant_id, '12000001-0000-0000-0000-00000000000d', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-00000000000e', v_tenant_id, '12000001-0000-0000-0000-00000000000e', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW()),
    ('15000001-0000-0000-0000-00000000000f', v_tenant_id, '12000001-0000-0000-0000-00000000000f', '2026-02', 250000.00, 50000.00, 20000.00, 70000.00, 25000.00, 15000.00, 0.00, 10000.00, 295000.00, 'Paid', '2026-02-28', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 10. Staff Loans
    INSERT INTO public.staff_loans (id, tenant_id, staff_id, loan_amount, monthly_installment, remaining_balance, status, reason, issue_date, created_at)
    VALUES
    
    ('16000001-0000-0000-0000-000000000001', v_tenant_id, '12000001-0000-0000-0000-000000000002', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-000000000002', v_tenant_id, '12000001-0000-0000-0000-000000000003', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-000000000003', v_tenant_id, '12000001-0000-0000-0000-000000000004', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-000000000004', v_tenant_id, '12000001-0000-0000-0000-000000000005', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-000000000005', v_tenant_id, '12000001-0000-0000-0000-000000000006', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-000000000006', v_tenant_id, '12000001-0000-0000-0000-000000000007', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-000000000007', v_tenant_id, '12000001-0000-0000-0000-000000000008', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-000000000008', v_tenant_id, '12000001-0000-0000-0000-000000000009', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-000000000009', v_tenant_id, '12000001-0000-0000-0000-00000000000a', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-00000000000a', v_tenant_id, '12000001-0000-0000-0000-00000000000b', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-00000000000b', v_tenant_id, '12000001-0000-0000-0000-00000000000c', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-00000000000c', v_tenant_id, '12000001-0000-0000-0000-00000000000d', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-00000000000d', v_tenant_id, '12000001-0000-0000-0000-00000000000e', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-00000000000e', v_tenant_id, '12000001-0000-0000-0000-00000000000f', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW()),
    ('16000001-0000-0000-0000-00000000000f', v_tenant_id, '12000001-0000-0000-0000-000000000010', 60000.00, 5000.00, 25000.00, 'Approved', 'Renovation', '2025-09-01', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 11. Staff Appraisals
    INSERT INTO public.staff_appraisals (id, tenant_id, staff_id, appraisal_year, performance_rating, is_teacher_of_the_month, award_month, recommended_increment_pct, previous_basic_salary, new_basic_salary, is_increment_applied, comments, created_at)
    VALUES
    
    ('17000001-0000-0000-0000-000000000001', v_tenant_id, '12000001-0000-0000-0000-000000000002', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-000000000002', v_tenant_id, '12000001-0000-0000-0000-000000000003', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-000000000003', v_tenant_id, '12000001-0000-0000-0000-000000000004', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-000000000004', v_tenant_id, '12000001-0000-0000-0000-000000000005', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-000000000005', v_tenant_id, '12000001-0000-0000-0000-000000000006', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-000000000006', v_tenant_id, '12000001-0000-0000-0000-000000000007', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-000000000007', v_tenant_id, '12000001-0000-0000-0000-000000000008', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-000000000008', v_tenant_id, '12000001-0000-0000-0000-000000000009', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-000000000009', v_tenant_id, '12000001-0000-0000-0000-00000000000a', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-00000000000a', v_tenant_id, '12000001-0000-0000-0000-00000000000b', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-00000000000b', v_tenant_id, '12000001-0000-0000-0000-00000000000c', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-00000000000c', v_tenant_id, '12000001-0000-0000-0000-00000000000d', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-00000000000d', v_tenant_id, '12000001-0000-0000-0000-00000000000e', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-00000000000e', v_tenant_id, '12000001-0000-0000-0000-00000000000f', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW()),
    ('17000001-0000-0000-0000-00000000000f', v_tenant_id, '12000001-0000-0000-0000-000000000010', 2026, 4.85, true, 'January', 15.00, 105000.00, 120000.00, true, 'Exceptional', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 12. Staff Clearances
    INSERT INTO public.staff_clearances (id, tenant_id, staff_id, resignation_date, relieving_date, notice_period_days, unpaid_salary_amount, leave_encashment_amount, loan_deduction_amount, net_settlement_amount, clearance_status, remarks, created_at)
    VALUES
    
    ('18000001-0000-0000-0000-000000000001', v_tenant_id, '12000001-0000-0000-0000-000000000001', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-000000000002', v_tenant_id, '12000001-0000-0000-0000-000000000002', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-000000000003', v_tenant_id, '12000001-0000-0000-0000-000000000003', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-000000000004', v_tenant_id, '12000001-0000-0000-0000-000000000004', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-000000000005', v_tenant_id, '12000001-0000-0000-0000-000000000005', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-000000000006', v_tenant_id, '12000001-0000-0000-0000-000000000006', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-000000000007', v_tenant_id, '12000001-0000-0000-0000-000000000007', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-000000000008', v_tenant_id, '12000001-0000-0000-0000-000000000008', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-000000000009', v_tenant_id, '12000001-0000-0000-0000-000000000009', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-00000000000a', v_tenant_id, '12000001-0000-0000-0000-00000000000a', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-00000000000b', v_tenant_id, '12000001-0000-0000-0000-00000000000b', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-00000000000c', v_tenant_id, '12000001-0000-0000-0000-00000000000c', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-00000000000d', v_tenant_id, '12000001-0000-0000-0000-00000000000d', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-00000000000e', v_tenant_id, '12000001-0000-0000-0000-00000000000e', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW()),
    ('18000001-0000-0000-0000-00000000000f', v_tenant_id, '12000001-0000-0000-0000-00000000000f', '2026-01-10', '2026-02-10', 30, 98000.00, 15000.00, 0.00, 113000.00, 'Completed', 'Handed over.', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 13. Staff Chat
    INSERT INTO public.staff_chat_messages (id, tenant_id, sender_id, sender_name, sender_role, receiver_id, channel, message_text, attachment_url, sent_at)
    VALUES
    
    ('19000001-0000-0000-0000-000000000001', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-000000000002', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-000000000003', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-000000000004', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-000000000005', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-000000000006', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-000000000007', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-000000000008', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-000000000009', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-00000000000a', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-00000000000b', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-00000000000c', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-00000000000d', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-00000000000e', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW()),
    ('19000001-0000-0000-0000-00000000000f', v_tenant_id, v_admin_user_id, 'Admin', 'Admin', NULL, 'General', 'Welcome!', NULL, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- =========================================================================
    -- PHASE 3: STUDENTS & ADMISSIONS
    -- =========================================================================

    -- 14. Admission Enquiries
    INSERT INTO public.admission_enquiries (id, tenant_id, child_name, father_name, phone_number, class_id, status, remarks, created_at)
    VALUES
    
    ('20000001-0000-0000-0000-000000000001', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-000000000002', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-000000000002', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-000000000003', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-000000000003', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-000000000004', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-000000000004', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-000000000005', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-000000000005', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-000000000006', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-000000000006', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-000000000007', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-000000000007', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-000000000008', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-000000000008', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-000000000009', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-000000000009', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-00000000000a', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-00000000000a', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-00000000000b', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-00000000000b', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-00000000000c', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-00000000000c', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-00000000000d', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-00000000000d', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-00000000000e', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-00000000000e', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-00000000000f', 'Enquiry', 'Interested', NOW()),
    ('20000001-0000-0000-0000-00000000000f', v_tenant_id, 'Ali Hamza', 'Hamza Tariq', '0300-9988771', 'e0000001-0000-0000-0000-000000000010', 'Enquiry', 'Interested', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 15. Students
    INSERT INTO public.students (id, tenant_id, user_id, b_form_number, first_name, last_name, gender, date_of_birth, admission_date, admission_number, father_name, father_cnic, guardian_phone, address, blood_group, is_active, parent_id, profile_picture_url, house_name, rfid_card_id, biometric_id, wallet_balance, category, created_at)
    VALUES
    
    ('21000001-0000-0000-0000-000000000001', v_tenant_id, v_student_user_id, '35202-1234501-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654301-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-000000000002', v_tenant_id, v_student_user_id, '35202-1234502-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654302-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-000000000003', v_tenant_id, v_student_user_id, '35202-1234503-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654303-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-000000000004', v_tenant_id, v_student_user_id, '35202-1234504-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654304-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-000000000005', v_tenant_id, v_student_user_id, '35202-1234505-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654305-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-000000000006', v_tenant_id, v_student_user_id, '35202-1234506-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654306-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-000000000007', v_tenant_id, v_student_user_id, '35202-1234507-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654307-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-000000000008', v_tenant_id, v_student_user_id, '35202-1234508-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654308-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-000000000009', v_tenant_id, v_student_user_id, '35202-1234509-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654309-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-00000000000a', v_tenant_id, v_student_user_id, '35202-1234510-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654310-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-00000000000b', v_tenant_id, v_student_user_id, '35202-1234511-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654311-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-00000000000c', v_tenant_id, v_student_user_id, '35202-1234512-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654312-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-00000000000d', v_tenant_id, v_student_user_id, '35202-1234513-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654313-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-00000000000e', v_tenant_id, v_student_user_id, '35202-1234514-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654314-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW()),
    ('21000001-0000-0000-0000-00000000000f', v_tenant_id, v_student_user_id, '35202-1234515-1', 'Muhammad', 'Usman', 'Male', '2010-05-14', '2022-04-01', 'ADM-22-01', 'Tariq', '35202-7654315-1', '0306-7000007', 'Lahore', 'B+', true, v_parent_user_id, 'url', 'Jinnah', 'RFID-01', 'BIO-01', 1500.00, 'Normal', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 16. Enrollments
    INSERT INTO public.student_enrollments (id, tenant_id, student_id, academic_year_id, class_id, section_id, roll_number, status, created_at)
    VALUES
    
    ('22000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000002', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000003', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', 'f0000001-0000-0000-0000-000000000004', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', 'f0000001-0000-0000-0000-000000000005', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', 'f0000001-0000-0000-0000-000000000006', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', 'f0000001-0000-0000-0000-000000000007', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', 'f0000001-0000-0000-0000-000000000008', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', 'f0000001-0000-0000-0000-000000000009', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', 'd0000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', 'f0000001-0000-0000-0000-00000000000a', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', 'd0000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', 'f0000001-0000-0000-0000-00000000000b', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', 'd0000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', 'f0000001-0000-0000-0000-00000000000c', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', 'd0000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', 'f0000001-0000-0000-0000-00000000000d', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', 'd0000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', 'f0000001-0000-0000-0000-00000000000e', 101, 'Active', NOW()),
    ('22000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', 'd0000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', 'f0000001-0000-0000-0000-00000000000f', 101, 'Active', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 17. Student Subjects
    INSERT INTO public.student_subjects (id, tenant_id, student_id, class_id, subject_id, is_elective, created_at)
    VALUES
    
    ('23000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000002', true, NOW()),
    ('23000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000003', true, NOW()),
    ('23000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000004', true, NOW()),
    ('23000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000005', true, NOW()),
    ('23000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000006', true, NOW()),
    ('23000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000007', true, NOW()),
    ('23000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000008', true, NOW()),
    ('23000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000009', true, NOW()),
    ('23000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-00000000000a', true, NOW()),
    ('23000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000b', true, NOW()),
    ('23000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000c', true, NOW()),
    ('23000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000d', true, NOW()),
    ('23000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000e', true, NOW()),
    ('23000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000f', true, NOW()),
    ('23000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', '09000001-0000-0000-0000-000000000010', true, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 18. Medical Records
    INSERT INTO public.student_medical_records (id, tenant_id, student_id, allergies, chronic_conditions, vaccination_status, family_medical_history, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, doctor_name, doctor_phone, additional_notes, last_updated)
    VALUES
    
    ('24000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW()),
    ('24000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', 'Peanuts', 'None', 'Fully', 'None', 'Tariq', '0306', 'Father', 'Dr. Shakeel', '0300', 'Notes', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 19. Behavior Logs
    INSERT INTO public.student_behavior_logs (id, tenant_id, student_id, academic_year_id, incident_date, incident_type, points_affected, action_taken, reported_by_user_id)
    VALUES
    
    ('25000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000003', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000004', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000005', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000006', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000007', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000008', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000009', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', 'd0000001-0000-0000-0000-00000000000a', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', 'd0000001-0000-0000-0000-00000000000b', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', 'd0000001-0000-0000-0000-00000000000c', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', 'd0000001-0000-0000-0000-00000000000d', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', 'd0000001-0000-0000-0000-00000000000e', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id),
    ('25000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', 'd0000001-0000-0000-0000-00000000000f', CURRENT_DATE, 'Excellent', 10, 'Appreciation', v_teacher_user_id)
    ON CONFLICT (id) DO NOTHING;

    -- 20. Student Attendance
    INSERT INTO public.student_attendance (id, tenant_id, student_id, academic_year_id, class_id, section_id, date, status, remarks, check_in_time, check_out_time, is_late, is_half_day, fine_amount, created_at)
    VALUES
    
    ('26000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000002', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000003', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', 'f0000001-0000-0000-0000-000000000004', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', 'f0000001-0000-0000-0000-000000000005', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', 'f0000001-0000-0000-0000-000000000006', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', 'f0000001-0000-0000-0000-000000000007', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', 'f0000001-0000-0000-0000-000000000008', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', 'f0000001-0000-0000-0000-000000000009', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', 'd0000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', 'f0000001-0000-0000-0000-00000000000a', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', 'd0000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', 'f0000001-0000-0000-0000-00000000000b', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', 'd0000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', 'f0000001-0000-0000-0000-00000000000c', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', 'd0000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', 'f0000001-0000-0000-0000-00000000000d', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', 'd0000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', 'f0000001-0000-0000-0000-00000000000e', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW()),
    ('26000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', 'd0000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', 'f0000001-0000-0000-0000-00000000000f', CURRENT_DATE, 'Present', 'On time', '07:48:00', '14:00:00', false, false, 0, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 21. Student Subject Attendances (NEW)
    INSERT INTO public.student_subject_attendances (id, tenant_id, student_id, class_id, section_id, subject_id, date, status, remarks, created_at)
    VALUES
    
    ('27000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', '09000001-0000-0000-0000-000000000001', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000002', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000003', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', 'f0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000004', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', 'f0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000005', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', 'f0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000006', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', 'f0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000007', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', 'f0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000008', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', 'f0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000009', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', 'f0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-00000000000a', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', 'f0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000b', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', 'f0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000c', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', 'f0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000d', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', 'f0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000e', CURRENT_DATE, 'Present', 'Attended', NOW()),
    ('27000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', 'f0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000f', CURRENT_DATE, 'Present', 'Attended', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 22. Alumni Profiles
    INSERT INTO public.alumni_profiles (id, tenant_id, student_id, graduation_year, current_occupation, current_organization, higher_education_details)
    VALUES
    
    ('28000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', 2024, 'Engineer', 'Systems', 'FAST'),
    ('28000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', 2024, 'Engineer', 'Systems', 'FAST')
    ON CONFLICT (id) DO NOTHING;

    -- =========================================================================
    -- PHASE 4: LMS, TIMETABLE & ACADEMICS
    -- =========================================================================

    -- 23. Timetable Periods
    INSERT INTO public.timetable_periods (id, tenant_id, academic_year_id, class_id, section_id, subject_id, staff_id, day_of_week, start_time, end_time, room_name, created_at)
    VALUES
    
    ('29000001-0000-0000-0000-000000000001', v_tenant_id, 'd0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', '09000001-0000-0000-0000-000000000001', '12000001-0000-0000-0000-000000000002', 1, '08:00:00', '08:45:00', 'Room 101', NOW()),
    ('29000001-0000-0000-0000-000000000002', v_tenant_id, 'd0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000002', '12000001-0000-0000-0000-000000000003', 1, '08:00:00', '08:45:00', 'Room 102', NOW()),
    ('29000001-0000-0000-0000-000000000003', v_tenant_id, 'd0000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000003', '12000001-0000-0000-0000-000000000004', 1, '08:00:00', '08:45:00', 'Room 103', NOW()),
    ('29000001-0000-0000-0000-000000000004', v_tenant_id, 'd0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', 'f0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000004', '12000001-0000-0000-0000-000000000005', 1, '08:00:00', '08:45:00', 'Room 104', NOW()),
    ('29000001-0000-0000-0000-000000000005', v_tenant_id, 'd0000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', 'f0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000005', '12000001-0000-0000-0000-000000000006', 1, '08:00:00', '08:45:00', 'Room 105', NOW()),
    ('29000001-0000-0000-0000-000000000006', v_tenant_id, 'd0000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', 'f0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000006', '12000001-0000-0000-0000-000000000007', 1, '08:00:00', '08:45:00', 'Room 106', NOW()),
    ('29000001-0000-0000-0000-000000000007', v_tenant_id, 'd0000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', 'f0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000007', '12000001-0000-0000-0000-000000000008', 1, '08:00:00', '08:45:00', 'Room 107', NOW()),
    ('29000001-0000-0000-0000-000000000008', v_tenant_id, 'd0000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', 'f0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000008', '12000001-0000-0000-0000-000000000009', 1, '08:00:00', '08:45:00', 'Room 108', NOW()),
    ('29000001-0000-0000-0000-000000000009', v_tenant_id, 'd0000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', 'f0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000009', '12000001-0000-0000-0000-00000000000a', 1, '08:00:00', '08:45:00', 'Room 109', NOW()),
    ('29000001-0000-0000-0000-00000000000a', v_tenant_id, 'd0000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', 'f0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-00000000000a', '12000001-0000-0000-0000-00000000000b', 1, '08:00:00', '08:45:00', 'Room 110', NOW()),
    ('29000001-0000-0000-0000-00000000000b', v_tenant_id, 'd0000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', 'f0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000b', '12000001-0000-0000-0000-00000000000c', 1, '08:00:00', '08:45:00', 'Room 111', NOW()),
    ('29000001-0000-0000-0000-00000000000c', v_tenant_id, 'd0000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', 'f0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000c', '12000001-0000-0000-0000-00000000000d', 1, '08:00:00', '08:45:00', 'Room 112', NOW()),
    ('29000001-0000-0000-0000-00000000000d', v_tenant_id, 'd0000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', 'f0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000d', '12000001-0000-0000-0000-00000000000e', 1, '08:00:00', '08:45:00', 'Room 113', NOW()),
    ('29000001-0000-0000-0000-00000000000e', v_tenant_id, 'd0000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', 'f0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000e', '12000001-0000-0000-0000-00000000000f', 1, '08:00:00', '08:45:00', 'Room 114', NOW()),
    ('29000001-0000-0000-0000-00000000000f', v_tenant_id, 'd0000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', 'f0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000f', '12000001-0000-0000-0000-000000000010', 1, '08:00:00', '08:45:00', 'Room 115', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 24. Timetable Proxy (NEW)
    INSERT INTO public.timetable_proxy_allocations (id, tenant_id, timetable_period_id, date_of_proxy, absent_staff_id, substitute_staff_id, allocated_by, created_at)
    VALUES
    
    ('30000001-0000-0000-0000-000000000001', v_tenant_id, '29000001-0000-0000-0000-000000000001', CURRENT_DATE, '12000001-0000-0000-0000-000000000002', '12000001-0000-0000-0000-000000000001', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-000000000002', v_tenant_id, '29000001-0000-0000-0000-000000000002', CURRENT_DATE, '12000001-0000-0000-0000-000000000003', '12000001-0000-0000-0000-000000000002', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-000000000003', v_tenant_id, '29000001-0000-0000-0000-000000000003', CURRENT_DATE, '12000001-0000-0000-0000-000000000004', '12000001-0000-0000-0000-000000000003', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-000000000004', v_tenant_id, '29000001-0000-0000-0000-000000000004', CURRENT_DATE, '12000001-0000-0000-0000-000000000005', '12000001-0000-0000-0000-000000000004', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-000000000005', v_tenant_id, '29000001-0000-0000-0000-000000000005', CURRENT_DATE, '12000001-0000-0000-0000-000000000006', '12000001-0000-0000-0000-000000000005', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-000000000006', v_tenant_id, '29000001-0000-0000-0000-000000000006', CURRENT_DATE, '12000001-0000-0000-0000-000000000007', '12000001-0000-0000-0000-000000000006', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-000000000007', v_tenant_id, '29000001-0000-0000-0000-000000000007', CURRENT_DATE, '12000001-0000-0000-0000-000000000008', '12000001-0000-0000-0000-000000000007', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-000000000008', v_tenant_id, '29000001-0000-0000-0000-000000000008', CURRENT_DATE, '12000001-0000-0000-0000-000000000009', '12000001-0000-0000-0000-000000000008', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-000000000009', v_tenant_id, '29000001-0000-0000-0000-000000000009', CURRENT_DATE, '12000001-0000-0000-0000-00000000000a', '12000001-0000-0000-0000-000000000009', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-00000000000a', v_tenant_id, '29000001-0000-0000-0000-00000000000a', CURRENT_DATE, '12000001-0000-0000-0000-00000000000b', '12000001-0000-0000-0000-00000000000a', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-00000000000b', v_tenant_id, '29000001-0000-0000-0000-00000000000b', CURRENT_DATE, '12000001-0000-0000-0000-00000000000c', '12000001-0000-0000-0000-00000000000b', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-00000000000c', v_tenant_id, '29000001-0000-0000-0000-00000000000c', CURRENT_DATE, '12000001-0000-0000-0000-00000000000d', '12000001-0000-0000-0000-00000000000c', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-00000000000d', v_tenant_id, '29000001-0000-0000-0000-00000000000d', CURRENT_DATE, '12000001-0000-0000-0000-00000000000e', '12000001-0000-0000-0000-00000000000d', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-00000000000e', v_tenant_id, '29000001-0000-0000-0000-00000000000e', CURRENT_DATE, '12000001-0000-0000-0000-00000000000f', '12000001-0000-0000-0000-00000000000e', v_admin_user_id, NOW()),
    ('30000001-0000-0000-0000-00000000000f', v_tenant_id, '29000001-0000-0000-0000-00000000000f', CURRENT_DATE, '12000001-0000-0000-0000-000000000010', '12000001-0000-0000-0000-00000000000f', v_admin_user_id, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 25. Lesson Plans
    INSERT INTO public.lesson_plans (id, tenant_id, class_id, subject_id, teacher_id, title, description, target_date, completion_percentage, status, created_at)
    VALUES
    
    ('31000001-0000-0000-0000-000000000001', v_tenant_id, 'e0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000001', '12000001-0000-0000-0000-000000000002', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-000000000002', v_tenant_id, 'e0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000002', '12000001-0000-0000-0000-000000000003', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-000000000003', v_tenant_id, 'e0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000003', '12000001-0000-0000-0000-000000000004', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-000000000004', v_tenant_id, 'e0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000004', '12000001-0000-0000-0000-000000000005', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-000000000005', v_tenant_id, 'e0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000005', '12000001-0000-0000-0000-000000000006', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-000000000006', v_tenant_id, 'e0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000006', '12000001-0000-0000-0000-000000000007', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-000000000007', v_tenant_id, 'e0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000007', '12000001-0000-0000-0000-000000000008', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-000000000008', v_tenant_id, 'e0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000008', '12000001-0000-0000-0000-000000000009', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-000000000009', v_tenant_id, 'e0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-000000000009', '12000001-0000-0000-0000-00000000000a', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-00000000000a', v_tenant_id, 'e0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000a', '12000001-0000-0000-0000-00000000000b', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-00000000000b', v_tenant_id, 'e0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000b', '12000001-0000-0000-0000-00000000000c', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-00000000000c', v_tenant_id, 'e0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000c', '12000001-0000-0000-0000-00000000000d', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-00000000000d', v_tenant_id, 'e0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000d', '12000001-0000-0000-0000-00000000000e', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-00000000000e', v_tenant_id, 'e0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000e', '12000001-0000-0000-0000-00000000000f', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW()),
    ('31000001-0000-0000-0000-00000000000f', v_tenant_id, 'e0000001-0000-0000-0000-000000000010', '09000001-0000-0000-0000-00000000000f', '12000001-0000-0000-0000-000000000010', 'Quadratics', 'Notes', CURRENT_DATE, 100, 'Completed', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 26. Study Materials
    INSERT INTO public.study_materials (id, tenant_id, class_id, subject_id, title, description, material_type, file_url, video_url, uploaded_by, created_at)
    VALUES
    
    ('32000001-0000-0000-0000-000000000001', v_tenant_id, 'e0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000001', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-000000000002', v_tenant_id, 'e0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000002', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-000000000003', v_tenant_id, 'e0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000003', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-000000000004', v_tenant_id, 'e0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000004', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-000000000005', v_tenant_id, 'e0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000005', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-000000000006', v_tenant_id, 'e0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000006', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-000000000007', v_tenant_id, 'e0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000007', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-000000000008', v_tenant_id, 'e0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000008', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-000000000009', v_tenant_id, 'e0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-000000000009', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-00000000000a', v_tenant_id, 'e0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000a', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-00000000000b', v_tenant_id, 'e0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000b', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-00000000000c', v_tenant_id, 'e0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000c', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-00000000000d', v_tenant_id, 'e0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000d', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-00000000000e', v_tenant_id, 'e0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000e', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW()),
    ('32000001-0000-0000-0000-00000000000f', v_tenant_id, 'e0000001-0000-0000-0000-000000000010', '09000001-0000-0000-0000-00000000000f', 'Formula', 'Notes', 'Notes', 'url', NULL, 'Hassan', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 27. Live Classes
    INSERT INTO public.live_classes (id, tenant_id, class_id, subject_id, teacher_id, topic, platform, meeting_link, start_time, duration_minutes, status, created_at)
    VALUES
    
    ('33000001-0000-0000-0000-000000000001', v_tenant_id, 'e0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000001', '12000001-0000-0000-0000-000000000002', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-000000000002', v_tenant_id, 'e0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000002', '12000001-0000-0000-0000-000000000003', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-000000000003', v_tenant_id, 'e0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000003', '12000001-0000-0000-0000-000000000004', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-000000000004', v_tenant_id, 'e0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000004', '12000001-0000-0000-0000-000000000005', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-000000000005', v_tenant_id, 'e0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000005', '12000001-0000-0000-0000-000000000006', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-000000000006', v_tenant_id, 'e0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000006', '12000001-0000-0000-0000-000000000007', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-000000000007', v_tenant_id, 'e0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000007', '12000001-0000-0000-0000-000000000008', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-000000000008', v_tenant_id, 'e0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000008', '12000001-0000-0000-0000-000000000009', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-000000000009', v_tenant_id, 'e0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-000000000009', '12000001-0000-0000-0000-00000000000a', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-00000000000a', v_tenant_id, 'e0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000a', '12000001-0000-0000-0000-00000000000b', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-00000000000b', v_tenant_id, 'e0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000b', '12000001-0000-0000-0000-00000000000c', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-00000000000c', v_tenant_id, 'e0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000c', '12000001-0000-0000-0000-00000000000d', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-00000000000d', v_tenant_id, 'e0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000d', '12000001-0000-0000-0000-00000000000e', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-00000000000e', v_tenant_id, 'e0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000e', '12000001-0000-0000-0000-00000000000f', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW()),
    ('33000001-0000-0000-0000-00000000000f', v_tenant_id, 'e0000001-0000-0000-0000-000000000010', '09000001-0000-0000-0000-00000000000f', '12000001-0000-0000-0000-000000000010', 'Revision', 'Zoom', 'url', CURRENT_DATE + TIME '17:00:00', 45, 'Scheduled', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 28. Homeworks
    INSERT INTO public.homeworks (id, tenant_id, class_id, section_id, subject_id, staff_id, title, description, homework_date, due_date, max_marks, attachment_urls, created_at)
    VALUES
    
    ('34000001-0000-0000-0000-000000000001', v_tenant_id, 'e0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', '09000001-0000-0000-0000-000000000001', '12000001-0000-0000-0000-000000000002', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-000000000002', v_tenant_id, 'e0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000002', '12000001-0000-0000-0000-000000000003', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-000000000003', v_tenant_id, 'e0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000003', '12000001-0000-0000-0000-000000000004', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-000000000004', v_tenant_id, 'e0000001-0000-0000-0000-000000000005', 'f0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000004', '12000001-0000-0000-0000-000000000005', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-000000000005', v_tenant_id, 'e0000001-0000-0000-0000-000000000006', 'f0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000005', '12000001-0000-0000-0000-000000000006', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-000000000006', v_tenant_id, 'e0000001-0000-0000-0000-000000000007', 'f0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000006', '12000001-0000-0000-0000-000000000007', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-000000000007', v_tenant_id, 'e0000001-0000-0000-0000-000000000008', 'f0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000007', '12000001-0000-0000-0000-000000000008', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-000000000008', v_tenant_id, 'e0000001-0000-0000-0000-000000000009', 'f0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000008', '12000001-0000-0000-0000-000000000009', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-000000000009', v_tenant_id, 'e0000001-0000-0000-0000-00000000000a', 'f0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000009', '12000001-0000-0000-0000-00000000000a', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-00000000000a', v_tenant_id, 'e0000001-0000-0000-0000-00000000000b', 'f0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-00000000000a', '12000001-0000-0000-0000-00000000000b', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-00000000000b', v_tenant_id, 'e0000001-0000-0000-0000-00000000000c', 'f0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000b', '12000001-0000-0000-0000-00000000000c', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-00000000000c', v_tenant_id, 'e0000001-0000-0000-0000-00000000000d', 'f0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000c', '12000001-0000-0000-0000-00000000000d', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-00000000000d', v_tenant_id, 'e0000001-0000-0000-0000-00000000000e', 'f0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000d', '12000001-0000-0000-0000-00000000000e', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-00000000000e', v_tenant_id, 'e0000001-0000-0000-0000-00000000000f', 'f0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000e', '12000001-0000-0000-0000-00000000000f', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW()),
    ('34000001-0000-0000-0000-00000000000f', v_tenant_id, 'e0000001-0000-0000-0000-000000000010', 'f0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000f', '12000001-0000-0000-0000-000000000010', 'Chapter 4', 'Solve', CURRENT_DATE, CURRENT_DATE + 2, 20, '[]', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 29. Homework Submissions
    INSERT INTO public.homework_submissions (id, tenant_id, homework_id, student_id, submission_date, status, student_notes, attachment_urls, marks_obtained, teacher_remarks)
    VALUES
    
    ('35000001-0000-0000-0000-000000000001', v_tenant_id, '34000001-0000-0000-0000-000000000001', '21000001-0000-0000-0000-000000000001', NOW(),
    ('35000001-0000-0000-0000-000000000002', v_tenant_id, '34000001-0000-0000-0000-000000000002', '21000001-0000-0000-0000-000000000002', NOW(),
    ('35000001-0000-0000-0000-000000000003', v_tenant_id, '34000001-0000-0000-0000-000000000003', '21000001-0000-0000-0000-000000000003', NOW(),
    ('35000001-0000-0000-0000-000000000004', v_tenant_id, '34000001-0000-0000-0000-000000000004', '21000001-0000-0000-0000-000000000004', NOW(),
    ('35000001-0000-0000-0000-000000000005', v_tenant_id, '34000001-0000-0000-0000-000000000005', '21000001-0000-0000-0000-000000000005', NOW(),
    ('35000001-0000-0000-0000-000000000006', v_tenant_id, '34000001-0000-0000-0000-000000000006', '21000001-0000-0000-0000-000000000006', NOW(),
    ('35000001-0000-0000-0000-000000000007', v_tenant_id, '34000001-0000-0000-0000-000000000007', '21000001-0000-0000-0000-000000000007', NOW(),
    ('35000001-0000-0000-0000-000000000008', v_tenant_id, '34000001-0000-0000-0000-000000000008', '21000001-0000-0000-0000-000000000008', NOW(),
    ('35000001-0000-0000-0000-000000000009', v_tenant_id, '34000001-0000-0000-0000-000000000009', '21000001-0000-0000-0000-000000000009', NOW(),
    ('35000001-0000-0000-0000-00000000000a', v_tenant_id, '34000001-0000-0000-0000-00000000000a', '21000001-0000-0000-0000-00000000000a', NOW(),
    ('35000001-0000-0000-0000-00000000000b', v_tenant_id, '34000001-0000-0000-0000-00000000000b', '21000001-0000-0000-0000-00000000000b', NOW(),
    ('35000001-0000-0000-0000-00000000000c', v_tenant_id, '34000001-0000-0000-0000-00000000000c', '21000001-0000-0000-0000-00000000000c', NOW(),
    ('35000001-0000-0000-0000-00000000000d', v_tenant_id, '34000001-0000-0000-0000-00000000000d', '21000001-0000-0000-0000-00000000000d', NOW(),
    ('35000001-0000-0000-0000-00000000000e', v_tenant_id, '34000001-0000-0000-0000-00000000000e', '21000001-0000-0000-0000-00000000000e', NOW(),
    ('35000001-0000-0000-0000-00000000000f', v_tenant_id, '34000001-0000-0000-0000-00000000000f', '21000001-0000-0000-0000-00000000000f', NOW()
    ON CONFLICT (id) DO NOTHING;

    -- 30. Homework Comments (NEW)
    INSERT INTO public.homework_comments (id, tenant_id, homework_submission_id, user_id, comment_text, created_at)
    VALUES
    
    ('36000001-0000-0000-0000-000000000001', v_tenant_id, '35000001-0000-0000-0000-000000000001', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-000000000002', v_tenant_id, '35000001-0000-0000-0000-000000000002', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-000000000003', v_tenant_id, '35000001-0000-0000-0000-000000000003', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-000000000004', v_tenant_id, '35000001-0000-0000-0000-000000000004', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-000000000005', v_tenant_id, '35000001-0000-0000-0000-000000000005', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-000000000006', v_tenant_id, '35000001-0000-0000-0000-000000000006', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-000000000007', v_tenant_id, '35000001-0000-0000-0000-000000000007', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-000000000008', v_tenant_id, '35000001-0000-0000-0000-000000000008', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-000000000009', v_tenant_id, '35000001-0000-0000-0000-000000000009', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-00000000000a', v_tenant_id, '35000001-0000-0000-0000-00000000000a', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-00000000000b', v_tenant_id, '35000001-0000-0000-0000-00000000000b', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-00000000000c', v_tenant_id, '35000001-0000-0000-0000-00000000000c', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-00000000000d', v_tenant_id, '35000001-0000-0000-0000-00000000000d', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-00000000000e', v_tenant_id, '35000001-0000-0000-0000-00000000000e', v_teacher_user_id, 'Great job!', NOW()),
    ('36000001-0000-0000-0000-00000000000f', v_tenant_id, '35000001-0000-0000-0000-00000000000f', v_teacher_user_id, 'Great job!', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 31. Student Diaries
    INSERT INTO public.student_diaries (id, tenant_id, student_id, class_id, section_id, date, remarks, homework_summary, conduct, created_by, created_at)
    VALUES
    
    ('37000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000002', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000003', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', 'f0000001-0000-0000-0000-000000000004', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', 'f0000001-0000-0000-0000-000000000005', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', 'f0000001-0000-0000-0000-000000000006', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', 'f0000001-0000-0000-0000-000000000007', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', 'f0000001-0000-0000-0000-000000000008', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', 'f0000001-0000-0000-0000-000000000009', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', 'f0000001-0000-0000-0000-00000000000a', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', 'f0000001-0000-0000-0000-00000000000b', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', 'f0000001-0000-0000-0000-00000000000c', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', 'f0000001-0000-0000-0000-00000000000d', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', 'f0000001-0000-0000-0000-00000000000e', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW()),
    ('37000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', 'f0000001-0000-0000-0000-00000000000f', CURRENT_DATE, 'Active', 'Math', 'Excellent', 'Hassan', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 32. House Points
    INSERT INTO public.house_point_logs (id, tenant_id, house_name, student_id, points, reason, awarded_by, created_at)
    VALUES
    
    ('38000001-0000-0000-0000-000000000001', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-000000000001', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-000000000002', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-000000000002', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-000000000003', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-000000000003', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-000000000004', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-000000000004', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-000000000005', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-000000000005', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-000000000006', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-000000000006', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-000000000007', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-000000000007', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-000000000008', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-000000000008', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-000000000009', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-000000000009', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-00000000000a', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-00000000000a', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-00000000000b', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-00000000000b', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-00000000000c', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-00000000000c', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-00000000000d', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-00000000000d', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-00000000000e', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-00000000000e', 25, 'Math', 'Principal', NOW()),
    ('38000001-0000-0000-0000-00000000000f', v_tenant_id, 'Jinnah', '21000001-0000-0000-0000-00000000000f', 25, 'Math', 'Principal', NOW())
    ON CONFLICT (id) DO NOTHING;


    -- =========================================================================
    -- PHASE 5: EXAMINATIONS & CBT
    -- =========================================================================

    -- 33. Grading Scales
    INSERT INTO public.grading_scales (id, tenant_id, grade_name, min_percentage, max_percentage, gpa_point, remarks, is_passing_grade, badge_color, education_level, created_at)
    VALUES
    
    ('39000001-0000-0000-0000-000000000001', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-000000000002', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-000000000003', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-000000000004', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-000000000005', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-000000000006', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-000000000007', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-000000000008', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-000000000009', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-00000000000a', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-00000000000b', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-00000000000c', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-00000000000d', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-00000000000e', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW()),
    ('39000001-0000-0000-0000-00000000000f', v_tenant_id, 'A+', 90, 100, 4.0, 'Out', true, 'green', 'All', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 34. Exam Setups
    INSERT INTO public.exam_setups (id, tenant_id, title, start_date, end_date, status, description, is_locked, weightage_percentage, marks_entry_deadline, academic_session, is_published, created_at)
    VALUES
    
    ('40000001-0000-0000-0000-000000000001', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-000000000002', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-000000000003', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-000000000004', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-000000000005', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-000000000006', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-000000000007', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-000000000008', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-000000000009', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-00000000000a', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-00000000000b', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-00000000000c', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-00000000000d', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-00000000000e', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW()),
    ('40000001-0000-0000-0000-00000000000f', v_tenant_id, 'Mid-Term', '2025-10-15', '2025-10-28', 'Completed', 'Mid', true, 30.00, '2025-11-05', '25', true, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 35. Exam Schedules
    INSERT INTO public.exam_schedules (id, tenant_id, exam_setup_id, class_id, subject_id, exam_date, start_time, end_time, total_marks, passing_marks, room_number, invigilator_name, created_at)
    VALUES
    
    ('41000001-0000-0000-0000-000000000001', v_tenant_id, '40000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000001', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-000000000002', v_tenant_id, '40000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000002', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-000000000003', v_tenant_id, '40000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000003', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-000000000004', v_tenant_id, '40000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000004', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-000000000005', v_tenant_id, '40000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000005', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-000000000006', v_tenant_id, '40000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000006', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-000000000007', v_tenant_id, '40000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000007', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-000000000008', v_tenant_id, '40000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000008', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-000000000009', v_tenant_id, '40000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-000000000009', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-00000000000a', v_tenant_id, '40000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000a', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-00000000000b', v_tenant_id, '40000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000b', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-00000000000c', v_tenant_id, '40000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000c', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-00000000000d', v_tenant_id, '40000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000d', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-00000000000e', v_tenant_id, '40000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000e', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW()),
    ('41000001-0000-0000-0000-00000000000f', v_tenant_id, '40000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', '09000001-0000-0000-0000-00000000000f', '2025-10-15', '09:00:00', '12:00:00', 100.00, 33.00, 'Hall', 'Ayesha', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 36. Exam Marks
    INSERT INTO public.exam_marks (id, tenant_id, exam_setup_id, class_id, subject_id, student_id, theory_marks, practical_marks, assignment_marks, obtained_marks, is_absent, remarks, created_at)
    VALUES
    
    ('42000001-0000-0000-0000-000000000001', v_tenant_id, '40000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000001', '21000001-0000-0000-0000-000000000001', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-000000000002', v_tenant_id, '40000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000002', '21000001-0000-0000-0000-000000000002', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-000000000003', v_tenant_id, '40000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000003', '21000001-0000-0000-0000-000000000003', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-000000000004', v_tenant_id, '40000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000004', '21000001-0000-0000-0000-000000000004', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-000000000005', v_tenant_id, '40000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000005', '21000001-0000-0000-0000-000000000005', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-000000000006', v_tenant_id, '40000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000006', '21000001-0000-0000-0000-000000000006', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-000000000007', v_tenant_id, '40000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000007', '21000001-0000-0000-0000-000000000007', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-000000000008', v_tenant_id, '40000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000008', '21000001-0000-0000-0000-000000000008', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-000000000009', v_tenant_id, '40000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-000000000009', '21000001-0000-0000-0000-000000000009', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-00000000000a', v_tenant_id, '40000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000a', '21000001-0000-0000-0000-00000000000a', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-00000000000b', v_tenant_id, '40000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000b', '21000001-0000-0000-0000-00000000000b', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-00000000000c', v_tenant_id, '40000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000c', '21000001-0000-0000-0000-00000000000c', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-00000000000d', v_tenant_id, '40000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000d', '21000001-0000-0000-0000-00000000000d', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-00000000000e', v_tenant_id, '40000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000e', '21000001-0000-0000-0000-00000000000e', 72, 0, 20, 92, false, 'Good', NOW()),
    ('42000001-0000-0000-0000-00000000000f', v_tenant_id, '40000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', '09000001-0000-0000-0000-00000000000f', '21000001-0000-0000-0000-00000000000f', 72, 0, 20, 92, false, 'Good', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 37. Exam Results
    INSERT INTO public.exam_results (id, tenant_id, exam_setup_id, class_id, student_id, total_max_marks, total_obtained_marks, percentage, grade, gpa, status, remarks, created_at)
    VALUES
    
    ('43000001-0000-0000-0000-000000000001', v_tenant_id, '40000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', '21000001-0000-0000-0000-000000000001', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-000000000002', v_tenant_id, '40000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', '21000001-0000-0000-0000-000000000002', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-000000000003', v_tenant_id, '40000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', '21000001-0000-0000-0000-000000000003', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-000000000004', v_tenant_id, '40000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', '21000001-0000-0000-0000-000000000004', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-000000000005', v_tenant_id, '40000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', '21000001-0000-0000-0000-000000000005', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-000000000006', v_tenant_id, '40000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', '21000001-0000-0000-0000-000000000006', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-000000000007', v_tenant_id, '40000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', '21000001-0000-0000-0000-000000000007', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-000000000008', v_tenant_id, '40000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', '21000001-0000-0000-0000-000000000008', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-000000000009', v_tenant_id, '40000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', '21000001-0000-0000-0000-000000000009', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-00000000000a', v_tenant_id, '40000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', '21000001-0000-0000-0000-00000000000a', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-00000000000b', v_tenant_id, '40000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', '21000001-0000-0000-0000-00000000000b', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-00000000000c', v_tenant_id, '40000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', '21000001-0000-0000-0000-00000000000c', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-00000000000d', v_tenant_id, '40000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', '21000001-0000-0000-0000-00000000000d', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-00000000000e', v_tenant_id, '40000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', '21000001-0000-0000-0000-00000000000e', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW()),
    ('43000001-0000-0000-0000-00000000000f', v_tenant_id, '40000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', '21000001-0000-0000-0000-00000000000f', 500, 458, 91.6, 'A+', 4.0, 'Passed', 'Pos 1', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 38. Question Banks
    INSERT INTO public.question_banks (id, tenant_id, subject_id, class_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, difficulty_level, topic_name, explanation, question_type, created_at)
    VALUES
    
    ('44000001-0000-0000-0000-000000000001', v_tenant_id, '09000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-000000000002', v_tenant_id, '09000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-000000000003', v_tenant_id, '09000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-000000000004', v_tenant_id, '09000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-000000000005', v_tenant_id, '09000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-000000000006', v_tenant_id, '09000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-000000000007', v_tenant_id, '09000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-000000000008', v_tenant_id, '09000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-000000000009', v_tenant_id, '09000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-00000000000a', v_tenant_id, '09000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-00000000000b', v_tenant_id, '09000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-00000000000c', v_tenant_id, '09000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-00000000000d', v_tenant_id, '09000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-00000000000e', v_tenant_id, '09000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW()),
    ('44000001-0000-0000-0000-00000000000f', v_tenant_id, '09000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', 'Formula?', 'A', 'B', 'C', 'D', 'A', 1, 'Easy', 'Algebra', 'Exp', 'MCQ', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 39. Online Exams
    INSERT INTO public.online_exams (id, tenant_id, class_id, section_id, subject_id, exam_setup_id, title, exam_date, duration_minutes, total_marks, passing_marks, shuffle_questions, shuffle_options, is_published, created_at)
    VALUES
    
    ('45000001-0000-0000-0000-000000000001', v_tenant_id, 'e0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', '09000001-0000-0000-0000-000000000001', '40000001-0000-0000-0000-000000000001', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-000000000002', v_tenant_id, 'e0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000002', '09000001-0000-0000-0000-000000000002', '40000001-0000-0000-0000-000000000002', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-000000000003', v_tenant_id, 'e0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000003', '09000001-0000-0000-0000-000000000003', '40000001-0000-0000-0000-000000000003', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-000000000004', v_tenant_id, 'e0000001-0000-0000-0000-000000000005', 'f0000001-0000-0000-0000-000000000004', '09000001-0000-0000-0000-000000000004', '40000001-0000-0000-0000-000000000004', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-000000000005', v_tenant_id, 'e0000001-0000-0000-0000-000000000006', 'f0000001-0000-0000-0000-000000000005', '09000001-0000-0000-0000-000000000005', '40000001-0000-0000-0000-000000000005', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-000000000006', v_tenant_id, 'e0000001-0000-0000-0000-000000000007', 'f0000001-0000-0000-0000-000000000006', '09000001-0000-0000-0000-000000000006', '40000001-0000-0000-0000-000000000006', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-000000000007', v_tenant_id, 'e0000001-0000-0000-0000-000000000008', 'f0000001-0000-0000-0000-000000000007', '09000001-0000-0000-0000-000000000007', '40000001-0000-0000-0000-000000000007', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-000000000008', v_tenant_id, 'e0000001-0000-0000-0000-000000000009', 'f0000001-0000-0000-0000-000000000008', '09000001-0000-0000-0000-000000000008', '40000001-0000-0000-0000-000000000008', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-000000000009', v_tenant_id, 'e0000001-0000-0000-0000-00000000000a', 'f0000001-0000-0000-0000-000000000009', '09000001-0000-0000-0000-000000000009', '40000001-0000-0000-0000-000000000009', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-00000000000a', v_tenant_id, 'e0000001-0000-0000-0000-00000000000b', 'f0000001-0000-0000-0000-00000000000a', '09000001-0000-0000-0000-00000000000a', '40000001-0000-0000-0000-00000000000a', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-00000000000b', v_tenant_id, 'e0000001-0000-0000-0000-00000000000c', 'f0000001-0000-0000-0000-00000000000b', '09000001-0000-0000-0000-00000000000b', '40000001-0000-0000-0000-00000000000b', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-00000000000c', v_tenant_id, 'e0000001-0000-0000-0000-00000000000d', 'f0000001-0000-0000-0000-00000000000c', '09000001-0000-0000-0000-00000000000c', '40000001-0000-0000-0000-00000000000c', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-00000000000d', v_tenant_id, 'e0000001-0000-0000-0000-00000000000e', 'f0000001-0000-0000-0000-00000000000d', '09000001-0000-0000-0000-00000000000d', '40000001-0000-0000-0000-00000000000d', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-00000000000e', v_tenant_id, 'e0000001-0000-0000-0000-00000000000f', 'f0000001-0000-0000-0000-00000000000e', '09000001-0000-0000-0000-00000000000e', '40000001-0000-0000-0000-00000000000e', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW()),
    ('45000001-0000-0000-0000-00000000000f', v_tenant_id, 'e0000001-0000-0000-0000-000000000010', 'f0000001-0000-0000-0000-00000000000f', '09000001-0000-0000-0000-00000000000f', '40000001-0000-0000-0000-00000000000f', 'Speed Test', CURRENT_DATE + 4, 30, 25, 10, true, true, true, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 40. Online Exam Questions
    INSERT INTO public.online_exam_questions (id, online_exam_id, question_bank_id)
    VALUES
    
    ('46000001-0000-0000-0000-000000000001', '45000001-0000-0000-0000-000000000001', '44000001-0000-0000-0000-000000000001'),
    ('46000001-0000-0000-0000-000000000002', '45000001-0000-0000-0000-000000000002', '44000001-0000-0000-0000-000000000002'),
    ('46000001-0000-0000-0000-000000000003', '45000001-0000-0000-0000-000000000003', '44000001-0000-0000-0000-000000000003'),
    ('46000001-0000-0000-0000-000000000004', '45000001-0000-0000-0000-000000000004', '44000001-0000-0000-0000-000000000004'),
    ('46000001-0000-0000-0000-000000000005', '45000001-0000-0000-0000-000000000005', '44000001-0000-0000-0000-000000000005'),
    ('46000001-0000-0000-0000-000000000006', '45000001-0000-0000-0000-000000000006', '44000001-0000-0000-0000-000000000006'),
    ('46000001-0000-0000-0000-000000000007', '45000001-0000-0000-0000-000000000007', '44000001-0000-0000-0000-000000000007'),
    ('46000001-0000-0000-0000-000000000008', '45000001-0000-0000-0000-000000000008', '44000001-0000-0000-0000-000000000008'),
    ('46000001-0000-0000-0000-000000000009', '45000001-0000-0000-0000-000000000009', '44000001-0000-0000-0000-000000000009'),
    ('46000001-0000-0000-0000-00000000000a', '45000001-0000-0000-0000-00000000000a', '44000001-0000-0000-0000-00000000000a'),
    ('46000001-0000-0000-0000-00000000000b', '45000001-0000-0000-0000-00000000000b', '44000001-0000-0000-0000-00000000000b'),
    ('46000001-0000-0000-0000-00000000000c', '45000001-0000-0000-0000-00000000000c', '44000001-0000-0000-0000-00000000000c'),
    ('46000001-0000-0000-0000-00000000000d', '45000001-0000-0000-0000-00000000000d', '44000001-0000-0000-0000-00000000000d'),
    ('46000001-0000-0000-0000-00000000000e', '45000001-0000-0000-0000-00000000000e', '44000001-0000-0000-0000-00000000000e'),
    ('46000001-0000-0000-0000-00000000000f', '45000001-0000-0000-0000-00000000000f', '44000001-0000-0000-0000-00000000000f')
    ON CONFLICT (id) DO NOTHING;

    -- 41. Exam Attempts
    INSERT INTO public.student_exam_attempts (id, tenant_id, online_exam_id, student_id, score, start_time, end_time, is_completed, responses_json)
    VALUES
    
    ('47000001-0000-0000-0000-000000000001', v_tenant_id, '45000001-0000-0000-0000-000000000001', '21000001-0000-0000-0000-000000000001', 24, NOW(),
    ('47000001-0000-0000-0000-000000000002', v_tenant_id, '45000001-0000-0000-0000-000000000002', '21000001-0000-0000-0000-000000000002', 24, NOW(),
    ('47000001-0000-0000-0000-000000000003', v_tenant_id, '45000001-0000-0000-0000-000000000003', '21000001-0000-0000-0000-000000000003', 24, NOW(),
    ('47000001-0000-0000-0000-000000000004', v_tenant_id, '45000001-0000-0000-0000-000000000004', '21000001-0000-0000-0000-000000000004', 24, NOW(),
    ('47000001-0000-0000-0000-000000000005', v_tenant_id, '45000001-0000-0000-0000-000000000005', '21000001-0000-0000-0000-000000000005', 24, NOW(),
    ('47000001-0000-0000-0000-000000000006', v_tenant_id, '45000001-0000-0000-0000-000000000006', '21000001-0000-0000-0000-000000000006', 24, NOW(),
    ('47000001-0000-0000-0000-000000000007', v_tenant_id, '45000001-0000-0000-0000-000000000007', '21000001-0000-0000-0000-000000000007', 24, NOW(),
    ('47000001-0000-0000-0000-000000000008', v_tenant_id, '45000001-0000-0000-0000-000000000008', '21000001-0000-0000-0000-000000000008', 24, NOW(),
    ('47000001-0000-0000-0000-000000000009', v_tenant_id, '45000001-0000-0000-0000-000000000009', '21000001-0000-0000-0000-000000000009', 24, NOW(),
    ('47000001-0000-0000-0000-00000000000a', v_tenant_id, '45000001-0000-0000-0000-00000000000a', '21000001-0000-0000-0000-00000000000a', 24, NOW(),
    ('47000001-0000-0000-0000-00000000000b', v_tenant_id, '45000001-0000-0000-0000-00000000000b', '21000001-0000-0000-0000-00000000000b', 24, NOW(),
    ('47000001-0000-0000-0000-00000000000c', v_tenant_id, '45000001-0000-0000-0000-00000000000c', '21000001-0000-0000-0000-00000000000c', 24, NOW(),
    ('47000001-0000-0000-0000-00000000000d', v_tenant_id, '45000001-0000-0000-0000-00000000000d', '21000001-0000-0000-0000-00000000000d', 24, NOW(),
    ('47000001-0000-0000-0000-00000000000e', v_tenant_id, '45000001-0000-0000-0000-00000000000e', '21000001-0000-0000-0000-00000000000e', 24, NOW(),
    ('47000001-0000-0000-0000-00000000000f', v_tenant_id, '45000001-0000-0000-0000-00000000000f', '21000001-0000-0000-0000-00000000000f', 24, NOW()
    ON CONFLICT (id) DO NOTHING;

    -- =========================================================================
    -- PHASE 6: FINANCE & BILLING
    -- =========================================================================

    -- 42. Fee Types
    INSERT INTO public.fee_types (id, tenant_id, name, description, frequency, is_active, created_at)
    VALUES
    
    ('48000001-0000-0000-0000-000000000001', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-000000000002', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-000000000003', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-000000000004', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-000000000005', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-000000000006', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-000000000007', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-000000000008', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-000000000009', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-00000000000a', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-00000000000b', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-00000000000c', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-00000000000d', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-00000000000e', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW()),
    ('48000001-0000-0000-0000-00000000000f', v_tenant_id, 'Tuition', 'Monthly fee', 'Monthly', true, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 43. Fee Structures
    INSERT INTO public.fee_structures (id, tenant_id, academic_year_id, class_id, fee_type_id, category, amount, created_at)
    VALUES
    
    ('49000001-0000-0000-0000-000000000001', v_tenant_id, 'd0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', '48000001-0000-0000-0000-000000000001', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-000000000002', v_tenant_id, 'd0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', '48000001-0000-0000-0000-000000000002', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-000000000003', v_tenant_id, 'd0000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', '48000001-0000-0000-0000-000000000003', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-000000000004', v_tenant_id, 'd0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', '48000001-0000-0000-0000-000000000004', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-000000000005', v_tenant_id, 'd0000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', '48000001-0000-0000-0000-000000000005', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-000000000006', v_tenant_id, 'd0000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', '48000001-0000-0000-0000-000000000006', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-000000000007', v_tenant_id, 'd0000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', '48000001-0000-0000-0000-000000000007', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-000000000008', v_tenant_id, 'd0000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', '48000001-0000-0000-0000-000000000008', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-000000000009', v_tenant_id, 'd0000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', '48000001-0000-0000-0000-000000000009', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-00000000000a', v_tenant_id, 'd0000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', '48000001-0000-0000-0000-00000000000a', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-00000000000b', v_tenant_id, 'd0000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', '48000001-0000-0000-0000-00000000000b', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-00000000000c', v_tenant_id, 'd0000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', '48000001-0000-0000-0000-00000000000c', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-00000000000d', v_tenant_id, 'd0000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', '48000001-0000-0000-0000-00000000000d', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-00000000000e', v_tenant_id, 'd0000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', '48000001-0000-0000-0000-00000000000e', 'Normal', 12000.00, NOW()),
    ('49000001-0000-0000-0000-00000000000f', v_tenant_id, 'd0000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', '48000001-0000-0000-0000-00000000000f', 'Normal', 12000.00, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 44. Fee Concessions
    INSERT INTO public.fee_concessions (id, tenant_id, student_id, fee_type_id, name, discount_type, discount_value, is_active, created_at)
    VALUES
    
    ('50000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', '48000001-0000-0000-0000-000000000001', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', '48000001-0000-0000-0000-000000000002', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', '48000001-0000-0000-0000-000000000003', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', '48000001-0000-0000-0000-000000000004', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', '48000001-0000-0000-0000-000000000005', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', '48000001-0000-0000-0000-000000000006', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', '48000001-0000-0000-0000-000000000007', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', '48000001-0000-0000-0000-000000000008', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', '48000001-0000-0000-0000-000000000009', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', '48000001-0000-0000-0000-00000000000a', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', '48000001-0000-0000-0000-00000000000b', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', '48000001-0000-0000-0000-00000000000c', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', '48000001-0000-0000-0000-00000000000d', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', '48000001-0000-0000-0000-00000000000e', 'Merit', 'Percentage', 25.00, true, NOW()),
    ('50000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', '48000001-0000-0000-0000-00000000000f', 'Merit', 'Percentage', 25.00, true, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 45. Fee Challans
    INSERT INTO public.fee_challans (id, tenant_id, academic_year_id, student_id, class_id, challan_number, billing_month, issue_date, due_date, total_amount, discount_amount, net_payable, paid_amount, late_fine, status, created_at)
    VALUES
    
    ('51000001-0000-0000-0000-000000000001', v_tenant_id, 'd0000001-0000-0000-0000-000000000001', '21000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', 'CHL-001', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-000000000002', v_tenant_id, 'd0000001-0000-0000-0000-000000000002', '21000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', 'CHL-002', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-000000000003', v_tenant_id, 'd0000001-0000-0000-0000-000000000003', '21000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000004', 'CHL-003', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-000000000004', v_tenant_id, 'd0000001-0000-0000-0000-000000000004', '21000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', 'CHL-004', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-000000000005', v_tenant_id, 'd0000001-0000-0000-0000-000000000005', '21000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000006', 'CHL-005', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-000000000006', v_tenant_id, 'd0000001-0000-0000-0000-000000000006', '21000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000007', 'CHL-006', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-000000000007', v_tenant_id, 'd0000001-0000-0000-0000-000000000007', '21000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000008', 'CHL-007', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-000000000008', v_tenant_id, 'd0000001-0000-0000-0000-000000000008', '21000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000009', 'CHL-008', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-000000000009', v_tenant_id, 'd0000001-0000-0000-0000-000000000009', '21000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-00000000000a', 'CHL-009', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-00000000000a', v_tenant_id, 'd0000001-0000-0000-0000-00000000000a', '21000001-0000-0000-0000-00000000000a', 'e0000001-0000-0000-0000-00000000000b', 'CHL-010', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-00000000000b', v_tenant_id, 'd0000001-0000-0000-0000-00000000000b', '21000001-0000-0000-0000-00000000000b', 'e0000001-0000-0000-0000-00000000000c', 'CHL-011', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-00000000000c', v_tenant_id, 'd0000001-0000-0000-0000-00000000000c', '21000001-0000-0000-0000-00000000000c', 'e0000001-0000-0000-0000-00000000000d', 'CHL-012', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-00000000000d', v_tenant_id, 'd0000001-0000-0000-0000-00000000000d', '21000001-0000-0000-0000-00000000000d', 'e0000001-0000-0000-0000-00000000000e', 'CHL-013', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-00000000000e', v_tenant_id, 'd0000001-0000-0000-0000-00000000000e', '21000001-0000-0000-0000-00000000000e', 'e0000001-0000-0000-0000-00000000000f', 'CHL-014', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW()),
    ('51000001-0000-0000-0000-00000000000f', v_tenant_id, 'd0000001-0000-0000-0000-00000000000f', '21000001-0000-0000-0000-00000000000f', 'e0000001-0000-0000-0000-000000000010', 'CHL-015', '2026-03', '2026-03-01', '2026-03-10', 14500, 0, 14500, 14500, 0, 'Paid', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 46. Fee Challan Details
    INSERT INTO public.fee_challan_details (id, challan_id, fee_type_id, fee_name, base_amount, discount_amount, net_amount)
    VALUES
    
    ('52000001-0000-0000-0000-000000000001', '51000001-0000-0000-0000-000000000001', '48000001-0000-0000-0000-000000000001', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-000000000002', '51000001-0000-0000-0000-000000000002', '48000001-0000-0000-0000-000000000002', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-000000000003', '51000001-0000-0000-0000-000000000003', '48000001-0000-0000-0000-000000000003', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-000000000004', '51000001-0000-0000-0000-000000000004', '48000001-0000-0000-0000-000000000004', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-000000000005', '51000001-0000-0000-0000-000000000005', '48000001-0000-0000-0000-000000000005', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-000000000006', '51000001-0000-0000-0000-000000000006', '48000001-0000-0000-0000-000000000006', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-000000000007', '51000001-0000-0000-0000-000000000007', '48000001-0000-0000-0000-000000000007', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-000000000008', '51000001-0000-0000-0000-000000000008', '48000001-0000-0000-0000-000000000008', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-000000000009', '51000001-0000-0000-0000-000000000009', '48000001-0000-0000-0000-000000000009', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-00000000000a', '51000001-0000-0000-0000-00000000000a', '48000001-0000-0000-0000-00000000000a', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-00000000000b', '51000001-0000-0000-0000-00000000000b', '48000001-0000-0000-0000-00000000000b', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-00000000000c', '51000001-0000-0000-0000-00000000000c', '48000001-0000-0000-0000-00000000000c', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-00000000000d', '51000001-0000-0000-0000-00000000000d', '48000001-0000-0000-0000-00000000000d', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-00000000000e', '51000001-0000-0000-0000-00000000000e', '48000001-0000-0000-0000-00000000000e', 'Tuition', 12000, 0, 12000),
    ('52000001-0000-0000-0000-00000000000f', '51000001-0000-0000-0000-00000000000f', '48000001-0000-0000-0000-00000000000f', 'Tuition', 12000, 0, 12000)
    ON CONFLICT (id) DO NOTHING;

    -- 47. Fee Payments
    INSERT INTO public.fee_payments (id, tenant_id, challan_id, payment_date, amount, payment_method, remarks, receipt_number, received_by_user_id, created_at)
    VALUES
    
    ('53000001-0000-0000-0000-000000000001', v_tenant_id, '51000001-0000-0000-0000-000000000001', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-000000000002', v_tenant_id, '51000001-0000-0000-0000-000000000002', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-000000000003', v_tenant_id, '51000001-0000-0000-0000-000000000003', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-000000000004', v_tenant_id, '51000001-0000-0000-0000-000000000004', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-000000000005', v_tenant_id, '51000001-0000-0000-0000-000000000005', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-000000000006', v_tenant_id, '51000001-0000-0000-0000-000000000006', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-000000000007', v_tenant_id, '51000001-0000-0000-0000-000000000007', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-000000000008', v_tenant_id, '51000001-0000-0000-0000-000000000008', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-000000000009', v_tenant_id, '51000001-0000-0000-0000-000000000009', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-00000000000a', v_tenant_id, '51000001-0000-0000-0000-00000000000a', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-00000000000b', v_tenant_id, '51000001-0000-0000-0000-00000000000b', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-00000000000c', v_tenant_id, '51000001-0000-0000-0000-00000000000c', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-00000000000d', v_tenant_id, '51000001-0000-0000-0000-00000000000d', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-00000000000e', v_tenant_id, '51000001-0000-0000-0000-00000000000e', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW()),
    ('53000001-0000-0000-0000-00000000000f', v_tenant_id, '51000001-0000-0000-0000-00000000000f', '2026-03-05', 14500, 'Bank', 'Paid', 'RCP-001', v_admin_user_id, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 48. Expenses (Linked dynamically to any available chart of accounts)
    INSERT INTO public.school_expenses (id, tenant_id, account_id, category, title, amount, expense_date, description, paid_to, payment_method, receipt_no, approval_status, recorded_by_user_id, created_at)
    (SELECT 
    SELECT '54000001-0000-0000-0000-000000000001', v_tenant_id, id, 'Utilities', 'Bill 0', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000002', v_tenant_id, id, 'Utilities', 'Bill 1', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000003', v_tenant_id, id, 'Utilities', 'Bill 2', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000004', v_tenant_id, id, 'Utilities', 'Bill 3', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000005', v_tenant_id, id, 'Utilities', 'Bill 4', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000006', v_tenant_id, id, 'Utilities', 'Bill 5', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000007', v_tenant_id, id, 'Utilities', 'Bill 6', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000008', v_tenant_id, id, 'Utilities', 'Bill 7', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000009', v_tenant_id, id, 'Utilities', 'Bill 8', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000010', v_tenant_id, id, 'Utilities', 'Bill 9', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000011', v_tenant_id, id, 'Utilities', 'Bill 10', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000012', v_tenant_id, id, 'Utilities', 'Bill 11', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000013', v_tenant_id, id, 'Utilities', 'Bill 12', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000014', v_tenant_id, id, 'Utilities', 'Bill 13', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    UNION ALL
    (SELECT '54000001-0000-0000-0000-000000000015', v_tenant_id, id, 'Utilities', 'Bill 14', 145000, '2026-02-15', 'LESCO', 'LESCO', 'Bank', 'BL-01', 'Approved', v_admin_user_id, NOW() FROM public.chart_of_accounts LIMIT 1)
    ON CONFLICT (id) DO NOTHING;

    -- =========================================================================
    -- PHASE 7: FACILITIES & LOGISTICS
    -- =========================================================================

    -- 49. Transport
    INSERT INTO public.transport_vehicles (id, tenant_id, vehicle_number, vehicle_type, model, capacity, driver_name, driver_phone, driver_license_number, is_active, created_at)
    VALUES
    
    ('55000001-0000-0000-0000-000000000001', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-000000000002', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-000000000003', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-000000000004', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-000000000005', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-000000000006', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-000000000007', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-000000000008', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-000000000009', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-00000000000a', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-00000000000b', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-00000000000c', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-00000000000d', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-00000000000e', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW()),
    ('55000001-0000-0000-0000-00000000000f', v_tenant_id, 'LEG-01', 'Bus', 'Toyota', 32, 'Riaz', '0300', 'LIC-01', true, NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.transport_routes (id, tenant_id, route_name, start_point, end_point, stops, monthly_fee, vehicle_id, is_active, created_at)
    VALUES
    
    ('56000001-0000-0000-0000-000000000001', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-000000000001', true, NOW()),
    ('56000001-0000-0000-0000-000000000002', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-000000000002', true, NOW()),
    ('56000001-0000-0000-0000-000000000003', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-000000000003', true, NOW()),
    ('56000001-0000-0000-0000-000000000004', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-000000000004', true, NOW()),
    ('56000001-0000-0000-0000-000000000005', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-000000000005', true, NOW()),
    ('56000001-0000-0000-0000-000000000006', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-000000000006', true, NOW()),
    ('56000001-0000-0000-0000-000000000007', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-000000000007', true, NOW()),
    ('56000001-0000-0000-0000-000000000008', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-000000000008', true, NOW()),
    ('56000001-0000-0000-0000-000000000009', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-000000000009', true, NOW()),
    ('56000001-0000-0000-0000-00000000000a', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-00000000000a', true, NOW()),
    ('56000001-0000-0000-0000-00000000000b', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-00000000000b', true, NOW()),
    ('56000001-0000-0000-0000-00000000000c', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-00000000000c', true, NOW()),
    ('56000001-0000-0000-0000-00000000000d', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-00000000000d', true, NOW()),
    ('56000001-0000-0000-0000-00000000000e', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-00000000000e', true, NOW()),
    ('56000001-0000-0000-0000-00000000000f', v_tenant_id, 'Route 1', 'DHA', 'School', 'Stops', 4500, '55000001-0000-0000-0000-00000000000f', true, NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.student_transports (id, tenant_id, student_id, route_id, pickup_point, start_date, status, created_at)
    VALUES
    
    ('57000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', '56000001-0000-0000-0000-000000000001', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', '56000001-0000-0000-0000-000000000002', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', '56000001-0000-0000-0000-000000000003', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', '56000001-0000-0000-0000-000000000004', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', '56000001-0000-0000-0000-000000000005', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', '56000001-0000-0000-0000-000000000006', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', '56000001-0000-0000-0000-000000000007', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', '56000001-0000-0000-0000-000000000008', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', '56000001-0000-0000-0000-000000000009', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', '56000001-0000-0000-0000-00000000000a', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', '56000001-0000-0000-0000-00000000000b', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', '56000001-0000-0000-0000-00000000000c', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', '56000001-0000-0000-0000-00000000000d', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', '56000001-0000-0000-0000-00000000000e', 'Stop', '2025-04-01', 'Active', NOW()),
    ('57000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', '56000001-0000-0000-0000-00000000000f', 'Stop', '2025-04-01', 'Active', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 50. Hostels
    INSERT INTO public.hostel_rooms (id, tenant_id, room_number, room_type, capacity, monthly_fee, is_available, description, created_at)
    VALUES
    
    ('58000001-0000-0000-0000-000000000001', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-000000000002', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-000000000003', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-000000000004', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-000000000005', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-000000000006', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-000000000007', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-000000000008', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-000000000009', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-00000000000a', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-00000000000b', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-00000000000c', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-00000000000d', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-00000000000e', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW()),
    ('58000001-0000-0000-0000-00000000000f', v_tenant_id, 'R101', 'Double', 2, 18000, true, 'AC', NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.hostel_allocations (id, tenant_id, student_id, room_id, allocation_date, status, remarks, created_at)
    VALUES
    
    ('59000001-0000-0000-0000-000000000001', v_tenant_id, '21000001-0000-0000-0000-000000000001', '58000001-0000-0000-0000-000000000001', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-000000000002', v_tenant_id, '21000001-0000-0000-0000-000000000002', '58000001-0000-0000-0000-000000000002', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-000000000003', v_tenant_id, '21000001-0000-0000-0000-000000000003', '58000001-0000-0000-0000-000000000003', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-000000000004', v_tenant_id, '21000001-0000-0000-0000-000000000004', '58000001-0000-0000-0000-000000000004', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-000000000005', v_tenant_id, '21000001-0000-0000-0000-000000000005', '58000001-0000-0000-0000-000000000005', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-000000000006', v_tenant_id, '21000001-0000-0000-0000-000000000006', '58000001-0000-0000-0000-000000000006', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-000000000007', v_tenant_id, '21000001-0000-0000-0000-000000000007', '58000001-0000-0000-0000-000000000007', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-000000000008', v_tenant_id, '21000001-0000-0000-0000-000000000008', '58000001-0000-0000-0000-000000000008', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-000000000009', v_tenant_id, '21000001-0000-0000-0000-000000000009', '58000001-0000-0000-0000-000000000009', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-00000000000a', v_tenant_id, '21000001-0000-0000-0000-00000000000a', '58000001-0000-0000-0000-00000000000a', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-00000000000b', v_tenant_id, '21000001-0000-0000-0000-00000000000b', '58000001-0000-0000-0000-00000000000b', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-00000000000c', v_tenant_id, '21000001-0000-0000-0000-00000000000c', '58000001-0000-0000-0000-00000000000c', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-00000000000d', v_tenant_id, '21000001-0000-0000-0000-00000000000d', '58000001-0000-0000-0000-00000000000d', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-00000000000e', v_tenant_id, '21000001-0000-0000-0000-00000000000e', '58000001-0000-0000-0000-00000000000e', '2025-04-01', 'Active', 'Bed 1', NOW()),
    ('59000001-0000-0000-0000-00000000000f', v_tenant_id, '21000001-0000-0000-0000-00000000000f', '58000001-0000-0000-0000-00000000000f', '2025-04-01', 'Active', 'Bed 1', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 51. Inventory
    INSERT INTO public.inventory_items (id, tenant_id, item_name, category, description, quantity, reorder_level, unit, unit_price, supplier_name, location, created_at)
    VALUES
    
    ('60000001-0000-0000-0000-000000000001', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-000000000002', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-000000000003', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-000000000004', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-000000000005', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-000000000006', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-000000000007', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-000000000008', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-000000000009', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-00000000000a', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-00000000000b', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-00000000000c', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-00000000000d', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-00000000000e', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW()),
    ('60000001-0000-0000-0000-00000000000f', v_tenant_id, 'Markers', 'Stat', 'Marker', 150, 20, 'Box', 650, 'Supplier', 'A1', NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.inventory_transactions (id, tenant_id, item_id, transaction_type, quantity, issued_to, purpose, reference_number, transaction_date, remarks, created_at)
    VALUES
    
    ('61000001-0000-0000-0000-000000000001', v_tenant_id, '60000001-0000-0000-0000-000000000001', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-000000000002', v_tenant_id, '60000001-0000-0000-0000-000000000002', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-000000000003', v_tenant_id, '60000001-0000-0000-0000-000000000003', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-000000000004', v_tenant_id, '60000001-0000-0000-0000-000000000004', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-000000000005', v_tenant_id, '60000001-0000-0000-0000-000000000005', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-000000000006', v_tenant_id, '60000001-0000-0000-0000-000000000006', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-000000000007', v_tenant_id, '60000001-0000-0000-0000-000000000007', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-000000000008', v_tenant_id, '60000001-0000-0000-0000-000000000008', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-000000000009', v_tenant_id, '60000001-0000-0000-0000-000000000009', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-00000000000a', v_tenant_id, '60000001-0000-0000-0000-00000000000a', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-00000000000b', v_tenant_id, '60000001-0000-0000-0000-00000000000b', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-00000000000c', v_tenant_id, '60000001-0000-0000-0000-00000000000c', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-00000000000d', v_tenant_id, '60000001-0000-0000-0000-00000000000d', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-00000000000e', v_tenant_id, '60000001-0000-0000-0000-00000000000e', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW()),
    ('61000001-0000-0000-0000-00000000000f', v_tenant_id, '60000001-0000-0000-0000-00000000000f', 'Purchase', 100, NULL, 'Bulk', 'PO-1', CURRENT_DATE, 'Recv', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 52. Library
    INSERT INTO public.library_books (id, tenant_id, title, author, isbn, publisher, publication_year, category, shelf_location, total_copies, available_copies, price, created_at)
    VALUES
    
    ('62000001-0000-0000-0000-000000000001', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-000000000002', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-000000000003', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-000000000004', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-000000000005', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-000000000006', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-000000000007', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-000000000008', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-000000000009', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-00000000000a', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-00000000000b', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-00000000000c', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-00000000000d', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-00000000000e', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW()),
    ('62000001-0000-0000-0000-00000000000f', v_tenant_id, 'Calculus', 'Thomas', 'ISBN1', 'Pearson', 2021, 'Math', 'M01', 10, 8, 3500, NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.book_issuances (id, tenant_id, book_id, student_id, staff_id, borrower_type, issue_date, due_date, status, fine_amount, remarks, created_at)
    VALUES
    
    ('63000001-0000-0000-0000-000000000001', v_tenant_id, '62000001-0000-0000-0000-000000000001', '21000001-0000-0000-0000-000000000001', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-000000000002', v_tenant_id, '62000001-0000-0000-0000-000000000002', '21000001-0000-0000-0000-000000000002', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-000000000003', v_tenant_id, '62000001-0000-0000-0000-000000000003', '21000001-0000-0000-0000-000000000003', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-000000000004', v_tenant_id, '62000001-0000-0000-0000-000000000004', '21000001-0000-0000-0000-000000000004', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-000000000005', v_tenant_id, '62000001-0000-0000-0000-000000000005', '21000001-0000-0000-0000-000000000005', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-000000000006', v_tenant_id, '62000001-0000-0000-0000-000000000006', '21000001-0000-0000-0000-000000000006', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-000000000007', v_tenant_id, '62000001-0000-0000-0000-000000000007', '21000001-0000-0000-0000-000000000007', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-000000000008', v_tenant_id, '62000001-0000-0000-0000-000000000008', '21000001-0000-0000-0000-000000000008', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-000000000009', v_tenant_id, '62000001-0000-0000-0000-000000000009', '21000001-0000-0000-0000-000000000009', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-00000000000a', v_tenant_id, '62000001-0000-0000-0000-00000000000a', '21000001-0000-0000-0000-00000000000a', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-00000000000b', v_tenant_id, '62000001-0000-0000-0000-00000000000b', '21000001-0000-0000-0000-00000000000b', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-00000000000c', v_tenant_id, '62000001-0000-0000-0000-00000000000c', '21000001-0000-0000-0000-00000000000c', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-00000000000d', v_tenant_id, '62000001-0000-0000-0000-00000000000d', '21000001-0000-0000-0000-00000000000d', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-00000000000e', v_tenant_id, '62000001-0000-0000-0000-00000000000e', '21000001-0000-0000-0000-00000000000e', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW()),
    ('63000001-0000-0000-0000-00000000000f', v_tenant_id, '62000001-0000-0000-0000-00000000000f', '21000001-0000-0000-0000-00000000000f', NULL, 'Student', CURRENT_DATE, CURRENT_DATE + 7, 'Issued', 0, 'Iss', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- =========================================================================
    -- PHASE 8: FRONT OFFICE & ENGAGEMENT
    -- =========================================================================

    -- 53. Visitors
    INSERT INTO public.visitors (id, tenant_id, visitor_name, phone_number, purpose, host_name, host_department, vehicle_number, id_card_type, id_card_number, status, check_in_time, remarks, created_at)
    VALUES
    
    ('64000001-0000-0000-0000-000000000001', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-000000000002', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-000000000003', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-000000000004', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-000000000005', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-000000000006', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-000000000007', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-000000000008', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-000000000009', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-00000000000a', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-00000000000b', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-00000000000c', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-00000000000d', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-00000000000e', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW(),
    ('64000001-0000-0000-0000-00000000000f', v_tenant_id, 'Visitor 1', '0300', 'Meet', 'Admin', 'HR', 'LE-1', 'CNIC', '352', 'In', NOW()
    ON CONFLICT (id) DO NOTHING;

    -- 54. PTM
    INSERT INTO public.ptm_slots (id, tenant_id, teacher_id, teacher_name, meeting_date, start_time, end_time, is_booked, booked_by_parent_name, booked_by_student_name, meeting_notes, created_at)
    VALUES
    
    ('65000001-0000-0000-0000-000000000001', v_tenant_id, '12000001-0000-0000-0000-000000000002', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-000000000002', v_tenant_id, '12000001-0000-0000-0000-000000000003', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-000000000003', v_tenant_id, '12000001-0000-0000-0000-000000000004', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-000000000004', v_tenant_id, '12000001-0000-0000-0000-000000000005', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-000000000005', v_tenant_id, '12000001-0000-0000-0000-000000000006', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-000000000006', v_tenant_id, '12000001-0000-0000-0000-000000000007', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-000000000007', v_tenant_id, '12000001-0000-0000-0000-000000000008', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-000000000008', v_tenant_id, '12000001-0000-0000-0000-000000000009', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-000000000009', v_tenant_id, '12000001-0000-0000-0000-00000000000a', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-00000000000a', v_tenant_id, '12000001-0000-0000-0000-00000000000b', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-00000000000b', v_tenant_id, '12000001-0000-0000-0000-00000000000c', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-00000000000c', v_tenant_id, '12000001-0000-0000-0000-00000000000d', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-00000000000d', v_tenant_id, '12000001-0000-0000-0000-00000000000e', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-00000000000e', v_tenant_id, '12000001-0000-0000-0000-00000000000f', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW()),
    ('65000001-0000-0000-0000-00000000000f', v_tenant_id, '12000001-0000-0000-0000-000000000010', 'Hassan', CURRENT_DATE, '10:00:00', '10:15:00', true, 'Tariq', 'Usman', 'Notes', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 55. Notices
    INSERT INTO public.notices (id, tenant_id, posted_by_user_id, title, content, category, target_audience, attachment_url, posted_by, is_active, published_at, created_at, expires_at)
    VALUES
    
    ('66000001-0000-0000-0000-000000000001', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-000000000002', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-000000000003', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-000000000004', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-000000000005', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-000000000006', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-000000000007', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-000000000008', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-000000000009', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-00000000000a', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-00000000000b', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-00000000000c', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-00000000000d', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-00000000000e', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW(),
    ('66000001-0000-0000-0000-00000000000f', v_tenant_id, v_admin_user_id, 'Sports Gala', 'Join us', 'Sports', 'All', 'url', 'Admin', true, NOW()
    ON CONFLICT (id) DO NOTHING;

    -- 56. Helpdesk
    INSERT INTO public.helpdesk_tickets (id, tenant_id, ticket_number, raised_by_name, raised_by_role, category, subject, description, priority, status, resolution_remarks, created_at)
    VALUES
    
    ('67000001-0000-0000-0000-000000000001', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-000000000002', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-000000000003', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-000000000004', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-000000000005', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-000000000006', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-000000000007', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-000000000008', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-000000000009', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-00000000000a', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-00000000000b', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-00000000000c', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-00000000000d', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-00000000000e', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW()),
    ('67000001-0000-0000-0000-00000000000f', v_tenant_id, 'TK-01', 'Tariq', 'Parent', 'IT', 'Issue', 'Desc', 'High', 'Resolved', 'Done', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 57. Feedback
    INSERT INTO public.feedback_suggestions (id, tenant_id, is_anonymous, submitted_by_name, category, subject, feedback_text, admin_response, status, created_at)
    VALUES
    
    ('68000001-0000-0000-0000-000000000001', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-000000000002', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-000000000003', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-000000000004', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-000000000005', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-000000000006', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-000000000007', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-000000000008', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-000000000009', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-00000000000a', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-00000000000b', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-00000000000c', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-00000000000d', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-00000000000e', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW()),
    ('68000001-0000-0000-0000-00000000000f', v_tenant_id, true, NULL, 'Infra', 'Water', 'Need water', 'Approved', 'Taken', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 58. Events
    INSERT INTO public.event_calendar_items (id, tenant_id, title, event_type, start_date, end_date, location, description, created_at)
    VALUES
    
    ('69000001-0000-0000-0000-000000000001', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-000000000002', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-000000000003', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-000000000004', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-000000000005', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-000000000006', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-000000000007', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-000000000008', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-000000000009', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-00000000000a', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-00000000000b', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-00000000000c', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-00000000000d', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-00000000000e', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW()),
    ('69000001-0000-0000-0000-00000000000f', v_tenant_id, 'Science Ex', 'Academic', CURRENT_DATE, CURRENT_DATE + 2, 'Hall', 'Ex', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 59. Holidays
    INSERT INTO public.holidays (id, tenant_id, name, start_date, end_date, is_active, created_at)
    VALUES
    
    ('70000001-0000-0000-0000-000000000001', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-000000000002', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-000000000003', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-000000000004', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-000000000005', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-000000000006', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-000000000007', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-000000000008', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-000000000009', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-00000000000a', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-00000000000b', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-00000000000c', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-00000000000d', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-00000000000e', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW()),
    ('70000001-0000-0000-0000-00000000000f', v_tenant_id, 'Eid', CURRENT_DATE + 30, CURRENT_DATE + 33, true, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 60. Notifications (NEW)
    INSERT INTO public.notifications (id, tenant_id, user_id, title, message, is_read, type, related_entity_id, created_at)
    VALUES
    
    ('71000001-0000-0000-0000-000000000001', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-000000000001', NOW()),
    ('71000001-0000-0000-0000-000000000002', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-000000000002', NOW()),
    ('71000001-0000-0000-0000-000000000003', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-000000000003', NOW()),
    ('71000001-0000-0000-0000-000000000004', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-000000000004', NOW()),
    ('71000001-0000-0000-0000-000000000005', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-000000000005', NOW()),
    ('71000001-0000-0000-0000-000000000006', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-000000000006', NOW()),
    ('71000001-0000-0000-0000-000000000007', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-000000000007', NOW()),
    ('71000001-0000-0000-0000-000000000008', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-000000000008', NOW()),
    ('71000001-0000-0000-0000-000000000009', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-000000000009', NOW()),
    ('71000001-0000-0000-0000-00000000000a', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-00000000000a', NOW()),
    ('71000001-0000-0000-0000-00000000000b', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-00000000000b', NOW()),
    ('71000001-0000-0000-0000-00000000000c', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-00000000000c', NOW()),
    ('71000001-0000-0000-0000-00000000000d', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-00000000000d', NOW()),
    ('71000001-0000-0000-0000-00000000000e', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-00000000000e', NOW()),
    ('71000001-0000-0000-0000-00000000000f', v_tenant_id, v_teacher_user_id, 'New Leave App', 'Leave application submitted by Staff', false, 'System', '14000001-0000-0000-0000-00000000000f', NOW())
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE '=======================================================';
    RAISE NOTICE '✅ SMS Operational Seed Complete! Screens ready for tenant: %', v_tenant_id;
    RAISE NOTICE '=======================================================';
END $$;
