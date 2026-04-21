CREATE TABLE bill_attachments (
  id                BIGSERIAL       NOT NULL,
  tenant_id         BIGINT          NOT NULL,
  bill_id           BIGINT          NOT NULL,
  original_filename VARCHAR(255)    NOT NULL,
  stored_path       VARCHAR(500)    NOT NULL,
  content_type      VARCHAR(50)     NOT NULL,
  file_size         BIGINT          NOT NULL,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_bill_attachments PRIMARY KEY (id)
);

CREATE INDEX idx_bill_attachments_bill   ON bill_attachments (bill_id);
CREATE INDEX idx_bill_attachments_tenant ON bill_attachments (tenant_id, bill_id);