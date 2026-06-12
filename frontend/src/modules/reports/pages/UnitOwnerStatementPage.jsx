import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import { getUnitsByAssociation } from "@/modules/associations/unitApi";
import httpClient from "@/api/httpClient";
import { toast } from "react-toastify";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
const fmtPlain = (n) => `$${Number(n ?? 0).toFixed(2)}`;

const todayIso = () => new Date().toISOString().split("T")[0];
const jan1Iso  = () => `${new Date().getFullYear()}-01-01`;

// ── CSV builder — matches the uploaded CSV format exactly ────────────────────
function buildCsv(report, unitLabel) {
  const today     = new Date().toLocaleDateString();
  const period    = `${report.from} to ${report.to}`;
  const ownerName = report.ownerName ?? "—";
  const assoc     = report.associationName ?? "—";
  const unitNum   = report.unitNumber ?? unitLabel;

  const charges  = (report.transactions ?? []).filter((t) => t.type === "CHARGE");
  const payments = (report.transactions ?? []).filter((t) => t.type === "PAYMENT");

  const lines = [
    "Unit Owner Statement",
    "",
    `Association,${assoc}`,
    `Unit,${unitNum}`,
    `Owner,${ownerName}`,
    `Statement Period,${period}`,
    `Generated,${today}`,
    "",
    `Previous Balance,${fmtPlain(report.openingBalance)}`,
    "",
    "Charges",
    "Date,Description,Amount",
    ...charges.map((c) => `${c.date},${c.description},${fmtPlain(c.amount)}`),
    "",
    "Payments",
    "Date,Description,Amount",
    ...payments.map((p) => `${p.date},${p.description},${fmtPlain(p.amount)}`),
    "",
    "Summary",
    `Previous Balance,${Number(report.openingBalance ?? 0).toFixed(2)}`,
    `Total Charges,${Number(report.totalCharges ?? 0).toFixed(2)}`,
    `Total Payments,${Number(report.totalPayments ?? 0).toFixed(2)}`,
    `Current Balance,${Number(report.closingBalance ?? 0).toFixed(2)}`,
  ];
  return lines.join("\n");
}

function downloadCsv(report, unitLabel) {
  const csv      = buildCsv(report, unitLabel);
  const today    = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const filename = `Unit_Owner_Statement_${report.unitNumber ?? unitLabel}_${today}.csv`;
  const blob     = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

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

  useEffect(() => {
    getAssociations().then((r) => setAssociations(r.data?.data ?? r.data ?? []));
  }, []);

  useEffect(() => {
    setUnits([]); setUnitId("");
    if (!associationId) return;
    getUnitsByAssociation(associationId)
      .then((r) => setUnits(r.data?.data ?? r.data ?? []))
      .catch(() => setUnits([]));
  }, [associationId]);

  const canGenerate = associationId && unitId;

  // Unit dropdown label: "Unit 201 - Emily Martinez" style (Image 11)
  const unitOptions = units.map((u) => ({
    id:    u.id,
    label: u.ownerName ? `Unit ${u.unitNumber} - ${u.ownerName}` : u.unitNumber,
  }));

  const selectedUnit = unitOptions.find((u) => String(u.id) === unitId);
  const unitLabel    = selectedUnit?.label ?? unitId;

  const handleGenerate = async () => {
    if (!canGenerate) { toast.error("Select an association and a unit"); return; }
    try {
      setLoading(true);
      const res = await httpClient.get("/api/v1/reports/association/unit-owner-statement", {
        params: { associationId, unitId, from, to },
      });
      setReport(res.data.data);
    } catch { toast.error("Failed to generate statement"); }
    finally { setLoading(false); }
  };

  const handleDownloadCsv = () => {
    if (!report) return;
    downloadCsv(report, unitLabel);
  };

  // Download PDF = print dialog (browser has "Save as PDF" built-in)
  const handleDownloadPdf = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; top: 0; left: 0; width: 100%; padding: 2rem; }
          #no-print { display: none !important; }
        }
      `}</style>

      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <h1 className="text-2xl font-semibold text-gray-900">Unit Owner Statement</h1>

        {/* Parameters — matches Image 11: Download CSV | Download PDF | Generate Statement */}
        <div id="no-print" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-2 gap-5 mb-5">
            {/* Association */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Association</label>
              <select value={associationId} onChange={(e) => setAssocId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select Association</option>
                {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            {/* Unit — cascades, shows "Unit 201 - Emily Martinez" */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Unit</label>
              <select value={unitId} onChange={(e) => setUnitId(e.target.value)}
                disabled={!associationId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:opacity-50 disabled:bg-gray-50">
                <option value="">Select Unit</option>
                {unitOptions.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
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

          {/* Buttons: Cancel | Download CSV | Download PDF | Generate Statement */}
          <div className="flex justify-end gap-3">
            <button onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            {report && (
              <>
                <button onClick={handleDownloadCsv}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Download CSV
                </button>
                <button onClick={handleDownloadPdf}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Download PDF
                </button>
              </>
            )}
            <button onClick={handleGenerate} disabled={loading || !canGenerate}
              className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: canGenerate ? "var(--color-primary)" : "#9ca3af" }}>
              {loading ? "Generating…" : "Generate Statement"}
            </button>
          </div>
        </div>

        {/* Statement output — matches Image 11 Figma */}
        <div id="print-area" className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {!report ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <p className="font-medium text-gray-500">Statement Preview</p>
              <p>Select an association, unit, and date range above, then click "Generate Statement" to view</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-gray-900">Unit Owner Statement</h2>
                <p className="text-sm text-gray-600">{report.associationName}</p>
                <p className="text-sm text-gray-600">{unitLabel}</p>
                <p className="text-sm text-gray-500">Statement Period: {report.from} to {report.to}</p>
                <p className="text-xs text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              {/* Previous Balance row */}
              <div className="flex justify-between border border-gray-200 rounded-lg px-4 py-3 mb-5 bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Previous Balance:</span>
                <span className="text-sm font-semibold text-gray-900">{fmt(report.openingBalance)}</span>
              </div>

              {/* Transactions table */}
              {report.transactions && report.transactions.length > 0 && (
                <table className="w-full text-sm border-collapse mb-6">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Date</th>
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Description</th>
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Type</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium">Amount</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.transactions.map((tx, i) => (
                      <tr key={i}>
                        <td className="py-2 px-2 text-gray-700">{tx.date}</td>
                        <td className="py-2 px-2 text-gray-700">{tx.description}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            tx.type === "CHARGE" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">{fmt(tx.amount)}</td>
                        <td className="py-2 px-2 text-right font-medium">{fmt(tx.runningBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Summary section — matches Figma Image 11 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Summary</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: "Previous Balance:", value: fmt(report.openingBalance),  bold: false },
                    { label: "Total Charges:",    value: fmt(report.totalCharges),    bold: false },
                    { label: "Total Payments:",   value: fmt(report.totalPayments),   bold: false },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between px-4 py-2.5 text-sm text-gray-700">
                      <span>{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                  ))}
                  {/* Current Balance highlighted */}
                  <div className="flex justify-between px-4 py-3 bg-green-50 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-800">Current Balance:</span>
                    <span className={`text-sm font-bold ${(report.closingBalance ?? 0) >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {fmt(report.closingBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
