import {useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import StatusBadge from "../components/StatusBadge";

import ViewEmailModal from "../components/ViewEmailModal";
import EditEmailModal from "../components/EditEmailModal";
import RescheduleEmailModal from "../components/RescheduleEmailModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

import EmailModal from "../components/EmailModal";
import {
  getEmails,
  deleteEmail as deleteEmailApi,
  resendEmail as resendEmailApi,
  
} from "../emailApi";

const ActionBtn = ({ label, onClick }) => (
  <button onClick={onClick} className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 whitespace-nowrap">
    {label}
  </button>
);

export default function EmailPage() {

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [viewEmail, setViewEmail] = useState(null);
  const [editEmail, setEditEmail] = useState(null);
 const [rescheduleEmailData, setRescheduleEmailData] = useState(null); 
 const [deleteEmailData, setDeleteEmailData] = useState(null);
 



const tenantId = Number(localStorage.getItem("tenantId"));
 const associationId = Number(localStorage.getItem("associationId"));
 useEffect(() => {
  fetchEmails();
}, []);

const fetchEmails = async () => {
  try {
    setLoading(true);
    const res = await getEmails(tenantId, 0, 10); 
    
    console.log("Raw Data from Server:", res.data.content);

  const formatted = res.data.content.map((item) => ({
  id: item.id,
  subject: item.subject,
  recipient: item.recipientLabel, 
  date: item.date || item.createdAt || item.scheduledAt,
  status: item.status,
  channel: item.channel || item.type, 
  body: item.body,
templateId: item.templateId,
associationId: item.associationId
}));

    setEmails(formatted);
  } catch (error) {
    console.error("Fetch emails failed", error);
  } finally {
    setLoading(false);
  }
};

  

  const handleDelete = async (id) => {
    try {
      await deleteEmailApi(id);
      fetchEmails();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleResend = async (id) => {
    try {
      await resendEmailApi(id);
      fetchEmails();
    } catch (err) {
      console.error("Resend failed", err);
    }
  };

  const handleUpdated = () => {
    fetchEmails();
  };

  

  const handleRescheduled = () => {
    fetchEmails();
  };

  // selection

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelected(
      selected.length === emails.length ? [] : emails.map((e) => e.id)
    );
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map((id) => deleteEmailApi(id)));
      setSelected([]);
      fetchEmails();
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };





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
        

                    <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  Loading...
                </td>
              </tr>
            ) : emails.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  No emails found.
                </td>
              </tr>
            ) : (
              emails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50">
                  <td className="border-r border-gray-200 p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(email.id)}
                      onChange={() => toggleSelect(email.id)}
                    />
                  </td>

                  <td
                    className="border-r border-gray-200 p-4 underline cursor-pointer"
                    onClick={() => setViewEmail(email)}
                  >
                    {email.subject}
                  </td>

                  <td className="border-r border-gray-200 p-4">{email.recipient}</td>
                  <td className="border-r border-gray-200  p-4">{email.date ? new Date(email.date).toLocaleString() : "N/A"}</td>

                  <td className="border-r border-gray-200 p-4">
                    <StatusBadge status={email.status} />
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      {email.status === "SCHEDULED" ? (
                        <ActionBtn
                          label="Reschedule"
                          onClick={() => setRescheduleEmailData(email)}
                        />
                      ) : (
                        <ActionBtn
                          label="Resend"
                          onClick={() => handleResend(email.id)}
                        />
                      )}

                      <ActionBtn
                        label="Edit"
                        onClick={() => setEditEmail(email)}
                      />

                      <ActionBtn
                        label="Delete"
                        onClick={() => setDeleteEmailData(email)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>


                    
        </table>
      </div>

  

      {/* Modals */}

      {showCreate && (
        <EmailModal
          mode="create"
          tenantId={Number(tenantId)}
          associationId={Number(associationId)}
          onClose={() => setShowCreate(false)}
          onSuccess={fetchEmails}
        />
      )}

      {viewEmail && (
        <ViewEmailModal
          email={viewEmail}
          onClose={() => setViewEmail(null)}
        />
      )}

      {editEmail && (
        <EditEmailModal
          email={editEmail}
          onClose={() => setEditEmail(null)}
          onSave={handleUpdated}
        />
      )}

      {rescheduleEmailData && (
        <RescheduleEmailModal
          email={rescheduleEmailData}
          tenantId={tenantId}
    associationId={associationId}
          onClose={() => setRescheduleEmailData(null)}
          onSuccess={handleRescheduled}
        />
      )}

      {deleteEmailData && (
        <DeleteConfirmModal
          title="Delete Email"
          message="Are you sure you want to delete this email?"
          onClose={() => setDeleteEmailData(null)}
          onConfirm={() => {
            handleDelete(deleteEmailData.id);
            setDeleteEmailData(null);
          }}
        />
      )}
    </div>
  );

}
