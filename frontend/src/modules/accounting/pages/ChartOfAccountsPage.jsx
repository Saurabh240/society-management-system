import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCoaList, deleteAccount } from "../api/accountingApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { label: "All Types",    value: ""           },
  { label: "Assets",       value: "ASSETS"     },
  { label: "Liabilities",  value: "LIABILITIES"},
  { label: "Equity",       value: "EQUITY"     },
  { label: "Income",       value: "INCOME"     },
  { label: "Expenses",     value: "EXPENSES"   },
];

// ─── Three-dot Menu (portal-based — escapes table overflow clipping) ──────────
const DotsMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Position the portal dropdown relative to the button
  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top:  rect.bottom + window.scrollY + 4,
        left: rect.right  + window.scrollX - 144, // 144 = w-36
      });
    }
    setOpen((p) => !p);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChartOfAccountsPage() {
  const navigate = useNavigate();

  const [accounts, setAccounts]         = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter]     = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCoaList(debouncedSearch, typeFilter);
      const content = res.data?.content ?? [];
      setAccounts(content);
      setTotal(res.data?.totalElements ?? content.length);
    } catch {
      toast.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleDelete = async () => {
    try {
      await deleteAccount(deleteTarget.id);
      toast.success("Account deleted successfully");
      setDeleteTarget(null);
      fetchAccounts();
    } catch {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Chart of Accounts</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/dashboard/accounting/chart-of-accounts/create")}
        >
          + Add Account
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="flex-1">
          <Input
            label="Search Accounts"
            placeholder="Search by name, code, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sm:w-52">
          <Select
            label="Account Type"
            name="typeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={TYPE_OPTIONS}
          />
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {accounts.length} of {total} accounts
      </p>

      {/* Table */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Account Code</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Account Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Type</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Notes</th>
              <th className="p-4 w-14" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : accounts.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-500">No accounts found.</td></tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{account.accountCode}</td>
                  <td className="border-r border-gray-300 p-4 text-sm font-semibold text-gray-900">{account.accountName}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{account.accountType}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-500">{account.notes || "—"}</td>
                  <td className="p-4">
                    <DotsMenu
                      onEdit={() => navigate(`/dashboard/accounting/chart-of-accounts/edit/${account.id}`)}
                      onDelete={() => setDeleteTarget(account)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Account"
          message={`Are you sure you want to delete "${deleteTarget.accountName}"? This action cannot be undone.`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}