ALTER TABLE bills
ALTER COLUMN status TYPE VARCHAR(30);

ALTER TABLE bills
DROP CONSTRAINT bills_status_check;

ALTER TABLE bills
    ADD CONSTRAINT bills_status_check
        CHECK (status IN ('UNPAID', 'PAID', 'PARTIALLY_PAID', 'OVERDUE'));