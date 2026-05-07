-- Add name column
ALTER TABLE users
ADD COLUMN name VARCHAR(255);

-- Add status column
ALTER TABLE users
ADD COLUMN status VARCHAR(20);

-- Set default values for existing records
UPDATE users SET name = email WHERE name IS NULL;
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;

-- Make columns NOT NULL after backfill
ALTER TABLE users
ALTER COLUMN name SET NOT NULL;

ALTER TABLE users
ALTER COLUMN status SET NOT NULL;