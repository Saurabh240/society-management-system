-- V8 created bill_payments.bank_account_id as a plain BIGINT with no foreign
-- key, so nothing stops a row pointing at a bank account that's since been
-- deleted, or belonging to a different tenant (the column itself isn't
-- tenant-scoped beyond the application's own checks). This feature is brand
-- new in this release (no existing bill_payments rows yet in practice), so
-- adding the FK directly is safe; if a prior environment somehow has an
-- orphaned row already, this migration will fail loudly on that environment
-- rather than silently leaving the gap, which is the right outcome for a
-- data-integrity fix.

ALTER TABLE bill_payments
    ADD CONSTRAINT fk_bill_payments_bank_account
        FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id);
