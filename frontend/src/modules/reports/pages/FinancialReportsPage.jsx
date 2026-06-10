import { useNavigate } from "react-router-dom";

const FINANCIAL_REPORTS = [
  {
    title:       "Balance Sheet",
    description: "Summary of assets, liabilities, and equity at a specific point in time",
    path:        "/dashboard/reports/balance-sheet",
  },
  {
    title:       "Income Statement",
    description: "Revenue and expenses over a period of time showing net income",
    path:        "/dashboard/reports/income-statement",
  },
  {
    title:       "Cash Flow Statement",
    description: "Cash inflows and outflows from operating, investing, and financing activities",
    path:        "/dashboard/reports/cash-flow",
  },
  {
    title:       "Trial Balance",
    description: "List of all general ledger accounts with debit and credit balances",
    path:        "/dashboard/reports/trial-balance",
  },
  {
    title:       "Vendor Ledger",
    description: "Detailed transaction history and balances for all vendors",
    path:        "/dashboard/reports/vendor-ledger",
  },
  {
    title:       "Budget vs Actual",
    description: "Comparison of budgeted amounts versus actual income and expenses",
    path:        "/dashboard/reports/budget-vs-actual",
  },
];

export default function FinancialReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Financial Reports</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="px-5 py-3" style={{ backgroundColor: "var(--color-primary)" }}>
          <span className="text-sm font-semibold text-white">Available Reports</span>
        </div>

        {/* Report list */}
        <div className="divide-y divide-gray-100">
          {FINANCIAL_REPORTS.map((report) => (
            <button
              key={report.path}
              onClick={() => navigate(report.path)}
              className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900">{report.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}