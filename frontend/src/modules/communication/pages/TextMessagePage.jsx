

import { useState, useEffect } from "react";
import StatusBadge from "../components/StatusBadge";
import TextMessageFormModal from "../components/TextMessageFormModal";
import ViewTextMessageModal from "../components/ViewTextMessageModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { getAllSms, deleteSms, resendSms } from "../textmsgApi";
import { toast } from "react-toastify";

// Reusable Action Button Component
const ActionBtn = ({ label, onClick, variant = "default" }) => (
  <button 
    onClick={onClick} 
    className={`px-3 py-1 text-xs border rounded transition-all whitespace-nowrap font-medium
      ${variant === 'danger' 
        ? 'border-red-200 text-red-600 hover:bg-red-50' 
        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
  >
    {label}
  </button>
);

export default function TextMessagePage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  
  // Modal visibility states
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Fetch all SMS records for the current association
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const associationId = Number(localStorage.getItem("associationId"));
      const res = await getAllSms(associationId);
      
      const formatted = (res.data || []).map((item) => ({
        ...item,
        displayMessage: item.message || item.body || "No Content",
        displayDate: item.date ? new Date(item.date).toLocaleString() : "Not Set",
      }));
      setMessages(formatted);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast?.error("Failed to load communication logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle Resending an already sent/failed message
  const handleResend = async (id) => {
    if (!window.confirm("Are you sure you want to resend this message?")) return;
    try {
      await resendSms(id);
      toast?.success("Message queued for resending");
      fetchMessages();
    } catch (err) {
      toast?.error("Resend operation failed");
    }
  };

  const toggleAll = () => {
    setSelected(selected.length === messages.length ? [] : messages.map(m => m.id));
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Communication Logs (SMS)</h2>
          <p className="text-sm text-gray-500">Track and manage outgoing text messages</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)} 
          className="px-4 py-2 text-sm text-white rounded-lg shadow hover:opacity-90 transition-opacity" 
          style={{ backgroundColor: "#122b61" }}
        >
          + New Message
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-50/50">
            <tr>
              <th className="p-4 border-b w-10 text-center">
                <input 
                  type="checkbox" 
                  checked={selected.length === messages.length && messages.length > 0} 
                  onChange={toggleAll} 
                />
              </th>
              <th className="p-4 border-b text-xs font-bold text-gray-600 uppercase tracking-wider">Message</th>
              <th className="p-4 border-b text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Status</th>
              <th className="p-4 border-b text-xs font-bold text-gray-600 uppercase tracking-wider">Recipients</th>
              <th className="p-4 border-b text-xs font-bold text-gray-600 uppercase tracking-wider">Date & Time</th>
              <th className="p-4 border-b text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-400">Loading history...</td></tr>
            ) : messages.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">No message logs found.</td></tr>
            ) : (
              messages.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selected.includes(item.id)} 
                      onChange={() => setSelected(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])} 
                    />
                  </td>
                  <td 
                    className="p-4 text-sm font-medium text-blue-700 cursor-pointer hover:underline" 
                    onClick={() => setViewItem(item)}
                  >
                    {item.displayMessage.length > 50 ? `${item.displayMessage.substring(0, 50)}...` : item.displayMessage}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {item.phoneNumbers?.length > 0 ? item.phoneNumbers.join(", ") : "—"}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {item.displayDate}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      {/*  Reschedule for future Resend for past */}
                      {item.status === "SCHEDULED" ? (
                        <ActionBtn label="Reschedule" onClick={() => setEditItem(item)} />
                      ) : (
                        <ActionBtn label="Resend" onClick={() => handleResend(item.id)} />
                      )}

                      <ActionBtn label="Edit" onClick={() => setEditItem(item)} />
                      
                      <ActionBtn 
                        label="Delete" 
                        variant="danger" 
                        onClick={() => setDeleteItem(item)} 
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals Section */}
      {showCreate && (
        <TextMessageFormModal 
          mode="create" 
          onClose={() => setShowCreate(false)} 
          onSave={fetchMessages} 
        />
      )}
      
      {editItem && (
        <TextMessageFormModal 
          mode="edit" 
          textMessage={editItem} 
          onClose={() => setEditItem(null)} 
          onSave={fetchMessages} 
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
          onClose={() => setDeleteItem(null)} 
          onConfirm={async () => {
            try {
              await deleteSms(deleteItem.id);
              fetchMessages();
              setDeleteItem(null);
              toast?.success("Record deleted");
            } catch (err) {
              toast?.error("Deletion failed");
            }
          }} 
        />
      )}
    </div>
  );
}