import { useState } from "react";
import { useNavigate }    from "react-router-dom";
import Button             from "@/components/ui/Button";
import { MAILINGS }      from "../data";
import StatusBadge        from "../components/StatusBadge";
import ActionMenu         from "../components/ActionMenu";
import ViewMailingModal   from "../components/ViewMailingModal";
import EditMailingModal   from "../components/EditMailingModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function MailingPage() {
  const navigate = useNavigate();

  const [mailings, setMailings]       = useState(MAILINGS);
  const [viewItem, setViewItem]       = useState(null);
  const [editItem, setEditItem]       = useState(null);
  const [deleteItem, setDeleteItem]   = useState(null);

  const handleUpdated = (updated) => {
    setMailings((prev) => prev.map((m) => m.id === updated.id ? updated : m));
  };

  const handleDeleted = (id) => {
    setMailings((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div>

      {/* Create button — navigates to full page */}
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => navigate("create")}>
          + Create Mailing
        </Button>
      </div>

      {/* Table */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tl-xl">Title</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mailings.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-500 italic">No mailings found.</td>
              </tr>
            ) : (
              mailings.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td
                    className={`border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer text-center ${idx === mailings.length - 1 ? "rounded-bl-xl" : ""}`}
                    style={{ color: "var(--color-primary)" }}
                    onClick={() => setViewItem(item)}
                  >
                    {item.title}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{item.recipient}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{item.date}</td>
                  <td className="border-r border-gray-200 p-4 text-center"><StatusBadge status={item.status} /></td>
                  <td className={`p-4 text-center ${idx === mailings.length - 1 ? "rounded-br-xl" : ""}`}>
                    <ActionMenu
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

      {/* Modals */}
      {viewItem   && <ViewMailingModal   mailing={viewItem}   onClose={() => setViewItem(null)} />}
      {editItem   && <EditMailingModal   mailing={editItem}   onClose={() => setEditItem(null)}   onSave={handleUpdated} />}
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