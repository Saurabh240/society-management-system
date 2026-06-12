import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import httpClient from "@/api/httpClient";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

// Maps backend agingBucket string to the 4 aging columns
function getAgingAmounts(unit) {
  const bucket = unit.agingBucket ?? "CURRENT";
  const bal    = unit.balance ?? 0;
  return {
    current:   bucket === "CURRENT"  ? bal : 0,
    days30:    bucket === "30_DAYS"  ? bal : 0,
    days60:    bucket === "60_DAYS"  ? bal : 0,
    days90:    bucket === "90_PLUS"  ? bal : 0,
  };
}

export default function DelinquencyReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [agingPeriod, setAgingPeriod]   = useState("ALL");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected"
    : "All Associations";

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

  // Compute column totals for the Total row
  const colTotals = (() => {
    if (!report?.units) return { current: 0, days30: 0, days60: 0, days90: 0, total: 0 };
    return report.units.reduce((acc, u) => {
      const a = getAgingAmounts(u);
      return { current: acc.current + a.current, days30: acc.days30 + a.days30, days60: acc.days60 + a.days60, days90: acc.days90 + a.days90, total: acc.total + (u.balance ?? 0) };
    }, { current: 0, days30: 0, days60: 0, days90: 0, total: 0 });
  })();

  const over90Total = report?.units
    ?.filter((u) => (u.agingBucket ?? "") === "90_PLUS")
    .reduce((s, u) => s + (u.balance ?? 0), 0) ?? 0;

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
        <h1 className="text-2xl font-semibold text-gray-900">Delinquency Report</h1>

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
                <h2 className="text-xl font-bold text-gray-900">Delinquency Report</h2>
                <p className="text-sm text-gray-500">{assocLabel}</p>
                <p className="text-sm text-gray-500">Aging Period: {agingPeriod === "ALL" ? "All Periods" : agingPeriod}</p>
                <p className="text-xs text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              {/* Aging breakdown table — Association | Unit | Owner | Current | 1-30 | 31-60 | 61-90 | Over 90 | Total Balance */}
              {report.units && report.units.length > 0 ? (
                <table className="w-full text-sm border-collapse mb-6 overflow-x-auto">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-left text-xs font-semibold text-gray-700">Association</th>
                      <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-left text-xs font-semibold text-gray-700">Unit</th>
                      <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-left text-xs font-semibold text-gray-700">Owner</th>
                      <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-right text-xs font-semibold text-gray-700">Current</th>
                      <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-right text-xs font-semibold text-gray-700">1-30 Days</th>
                      <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-right text-xs font-semibold text-gray-700">31-60 Days</th>
                      <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-right text-xs font-semibold text-gray-700">61-90 Days</th>
                      <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-right text-xs font-semibold text-gray-700">Over 90 Days</th>
                      <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-right text-xs font-semibold text-gray-700">Total Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.units.map((u, i) => {
                      const a = getAgingAmounts(u);
                      return (
                        <tr key={i}>
                          <td className="border border-gray-200 px-2 py-2 text-gray-800">{u.associationName}</td>
                          <td className="border border-gray-200 px-2 py-2">{u.unitNumber}</td>
                          <td className="border border-gray-200 px-2 py-2 text-gray-700">{u.ownerName}</td>
                          <td className="border border-gray-200 px-2 py-2 text-right">{fmt(a.current)}</td>
                          <td className="border border-gray-200 px-2 py-2 text-right">{fmt(a.days30)}</td>
                          <td className="border border-gray-200 px-2 py-2 text-right">{fmt(a.days60)}</td>
                          <td className="border border-gray-200 px-2 py-2 text-right">{fmt(0)}</td>
                          <td className="border border-gray-200 px-2 py-2 text-right">{fmt(a.days90)}</td>
                          <td className="border border-gray-200 px-2 py-2 text-right font-medium text-red-600">{fmt(u.balance)}</td>
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-gray-300 px-2 py-2" colSpan={3}>Total</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">{fmt(colTotals.current)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">{fmt(colTotals.days30)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">{fmt(colTotals.days60)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">{fmt(0)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">{fmt(colTotals.days90)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right text-red-600">{fmt(colTotals.total)}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4 mb-4">No delinquent units found.</p>
              )}

              {/* 3 stat cards at bottom — Total Delinquent Accounts | Total Outstanding | Over 90 Days */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Delinquent Accounts</p>
                  <p className="text-3xl font-bold text-gray-900">{report.totalDelinquentUnits ?? 0}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">{fmt(report.totalOutstanding)}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Over 90 Days</p>
                  <p className="text-2xl font-bold text-red-600">{fmt(over90Total)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
