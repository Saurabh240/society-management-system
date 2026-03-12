import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { deleteOwner } from "../ownershipApi";
import ReactDOM from "react-dom";

const ActionMenu = ({ anchorRef, onView, onEdit, onDelete, onClose }) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({ position: "fixed", top: rect.bottom + 4, left: rect.right - 144, zIndex: 9999 });
    }
  }, [anchorRef]);

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div style={style} className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden">
        <button onClick={onView}   className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"><Eye size={14} /> View</button>
        <button onClick={onEdit}   className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"><Pencil size={14} /> Edit</button>
        <button onClick={onDelete} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"><Trash2 size={14} /> Delete</button>
      </div>
    </>,
    document.body
  );
};

const ActionCell = ({ account, onDeleteConfirm }) => {
  const navigate        = useNavigate();
  const btnRef          = useRef(null);
  const [open, setOpen] = useState(false);

  const handleView   = () => { setOpen(false); navigate(`/dashboard/associations/accounts/${account.id}`); };
  const handleEdit   = () => { setOpen(false); navigate(`/dashboard/associations/accounts/${account.id}/edit`); };
  const handleDelete = () => { setOpen(false); onDeleteConfirm(account.id); };

  return (
    <td className="px-4 py-3">
      <button ref={btnRef} onClick={() => setOpen((o) => !o)} className="p-1.5 rounded-lg hover:bg-blue-50 transition">
        <MoreVertical size={16} className="text-gray-400" />
      </button>
      {open && (
        <ActionMenu anchorRef={btnRef} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onClose={() => setOpen(false)} />
      )}
    </td>
  );
};

const OwnershipAccountTable = ({ accounts = [], onDeleted }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting]               = useState(false);

  const handleDeleteExecute = async () => {
    setDeleting(true);
    try {
      await deleteOwner(confirmDeleteId);
      toast.success("Owner deleted successfully.");
      onDeleted?.(confirmDeleteId);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete owner.");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  if (!accounts.length) {
    return <div className="text-center py-16 text-gray-400 text-sm bg-white">No owners found.</div>;
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
              <button onClick={() => setConfirmDeleteId(null)} disabled={deleting} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50">Cancel</button>
              <button onClick={handleDeleteExecute}            disabled={deleting} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50">{deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left" style={{ minWidth: "480px" }}>
          <thead className="bg-blue-700 text-white text-xs uppercase tracking-wide">
            <tr>
              {["First Name", "Last Name", "Email", "Phone", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {accounts.map((account, idx) => (
              <tr key={account.id} className={`hover:bg-blue-50 transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                <td className="px-4 py-3 whitespace-nowrap text-gray-800">{account.firstName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-800">{account.lastName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{account.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{account.phone}</td>
                <ActionCell account={account} onDeleteConfirm={setConfirmDeleteId} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OwnershipAccountTable;