// ─────────────────────────────────────────────────────────────────────────────
// FILE: modules/reports/pages/TrialBalanceReportPage.jsx
// Matches screenshot 7 exactly
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTrialBalance, resolveDateRange } from "../api/financialReportsApi";
import { getAssociations } from "@/modules/associations/associationApi";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const DATE_OPTS = [
  { value: "THIS_QUARTER", label: "This Quarter" },
  { value: "LAST_QUARTER", label: "Last Quarter" },
  { value: "THIS_YEAR",    label: "This Year"    },
  { value: "LAST_YEAR",    label: "Last Year"    },
  { value: "CUSTOM",       label: "Custom Range" },
];

export function TrialBalanceReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations]   = useState([]);
  const [associationId, setAssociationId] = useState("");
  const [accountingBasis, setBasis]       = useState("ACCRUAL");
  const [dateRange, setDateRange]         = useState("THIS_QUARTER");
  const [from, setFrom]                   = useState("");
  const [to, setTo]                       = useState("");
  const [loading, setLoading]             = useState(false);
  const [report, setReport]               = useState(null);

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const handleGenerate = async () => {
    let rf = from, rt = to;
    if (dateRange !== "CUSTOM") { const d = resolveDateRange(dateRange); rf = d.from; rt = d.to; }
    else if (!from || !to) { toast.error("Provide From and To dates"); return; }
    try {
      setLoading(true);
      const res = await getTrialBalance({ associationId: associationId || undefined, from: rf, to: rt, accountingBasis });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate trial balance"); }
    finally { setLoading(false); }
  };

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected"
    : "All Associations";

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900">Trial Balance Report</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Report Parameters</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Association</label>
            <select value={associationId} onChange={(e) => setAssociationId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Associations</option>
              {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Accounting Basis</label>
            <select value={accountingBasis} onChange={(e) => setBasis(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="ACCRUAL">Accrual</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Account Selection</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" disabled>
              <option>All Accounts</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {DATE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {dateRange === "CUSTOM" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleGenerate} disabled={loading}
            className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}>
            {loading ? "Generating…" : "Generate Trial Balance"}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-600">
        <p className="font-semibold text-gray-800 mb-1">About This Report</p>
        <p className="mb-2">The Trial Balance is a report that lists all accounts and their balances at a specific
          point in time. It serves as a check to ensure that total debits equal total credits.</p>
        <p className="font-semibold text-gray-800">Purpose:</p>
        <ul className="list-disc ml-4 space-y-0.5">
          <li>Verify that the accounting equation (Assets = Liabilities + Equity) is in balance</li>
          <li>Identify errors in journal entries before preparing financial statements</li>
          <li>Provide a summary of all account balances for a given period</li>
        </ul>
        <p className="mt-2 text-gray-500">Note: Only accounts with balances during the selected period will be displayed.</p>
      </div>

      {/* Output */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Trial Balance Report</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Download PDF</button>
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Download CSV</button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-lg font-bold text-gray-900">{assocLabel}</p>
            <p className="text-sm text-gray-500 mb-0.5">TRIAL BALANCE</p>
            <p className="text-sm text-gray-500">{report.from} to {report.to}</p>
            <p className="text-sm text-gray-500 mb-4">Accounting Basis: {report.accountingBasis}</p>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Account Code</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Account Name</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Debit Balance</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Credit Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(report.accounts || []).map((row) => (
                  <tr key={row.accountCode}>
                    <td className="py-2 text-gray-700">{row.accountCode}</td>
                    <td className="py-2 text-gray-700">{row.accountName}</td>
                    <td className="py-2 text-right text-gray-900">{fmt(row.totalDebit)}</td>
                    <td className="py-2 text-right text-gray-900">{fmt(row.totalCredit)}</td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="border-t border-gray-300 font-semibold">
                  <td colSpan={2} className="py-2 text-gray-900">TOTAL</td>
                  <td className="py-2 text-right text-gray-900">{fmt(report.totalDebits)}</td>
                  <td className="py-2 text-right text-gray-900">{fmt(report.totalCredits)}</td>
                </tr>
              </tbody>
            </table>

            <div className={`mt-4 px-3 py-2 rounded-lg text-sm font-medium ${
              report.isBalanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {report.isBalanced ? "✓ Trial Balance is in balance" : "⚠ Trial Balance is OUT OF BALANCE"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrialBalanceReportPage;