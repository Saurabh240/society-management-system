import { useState, useEffect, useRef } from "react";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import ReactDOM from "react-dom";


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
      <div style={style} className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden py-1">
        <button
          onClick={onView}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 transition hover:bg-blue-50"
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = ""}
        >
          <Eye size={14} className="text-blue-500" /> View
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = ""}
        >
          <Pencil size={14} className="text-amber-500" /> Edit
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

export default function ActionMenu({ onView, onEdit, onDelete }) {
  const btnRef          = useRef(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
      >
        <MoreVertical size={18} className="text-gray-500" />
      </button>

      {open && (
        <DropdownMenu
          anchorRef={btnRef}
          onView={()   => { setOpen(false); onView?.();   }}
          onEdit={()   => { setOpen(false); onEdit?.();   }}
          onDelete={()  => { setOpen(false); onDelete?.(); }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}