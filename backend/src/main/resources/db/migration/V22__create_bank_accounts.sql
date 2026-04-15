CREATE TABLE bank_accounts (
    id                      BIGSERIAL     PRIMARY KEY,
    tenant_id               BIGINT        NOT NULL,
    association_id          BIGINT        NOT NULL,
    bank_account_name       VARCHAR(255)  NOT NULL,
    account_type            VARCHAR(20)   NOT NULL
    CHECK (account_type IN ('CHECKING','SAVINGS','MONEY_MARKET')),
    country                 VARCHAR(100)  NOT NULL DEFAULT 'United States',
    routing_number          VARCHAR(9)    NOT NULL,
    account_number_masked   VARCHAR(10)   NOT NULL,  -- only "****XXXX" stored, never full number
    account_notes           TEXT,
    check_printing_enabled  BOOLEAN       NOT NULL DEFAULT FALSE,
    balance                 NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bank_accounts_tenant ON bank_accounts(tenant_id);
CREATE INDEX idx_bank_accounts_assoc  ON bank_accounts(tenant_id, association_id);