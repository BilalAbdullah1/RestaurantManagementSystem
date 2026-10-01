-- ==============================================================================
-- 🚀 SMS DATABASE MIGRATION: PHASE 2 SCHEMA NORMALIZATION & ENTITY FIXES
-- ==============================================================================

DO $$ 
BEGIN
    -- 1. student_attendance: add class_id and section_id for fast direct querying
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_attendance' AND column_name = 'class_id'
    ) THEN
        ALTER TABLE student_attendance ADD COLUMN class_id UUID REFERENCES classes(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_attendance' AND column_name = 'section_id'
    ) THEN
        ALTER TABLE student_attendance ADD COLUMN section_id UUID REFERENCES sections(id) ON DELETE SET NULL;
    END IF;

    -- 2. chart_of_accounts: add parent_id for hierarchical tree and level depth
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chart_of_accounts' AND column_name = 'parent_id'
    ) THEN
        ALTER TABLE chart_of_accounts ADD COLUMN parent_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chart_of_accounts' AND column_name = 'level'
    ) THEN
        ALTER TABLE chart_of_accounts ADD COLUMN level INT DEFAULT 1 NOT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chart_of_accounts' AND column_name = 'is_reconciled'
    ) THEN
        ALTER TABLE chart_of_accounts ADD COLUMN is_reconciled BOOLEAN DEFAULT true NOT NULL;
    END IF;

    -- 3. school_expenses: add account_id linking to chart_of_accounts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'school_expenses' AND column_name = 'account_id'
    ) THEN
        ALTER TABLE school_expenses ADD COLUMN account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL;
    END IF;

    -- 4. timetable_periods: add academic_year_id to support term/year timetables
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'timetable_periods' AND column_name = 'academic_year_id'
    ) THEN
        ALTER TABLE timetable_periods ADD COLUMN academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE;
    END IF;

    -- 5. sections: add class_teacher_id (incharge staff member)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sections' AND column_name = 'class_teacher_id'
    ) THEN
        ALTER TABLE sections ADD COLUMN class_teacher_id UUID REFERENCES staff(id) ON DELETE SET NULL;
    END IF;

    -- 6. notices: add posted_by_user_id (linking to users table)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notices' AND column_name = 'posted_by_user_id'
    ) THEN
        ALTER TABLE notices ADD COLUMN posted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

END $$;

-- 7. High-Performance Indexes for Phase 2 Columns
CREATE INDEX IF NOT EXISTS idx_student_attendance_class_section ON student_attendance(tenant_id, class_id, section_id, date);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_parent_id ON chart_of_accounts(tenant_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_school_expenses_account_id ON school_expenses(tenant_id, account_id);
CREATE INDEX IF NOT EXISTS idx_timetable_periods_academic_year ON timetable_periods(tenant_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_sections_class_teacher_id ON sections(tenant_id, class_teacher_id);
CREATE INDEX IF NOT EXISTS idx_notices_posted_by ON notices(tenant_id, posted_by_user_id);
