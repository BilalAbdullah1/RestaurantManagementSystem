-- SQL Migration to update school_expenses table for full approval workflow, vendor tracking, and receipt attachment images

ALTER TABLE school_expenses ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
ALTER TABLE school_expenses ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT 'Expense Voucher';
ALTER TABLE school_expenses ADD COLUMN IF NOT EXISTS paid_to VARCHAR(255);
ALTER TABLE school_expenses ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'Petty Cash Vault';
ALTER TABLE school_expenses ADD COLUMN IF NOT EXISTS receipt_no VARCHAR(100);
ALTER TABLE school_expenses ADD COLUMN IF NOT EXISTS receipt_image_url TEXT;
ALTER TABLE school_expenses ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'Approved';
