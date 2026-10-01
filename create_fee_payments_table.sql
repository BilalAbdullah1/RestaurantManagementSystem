-- ==============================================================================
-- 🚀 SMS DATABASE SCRIPT: CREATE TABLE fee_payments
-- ==============================================================================

-- 1. Create table fee_payments (Fresh Create / If Not Exists)
CREATE TABLE IF NOT EXISTS fee_payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    challan_id          UUID NOT NULL REFERENCES fee_challans(id) ON DELETE CASCADE,
    payment_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount              NUMERIC(18, 2) NOT NULL,
    payment_method      VARCHAR(50) NOT NULL DEFAULT 'Cash',
    remarks             TEXT,
    receipt_number      VARCHAR(100),
    received_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_fee_payments_tenant_id ON fee_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_challan_id ON fee_payments(challan_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_payment_date ON fee_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_fee_payments_receipt_number ON fee_payments(receipt_number);

-- 3. Verify Table Structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'fee_payments';
