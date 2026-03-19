

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteOwner } from "../ownershipApi";
import ReactDOM from "react-dom";

const ActionMenu = ({ anchorRef, onView, onEdit, onDelete, onClose }) => {
  const [style, setStyle] = useState({});

 useEffect(() => {
  if (anchorRef.current) {
    const rect = anchorRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;

   
    const openUpwards = spaceBelow < 100;

    setStyle({
      position: "fixed",
      top: openUpwards
        ? rect.top - 40  
        : rect.bottom + 5,
      left: rect.right - 144,
      zIndex: 9999,
    });
  }
}, [anchorRef]);

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9998" onClick={onClose} />
      <div
        style={style}
        className="w-36 bg-white border border-gray-200 rounded-md shadow-2xl py-1 text-left animate-in fade-in zoom-in duration-75 z-9999"
      >
        <button onClick={onView} className="flex items-center w-full px-4 py-2 text-sm hover:bg-blue-50 gap-2 text-gray-700">
          <Eye size={14} className="text-blue-500" /> View
        </button>
        <button onClick={onEdit} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 gap-2 text-gray-700">
          <Pencil size={14} className="text-amber-500" /> Edit
        </button>
        <div className="border-t my-1" />
        <button onClick={onDelete} className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600 gap-2">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </>,
    document.body
  );
};

const ActionCell = ({ account, onDeleteConfirm, isLastRow }) => {
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);

  const navState = {
    id: account.ownerId,
    associationId: account.associationId,
    associationName: account.associationName,
    unitId: account.unitId,
    unitNumber: account.unitNumber,
    isBoardMember: account.isBoardMember,
    termStartDate: account.termStartDate,
    termEndDate: account.termEndDate,
  };

  return (
    <td className={`p-4 text-center ${isLastRow ? "rounded-br-xl" : ""}`}>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
      >
        <MoreVertical size={18} className="text-gray-500" />
      </button>
      {open && (
        <ActionMenu
          anchorRef={btnRef}
          onView={() => { setOpen(false); navigate(`/dashboard/associations/accounts/${account.ownerId}`, { state: navState }); }}
          onEdit={() => { setOpen(false); navigate(`/dashboard/associations/accounts/${account.ownerId}/edit`, { state: navState }); }}
          onDelete={() => { setOpen(false); onDeleteConfirm(account.ownerId); }}
          onClose={() => setOpen(false)}
        />
      )}
    </td>
  );
};

const OwnershipAccountTable = ({ accounts = [], onDeleted }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Owner</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button 
                onClick={handleDeleteExecute} 
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg flex items-center gap-2"
                disabled={deleting}
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

     
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse min-w-900px">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tl-xl">First Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Last Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Association</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Unit</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Email</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Phone</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-10 text-center text-gray-500 italic">No owners found.</td>
              </tr>
            ) : (
              accounts.map((account, idx) => (
                <tr key={account.ownerId} className="hover:bg-gray-50 transition-colors">
                  <td className={`border-r border-gray-200 p-4 text-sm text-center font-semibold text-gray-900 ${idx === accounts.length - 1 ? "rounded-bl-xl" : ""}`}>
                    {account.firstName}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-900 text-center">{account.lastName}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{account.associationName || "—"}</td>
                  <td className="border-r border-gray-200 p-4 text-center text-sm text-gray-700 font-medium">{account.unitNumber || "—"}</td>
                  <td className="border-r border-gray-200 p-4 text-center text-sm text-gray-600">{account.email}</td>
                  <td className="border-r border-gray-200 p-4 text-center text-sm text-gray-600">{account.phone}</td>
                  <ActionCell 
                    account={account} 
                    onDeleteConfirm={setConfirmDeleteId} 
                    isLastRow={idx === accounts.length - 1} 
                  />
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