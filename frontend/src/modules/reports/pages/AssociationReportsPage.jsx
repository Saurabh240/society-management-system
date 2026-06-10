import { useNavigate } from "react-router-dom";

const ASSOCIATION_REPORTS = [
  {
    title:       "Financial Summary",
    description: "Overview of financial performance by association",
    path:        "/dashboard/reports/association/financial-summary",
  },
  {
    title:       "Unit Occupancy",
    description: "Current occupancy status and trends for all units",
    path:        "/dashboard/reports/association/unit-occupancy",
  },
  {
    title:       "Delinquency Report",
    description: "Outstanding balances and payment status by unit",
    path:        "/dashboard/reports/association/delinquency",
  },
  {
    title:       "Vendor Spending",
    description: "Analysis of vendor expenses and payment history",
    path:        "/dashboard/reports/association/vendor-spending",
  },
  {
    title:       "Assessment History",
    description: "Historical assessment charges and changes over time",
    path:        "/dashboard/reports/association/assessment-history",
  },
  {
    title:       "Unit Owner Statement",
    description: "Detailed statement of charges and payments for individual unit owners",
    path:        "/dashboard/reports/association/unit-owner-statement",
  },
];

export default function AssociationReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Association Reports</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="px-5 py-3" style={{ backgroundColor: "var(--color-primary)" }}>
          <span className="text-sm font-semibold text-white">Available Reports</span>
        </div>

        {/* Report list */}
        <div className="divide-y divide-gray-100">
          {ASSOCIATION_REPORTS.map((report) => (
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