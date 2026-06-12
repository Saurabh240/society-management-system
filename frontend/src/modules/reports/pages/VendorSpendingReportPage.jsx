// FILE: src/modules/reports/pages/VendorSpendingReportPage.jsx
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

export default function VendorSpendingReportPage() {
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
      const res = await httpClient.get("/api/v1/reports/association/vendor-spending", {
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

  const vendors    = report?.vendors ?? [];
  const top5       = report?.topVendors ?? [];
  const grandTotal = vendors.reduce((s, v) => s + Number(v.totalSpent ?? 0), 0);
  const totalInvoices = vendors.reduce((s, v) => s + Number(v.invoiceCount ?? 0), 0);

  const today = new Date().toLocaleDateString("en-US", {
    month: "numeric", day: "numeric", year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Vendor Spending Report</h1>

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
            <h2 className="text-xl font-semibold text-gray-900">Vendor Spending Report</h2>
            <p className="text-sm text-gray-500">{assocLabel}</p>
            <p className="text-sm text-gray-500">Period: {periodLabel}</p>
            <p className="text-sm text-gray-400">Generated on {today}</p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Vendor Spending Details</h3>
            {vendors.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No vendor data found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Vendor","Association","Category","Invoice Count","Total Spent","Avg Invoice"].map((h) => (
                        <th key={h} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">{v.vendorName}</td>
                        <td className="border border-gray-300 px-3 py-2">{v.associationName ?? assocLabel}</td>
                        <td className="border border-gray-300 px-3 py-2">{v.category}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{v.invoiceCount}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{fmt(v.totalSpent)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{fmt(v.avgInvoice)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-gray-300 px-3 py-2" colSpan={3}>Total</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{totalInvoices}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{fmt(grandTotal)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {top5.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">Top 5 Vendors by Spending</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Rank","Vendor","Total Spent","Invoice Count","% of Total"].map((h) => (
                        <th key={h} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {top5.map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">{i + 1}</td>
                        <td className="border border-gray-300 px-3 py-2">{v.vendorName}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{fmt(v.totalSpent)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{v.invoiceCount}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {grandTotal > 0 ? ((Number(v.totalSpent) / grandTotal) * 100).toFixed(1) : "0.0"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}