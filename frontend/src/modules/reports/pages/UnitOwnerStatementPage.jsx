import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import { getUnitsByAssociation } from "@/modules/associations/unitApi";
import { getUnitOwnerStatement } from "../api/financialReportsApi";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const todayIso   = () => new Date().toISOString().split("T")[0];
const jan1Iso    = () => `${new Date().getFullYear()}-01-01`;

export default function UnitOwnerStatementPage() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [units, setUnits]               = useState([]);
  const [associationId, setAssocId]     = useState("");
  const [unitId, setUnitId]             = useState("");
  const [from, setFrom]                 = useState(jan1Iso());
  const [to, setTo]                     = useState(todayIso());
  const [loading, setLoading]           = useState(false);
  const [report, setReport]             = useState(null);

  // Load associations on mount
  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  // Load units when association changes
  useEffect(() => {
    setUnits([]);
    setUnitId("");
    if (!associationId) return;
    getUnitsByAssociation(associationId)
      .then((r) => setUnits(r.data?.data ?? r.data ?? []))
      .catch(() => setUnits([]));
  }, [associationId]);

  const canGenerate = associationId && unitId;

  const handleGenerate = async () => {
    if (!canGenerate) { toast.error("Select an association and a unit"); return; }
    try {
      setLoading(true);
      const res = await getUnitOwnerStatement({ associationId, unitId, from, to });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate statement"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">Unit Owner Statement</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-2 gap-5 mb-4">
          {/* Association */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Association</label>
            <select value={associationId} onChange={(e) => setAssocId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select Association</option>
              {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Unit — cascades from association */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Unit</label>
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)}
              disabled={!associationId}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:opacity-50 disabled:bg-gray-50">
              <option value="">Select Unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.unitNumber}</option>)}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleGenerate} disabled={loading || !canGenerate}
            className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: canGenerate ? "var(--color-primary)" : "#9ca3af" }}>
            {loading ? "Generating…" : "Generate Statement"}
          </button>
        </div>
      </div>

      {/* Statement preview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {!report ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <p className="font-medium text-gray-500">Statement Preview</p>
            <p>Select an association, unit, and date range above, then click "Generate Statement" to view</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Statement header */}
            <div className="flex justify-between mb-5 pb-4 border-b border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">{report.unitNumber}</p>
                <p className="text-sm text-gray-500">{report.associationName}</p>
                <p className="text-sm text-gray-500">{report.ownerName} — {report.ownerEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{report.from} to {report.to}</p>
                <p className="text-sm text-gray-600">Opening: <strong>{fmt(report.openingBalance)}</strong></p>
                <p className="text-sm text-gray-600">Charges: <strong>{fmt(report.totalCharges)}</strong></p>
                <p className="text-sm text-gray-600">Payments: <strong>{fmt(report.totalPayments)}</strong></p>
                <p className="text-base font-bold text-gray-900 mt-1">
                  Closing: {fmt(report.closingBalance)}
                </p>
              </div>
            </div>

            {/* Transactions table */}
            {report.transactions && report.transactions.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500">Date</th>
                    <th className="text-left py-2 text-gray-500">Description</th>
                    <th className="text-left py-2 text-gray-500">Type</th>
                    <th className="text-right py-2 text-gray-500">Amount</th>
                    <th className="text-right py-2 text-gray-500">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.transactions.map((tx, i) => (
                    <tr key={i}>
                      <td className="py-2">{tx.date}</td>
                      <td className="py-2 text-gray-700">{tx.description}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          tx.type === "CHARGE" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2 text-right">{fmt(tx.amount)}</td>
                      <td className="py-2 text-right font-medium">{fmt(tx.runningBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-400 text-sm py-4">No transactions found for this period.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}