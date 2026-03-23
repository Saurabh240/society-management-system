import { useState, useEffect, useRef } from "react";
import { useNavigate }    from "react-router-dom";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import ReactDOM           from "react-dom";
import Button             from "@/components/ui/Button";
import { MAILINGS }       from "../data";
import StatusBadge        from "../components/StatusBadge";
import ViewMailingModal   from "../components/ViewMailingModal";
import EditMailingModal   from "../components/EditMailingModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

function MailingActionDropdown({ onView, onEdit, onDelete }) {
  const btnRef            = useRef(null);
  const [open, setOpen]   = useState(false);
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
          <div style={style} className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden py-1">
            <button onClick={() => { setOpen(false); onView(); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"}
              onMouseLeave={e => e.currentTarget.style.color = ""}>
              <Eye size={14} className="text-blue-500" /> View
            </button>
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

export default function MailingPage() {
  const navigate = useNavigate();

  const [mailings, setMailings]     = useState(MAILINGS);
  const [selected, setSelected]     = useState([]);
  const [viewItem, setViewItem]     = useState(null);
  const [editItem, setEditItem]     = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const handleUpdated = (updated) => setMailings((prev) => prev.map((m) => m.id === updated.id ? updated : m));
  const handleDeleted = (id)      => setMailings((prev) => prev.filter((m) => m.id !== id));
  const toggleSelect  = (id)      => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll     = ()        => setSelected(selected.length === mailings.length ? [] : mailings.map((m) => m.id));
  const handleBulkDelete = () => {
    setMailings((prev) => prev.filter((item) => !selected.includes(item.id)));
    setSelected([]);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => navigate("create")}>
          + Create Mailing
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
                <input type="checkbox" checked={selected.length === mailings.length && mailings.length > 0} onChange={toggleAll} className="w-4 h-4 cursor-pointer" />
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Title</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mailings.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500 italic">No mailings found.</td>
              </tr>
            ) : (
              mailings.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`border-r border-gray-200 p-4 text-center ${idx === mailings.length - 1 ? "rounded-bl-xl" : ""}`}>
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer text-center" style={{ color: "var(--color-primary)" }} onClick={() => setViewItem(item)}>
                    {item.title}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{item.recipient}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{item.date}</td>
                  <td className="border-r border-gray-200 p-4 text-center"><StatusBadge status={item.status} /></td>
                  <td className={`p-4 text-center ${idx === mailings.length - 1 ? "rounded-br-xl" : ""}`}>
                    <MailingActionDropdown
                      onView={()   => setViewItem(item)}
                      onEdit={()   => setEditItem(item)}
                      onDelete={()  => setDeleteItem(item)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewItem   && <ViewMailingModal mailing={viewItem} onClose={() => setViewItem(null)} />}
      {editItem   && <EditMailingModal mailing={editItem} onClose={() => setEditItem(null)} onSave={handleUpdated} />}
      {deleteItem && (
        <DeleteConfirmModal
          title="Delete Mailing"
          message="Are you sure you want to delete this mailing? This action cannot be undone."
          onClose={() => setDeleteItem(null)}
          onConfirm={() => handleDeleted(deleteItem.id)}
        />
      )}
    </div>
  );
}