import React from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

/** Standard confirm dialog (destructive by default). */
export default function ConfirmDialog({
  title = "Confirm Delete",
  message,
  confirmLabel = "Delete",
  tone = "danger",
  loading = false,
  onClose,
  onConfirm,
}) {
  const danger = tone === "danger";
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-gray-100">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? "bg-red-50" : "bg-amber-50"}`}>
          {danger ? <Trash2 size={26} className="text-red-600" /> : <AlertTriangle size={26} className="text-amber-600" />}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 ${
              danger ? "bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)]" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
