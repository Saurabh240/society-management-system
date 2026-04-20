CREATE TABLE bills (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    bill_number VARCHAR(20) NOT NULL,
    vendor_id BIGINT NOT NULL,
    association_id BIGINT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'UNPAID'
        CHECK (status IN ('UNPAID','PAID','OVERDUE')),
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    memo TEXT,
    paid_at TIMESTAMPTZ,
    paid_from_bank_account_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bills_tenant ON bills(tenant_id);
CREATE INDEX idx_bills_tenant_status ON bills(tenant_id, status);
CREATE INDEX idx_bills_tenant_assoc ON bills(tenant_id, association_id);
CREATE UNIQUE INDEX uq_bills_number ON bills(tenant_id, bill_number);