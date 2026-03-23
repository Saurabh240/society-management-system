import Button             from "@/components/ui/Button";
import { useState }       from "react";
import StatusBadge        from "../components/StatusBadge";
import CreateEmailModal   from "../components/CreateEmailModal";
import ViewEmailModal     from "../components/ViewEmailModal";
import EditEmailModal     from "../components/EditEmailModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { EMAILS }         from "../data";
import { useState as _  } from "react";
import { MoreVertical, Eye, Pencil, Trash2, RefreshCw, Clock } from "lucide-react";
import ReactDOM           from "react-dom";
import { useEffect, useRef } from "react";

function EmailActionDropdown({ email, onView, onEdit, onDelete }) {
  const btnRef          = useRef(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setStyle({ position: "fixed", top: r.bottom + 4, left: r.right - 144, zIndex: 9999 });
    }
  }, [open]);

  return (
    <>
      <button ref={btnRef} onClick={() => setOpen((o) => !o)} className="p-1.5 hover:bg-gray-200 rounded-md transition-colors">
        <MoreVertical size={18} className="text-gray-500" />
      </button>
      {open && ReactDOM.createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div style={style} className="w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden py-1">
            <button onClick={() => { setOpen(false); onView(); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"}
              onMouseLeave={e => e.currentTarget.style.color = ""}>
              <Eye size={14} className="text-blue-500" /> View
            </button>
            {email.status === "Scheduled" ? (
              <button onClick={() => { setOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = ""}>
                <Clock size={14} className="text-amber-500" /> Reschedule
              </button>
            ) : (
              <button onClick={() => { setOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = ""}>
                <RefreshCw size={14} className="text-green-500" /> Resend
              </button>
            )}
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"}
              onMouseLeave={e => e.currentTarget.style.color = ""}>
              <Pencil size={14} className="text-amber-500" /> Edit
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button onClick={() => { setOpen(false); onDelete(); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50"
              style={{ color: "var(--color-danger)" }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default function EmailPage() {
  const [emails, setEmails]                   = useState(EMAILS);
  const [selected, setSelected]               = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewEmail,   setViewEmail]   = useState(null);
  const [editEmail,   setEditEmail]   = useState(null);
  const [deleteEmail, setDeleteEmail] = useState(null);

  const handleDeleted = (id)      => setEmails((prev) => prev.filter((e) => e.id !== id));
  const handleUpdated = (updated) => setEmails((prev) => prev.map((e) => e.id === updated.id ? updated : e));
  const toggleSelect  = (id)      => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll     = ()        => setSelected(selected.length === emails.length ? [] : emails.map((e) => e.id));
  const handleBulkDelete = () => {
    setEmails((prev) => prev.filter((item) => !selected.includes(item.id)));
    setSelected([]);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
          + Create Email
        </Button>
      </div>

      {/* Bulk action bar — shown when items are selected */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4">
          <span className="text-sm text-gray-600">
            {selected.length} item{selected.length > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 text-sm text-white rounded-lg transition hover:opacity-90"
            style={{ backgroundColor: "var(--color-danger)" }}
          >
            Delete Selected
          </button>
        </div>
      )}

      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-center rounded-tl-xl w-10">
                <input type="checkbox" checked={selected.length === emails.length && emails.length > 0} onChange={toggleAll} className="w-4 h-4 cursor-pointer" />
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Subject</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {emails.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500 italic">No emails found.</td>
              </tr>
            ) : (
              emails.map((email, idx) => (
                <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`border-r border-gray-200 p-4 text-center ${idx === emails.length - 1 ? "rounded-bl-xl" : ""}`}>
                    <input type="checkbox" checked={selected.includes(email.id)} onChange={() => toggleSelect(email.id)} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer text-center" style={{ color: "var(--color-primary)" }} onClick={() => setViewEmail(email)}>
                    {email.subject}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{email.recipient}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{email.date}</td>
                  <td className="border-r border-gray-200 p-4 text-center"><StatusBadge status={email.status} /></td>
                  <td className={`p-4 text-center ${idx === emails.length - 1 ? "rounded-br-xl" : ""}`}>
                    <EmailActionDropdown
                      email={email}
                      onView={()   => setViewEmail(email)}
                      onEdit={()   => setEditEmail(email)}
                      onDelete={()  => setDeleteEmail(email)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && <CreateEmailModal onClose={() => setShowCreateModal(false)} />}
      {viewEmail   && <ViewEmailModal email={viewEmail} onClose={() => setViewEmail(null)} />}
      {editEmail   && <EditEmailModal email={editEmail} onClose={() => setEditEmail(null)} onSave={handleUpdated} />}
      {deleteEmail && (
        <DeleteConfirmModal
          title="Delete Email"
          message="Are you sure you want to delete this email? This action cannot be undone."
          onClose={() => setDeleteEmail(null)}
          onConfirm={() => { handleDeleted(deleteEmail.id); setDeleteEmail(null); }}
        />
      )}
    </div>
  );
}