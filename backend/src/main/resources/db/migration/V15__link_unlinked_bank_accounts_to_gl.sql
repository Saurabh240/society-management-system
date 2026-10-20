-- seed_tenant_data() creates each new tenant's default "Operating Account"
-- without a coa_account_id, and V12's backfill only covered bank accounts that
-- existed when it ran. Every tenant onboarded after V12 therefore has a bank
-- account that BillService.pay() / UnitInvoiceService.recordPayment() reject
-- with "Bank account has no linked COA account". This repeats V12's step 2 for
-- those accounts (idempotent; DataSeeder now links new tenants' accounts itself).

INSERT INTO chart_of_accounts
(tenant_id, account_code, account_name, account_type, notes, is_deleted, created_at)
SELECT b.tenant_id, 'BANK-' || b.id,
       COALESCE(b.bank_account_name, 'Bank Account ' || b.id),
       'ASSETS', 'Auto-created GL account for bank account (backfilled by V15)', false, NOW()
FROM bank_accounts b
WHERE b.coa_account_id IS NULL
    ON CONFLICT (tenant_id, account_code) DO NOTHING;

UPDATE bank_accounts b
SET coa_account_id = c.id
    FROM chart_of_accounts c
WHERE b.coa_account_id IS NULL
  AND c.tenant_id = b.tenant_id
  AND c.account_code = 'BANK-' || b.id;