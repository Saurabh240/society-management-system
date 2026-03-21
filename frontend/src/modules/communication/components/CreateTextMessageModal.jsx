import { useState } from "react";
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import Button from "@/components/ui/Button";
import SelectRecipientsModal from "./SelectRecipientsModal";

const textareaCls = "w-full border rounded-lg px-4 py-2.5 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 resize-y transition-all duration-200";

export default function CreateTextMessageModal({ onClose }) {
  const [showRecipients, setShowRecipients] = useState(false);
  const [recipients, setRecipients]         = useState([]);
  const [message, setMessage]               = useState("");

  const removeRecipient = (id) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const addRecipients = (selected) => {
    setRecipients((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      return [...prev, ...selected.filter((r) => !existingIds.has(r.id))];
    });
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/40" />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "90vh" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create Text Message</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* To */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                To <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {recipients.map((r) => (
                    <span key={r.id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {r.name}
                      <button onClick={() => removeRecipient(r.id)} className="text-gray-400 hover:text-gray-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowRecipients(true)}>
                + Add Recipients
              </Button>
            </div>

            {/* Message */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Message <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter text message"
                rows={8}
                className={textareaCls}
                style={{ borderColor: "var(--color-primary-light)", "--tw-ring-color": "var(--color-primary)" }}
              />
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm">Send Text Message</Button>
          </div>

        </div>
      </div>

      {showRecipients && (
        <SelectRecipientsModal
          onClose={() => setShowRecipients(false)}
          onAdd={addRecipients}
        />
      )}
    </>,
    document.body
  );
}