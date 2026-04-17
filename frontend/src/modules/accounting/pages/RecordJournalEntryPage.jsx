import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createJournalEntry, getCoaList } from "../api/accountingApi";
import { getAssociations } from "@/modules/associations/associationApi";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

// ─── Empty line factory ────────────────────────────────────────────────────────
const emptyLine = () => ({
  id:          Math.random().toString(36).slice(2),
  accountId:   "",
  accountName: "",
  description: "",
  debit:       "",
  credit:      "",
});

// ─── Account searchable select (custom — needs search, not covered by Select) ──
const AccountSelect = ({ value, onChange, accounts }) => {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen]   = useState(false);
  const ref               = useRef(null);

  const filtered = accounts.filter((a) =>
    a.accountName.toLowerCase().includes(query.toLowerCase()) ||
    a.accountCode.includes(query)
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (account) => {
    setQuery(account.accountName);
    setOpen(false);
    onChange(account);
  };

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={query}
        placeholder="Search or select account..."
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="block w-full px-4 py-2.5 text-base rounded-lg border border-[var(--color-primary-light)] bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] transition-all duration-200"
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
          {filtered.map((a) => (
            <div
              key={a.id}
              onClick={() => handleSelect(a)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
            >
              <span className="font-medium">{a.accountCode}</span>
              <span className="text-gray-500 ml-2">{a.accountName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RecordJournalEntryPage() {
  const navigate = useNavigate();

  const [date, setDate]                   = useState("");
  const [associationId, setAssociationId] = useState("");
  const [memo, setMemo]                   = useState("");
  const [lines, setLines]                 = useState([emptyLine(), emptyLine()]);
  const [accounts, setAccounts]           = useState([]);
  const [associations, setAssociations]   = useState([]);
  const [loading, setLoading]             = useState(false);

  // Load COA accounts
  useEffect(() => {
    getCoaList()
      .then((res) => setAccounts(res.data?.content ?? []))
      .catch(() => toast.error("Failed to load accounts"));
  }, []);

  // Load associations from API
  useEffect(() => {
    getAssociations()
      .then((res) => setAssociations(res.data?.data ?? []))
      .catch(() => toast.error("Failed to load associations"));
  }, []);

  // ── Line helpers ──────────────────────────────────────────────────────────────
  const updateLine = (id, field, value) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  const handleAccountSelect = (lineId, account) =>
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId ? { ...l, accountId: account.id, accountName: account.accountName } : l
      )
    );

  const removeLine = (id) => {
    if (lines.length <= 2) return toast.error("Minimum 2 lines required");
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const addTwoRows = () => setLines((prev) => [...prev, emptyLine(), emptyLine()]);

  // ── Totals ────────────────────────────────────────────────────────────────────
  const totalDebit  = lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.001;
  const fmt = (n) => `$${n.toFixed(2)}`;

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!date)          return toast.error("Please select a date");
    if (!associationId) return toast.error("Please select an association");
    if (!isBalanced)    return toast.error("Journal entry is not balanced. Debits must equal Credits.");

    const validLines = lines.filter((l) => l.accountId);
    if (validLines.length < 2) return toast.error("At least 2 account lines are required");

    try {
      setLoading(true);
      await createJournalEntry({
        date,
        associationId: Number(associationId),
        memo,
        lines: validLines.map(({ accountId, description, debit, credit }) => ({
          accountId,
          description,
          debit:  parseFloat(debit)  || 0,
          credit: parseFloat(credit) || 0,
        })),
      });
      toast.success("Journal entry recorded successfully");
      navigate("/dashboard/accounting/general-ledger");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record journal entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Record General Journal Entry
      </h2>

      <Card>
        <div className="space-y-6">

          {/* ── Date + Association ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Select
              label="Association"
              name="associationId"
              required
              value={associationId}
              onChange={(e) => setAssociationId(e.target.value)}
              options={[
                { label: "Select Association", value: "" },
                ...associations.map((a) => ({ label: a.name, value: String(a.id) })),
              ]}
            />
          </div>

          {/* ── Memo ── */}
          <div>
            <label className="block mb-2 text-sm text-(--color-primary)">Memo</label>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Enter journal entry memo..."
              className="block w-full px-4 py-2.5 text-base rounded-lg border border-[var(--color-primary-light)] bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] resize-none transition-all duration-200"
            />
          </div>

          {/* ── Journal Entry Lines ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-800">Journal Entry Lines</span>
              <button
                type="button"
                onClick={addTwoRows}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700"
              >
                + Add 2 Rows
              </button>
            </div>

            <div className="w-full border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full table-fixed border-collapse min-w-[680px]">
                <thead style={{ backgroundColor: "#f3f4f6" }}>
                  <tr>
                    <th className="border-r border-gray-200 p-3 text-xs font-bold uppercase text-gray-600 text-left w-[33%]">Account</th>
                    <th className="border-r border-gray-200 p-3 text-xs font-bold uppercase text-gray-600 text-left w-[33%]">Description</th>
                    <th className="border-r border-gray-200 p-3 text-xs font-bold uppercase text-gray-600 text-right w-[13%]">Debit</th>
                    <th className="border-r border-gray-200 p-3 text-xs font-bold uppercase text-gray-600 text-right w-[13%]">Credit</th>
                    <th className="p-3 w-[8%]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lines.map((line) => (
                    <tr key={line.id} className="hover:bg-gray-50">
                      {/* Account */}
                      <td className="border-r border-gray-200 p-2">
                        <AccountSelect
                          value={line.accountName}
                          accounts={accounts}
                          onChange={(account) => handleAccountSelect(line.id, account)}
                        />
                      </td>
                      {/* Description */}
                      <td className="border-r border-gray-200 p-2">
                        <Input
                          placeholder="Description"
                          value={line.description}
                          onChange={(e) => updateLine(line.id, "description", e.target.value)}
                        />
                      </td>
                      {/* Debit */}
                      <td className="border-r border-gray-200 p-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={line.debit}
                          onChange={(e) => updateLine(line.id, "debit", e.target.value)}
                          className="text-right"
                        />
                      </td>
                      {/* Credit */}
                      <td className="border-r border-gray-200 p-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={line.credit}
                          onChange={(e) => updateLine(line.id, "credit", e.target.value)}
                          className="text-right"
                        />
                      </td>
                      {/* Remove row */}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          title="Remove row"
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition text-gray-400 hover:text-red-500 mx-auto text-xl leading-none"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Totals row */}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={2} className="border-r border-gray-200 p-3 text-sm text-gray-800">
                      Totals
                    </td>
                    <td className="border-r border-gray-200 p-3 text-sm text-right"
                        style={{ color: isBalanced ? "inherit" : "var(--color-danger)" }}>
                      {fmt(totalDebit)}
                    </td>
                    <td className="border-r border-gray-200 p-3 text-sm text-right"
                        style={{ color: isBalanced ? "inherit" : "var(--color-danger)" }}>
                      {fmt(totalCredit)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Attachments ── */}
          <div>
            <label className="block mb-2 text-sm text-(--color-primary)">Attachments</label>
            <input
              type="file"
              multiple
              className="block text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border file:border-gray-300
                file:text-sm file:font-medium
                file:bg-white file:text-gray-700
                hover:file:bg-gray-50 cursor-pointer"
            />
          </div>

        </div>
      </Card>

      {/* ── Footer Actions ── */}
      <div className="flex gap-3 mt-6">
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
          Record Journal Entry
        </Button>
        <Button variant="outline" onClick={() => navigate("/dashboard/accounting/general-ledger")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}