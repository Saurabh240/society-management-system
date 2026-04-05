// components/communication/ViewMailingModal.jsx
import { useState } from "react";
import { X, Download } from "lucide-react";
import ReactDOM from "react-dom";
import api from "@/lib/api";

export default function ViewMailingModal({ mailing, onClose }) {
  const [loadingOwner, setLoadingOwner] = useState(null);
  const [loadingAll,   setLoadingAll]   = useState(false);

  // Preview PDF in a new tab
  const previewPdf = (ownerId) => {
    window.open(
      `/api/v1/communications/mailings/${mailing.id}/pdf/${ownerId}?download=false`,
      "_blank"
    );
  };

  // Download single PDF
  const downloadPdf = async (ownerId) => {
    setLoadingOwner(ownerId);
    try {
      const res = await api.get(
        `/v1/communications/mailings/${mailing.id}/pdf/${ownerId}?download=true`,
        { responseType: "blob" }
      );
      const url  = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `${mailing.recipients.find(r => r.ownerId === ownerId)?.name ?? ownerId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoadingOwner(null);
    }
  };

  // Download all as ZIP
  const downloadAll = async () => {
    setLoadingAll(true);
    try {
      const res = await api.get(
        `/v1/communications/mailings/${mailing.id}/pdf/all`,
        { responseType: "blob" }
      );
      const url  = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `mailing_${mailing.id}_all.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoadingAll(false);
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/40" />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col"
             style={{ maxHeight: "90vh" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">View Mailing</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* From Address */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">From Address:</p>
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm text-gray-700">
                <p className="font-medium">Acme Property Management</p>
                <p>123 Main Street, Suite 100, Los Angeles, CA 90012</p>
              </div>
            </div>

            {/* To Address */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">To Address (Recipients):</p>
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {mailing.associationName}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {mailing.recipients?.length ?? 0} recipient(s)
                </p>
                <div className="space-y-2">
                  {mailing.recipients?.map((r) => (
                    <div key={r.ownerId}
                         className="border border-gray-200 rounded px-3 py-2 text-sm">
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <p className="text-gray-500 text-xs">{r.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Subject:</p>
              <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900">
                {mailing.title}
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Content:</p>
              <div className="border border-gray-200 rounded-lg p-3 min-h-[120px]
                              text-sm text-gray-700 bg-gray-50 whitespace-pre-wrap">
                {mailing.content}
              </div>
            </div>

            {/* PDFs */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">PDFs:</p>
              <div className="space-y-2">
                {mailing.recipients?.map((r) => (
                  <div key={r.ownerId}
                       className="flex items-center justify-between border border-gray-200
                                  rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => previewPdf(r.ownerId)}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded
                                   text-gray-700 hover:bg-gray-50 transition"
                      >
                        Preview PDF
                      </button>
                      <button
                        onClick={() => downloadPdf(r.ownerId)}
                        disabled={loadingOwner === r.ownerId}
                        className="p-1.5 border border-gray-300 rounded text-gray-700
                                   hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Download All */}
              {mailing.recipients?.length > 0 && (
                <button
                  onClick={downloadAll}
                  disabled={loadingAll}
                  className="mt-3 px-4 py-2 text-sm text-white rounded transition
                             hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {loadingAll
                    ? "Generating..."
                    : `Download All PDFs (${mailing.recipients.length})`}
                </button>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200">
            <button onClick={onClose}
                    className="px-4 py-2 text-sm border border-gray-300 rounded
                               text-gray-700 hover:bg-gray-50 transition">
              Close
            </button>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}