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


//helper function

const extractArray = (res) => {
  const data =
    res?.data?.data?.content ||
    res?.data?.data ||
    res?.data?.content ||
    res?.data ||
    [];

  return Array.isArray(data) ? data : [];
};


  const loadDropdowns = async () => {
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

  try {
    const bankRes = await getBankAccounts();
    setBankAccounts(extractArray(bankRes));
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
    setBankAccounts(extractArray(res));

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

    const res = await getBankAccounts(
      selectedAssoc === "All" ? null : selectedAssoc
    );

    setBankAccounts(extractArray(res));

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

   
      {/* Table  */}
<div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
  <table className="w-full table-auto border-collapse">

    <thead style={{ backgroundColor: "#a9c3f7" }}>
      <tr>
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
          <td colSpan={5} className="p-10 text-center text-gray-400">Loading...</td>
        </tr>
      ) : bankAccounts.length === 0 ? (
        <tr>
          <td colSpan={5} className="p-20 text-center text-gray-500">
            No bank accounts found.
          </td>
        </tr>
      ) : (
        bankAccounts.map((acc) => (
          <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
            <td className="border-r border-gray-300 p-4 text-sm text-gray-700 ">
              {acc.associationName || "N/A"}
            </td>
            <td className="border-r border-gray-300 p-4 text-sm font-semibold text-gray-900">
              {acc.bankAccountName}
            </td>
            <td className="border-r border-gray-300 p-4 text-sm font-mono text-gray-600">
              {acc.accountNumberMasked}
            </td>
            <td className="border-r border-gray-300 p-4 text-sm text-right font-bold text-gray-900">
              ${(acc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
            <td className="p-4">
              <div className="flex justify-center gap-4 text-gray-400">
                <Edit2
                  size={18}
                  className="cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => navigate(`/dashboard/accounting/banking/edit/${acc.id}`)}
                />
                <Trash2
                  size={18}
                  className="cursor-pointer hover:text-red-600 transition-colors"
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

{/* delete modal */}
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
    </div>
  );
}