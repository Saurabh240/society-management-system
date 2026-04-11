import { Route, Navigate } from "react-router-dom";

import AccountingPage      from "./pages/AccountingPage";

// These exist in components/ — imported from the correct path
import OverviewTab         from "./components/OverviewTab";
import GeneralLedgerTab    from "./components/GeneralLedgerTab";
import BankingTab          from "./components/BankingTab";
import BillsTab            from "./components/BillsTab";
import ReportsTab          from "./components/ReportsTab";

// These exist in pages/
import ChartOfAccountsPage from "./pages/ChartOfAccountsPage";
import AddAccountPage      from "./pages/AddAccountPage";

export const accountingRoutes = (
  <>
    <Route path="accounting" element={<AccountingPage />}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview"       element={<OverviewTab />}      />
      <Route path="general-ledger" element={<GeneralLedgerTab />} />
      <Route path="banking"        element={<BankingTab />}       />
      <Route path="bills"          element={<BillsTab />}         />
      <Route path="reports"        element={<ReportsTab />}       />
    </Route>

    <Route path="accounting/chart-of-accounts"          element={<ChartOfAccountsPage />} />
    <Route path="accounting/chart-of-accounts/create"   element={<AddAccountPage />}      />
    <Route path="accounting/chart-of-accounts/edit/:id" element={<AddAccountPage />}      />
  </>
);