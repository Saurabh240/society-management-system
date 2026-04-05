

import { useState, useEffect } from "react"; 
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import SelectRecipientsModal from "./SelectRecipientsModal";
import { createSms, rescheduleSms, updateSms } from "../textmsgApi"; 
import { toast } from "react-toastify";

const inputCls    = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 transition";
const textareaCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 resize-y transition";
const labelCls    = "block mb-1.5 text-sm font-medium text-gray-700";

export default function TextMessageFormModal({ mode = "create", textMessage = {}, onClose, onSave }) {
  const [showRecipients, setShowRecipients] = useState(false);
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");

useEffect(() => {
  if (mode === "edit" && textMessage) {

    setMessage(textMessage.message || textMessage.body || "");

  
    if (textMessage.recipient) {
      setRecipients([
        {
          id: textMessage.id,        
          name: textMessage.recipient 
        }
      ]);
    } else if (textMessage.phoneNumbers && textMessage.phoneNumbers.length > 0) {
   
      setRecipients(textMessage.phoneNumbers.map(phone => ({ id: phone, name: phone })));
    }

  
    const rawDate = textMessage.date || textMessage.scheduledAt;
    if (rawDate) {
      const dateObj = new Date(rawDate);
  
      setSchedDate(dateObj.toISOString().split('T')[0]);
   
      setSchedTime(dateObj.toTimeString().slice(0, 5));
    }
  }
}, [textMessage, mode]);

  const isScheduled = schedDate && schedTime;
  const sendLabel = isScheduled ? "Schedule Message" : "Send Message";
  const titles = { create: "Create Text Message", edit: "Edit Text Message" };

  const removeRecipient = (id) => setRecipients((prev) => prev.filter((r) => r.id !== id));
  const addRecipients = (selected) => {
    setRecipients((prev) => {
      const ids = new Set(prev.map((r) => r.id));
      return [...prev, ...selected.filter((r) => !ids.has(r.id))];
    });
  };

// function save
  const handleSave = async () => {
  try {
    const associationId = Number(localStorage.getItem("associationId"));
    if (!message.trim()) return toast.error("Message is required");

    let scheduledAt = (schedDate && schedTime) 
      ? new Date(`${schedDate}T${schedTime}`).toISOString() 
      : null;

    if (mode === "edit" && textMessage?.id) {
    
      const updatePayload = {
        body: message,
        subject: "",
        channel: "SMS",
        recipient: {
          type: recipients.length > 0 ? "ALL_OWNERS" : "",
         
          phoneNumbers: recipients.map(r => r.id) 
        },
        scheduledAt: scheduledAt
      };

   
      await updateSms(textMessage.id, updatePayload);
      


      toast.success("SMS updated successfully");
    } else {
    
      const payload = {
        associationId,
        subject: "SMS Notification",
        body: message,
        channel: "SMS",
        recipient: {
          type: "ALL_OWNERS",
        },
        scheduledAt: scheduledAt,
      };
      await createSms(payload);
      toast.success("SMS saved successfully");
    }

    onSave?.();
    onClose();
  } catch (err) {
    console.error("Save Error Response:", err.response?.data); 
    toast.error(err.response?.data?.message || "Failed to save SMS");
  }
};
  const handleSendOrSchedule = async () => {
    try {
      const associationId = Number(localStorage.getItem("associationId"));
      if (!message.trim()) return toast.error("Message is required");
      if ((schedDate && !schedTime) || (!schedDate && schedTime)) return toast.error("Select both date and time");

      let scheduledAt = (schedDate && schedTime) ? new Date(`${schedDate}T${schedTime}`).toISOString() : null;

      if (mode === "edit" && textMessage?.id) {
        await rescheduleSms(textMessage.id, scheduledAt);
        toast.success(scheduledAt ? "SMS rescheduled" : "SMS sent");
      } else {
        const payload = {
          associationId,
          subject: "SMS Notification",
          body: message,
          channel: "SMS",
          recipient: { type: "ALL_OWNERS" },
          scheduledAt,
        };
        await createSms(payload);
        toast.success(scheduledAt ? "SMS scheduled" : "SMS sent");
      }
      onSave?.();
      onClose();
    } catch (err) {
      toast.error("Failed to process SMS");
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9999 bg-black/40" />
      <div className="fixed inset-0 z-10000 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col" style={{ maxHeight: "90vh" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{titles[mode]}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* To */}
            <div>
              <label className={labelCls}>To <span className="text-red-500">*</span></label>
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 border border-gray-300 rounded px-3 py-2 mb-2 bg-white">
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

            {/* Message */}
            <div>
              <label className={labelCls}>Message <span className="text-red-500">*</span></label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter text message" rows={7} className={textareaCls} />
            </div>

            {/* Scheduled Date */}
            <div>
              <label className={labelCls}>Scheduled Date (Optional)</label>
              <input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} className={inputCls} />
            </div>

            {/* Scheduled Time */}
            <div>
              <label className={labelCls}>Scheduled Time (Optional)</label>
              <input type="time" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
              {mode === "edit" ? "Save Changes" : "Save Message"}
            </button>
            {mode !== "edit" && (
              <button onClick={handleSendOrSchedule} className="px-4 py-2 text-sm text-white rounded bg-[#122755] hover:opacity-90">
                {sendLabel}
              </button>
            )}
          </div>
        </div>
      </div>
      {showRecipients && <SelectRecipientsModal onClose={() => setShowRecipients(false)} onAdd={addRecipients} />}
    </>,
    document.body
  );
}