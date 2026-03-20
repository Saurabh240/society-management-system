import { useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { MoreVertical } from "lucide-react";
import { useRef } from "react";
import ReactDOM from "react-dom";
import { useEffect } from "react";

const MAILINGS_DATA = [
  { id: 1, title: "Annual Report 2025", recipient: "Sunset Village (2 owners)", date: "2026-01-15", status: "Delivered" },
  { id: 2, title: "Updated CC&Rs",      recipient: "Sunset Village (3 owners)", date: "2025-12-01", status: "Delivered" },
];

const COLUMNS = ["Title", "Recipient", "Date", "Status", ""];

function MailingActionMenu({ item, onDeleted }) {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setStyle({ position: "fixed", top: r.bottom + 4, left: r.right - 144, zIndex: 9999 });
    }
  }, [open]);

  return (
    <td className="px-4 py-3 text-right" style={{ borderLeft: "1px solid #c8c7c7" }}>
      <button ref={btnRef} onClick={() => setOpen((o) => !o)} className="p-1.5 rounded-lg transition hover:bg-gray-100">
        <MoreVertical size={16} className="text-gray-900" />
      </button>
      {open && ReactDOM.createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div style={style} className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden">
            <button className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50"
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = ""}>View</button>
            <button className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50"
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = ""}>Edit</button>
            <button onClick={() => { setOpen(false); setShowDelete(true); }}
              className="w-full px-4 py-2 text-sm text-left hover:bg-red-50"
              style={{ color: "var(--color-danger)" }}>Delete</button>
          </div>
        </>,
        document.body
      )}
      {showDelete && ReactDOM.createPortal(
        <>
          <div className="fixed inset-0 z-[9999] bg-black/40" />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Mailing</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this mailing?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
                <button onClick={() => { onDeleted(item.id); setShowDelete(false); }} className="px-4 py-2 text-sm text-white rounded hover:opacity-90" style={{ backgroundColor: "var(--color-danger)" }}>Delete</button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </td>
  );
}

export default function MailingPage() {
  const [mailings, setMailings] = useState(MAILINGS_DATA);
  const [viewItem, setViewItem]   = useState(null);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button className="text-white text-sm font-medium px-4 py-2 rounded transition hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>
          + Create Mailing
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-gray-900 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead style={{ backgroundColor: "#a9c3f7" }} className="text-xs uppercase tracking-wide">
            <tr>
              {COLUMNS.map((col, i) => (
                <th key={col} className="px-4 py-3 whitespace-nowrap font-semibold" style={{ color: "#050505", borderRight: i < COLUMNS.length - 1 ? "1px solid #c8c7c7" : "none" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mailings.length === 0 ? (
              <tr><td colSpan={COLUMNS.length} className="px-4 py-16 text-center text-sm text-gray-400">No mailings found.</td></tr>
            ) : (
              mailings.map((item, idx) => (
                <tr key={item.id} className="transition"
                  style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#F8F9FC" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#EEF1F9"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#F8F9FC"}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 underline cursor-pointer" style={{ borderRight: "1px solid #c8c7c7", color: "var(--color-primary)" }} onClick={() => setViewItem(item)}>{item.title}</td>
                  <td className="px-4 py-3 text-gray-700" style={{ borderRight: "1px solid #c8c7c7" }}>{item.recipient}</td>
                  <td className="px-4 py-3 text-gray-700" style={{ borderRight: "1px solid #c8c7c7" }}>{item.date}</td>
                  <td className="px-4 py-3" style={{ borderRight: "1px solid #c8c7c7" }}><StatusBadge status={item.status} /></td>
                  <MailingActionMenu item={item} onDeleted={(id) => setMailings((p) => p.filter((m) => m.id !== id))} />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {viewItem && (
        <div className="fixed inset-0 z-[9999] bg-black/40" onClick={() => setViewItem(null)}>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">View Mailing</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-4"><span className="text-gray-500 w-24">Title:</span><span className="font-medium text-gray-900">{viewItem.title}</span></div>
                <div className="flex gap-4"><span className="text-gray-500 w-24">Recipient:</span><span className="text-gray-700">{viewItem.recipient}</span></div>
                <div className="flex gap-4"><span className="text-gray-500 w-24">Date:</span><span className="text-gray-700">{viewItem.date}</span></div>
                <div className="flex gap-4"><span className="text-gray-500 w-24">Status:</span><span className="inline-block px-3 py-1 text-xs border border-gray-300 rounded text-gray-700">{viewItem.status}</span></div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setViewItem(null)} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}