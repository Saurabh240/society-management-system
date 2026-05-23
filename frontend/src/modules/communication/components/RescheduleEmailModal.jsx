

import { useState } from "react";
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import { rescheduleEmail } from "../emailApi";
import { toast } from "react-toastify";

const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white transition";
const labelCls = "block mb-1.5 text-sm font-medium text-gray-700";

export default function RescheduleEmailModal({ email, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const localDate = email?.date ? new Date(email.date) : null;

  const [scheduledDate, setScheduledDate] = useState(
    localDate ? localDate.toLocaleDateString("en-CA") : ""
  );

  const [scheduledTime, setScheduledTime] = useState(
    localDate
      ? localDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      : ""
  );

  const handleResubmit = async () => {
    if (loading) return;

    if (!scheduledDate || !scheduledTime) {
      toast.error("Please select date and time");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        scheduledAt: new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
      };

      await rescheduleEmail(email.id, payload);

      toast.success("Email rescheduled successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to reschedule email");
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9999 bg-black/40" />
      <div className="fixed inset-0 z-10000 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Reschedule Email</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
          </div>

          <div className="px-6 py-5 space-y-4">

            <div>
              <label className={labelCls}>Scheduled Date <span className="text-red-500">*</span></label>
              <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Scheduled Time <span className="text-red-500">*</span></label>
              <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className={inputCls} />
            </div>

          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button
              onClick={handleResubmit}
              disabled={loading}
              className="px-4 py-2 text-sm text-white rounded transition hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {loading ? "Saving..." : "Reschedule Email"}
            </button>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}
