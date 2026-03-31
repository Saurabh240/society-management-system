ALTER TABLE communication_templates
    ADD COLUMN IF NOT EXISTS description    VARCHAR(255),
    ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS content        TEXT;