import { useState } from "react";
import Button from "@/components/ui/Button";
import StatusBadge from "../components/StatusBadge";

import ViewEmailModal from "../components/ViewEmailModal";
import EditEmailModal from "../components/EditEmailModal";
import RescheduleEmailModal from "../components/RescheduleEmailModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

import EmailModal from "../components/EmailModal";
import { EMAILS } from "../data";

const ActionBtn = ({ label, onClick }) => (
  <button onClick={onClick} className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 whitespace-nowrap">
    {label}
  </button>
);

export default function EmailPage() {
  const [emails, setEmails] = useState(EMAILS);
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [resendEmail, setResendEmail] = useState(null);
  const [viewEmail, setViewEmail] = useState(null);
  const [editEmail, setEditEmail] = useState(null);
  const [rescheduleEmail, setRescheduleEmail] = useState(null);
  const [deleteEmail, setDeleteEmail] = useState(null);

  const handleDeleted = (id) => setEmails((prev) => prev.filter((e) => e.id !== id));
  const handleUpdated = (updated) => setEmails((prev) => prev.map((e) => e.id === updated.id ? updated : e));
  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === emails.length ? [] : emails.map((e) => e.id));
  const handleBulkDelete = () => { setEmails((prev) => prev.filter((e) => !selected.includes(e.id))); setSelected([]); };

  return (
    <div>
      {/* Create button */}
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          + Create Email
        </Button>
      </div>

      {/* Bulk delete bar */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4">
          <span className="text-sm text-gray-600">{selected.length} item{selected.length > 1 ? "s" : ""} selected</span>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm text-white rounded-lg transition hover:opacity-90" style={{ backgroundColor: "var(--color-danger)" }}>
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-center rounded-tl-xl w-10">
                <input type="checkbox" checked={selected.length === emails.length && emails.length > 0} onChange={toggleAll} className="w-4 h-4 cursor-pointer" />
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Subject</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {emails.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500 italic">No emails found.</td>
              </tr>
            ) : (
              emails.map((email, idx) => (
                <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`border-r border-gray-200 p-4 text-center ${idx === emails.length - 1 ? "rounded-bl-xl" : ""}`}>
                    <input type="checkbox" checked={selected.includes(email.id)} onChange={() => toggleSelect(email.id)} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer" style={{ color: "var(--color-primary)" }} onClick={() => setViewEmail(email)}>
                    {email.subject}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700">{email.recipient}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700">{email.date}</td>
                  <td className="border-r border-gray-200 p-4"><StatusBadge status={email.status} /></td>
                  <td className={`p-4 ${idx === emails.length - 1 ? "rounded-br-xl" : ""}`}>
                    <div className="flex items-center gap-2">
                      {email.status === "Scheduled"
                        ? <ActionBtn label="Reschedule" onClick={() => setRescheduleEmail(email)} />
                        : <ActionBtn label="Resend" onClick={() => setResendEmail(email)} />
                      }
                      <ActionBtn label="Edit" onClick={() => setEditEmail(email)} />
                      <ActionBtn label="Delete" onClick={() => setDeleteEmail(email)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <EmailModal mode="create" onClose={() => setShowCreate(false)} />
      )}
      {viewEmail && <ViewEmailModal email={viewEmail} onClose={() => setViewEmail(null)} />}
      {editEmail && <EditEmailModal email={editEmail} onClose={() => setEditEmail(null)} onSave={handleUpdated} />}
      {resendEmail && (
        <EmailModal
          mode="resend"
          email={resendEmail}
          onClose={() => setResendEmail(null)}
        />
      )}
      {rescheduleEmail && <RescheduleEmailModal email={rescheduleEmail} onClose={() => setRescheduleEmail(null)} />}
      {deleteEmail && (
        <DeleteConfirmModal
          title="Delete Email"
          message="Are you sure you want to delete this email? This action cannot be undone."
          onClose={() => setDeleteEmail(null)}
          onConfirm={() => { handleDeleted(deleteEmail.id); setDeleteEmail(null); }}
        />
      )}
    </div>
  );
}