import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBudgetVsActual, getBudgets, resolveDateRange } from "../api/financialReportsApi";
import { getAssociations } from "@/modules/associations/associationApi";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const pct = (n) =>
  `${(n ?? 0).toFixed(1)}%`;

const DATE_OPTS = [
  { value: "THIS_YEAR",    label: "This Year"    },
  { value: "LAST_YEAR",    label: "Last Year"    },
  { value: "THIS_QUARTER", label: "This Quarter" },
  { value: "CUSTOM",       label: "Custom Range" },
];

export default function BudgetVsActualReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [budgets, setBudgets]           = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [budgetId, setBudgetId]         = useState("");
  const [accountingBasis, setBasis]     = useState("ACCRUAL");
  const [dateRange, setDateRange]       = useState("THIS_YEAR");
  const [from, setFrom]                 = useState("");
  const [to, setTo]                     = useState("");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
    getBudgets().then((r) => setBudgets(r.data?.data ?? r.data ?? []));
  }, []);

  // Reload budgets when association filter changes
  useEffect(() => {
    getBudgets(associationId || undefined).then((r) => {
      setBudgets(r.data?.data ?? r.data ?? []);
      setBudgetId(""); // reset selection
    });
  }, [associationId]);

  const handleGenerate = async () => {
    if (!budgetId) { toast.error("Please select a budget"); return; }
    let rf = from, rt = to;
    if (dateRange !== "CUSTOM") { const d = resolveDateRange(dateRange); rf = d.from; rt = d.to; }
    else if (!from || !to) { toast.error("Provide From and To dates"); return; }
    try {
      setLoading(true);
      const res = await getBudgetVsActual({
        budgetId, accountingBasis,
        from: rf, to: rt,
      });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate Budget vs Actual report"); }
    finally { setLoading(false); }
  };

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected"
    : "All Associations";

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900">Budget vs Actual Report</h1>

      {/* Parameters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Report Parameters</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Association</label>
            <select value={associationId} onChange={(e) => setAssocId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Associations</option>
              {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Budget <span className="text-red-500">*</span>
            </label>
            <select value={budgetId} onChange={(e) => setBudgetId(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm ${
                !budgetId ? "border-gray-300" : "border-blue-400"}`}>
              <option value="">Select Budget</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.fiscalYear})
                </option>
              ))}
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
          <div>
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
          <button onClick={handleGenerate} disabled={loading || !budgetId}
            className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}>
            {loading ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-600">
        <p className="font-semibold text-gray-800 mb-1">About This Report</p>
        <p>The Budget vs Actual Report compares budgeted amounts against actual transactions for the selected period.
          It shows variances and variance percentages to help you track financial performance against your budget.
          Positive variances for income indicate actual exceeded budget, while positive variances for expenses
          indicate under budget spending.</p>
      </div>

      {/* Output */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Budget vs Actual Report</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Download PDF</button>
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Download CSV</button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-lg font-bold text-gray-900">{assocLabel}</p>
            <p className="text-sm text-gray-500">Budget: {report.budgetName}</p>
            <p className="text-sm text-gray-500">Period: {report.from} to {report.to}</p>
            <p className="text-sm text-gray-500 mb-5">Accounting Basis: {report.accountingBasis}</p>

            {/* INCOME table */}
            <BVASection title="INCOME" rows={report.incomeRows}
              budgetTotal={report.totalBudgetedIncome} actualTotal={report.totalActualIncome}
              sectionLabel="Total Income" isIncome={true} />

            {/* EXPENSES table */}
            <BVASection title="EXPENSES" rows={report.expenseRows}
              budgetTotal={report.totalBudgetedExpenses} actualTotal={report.totalActualExpenses}
              sectionLabel="Total Expenses" isIncome={false} />

            {/* NET INCOME row */}
            <div className="flex justify-between items-center border-t-2 border-gray-800 pt-3 mt-2">
              <span className="text-sm font-bold text-gray-900 uppercase w-1/3">NET INCOME</span>
              <span className="text-sm font-bold text-gray-900 text-right w-1/6">{fmt(report.budgetedNetIncome)}</span>
              <span className="text-sm font-bold text-gray-900 text-right w-1/6">{fmt(report.actualNetIncome)}</span>
              <span className={`text-sm font-bold text-right w-1/6 ${
                (report.actualNetIncome ?? 0) >= (report.budgetedNetIncome ?? 0)
                  ? "text-green-600" : "text-red-600"}`}>
                {fmt((report.budgetedNetIncome ?? 0) - (report.actualNetIncome ?? 0))}
              </span>
              <span className="w-1/6" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BVASection({ title, rows, budgetTotal, actualTotal, sectionLabel, isIncome }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">{title}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-1.5 text-gray-500 font-medium w-24">Account Code</th>
            <th className="text-left py-1.5 text-gray-500 font-medium">Account Name</th>
            <th className="text-right py-1.5 text-gray-500 font-medium">Budgeted</th>
            <th className="text-right py-1.5 text-gray-500 font-medium">Actual</th>
            <th className="text-right py-1.5 text-gray-500 font-medium">Variance</th>
            <th className="text-right py-1.5 text-gray-500 font-medium">Variance%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows && rows.map((row) => {
            // Good variance: income over-budget = positive variance; expense under-budget = positive variance
            const isGood = isIncome
              ? (row.actualAmount ?? 0) >= (row.budgetedAmount ?? 0)
              : (row.actualAmount ?? 0) <= (row.budgetedAmount ?? 0);
            return (
              <tr key={row.accountCode}>
                <td className="py-2 text-gray-700">{row.accountCode}</td>
                <td className="py-2 text-gray-700">{row.accountName}</td>
                <td className="py-2 text-right text-gray-900">{fmt(row.budgetedAmount)}</td>
                <td className="py-2 text-right text-gray-900">{fmt(row.actualAmount)}</td>
                <td className={`py-2 text-right font-medium ${isGood ? "text-green-600" : "text-red-600"}`}>
                  {fmt(row.variance)}
                </td>
                <td className={`py-2 text-right font-medium ${isGood ? "text-green-600" : "text-red-600"}`}>
                  {pct(row.variancePercentage)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1">
        <span className="text-sm font-semibold text-gray-700 w-1/3">{sectionLabel}</span>
        <span className="text-sm font-semibold text-right w-1/6">{fmt(budgetTotal)}</span>
        <span className="text-sm font-semibold text-right w-1/6">{fmt(actualTotal)}</span>
        <span className="w-1/3" />
      </div>
    </div>
  );
}