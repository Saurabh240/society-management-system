CREATE TABLE bill_line_items (
    id BIGSERIAL PRIMARY KEY,
    bill_id BIGINT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    description VARCHAR(255),
    expense_account_id BIGINT NOT NULL,
    amount NUMERIC(15,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_bill_line_items_bill ON bill_line_items(bill_id);