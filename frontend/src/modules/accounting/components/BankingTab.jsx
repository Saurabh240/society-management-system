import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import { getBankAccounts, deleteBankAccount } from "../api/accountingApi";
import { getAssociations } from "@/modules/associations/associationApi";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

// ─── Mask account number → ****XXXX ──────────────────────────────────────────
const maskAccount = (number) => {
  if (!number) return "—";
  const str = String(number);
  return `****${str.slice(-4)}`;
};

// ─── Format balance ───────────────────────────────────────────────────────────
const fmtBalance = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount ?? 0);

// ─── Three-dot Menu (portal) ─────────────────────────────────────────────────
const DotsMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen]     = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef              = useRef(null);
  const menuRef             = useRef(null);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + window.scrollY + 4, left: rect.right + window.scrollX - 144 });
    }
    setOpen((p) => !p);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <div className="flex justify-center">
        <button
          ref={btnRef}
          onClick={handleOpen}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition text-gray-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5"  r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: "absolute", top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
          className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition"
          >
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full px-4 py-2 text-sm text-left transition hover:bg-red-50"
            style={{ color: "var(--color-danger)" }}
          >
            Delete
          </button>
        </div>,
        document.body
      )}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BankingTab() {
  const navigate = useNavigate();

  const [bankAccounts, setBankAccounts]   = useState([]);
  const [associations, setAssociations]   = useState([]);
  const [selectedAssoc, setSelectedAssoc] = useState("");
  const [loading, setLoading]             = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  // Load associations for filter dropdown
  useEffect(() => {
    getAssociations()
      .then((res) => setAssociations(res.data?.data ?? []))
      .catch(() => toast.error("Failed to load associations"));
  }, []);

  // Load bank accounts (re-runs when filter changes)
  const fetchBankAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBankAccounts(selectedAssoc);
      setBankAccounts(res.data?.content ?? res.data ?? []);
    } catch {
      toast.error("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  }, [selectedAssoc]);

  useEffect(() => { fetchBankAccounts(); }, [fetchBankAccounts]);

  const handleDelete = async () => {
    try {
      await deleteBankAccount(deleteTarget.id);
      toast.success("Bank account deleted successfully");
      setDeleteTarget(null);
      fetchBankAccounts();
    } catch {
      toast.error("Failed to delete bank account");
    }
  };

  return (
    <div>
      {/* ── Association filter card ── */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 mb-4">
        <label className="block text-sm mb-1" style={{ color: "var(--color-primary)" }}>
          Association
        </label>
        <select
          value={selectedAssoc}
          onChange={(e) => setSelectedAssoc(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-52"
        >
          <option value="">All Associations</option>
          {associations.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* ── Add button ── */}
      <div className="flex justify-end mb-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/dashboard/accounting/banking/create")}
        >
          + Add Bank Account
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Association</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Account Number</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Balance</th>
              <th className="p-4 w-14" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : bankAccounts.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-500">No bank accounts found.</td></tr>
            ) : (
              bankAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">
                    {account.associationName || "—"}
                  </td>
                  <td className="border-r border-gray-300 p-4 text-sm font-semibold text-gray-900">
                    {account.name}
                  </td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700 font-mono">
                    {maskAccount(account.accountNumber)}
                  </td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">
                    {fmtBalance(account.balance)}
                  </td>
                  <td className="p-4">
                    <DotsMenu
                      onEdit={() => navigate(`/dashboard/accounting/banking/edit/${account.id}`)}
                      onDelete={() => setDeleteTarget(account)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Bank Account"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}