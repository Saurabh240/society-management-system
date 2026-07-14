// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/modules/reports/routes.jsx  — REPLACE EXISTING FILE
// ─────────────────────────────────────────────────────────────────────────────
import { Route } from "react-router-dom";

// Financial report pages (already exist in branch)
import BalanceSheetReportPage    from "./pages/BalanceSheetReportPage";
import IncomeStatementReportPage from "./pages/IncomeStatementReportPage";
import TrialBalanceReportPage    from "./pages/TrialBalanceReportPage";
import CashflowReportPage        from "./pages/CashflowReportPage";
import VendorLedgerReportPage    from "./pages/VendorLedgerReportPage";
import BudgetVsActualReportPage  from "./pages/BudgetVsActualReportPage";

// Index pages (new)
import ReportsIndexPage          from "./pages/ReportsIndexPage";
import AssociationReportsPage    from "./pages/AssociationReportsPage";
import FinancialReportsPage      from "./pages/FinancialReportsPage";

// Association report pages (new)
import FinancialSummaryReportPage   from "./pages/FinancialSummaryReportPage";
import UnitOccupancyReportPage      from "./pages/UnitOccupancyReportPage";
import DelinquencyReportPage        from "./pages/DelinquencyReportPage";
import VendorSpendingReportPage     from "./pages/VendorSpendingReportPage";
import AssessmentHistoryReportPage  from "./pages/AssessmentHistoryReportPage";
import UnitOwnerStatementPage       from "./pages/UnitOwnerStatementPage";

export const financialReportRoutes = (
  <>
    {/* Reports index with Association/Financial tabs */}
    <Route path="reports"                                  element={<ReportsIndexPage           />} />

    {/* Association Reports index */}
    <Route path="reports/association"                      element={<AssociationReportsPage     />} />

    {/* Association report detail pages */}
    <Route path="reports/association/financial-summary"    element={<FinancialSummaryReportPage  />} />
    <Route path="reports/association/unit-occupancy"       element={<UnitOccupancyReportPage     />} />
    <Route path="reports/association/delinquency"          element={<DelinquencyReportPage       />} />
    <Route path="reports/association/vendor-spending"      element={<VendorSpendingReportPage    />} />
    <Route path="reports/association/assessment-history"   element={<AssessmentHistoryReportPage />} />
    <Route path="reports/association/unit-owner-statement" element={<UnitOwnerStatementPage      />} />

    {/* Financial Reports index */}
    <Route path="reports/financial"                        element={<FinancialReportsPage       />} />

    {/* Financial report detail pages */}
    <Route path="reports/balance-sheet"                    element={<BalanceSheetReportPage    />} />
    <Route path="reports/income-statement"                 element={<IncomeStatementReportPage />} />
    <Route path="reports/trial-balance"                    element={<TrialBalanceReportPage    />} />
    <Route path="reports/cash-flow"                        element={<CashflowReportPage        />} />
    <Route path="reports/vendor-ledger"                    element={<VendorLedgerReportPage    />} />
    <Route path="reports/budget-vs-actual"                 element={<BudgetVsActualReportPage  />} />
  </>
);