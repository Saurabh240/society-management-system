ALTER TABLE unit_invoices ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS invoice_payments (
                                                id                BIGSERIAL     PRIMARY KEY,
                                                tenant_id         BIGINT        NOT NULL,
                                                invoice_id        BIGINT        NOT NULL REFERENCES unit_invoices(id) ON DELETE CASCADE,
    amount            NUMERIC(10,2) NOT NULL,
    payment_date      DATE          NOT NULL,
    bank_account_id   BIGINT        NOT NULL,
    memo              VARCHAR(255),
    idempotency_key   VARCHAR(100),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_invoice_payments_idem UNIQUE (tenant_id, invoice_id, idempotency_key)
    );
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_tenant_id  ON invoice_payments(tenant_id);

CREATE SEQUENCE IF NOT EXISTS invoice_payments_seq;
ALTER TABLE invoice_payments ALTER COLUMN id SET DEFAULT nextval('invoice_payments_seq');