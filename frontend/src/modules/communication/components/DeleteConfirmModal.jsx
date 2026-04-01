import { X } from "lucide-react";
import ReactDOM from "react-dom";
import Button from "@/components/ui/Button";

export default function DeleteConfirmModal({ title, message, onClose, onConfirm }) {
  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9999 bg-black/40" />
      <div className="fixed inset-0 z-10000 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}