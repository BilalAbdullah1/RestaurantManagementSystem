-- ===================================================
-- Migration Script for Module 6: Finance & Fee Management
-- ===================================================

BEGIN;

-- 1. Add category column to fee_structures & students (Normal, Staff Child, Orphan, Merit, etc.)
ALTER TABLE "fee_structures" 
ADD COLUMN IF NOT EXISTS "category" text NOT NULL DEFAULT 'Normal';

ALTER TABLE "students" 
ADD COLUMN IF NOT EXISTS "category" text NOT NULL DEFAULT 'Normal';

-- 2. Create chart_of_accounts table
CREATE TABLE IF NOT EXISTS "chart_of_accounts" (
    "id" uuid NOT NULL PRIMARY KEY,
    "tenant_id" uuid NOT NULL,
    "code" text NOT NULL,
    "name" text NOT NULL,
    "type" text NOT NULL DEFAULT 'Asset',
    "sub_category" text NOT NULL DEFAULT 'General',
    "balance" numeric(18,2) NOT NULL DEFAULT 0.00,
    "is_active" boolean NOT NULL DEFAULT TRUE,
    "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

COMMIT;
