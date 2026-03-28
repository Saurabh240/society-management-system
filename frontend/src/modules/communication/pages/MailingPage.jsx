import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button             from "@/components/ui/Button";
import StatusBadge        from "../components/StatusBadge";
import ViewMailingModal   from "../components/ViewMailingModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { MAILINGS }       from "../data";

const ActionBtn = ({ label, onClick }) => (
  <button onClick={onClick} className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 whitespace-nowrap">
    {label}
  </button>
);

export default function MailingPage() {
  const navigate = useNavigate();

  const [mailings, setMailings]     = useState(MAILINGS);
  const [selected, setSelected]     = useState([]);
  const [viewItem, setViewItem]     = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const handleDeleted    = (id) => setMailings((prev) => prev.filter((m) => m.id !== id));
  const toggleSelect     = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll        = ()   => setSelected(selected.length === mailings.length ? [] : mailings.map((m) => m.id));
  const handleBulkDelete = ()   => { setMailings((prev) => prev.filter((m) => !selected.includes(m.id))); setSelected([]); };

  return (
    <div>
      {/* Create button */}
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => navigate("/dashboard/communication/mailings/create")}>
          + Create Mailing
        </Button>
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
                <input type="checkbox" checked={selected.length === mailings.length && mailings.length > 0} onChange={toggleAll} className="w-4 h-4 cursor-pointer" />
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Title</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left rounded-tr-xl">Actions</th>
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
                  <td className="border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer" style={{ color: "var(--color-primary)" }} onClick={() => setViewItem(item)}>
                    {item.title}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700">{item.recipient}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700">{item.date}</td>
                  <td className="border-r border-gray-200 p-4"><StatusBadge status={item.status} /></td>
                  <td className={`p-4 ${idx === mailings.length - 1 ? "rounded-br-xl" : ""}`}>
                    <div className="flex items-center gap-2">
                      <ActionBtn label="Edit"   onClick={() => navigate(`/dashboard/communication/mailings/edit/${item.id}`, { state: item })} />
                      <ActionBtn label="Delete" onClick={() => setDeleteItem(item)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewItem   && <ViewMailingModal mailing={viewItem} onClose={() => setViewItem(null)} />}
      {deleteItem && (
        <DeleteConfirmModal
          title="Delete Mailing"
          message="Are you sure you want to delete this mailing? This action cannot be undone."
          onClose={() => setDeleteItem(null)}
          onConfirm={() => { handleDeleted(deleteItem.id); setDeleteItem(null); }}
        />
      )}
    </div>
  );
}