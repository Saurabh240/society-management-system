import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ASSOCIATION_REPORTS = [
  { title: "Financial Summary",      description: "Overview of financial performance by association",                    path: "/dashboard/reports/association/financial-summary"      },
  { title: "Unit Occupancy",         description: "Current occupancy status and trends for all units",                  path: "/dashboard/reports/association/unit-occupancy"         },
  { title: "Delinquency Report",     description: "Outstanding balances and payment status by unit",                    path: "/dashboard/reports/association/delinquency"            },
  { title: "Vendor Spending",        description: "Analysis of vendor expenses and payment history",                    path: "/dashboard/reports/association/vendor-spending"        },
  { title: "Assessment History",     description: "Historical assessment charges and changes over time",                path: "/dashboard/reports/association/assessment-history"     },
  { title: "Unit Owner Statement",   description: "Detailed statement of charges and payments for individual unit owners", path: "/dashboard/reports/association/unit-owner-statement" },
];

const FINANCIAL_REPORTS = [
  { title: "Balance Sheet",          description: "Assets, liabilities, and equity at a specific point in time",       path: "/dashboard/reports/balance-sheet"     },
  { title: "Income Statement (P&L)", description: "Revenue and expenses over a period of time",                       path: "/dashboard/reports/income-statement"  },
  { title: "Cash Flow Statement",    description: "Cash inflows and outflows by category",                            path: "/dashboard/reports/cash-flow"         },
  { title: "Trial Balance",          description: "Summary of all account balances to verify debits equal credits",   path: "/dashboard/reports/trial-balance"     },
  { title: "Vendor Ledger",          description: "Detailed transaction history and balances for all vendors",        path: "/dashboard/reports/vendor-ledger"     },
  { title: "Budget vs Actual",       description: "Comparison of budgeted amounts versus actual income and expenses",  path: "/dashboard/reports/budget-vs-actual"  },
];

export default function ReportsIndexPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("association"); // "association" | "financial"

  const reports = tab === "association" ? ASSOCIATION_REPORTS : FINANCIAL_REPORTS;
  const headerLabel = tab === "association" ? "Available Reports" : "Available Financial Reports";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-5">Reports</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        <button
          onClick={() => setTab("association")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
            tab === "association"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Association Reports
        </button>
        <button
          onClick={() => setTab("financial")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
            tab === "financial"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Financial Reports
        </button>
      </div>

      {/* Report list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="px-5 py-3" style={{ backgroundColor: "var(--color-primary)" }}>
          <span className="text-sm font-semibold text-white">{headerLabel}</span>
        </div>

        <div className="divide-y divide-gray-100">
          {reports.map((report) => (
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