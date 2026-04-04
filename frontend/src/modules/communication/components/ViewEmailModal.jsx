import { X } from "lucide-react";
import ReactDOM from "react-dom";
import Button      from "@/components/ui/Button";
import StatusBadge from "./StatusBadge";
import { useEffect, useState } from "react";
import { getEmailById } from "../emailApi";

export default function ViewEmailModal({ email, onClose }) {
  const [data, setData] = useState(email || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email?.id) return;

    const fetchEmail = async () => {
      try {
        setLoading(true);
        const res = await getEmailById(email.id);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch email:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [email?.id]);
  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9999 bg-black/40" />
      <div className="fixed inset-0 z-10000 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "90vh" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">View Email</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-16">From:</span>
                <span className="text-sm text-gray-900">admin@example.com</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-16">To:</span>
                <span className="text-sm text-gray-900">{data.recipientLabel}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-16">Date:</span>
                <span className="text-sm text-gray-900">{data.scheduledAt || data.createdAt}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-16">Status:</span>
                <StatusBadge status={email.status} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-16">Subject:</span>
                <span className="text-sm font-semibold text-gray-900">{email.subject}</span>
              </div>
            </div>

            <hr className="border-gray-200 mb-5" />

            <div>
              <span className="text-sm text-gray-500 block mb-2">Message:</span>
              <div className="border border-gray-200 rounded-lg p-4 min-h-160px bg-gray-50 text-sm text-gray-500">
                {data.body || "(No message content)"}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}