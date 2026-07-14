-- =============================================================================
-- V36__create_budgets_table.sql
-- Next migration after V35__create_tenant_seed_data_procedure.sql
-- Creates the budgets and budget_line_items tables required for
-- the Budget CRUD API and the Budget vs Actual financial report.
-- =============================================================================

CREATE TABLE budgets (
    id             BIGSERIAL     PRIMARY KEY,
    tenant_id      BIGINT        NOT NULL,
    association_id BIGINT,                        -- null = applies to all associations
    name           VARCHAR(255)  NOT NULL,
    fiscal_year    INT           NOT NULL,
    start_date     DATE          NOT NULL,
    end_date       DATE          NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'DRAFT'
                   CONSTRAINT chk_budgets_status
                   CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED')),
    notes          TEXT,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_budgets_tenant_id      ON budgets(tenant_id);
CREATE INDEX idx_budgets_association_id ON budgets(association_id);
CREATE INDEX idx_budgets_fiscal_year    ON budgets(tenant_id, fiscal_year);

CREATE TABLE budget_line_items (
    id               BIGSERIAL      PRIMARY KEY,
    budget_id        BIGINT         NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    account_id       BIGINT         NOT NULL,       -- FK to chart_of_accounts.id
    budgeted_amount  NUMERIC(15, 2) NOT NULL DEFAULT 0,
    notes            TEXT,
    CONSTRAINT uq_budget_line_account UNIQUE (budget_id, account_id)
);

CREATE INDEX idx_budget_items_budget  ON budget_line_items(budget_id);
CREATE INDEX idx_budget_items_account ON budget_line_items(account_id);