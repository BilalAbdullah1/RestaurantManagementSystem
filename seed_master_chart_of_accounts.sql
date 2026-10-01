-- ====================================================================
-- MASTER ENTERPRISE SCHOOL CHART OF ACCOUNTS (COA) SEED SCRIPT
-- Seeds the complete 27 standard General Ledger Accounts for all tenants
-- Run this in PgAdmin / DBeaver to initialize the complete School General Ledger
-- ====================================================================

-- 1. Ensure Table Structure Exists
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Asset',
    sub_category VARCHAR(100) DEFAULT 'General',
    balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'PKR',
    exchange_rate DECIMAL(18,4) DEFAULT 1.0000,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ensure Unique Constraint on (tenant_id, code) for Conflict Resolution
ALTER TABLE chart_of_accounts DROP CONSTRAINT IF EXISTS unique_tenant_account_code;
ALTER TABLE chart_of_accounts ADD CONSTRAINT unique_tenant_account_code UNIQUE (tenant_id, code);

-- 3. Seed Master School General Ledger Accounts for ALL Existing Tenants
INSERT INTO chart_of_accounts (id, tenant_id, code, name, type, sub_category, balance, currency, exchange_rate, is_active)
SELECT 
    gen_random_uuid(),
    t.id AS tenant_id,
    template.code,
    template.name,
    template.type,
    template.sub_category,
    template.balance,
    'PKR',
    1.0000,
    TRUE
FROM tenants t
CROSS JOIN (
    VALUES
        -- --------------------------------------------------------
        -- 1000 SERIES: ASSETS (Cash, Bank, Properties, Receivables)
        -- --------------------------------------------------------
        ('1001', 'Petty Cash Vault (Custodian Float)', 'Asset', 'Cash & Cash Equivalents', 0.00),
        ('1002', 'Main School Bank Operating Account', 'Asset', 'Cash & Cash Equivalents', 0.00),
        ('1003', 'Student Fee Accounts Receivable', 'Asset', 'Current Asset', 0.00),
        ('1004', 'Student RFID Cashless Wallet Clearing', 'Asset', 'Current Asset', 0.00),
        ('1010', 'School Land & Campus Infrastructure', 'Asset', 'Fixed Asset', 0.00),
        ('1011', 'Computer Labs & IT Assets', 'Asset', 'Fixed Asset', 0.00),
        ('1012', 'Classroom Furniture, Fixtures & Fittings', 'Asset', 'Fixed Asset', 0.00),
        ('1013', 'School Buses & Transport Fleet', 'Asset', 'Fixed Asset', 0.00),

        -- --------------------------------------------------------
        -- 2000 SERIES: LIABILITIES (Payables, Loans, Security Deposits)
        -- --------------------------------------------------------
        ('2001', 'Accounts Payable & Vendor Dues', 'Liability', 'Current Liability', 0.00),
        ('2002', 'Refundable Student Security Deposits', 'Liability', 'Current Liability', 0.00),
        ('2003', 'Staff Salaries Payable', 'Liability', 'Current Liability', 0.00),
        ('2004', 'Staff Provident Fund & Gratuity Liability', 'Liability', 'Current Liability', 0.00),
        ('2010', 'Long-Term Commercial Bank Loans', 'Liability', 'Long-Term Liability', 0.00),

        -- --------------------------------------------------------
        -- 3000 SERIES: EQUITY (Capital, Reserves, Retained Earnings)
        -- --------------------------------------------------------
        ('3001', 'Retained Earnings & Accumulated Surplus', 'Equity', 'Equity', 0.00),
        ('3002', 'School Founder / Trust Capital', 'Equity', 'Capital', 0.00),
        ('3003', 'Campus Infrastructure Reserve Surplus', 'Equity', 'Reserves', 0.00),

        -- --------------------------------------------------------
        -- 4000 SERIES: REVENUE / INCOME (Tuition, Admission, Fines)
        -- --------------------------------------------------------
        ('4001', 'Monthly Tuition Fee Income', 'Revenue', 'Operating Income', 0.00),
        ('4002', 'Admission & Registration Fee Income', 'Revenue', 'Operating Income', 0.00),
        ('4003', 'Annual Development & Exam Charges Income', 'Revenue', 'Operating Income', 0.00),
        ('4004', 'Computer & Science Lab Fee Income', 'Revenue', 'Operating Income', 0.00),
        ('4005', 'Transport Fleet Monthly Fee Income', 'Revenue', 'Operating Income', 0.00),
        ('4006', 'Late Fee Fine Collections Income', 'Revenue', 'Other Income', 0.00),
        ('4007', 'Canteen Commission & Misc Revenue', 'Revenue', 'Other Income', 0.00),

        -- --------------------------------------------------------
        -- 5000 SERIES: EXPENSES (Salaries, Utilities, Maintenance)
        -- --------------------------------------------------------
        ('5001', 'Teaching & Academic Staff Salaries', 'Expense', 'Operating Expense', 0.00),
        ('5002', 'Administrative & Non-Teaching Salaries', 'Expense', 'Operating Expense', 0.00),
        ('5003', 'Utilities (Electricity, Water, Gas)', 'Expense', 'Operating Expense', 0.00),
        ('5004', 'Building Rent & Campus Lease', 'Expense', 'Operating Expense', 0.00),
        ('5005', 'Maintenance, Repairs & Janitorial', 'Expense', 'Operating Expense', 0.00),
        ('5006', 'School Events, Sports & Celebrations', 'Expense', 'Operating Expense', 0.00),
        ('5007', 'Marketing, Admissions & Advertising', 'Expense', 'Operating Expense', 0.00),
        ('5008', 'Stationery, Printing & Office Supplies', 'Expense', 'Operating Expense', 0.00),
        ('5009', 'Fuel, Transport & Generator Logistics', 'Expense', 'Operating Expense', 0.00),
        ('5010', 'Bank Charges & Payment Gateway Fees', 'Expense', 'Financial Expense', 0.00)
) AS template(code, name, type, sub_category, balance)
ON CONFLICT (tenant_id, code) DO UPDATE 
SET name = EXCLUDED.name, 
    type = EXCLUDED.type, 
    sub_category = EXCLUDED.sub_category;
