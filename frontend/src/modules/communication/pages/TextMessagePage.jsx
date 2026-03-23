import { useState, useEffect, useRef } from "react";
import { MoreVertical, Eye, Pencil, Trash2, RefreshCw, Clock } from "lucide-react";
import ReactDOM               from "react-dom";
import Button                 from "@/components/ui/Button";
import StatusBadge            from "../components/StatusBadge";
import CreateTextMessageModal from "../components/CreateTextMessageModal";
import DeleteConfirmModal     from "../components/DeleteConfirmModal";
import { TEXT_MESSAGES }      from "../data";

function TextActionDropdown({ item, onView, onEdit, onDelete }) {
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
          <div style={style} className="w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden py-1">
            <button onClick={() => { setOpen(false); onView(); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"}
              onMouseLeave={e => e.currentTarget.style.color = ""}>
              <Eye size={14} className="text-blue-500" /> View
            </button>
            {item.status === "Scheduled" ? (
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

export default function TextMessagePage() {
  const [messages, setMessages]               = useState(TEXT_MESSAGES);
  const [selected, setSelected]               = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewItem, setViewItem]               = useState(null);
  const [deleteItem, setDeleteItem]           = useState(null);

  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll    = ()   => setSelected(selected.length === messages.length ? [] : messages.map((m) => m.id));
  const handleBulkDelete = () => {
    setMessages((prev) => prev.filter((item) => !selected.includes(item.id)));
    setSelected([]);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>+ Create Text Message</Button>
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
                <input type="checkbox" checked={selected.length === messages.length && messages.length > 0} onChange={toggleAll} className="w-4 h-4 cursor-pointer" />
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Message</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Phone Number</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {messages.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center text-gray-500 italic">No text messages found.</td></tr>
            ) : (
              messages.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`border-r border-gray-200 p-4 text-center ${idx === messages.length - 1 ? "rounded-bl-xl" : ""}`}>
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer text-center max-w-xs" style={{ color: "var(--color-primary)" }} onClick={() => setViewItem(item)}>{item.message}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center whitespace-nowrap">{item.recipient}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{item.phone}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center whitespace-nowrap">{item.date}</td>
                  <td className="border-r border-gray-200 p-4 text-center"><StatusBadge status={item.status} /></td>
                  <td className={`p-4 text-center ${idx === messages.length - 1 ? "rounded-br-xl" : ""}`}>
                    <TextActionDropdown
                      item={item}
                      onView={()   => setViewItem(item)}
                      onEdit={()   => {}}
                      onDelete={()  => setDeleteItem(item)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center px-4" onClick={() => setViewItem(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">View Text Message</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-4"><span className="text-gray-500 w-24">Recipient:</span><span className="text-gray-700">{viewItem.recipient}</span></div>
              <div className="flex gap-4"><span className="text-gray-500 w-24">Phone:</span><span className="text-gray-700">{viewItem.phone}</span></div>
              <div className="flex gap-4"><span className="text-gray-500 w-24">Date:</span><span className="text-gray-700">{viewItem.date}</span></div>
              <div className="flex gap-4"><span className="text-gray-500 w-24">Status:</span><StatusBadge status={viewItem.status} /></div>
              <div><span className="text-gray-500">Message:</span><p className="mt-1 text-gray-900 border border-gray-200 rounded p-3 bg-gray-50">{viewItem.message}</p></div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" size="sm" onClick={() => setViewItem(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <DeleteConfirmModal
          title="Delete Text Message"
          message="Are you sure you want to delete this message? This action cannot be undone."
          onClose={() => setDeleteItem(null)}
          onConfirm={() => { setMessages((p) => p.filter((m) => m.id !== deleteItem.id)); setDeleteItem(null); }}
        />
      )}

      {showCreateModal && <CreateTextMessageModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}