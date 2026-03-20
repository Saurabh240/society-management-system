import { useState } from "react";
import StatusBadge      from "../components/StatusBadge";
import ActionMenu       from "../components/ActionMenu";
import CreateEmailModal from "../components/CreateEmailModal";
import ViewEmailModal   from "../components/ViewEmailModal";
import { EMAILS }       from "../data";

const COLUMNS = ["Subject", "Recipient", "Date", "Status", ""];

export default function EmailPage() {
  const [emails, setEmails]                   = useState(EMAILS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewEmail, setViewEmail]             = useState(null);

  const handleDeleted = (id)      => setEmails((prev) => prev.filter((e) => e.id !== id));
  const handleUpdated = (updated) => setEmails((prev) => prev.map((e) => e.id === updated.id ? updated : e));

  return (
    <div>
      {/* Create button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-white text-sm font-medium px-4 py-2 rounded transition hover:opacity-90"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          + Create Email
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-900 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead style={{ backgroundColor: "#a9c3f7" }} className="text-xs uppercase tracking-wide">
            <tr>
              {COLUMNS.map((col, i) => (
                <th
                  key={col}
                  className="px-4 py-3 whitespace-nowrap font-semibold"
                  style={{
                    color: "#050505",
                    borderRight: i < COLUMNS.length - 1 ? "1px solid #c8c7c7" : "none",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {emails.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-16 text-center text-sm text-gray-400">
                  No emails found.
                </td>
              </tr>
            ) : (
              emails.map((email, idx) => (
                <tr
                  key={email.id}
                  className="transition"
                  style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#F8F9FC" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#EEF1F9"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#F8F9FC"}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 underline cursor-pointer" style={{ borderRight: "1px solid #c8c7c7", color: "var(--color-primary)" }} onClick={() => setViewEmail(email)}>{email.subject}</td>
                  <td className="px-4 py-3 text-gray-700" style={{ borderRight: "1px solid #c8c7c7" }}>{email.recipient}</td>
                  <td className="px-4 py-3 text-gray-700" style={{ borderRight: "1px solid #c8c7c7" }}>{email.date}</td>
                  <td className="px-4 py-3" style={{ borderRight: "1px solid #c8c7c7" }}><StatusBadge status={email.status} /></td>
                  <ActionMenu email={email} onDeleted={handleDeleted} onUpdated={handleUpdated} />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && <CreateEmailModal onClose={() => setShowCreateModal(false)} />}
      {viewEmail && <ViewEmailModal email={viewEmail} onClose={() => setViewEmail(null)} />}
    </div>
  );
}