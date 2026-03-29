import { useState } from "react";
import StatusBadge            from "../components/StatusBadge";
import TextMessageFormModal   from "../components/TextMessageFormModal";
import ViewTextMessageModal   from "../components/ViewTextMessageModal";
import DeleteConfirmModal     from "../components/DeleteConfirmModal";
import { TEXT_MESSAGES }      from "../data";

const ActionBtn = ({ label, onClick }) => (
  <button onClick={onClick} className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 whitespace-nowrap">
    {label}
  </button>
);

export default function TextMessagePage() {
  const [messages, setMessages]               = useState(TEXT_MESSAGES);
  const [selected, setSelected]               = useState([]);
  const [showCreate, setShowCreate]           = useState(false);
  const [viewItem, setViewItem]               = useState(null);
  const [editItem, setEditItem]               = useState(null);
  const [deleteItem, setDeleteItem]           = useState(null);

  const toggleSelect     = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll        = ()   => setSelected(selected.length === messages.length ? [] : messages.map((m) => m.id));
  const handleBulkDelete = ()   => { setMessages((prev) => prev.filter((m) => !selected.includes(m.id))); setSelected([]); };

  return (
    <div>
      {/* Create button */}
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 text-sm text-white rounded transition hover:opacity-90" style={{ backgroundColor: "#122b61" }}>
          + Create Text Message
        </button>
      </div>

      {/* Bulk delete bar */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4">
          <span className="text-sm text-gray-600">{selected.length} item{selected.length > 1 ? "s" : ""} selected</span>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm text-white rounded-lg transition hover:opacity-90" style={{ backgroundColor: "var(--color-danger)" }}>
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-center rounded-tl-xl w-10">
                <input type="checkbox" checked={selected.length === messages.length && messages.length > 0} onChange={toggleAll} className="w-4 h-4 cursor-pointer" />
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Message</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Phone Number</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-500 italic">No text messages found.</td>
              </tr>
            ) : (
              messages.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`border-r border-gray-200 p-4 text-center ${idx === messages.length - 1 ? "rounded-bl-xl" : ""}`}>
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer max-w-xs" style={{ color: "var(--color-primary)" }} onClick={() => setViewItem(item)}>
                    {item.message}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 whitespace-nowrap">{item.recipient}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700">{item.phone}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 whitespace-nowrap">{item.date}</td>
                  <td className="border-r border-gray-200 p-4"><StatusBadge status={item.status} /></td>
                  <td className={`p-4 ${idx === messages.length - 1 ? "rounded-br-xl" : ""}`}>
                    <div className="flex items-center gap-2">
                      <ActionBtn label="Edit"   onClick={() => setEditItem(item)} />
                      <ActionBtn label="Delete" onClick={() => setDeleteItem(item)} />
                      <ActionBtn label="Resend" onClick={() => setShowCreate(true)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCreate  && <TextMessageFormModal mode="create" onClose={() => setShowCreate(false)} />}
      {editItem    && <TextMessageFormModal mode="edit"   textMessage={editItem} onClose={() => setEditItem(null)}   onSave={() => setEditItem(null)} />}
      {viewItem    && <ViewTextMessageModal message={viewItem} onClose={() => setViewItem(null)} />}
      {deleteItem  && (
        <DeleteConfirmModal
          title="Delete Text Message"
          message="Are you sure you want to delete this message? This action cannot be undone."
          onClose={() => setDeleteItem(null)}
          onConfirm={() => { setMessages((p) => p.filter((m) => m.id !== deleteItem.id)); setDeleteItem(null); }}
        />
      )}
    </div>
  );
}