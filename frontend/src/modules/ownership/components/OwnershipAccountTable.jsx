import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "react-toastify";

const OwnershipAccountTable = ({ accounts = [], onDeleted }) => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const toggleMenu = (id) => setOpenMenuId((prev) => (prev === id ? null : id));

  const handleView   = (id) => { setOpenMenuId(null); navigate(`/dashboard/associations/accounts/${id}`); };
  const handleEdit   = (id) => { setOpenMenuId(null); navigate(`/dashboard/associations/accounts/${id}/edit`); };
  const handleDeleteConfirm  = (id) => { setOpenMenuId(null); setConfirmDeleteId(id); };

  const handleDeleteExecute = () => {
    try {
      onDeleted?.(confirmDeleteId);
      toast.success("Owner deleted successfully.");
    } catch {
      toast.error("Failed to delete owner.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (!accounts.length) {
    return <div className="text-center py-16 text-gray-400 text-sm">No ownership accounts found.</div>;
  }

  return (
    <>
      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Owner</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this owner? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleDeleteExecute} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Table — min-width keeps columns readable, parent handles scroll */}
      <table className="w-full text-sm text-left min-w-[640px]">
        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
          <tr>
            {["First Name","Last Name","Association","Unit","Email","Phone","Actions"].map((h) => (
              <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {accounts.map((account) => (
            <tr key={account.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 whitespace-nowrap">{account.firstName}</td>
              <td className="px-4 py-3 whitespace-nowrap">{account.lastName}</td>
              <td className="px-4 py-3 whitespace-nowrap">{account.associationName}</td>
              <td className="px-4 py-3 whitespace-nowrap">{account.unit}</td>
              <td className="px-4 py-3 whitespace-nowrap">{account.email}</td>
              <td className="px-4 py-3 whitespace-nowrap">{account.phone}</td>
              <td className="px-4 py-3 relative">
                <button onClick={() => toggleMenu(account.id)} className="p-1 rounded hover:bg-gray-100">
                  <MoreVertical size={16} />
                </button>
                {openMenuId === account.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute right-6 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-md w-36">
                      <button onClick={() => handleView(account.id)}          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"><Eye size={14} /> View</button>
                      <button onClick={() => handleEdit(account.id)}          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"><Pencil size={14} /> Edit</button>
                      <button onClick={() => handleDeleteConfirm(account.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={14} /> Delete</button>
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default OwnershipAccountTable;