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
        <button onClick={onView}   className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 transition hover:bg-blue-50" style={{ "--tw-text-opacity": 1 }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"} onMouseLeave={e => e.currentTarget.style.color = ""}>
          <Eye size={14} /> View
        </button>
        <button onClick={onEdit}   className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 transition hover:bg-blue-50"
          onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"} onMouseLeave={e => e.currentTarget.style.color = ""}>
          <Pencil size={14} /> Edit
        </button>
        <button onClick={onDelete} className="flex items-center gap-2 w-full px-4 py-2 text-sm transition hover:bg-red-50" style={{ color: "var(--color-danger)" }}>
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </>,
    document.body
  );
};

const ActionCell = ({ account, onDeleteConfirm }) => {
  const navigate        = useNavigate();
  const btnRef          = useRef(null);
  const [open, setOpen] = useState(false);

  const navState = {
    id:              account.ownerId,
    associationId:   account.associationId,
    associationName: account.associationName,
    unitId:          account.unitId,
    unitNumber:      account.unitNumber,
    isBoardMember:   account.isBoardMember,
    termStartDate:   account.termStartDate,
    termEndDate:     account.termEndDate,
  };

  const handleView   = () => { setOpen(false); navigate(`/dashboard/associations/accounts/${account.ownerId}`, { state: navState }); };
  const handleEdit   = () => { setOpen(false); navigate(`/dashboard/associations/accounts/${account.ownerId}/edit`, { state: navState }); };
  const handleDelete = () => { setOpen(false); onDeleteConfirm(account.ownerId); };

  return (
    <td className="px-4 py-3">
      <button ref={btnRef} onClick={() => setOpen((o) => !o)} className="p-1.5 rounded-lg transition hover:bg-gray-100">
        <MoreVertical size={16} className="text-gray-400" />
      </button>
      {open && (
        <ActionMenu anchorRef={btnRef} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onClose={() => setOpen(false)} />
      )}
    </td>
  );
};

const COLUMNS = ["First Name", "Last Name", "Association", "Unit", "Email", "Phone", "Actions"];

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

  return (
    <>
      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Owner</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this owner? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExecute}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg text-white transition disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: "var(--color-danger)"}}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left" style={{ minWidth: "700px" }}>
          <thead style={{ backgroundColor: "var(--color-primary)" }} className="text-white text-xs uppercase tracking-wide">
            <tr>
              {COLUMNS.map((h) => (
                <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center py-16 text-sm text-gray-400">
                  No ownership accounts found.
                </td>
              </tr>
            ) : (
              accounts.map((account, idx) => (
                <tr
                  key={account.ownerId}
                  className="transition"
                  style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#F8F9FC" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#EEF1F9"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#F8F9FC"}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium" style={{ color: "#1A2B6B" }}>{account.firstName}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium" style={{ color: "#1A2B6B" }}>{account.lastName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{account.associationName || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{account.unitNumber || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{account.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{account.phone}</td>
                  <ActionCell account={account} onDeleteConfirm={setConfirmDeleteId} />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OwnershipAccountTable;