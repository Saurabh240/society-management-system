-- V4__vendors.sql
CREATE TABLE vendors (
    id               BIGSERIAL     PRIMARY KEY,
    tenant_id        BIGINT        NOT NULL,
    company_name     VARCHAR(255)  NOT NULL,
    contact_name     VARCHAR(255)  NOT NULL,
    email            VARCHAR(255)  NOT NULL,
    phone            VARCHAR(50)   NOT NULL,
    alt_email        VARCHAR(255),
    alt_phone        VARCHAR(50),
    street           VARCHAR(255)  NOT NULL,
    city             VARCHAR(100)  NOT NULL,
    state            VARCHAR(100)  NOT NULL,
    zip_code         VARCHAR(10)   NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    service_category VARCHAR(100),
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP,
    CONSTRAINT uq_vendors_tenant_email UNIQUE (tenant_id, email)
);

CREATE INDEX idx_vendors_tenant_id ON vendors (tenant_id);
CREATE INDEX idx_vendors_email     ON vendors (email);