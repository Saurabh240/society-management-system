-- Add temporary_password column
ALTER TABLE users
ADD COLUMN temporary_password BOOLEAN;

-- Add temp_password_expiry column
ALTER TABLE users
ADD COLUMN temp_password_expiry TIMESTAMP;

-- Set default values for existing users
UPDATE users
SET temporary_password = false
WHERE temporary_password IS NULL;

-- Make temporary_password NOT NULL
ALTER TABLE users
ALTER COLUMN temporary_password SET NOT NULL;