import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import httpClient from "@/api/httpClient";
import { toast } from "react-toastify";

const fmt2 = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

export function DelinquencyReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [agingPeriod, setAgingPeriod]   = useState("ALL");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await httpClient.get("/api/v1/reports/association/delinquency", {
        params: { ...(associationId ? { associationId } : {}), agingPeriod },
      });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate report"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">Delinquency Report</h1>

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
            <label className="block text-sm font-medium text-gray-600 mb-1">Aging Period</label>
            <select value={agingPeriod} onChange={(e) => setAgingPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="ALL">All Periods</option>
              <option value="CURRENT">Current</option>
              <option value="DAYS_30">30 Days</option>
              <option value="DAYS_60">60 Days</option>
              <option value="DAYS_90_PLUS">90+ Days</option>
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
            <div className="flex gap-4 mb-5">
              <div className="bg-red-50 rounded-lg p-4 flex-1">
                <p className="text-xs text-gray-500">Total Delinquent Units</p>
                <p className="text-2xl font-bold text-red-700">{report.totalDelinquentUnits ?? 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 flex-1">
                <p className="text-xs text-gray-500">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-700">{fmt2(report.totalOutstanding)}</p>
              </div>
            </div>
            {report.units && report.units.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500">Unit</th>
                    <th className="text-left py-2 text-gray-500">Owner</th>
                    <th className="text-right py-2 text-gray-500">Balance</th>
                    <th className="text-left py-2 text-gray-500">Aging</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.units.map((u) => (
                    <tr key={u.unitId}>
                      <td className="py-2">{u.unitNumber}</td>
                      <td className="py-2 text-gray-600">{u.ownerName}</td>
                      <td className="py-2 text-right text-red-600 font-medium">{fmt2(u.balance)}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                          {u.agingBucket}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-400 text-sm py-4">No delinquent units found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DelinquencyReportPage;