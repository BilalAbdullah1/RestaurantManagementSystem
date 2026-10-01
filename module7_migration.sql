-- Migration Script for Module 7: HR & Payroll (61-70)
-- ===================================================

BEGIN;

-- 1. Add staff_type and Document Vault columns to staff table
ALTER TABLE "staff" 
ADD COLUMN IF NOT EXISTS "staff_type" text NOT NULL DEFAULT 'Teaching',
ADD COLUMN IF NOT EXISTS "cnic_doc_url" text,
ADD COLUMN IF NOT EXISTS "degree_doc_url" text,
ADD COLUMN IF NOT EXISTS "contract_doc_url" text;

-- 2. Add allowance, loan, tax breakdown columns to salary_slips
ALTER TABLE "salary_slips"
ADD COLUMN IF NOT EXISTS "house_rent_allowance" numeric(18,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS "medical_allowance" numeric(18,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS "provident_fund_deduction" numeric(18,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS "loan_deduction" numeric(18,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS "income_tax_deduction" numeric(18,2) NOT NULL DEFAULT 0.00;

-- 3. Create staff_loans table
CREATE TABLE IF NOT EXISTS "staff_loans" (
    "id" uuid NOT NULL PRIMARY KEY,
    "tenant_id" uuid NOT NULL,
    "staff_id" uuid NOT NULL,
    "loan_amount" numeric(18,2) NOT NULL DEFAULT 0.00,
    "monthly_installment" numeric(18,2) NOT NULL DEFAULT 0.00,
    "remaining_balance" numeric(18,2) NOT NULL DEFAULT 0.00,
    "status" text NOT NULL DEFAULT 'Approved',
    "reason" text NOT NULL DEFAULT '',
    "issue_date" timestamp with time zone NOT NULL DEFAULT NOW(),
    "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

-- 4. Add Leave Quota columns to staff table
ALTER TABLE "staff"
ADD COLUMN IF NOT EXISTS "casual_leave_quota" integer NOT NULL DEFAULT 14,
ADD COLUMN IF NOT EXISTS "medical_leave_quota" integer NOT NULL DEFAULT 8,
ADD COLUMN IF NOT EXISTS "casual_leaves_used" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "medical_leaves_used" integer NOT NULL DEFAULT 0;

-- 5. Create staff_appraisals table
CREATE TABLE IF NOT EXISTS "staff_appraisals" (
    "id" uuid NOT NULL PRIMARY KEY,
    "tenant_id" uuid NOT NULL,
    "staff_id" uuid NOT NULL,
    "appraisal_year" integer NOT NULL DEFAULT 2026,
    "performance_rating" numeric(18,2) NOT NULL DEFAULT 4.00,
    "is_teacher_of_the_month" boolean NOT NULL DEFAULT false,
    "award_month" text,
    "recommended_increment_pct" numeric(18,2) NOT NULL DEFAULT 0.00,
    "previous_basic_salary" numeric(18,2) NOT NULL DEFAULT 0.00,
    "new_basic_salary" numeric(18,2) NOT NULL DEFAULT 0.00,
    "is_increment_applied" boolean NOT NULL DEFAULT false,
    "comments" text NOT NULL DEFAULT '',
    "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

-- 6. Create staff_clearances table
CREATE TABLE IF NOT EXISTS "staff_clearances" (
    "id" uuid NOT NULL PRIMARY KEY,
    "tenant_id" uuid NOT NULL,
    "staff_id" uuid NOT NULL,
    "resignation_date" timestamp with time zone NOT NULL DEFAULT NOW(),
    "relieving_date" timestamp with time zone NOT NULL DEFAULT NOW(),
    "notice_period_days" integer NOT NULL DEFAULT 30,
    "unpaid_salary_amount" numeric(18,2) NOT NULL DEFAULT 0.00,
    "leave_encashment_amount" numeric(18,2) NOT NULL DEFAULT 0.00,
    "loan_deduction_amount" numeric(18,2) NOT NULL DEFAULT 0.00,
    "net_settlement_amount" numeric(18,2) NOT NULL DEFAULT 0.00,
    "clearance_status" text NOT NULL DEFAULT 'Completed',
    "remarks" text NOT NULL DEFAULT '',
    "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

COMMIT;
