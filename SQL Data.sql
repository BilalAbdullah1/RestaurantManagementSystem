-- ==============================================================================
-- ENTERPRISE SCHOOL MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA & SEED DATA
-- Target Engine: PostgreSQL
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. DDL: TABLE CREATION (Ordered by Dependencies)
-- ==========================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_name VARCHAR(255) NOT NULL,
    school_code VARCHAR(50) NOT NULL UNIQUE,     -- Login aur identification ke liye clean code (e.g., 'APS01')
    subdomain VARCHAR(100) NULL UNIQUE,         -- Agar multi-domain configuration karni ho
    
    -- School Profile Fields
    phone VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    address TEXT NULL,
    principal_name VARCHAR(100) NULL,
    registration_no VARCHAR(100) NULL,          -- Govt ya board registration number
    website VARCHAR(150) NULL,
    
    -- Update Logo Field
    logo_url TEXT NULL,                         -- Logo image file ka uploaded path save karne ke liye
    
    -- General / School Settings
    currency VARCHAR(10) DEFAULT 'PKR',         -- Default currency (PKR, USD etc.)
    fiscal_year_start VARCHAR(10) DEFAULT '04-01', -- Academic/Fiscal year start date configuration (MM-DD format)
    
    -- System Status & Meta
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    module_name VARCHAR(50) NOT NULL
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_role UNIQUE (tenant_id, name)
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    phone_number VARCHAR(20) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    refresh_token TEXT NULL,
    refresh_token_expiry TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_email UNIQUE (tenant_id, email)
);

CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_academic_year UNIQUE (tenant_id, title)
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_class UNIQUE (tenant_id, name)
);

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    room_number VARCHAR(50) NULL,
    max_capacity INT DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_class_section UNIQUE (class_id, name)
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NULL,
    is_elective BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_tenant_subject UNIQUE (tenant_id, name)
);

CREATE TABLE class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    passing_marks DECIMAL(5,2) NOT NULL DEFAULT 33.00,
    total_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    CONSTRAINT unique_class_subject_combination UNIQUE (class_id, subject_id)
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    b_form_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    admission_date DATE NOT NULL,
    admission_number VARCHAR(100) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    father_cnic VARCHAR(20) NOT NULL,
    guardian_phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    blood_group VARCHAR(10) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_admission UNIQUE (tenant_id, admission_number),
    CONSTRAINT unique_tenant_bform UNIQUE (tenant_id, b_form_number)
);

CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    section_id UUID NOT NULL REFERENCES sections(id),
    roll_number INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_enrollment_roll UNIQUE (academic_year_id, class_id, section_id, roll_number),
    CONSTRAINT unique_student_year_enroll UNIQUE (student_id, academic_year_id)
);

CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cnic VARCHAR(20) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    basic_salary DECIMAL(18,2) NOT NULL,
    joining_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_tenant_staff_cnic UNIQUE (tenant_id, cnic)
);

CREATE TABLE student_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_daily_attendance UNIQUE (student_id, date)
);

CREATE TABLE staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE NULL,
    check_out TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT unique_staff_daily_attendance UNIQUE (staff_id, date)
);

CREATE TABLE exam_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT unique_tenant_exam_type UNIQUE (tenant_id, name)
);

CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    exam_type_id UUID NOT NULL REFERENCES exam_types(id),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    passing_marks DECIMAL(5,2) NOT NULL
);

CREATE TABLE student_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    obtained_marks DECIMAL(5,2) NOT NULL,
    is_absent BOOLEAN DEFAULT FALSE,
    remarks TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_exam_marks UNIQUE (exam_id, student_id)
);

CREATE TABLE grading_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    grade_name VARCHAR(10) NOT NULL,
    min_percentage DECIMAL(5,2) NOT NULL,
    max_percentage DECIMAL(5,2) NOT NULL,
    gpa DECIMAL(3,2) NOT NULL,
    remarks VARCHAR(100) NULL,
    CONSTRAINT unique_tenant_grade UNIQUE (tenant_id, grade_name)
);

CREATE TABLE fee_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT unique_tenant_fee_type UNIQUE (tenant_id, name)
);

CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    category VARCHAR(100) DEFAULT 'Normal',
    amount DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_fee_structure_matrix UNIQUE (academic_year_id, class_id, fee_type_id, category)
);

CREATE TABLE fee_challans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    challan_number VARCHAR(100) NOT NULL,
    billing_month INT NOT NULL,
    billing_year INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Unpaid',
    payment_date TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_challan_num UNIQUE (tenant_id, challan_number),
    CONSTRAINT unique_student_monthly_bill UNIQUE (student_id, billing_month, billing_year)
);

CREATE TABLE fee_challan_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challan_id UUID NOT NULL REFERENCES fee_challans(id) ON DELETE CASCADE,
    fee_type_id UUID NOT NULL REFERENCES fee_types(id),
    amount DECIMAL(18,2) NOT NULL
);

CREATE TABLE salary_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id),
    salary_month INT NOT NULL,
    salary_year INT NOT NULL,
    basic_salary DECIMAL(18,2) NOT NULL,
    allowances DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    deductions DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    net_salary DECIMAL(18,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Unpaid',
    payment_date TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_staff_monthly_salary UNIQUE (staff_id, salary_month, salary_year)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transport_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    route_name VARCHAR(150) NOT NULL,
    start_point VARCHAR(255) NOT NULL,
    end_point VARCHAR(255) NOT NULL,
    monthly_charges DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT unique_tenant_route UNIQUE (tenant_id, route_name)
);

CREATE TABLE transport_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(100) NULL,
    capacity INT NOT NULL DEFAULT 30,
    driver_name VARCHAR(150) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    driver_license VARCHAR(50) NOT NULL,
    CONSTRAINT unique_tenant_vehicle UNIQUE (tenant_id, vehicle_number)
);

CREATE TABLE student_transport (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES transport_routes(id),
    vehicle_id UUID NOT NULL REFERENCES transport_vehicles(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    assigned_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_student_transport_year UNIQUE (student_id, academic_year_id)
);

CREATE TABLE library_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255) NULL,
    rack_number VARCHAR(50) NULL,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    CONSTRAINT unique_tenant_book_isbn UNIQUE (tenant_id, isbn)
);

CREATE TABLE library_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    fine_amount DECIMAL(18,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Issued'
);

CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    CONSTRAINT unique_tenant_inv_cat UNIQUE (tenant_id, category_name)
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES inventory_categories(id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NULL,
    unit_price DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0,
    CONSTRAINT unique_tenant_item_sku UNIQUE (tenant_id, sku)
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    referenced_user_id UUID NULL REFERENCES users(id),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT NULL
);

CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    CONSTRAINT unique_tenant_exp_cat UNIQUE (tenant_id, category_name)
);

CREATE TABLE school_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category VARCHAR(100) DEFAULT 'General',
    title VARCHAR(255) DEFAULT 'Expense Voucher',
    amount DECIMAL(18,2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT NULL,
    paid_to VARCHAR(255) NULL,
    payment_method VARCHAR(100) DEFAULT 'Petty Cash Vault',
    receipt_no VARCHAR(100) NULL,
    receipt_image_url TEXT NULL,
    approval_status VARCHAR(50) DEFAULT 'Approved',
    recorded_by_user_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recipient_phone VARCHAR(20) NOT NULL,
    message_body TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'Pending',
    gateway_response TEXT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fee_concessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(18,2) NOT NULL,
    CONSTRAINT unique_tenant_concession UNIQUE (tenant_id, name)
);

CREATE TABLE student_concessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fee_concession_id UUID NOT NULL REFERENCES fee_concessions(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    CONSTRAINT unique_student_concession_year UNIQUE (student_id, academic_year_id)
);

CREATE TABLE admission_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    child_name VARCHAR(100) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id),
    status VARCHAR(50) DEFAULT 'Enquiry',
    remarks TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    hostel_type VARCHAR(50) NOT NULL,
    address TEXT NULL
);

CREATE TABLE hostel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    monthly_rent DECIMAL(18,2) NOT NULL,
    CONSTRAINT unique_hostel_room UNIQUE (hostel_id, room_number)
);

CREATE TABLE hostel_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    allocated_date DATE NOT NULL,
    vacated_date DATE NULL
);

CREATE TABLE visitor_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    visitor_name VARCHAR(150) NOT NULL,
    cnic VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    purpose TEXT NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE student_behavior_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    incident_date DATE NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    points_affected INT DEFAULT 0,
    action_taken TEXT NOT NULL,
    reported_by_user_id UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE ptm_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE ptm_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID NOT NULL REFERENCES ptm_slots(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_user_id UUID NOT NULL REFERENCES users(id),
    teacher_user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Scheduled',
    parent_feedback TEXT NULL,
    teacher_notes TEXT NULL
);

CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_name VARCHAR(150) NOT NULL,
    content_body TEXT NOT NULL
);

CREATE TABLE issued_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES certificate_templates(id),
    certificate_number VARCHAR(100) NOT NULL,
    issued_date DATE NOT NULL,
    issued_by_user_id UUID NOT NULL REFERENCES users(id),
    CONSTRAINT unique_tenant_cert_num UNIQUE (tenant_id, certificate_number)
);

CREATE TABLE alumni_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    graduation_year INT NOT NULL,
    current_occupation VARCHAR(255) NULL,
    current_organization VARCHAR(255) NULL,
    higher_education_details TEXT NULL
);

-- ==========================================
-- 2. DML: SEED DATA INSERTION
-- Using subqueries to ensure valid UUID linking
-- ==========================================

-- 1. Tenants
INSERT INTO tenants (school_name, subdomain, is_active, settings) 
VALUES ('The Smart School', 'tss', TRUE, '{"currency": "PKR", "timezone": "Asia/Karachi"}');

-- 2. Permissions (System Wide)
INSERT INTO permissions (name, description, module_name) VALUES 
('manage_users', 'Can manage system users', 'Security'),
('view_finance', 'Can view financial reports', 'Finance');

-- 3. Roles
INSERT INTO roles (tenant_id, name, is_system_role) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Super Admin', TRUE),
       ((SELECT id FROM tenants LIMIT 1), 'Teacher', FALSE);

-- 4. Role Permissions
INSERT INTO role_permissions (role_id, permission_id) 
VALUES ((SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1), (SELECT id FROM permissions WHERE name = 'manage_users' LIMIT 1)),
       ((SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1), (SELECT id FROM permissions WHERE name = 'view_finance' LIMIT 1));

-- 5. Users
INSERT INTO users (tenant_id, role_id, first_name, last_name, email, password_hash, phone_number) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1), 'John', 'Doe', 'admin@tss.edu.pk', 'hashed_password_string_here', '03001234567');

-- 6. Academic Years
INSERT INTO academic_years (tenant_id, title, start_date, end_date, is_current) 
VALUES ((SELECT id FROM tenants LIMIT 1), '2026-2027', '2026-04-01', '2027-03-31', TRUE);

-- 7. Classes
INSERT INTO classes (tenant_id, name, code) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Class 9', 'C9');

-- 8. Sections
INSERT INTO sections (tenant_id, class_id, name, room_number) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM classes LIMIT 1), 'Section A', 'Room 101');

-- 9. Subjects
INSERT INTO subjects (tenant_id, name, code, is_elective) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Mathematics', 'MATH-101', FALSE);

-- 10. Class Subjects
INSERT INTO class_subjects (tenant_id, class_id, subject_id, passing_marks, total_marks) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM classes LIMIT 1), (SELECT id FROM subjects LIMIT 1), 33.00, 100.00);

-- 11. Students
INSERT INTO students (tenant_id, b_form_number, first_name, last_name, gender, date_of_birth, admission_date, admission_number, father_name, father_cnic, guardian_phone, address) 
VALUES ((SELECT id FROM tenants LIMIT 1), '42101-1234567-1', 'Ali', 'Khan', 'Male', '2010-05-15', '2026-04-05', 'ADM-2026-001', 'Tariq Khan', '42101-9876543-1', '03009876543', 'Clifton, Karachi');

-- 12. Student Enrollments
INSERT INTO student_enrollments (tenant_id, student_id, academic_year_id, class_id, section_id, roll_number, status) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM students LIMIT 1), (SELECT id FROM academic_years LIMIT 1), (SELECT id FROM classes LIMIT 1), (SELECT id FROM sections LIMIT 1), 1, 'Active');

-- 13. Staff
INSERT INTO staff (tenant_id, user_id, cnic, designation, qualification, basic_salary, joining_date) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM users LIMIT 1), '42101-5555555-5', 'Senior Teacher', 'MSc Mathematics', 65000.00, '2020-01-15');

-- 14. Student Attendance
INSERT INTO student_attendance (tenant_id, student_id, academic_year_id, date, status, remarks) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM students LIMIT 1), (SELECT id FROM academic_years LIMIT 1), CURRENT_DATE, 'Present', 'On time');

-- 15. Staff Attendance
INSERT INTO staff_attendance (tenant_id, staff_id, date, status, check_in) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM staff LIMIT 1), CURRENT_DATE, 'Present', CURRENT_TIMESTAMP);

-- 16. Exam Types
INSERT INTO exam_types (tenant_id, name, description) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Mid Term Examination', 'First half of the academic year assessment');

-- 17. Exams
INSERT INTO exams (tenant_id, academic_year_id, exam_type_id, class_id, subject_id, exam_date, total_marks, passing_marks) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM academic_years LIMIT 1), (SELECT id FROM exam_types LIMIT 1), (SELECT id FROM classes LIMIT 1), (SELECT id FROM subjects LIMIT 1), '2026-10-15', 100.00, 33.00);

-- 18. Student Marks
INSERT INTO student_marks (tenant_id, exam_id, student_id, obtained_marks, is_absent, remarks) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM exams LIMIT 1), (SELECT id FROM students LIMIT 1), 85.50, FALSE, 'Excellent performance');

-- 19. Grading Scales
INSERT INTO grading_scales (tenant_id, grade_name, min_percentage, max_percentage, gpa, remarks) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'A+', 80.00, 100.00, 4.00, 'Outstanding');

-- 20. Fee Types
INSERT INTO fee_types (tenant_id, name, description) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Monthly Tuition Fee', 'Standard recurring academic fee');

-- 21. Fee Structures
INSERT INTO fee_structures (tenant_id, academic_year_id, class_id, fee_type_id, amount) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM academic_years LIMIT 1), (SELECT id FROM classes LIMIT 1), (SELECT id FROM fee_types LIMIT 1), 5500.00);

-- 22. Fee Challans
INSERT INTO fee_challans (tenant_id, student_id, academic_year_id, challan_number, billing_month, billing_year, issue_date, due_date, total_amount, paid_amount, status) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM students LIMIT 1), (SELECT id FROM academic_years LIMIT 1), 'CHL-2026-0001', 5, 2026, '2026-05-01', '2026-05-10', 5500.00, 0.00, 'Unpaid');

-- 23. Fee Challan Details
INSERT INTO fee_challan_details (challan_id, fee_type_id, amount) 
VALUES ((SELECT id FROM fee_challans LIMIT 1), (SELECT id FROM fee_types LIMIT 1), 5500.00);

-- 24. Salary Slips
INSERT INTO salary_slips (tenant_id, staff_id, salary_month, salary_year, basic_salary, net_salary) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM staff LIMIT 1), 4, 2026, 65000.00, 65000.00);

-- 25. Audit Logs
INSERT INTO audit_logs (tenant_id, user_id, action_type, table_name, record_id, new_values) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM users LIMIT 1), 'INSERT', 'students', (SELECT id FROM students LIMIT 1), '{"first_name": "Ali", "last_name": "Khan"}');

-- 26. Transport Routes
INSERT INTO transport_routes (tenant_id, route_name, start_point, end_point, monthly_charges) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Route A - Clifton', 'Clifton Block 2', 'Main Campus', 3500.00);

-- 27. Transport Vehicles
INSERT INTO transport_vehicles (tenant_id, vehicle_number, vehicle_model, driver_name, driver_phone, driver_license) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'KHI-9999', 'Toyota Hiace', 'Muhammad Rahim', '03331112223', 'DL-445566');

-- 28. Student Transport
INSERT INTO student_transport (tenant_id, student_id, route_id, vehicle_id, academic_year_id, assigned_date) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM students LIMIT 1), (SELECT id FROM transport_routes LIMIT 1), (SELECT id FROM transport_vehicles LIMIT 1), (SELECT id FROM academic_years LIMIT 1), '2026-04-06');

-- 29. Library Books
INSERT INTO library_books (tenant_id, title, author, isbn, rack_number, total_copies, available_copies) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Physics Concepts', 'H.C. Verma', '978-3-16-148410-0', 'Rack-A1', 5, 4);

-- 30. Library Issues
INSERT INTO library_issues (tenant_id, book_id, user_id, issue_date, due_date) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM library_books LIMIT 1), (SELECT id FROM users LIMIT 1), CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days');

-- 31. Inventory Categories
INSERT INTO inventory_categories (tenant_id, category_name) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Stationery');

-- 32. Inventory Items
INSERT INTO inventory_items (tenant_id, category_id, item_name, unit_price, current_stock) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM inventory_categories LIMIT 1), 'Whiteboard Markers (Box)', 550.00, 20);

-- 33. Inventory Transactions
INSERT INTO inventory_transactions (tenant_id, item_id, transaction_type, quantity, referenced_user_id, remarks) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM inventory_items LIMIT 1), 'IN', 20, (SELECT id FROM users LIMIT 1), 'Initial stock purchase');

-- 34. Expense Categories
INSERT INTO expense_categories (tenant_id, category_name) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Utility Bills');

-- 35. School Expenses
INSERT INTO school_expenses (tenant_id, category_id, amount, expense_date, paid_to, payment_method, description) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM expense_categories LIMIT 1), 25000.00, '2026-04-20', 'K-Electric', 'Bank Transfer', 'April Electricity Bill');

-- 36. Notification Logs
INSERT INTO notification_logs (tenant_id, recipient_phone, message_body, notification_type, delivery_status) 
VALUES ((SELECT id FROM tenants LIMIT 1), '03009876543', 'Dear Parent, fee challan for May has been generated.', 'SMS', 'Sent');

-- 37. Fee Concessions
INSERT INTO fee_concessions (tenant_id, name, discount_type, discount_value) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Kinship Discount', 'Percentage', 20.00);

-- 38. Student Concessions
INSERT INTO student_concessions (tenant_id, student_id, fee_concession_id, academic_year_id) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM students LIMIT 1), (SELECT id FROM fee_concessions LIMIT 1), (SELECT id FROM academic_years LIMIT 1));

-- 39. Admission Enquiries
INSERT INTO admission_enquiries (tenant_id, child_name, father_name, phone_number, class_id, remarks) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Zainab', 'Omar', '03214567890', (SELECT id FROM classes LIMIT 1), 'Interested in early admission');

-- 40. Hostels
INSERT INTO hostels (tenant_id, name, hostel_type) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Boys Hostel A', 'Boys');

-- 41. Hostel Rooms
INSERT INTO hostel_rooms (hostel_id, room_number, capacity, monthly_rent) 
VALUES ((SELECT id FROM hostels LIMIT 1), 'B-101', 3, 15000.00);

-- 42. Hostel Allocations
INSERT INTO hostel_allocations (tenant_id, student_id, room_id, academic_year_id, allocated_date) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM students LIMIT 1), (SELECT id FROM hostel_rooms LIMIT 1), (SELECT id FROM academic_years LIMIT 1), '2026-04-10');

-- 43. Visitor Logs
INSERT INTO visitor_logs (tenant_id, visitor_name, cnic, phone_number, purpose) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Ahmed Raza', '42201-1111111-1', '03451234567', 'Meeting with Principal regarding admission');

-- 44. Student Behavior Logs
INSERT INTO student_behavior_logs (tenant_id, student_id, academic_year_id, incident_date, incident_type, action_taken, reported_by_user_id) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM students LIMIT 1), (SELECT id FROM academic_years LIMIT 1), '2026-04-25', 'Late Arrival', 'Verbal Warning Issued', (SELECT id FROM users LIMIT 1));

-- 45. PTM Slots
INSERT INTO ptm_slots (tenant_id, academic_year_id, meeting_date, start_time, end_time, class_id) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM academic_years LIMIT 1), '2026-05-15', '09:00:00', '14:00:00', (SELECT id FROM classes LIMIT 1));

-- 46. PTM Bookings
INSERT INTO ptm_bookings (slot_id, student_id, parent_user_id, teacher_user_id) 
VALUES ((SELECT id FROM ptm_slots LIMIT 1), (SELECT id FROM students LIMIT 1), (SELECT id FROM users LIMIT 1), (SELECT id FROM users LIMIT 1));

-- 47. Certificate Templates
INSERT INTO certificate_templates (tenant_id, template_name, content_body) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'School Leaving Certificate', 'This is to certify that {{student_name}} was a student of this school...');

-- 48. Issued Certificates
INSERT INTO issued_certificates (tenant_id, student_id, template_id, certificate_number, issued_date, issued_by_user_id) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM students LIMIT 1), (SELECT id FROM certificate_templates LIMIT 1), 'SLC-2026-001', CURRENT_DATE, (SELECT id FROM users LIMIT 1));

-- 49. Alumni Profiles
INSERT INTO alumni_profiles (tenant_id, student_id, graduation_year, current_occupation) 
VALUES ((SELECT id FROM tenants LIMIT 1), (SELECT id FROM students LIMIT 1), 2026, 'Software Engineering Student at NUST');



EXTRA


-- 1. Fee Challans Table
CREATE TABLE IF NOT EXISTS fee_challans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    challan_number VARCHAR(100) NOT NULL,
    billing_month INT NOT NULL,
    billing_year INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Unpaid',
    payment_date TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_tenant_challan_num UNIQUE (tenant_id, challan_number),
    CONSTRAINT unique_student_monthly_bill UNIQUE (student_id, billing_month, billing_year)
);

-- 2. Fee Challan Details Table
CREATE TABLE IF NOT EXISTS fee_challan_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challan_id UUID NOT NULL REFERENCES fee_challans(id) ON DELETE CASCADE,
    fee_type_id UUID NOT NULL REFERENCES fee_types(id) ON DELETE CASCADE,
    amount DECIMAL(18,2) NOT NULL
);

-- Index for better performance
CREATE INDEX idx_fee_challans_tenant ON fee_challans(tenant_id);
CREATE INDEX idx_fee_challans_student ON fee_challans(student_id);
CREATE INDEX idx_fee_challan_details_challan ON fee_challan_details(challan_id);