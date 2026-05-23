import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBankAccounts, deleteBankAccount, bulkDeleteBankAccounts, updateBankBalance } from "../api/accountingApi";
import { getAssociations } from "@/modules/associations/associationApi";
import DeleteConfirmModal from "@/modules/accounting/components/DeleteConfirmModal";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Edit2, Trash2, Plus, X } from "lucide-react";

export default function BankingTab() {
  const navigate = useNavigate();

  const [bankAccounts, setBankAccounts] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [selectedAssoc, setSelectedAssoc] = useState("All");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Update balance modal state
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAccountId, setBalanceAccountId] = useState(null);
  const [newBalance, setNewBalance] = useState("");

  const fetchBankAccounts = async (assocId = null) => {
    const res = await getBankAccounts(assocId);
    const data =
      res?.data?.data?.content ??
      res?.data?.data ??
      res?.data ??
      [];
    if (!Array.isArray(data))
      throw new Error("Unexpected response shape from getBankAccounts");
    return data;
  };

  const loadDropdowns = async () => {
    try {
      const assocRes = await getAssociations();
      const rawAssoc =
        assocRes.data?.data?.content ??
        assocRes.data?.data ??
        assocRes.data?.content ??
        assocRes.data ??
        [];

      setAssociations([
        { value: "All", label: "All Assc" },
        ...rawAssoc.map((a) => ({
          value: String(a.id || a.associationId),
          label: a.name || a.associationName || "Unnamed",
        })),
      ]);
    } catch (err) {
      console.error("Association Error:", err);
      toast.error("Failed to load associations");
    }

    try {
      setBankAccounts(await fetchBankAccounts(null));
    } catch (err) {
      console.error("Bank Error:", err);
      toast.error("Failed to load bank accounts");
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  const handleAssocChange = async (e) => {
    const val = e?.target?.value ?? e;
    setSelectedAssoc(val);
    try {
      setLoading(true);
      setSelectedIds(new Set());
      setBankAccounts(await fetchBankAccounts(val === "All" ? null : val));
    } catch (err) {
      console.error("Filter Error:", err);
      toast.error("Filtering failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteBankAccount(selectedId);
      toast.success("Deleted successfully");
      setBankAccounts(
        await fetchBankAccounts(selectedAssoc === "All" ? null : selectedAssoc)
      );
      setShowDeleteModal(false);
      setSelectedId(null);
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Delete failed");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteBankAccounts([...selectedIds]);
      toast.success(`${selectedIds.size} bank account(s) deleted`);
      setShowBulkDeleteModal(false);
      setSelectedIds(new Set());
      setBankAccounts(await fetchBankAccounts(selectedAssoc === "All" ? null : selectedAssoc));
    } catch (err) {
      console.error("Bulk Delete Error:", err);
      toast.error("Failed to delete selected accounts");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === bankAccounts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bankAccounts.map((a) => a.id)));
    }
  };

  const allSelected = bankAccounts.length > 0 && selectedIds.size === bankAccounts.length;

  const openBalanceModal = (accId, currentBalance) => {
    setBalanceAccountId(accId);
    setNewBalance(String(currentBalance ?? ""));
    setShowBalanceModal(true);
  };

  const handleUpdateBalance = async () => {
    if (newBalance === "" || isNaN(Number(newBalance))) {
      toast.error("Please enter a valid balance");
      return;
    }
    try {
      await updateBankBalance(balanceAccountId, Number(newBalance));
      toast.success("Balance updated successfully");
      setBankAccounts(await fetchBankAccounts(selectedAssoc === "All" ? null : selectedAssoc));
      setShowBalanceModal(false);
      setBalanceAccountId(null);
      setNewBalance("");
    } catch (err) {
      console.error("Balance update error:", err);
      toast.error(err.response?.data?.error || "Failed to update balance");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Banking</h2>

      {/* Filter */}
      <Card className="p-6 mb-6">
        <div className="w-64">
          <Select
            label="Association"
            name="associationId"
            options={associations}
            value={String(selectedAssoc)}
            onChange={handleAssocChange}
          />
        </div>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 mb-4">
        {selectedIds.size > 0 && (
          <Button
            variant="danger"
            onClick={() => setShowBulkDeleteModal(true)}
          >
            Delete Selected ({selectedIds.size})
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard/accounting/banking/create")}
        >
          <Plus size={18} className="mr-2" /> Add Bank Account
        </Button>
      </div>

      {/* Table */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">
                Association
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">
                Name
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">
                Account Number
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">
                Balance
              </th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : bankAccounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-20 text-center text-gray-500">
                  No bank accounts found.
                </td>
              </tr>
            ) : (
              bankAccounts.map((acc) => (
                <tr
                  key={acc.id}
                  className={`hover:bg-gray-50 transition-colors ${selectedIds.has(acc.id) ? "bg-blue-50" : ""}`}
                >
                  <td className="border-r border-gray-300 p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(acc.id)}
                      onChange={() => toggleSelect(acc.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">
                    {acc.associationName || "N/A"}
                  </td>
                  <td
                    className="border-r border-gray-300 p-4 text-sm font-semibold text-gray-900 cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/dashboard/accounting/banking/details/${acc.id}`)
                    }
                  >
                    {acc.bankAccountName}
                  </td>
                  <td className="border-r border-gray-300 p-4 text-sm font-mono text-gray-600">
                    {acc.accountNumberMasked}
                  </td>
                  <td className="border-r border-gray-300 p-4 text-sm text-right font-bold text-gray-900">
                    ${(acc.balance || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-4 text-gray-400">
                      <Edit2
                        size={18}
                        className="cursor-pointer hover:text-slate-900 transition-colors"
                        title="Edit account"
                        onClick={() =>
                          navigate(`/dashboard/accounting/banking/edit/${acc.id}`)
                        }
                      />
                      <span
                        className="cursor-pointer hover:text-green-700 transition-colors text-xs font-semibold text-gray-500"
                        title="Update balance"
                        onClick={() => openBalanceModal(acc.id, acc.balance)}
                      >
                        $+
                      </span>
                      <Trash2
                        size={18}
                        className="cursor-pointer hover:text-red-600 transition-colors"
                        title="Delete account"
                        onClick={() => {
                          setSelectedId(acc.id);
                          setShowDeleteModal(true);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Single Delete Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Bank Account"
          message="Are you sure you want to delete this bank account? This action cannot be undone."
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedId(null);
          }}
          onConfirm={handleDelete}
        />
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <DeleteConfirmModal
          title="Delete Selected Bank Accounts"
          message={`Are you sure you want to delete ${selectedIds.size} selected bank account(s)? This action cannot be undone.`}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={handleBulkDelete}
        />
      )}

      {/* Update Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-xl border-none">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-900">Update Balance</h3>
              <button onClick={() => setShowBalanceModal(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="New Balance"
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="Enter new balance"
              />
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 justify-end rounded-b-xl">
              <Button variant="outline" onClick={() => setShowBalanceModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdateBalance}>Update Balance</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
