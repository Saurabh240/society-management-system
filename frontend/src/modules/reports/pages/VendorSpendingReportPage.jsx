import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import httpClient from "@/api/httpClient";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const DATE_OPTS = [
  { value: "LAST_30_DAYS", label: "Last 30 Days" },
  { value: "LAST_QUARTER", label: "Last Quarter" },
  { value: "LAST_YEAR",    label: "Last Year"    },
  { value: "THIS_YEAR",    label: "This Year"    },
  { value: "CUSTOM",       label: "Custom Range" },
];

function resolveRange(preset) {
  const today = new Date(), iso = (d) => d.toISOString().split("T")[0];
  if (preset === "LAST_30_DAYS") return { from: iso(new Date(+today - 30 * 86400000)), to: iso(today) };
  if (preset === "LAST_QUARTER") { const t = new Date(today); t.setMonth(t.getMonth() - 3); return { from: iso(t), to: iso(today) }; }
  if (preset === "LAST_YEAR")    { const y = today.getFullYear() - 1; return { from: `${y}-01-01`, to: `${y}-12-31` }; }
  if (preset === "THIS_YEAR")    return { from: `${today.getFullYear()}-01-01`, to: iso(today) };
  return { from: null, to: null };
}

export default function VendorSpendingReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [dateRange, setDateRange]       = useState("LAST_YEAR");
  const [from, setFrom]                 = useState("");
  const [to, setTo]                     = useState("");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);
  const [periodLabel, setPeriodLabel]   = useState("");

  useEffect(() => { getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? [])); }, []);

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected"
    : "All Associations";

  const handleGenerate = async () => {
    let rf = from, rt = to;
    if (dateRange !== "CUSTOM") {
      const d = resolveRange(dateRange); rf = d.from; rt = d.to;
      setPeriodLabel(DATE_OPTS.find((o) => o.value === dateRange)?.label ?? dateRange);
    } else {
      if (!from || !to) { toast.error("Provide From and To dates"); return; }
      setPeriodLabel(`${from} to ${to}`);
    }
    try {
      setLoading(true);
      const res = await httpClient.get("/api/v1/reports/association/vendor-spending", {
        params: { ...(associationId ? { associationId } : {}), from: rf, to: rt },
      });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate report"); }
    finally { setLoading(false); }
  };

  // Top 5 vendors by total billed (sorted desc, take first 5)
  const top5 = report?.vendors
    ? [...report.vendors]
        .sort((a, b) => (b.totalBilled ?? 0) - (a.totalBilled ?? 0))
        .slice(0, 5)
    : [];

  const grandTotal = report?.vendors?.reduce((s, v) => s + (v.totalBilled ?? 0), 0) ?? 0;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; top: 0; left: 0; width: 100%; }
          #no-print { display: none !important; }
        }
      `}</style>

      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <h1 className="text-2xl font-semibold text-gray-900">Vendor Spending Report</h1>

        {/* Parameters */}
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
                {DATE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {dateRange === "CUSTOM" && (
              <>
                <div><label className="block text-sm font-medium text-gray-600 mb-1">From</label>
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-600 mb-1">To</label>
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
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

        {/* Output */}
        <div id="print-area" className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {!report ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <p className="font-medium text-gray-500">Report Preview</p>
              <p>Select report parameters above and click "Generate Report" to view results</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Vendor Spending Report</h2>
                <p className="text-sm text-gray-500">{assocLabel}</p>
                <p className="text-sm text-gray-500">Period: {periodLabel}</p>
                <p className="text-xs text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              {/* Section 1: Vendor Spending Details — matches Figma Image 7 top table */}
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Vendor Spending Details</h3>
              {report.vendors && report.vendors.length > 0 ? (
                <table className="w-full text-sm border-collapse mb-8">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-700">Vendor</th>
                      <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-700">Association</th>
                      <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-700">Category</th>
                      <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Invoice Count</th>
                      <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Total Spent</th>
                      <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Avg Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.vendors.map((v, i) => {
                      const avg = v.billCount > 0 ? (v.totalBilled ?? 0) / v.billCount : 0;
                      return (
                        <tr key={i}>
                          <td className="border border-gray-200 px-3 py-2 font-medium text-gray-800">{v.vendorName}</td>
                          <td className="border border-gray-200 px-3 py-2 text-gray-700">{v.associationName ?? assocLabel}</td>
                          <td className="border border-gray-200 px-3 py-2 text-gray-700">{v.serviceCategory}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right">{v.billCount}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right">{fmt(v.totalBilled)}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right">{fmt(avg)}</td>
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-gray-300 px-3 py-2" colSpan={3}>Total</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        {report.vendors.reduce((s, v) => s + (v.billCount ?? 0), 0)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{fmt(grandTotal)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">—</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4 mb-6">No vendor data found.</p>
              )}

              {/* Section 2: Top 5 Vendors by Spending — matches Figma Image 7 bottom table */}
              {top5.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Top 5 Vendors by Spending</h3>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-700">Rank</th>
                        <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-700">Vendor</th>
                        <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Total Spent</th>
                        <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Invoice Count</th>
                        <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top5.map((v, i) => {
                        const pct = grandTotal > 0 ? ((v.totalBilled ?? 0) / grandTotal * 100).toFixed(1) : "0.0";
                        return (
                          <tr key={i}>
                            <td className="border border-gray-200 px-3 py-2 text-center text-gray-600">{i + 1}</td>
                            <td className="border border-gray-200 px-3 py-2 font-medium text-gray-800">{v.vendorName}</td>
                            <td className="border border-gray-200 px-3 py-2 text-right">{fmt(v.totalBilled)}</td>
                            <td className="border border-gray-200 px-3 py-2 text-right">{v.billCount}</td>
                            <td className="border border-gray-200 px-3 py-2 text-right text-gray-600">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
