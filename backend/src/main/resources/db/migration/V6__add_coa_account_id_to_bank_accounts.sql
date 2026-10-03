
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS coa_account_id BIGINT REFERENCES chart_of_accounts(id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_coa_account_id ON bank_accounts(coa_account_id);