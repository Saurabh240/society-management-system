// ─────────────────────────────────────────────────────────────────────────────
// FILE: modules/reports/pages/VendorLedgerReportPage.jsx
// Matches screenshot 9
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getVendorLedger, resolveDateRange } from "../api/financialReportsApi";
import { getAssociations } from "@/modules/associations/associationApi";
import { getVendors } from "@/modules/accounting/api/accountingApi";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const DATE_OPTS = [
  { value: "THIS_YEAR",    label: "This Year"    },
  { value: "LAST_YEAR",    label: "Last Year"    },
  { value: "THIS_QUARTER", label: "This Quarter" },
  { value: "CUSTOM",       label: "Custom Range" },
];

export function VendorLedgerReportPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [vendors, setVendors]           = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [vendorId, setVendorId]         = useState("");
  const [dateRange, setDateRange]       = useState("THIS_YEAR");
  const [from, setFrom]                 = useState("");
  const [to, setTo]                     = useState("");
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
    getVendors().then((r) => setVendors(r.data?.data ?? r.data ?? []));
  }, []);

  const handleGenerate = async () => {
    let rf = from, rt = to;
    if (dateRange !== "CUSTOM") { const d = resolveDateRange(dateRange); rf = d.from; rt = d.to; }
    else if (!from || !to) { toast.error("Provide From and To dates"); return; }
    try {
      setLoading(true);
      const res = await getVendorLedger({
        associationId: associationId || undefined,
        vendorId: vendorId || undefined,
        from: rf, to: rt,
      });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate vendor ledger"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900">Vendor Ledger Report</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Report Parameters</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Association</label>
            <select value={associationId} onChange={(e) => setAssocId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Associations</option>
              {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Vendor</label>
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Vendors</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.companyName}</option>)}
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
            {loading ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Output */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
            Vendor Ledger Report
          </div>
          <div className="p-6">
            {!report.vendors || report.vendors.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No vendor transactions found for the selected period and filters.
              </p>
            ) : (
              report.vendors.map((group) => (
                <div key={group.vendorId} className="mb-8">
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="font-semibold text-gray-900">{group.vendorName}</p>
                    <p className="text-sm text-gray-500">{group.serviceCategory}</p>
                  </div>
                  <table className="w-full text-sm mb-2">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-1.5 text-gray-500 font-medium">Date</th>
                        <th className="text-left py-1.5 text-gray-500 font-medium">Bill #</th>
                        <th className="text-left py-1.5 text-gray-500 font-medium">Description</th>
                        <th className="text-right py-1.5 text-gray-500 font-medium">Amount</th>
                        <th className="text-center py-1.5 text-gray-500 font-medium">Status</th>
                        <th className="text-right py-1.5 text-gray-500 font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.transactions.map((tx, i) => (
                        <tr key={i}>
                          <td className="py-2 text-gray-700">{tx.date}</td>
                          <td className="py-2 text-gray-700">{tx.billNumber}</td>
                          <td className="py-2 text-gray-700">{tx.description}</td>
                          <td className="py-2 text-right text-gray-900">{fmt(tx.amount)}</td>
                          <td className="py-2 text-center">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              tx.status === "PAID"   ? "bg-green-100 text-green-700" :
                              tx.status === "OVERDUE"? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"}`}>{tx.status}</span>
                          </td>
                          <td className="py-2 text-right text-gray-900">{fmt(tx.runningBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-end gap-8 text-sm text-gray-600 border-t border-gray-200 pt-2">
                    <span>Billed: <strong>{fmt(group.totalBilled)}</strong></span>
                    <span>Paid: <strong>{fmt(group.totalPaid)}</strong></span>
                    <span>Balance: <strong>{fmt(group.closingBalance)}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-600">
        <p className="font-semibold text-gray-800 mb-1">About This Report</p>
        <p className="mb-2">The Vendor Ledger Report provides a detailed transaction history for vendors showing all
          bills and running balance over time.</p>
        <p className="font-semibold text-gray-800">Purpose:</p>
        <ul className="list-disc ml-4 space-y-0.5">
          <li>Track all transactions with each vendor</li>
          <li>Monitor vendor spending over time</li>
          <li>Review outstanding balances by vendor</li>
          <li>Support vendor relationship management and payment planning</li>
        </ul>
        <p className="mt-2 text-gray-500">Note: Only vendors with transactions during the selected period will be displayed.</p>
      </div>
    </div>
  );
}

export default VendorLedgerReportPage;