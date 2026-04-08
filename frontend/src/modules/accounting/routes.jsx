import { Route, Navigate } from "react-router-dom";
import AccountingPage from "./pages/AccountingPage";
import OverviewTab from "./components/OverviewTab";
import AddAccountPage from "./pages/AddAccountPage"; 
import GeneralLedgerTab from "./components/GeneralLedgerTab";
import BankingTab from "./components/BankingTab";
import BillsTab from "./components/BillsTab";
import ReportsTab from "./components/ReportsTab"; 

export const accountingRoutes = (
  <>
    {/* Tab Layout */}
    <Route path="accounting" element={<AccountingPage />}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview" element={<OverviewTab />} />
      <Route path="general-ledger" element={<GeneralLedgerTab />} />
      <Route path="banking"        element={<BankingTab />} />
      <Route path="bills"          element={<BillsTab />} />
      <Route path="reports"        element={<ReportsTab />} />
  
     
    </Route>

    {/* Full Page Routes */}
    <Route path="accounting/accounts/create" element={<AddAccountPage />} />
    <Route path="accounting/accounts/edit/:id" element={<AddAccountPage />} />
  </>
);