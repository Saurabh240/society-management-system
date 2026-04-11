CREATE TABLE journal_entries (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT       NOT NULL,
    association_id  BIGINT       NOT NULL,
    date            DATE         NOT NULL,
    memo            TEXT,
    attachment_path VARCHAR(255),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE journal_lines (
    id          BIGSERIAL PRIMARY KEY,
    journal_id  BIGINT         NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id  BIGINT         NOT NULL,
    description VARCHAR(255),
    debit       NUMERIC(15,2)  NOT NULL DEFAULT 0,
    credit      NUMERIC(15,2)  NOT NULL DEFAULT 0
);

CREATE INDEX idx_journal_tenant       ON journal_entries(tenant_id);
CREATE INDEX idx_journal_assoc_date   ON journal_entries(tenant_id, association_id, date);