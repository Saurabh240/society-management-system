import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getIncomeStatement, resolveDateRange } from "../api/financialReportsApi";
import { getAssociations } from "@/modules/associations/associationApi";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const DATE_RANGE_OPTIONS = [
  { value: "THIS_QUARTER", label: "This Quarter" },
  { value: "LAST_QUARTER", label: "Last Quarter" },
  { value: "THIS_YEAR",    label: "This Year"    },
  { value: "LAST_YEAR",    label: "Last Year"    },
  { value: "CUSTOM",       label: "Custom Range" },
];

const ACCOUNT_OPTIONS = [
  { value: "ALL",          label: "All Income and Expense Accounts" },
  { value: "INCOME_ONLY",  label: "Income Only"                     },
  { value: "EXPENSE_ONLY", label: "Expenses Only"                   },
];

export default function IncomeStatementReportPage() {
  const navigate = useNavigate();

  const [associations, setAssociations]   = useState([]);
  const [associationId, setAssociationId] = useState("");
  const [accountingBasis, setBasis]       = useState("ACCRUAL");
  const [dateRange, setDateRange]         = useState("THIS_QUARTER");
  const [from, setFrom]                   = useState("");
  const [to, setTo]                       = useState("");
  const [accountSelection, setSelection]  = useState("ALL");
  const [loading, setLoading]             = useState(false);
  const [report, setReport]               = useState(null);

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const handleGenerate = async () => {
    let resolvedFrom = from;
    let resolvedTo   = to;
    if (dateRange !== "CUSTOM") {
      const dates = resolveDateRange(dateRange);
      resolvedFrom = dates.from;
      resolvedTo   = dates.to;
    } else if (!from || !to) {
      toast.error("Please provide both From and To dates for Custom range");
      return;
    }
    try {
      setLoading(true);
      const res = await getIncomeStatement({
        associationId: associationId || undefined,
        from: resolvedFrom, to: resolvedTo,
        accountingBasis, accountSelection,
      });
      setReport(res.data.data);
    } catch {
      toast.error("Failed to generate income statement");
    } finally {
      setLoading(false);
    }
  };

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected Association"
    : "All Associations";

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900">Income Statement Report</h1>

      {/* Parameters */}
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
            <label className="block text-sm font-medium text-gray-600 mb-1">Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {DATE_RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Account Selection</label>
            <select value={accountSelection} onChange={(e) => setSelection(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {ACCOUNT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleGenerate} disabled={loading}
            className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)" }}>
            {loading ? "Generating…" : "Generate Income Statement"}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-600">
        <p className="font-semibold text-gray-800 mb-1">About This Report</p>
        <p className="mb-2">The Income Statement (also known as Profit &amp; Loss statement) shows your organization's
          revenues and expenses over a specific period of time. It calculates net income by subtracting
          total expenses from total revenue.</p>
        <p className="font-semibold text-gray-800">Accounting Basis:</p>
        <p><strong>Accrual</strong> – Recognizes revenue when earned and expenses when incurred, regardless of when cash changes hands.</p>
        <p><strong>Cash</strong> – Recognizes revenue and expenses only when cash is received or paid.</p>
      </div>

      {/* Report output */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Income Statement Report</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Download PDF</button>
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Download CSV</button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-lg font-bold text-gray-900 mb-0.5">{assocLabel}</p>
            <p className="text-sm text-gray-500">{report.from} to {report.to}</p>
            <p className="text-sm text-gray-500 mb-5">Accounting Basis: {report.accountingBasis}</p>

            {/* INCOME */}
            <ISSection title="INCOME" items={report.revenue}
              totalLabel="Total Income" totalValue={report.totalRevenue} />

            {/* EXPENSES */}
            <ISSection title="EXPENSES" items={report.expenses}
              totalLabel="Total Expenses" totalValue={report.totalExpenses} />

            {/* NET INCOME */}
            <div className={`flex justify-between border-t-2 border-gray-800 pt-3 mt-2`}>
              <span className="text-sm font-bold text-gray-900 uppercase">NET INCOME</span>
              <span className={`text-sm font-bold ${(report.netIncome ?? 0) >= 0 ? "text-green-700" : "text-red-600"}`}>
                {fmt(report.netIncome)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ISSection({ title, items, totalLabel, totalValue }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">{title}</p>
      {items && items.length > 0 ? (
        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1.5 text-gray-500 font-medium w-32">Account Code</th>
              <th className="text-left py-1.5 text-gray-500 font-medium">Account Name</th>
              <th className="text-right py-1.5 text-gray-500 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.accountCode}>
                <td className="py-2 text-gray-700">{item.accountCode}</td>
                <td className="py-2 text-gray-700">{item.accountName}</td>
                <td className="py-2 text-right text-gray-900">{fmt(item.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <div className="flex justify-between border-t border-gray-200 pt-1.5">
        <span className="text-sm font-semibold text-gray-700">{totalLabel}</span>
        <span className="text-sm font-semibold text-gray-900">{fmt(totalValue)}</span>
      </div>
    </div>
  );
}