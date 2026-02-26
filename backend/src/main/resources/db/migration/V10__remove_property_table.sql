BEGIN;

-- drop property id index
DROP INDEX IF EXISTS idx_units_property_id;

-- drop properties table
DROP TABLE IF EXISTS properties;

-- add new columns
ALTER TABLE units
    ADD COLUMN IF NOT EXISTS community_id BIGINT references communities(id) on delete cascade,
    ADD COLUMN IF NOT EXISTS street VARCHAR(255),
    ADD COLUMN IF NOT EXISTS city VARCHAR(255),
    ADD COLUMN IF NOT EXISTS state VARCHAR(255),
    ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);

-- drop old column
ALTER TABLE units
    DROP COLUMN IF EXISTS property_id;

-- add index for performance
CREATE INDEX IF NOT EXISTS idx_units_community_id
    ON units(community_id);

COMMIT;