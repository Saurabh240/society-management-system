DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'subscriptions_status_check'
    ) THEN
        ALTER TABLE subscriptions
        ADD CONSTRAINT subscriptions_status_check
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'));
    END IF;
END
$$;