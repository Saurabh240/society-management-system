// FILE: src/modules/reports/pages/DelinquencyReportPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import httpClient from "@/api/httpClient";
import { toast } from "react-toastify";
import { resolveDateRange } from "../utils/dateRangeUtils";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

// Backend AgingPeriod enum values — must match exactly
const AGING_OPTIONS = [
  { value: "ALL",        label: "All Periods"  },
  { value: "CURRENT",    label: "Current"      },
  { value: "DAYS_30",    label: "1-30 Days"    },
  { value: "DAYS_60",    label: "31-60 Days"   },
  { value: "DAYS_90_PLUS", label: "Over 90 Days" },
];

// Backend agingBucket strings: "0-30 days", "31-60 days", "61-90 days", "90+ days"
function toAgingColumns(row) {
  const bucket = row.agingBucket ?? "";
  const amt    = Number(row.outstandingAmount ?? 0);
  return {
    current: bucket === "Current"     ? amt : 0,
    days30:  bucket === "0-30 days"   ? amt : 0,
    days60:  bucket === "31-60 days"  ? amt : 0,
    days90:  bucket === "61-90 days"  ? amt : 0,
    over90:  bucket === "90+ days"    ? amt : 0,
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
    getAssociations()
      .then((r) => setAssociations(r.data?.data ?? r.data ?? []))
      .catch(() => {});
  }, []);

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected"
    : "All Associations";
  const agingLabel = AGING_OPTIONS.find((o) => o.value === agingPeriod)?.label ?? "All Periods";

  const handleGenerate = async () => {
    try {
      setLoading(true);
      // Also send from/to covering the full current year as a safe default
      // in case backend validates these for delinquency as well
      const { from, to } = resolveDateRange("THIS_YEAR");
      const res = await httpClient.get("/api/v1/reports/association/delinquency", {
        params: {
          ...(associationId ? { associationId } : {}),
          agingPeriod,
          ...(from ? { from } : {}),
          ...(to   ? { to   } : {}),
        },
      });
      setReport(res.data.data);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // Backend field: report.delinquencies (NOT report.units)
  const delinquencies = report?.delinquencies ?? [];

  const colTotals = delinquencies.reduce(
    (acc, row) => {
      const a = toAgingColumns(row);
      return {
        current: acc.current + a.current,
        days30:  acc.days30  + a.days30,
        days60:  acc.days60  + a.days60,
        days90:  acc.days90  + a.days90,
        over90:  acc.over90  + a.over90,
        total:   acc.total   + Number(row.outstandingAmount ?? 0),
      };
    },
    { current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 }
  );

  const today = new Date().toLocaleDateString("en-US", {
    month: "numeric", day: "numeric", year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Delinquency Report</h1>

      {/* Parameters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Association</label>
            <select
              value={associationId}
              onChange={(e) => setAssocId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Associations</option>
              {associations.map((a) => (
                <option key={a.id} value={String(a.id)}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aging Period</label>
            <select
              value={agingPeriod}
              onChange={(e) => setAgingPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AGING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => window.print()} className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">Print / Save PDF</button>
          <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50">
            {loading ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Output */}
      {report !== null && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Delinquency Report</h2>
            <p className="text-sm text-gray-500">{assocLabel}</p>
            <p className="text-sm text-gray-500">Aging Period: {agingLabel}</p>
            <p className="text-sm text-gray-400">Generated on {today}</p>
          </div>

          {delinquencies.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No delinquent units found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {["Association","Unit","Owner","Current","1-30 Days","31-60 Days","61-90 Days","Over 90 Days","Total Balance"].map((h) => (
                      <th key={h} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {delinquencies.map((row, i) => {
                    const cols  = toAgingColumns(row);
                    const total = Number(row.outstandingAmount ?? 0);
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">{row.associationName ?? assocLabel}</td>
                        <td className="border border-gray-300 px-3 py-2">{row.unitNumber}</td>
                        <td className="border border-gray-300 px-3 py-2">{row.ownerName}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{fmt(cols.current)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{fmt(cols.days30)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{fmt(cols.days60)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{fmt(cols.days90)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{fmt(cols.over90)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-medium">{fmt(total)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border border-gray-300 px-3 py-2" colSpan={3}>Total</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">{fmt(colTotals.current)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">{fmt(colTotals.days30)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">{fmt(colTotals.days60)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">{fmt(colTotals.days90)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">{fmt(colTotals.over90)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">{fmt(colTotals.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Delinquent Accounts</p>
              {/* Field name: totalDelinquentAccounts (NOT totalDelinquentUnits) */}
              <p className="text-2xl font-bold text-gray-900">{report.totalDelinquentAccounts ?? 0}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(report.totalOutstanding)}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Over 90 Days</p>
              <p className="text-2xl font-bold text-red-600">{fmt(colTotals.over90)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}