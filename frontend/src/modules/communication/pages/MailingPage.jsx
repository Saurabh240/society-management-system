


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button             from "@/components/ui/Button";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ViewMailingModal   from "../components/ViewMailingModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { getMailings, getMailingById, deleteMailing, deleteMailingsBulk } from "../mailingApi";
import StatusBadge from "../components/StatusBadge";



const ActionBtn = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 whitespace-nowrap"
  >
    {label}
  </button>
);

export default function MailingPage() {
  const navigate = useNavigate();
  const { tenantId: paramTenantId } = useParams();

  // Use tenantId from URL, default to 0 if missing
  const tenantId = paramTenantId || 0;

  const PAGE_SIZE = 10;

  // State
  const [mailings, setMailings] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  //ui modal state
  const [viewingMailing, setViewingMailing] = useState(null); 
  const [isDetailLoading, setIsDetailLoading] = useState(false);

 const [deleteItem, setDeleteItem] = useState(null); 
const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  // Fetch mailings
  const fetchMailings = async () => {
    setLoading(true);
    try {
     
      const res = await getMailings(tenantId, page, PAGE_SIZE);
      console.log("API Response Data:", res.data.content[0]);
      const data = res.data;
      setMailings(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error("Fetch mailings error:", err);
      setMailings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on load and when page/tenantId changes
  useEffect(() => {
    fetchMailings();
  }, [page, tenantId]);

  // Checkbox selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds(selectedIds.length === mailings.length ? [] : mailings.map((m) => m.id));
  };


  // Function to handle viewing a specific mailing
  const handleViewMailing = async (id) => {
    setIsDetailLoading(true);
    try {
      const res = await getMailingById(id);
      setViewingMailing(res.data); 
    } catch (err) {
      toast.error("Could not load mailing details");
    } finally {
      setIsDetailLoading(false);
    }
  };
  // single Delete
const handleDelete = async (id) => {
  try {
    await deleteMailing(id);
    toast.success("Mailing deleted successfully");

    setSelectedIds((prev) => prev.filter((x) => x !== id));
    fetchMailings();
  } catch (err) {
    toast.error("Failed to delete mailing");
  }
};
// bulk delete
const handleBulkDelete = async () => {
  if (selectedIds.length === 0) return;

  try {
    setLoading(true);

    await deleteMailingsBulk(selectedIds);

    toast.success(`${selectedIds.length} mailings deleted`);

    setSelectedIds([]);
    fetchMailings();
  } catch (err) {
    toast.error("Bulk delete failed");
  } finally {
    setLoading(false);
  }
};



 const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US') + " at " + 
           date.toLocaleTimeString('en-US', { 
             hour: '2-digit', 
             minute: '2-digit', 
             hour12: true 
           });
  };

const getFriendlyLabel = (label) => {
  const labels = {
    'OWNER': 'Association Owners',
    'BOARD_MEMBERS': 'Board Members',
    'ALL_RESIDENTS': 'All Residents',
    'ALL_OWNERS': 'All Owners'
  };
  return labels[label] || label || "Unknown Recipient";
};


return (
  <div>
      {/* Create button */}
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => navigate(`/dashboard/${tenantId}/communication/mailings/create`)}>
          + Create Mailing
        </Button>
      </div>

    {/* Bulk Delete Bar */}
    {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4">

        <span className="text-gray-700  text-sm">
          {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
        </span>
        <button
            disabled={selectedIds.length === 0}
           onClick={() => setBulkDeleteOpen(true)}
          className="px-3 py-1.5 text-sm text-white rounded-lg transition hover:opacity-90 disabled:opacity-50"
           style={{ backgroundColor: "var(--color-danger)" }}
            >
         Delete Selected
            </button>
    
      </div>
    )}

  
    <div className="w-full border border-gray-300 rounded-2xl bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
   
        <table className="w-full table-auto border-collapse min-w-800px">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
           
              <th className="border-r border-white/40 p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={mailings.length > 0 && selectedIds.length === mailings.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-400 cursor-pointer"
                />
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase  text-gray-800  text-left">Title</th>

              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase  text-gray-800 text-left">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase  text-gray-800 text-left">Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left">Actions</th>
         
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mailings.length > 0 ? (
              mailings.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border-r border-gray-300 p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(m.id)}
                      onChange={() => toggleSelect(m.id)}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td className="border-r border-gray-300 p-4">
                    <span 
                      className=" text-blue-900 font-medium text-sm underline cursor-pointer decoration-2 underline-offset-2 whitespace-nowrap"
                      onClick={() => handleViewMailing(m.id)} 
                    >
                      {isDetailLoading && viewingMailing?.id === m.id ? "Loading..." : m.title}
                    </span>
                  </td>
                  <td className="border-r border-gray-300 p-4 text-sm text-[#4b5563] font-medium">
                   
                    {getFriendlyLabel(m.recipientLabel)}
                  </td>
                  <td className="border-r border-gray-300 p-4 text-sm text-[#4b5563]  whitespace-nowrap">
                    {formatDateTime(m.createdAt || m.date)}
                  </td>
                  <td className="border-r border-gray-300 p-4 text-center  ">
                     <StatusBadge status={m.status || "DELIVERED"} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                     
         <div className="flex items-center gap-2">
  <ActionBtn
    label="Edit"
    onClick={() => navigate(`/dashboard/${tenantId}/communication/mailings/edit/${m.id}`)}
  />
  <ActionBtn
    label="Delete"
    onClick={() => setDeleteItem(m)}
  />
</div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-gray-500  ">No mailings found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Modals  */}
    {viewingMailing && (
      <ViewMailingModal 
        mailing={viewingMailing} 
        onClose={() => setViewingMailing(null)} 
      />
    )}

   {deleteItem && (
  <DeleteConfirmModal
    title="Delete Mailing"
    message="Are you sure you want to delete this mailing?"
    onClose={() => setDeleteItem(null)}
    onConfirm={() => {
      handleDelete(deleteItem.id);
      setDeleteItem(null);
    }}
  />
)}
{bulkDeleteOpen && (
  <DeleteConfirmModal
    title="Delete Mailings"
    message={`Are you sure you want to delete ${selectedIds.length} selected mailing(s)? This action cannot be undone.`}
    onClose={() => setBulkDeleteOpen(false)}
    onConfirm={() => {
      handleBulkDelete();
      setBulkDeleteOpen(false);
    }}
  />
)}
  </div>
);
}


