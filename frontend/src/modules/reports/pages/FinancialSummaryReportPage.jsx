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
  const today = new Date(), iso = (d) => d.toISOString().split("T")[0];
  switch (preset) {
    case "LAST_30_DAYS": return { from: iso(new Date(+today - 30 * 86400000)), to: iso(today) };
    case "LAST_QUARTER": { const t = new Date(today); t.setMonth(t.getMonth() - 3); return { from: iso(t), to: iso(today) }; }
    case "LAST_YEAR":    { const y = today.getFullYear() - 1; return { from: `${y}-01-01`, to: `${y}-12-31` }; }
    case "THIS_YEAR":    return { from: `${today.getFullYear()}-01-01`, to: iso(today) };
    default:             return { from: null, to: null };
  }
}

export default function FinancialSummaryReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [dateRange, setDateRange]       = useState("LAST_30_DAYS");
  const [from, setFrom]                 = useState("");
  const [to, setTo]                     = useState("");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);
  // rows is either a single-assoc row or multiple rows for "All Associations"
  const [rows, setRows]                 = useState([]);
  const [periodLabel, setPeriodLabel]   = useState("");

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected Association"
    : "All Associations";

  const handleGenerate = async () => {
    let rf = from, rt = to;
    if (dateRange !== "CUSTOM") {
      const d = resolveDateRange(dateRange); rf = d.from; rt = d.to;
      setPeriodLabel(DATE_OPTIONS.find((o) => o.value === dateRange)?.label ?? dateRange);
    } else {
      if (!from || !to) { toast.error("Provide From and To dates"); return; }
      setPeriodLabel(`${from} to ${to}`);
    }
    try {
      setLoading(true);

      if (associationId) {
        // Single association
        const res = await httpClient.get("/api/v1/reports/association/financial-summary", {
          params: { associationId, from: rf, to: rt },
        });
        const d = res.data.data;
        setReport(d);
        const assoc = associations.find((a) => String(a.id) === associationId);
        setRows([{
          associationName: assoc?.name ?? "Selected Association",
          units:           assoc?.totalUnits ?? "—",
          occupancyRate:   null,
          income:          d.totalRevenue,
          expenses:        d.totalExpenses,
          net:             d.netIncome,
        }]);
      } else {
        // All associations — call per association and aggregate
        const calls = await Promise.all(
          associations.map((a) =>
            httpClient.get("/api/v1/reports/association/financial-summary", {
              params: { associationId: a.id, from: rf, to: rt },
            }).then((r) => ({ assoc: a, data: r.data.data }))
              .catch(() => ({ assoc: a, data: null }))
          )
        );
        const builtRows = calls
          .filter((c) => c.data != null)
          .map((c) => ({
            associationName: c.assoc.name,
            units:           c.assoc.totalUnits ?? "—",
            occupancyRate:   null,
            income:          c.data.totalRevenue,
            expenses:        c.data.totalExpenses,
            net:             c.data.netIncome,
          }));

        // Aggregate totals
        const aggIncome   = builtRows.reduce((s, r) => s + Number(r.income   ?? 0), 0);
        const aggExpenses = builtRows.reduce((s, r) => s + Number(r.expenses ?? 0), 0);
        const aggNet      = aggIncome - aggExpenses;

        // Use last response's structure for the aggregate
        setReport({
          totalRevenue:  aggIncome,
          totalExpenses: aggExpenses,
          netIncome:     aggNet,
        });
        setRows(builtRows);
      }
    } catch (err) {
      toast.error("Failed to generate report", err);
    } finally {
      setLoading(false);
    }
  };

  const hasMultiRow = rows.length > 1;
  const totalUnitsSum = rows.reduce((s, r) => s + (Number(r.units) || 0), 0);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem; }
          #no-print { display: none !important; }
        }
      `}</style>

      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <h1 className="text-2xl font-semibold text-gray-900">Financial Summary Report</h1>

        {/* Parameters card */}
        <div id="no-print" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
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
            {report && (
              <button onClick={() => window.print()} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Print / Save PDF
              </button>
            )}
            <button onClick={handleGenerate} disabled={loading}
              className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}>
              {loading ? "Generating…" : "Generate Report"}
            </button>
          </div>
        </div>

        {/* Report output */}
        <div id="print-area" className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {!report ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <p className="font-medium text-gray-500">Report Preview</p>
              <p>Select report parameters above and click "Generate Report" to view results</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Centred title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Financial Summary Report</h2>
                <p className="text-sm text-gray-500">{assocLabel}</p>
                <p className="text-sm text-gray-500">Period: {periodLabel}</p>
                <p className="text-xs text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              {/* Table — Association | Units | Occupancy | Total Revenue | Total Expenses | Net Income */}
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-700">Association</th>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Units</th>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Occupancy</th>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Total Revenue</th>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Total Expenses</th>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Net Income</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      <td className="border border-gray-200 px-3 py-2 text-gray-800">{row.associationName}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">{row.units}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                        {row.occupancyRate != null ? `${Number(row.occupancyRate).toFixed(0)}%` : "—"}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">{fmt(row.income)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">{fmt(row.expenses)}</td>
                      <td className={`border border-gray-200 px-3 py-2 text-right font-medium ${(row.net ?? 0) >= 0 ? "text-green-700" : "text-red-600"}`}>
                        {fmt(row.net)}
                      </td>
                    </tr>
                  ))}
                  {/* Total row for multi-association */}
                  {hasMultiRow && (
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-gray-300 px-3 py-2">Total</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{totalUnitsSum || "—"}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">—</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{fmt(report.totalRevenue)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{fmt(report.totalExpenses)}</td>
                      <td className={`border border-gray-300 px-3 py-2 text-right ${(report.netIncome ?? 0) >= 0 ? "text-green-700" : "text-red-600"}`}>
                        {fmt(report.netIncome)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}