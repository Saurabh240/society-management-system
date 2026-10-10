-- ─────────────────────────────────────────────────────────────────────────────
-- BACKFILL: data that V6 (coa_account_id) and V8 (amount_paid) added columns
-- for, but never populated for rows that already existed before this release.
-- All statements are idempotent and safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Bills that were already fully PAID before amount_paid existed default to
--    amount_paid = 0, which makes BillResponse report "remaining balance" as
--    the full original total_amount for every historical paid bill. Backfill
--    them to fully paid.
UPDATE bills
SET amount_paid = total_amount
WHERE status = 'PAID'
  AND amount_paid <> total_amount;

-- 2. Every bank account created before this release has coa_account_id = NULL
--    (V6 only added the column). BillService.pay() now throws when a bank
--    account has no linked GL account, and (until the application-side
--    fallback is removed) RecordTransactionPage silently posts deposits and
--    withdrawals for such accounts against an arbitrary Chart-of-Accounts
--    row instead. Give every such bank account its own dedicated GL account,
--    the same way BankingServiceImpl.createAccount() does for new ones.
DO $$
DECLARE
    acct RECORD;
    new_coa_id BIGINT;
BEGIN
    FOR acct IN
        SELECT id, tenant_id, bank_account_name
        FROM bank_accounts
        WHERE coa_account_id IS NULL
    LOOP
        INSERT INTO chart_of_accounts
            (tenant_id, account_code, account_name, account_type, notes, is_deleted, created_at)
        VALUES
            (acct.tenant_id,
             'BANK-' || acct.id,
             COALESCE(acct.bank_account_name, 'Bank Account ' || acct.id),
             'ASSETS',
             'Auto-created GL account for pre-existing bank account (backfilled by V11)',
             false,
             NOW())
        ON CONFLICT (tenant_id, account_code) DO NOTHING
        RETURNING id INTO new_coa_id;

        -- ON CONFLICT means no row id was returned (should not happen for a
        -- freshly minted 'BANK-<id>' code, but guard it rather than crash).
        IF new_coa_id IS NULL THEN
            SELECT id INTO new_coa_id
            FROM chart_of_accounts
            WHERE tenant_id = acct.tenant_id AND account_code = 'BANK-' || acct.id;
        END IF;

        UPDATE bank_accounts SET coa_account_id = new_coa_id WHERE id = acct.id;
    END LOOP;
END $$;

-- 3. UnitInvoiceService and BillService now resolve "Accounts Receivable" and
--    "Accounts Payable" by a hardcoded account code (1100 / 2000) instead of
--    "the first ASSETS/LIABILITIES account", which is what the seed procedure
--    (seed_tenant_data) creates for every *new* tenant. Any tenant whose seed
--    step failed or ran before these codes existed, or who deleted/renamed
--    that account, will now get a hard error creating invoices or paying
--    bills. Make sure every tenant that already has a Chart of Accounts also
--    has these two control accounts.
INSERT INTO chart_of_accounts (tenant_id, account_code, account_name, account_type, notes, is_deleted, created_at)
SELECT DISTINCT c.tenant_id, '1100', 'Accounts Receivable', 'ASSETS',
       'Owner dues and fees owed to HOA (backfilled by V11)', false, NOW()
FROM chart_of_accounts c
WHERE NOT EXISTS (
    SELECT 1 FROM chart_of_accounts x
    WHERE x.tenant_id = c.tenant_id AND x.account_code = '1100'
)
ON CONFLICT (tenant_id, account_code) DO NOTHING;

INSERT INTO chart_of_accounts (tenant_id, account_code, account_name, account_type, notes, is_deleted, created_at)
SELECT DISTINCT c.tenant_id, '2000', 'Accounts Payable', 'LIABILITIES',
       'Amounts owed to vendors (backfilled by V11)', false, NOW()
FROM chart_of_accounts c
WHERE NOT EXISTS (
    SELECT 1 FROM chart_of_accounts x
    WHERE x.tenant_id = c.tenant_id AND x.account_code = '2000'
)
ON CONFLICT (tenant_id, account_code) DO NOTHING;
