import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import httpClient from "@/api/httpClient";
import { toast } from "react-toastify";

export default function UnitOccupancyReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [dateRange, setDateRange]       = useState("CURRENT");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);
  const [assocRows, setAssocRows]       = useState([]); // per-assoc summary rows
  const [periodLabel, setPeriodLabel]   = useState("Current Status");

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const dateLabels = { CURRENT: "Current Status", LAST_30_DAYS: "Last 30 Days", LAST_QUARTER: "Last Quarter", LAST_YEAR: "Last Year" };

  const handleGenerate = async () => {
    setPeriodLabel(dateLabels[dateRange] ?? dateRange);
    try {
      setLoading(true);
      if (associationId) {
        // Single association
        const res = await httpClient.get("/api/v1/reports/association/unit-occupancy", {
          params: { associationId, dateRange },
        });
        const d = res.data.data;
        setReport(d);
        const assoc = associations.find((a) => String(a.id) === associationId);
        setAssocRows([{
          name:          assoc?.name ?? "Selected",
          total:         d.totalUnits,
          occupied:      d.occupiedUnits,
          vacant:        d.vacantUnits,
          occupancyRate: d.occupancyRate,
        }]);
      } else {
        // All associations — call per association, aggregate
        const calls = await Promise.all(
          associations.map((a) =>
            httpClient.get("/api/v1/reports/association/unit-occupancy", {
              params: { associationId: a.id, dateRange },
            }).then((r) => ({ assoc: a, data: r.data.data }))
              .catch(() => ({ assoc: a, data: null }))
          )
        );
        const built = calls
          .filter((c) => c.data != null)
          .map((c) => ({
            name:          c.assoc.name,
            total:         c.data.totalUnits,
            occupied:      c.data.occupiedUnits,
            vacant:        c.data.vacantUnits,
            occupancyRate: c.data.occupancyRate,
          }));
        setAssocRows(built);

        // Aggregate totals for stat cards
        const totalUnits    = built.reduce((s, r) => s + r.total,    0);
        const totalOccupied = built.reduce((s, r) => s + r.occupied, 0);
        const totalVacant   = built.reduce((s, r) => s + r.vacant,   0);
        const totalRate     = totalUnits > 0 ? (totalOccupied / totalUnits * 100) : 0;
        setReport({ totalUnits, occupiedUnits: totalOccupied, vacantUnits: totalVacant, occupancyRate: totalRate });
      }
    } catch { toast.error("Failed to generate report"); }
    finally { setLoading(false); }
  };

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected"
    : "All Associations";

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
        <h1 className="text-2xl font-semibold text-gray-900">Unit Occupancy Report</h1>

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

        <div id="print-area" className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {!report ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <p className="font-medium text-gray-500">Report Preview</p>
              <p>Select report parameters above and click "Generate Report" to view results</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Unit Occupancy Report</h2>
                <p className="text-sm text-gray-500">{assocLabel}</p>
                <p className="text-sm text-gray-500">Period: {periodLabel}</p>
                <p className="text-xs text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              {/* Per-association table */}
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
                  {assocRows.map((row, i) => (
                    <tr key={i}>
                      <td className="border border-gray-200 px-3 py-2 text-gray-800">{row.name}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">{row.total}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">{row.occupied}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">{row.vacant}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-medium">
                        {Number(row.occupancyRate ?? 0).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                  {assocRows.length > 1 && (
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-gray-300 px-3 py-2">Total</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{report.totalUnits}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{report.occupiedUnits}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{report.vacantUnits}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{Number(report.occupancyRate ?? 0).toFixed(0)}%</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Summary stat cards at bottom */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Units",    value: report.totalUnits    },
                  { label: "Occupied",       value: report.occupiedUnits },
                  { label: "Vacant",         value: report.vacantUnits   },
                  { label: "Occupancy Rate", value: `${Number(report.occupancyRate ?? 0).toFixed(0)}%` },
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