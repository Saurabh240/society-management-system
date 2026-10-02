CREATE TABLE IF NOT EXISTS template_categories (
                                                   id          BIGSERIAL       PRIMARY KEY,
                                                   tenant_id   BIGINT          NOT NULL,
                                                   name        VARCHAR(100)    NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_template_categories_tenant_name UNIQUE (tenant_id, name)
    );

CREATE INDEX IF NOT EXISTS idx_template_categories_tenant_id ON template_categories(tenant_id);

CREATE SEQUENCE IF NOT EXISTS template_categories_seq;
ALTER TABLE IF EXISTS template_categories ALTER COLUMN id SET DEFAULT nextval('template_categories_seq');