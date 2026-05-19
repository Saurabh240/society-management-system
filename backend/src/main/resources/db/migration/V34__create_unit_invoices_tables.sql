CREATE TABLE unit_invoices (
    id              BIGSERIAL       NOT NULL,
    tenant_id       BIGINT          NOT NULL,
    unit_id         BIGINT          NOT NULL,
    association_id  BIGINT          NOT NULL,
    invoice_date    DATE            NOT NULL,
    due_date        DATE            NOT NULL,
    total_amount    NUMERIC(10,2)   NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_unit_invoices PRIMARY KEY (id),
    CONSTRAINT fk_unit_invoices_unit_id
    FOREIGN KEY (unit_id) REFERENCES units (id) ON DELETE CASCADE
);

CREATE INDEX idx_unit_invoices_tenant_id     ON unit_invoices (tenant_id);
CREATE INDEX idx_unit_invoices_unit_id       ON unit_invoices (unit_id);
CREATE INDEX idx_unit_invoices_association   ON unit_invoices (association_id);
CREATE INDEX idx_unit_invoices_due_date      ON unit_invoices (due_date);


CREATE TABLE unit_invoice_line_items (
    id                  BIGSERIAL       NOT NULL,
    invoice_id          BIGINT          NOT NULL,
    description         VARCHAR(255)    NOT NULL,
    income_account_id   BIGINT          NOT NULL,
    income_account_name VARCHAR(255)    NOT NULL,
    amount              NUMERIC(10,2)   NOT NULL,

    CONSTRAINT pk_unit_invoice_line_items       PRIMARY KEY (id),
    CONSTRAINT fk_invoice_line_items_invoice_id
    FOREIGN KEY (invoice_id) REFERENCES unit_invoices (id) ON DELETE CASCADE
);

CREATE INDEX idx_unit_invoice_line_items_invoice_id ON unit_invoice_line_items (invoice_id);