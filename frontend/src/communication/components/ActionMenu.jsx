import { useState, useEffect, useRef } from "react";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import ReactDOM from "react-dom";
import ViewEmailModal     from "./ViewEmailModal";
import EditEmailModal     from "./EditEmailModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

function DropdownMenu({ anchorRef, onView, onEdit, onDelete, onClose }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setStyle({ position: "fixed", top: r.bottom + 4, left: r.right - 144, zIndex: 9999 });
    }
  }, [anchorRef]);

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div style={style} className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden">
        <button
          onClick={onView}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 transition hover:bg-blue-50"
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = ""}
        >
          <Eye size={14} /> View
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 transition hover:bg-blue-50"
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = ""}
        >
          <Pencil size={14} /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm transition hover:bg-red-50"
          style={{ color: "var(--color-danger)" }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </>,
    document.body
  );
}

export default function ActionMenu({ email, onDeleted, onUpdated }) {
  const btnRef = useRef(null);
  const [open,       setOpen]       = useState(false);
  const [showView,   setShowView]   = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <td className="px-4 py-3 text-right" style={{ borderLeft: "1px solid #c8c7c7" }}>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg transition hover:bg-gray-100"
      >
        <MoreVertical size={16} className="text-gray-900" />
      </button>

      {open && (
        <DropdownMenu
          anchorRef={btnRef}
          onView={()   => { setOpen(false); setShowView(true);   }}
          onEdit={()   => { setOpen(false); setShowEdit(true);   }}
          onDelete={()  => { setOpen(false); setShowDelete(true); }}
          onClose={() => setOpen(false)}
        />
      )}

      {showView && (
        <ViewEmailModal email={email} onClose={() => setShowView(false)} />
      )}
      {showEdit && (
        <EditEmailModal
          email={email}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => { onUpdated?.(updated); setShowEdit(false); }}
        />
      )}
      {showDelete && (
        <DeleteConfirmModal
          title="Delete Email"
          message="Are you sure you want to delete this email? This action cannot be undone."
          onClose={() => setShowDelete(false)}
          onConfirm={() => onDeleted?.(email.id)}
        />
      )}
    </td>
  );
}