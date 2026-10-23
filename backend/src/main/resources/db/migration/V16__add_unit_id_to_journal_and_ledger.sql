-- Unit Ledger page (GET /api/v1/units/{unitId}/ledger and .../ledger/summary)
-- was showing wrong data for two independent reasons, both rooted in the same
-- gap: ledger_entries (and journal_lines) never recorded which unit a line
-- belonged to.
--
--   1. UnitLedgerServiceImpl.getSummary()/getTransactions() could only filter
--      by associationId, so a unit's ledger page showed (and summed) every
--      other unit's charges/payments in the same association too.
--   2. JournalService.createLedgerEntries() intentionally creates one Ledger
--      row per (line x AccountingBasis) when a line's basis is BOTH or null
--      (JournalLineRequest's compact constructor defaults a missing basis to
--      BOTH) - correct for dual-basis bookkeeping, but any screen that reads
--      the ledger without filtering by a single accounting basis then shows
--      the same real-world transaction twice. That's the "Record Banking
--      Transaction create two rows" / duplicate "Payment received - Cash"
--      report.
--
-- This migration adds the missing unit_id column so unit-scoped reads can
-- finally filter by the right unit. Existing rows are left with unit_id =
-- NULL (there is no reliable way to backfill which unit a historical, purely
-- free-text-described ledger line belonged to); going forward,
-- UnitInvoiceService stamps unit_id on every line it creates.

ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS unit_id BIGINT NULL;
ALTER TABLE journal_lines  ADD COLUMN IF NOT EXISTS unit_id BIGINT NULL;

CREATE INDEX IF NOT EXISTS idx_ledger_entries_tenant_unit ON ledger_entries (tenant_id, unit_id);