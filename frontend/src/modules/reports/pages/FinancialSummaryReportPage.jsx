// ─────────────────────────────────────────────────────────────────────────────
// FILE: modules/reports/pages/FinancialSummaryReportPage.jsx  (Image 5)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import httpClient from "@/api/httpClient";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const DATE_OPTIONS = [
  { value: "LAST_30_DAYS", label: "Last 30 Days" },
  { value: "LAST_QUARTER", label: "Last Quarter" },
  { value: "LAST_YEAR",    label: "Last Year"    },
  { value: "THIS_YEAR",    label: "This Year"    },
  { value: "CUSTOM",       label: "Custom Range" },
];

function resolveDateRange(preset) {
  const today   = new Date();
  const iso     = (d) => d.toISOString().split("T")[0];
  switch (preset) {
    case "LAST_30_DAYS": return { from: iso(new Date(today - 30 * 86400000)), to: iso(today) };
    case "LAST_QUARTER": {
      const t = new Date(today); t.setMonth(t.getMonth() - 3);
      return { from: iso(t), to: iso(today) };
    }
    case "LAST_YEAR": {
      const y = today.getFullYear() - 1;
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    }
    case "THIS_YEAR":    return { from: `${today.getFullYear()}-01-01`, to: iso(today) };
    default:             return { from: null, to: null };
  }
}

export function FinancialSummaryReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [dateRange, setDateRange]       = useState("LAST_30_DAYS");
  const [from, setFrom]                 = useState("");
  const [to, setTo]                     = useState("");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const handleGenerate = async () => {
    let rf = from, rt = to;
    if (dateRange !== "CUSTOM") { const d = resolveDateRange(dateRange); rf = d.from; rt = d.to; }
    else if (!from || !to) { toast.error("Provide From and To dates"); return; }
    try {
      setLoading(true);
      const res = await httpClient.get("/api/v1/reports/association/financial-summary", {
        params: { ...(associationId ? { associationId } : {}), from: rf, to: rt },
      });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate report"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">Financial Summary Report</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-2 gap-5 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Association</label>
            <select value={associationId} onChange={(e) => setAssocId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Associations</option>
              {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {DATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleGenerate} disabled={loading}
            className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}>
            {loading ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Report preview / output */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {!report ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <p className="font-medium text-gray-500">Report Preview</p>
            <p>Select report parameters above and click "Generate Report" to view results</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: "Total Income",       value: fmt(report.totalIncome)     },
                { label: "Total Expenses",     value: fmt(report.totalExpenses)   },
                { label: "Net Income",         value: fmt(report.netIncome)       },
                { label: "Total Bills Paid",   value: fmt(report.totalBillsPaid)  },
                { label: "Outstanding",        value: fmt(report.outstandingBalance) },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
            {report.byAssociation && report.byAssociation.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500">Association</th>
                    <th className="text-right py-2 text-gray-500">Income</th>
                    <th className="text-right py-2 text-gray-500">Expenses</th>
                    <th className="text-right py-2 text-gray-500">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.byAssociation.map((row) => (
                    <tr key={row.associationId}>
                      <td className="py-2 text-gray-700">{row.associationName}</td>
                      <td className="py-2 text-right">{fmt(row.income)}</td>
                      <td className="py-2 text-right">{fmt(row.expenses)}</td>
                      <td className={`py-2 text-right font-medium ${(row.net ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(row.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialSummaryReportPage;