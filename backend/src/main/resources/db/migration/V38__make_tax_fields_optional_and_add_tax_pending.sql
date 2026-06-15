ALTER TABLE associations
    ALTER COLUMN tax_identity_type DROP NOT NULL,
ALTER COLUMN tax_payer_id DROP NOT NULL;

ALTER TABLE associations
    ADD COLUMN tax_pending BOOLEAN NOT NULL DEFAULT FALSE;