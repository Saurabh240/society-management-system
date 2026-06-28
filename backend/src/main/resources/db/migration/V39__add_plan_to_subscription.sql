-- V39: Add plan selection fields to subscriptions table
-- FREE plan = 15 units free, then $1/unit/month
-- PAID (STANDARD) plan = 15 units free, then $1/unit/month on real data

ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS plan             VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    ADD COLUMN IF NOT EXISTS plan_selected    BOOLEAN      NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS plan_selected_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS stripe_customer_id        VARCHAR(100),
    ADD COLUMN IF NOT EXISTS stripe_subscription_id    VARCHAR(100);

-- Update existing subscriptions to mark plan as already selected
-- so existing tenants don't get redirected to plan selection
UPDATE subscriptions SET plan_selected = TRUE WHERE plan_selected IS FALSE OR plan_selected IS NULL;

-- Update unit_limit to 15 for any FREE subscriptions that have 0 as limit
UPDATE subscriptions SET unit_limit = 15 WHERE unit_limit = 0;

-- Also add company_name unique index to tenants for signup guard
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_name_lower ON tenants (LOWER(name));