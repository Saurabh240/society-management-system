import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import httpClient from "@/api/httpClient";
import { toast } from "react-toastify";

const pct = (n) => (n != null ? `${Number(n).toFixed(0)}%` : "—");

export default function UnitOccupancyReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [dateRange, setDateRange]       = useState("CURRENT");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);
  const [periodLabel, setPeriodLabel]   = useState("Current Status");

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected"
    : "All Associations";

  const dateLabels = { CURRENT: "Current Status", LAST_30_DAYS: "Last 30 Days", LAST_QUARTER: "Last Quarter", LAST_YEAR: "Last Year" };

  const handleGenerate = async () => {
    setPeriodLabel(dateLabels[dateRange] ?? dateRange);
    try {
      setLoading(true);
      const res = await httpClient.get("/api/v1/reports/association/unit-occupancy", {
        params: { ...(associationId ? { associationId } : {}), dateRange },
      });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate report"); }
    finally { setLoading(false); }
  };

  // Build per-association grouping from the flat units list
  const assocGroups = (() => {
    if (!report?.units) return [];
    const map = {};
    for (const u of report.units) {
      const key = u.associationName ?? "Unknown";
      if (!map[key]) map[key] = { name: key, total: 0, occupied: 0, vacant: 0 };
      map[key].total++;
      if (u.occupancyStatus === "VACANT") map[key].vacant++;
      else map[key].occupied++;
    }
    return Object.values(map);
  })();

  const totalOccupied = assocGroups.reduce((s, r) => s + r.occupied, 0);
  const totalVacant   = assocGroups.reduce((s, r) => s + r.vacant,   0);
  const totalUnits    = assocGroups.reduce((s, r) => s + r.total,    0);
  const totalRate     = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;

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

      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <h1 className="text-2xl font-semibold text-gray-900">Unit Occupancy Report</h1>

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
                <option value="CURRENT">Current</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="LAST_QUARTER">Last Quarter</option>
                <option value="LAST_YEAR">Last Year</option>
              </select>
            </div>
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
              {/* Centred title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Unit Occupancy Report</h2>
                <p className="text-sm text-gray-500">{assocLabel}</p>
                <p className="text-sm text-gray-500">Period: {periodLabel}</p>
                <p className="text-xs text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              {/* Per-association table — Association | Total Units | Occupied | Vacant | Occupancy Rate */}
              <table className="w-full text-sm border-collapse mb-6">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-700">Association</th>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Total Units</th>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Occupied</th>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Vacant</th>
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-right text-xs font-semibold text-gray-700">Occupancy Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {assocGroups.map((row, i) => (
                    <tr key={i}>
                      <td className="border border-gray-200 px-3 py-2 text-gray-800">{row.name}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">{row.total}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">{row.occupied}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">{row.vacant}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-medium">
                        {pct(row.total > 0 ? (row.occupied / row.total) * 100 : 0)}
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  {assocGroups.length > 1 && (
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-gray-300 px-3 py-2">Total</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{totalUnits}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{totalOccupied}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{totalVacant}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{pct(totalRate)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Summary stat cards at bottom — matches Figma Image 3 */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Units",    value: report.totalUnits   ?? totalUnits    },
                  { label: "Occupied",       value: report.ownerOccupied != null ? (report.ownerOccupied + (report.rented ?? 0)) : totalOccupied },
                  { label: "Vacant",         value: report.vacant       ?? totalVacant   },
                  { label: "Occupancy Rate", value: pct(report.occupancyRate ?? totalRate) },
                ].map((s) => (
                  <div key={s.label} className="border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
