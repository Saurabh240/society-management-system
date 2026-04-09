import { useEffect, useState, useCallback } from "react"; 
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import StatusBadge from "../components/StatusBadge";
import ViewEmailModal from "../components/ViewEmailModal";
import EditEmailModal from "../components/EditEmailModal";
import RescheduleEmailModal from "../components/RescheduleEmailModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import EmailModal from "../components/EmailModal";
import { getAssociations } from "../../associations/associationApi";

import {
  getEmails,
  deleteEmail as deleteEmailApi,
  resendEmail as resendEmailApi,
  BulkDeleteEmails,
} from "../emailApi";

const ActionBtn = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 whitespace-nowrap"
  >
    {label}
  </button>
);

const getFriendlyLabel = (label) => {
  const map = {
    OWNER:         "Association Owners",
    ALL_OWNERS:    "All Owners",
    BOARD_MEMBERS: "Board Members",
    ALL_RESIDENTS: "All Residents",
  };
  return map[label] || label || "—";
};

export default function EmailPage() {
  const [emails, setEmails]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState([]);

  // Association context — fetched from API, not localStorage
  const [associationId, setAssociationId]     = useState(null);
  const [associationName, setAssociationName] = useState("");

  const [showCreate, setShowCreate]                 = useState(false);
  const [viewEmail, setViewEmail]                   = useState(null);
  const [editEmail, setEditEmail]                   = useState(null);
  const [rescheduleEmailData, setRescheduleEmailData] = useState(null);
  const [deleteEmailData, setDeleteEmailData]       = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Fetch the tenant's association on mount to get real associationId + name
  useEffect(() => {
    const fetchAssociation = async () => {
      try {
        const res = await getAssociations();
        // ApiResponse wrapper: res.data.data is the array
        const list = res?.data?.data ?? res?.data ?? [];
        if (list.length > 0) {
          setAssociationId(list[0].id);
          setAssociationName(list[0].name);
        }
      } catch (err) {
        console.error("Failed to fetch associations:", err);
      }
    };
    fetchAssociation();
  }, []);

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEmails(0, 10);

      const formatted = res.data.content.map((item) => ({
        id:            item.id,
        subject:       item.subject,
        recipient:     getFriendlyLabel(item.recipientLabel),
        date:          item.date || item.createdAt || item.scheduledAt,
        status:        item.status,
        channel:       item.channel || item.type,
        body:          item.body,
        templateId:    item.templateId,
        associationId: item.associationId,
      }));

      setEmails(formatted);
    } catch (error) {
      toast.error("Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleDelete = async (id) => {
    try {
      await deleteEmailApi(id);
      toast.success("Email deleted successfully");
      fetchEmails();
    } catch (err) {
      toast.error("Failed to delete email");
    }
  };

  const handleSend = async (id) => {
    try {
      await resendEmailApi(id);
      toast.success("Email sent successfully");
      fetchEmails();
    } catch (err) {
      toast.error("Failed to send email");
    }
  };

  const handleResend = async (id) => {
    try {
      await resendEmailApi(id);
      toast.success("Email resent successfully");
      fetchEmails();
    } catch (err) {
      toast.error("Failed to resend email");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await BulkDeleteEmails(selected);
      toast.success(`${selected.length} emails deleted successfully`);
      setSelected([]);
      setShowBulkDeleteConfirm(false);
      fetchEmails();
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelected(selected.length === emails.length ? [] : emails.map((e) => e.id));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          + Create Email
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4">
          <span className="text-sm text-gray-600">
            {selected.length} item{selected.length > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="px-3 py-1.5 text-sm text-white rounded-lg transition hover:opacity-90"
            style={{ backgroundColor: "var(--color-danger)" }}
          >
            Delete Selected
          </button>
        </div>
      )}

      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-center w-10">
                <input
                  type="checkbox"
                  checked={selected.length === emails.length && emails.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Subject</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="p-10 text-center">Loading...</td></tr>
            ) : emails.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-500">No emails found.</td></tr>
            ) : (
              emails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50 transition-colors">

                  <td className="border-r border-gray-300 p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(email.id)}
                      onChange={() => toggleSelect(email.id)}
                    />
                  </td>

                  <td
                    className="border-r border-gray-300 p-4 underline cursor-pointer text-blue-900 font-medium"
                    onClick={() => setViewEmail(email)}
                  >
                    {email.subject}
                  </td>

                  <td className="border-r border-gray-300 p-4 text-sm">{email.recipient}</td>

                  <td className="border-r border-gray-300 p-4 text-sm">
                    {email.date ? new Date(email.date).toLocaleString() : "N/A"}
                  </td>

                  <td className="border-r border-gray-300 p-4 text-center">
                    <StatusBadge status={email.status} />
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {email.status === "DRAFT" && (
                        <ActionBtn label="Send" onClick={() => handleSend(email.id)} />
                      )}
                      {(email.status === "SENT" || email.status === "DELIVERED") && (
                        <ActionBtn label="Resend" onClick={() => handleResend(email.id)} />
                      )}
                      {email.status === "SCHEDULED" && (
                        <ActionBtn label="Reschedule" onClick={() => setRescheduleEmailData(email)} />
                      )}
                      {(email.status === "DRAFT" || email.status === "SCHEDULED") && (
                        <ActionBtn label="Edit" onClick={() => setEditEmail(email)} />
                      )}
                      <ActionBtn label="Delete" onClick={() => setDeleteEmailData(email)} />
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <EmailModal
          mode="create"
          associationId={associationId}
          associationName={associationName}
          onClose={() => setShowCreate(false)}
          onSuccess={() => { toast.success("Email created successfully"); fetchEmails(); }}
        />
      )}

      {viewEmail && (
        <ViewEmailModal email={viewEmail} onClose={() => setViewEmail(null)} />
      )}

      {editEmail && (
        <EditEmailModal
          email={editEmail}
          associationId={editEmail.associationId || associationId}
          associationName={associationName}
          onClose={() => setEditEmail(null)}
          onSave={() => { toast.success("Email updated successfully"); fetchEmails(); }}
        />
      )}

      {rescheduleEmailData && (
        <RescheduleEmailModal
          email={rescheduleEmailData}
          associationId={associationId}
          onClose={() => setRescheduleEmailData(null)}
          onSuccess={() => { toast.success("Email rescheduled"); fetchEmails(); }}
        />
      )}

      {deleteEmailData && (
        <DeleteConfirmModal
          title="Delete Email"
          message="Are you sure you want to delete this email?"
          onClose={() => setDeleteEmailData(null)}
          onConfirm={() => handleDelete(deleteEmailData.id)}
        />
      )}

      {showBulkDeleteConfirm && (
        <DeleteConfirmModal
          title="Delete Emails"
          message={`Are you sure you want to delete ${selected.length} selected email(s)? This action cannot be undone.`}
          onClose={() => setShowBulkDeleteConfirm(false)}
          onConfirm={handleBulkDelete}
        />
      )}
    </div>
  );
}