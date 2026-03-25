import { X, Download } from "lucide-react";
import ReactDOM from "react-dom";
import Button      from "@/components/ui/Button";
import StatusBadge from "./StatusBadge";

export default function ViewMailingModal({ mailing, onClose }) {
  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/40" />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "90vh" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">View Mailing</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* Meta info */}
            <div className="space-y-2 text-sm">
              <div className="flex gap-4">
                <span className="text-gray-500 w-32">Title:</span>
                <span className="font-medium text-gray-900">{mailing.title}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500 w-32">Template Used:</span>
                <span className="text-gray-700">{mailing.templateUsed || "—"}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500 w-32">Category:</span>
                <span className="text-gray-700">{mailing.category || "—"}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500 w-32">Date:</span>
                <span className="text-gray-700">{mailing.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 w-32">Status:</span>
                <StatusBadge status={mailing.status} />
              </div>
            </div>

            {/* From Address */}
            <div>
              <p className="text-sm text-gray-500 mb-1">From Address:</p>
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white">
                <p className="font-medium">Acme Property Management</p>
                <p className="text-gray-600">123 Main Street, Suite 100, Los Angeles, CA 90012</p>
              </div>
            </div>

            {/* To Address */}
            <div>
              <p className="text-sm text-gray-500 mb-1">To Address (Recipients):</p>
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white">
                <p className="font-medium text-gray-900">{mailing.associationName || "Sunset Village"}</p>
                <p className="text-xs text-gray-500 mb-2">1 recipient(s)</p>
                <div className="border border-gray-200 rounded px-3 py-2 text-sm">
                  <p className="font-medium text-gray-900">Emily Martinez</p>
                  <p className="text-xs text-gray-500">201 undefined</p>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Subject:</p>
              <div className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white">
                {mailing.subject || "Notice of HOA Violation"}
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Content:</p>
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white min-h-[120px]">
                {mailing.content || "Dear Homeowner,\n\nWe have identified a violation..."}
              </div>
            </div>

            {/* PDFs */}
            <div>
              <p className="text-sm text-gray-500 mb-2">PDFs:</p>
              <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Emily Martinez</p>
                  <p className="text-xs text-gray-500">201 undefined</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Preview PDF</Button>
                  <button className="p-2 bg-gray-900 text-white rounded hover:bg-black transition">
                    <Download size={14} />
                  </button>
                </div>
              </div>
              <Button variant="primary" size="sm" className="mt-3">
                Download All PDFs (1)
              </Button>
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