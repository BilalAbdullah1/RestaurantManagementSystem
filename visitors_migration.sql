-- ============================================================
-- MODULE: Front Office — Visitors Log
-- Run this SQL script manually in your PostgreSQL database
-- ============================================================

CREATE TABLE IF NOT EXISTS visitors (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL,
    visitor_name    VARCHAR(150)    NOT NULL,
    phone_number    VARCHAR(20),
    purpose         VARCHAR(200)    NOT NULL,
    host_name       VARCHAR(150),
    host_department VARCHAR(100),
    vehicle_number  VARCHAR(50),
    id_card_type    VARCHAR(20),
    id_card_number  VARCHAR(30),
    status          VARCHAR(20)     NOT NULL DEFAULT 'Checked In',
    check_in_time   TIMESTAMP       NOT NULL DEFAULT NOW(),
    check_out_time  TIMESTAMP,
    remarks         VARCHAR(500),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Index for fast tenant-based queries
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_id     ON visitors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitors_check_in_time ON visitors(check_in_time DESC);

-- ============================================================
-- Done! Run this once in your database.
-- ============================================================
