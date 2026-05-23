-- Step 1: Create vendors table if it does not already exist
CREATE TABLE IF NOT EXISTS vendors (
    id                BIGSERIAL    PRIMARY KEY,
    tenant_id         BIGINT       NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    company_name      VARCHAR(255) NOT NULL,
    contact_name      VARCHAR(255) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    phone             VARCHAR(20)  NOT NULL,
    alt_email         VARCHAR(255),
    alt_phone         VARCHAR(20),
    street            VARCHAR(255) NOT NULL,
    city              VARCHAR(100) NOT NULL,
    state             VARCHAR(100) NOT NULL,
    zip_code          VARCHAR(10)  NOT NULL,
    status            VARCHAR(20)  NOT NULL,
    service_category  VARCHAR(255),
    updated_at        TIMESTAMPTZ
);
 
-- Step 2: Add columns that V26 introduced but V17 may have missed
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS service_category VARCHAR(255);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS alt_email        VARCHAR(255);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS alt_phone        VARCHAR(20);
 
-- Step 3: Add constraints if not already present
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_vendors_status'
    ) THEN
        ALTER TABLE vendors
        ADD CONSTRAINT chk_vendors_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'));
    END IF;
END $$;
 
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_vendors_tenant_email'
    ) THEN
        ALTER TABLE vendors
        ADD CONSTRAINT uq_vendors_tenant_email
        UNIQUE (tenant_id, email);
    END IF;
END $$;
 
CREATE INDEX IF NOT EXISTS idx_vendors_tenant_id ON vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendors_email     ON vendors(email);