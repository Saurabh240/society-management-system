-- =============================================================================
-- V3__add_missing_tables_and_sequences.sql
-- Add all missing tables and create sequences for Hibernate schema validation
-- This migration includes:
-- 1. Missing tables: audit_logs, refresh_tokens, communication_mailing_recipients
-- 2. All explicit sequences for BIGSERIAL columns (required for Hibernate validate mode)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    user_id         BIGINT,
    action          VARCHAR(50)     NOT NULL,
    entity          VARCHAR(100)    NOT NULL,
    entity_id       BIGINT,
    timestamp       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id   ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity    ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);


-- ─────────────────────────────────────────────────────────────────────────────
-- REFRESH TOKENS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    tenant_id   BIGINT          NOT NULL,
    token_hash  VARCHAR(255)    NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ     NOT NULL,
    revoked     BOOLEAN         NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id   ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_tenant_id ON refresh_tokens(tenant_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires   ON refresh_tokens(expires_at);


-- ─────────────────────────────────────────────────────────────────────────────
-- COMMUNICATION MAILING RECIPIENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communication_mailing_recipients (
    id              BIGSERIAL       PRIMARY KEY,
    message_id      BIGINT          NOT NULL REFERENCES communication_messages(id) ON DELETE CASCADE,
    recipient_type  VARCHAR(50)     NOT NULL,
    owner_id        BIGINT,
    association_id  BIGINT          NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mailing_recipient_msg        ON communication_mailing_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_mailing_recipient_owner      ON communication_mailing_recipients(owner_id);
CREATE INDEX IF NOT EXISTS idx_mailing_recipient_assoc      ON communication_mailing_recipients(association_id);
CREATE INDEX IF NOT EXISTS idx_mailing_recipient_msg_owner  ON communication_mailing_recipients(message_id, owner_id);


-- ═════════════════════════════════════════════════════════════════════════════
-- SEQUENCES FOR ALL BIGSERIAL TABLES
-- These are required for Hibernate schema validation with ddl-auto=validate
-- PostgreSQL BIGSERIAL implicitly creates sequences, but Hibernate expects them
-- to be explicitly present for validation to pass.
-- ═════════════════════════════════════════════════════════════════════════════

-- Associate sequences with their tables (PostgreSQL auto-created these but we ensure they exist)
-- For tables created in V1, the sequences are auto-created with {tablename}_id_seq naming by PostgreSQL BIGSERIAL
-- However, Hibernate's default @GeneratedValue expects sequences named {tablename}_seq
-- We need to create both or rename to match Hibernate expectations
-- NOTE: Hibernate default naming is {tablename}_seq (without _id suffix)

-- Platform sequences  
CREATE SEQUENCE IF NOT EXISTS subscriptions_seq;
ALTER TABLE IF EXISTS subscriptions ALTER COLUMN id SET DEFAULT nextval('subscriptions_seq');

CREATE SEQUENCE IF NOT EXISTS password_reset_tokens_seq;
ALTER TABLE IF EXISTS password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('password_reset_tokens_seq');

-- Association sequences
CREATE SEQUENCE IF NOT EXISTS associations_seq;
ALTER TABLE IF EXISTS associations ALTER COLUMN id SET DEFAULT nextval('associations_seq');

CREATE SEQUENCE IF NOT EXISTS units_seq;
ALTER TABLE IF EXISTS units ALTER COLUMN id SET DEFAULT nextval('units_seq');

CREATE SEQUENCE IF NOT EXISTS owners_seq;
ALTER TABLE IF EXISTS owners ALTER COLUMN id SET DEFAULT nextval('owners_seq');

CREATE SEQUENCE IF NOT EXISTS unit_owners_seq;
ALTER TABLE IF EXISTS unit_owners ALTER COLUMN id SET DEFAULT nextval('unit_owners_seq');

CREATE SEQUENCE IF NOT EXISTS association_files_seq;
ALTER TABLE IF EXISTS association_files ALTER COLUMN id SET DEFAULT nextval('association_files_seq');

-- Unit Invoices sequences
CREATE SEQUENCE IF NOT EXISTS unit_invoices_seq;
ALTER TABLE IF EXISTS unit_invoices ALTER COLUMN id SET DEFAULT nextval('unit_invoices_seq');

CREATE SEQUENCE IF NOT EXISTS unit_invoice_line_items_seq;
ALTER TABLE IF EXISTS unit_invoice_line_items ALTER COLUMN id SET DEFAULT nextval('unit_invoice_line_items_seq');

-- Vendors sequence
CREATE SEQUENCE IF NOT EXISTS vendors_seq;
ALTER TABLE IF EXISTS vendors ALTER COLUMN id SET DEFAULT nextval('vendors_seq');

-- Communication sequences
CREATE SEQUENCE IF NOT EXISTS communication_messages_seq;
ALTER TABLE IF EXISTS communication_messages ALTER COLUMN id SET DEFAULT nextval('communication_messages_seq');

CREATE SEQUENCE IF NOT EXISTS communication_deliveries_seq;
ALTER TABLE IF EXISTS communication_deliveries ALTER COLUMN id SET DEFAULT nextval('communication_deliveries_seq');

CREATE SEQUENCE IF NOT EXISTS communication_templates_seq;
ALTER TABLE IF EXISTS communication_templates ALTER COLUMN id SET DEFAULT nextval('communication_templates_seq');

CREATE SEQUENCE IF NOT EXISTS communication_mailing_recipients_seq;
ALTER TABLE IF EXISTS communication_mailing_recipients ALTER COLUMN id SET DEFAULT nextval('communication_mailing_recipients_seq');

-- Accounting sequences
CREATE SEQUENCE IF NOT EXISTS chart_of_accounts_seq;
ALTER TABLE IF EXISTS chart_of_accounts ALTER COLUMN id SET DEFAULT nextval('chart_of_accounts_seq');

CREATE SEQUENCE IF NOT EXISTS journal_entries_seq;
ALTER TABLE IF EXISTS journal_entries ALTER COLUMN id SET DEFAULT nextval('journal_entries_seq');

CREATE SEQUENCE IF NOT EXISTS journal_lines_seq;
ALTER TABLE IF EXISTS journal_lines ALTER COLUMN id SET DEFAULT nextval('journal_lines_seq');

CREATE SEQUENCE IF NOT EXISTS ledger_entries_seq;
ALTER TABLE IF EXISTS ledger_entries ALTER COLUMN id SET DEFAULT nextval('ledger_entries_seq');

CREATE SEQUENCE IF NOT EXISTS bank_accounts_seq;
ALTER TABLE IF EXISTS bank_accounts ALTER COLUMN id SET DEFAULT nextval('bank_accounts_seq');

CREATE SEQUENCE IF NOT EXISTS bills_seq;
ALTER TABLE IF EXISTS bills ALTER COLUMN id SET DEFAULT nextval('bills_seq');

CREATE SEQUENCE IF NOT EXISTS bill_line_items_seq;
ALTER TABLE IF EXISTS bill_line_items ALTER COLUMN id SET DEFAULT nextval('bill_line_items_seq');

CREATE SEQUENCE IF NOT EXISTS bill_attachments_seq;
ALTER TABLE IF EXISTS bill_attachments ALTER COLUMN id SET DEFAULT nextval('bill_attachments_seq');

-- Help sequences
CREATE SEQUENCE IF NOT EXISTS support_tickets_seq;
ALTER TABLE IF EXISTS support_tickets ALTER COLUMN id SET DEFAULT nextval('support_tickets_seq');

CREATE SEQUENCE IF NOT EXISTS feature_suggestions_seq;
ALTER TABLE IF EXISTS feature_suggestions ALTER COLUMN id SET DEFAULT nextval('feature_suggestions_seq');

-- Budget sequences
CREATE SEQUENCE IF NOT EXISTS budgets_seq;
ALTER TABLE IF EXISTS budgets ALTER COLUMN id SET DEFAULT nextval('budgets_seq');

CREATE SEQUENCE IF NOT EXISTS budget_line_items_seq;
ALTER TABLE IF EXISTS budget_line_items ALTER COLUMN id SET DEFAULT nextval('budget_line_items_seq');

-- Audit sequences (new table created above)
CREATE SEQUENCE IF NOT EXISTS audit_logs_seq;
ALTER TABLE IF EXISTS audit_logs ALTER COLUMN id SET DEFAULT nextval('audit_logs_seq');

-- Refresh tokens sequence (new table created above)
CREATE SEQUENCE IF NOT EXISTS refresh_tokens_seq;
ALTER TABLE IF EXISTS refresh_tokens ALTER COLUMN id SET DEFAULT nextval('refresh_tokens_seq');
