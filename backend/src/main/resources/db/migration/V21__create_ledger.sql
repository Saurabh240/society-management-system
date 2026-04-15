CREATE TABLE ledger_entries (
    id       BIGSERIAL  NOT NULL,
    tenant_id   BIGINT  NOT NULL,
    journal_id  BIGINT,
    account_id  BIGINT  NOT NULL,
    association_id  BIGINT  NOT NULL,
    date    DATE  NOT NULL,
    description      TEXT,
    debit   NUMERIC(19, 4)  NOT NULL DEFAULT 0,
    credit  NUMERIC(19, 4)  NOT NULL DEFAULT 0,
    accounting_basis VARCHAR(10)   NOT NULL
    CONSTRAINT chk_ledger_basis CHECK (accounting_basis IN ('CASH', 'ACCRUAL')),

    -- BaseEntity audit columns
    created_at       TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_ledger_entries PRIMARY KEY (id)
);

-- Indexes matching the three repository filter axes
CREATE INDEX idx_ledger_tenant_association ON ledger_entries (tenant_id, association_id);
CREATE INDEX idx_ledger_tenant_account     ON ledger_entries (tenant_id, account_id);
CREATE INDEX idx_ledger_tenant_date        ON ledger_entries (tenant_id, date DESC);