import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { createJournalEntry } from "../accountingApi";
import { getAssociations } from "../../associations/associationApi";
import { getCoaList } from "../accountingApi";

const inputCls  = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const selectCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls  = "block text-sm font-medium text-gray-700 mb-1";

const emptyLine = () => ({ accountId: "", description: "", debit: "", credit: "" });

const formatCurrency = (val) => {
  const n = parseFloat(val) || 0;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function RecordJournalEntryPage() {
  const navigate = useNavigate();

  // Header fields
  const [date,          setDate]          = useState("");
  const [associationId, setAssociationId] = useState("");
  const [memo,          setMemo]          = useState("");

  // Line rows — start with 2 empty rows
  const [lines, setLines] = useState([emptyLine(), emptyLine()]);

  // Dropdown data
  const [associations, setAssociations] = useState([]);
  const [accounts,     setAccounts]     = useState([]);

  const [submitting, setSubmitting] = useState(false);

  // Load dropdowns on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [assocRes, coaRes] = await Promise.all([
          getAssociations(),
          getCoaList(),
        ]);
        setAssociations(assocRes.data.data || assocRes.data || []);
        setAccounts(coaRes.data.data || []);
      } catch {
        toast.error("Failed to load dropdown data");
      }
    };
    load();
  }, []);

  // ── Line management ────────────────────────────────────────────────────────

  const updateLine = (index, field, value) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
    );
  };

  const addTwoRows = () => setLines((prev) => [...prev, emptyLine(), emptyLine()]);

  const removeLine = (index) => {
    if (lines.length <= 2) {
      toast.error("A journal entry must have at least 2 lines");
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Totals ────────────────────────────────────────────────────────────────

  const totalDebit  = lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date)          return toast.error("Date is required");
    if (!associationId) return toast.error("Association is required");

    // Client-side balance check — backend also validates
    if (!isBalanced) {
      toast.error(
        `Journal entry is not balanced. Debits: ${formatCurrency(totalDebit)}, Credits: ${formatCurrency(totalCredit)}`
      );
      return;
    }

    // Filter out empty lines (no account selected)
    const validLines = lines.filter((l) => l.accountId);
    if (validLines.length < 2) {
      return toast.error("At least 2 lines with an account selected are required");
    }

    setSubmitting(true);
    try {
      await createJournalEntry({
        associationId: Number(associationId),
        date,
        memo: memo.trim() || null,
        lines: validLines.map((l) => ({
          accountId:   Number(l.accountId),
          description: l.description.trim() || null,
          debit:       parseFloat(l.debit)  || 0,
          credit:      parseFloat(l.credit) || 0,
        })),
      });

      toast.success("Journal entry recorded successfully");
      navigate("/dashboard/accounting/general-ledger");
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to record journal entry";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">

      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard/accounting/general-ledger")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to General Ledger
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Record General Journal Entry</h1>

      <form onSubmit={handleSubmit}>

        {/* Header section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className={labelCls}>Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Association <span className="text-red-500">*</span></label>
              <select
                value={associationId}
                onChange={(e) => setAssociationId(e.target.value)}
                required
                className={selectCls}
              >
                <option value="">Select Association</option>
                {associations.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Memo</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Enter journal entry memo..."
                rows={2}
                className={`${inputCls} resize-y`}
              />
            </div>
          </div>
        </div>

        {/* Journal Entry Lines */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">Journal Entry Lines</p>
            <button
              type="button"
              onClick={addTwoRows}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
            >
              <Plus size={13} />
              Add 2 Rows
            </button>
          </div>

          {/* Lines table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse min-w-[700px]">
              <thead style={{ backgroundColor: "#a9c3f7" }}>
                <tr>
                  <th className="border-r border-gray-300 p-3 text-xs font-bold uppercase text-gray-800 text-left w-[35%]">Account</th>
                  <th className="border-r border-gray-300 p-3 text-xs font-bold uppercase text-gray-800 text-left">Description</th>
                  <th className="border-r border-gray-300 p-3 text-xs font-bold uppercase text-gray-800 text-right w-28">Debit</th>
                  <th className="border-r border-gray-300 p-3 text-xs font-bold uppercase text-gray-800 text-right w-28">Credit</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {/* Account selector */}
                    <td className="border-r border-gray-100 p-2">
                      <select
                        value={line.accountId}
                        onChange={(e) => updateLine(idx, "accountId", e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Search or select account...</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.accountCode ? `${a.accountCode} — ` : ""}{a.accountName}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Description */}
                    <td className="border-r border-gray-100 p-2">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateLine(idx, "description", e.target.value)}
                        placeholder="Description"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    {/* Debit */}
                    <td className="border-r border-gray-100 p-2">
                      <input
                        type="number"
                        value={line.debit}
                        onChange={(e) => updateLine(idx, "debit", e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    {/* Credit */}
                    <td className="border-r border-gray-100 p-2">
                      <input
                        type="number"
                        value={line.credit}
                        onChange={(e) => updateLine(idx, "credit", e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    {/* Remove row */}
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="text-gray-300 hover:text-red-500 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={2} className="border-r border-gray-200 p-3 text-sm font-semibold text-gray-700 text-right">
                    Totals
                  </td>
                  <td className="border-r border-gray-200 p-3 text-sm font-semibold text-right font-mono"
                      style={{ color: isBalanced ? "#166534" : "#dc2626" }}>
                    {formatCurrency(totalDebit)}
                  </td>
                  <td className="border-r border-gray-200 p-3 text-sm font-semibold text-right font-mono"
                      style={{ color: isBalanced ? "#166534" : "#dc2626" }}>
                    {formatCurrency(totalCredit)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Balance indicator */}
          {totalDebit > 0 && !isBalanced && (
            <div className="px-5 py-3 bg-red-50 border-t border-red-100">
              <p className="text-xs text-red-600 font-medium">
                ⚠ Entry is not balanced — difference of {formatCurrency(Math.abs(totalDebit - totalCredit))}
              </p>
            </div>
          )}
          {totalDebit > 0 && isBalanced && (
            <div className="px-5 py-3 bg-green-50 border-t border-green-100">
              <p className="text-xs text-green-600 font-medium">✓ Entry is balanced</p>
            </div>
          )}
        </div>

        {/* Attachments placeholder — wired in M7 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Attachments</p>
          <div className="flex items-center gap-3">
            <label className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition">
              Choose Files
              <input type="file" className="hidden" multiple accept=".pdf,.png,.jpg,.jpeg" />
            </label>
            <span className="text-sm text-gray-400">No file chosen</span>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Record Journal Entry
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/accounting/general-ledger")}
            className="px-5 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
