-- ==============================================================================
-- 🚀 SMS DATABASE MIGRATION SCRIPT: Multi-Tenancy & Columns for fee_payments
-- ==============================================================================

DO $$ 
BEGIN
    -- 1. Add tenant_id column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fee_payments' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE fee_payments ADD COLUMN tenant_id UUID;
    END IF;

    -- 2. Backfill tenant_id from fee_challans for existing payments
    UPDATE fee_payments fp
    SET tenant_id = fc.tenant_id
    FROM fee_challans fc
    WHERE fp.challan_id = fc.id
      AND fp.tenant_id IS NULL;

    -- If any orphan records remain, fallback to first active tenant
    UPDATE fee_payments
    SET tenant_id = (SELECT id FROM tenants WHERE is_active = true LIMIT 1)
    WHERE tenant_id IS NULL;

    -- Make tenant_id NOT NULL if it has values
    IF EXISTS (SELECT 1 FROM fee_payments) THEN
        ALTER TABLE fee_payments ALTER COLUMN tenant_id SET NOT NULL;
    END IF;

    -- 3. Add receipt_number column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fee_payments' AND column_name = 'receipt_number'
    ) THEN
        ALTER TABLE fee_payments ADD COLUMN receipt_number VARCHAR(100);
    END IF;

    -- 4. Add received_by_user_id column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fee_payments' AND column_name = 'received_by_user_id'
    ) THEN
        ALTER TABLE fee_payments ADD COLUMN received_by_user_id UUID;
    END IF;

    -- 5. Add created_at column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fee_payments' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE fee_payments ADD COLUMN created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL;
    END IF;

END $$;

-- 6. Add Foreign Key constraints safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_fee_payments_tenant'
    ) THEN
        ALTER TABLE fee_payments
        ADD CONSTRAINT fk_fee_payments_tenant
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_fee_payments_received_by'
    ) THEN
        ALTER TABLE fee_payments
        ADD CONSTRAINT fk_fee_payments_received_by
        FOREIGN KEY (received_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 7. Add Index for high performance multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_fee_payments_tenant_id ON fee_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_challan_id ON fee_payments(challan_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_payment_date ON fee_payments(payment_date);

-- Verify structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'fee_payments';
