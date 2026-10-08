-- Mirrors V8/V9's amount_paid + status widening for bills, on the invoice
-- (unit charge) side, so a unit payment can be applied partially / in
-- installments across one or more outstanding invoices.

ALTER TABLE unit_invoices ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0;

-- Backfill: invoices already marked PAID before this column existed default
-- to amount_paid = 0, which would make them look fully outstanding again.
UPDATE unit_invoices
SET amount_paid = total_amount
WHERE status = 'PAID'
  AND amount_paid <> total_amount;

ALTER TABLE unit_invoices
    DROP CONSTRAINT IF EXISTS chk_unit_invoices_status;

ALTER TABLE unit_invoices
    ADD CONSTRAINT chk_unit_invoices_status
        CHECK (status IN ('UNPAID', 'PAID', 'PARTIALLY_PAID', 'OVERDUE'));
