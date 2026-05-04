CREATE TABLE vendors (
    id                BIGSERIAL PRIMARY KEY,
    -- BaseEntity fields
    tenant_id         BIGINT      NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Vendor fields
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

-- Enum constraint for VendorStatus
ALTER TABLE vendors
    ADD CONSTRAINT chk_vendors_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'));

-- Unique constraint (tenant + email)
ALTER TABLE vendors
    ADD CONSTRAINT uq_vendors_tenant_email
        UNIQUE (tenant_id, email);

CREATE INDEX idx_vendors_tenant_id
    ON vendors(tenant_id);

CREATE INDEX idx_vendors_email
    ON vendors(email);
