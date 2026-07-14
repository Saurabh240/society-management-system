import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBalanceSheet } from "../api/financialReportsApi";
import { getAssociations } from "@/modules/associations/associationApi";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const today = () => new Date().toISOString().split("T")[0];

export default function BalanceSheetReportPage() {
  const navigate = useNavigate();

  const [associations, setAssociations]   = useState([]);
  const [associationId, setAssociationId] = useState("");
  const [accountingBasis, setBasis]       = useState("ACCRUAL");
  const [asOfDate, setAsOfDate]           = useState(today());
  const [loading, setLoading]             = useState(false);
  const [report, setReport]               = useState(null);

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await getBalanceSheet({
        associationId: associationId || undefined,
        asOfDate,
        accountingBasis,
      });
      setReport(res.data.data);
    } catch {
      toast.error("Failed to generate balance sheet");
    } finally {
      setLoading(false);
    }
  };

  const assocLabel = associationId
    ? associations.find((a) => String(a.id) === associationId)?.name ?? "Selected Association"
    : "All Associations";

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900">Balance Sheet Report</h1>

      {/* ── Parameters card ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Report Parameters</h2>
        <div className="grid grid-cols-2 gap-5 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Association</label>
            <select value={associationId} onChange={(e) => setAssociationId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">All Associations</option>
              {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Accounting Basis</label>
            <select value={accountingBasis} onChange={(e) => setBasis(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="ACCRUAL">Accrual</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">As of Date</label>
            <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <button onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleGenerate} disabled={loading}
            className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)" }}>
            {loading ? "Generating…" : "Generate Balance Sheet"}
          </button>
        </div>
      </div>

      {/* ── About ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-600 leading-relaxed">
        <p className="font-semibold text-gray-800 mb-1">About This Report</p>
        <p>The Balance Sheet provides a snapshot of your organization's financial position at a specific point in time.
          It shows what you own (assets), what you owe (liabilities), and the residual value (equity).
          The fundamental accounting equation Assets = Liabilities + Equity is maintained in this report.</p>
      </div>

      {/* ── Report output ── */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* toolbar */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Balance Sheet Report</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">
                Download PDF
              </button>
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">
                Download CSV
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* header */}
            <p className="text-lg font-bold text-gray-900 mb-0.5">{assocLabel}</p>
            <p className="text-sm text-gray-500">As of {report.asOfDate}</p>
            <p className="text-sm text-gray-500 mb-5">Accounting Basis: {report.accountingBasis}</p>

            {/* Balance indicator */}
            {report.isBalanced !== undefined && (
              <div className={`mb-4 px-3 py-2 rounded-lg text-sm font-medium ${
                report.isBalanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {report.isBalanced ? "✓ Balance sheet is in balance" : "⚠ Balance sheet is OUT OF BALANCE"}
              </div>
            )}

            {/* ASSETS */}
            <Section title="ASSETS" items={report.assets}
              totalLabel="TOTAL ASSETS" totalValue={report.totalAssets} />

            {/* LIABILITIES */}
            <Section title="LIABILITIES" items={report.liabilities}
              totalLabel="Total Liabilities" totalValue={report.totalLiabilities} />

            {/* EQUITY */}
            <Section title="EQUITY" items={report.equity}
              totalLabel="Total Equity" totalValue={report.totalEquity} />

            {/* TOTAL L+E */}
            <div className="flex justify-between border-t-2 border-gray-800 pt-3 mt-2">
              <span className="text-sm font-bold text-gray-900 uppercase">TOTAL LIABILITIES &amp; EQUITY</span>
              <span className="text-sm font-bold text-gray-900">
                {fmt((report.totalLiabilities ?? 0) + (report.totalEquity ?? 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, items, totalLabel, totalValue }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">{title}</p>
      {items && items.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1.5 text-gray-500 font-medium">Account Code</th>
              <th className="text-left py-1.5 text-gray-500 font-medium">Account Name</th>
              <th className="text-right py-1.5 text-gray-500 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.accountCode}>
                <td className="py-2 text-gray-700">{item.accountCode}</td>
                <td className="py-2 text-gray-700">{item.accountName}</td>
                <td className="py-2 text-right text-gray-900">{fmt(item.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-gray-400 italic">No accounts</p>
      )}
      <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
        <span className="text-sm font-semibold text-gray-700">{totalLabel}</span>
        <span className="text-sm font-semibold text-gray-900">{fmt(totalValue)}</span>
      </div>
    </div>
  );
}