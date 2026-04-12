import { Route, Navigate } from "react-router-dom";
import AccountingPage       from "./pages/AccountingPage";
import ChartOfAccountsPage  from "./pages/ChartOfAccountsPage";
import OverviewTab          from "./components/OverviewTab";
import GeneralLedgerTab     from "./components/GeneralLedgerTab";
import BankingTab           from "./components/BankingTab";
import BillsTab             from "./components/BillsTab";
import ReportsTab           from "./components/ReportsTab";
import AddAccountPage       from "./pages/AddAccountPage";
import RecordJournalEntryPage  from "./pages/RecordJournalEntryPage";
import AddBankingPage       from "./pages/AddBankingPage";



// Placeholders — replace with real components when ready
const BalanceSheetTab  = () => <div>Balance Sheet</div>;
const AddBillPage      = () => <div>Add Bill</div>;

export const accountingRoutes = (
  <>
    {/* ── Tab Layout (renders inside <AccountingPage /> via <Outlet />) ── */}
     <Route path="accounting" element={<AccountingPage />}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview"       element={<OverviewTab />} />
      <Route path="general-ledger" element={<GeneralLedgerTab />} />
      <Route path="banking"        element={<BankingTab />} />
      <Route path="bills"          element={<BillsTab />} />
      <Route path="reports"        element={<ReportsTab />}>
        <Route index element={<Navigate to="balance-sheet" replace />} />
        <Route path="balance-sheet" element={<BalanceSheetTab />} />
      </Route>
    </Route>

    {/* ── Full-Page Routes (outside tab shell) ── */}
    <Route path="accounting/chart-of-accounts"          element={<ChartOfAccountsPage />} />
    <Route path="accounting/chart-of-accounts/create"   element={<AddAccountPage />} />
    <Route path="accounting/chart-of-accounts/edit/:id" element={<AddAccountPage />} />
    <Route path="accounting/journal-entry/create"       element={<RecordJournalEntryPage />} />
    <Route path="accounting/banking/create"             element={<AddBankingPage />} />
    <Route path="accounting/bills/create"               element={<AddBillPage />} />
    <Route path="accounting/bills/edit/:id"             element={<AddBillPage />} />
    
  </>
);

