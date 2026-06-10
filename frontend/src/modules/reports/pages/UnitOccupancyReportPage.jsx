import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import httpClient from "@/api/httpClient";
import { toast } from "react-toastify";

export function UnitOccupancyReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [dateRange, setDateRange]       = useState("CURRENT");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await httpClient.get("/api/v1/reports/association/unit-occupancy", {
        params: { ...(associationId ? { associationId } : {}), dateRange },
      });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate report"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">Unit Occupancy Report</h1>

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
              <option value="CURRENT">Current</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="LAST_QUARTER">Last Quarter</option>
              <option value="LAST_YEAR">Last Year</option>
            </select>
          </div>
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {!report ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <p className="font-medium text-gray-500">Report Preview</p>
            <p>Select report parameters above and click "Generate Report" to view results</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-5 gap-3 mb-5 text-center">
              {[
                { label: "Total Units",    value: report.totalUnits     },
                { label: "Owner Occupied", value: report.ownerOccupied  },
                { label: "Rented",         value: report.rented         },
                { label: "Vacant",         value: report.vacant         },
                { label: "Occupancy Rate", value: `${report.occupancyRate ?? 0}%` },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                </div>
              ))}
            </div>
            {report.units && report.units.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500">Unit #</th>
                    <th className="text-left py-2 text-gray-500">Association</th>
                    <th className="text-left py-2 text-gray-500">Status</th>
                    <th className="text-left py-2 text-gray-500">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.units.map((u) => (
                    <tr key={u.unitId}>
                      <td className="py-2">{u.unitNumber}</td>
                      <td className="py-2 text-gray-600">{u.associationName}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          u.occupancyStatus === "OWNER_OCCUPIED" ? "bg-green-100 text-green-700" :
                          u.occupancyStatus === "RENTED"         ? "bg-blue-100 text-blue-700"  :
                          "bg-gray-100 text-gray-600"}`}>
                          {u.occupancyStatus?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600">{u.ownerName ?? "—"}</td>
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

export default UnitOccupancyReportPage;