ALTER TABLE subscriptions ADD COLUMN plan_name         VARCHAR(100);
ALTER TABLE subscriptions ADD COLUMN next_billing_date DATE;