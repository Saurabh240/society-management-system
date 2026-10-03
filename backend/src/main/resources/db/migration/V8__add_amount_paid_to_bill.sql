ALTER TABLE bills ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(15,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS bill_payments (
                                             id                BIGSERIAL    PRIMARY KEY,
                                             tenant_id         BIGINT       NOT NULL,
                                             bill_id           BIGINT       NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    amount            NUMERIC(15,2) NOT NULL,
    payment_date      DATE         NOT NULL,
    bank_account_id   BIGINT       NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill_id   ON bill_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_tenant_id ON bill_payments(tenant_id);

CREATE SEQUENCE IF NOT EXISTS bill_payments_seq;
ALTER TABLE bill_payments ALTER COLUMN id SET DEFAULT nextval('bill_payments_seq');