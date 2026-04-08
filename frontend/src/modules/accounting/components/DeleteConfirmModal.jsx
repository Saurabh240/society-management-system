const DeleteConfirmModal = ({ title, message, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-gray-500 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition hover:opacity-90"
            style={{ backgroundColor: "var(--color-danger)" }}
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteConfirmModal;