import { X, Download } from "lucide-react";
import ReactDOM from "react-dom";
import StatusBadge from "./StatusBadge";

export default function ViewMailingModal({ mailing, onClose }) {
  const recipients = mailing.recipients || [];

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9999 bg-black/40" />
      <div className="fixed inset-0 z-10000 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col" style={{ maxHeight: "90vh" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">View Mailing</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* Meta */}
            <div className="space-y-2 text-sm">
              {[
                ["Title:",         mailing.title],
                ["Template Used:", mailing.templateUsed || "—"],
                ["Category:",      mailing.category     || "—"],
                ["Date:",          mailing.date],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-4">
                  <span className="text-gray-500 w-32 shrink-0">{label}</span>
                  <span className="text-gray-900">{val}</span>
                </div>
              ))}
              <div className="flex items-center gap-4">
                <span className="text-gray-500 w-32 shrink-0">Status:</span>
                <StatusBadge status={mailing.status} />
              </div>
            </div>

            {/* From Address */}
            <div>
              <p className="text-sm text-gray-500 mb-1">From Address:</p>
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white">
                <p className="font-medium text-gray-900">Acme Property Management</p>
                <p className="text-gray-600">123 Main Street, Suite 100, Los Angeles, CA, 90012</p>
              </div>
            </div>

            {/* To Address */}
            <div>
              <p className="text-sm text-gray-500 mb-1">To Address (Recipients):</p>
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white">
                <p className="font-medium text-gray-900 mb-1">{mailing.associationName || "Sunset Village"}</p>
                <p className="text-xs text-gray-500 mb-2">{recipients.length} recipient(s)</p>
                <div className="space-y-2">
                  {recipients.map((r) => (
                    <div key={r.id} className="border border-gray-200 rounded px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Subject:</p>
              <div className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white">
                {mailing.subject || mailing.title}
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Content:</p>
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white min-h-100px">
                {mailing.content || "(No content)"}
              </div>
            </div>

            {/* PDFs */}
            {recipients.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">PDFs:</p>
                <div className="space-y-2">
                  {recipients.map((r) => (
                    <div key={r.id} className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700">
                          Preview PDF
                        </button>
                        <button className="p-1.5 bg-gray-900 text-white rounded hover:bg-black transition">
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-3 px-4 py-2 text-sm text-white rounded transition hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>
                  Download All PDFs ({recipients.length})
                </button>
              </div>
            )}

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