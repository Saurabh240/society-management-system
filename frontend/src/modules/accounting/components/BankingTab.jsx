import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { getBankAccounts, deleteBankAccount } from "../api/accountingApi";
import { getAssociations } from "../../associations/associationApi";

const fmt = (val) =>
  `$${parseFloat(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const ACCOUNT_TYPE_LABELS = {
  CHECKING:     "Checking",
  SAVINGS:      "Savings",
  MONEY_MARKET: "Money Market",
};

export default function BankingTab() {
  const navigate = useNavigate();

  const [accounts,     setAccounts]     = useState([]);
  const [associations, setAssociations] = useState([]);
  const [filterAssoc,  setFilterAssoc]  = useState("");
  const [loading,      setLoading]      = useState(false);
  const [deleteItem,   setDeleteItem]   = useState(null);

  useEffect(() => {
    getAssociations()
      .then((res) => setAssociations(res.data.data || res.data || []))
      .catch(() => {});
  }, []);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBankAccounts(filterAssoc || null);
      setAccounts(res.data.data || []);
    } catch {
      toast.error("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  }, [filterAssoc]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleDelete = async (id) => {
    try {
      await deleteBankAccount(id);
      toast.success("Bank account deleted");
      setDeleteItem(null);
      fetchAccounts();
    } catch {
      toast.error("Failed to delete bank account");
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Association</label>
          <select
            value={filterAssoc}
            onChange={(e) => setFilterAssoc(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          >
            <option value="">All Associations</option>
            {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/dashboard/accounting/banking/create")}
        >
          + Add Bank Account
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Association</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Account Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Type</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Account Number</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-right">Balance</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : accounts.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-500">No bank accounts found. Add one to get started.</td></tr>
            ) : (
              accounts.map((acct) => (
                <tr key={acct.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border-r border-gray-200 p-4 text-sm font-medium text-gray-900">{acct.associationName}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700">{acct.bankAccountName}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-600">{ACCOUNT_TYPE_LABELS[acct.accountType] || acct.accountType}</td>
                  <td className="border-r border-gray-200 p-4 text-sm font-mono text-gray-700">{acct.accountNumberMasked}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-right font-semibold text-gray-900">{fmt(acct.balance)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/accounting/banking/edit/${acct.id}`, { state: { account: acct } })}
                        className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteItem(acct)}
                        className="px-3 py-1 text-xs border border-red-200 rounded hover:bg-red-50 transition text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteItem && (
        <DeleteConfirmModal
          title="Delete Bank Account"
          message={`Are you sure you want to delete "${deleteItem.bankAccountName}"? This cannot be undone.`}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => handleDelete(deleteItem.id)}
        />
      )}
    </div>
  );
}