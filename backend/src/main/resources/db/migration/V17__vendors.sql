CREATE TABLE vendors (
    id    BIGSERIAL       NOT NULL,
    tenant_id   BIGINT    NOT NULL,

    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100)    NOT NULL,
    company_name        VARCHAR(255)    NOT NULL,
    service_category    VARCHAR(100)    NOT NULL,
    email               VARCHAR(255)    NOT NULL,
    alt_email           VARCHAR(255),
    mobile_phone        VARCHAR(50),
    work_phone          VARCHAR(50),
    home_phone          VARCHAR(50),
    website             VARCHAR(255),
    street              VARCHAR(255)    NOT NULL,
    city                VARCHAR(100)    NOT NULL,
    state               VARCHAR(100)    NOT NULL,
    zip_code            VARCHAR(10)     NOT NULL,
    country             VARCHAR(100),
    tax_identity_type   VARCHAR(100),
    tax_payer_id        VARCHAR(100),
    insurance_provider  VARCHAR(255),
    policy_number       VARCHAR(100),
    insurance_expiry    DATE,
    notes               TEXT,
    status              VARCHAR(20)     NOT NULL
    CONSTRAINT chk_vendors_status
    CHECK (status IN ('ACTIVE', 'INACTIVE')),

    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP,

    CONSTRAINT pk_vendors               PRIMARY KEY (id),
    CONSTRAINT uq_vendors_tenant_email  UNIQUE      (tenant_id, email)
);

-- Indexes to match repository query patterns
CREATE INDEX idx_vendors_tenant_id       ON vendors (tenant_id);
CREATE INDEX idx_vendors_tenant_status   ON vendors (tenant_id, status);
CREATE INDEX idx_vendors_tenant_category ON vendors (tenant_id, service_category);
CREATE INDEX idx_vendors_email           ON vendors (email);