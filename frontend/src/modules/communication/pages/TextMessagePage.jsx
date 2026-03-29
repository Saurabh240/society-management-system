
import { useState, useEffect } from "react";
import StatusBadge from "../components/StatusBadge";
import TextMessageFormModal from "../components/TextMessageFormModal";
import ViewTextMessageModal from "../components/ViewTextMessageModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { getSmsList, deleteSms, rescheduleSms,resendSms } from "../textmsgApi";
import { toast } from "react-toastify";

const ActionBtn = ({ label, onClick, variant = "default" }) => (
  <button onClick={onClick} className={`px-3 py-1 text-xs border rounded transition whitespace-nowrap ${variant === 'danger' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
    {label}
  </button>
);

export default function TextMessagePage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);





  const fetchMessages = async () => {
    try {
      setLoading(true);
      const associationId = Number(localStorage.getItem("associationId"));
      const res = await getSmsList(associationId);
      
      const formatted = (res.data || []).map((item) => ({
        ...item,
        displayMessage: item.message || item.body || "No Content",
        displayDate: item.date ? new Date(item.date).toLocaleString() : "Not Set",
      }));
      setMessages(formatted);
    } catch (err) {
  console.error("Fetch Error:", err);
  toast.error("Failed to load messages");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

 const handleResend = async (id) => {
  if (!window.confirm("Resend this message?")) return;
  try {
    await resendSms(id);
    toast.success("SMS resent successfully");
    fetchMessages();
  } catch (err) {
    console.error("Resend failed:", err);
    toast.error("Resend failed");
  }
};

  const toggleAll = () => setSelected(selected.length === messages.length ? [] : messages.map(m => m.id));

  return (
  <div>

    {/* Create button */}
    <div className="flex justify-end mb-4">
      <button
        onClick={() => setShowCreate(true)}
        className="px-4 py-2 text-sm text-white rounded transition hover:opacity-90"
        style={{ backgroundColor: "#122b61" }}
      >
        + Create Text Message
      </button>
    </div>

    {/* Table */}
    <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full table-auto border-collapse">

        {/* Header */}
        <thead style={{ backgroundColor: "#a9c3f7" }}>
          <tr>
            <th className="border-r border-gray-300 p-4 text-center w-10">
              <input
                type="checkbox"
                checked={selected.length === messages.length && messages.length > 0}
                onChange={toggleAll}
                className="w-4 h-4 cursor-pointer"
              />
            </th>

            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Message</th>
            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Recipient</th>
            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Phone Number</th>
            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Date</th>
            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Status</th>
            <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left">Actions</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={7} className="p-10 text-center text-gray-400">
                Loading messages...
              </td>
            </tr>
          ) : messages.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-10 text-center text-gray-400 italic">
                No text messages found.
              </td>
            </tr>
          ) : (
            messages.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">

                {/* Checkbox */}
                <td className="border-r border-gray-200 p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => {
                      setSelected(prev =>
                        prev.includes(item.id)
                          ? prev.filter(x => x !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>

                {/* Message */}
                <td
                  className="border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer max-w-xs"
                  style={{ color: "var(--color-primary)" }}
                  onClick={() => setViewItem(item)}
                >
                  {(item.displayMessage || "").substring(0, 50)}
                </td>

                {/* Recipient */}
                <td className="border-r border-gray-200 p-4 text-sm text-gray-700">
                  {item.recipient || "ALL"}
                </td>

                {/* Phone */}
                <td className="border-r border-gray-200 p-4 text-sm text-gray-700">
                  {item.phoneNumbers?.join(", ") || "—"}
                </td>

                {/* Date */}
                <td className="border-r border-gray-200 p-4 text-sm text-gray-700">
                  {item.displayDate}
                </td>

                {/* Status */}
                <td className="border-r border-gray-200 p-4">
                  <StatusBadge status={item.status} />
                </td>

                {/* Actions */}
                <td className="p-4">
                  <div className="flex items-center gap-2">

                    <ActionBtn
                      label="Edit"
                      onClick={() => setEditItem(item)}
                    />

                    <ActionBtn
                      label="Delete"
                      variant="danger"
                      onClick={() => setDeleteItem(item)}
                    />

                    {/* SENT → Resend */}
                    {item.status?.toUpperCase() === "SENT" && (
                      <ActionBtn
                        label="Resend"
                        onClick={() => handleResend(item.id)}
                      />
                    )}

                    {/* SCHEDULED → Reschedule */}
                    {item.status?.toUpperCase() === "SCHEDULED" && (
                      <ActionBtn
                        label="Reschedule"
                        onClick={() => setEditItem(item)}
                      />
                    )}

                  </div>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Modals */}
    {showCreate && (
      <TextMessageFormModal
        mode="create"
        onClose={() => setShowCreate(false)}
        onSave={() => {
          setShowCreate(false);
          fetchMessages();
        }}
      />
    )}

    {editItem && (
      <TextMessageFormModal
        mode="edit"
        textMessage={editItem}
        onClose={() => setEditItem(null)}
        onSave={() => {
          setEditItem(null);
          fetchMessages();
        }}
      />
    )}

    {viewItem && (
      <ViewTextMessageModal
        message={viewItem}
        onClose={() => setViewItem(null)}
      />
    )}

    {deleteItem && (
      <DeleteConfirmModal
        title="Delete Text Message"
        message="Are you sure you want to delete this message?"
        onClose={() => setDeleteItem(null)}
        onConfirm={async () => {
          try {
            await deleteSms(deleteItem.id);
            toast.success("SMS deleted successfully");
            fetchMessages();
          } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Delete failed");
          } finally {
            setDeleteItem(null);
          }
        }}
      />
    )}

  </div>
);
}