CREATE TABLE chart_of_accounts (
 id           BIGSERIAL    NOT NULL,
 tenant_id    BIGINT       NOT NULL,
 account_code VARCHAR(20)  NOT NULL,
 account_name VARCHAR(100) NOT NULL,
 account_type VARCHAR(20)  NOT NULL
 CONSTRAINT chk_coa_account_type
 CHECK (account_type IN ('ASSETS','LIABILITIES','EQUITY','INCOME','EXPENSES')),
 notes        TEXT,

    -- BaseEntity audit columns
 created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),

 CONSTRAINT pk_chart_of_accounts PRIMARY KEY (id),
 CONSTRAINT uq_coa_tenant_code   UNIQUE      (tenant_id, account_code)
);

-- Indexes to match the three repository query patterns
CREATE INDEX idx_coa_tenant_id    ON chart_of_accounts (tenant_id)               WHERE is_deleted = FALSE;
CREATE INDEX idx_coa_tenant_type  ON chart_of_accounts (tenant_id, account_type)  WHERE is_deleted = FALSE;
CREATE INDEX idx_coa_tenant_name  ON chart_of_accounts (tenant_id, account_name)  WHERE is_deleted = FALSE;