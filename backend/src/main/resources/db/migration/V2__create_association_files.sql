-- Create association_files table to match AssociationFile entity
CREATE TABLE IF NOT EXISTS association_files (
    id                BIGSERIAL PRIMARY KEY,
    tenant_id         BIGINT       NOT NULL,
    association_id    BIGINT       NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    file_name         VARCHAR(255) NOT NULL,
    description       TEXT,
    file_size_bytes   BIGINT       NOT NULL,
    storage_path      VARCHAR(500) NOT NULL,
    uploaded_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_association_files_tenant ON association_files(tenant_id);
CREATE INDEX IF NOT EXISTS idx_association_files_assoc  ON association_files(association_id);
CREATE INDEX IF NOT EXISTS idx_association_files_tenant_assoc ON association_files(tenant_id, association_id);
