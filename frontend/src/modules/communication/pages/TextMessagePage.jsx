
import { useState, useEffect } from "react";
import StatusBadge from "../components/StatusBadge";
import TextMessageFormModal from "../components/TextMessageFormModal";
import ViewTextMessageModal from "../components/ViewTextMessageModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { getSmsList, deleteSms ,resendSms ,deleteSmsBulk , getSmsById} from "../textmsgApi";
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
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);


//bulk delete

  const handleBulkDelete = async () => {
  if (selected.length === 0) return;

  try {
    setLoading(true);

    await deleteSmsBulk(selected); 

    toast.success(`${selected.length} messages deleted`);

    setSelected([]);
    fetchMessages();
  } catch (err) {
    console.error("Bulk delete failed:", err);
    toast.error("Bulk delete failed");
  } finally {
    setLoading(false);
  }
};


  
const getRecipientLabel = (item) => {
  if (!item) return "—";

  const recipient = item.recipient;
  const recipientType = item.recipientType || (recipient && typeof recipient === "object" ? recipient.type : undefined);

  if (recipientType === "ALL_OWNERS" || recipient === "ALL_OWNERS") {
    return item.associationName ? `${item.associationName} (All Owners)` : "All Owners";
  }

  if (Array.isArray(item.recipientNames) && item.recipientNames.length > 0) {
    return item.recipientNames.join(", ");
  }

  if (item.recipientName) {
    return item.recipientName;
  }

  if (typeof recipient === "string" && recipient.trim()) {
    return recipient;
  }

  return "—";
};

const fetchMessages = async () => {
  try {
    setLoading(true);
    const res = await getSmsList();
    
    const formatted = (res.data.content || res.data || []).map((item) => {
      const recipientLabel = getRecipientLabel(item);

      return {
        ...item,
        displayMessage: item.message || item.body || "No Content",
        displayPhones: item.phoneNumbers?.length 
          ? [...new Set(item.phoneNumbers)].join(", ") 
          : "—",
        displayRecipient: recipientLabel,
        displayDate: item.date
          ? new Date(item.date).toLocaleString([], { 
              year: 'numeric', 
              month: 'numeric', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          : "Not Set",
      };
    });

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

  try {
    await resendSms(id);
    toast.success("SMS resent successfully");
    fetchMessages();
  } catch (err) {
    console.error("Resend failed:", err);
    toast.error("Resend failed");
  }
};




// edit function

const handleEditClick = async (item) => {
  try {
    setLoading(true);
  
    const res = await getSmsById(item.id);

    setEditItem(res.data); 
  } catch (err) {
    console.error("Failed to fetch SMS details:", err);
    toast.error("Could not load message details");
  } finally {
    setLoading(false);
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


{/*delete */}

{selected.length > 0 && (
  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4">
    <span className="text-sm text-gray-600">
      {selected.length} item{selected.length > 1 ? "s" : ""} selected
    </span>

    <button
      disabled={selected.length === 0}
      onClick={() => setBulkDeleteOpen(true)}
      className="px-3 py-1.5 text-sm text-white rounded-lg transition hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: "var(--color-danger)" }}
    >
      Delete Selected
    </button>
  </div>
)}
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
              <td colSpan={7} className="p-10 text-center text-gray-500 ">
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

                {/* Recipient 
                <td className="border-r border-gray-200 p-4 text-sm text-gray-700">
                  {item.recipient || "ALL"}
                </td>*/}
                <td className="border-r border-gray-200 p-4 text-sm text-gray-700">
                {item.displayRecipient}
                 </td>

                {/* Phone */}
                <td className="border-r border-gray-200 p-4 text-sm text-gray-700">
                  {item.displayPhones}
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

                    {["DRAFT", "SCHEDULED"].includes(item.status?.toUpperCase()) && (
                      <ActionBtn label="Edit" onClick={() => handleEditClick(item)} />
                    )}

                    <ActionBtn
                      label="Delete"
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
                        onClick={() => handleEditClick(item)}
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


{bulkDeleteOpen && (
  <DeleteConfirmModal
    title="Delete Messages"
    message={`Are you sure you want to delete ${selected.length} selected message(s)? This action cannot be undone.`}
    onClose={() => setBulkDeleteOpen(false)}
    onConfirm={() => {
      handleBulkDelete();
      setBulkDeleteOpen(false);
    }}
  />
)}
  </div>
);
}