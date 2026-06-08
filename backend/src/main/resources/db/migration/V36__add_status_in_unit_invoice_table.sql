ALTER TABLE unit_invoices
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
        CONSTRAINT chk_unit_invoices_status
            CHECK (status IN ('UNPAID', 'PAID', 'OVERDUE'));