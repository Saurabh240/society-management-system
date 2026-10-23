-- V26: Add isCompany and defaultExpenseAccountId to vendors table
-- Also relax firstName, lastName, companyName to nullable for flexible vendor type support

ALTER TABLE vendors
    ADD COLUMN is_company BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN default_expense_account_id BIGINT,
    ALTER COLUMN first_name DROP NOT NULL,
    ALTER COLUMN last_name DROP NOT NULL,
    ALTER COLUMN company_name DROP NOT NULL;

-- Add foreign key constraint to chart_of_accounts
ALTER TABLE vendors
    ADD CONSTRAINT fk_vendors_default_expense_account
    FOREIGN KEY (default_expense_account_id)
    REFERENCES chart_of_accounts(id)
    ON DELETE SET NULL;
