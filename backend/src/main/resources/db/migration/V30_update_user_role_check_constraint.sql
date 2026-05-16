-- Drop existing constraint
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

-- Recreate with new allowed values
ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (
    role IN (
        'PLATFORM_ADMIN',
        'TENANT_ADMIN',
        'MANAGER',
        'VIEWER'
    )
);