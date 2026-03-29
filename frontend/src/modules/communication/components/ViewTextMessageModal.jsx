import { X } from "lucide-react";
import ReactDOM from "react-dom";
import StatusBadge from "./StatusBadge";

export default function ViewTextMessageModal({ message: msg, onClose }) {
  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/40" />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: "90vh" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">View Text Message</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* Meta */}
            <div className="space-y-2 text-sm">
              <div className="flex gap-4">
                <span className="text-gray-500 w-16 shrink-0">To:</span>
                <span className="text-gray-900">{msg.recipient}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500 w-16 shrink-0">Phone:</span>
                <span className="text-gray-900">{msg.phone}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500 w-16 shrink-0">Date:</span>
                <span className="text-gray-900">{msg.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 w-16 shrink-0">Status:</span>
                <StatusBadge status={msg.status} />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Message */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Message:</p>
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-gray-50 min-h-[120px]">
                {msg.message}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition">
              Close
            </button>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}