import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCashFlow, resolveDateRange } from "../api/financialReportsApi";
import { getAssociations } from "@/modules/associations/associationApi";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const DATE_OPTS = [
  { value: "THIS_QUARTER", label: "This Quarter" },
  { value: "LAST_QUARTER", label: "Last Quarter" },
  { value: "THIS_YEAR",    label: "This Year"    },
  { value: "LAST_YEAR",    label: "Last Year"    },
  { value: "CUSTOM",       label: "Custom Range" },
];

export default function CashFlowReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations]   = useState([]);
  const [associationId, setAssociationId] = useState("");
  const [accountingBasis, setBasis]       = useState("ACCRUAL");
  const [dateRange, setDateRange]         = useState("THIS_QUARTER");
  const [from, setFrom]                   = useState("");
  const [to, setTo]                       = useState("");
  const [loading, setLoading]             = useState(false);
  const [report, setReport]               = useState(null);

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const handleGenerate = async () => {
    let rf = from, rt = to;
    if (dateRange !== "CUSTOM") { const d = resolveDateRange(dateRange); rf = d.from; rt = d.to; }
    else if (!from || !to) { toast.error("Provide From and To dates"); return; }
    try {
      setLoading(true);
      const res = await getCashFlow({ associationId: associationId || undefined, from: rf, to: rt, accountingBasis });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate cash flow statement"); }
    finally { setLoading(false); }
  };

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected"
    : "All Associations";

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900">Cash Flow Statement Report</h1>

      {/* Parameters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Report Parameters</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Association</label>
            <select value={associationId} onChange={(e) => setAssociationId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Associations</option>
              {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Accounting Basis</label>
            <select value={accountingBasis} onChange={(e) => setBasis(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="ACCRUAL">Accrual</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {DATE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleGenerate} disabled={loading}
            className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}>
            {loading ? "Generating…" : "Generate Cash Flow Statement"}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-600">
        <p className="font-semibold text-gray-800 mb-1">About This Report</p>
        <p className="mb-2">The Cash Flow Statement shows how changes in balance sheet accounts and income affect
          cash and cash equivalents. It breaks down the analysis to operating, investing, and financing activities.</p>
        <p className="font-semibold text-gray-800">Cash Flow Categories:</p>
        <p><strong>Operating Activities</strong> – Cash generated from normal business operations, including revenue and expense transactions.</p>
        <p><strong>Investing Activities</strong> – Cash used for or generated from investments in long-term assets like property, equipment, or other investments.</p>
        <p><strong>Financing Activities</strong> – Cash flows from transactions with creditors and owners, including loans, equity, and distributions.</p>
        <p className="mt-2 text-gray-500">This report uses the direct method of cash flow reporting.</p>
      </div>

      {/* Output */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Cash Flow Statement Report</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Download PDF</button>
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Download CSV</button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-lg font-bold text-gray-900">{assocLabel}</p>
            <p className="text-sm text-gray-500">{report.from} to {report.to}</p>
            <p className="text-sm text-gray-500 mb-5">Accounting Basis: {report.accountingBasis}</p>

            <CFSection title="CASH FLOWS FROM OPERATING ACTIVITIES" rows={report.operating}
              netLabel="Net Cash from Operating Activities" net={report.netCashFromOperating} />
            <CFSection title="CASH FLOWS FROM INVESTING ACTIVITIES" rows={report.investing}
              netLabel="Net Cash from Investing Activities" net={report.netCashFromInvesting} />
            <CFSection title="CASH FLOWS FROM FINANCING ACTIVITIES" rows={report.financing}
              netLabel="Net Cash from Financing Activities" net={report.netCashFromFinancing} />

            <div className="border-t-2 border-gray-800 pt-3 mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-bold text-gray-900 uppercase">NET CHANGE IN CASH</span>
                <span className="text-sm font-bold text-gray-900">{fmt(report.netChangeInCash)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Cash at Beginning of Period</span>
                <span>{fmt(report.openingCashBalance)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Cash at End of Period</span>
                <span>{fmt(report.closingCashBalance)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CFSection({ title, rows, netLabel, net }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">{title}</p>
      <table className="w-full text-sm mb-2">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-1.5 text-gray-500 font-medium">Description</th>
            <th className="text-right py-1.5 text-gray-500 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows && rows.length > 0 ? rows.map((r, i) => (
            <tr key={i}>
              <td className="py-2 text-gray-700">{r.description}</td>
              <td className={`py-2 text-right ${(r.amount ?? 0) >= 0 ? "text-gray-900" : "text-red-600"}`}>
                {fmt(r.amount)}
              </td>
            </tr>
          )) : (
            <tr>
              <td className="py-2 text-gray-400 italic">No {title.toLowerCase().replace("cash flows from ", "")} activities</td>
              <td className="py-2 text-right text-gray-400">{fmt(0)}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-between border-t border-gray-200 pt-1.5">
        <span className="text-sm font-semibold text-gray-700">{netLabel}</span>
        <span className="text-sm font-semibold text-gray-900">{fmt(net)}</span>
      </div>
    </div>
  );
}