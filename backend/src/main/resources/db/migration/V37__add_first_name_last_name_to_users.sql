-- Add new columns

ALTER TABLE users
    ADD COLUMN first_name VARCHAR(255);

ALTER TABLE users
    ADD COLUMN last_name VARCHAR(255);

-- Populate existing records (important if table already contains data)

UPDATE users
SET first_name = 'Unknown'
WHERE first_name IS NULL;

UPDATE users
SET last_name = 'User'
WHERE last_name IS NULL;

-- Make columns NOT NULL

ALTER TABLE users
    ALTER COLUMN first_name SET NOT NULL;

ALTER TABLE users
    ALTER COLUMN last_name SET NOT NULL;