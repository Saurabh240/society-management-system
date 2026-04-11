import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBankAccounts, deleteBankAccount } from "../api/accountingApi";
import { getAssociations } from "@/modules/associations/associationApi";
import DeleteConfirmModal from "@/modules/accounting/components/DeleteConfirmModal";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Edit2, Trash2, Plus } from "lucide-react";

export default function BankingTab() {
  const navigate = useNavigate();

  const [bankAccounts, setBankAccounts] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [selectedAssoc, setSelectedAssoc] = useState("All");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedId, setSelectedId] = useState(null);


  const loadDropdowns = async () => {
    // Associations
    try {
      const assocRes = await getAssociations();

      const rawAssoc =
        assocRes.data?.data?.content ||
        assocRes.data?.data ||
        assocRes.data?.content ||
        assocRes.data ||
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

    // Bank Accounts
    try {
      const bankRes = await getBankAccounts();
      setBankAccounts(bankRes.data?.content || bankRes.data || []);
    } catch (err) {
      console.error("Bank Error:", err);
    
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  // Handle dropdown 
  const handleAssocChange = async (e) => {
    const val = e?.target?.value || e;
    setSelectedAssoc(val);

    try {
      setLoading(true);
      const res = await getBankAccounts(val === "All" ? null : val);
      setBankAccounts(res.data?.content || res.data || []);
    } catch (err) {
      toast.error("Filtering failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete handler 
 const handleDelete = async () => {
  if (!selectedId) return;

  try {
    await deleteBankAccount(selectedId);
    toast.success("Deleted successfully");

    // refresh list
    const res = await getBankAccounts(
      selectedAssoc === "All" ? null : selectedAssoc
    );
    setBankAccounts(res.data?.content || res.data || []);

    setShowDeleteModal(false);
    setSelectedId(null);
  } catch (err) {
    toast.error("Delete failed");
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

      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="primary"
          onClick={() =>
            navigate("/dashboard/accounting/banking/create")
          }
        >
          <Plus size={18} className="mr-2" /> Add Bank Account
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
              <th className="p-4">Association</th>
              <th className="p-4">Name</th>
              <th className="p-4">Account Number</th>
              <th className="p-4 text-right">Balance</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>



          <tbody className="divide-y divide-gray-100">
            {bankAccounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-500">
                  No bank accounts found.
                </td>
              </tr>
            ) : (
              bankAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-700">
                    {acc.associationName || "N/A"}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {acc.accountName}
                  </td>
                  <td className="p-4 text-sm font-mono text-gray-600">
                    {acc.accountNumber}
                  </td>
                  <td className="p-4 text-sm text-right font-semibold text-gray-900">
                    $
                    {(acc.balance || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-4 text-gray-400">
                      <Edit2
                        size={18}
                        className="cursor-pointer hover:text-slate-900"
                        onClick={() =>
                          navigate(
                            `/dashboard/accounting/banking/edit/${acc.id}`
                          )
                        }
                      />
                      <Trash2
                        size={18}
                        className="cursor-pointer hover:text-red-600"
                         onClick={() => {
                      setSelectedId(acc.id);
                      setShowDeleteModal(true);
                         }}
                      />
                    </div>
                           {showDeleteModal && (
                           <DeleteConfirmModal
                        title="Delete Bank Account"
                  message="Are you sure you want to delete this bank account?"
                 onClose={() => {
                 setShowDeleteModal(false);
                    setSelectedId(null);
                       }}
                onConfirm={handleDelete}
                    />
                     )}

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}