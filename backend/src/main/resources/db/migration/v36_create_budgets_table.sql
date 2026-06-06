-- =============================================================================
-- V36__create_budgets_table.sql
-- Creates budgets and budget_line_items tables
-- =============================================================================

CREATE TABLE budgets (
    id             BIGSERIAL PRIMARY KEY,
    tenant_id      BIGINT        NOT NULL,
    association_id BIGINT,
    name           VARCHAR(255)  NOT NULL,
    fiscal_year    INT           NOT NULL,
    start_date     DATE          NOT NULL,
    end_date       DATE          NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'DRAFT'
                   CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED')),
    notes          TEXT,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE budget_line_items (
    id               BIGSERIAL PRIMARY KEY,
    budget_id        BIGINT         NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    account_id       BIGINT         NOT NULL,
    budgeted_amount  NUMERIC(15,2)  NOT NULL DEFAULT 0,
    notes            TEXT
);

-- Indexes for tenant isolation and performance
CREATE INDEX idx_budgets_tenant         ON budgets(tenant_id);
CREATE INDEX idx_budgets_tenant_assoc   ON budgets(tenant_id, association_id);
CREATE INDEX idx_budgets_tenant_year    ON budgets(tenant_id, fiscal_year);
CREATE INDEX idx_budget_lines_budget    ON budget_line_items(budget_id);
CREATE INDEX idx_budget_lines_account   ON budget_line_items(account_id);