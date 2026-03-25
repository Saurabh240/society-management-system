import { useState } from "react";
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import SelectRecipientsModal from "./SelectRecipientsModal";
import { TEMPLATE_NAMES } from "../data";

const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white transition";
const labelCls = "block mb-1.5 text-sm font-medium text-gray-700";

export default function RescheduleEmailModal({ email, onClose }) {
  const [showRecipients, setShowRecipients] = useState(false);
  const [recipients, setRecipients]         = useState([]);
  const [template, setTemplate]             = useState("");
  const [subject, setSubject]               = useState(email?.subject || "");
  const [message, setMessage]               = useState(email?.message || "");
  const [scheduledDate, setScheduledDate]   = useState(email?.scheduledDate || "");
  const [scheduledTime, setScheduledTime]   = useState(email?.scheduledTime || "");

  const removeRecipient = (id) => setRecipients((prev) => prev.filter((r) => r.id !== id));
  const addRecipients   = (selected) => {
    setRecipients((prev) => {
      const ids = new Set(prev.map((r) => r.id));
      return [...prev, ...selected.filter((r) => !ids.has(r.id))];
    });
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/40" />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "90vh" }}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Reschedule Email</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            <div>
              <label className={labelCls}>From</label>
              <input type="text" defaultValue="admin@example.com" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>To <span className="text-red-500">*</span></label>
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {recipients.map((r) => (
                    <span key={r.id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {r.name}
                      <button onClick={() => removeRecipient(r.id)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
              <button onClick={() => setShowRecipients(true)} className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition">
                + Add Recipients
              </button>
            </div>

            <div>
              <label className={labelCls}>Use Template</label>
              <select value={template} onChange={(e) => setTemplate(e.target.value)} className={inputCls}>
                <option value="">-- Select a template (optional) --</option>
                {TEMPLATE_NAMES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Subject <span className="text-red-500">*</span></label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter email subject" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter email message" rows={6} className={`${inputCls} resize-y`} />
            </div>

            <div>
              <label className={labelCls}>Scheduled Date</label>
              <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Scheduled Time</label>
              <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className={inputCls} />
            </div>

          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={onClose} className="px-4 py-2 text-sm text-white rounded transition hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>Reschedule Email</button>
          </div>

        </div>
      </div>
      {showRecipients && <SelectRecipientsModal onClose={() => setShowRecipients(false)} onAdd={addRecipients} />}
    </>,
    document.body
  );
}