import { useState } from "react";
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import SelectRecipientsModal from "./SelectRecipientsModal";
import { TEMPLATES } from "../data";

const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

export default function CreateEmailModal({ onClose }) {
  const [showRecipients, setShowRecipients] = useState(false);
  const [recipients, setRecipients]         = useState([]);
  const [template, setTemplate]             = useState("");
  const [subject, setSubject]               = useState("");
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
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9999] bg-black/40" />

      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "90vh" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create Email</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>

          {/* Form body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* From */}
            <div>
              <label className={labelCls}>From</label>
              <input type="text" defaultValue="admin@example.com" className={inputCls} />
            </div>

            {/* To */}
            <div>
              <label className={labelCls}>To <span className="text-red-500">*</span></label>

              {/* Selected recipient tags */}
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

              <button
                onClick={() => setShowRecipients(true)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
              >
                + Add Recipients
              </button>
            </div>

            {/* Template */}
            <div>
              <label className={labelCls}>Use Template</label>
              <select value={template} onChange={(e) => setTemplate(e.target.value)} className={inputCls}>
                <option value="">-- Select a template (optional) --</option>
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className={labelCls}>Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className={inputCls}
              />
            </div>

            {/* Message */}
            <div>
              <label className={labelCls}>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter email message"
                rows={8}
                className={`${inputCls} resize-y`}
              />
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button className="px-5 py-2 text-sm text-white rounded transition hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>
              Send Email
            </button>
          </div>

        </div>
      </div>

      {/* Recipients modal - opens on top */}
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