// FILE: src/modules/reports/pages/AssessmentHistoryReportPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import httpClient from "@/api/httpClient";
import { toast } from "react-toastify";
import { resolveDateRange } from "../utils/dateRangeUtils";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const DATE_RANGE_OPTIONS = [
  { value: "THIS_MONTH",   label: "This Month"   },
  { value: "LAST_MONTH",   label: "Last Month"   },
  { value: "THIS_YEAR",    label: "This Year"    },
  { value: "LAST_YEAR",    label: "Last Year"    },
  { value: "LAST_90_DAYS", label: "Last 90 Days" },
];

export default function AssessmentHistoryReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [dateRange, setDateRange]       = useState("LAST_YEAR");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);

  useEffect(() => {
    getAssociations()
      .then((r) => setAssociations(r.data?.data ?? r.data ?? []))
      .catch(() => {});
  }, []);

  const assocLabel  = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected"
    : "All Associations";
  const periodLabel = DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? dateRange;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const { from, to } = resolveDateRange(dateRange);
      const res = await httpClient.get("/api/v1/reports/association/assessment-history", {
        params: {
          ...(associationId ? { associationId } : {}),
          dateRange,
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

  const assessments = report?.assessments ?? [];
  const byAssoc     = report?.byAssociation ?? {};

  const today = new Date().toLocaleDateString("en-US", {
    month: "numeric", day: "numeric", year: "numeric",
  });

  const formatDate = (d) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleDateString("en-US"); }
    catch { return d; }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Assessment History Report</h1>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DATE_RANGE_OPTIONS.map((o) => (
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
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Assessment History Report</h2>
            <p className="text-sm text-gray-500">{assocLabel}</p>
            <p className="text-sm text-gray-500">Period: {periodLabel}</p>
            <p className="text-sm text-gray-400">Generated on {today}</p>
          </div>

          {assessments.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No assessments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {["Effective Date","Association","Assessment Type","Old Amount","New Amount","Change %","Reason"].map((h) => (
                      <th key={h} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2">{formatDate(row.effectiveDate)}</td>
                      <td className="border border-gray-300 px-3 py-2">{row.associationName}</td>
                      <td className="border border-gray-300 px-3 py-2">{row.assessmentType}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{row.oldAmount != null ? fmt(row.oldAmount) : "-"}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{fmt(row.newAmount)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{row.changePercent != null ? `${row.changePercent}%` : "New"}</td>
                      <td className="border border-gray-300 px-3 py-2">{row.reason ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {Object.keys(byAssoc).length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Summary by Association</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(byAssoc).map(([name, summary]) => (
                  <div key={name} className="border border-gray-200 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-gray-800">{name}</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div className="flex justify-between"><span>Total Changes:</span><span className="font-medium text-gray-900">{summary.totalChanges ?? 0}</span></div>
                      <div className="flex justify-between"><span>Regular Increases:</span><span className="font-medium text-gray-900">{summary.regularIncreases ?? 0}</span></div>
                      <div className="flex justify-between"><span>Special Assessments:</span><span className="font-medium text-gray-900">{summary.specialAssessments ?? 0}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Assessed</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(report.totalAssessed)}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">{fmt(report.totalCollected)}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.collectionRate != null ? `${Number(report.collectionRate).toFixed(1)}%` : "0.0%"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}