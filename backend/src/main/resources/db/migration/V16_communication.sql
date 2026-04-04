-- V2__communication_email_enhancements.sql
-- Add columns required by email send/schedule/list features

ALTER TABLE communication_messages
    ADD COLUMN IF NOT EXISTS tenant_id      BIGINT,
    ADD COLUMN IF NOT EXISTS recipient_label VARCHAR(120),
    ADD COLUMN IF NOT EXISTS title           VARCHAR(255);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_msg_tenant_type
    ON communication_messages (tenant_id, type);

-- Scheduler query index — partial index on SCHEDULED rows only (Postgres)
CREATE INDEX IF NOT EXISTS idx_msg_status_scheduled
    ON communication_messages (status, scheduled_at)
    WHERE status = 'SCHEDULED';