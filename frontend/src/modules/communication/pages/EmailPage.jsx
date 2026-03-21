import Button from "@/components/ui/Button";
import { useState } from "react";
import StatusBadge      from "../components/StatusBadge";
import ActionMenu       from "../components/ActionMenu";
import CreateEmailModal from "../components/CreateEmailModal";
import ViewEmailModal     from "../components/ViewEmailModal";
import EditEmailModal     from "../components/EditEmailModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { EMAILS }       from "../data";

const COLUMNS = ["Subject", "Recipient", "Date", "Status", ""];

export default function EmailPage() {
  const [emails, setEmails]                   = useState(EMAILS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewEmail,   setViewEmail]   = useState(null);
  const [editEmail,   setEditEmail]   = useState(null);
  const [deleteEmail, setDeleteEmail] = useState(null);

  const handleDeleted = (id)      => setEmails((prev) => prev.filter((e) => e.id !== id));
  const handleUpdated = (updated) => setEmails((prev) => prev.map((e) => e.id === updated.id ? updated : e));

  return (
    <div>
      {/* Create button */}
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
          + Create Email
        </Button>
      </div>


      {/* Table */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tl-xl">Subject</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {emails.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-500 italic">No emails found.</td>
              </tr>
            ) : (
              emails.map((email, idx) => (
                <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                  <td
                    className={`border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer text-center ${idx === emails.length - 1 ? "rounded-bl-xl" : ""}`}
                    style={{ color: "var(--color-primary)" }}
                    onClick={() => setViewEmail(email)}
                  >
                    {email.subject}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{email.recipient}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{email.date}</td>
                  <td className="border-r border-gray-200 p-4 text-center"><StatusBadge status={email.status} /></td>
                  <td className={`p-4 text-center ${idx === emails.length - 1 ? "rounded-br-xl" : ""}`}>
                    <ActionMenu
                    onView={()   => setViewEmail(email)}
                    onEdit={()   => setEditEmail(email)}
                    onDelete={()  => setDeleteEmail(email)}
                  />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && <CreateEmailModal onClose={() => setShowCreateModal(false)} />}
      {viewEmail   && <ViewEmailModal email={viewEmail} onClose={() => setViewEmail(null)} />}
      {editEmail   && <EditEmailModal   email={editEmail}  onClose={() => setEditEmail(null)}   onSave={handleUpdated} />}
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