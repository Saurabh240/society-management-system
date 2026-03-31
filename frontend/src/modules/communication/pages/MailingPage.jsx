


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button             from "@/components/ui/Button";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ViewMailingModal   from "../components/ViewMailingModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { getMailings, getMailingById, deleteMailing, deleteMailingsBulk } from "../mailingApi";

// --- Sub-components ---
const StatusBadge = ({ status }) => {
  return (
    <div className="inline-block border border-gray-300 rounded-md px-4 py-1.5 text-sm text-gray-700 font-medium bg-white">
      {status || "Delivered"}
    </div>
  );
};

const ActionBtn = ({ label, onClick, color }) => (
  <button
    onClick={onClick}
    className="text-sm font-semibold hover:underline"
    style={{ color: color || "var(--color-primary)" }}
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
  const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null, isBulk: false });
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
  // Delete
const confirmDelete = async () => {
    try {
      if (deleteConfig.isBulk) {
        await deleteMailingsBulk(selectedIds);
        toast.success(`${selectedIds.length} mailings deleted`);
        setSelectedIds([]);
      } else {
        await deleteMailing(deleteConfig.id);
        toast.success("Mailing deleted successfully");
      }
      fetchMailings();
    } catch {
      toast.error("Operation failed");
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
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-3 mb-4 shadow-sm gap-3">
        <span className="text-[#4b5563] text-base sm:text-lg font-medium">
          {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
        </span>
        <button
          onClick={() => setDeleteConfig({ show: true, id: null, isBulk: true })}
          className="w-full sm:w-auto px-6 py-2 bg-[#b91c1c] text-white rounded-xl font-semibold hover:bg-red-800 transition-colors whitespace-nowrap"
        >
          Delete Selected
        </button>
      </div>
    )}

  
    <div className="w-full border border-gray-300 rounded-2xl bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
   
        <table className="w-full table-auto border-collapse min-w-800px">
          <thead>
            <tr className="bg-[#b4c7f0] text-[#1e266e]">
              <th className="border-r border-white/40 p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={mailings.length > 0 && selectedIds.length === mailings.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-400 cursor-pointer"
                />
              </th>
              <th className="border-r border-white/40 p-4 text-xs font-black uppercase tracking-wider text-left">TITLE</th>
              <th className="border-r border-white/40 p-4 text-xs font-black uppercase tracking-wider text-left">RECIPIENT</th>
              <th className="border-r border-white/40 p-4 text-xs font-black uppercase tracking-wider text-left">DATE</th>
              <th className="border-r border-white/40 p-4 text-xs font-black uppercase tracking-wider text-center">STATUS</th>
              <th className="p-4 text-xs font-black uppercase tracking-wider text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mailings.length > 0 ? (
              mailings.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border-r border-gray-200 p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(m.id)}
                      onChange={() => toggleSelect(m.id)}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td className="border-r border-gray-200 p-4">
                    <span 
                      className="text-[#1e266e] font-bold text-sm underline cursor-pointer decoration-2 underline-offset-2 whitespace-nowrap"
                      onClick={() => handleViewMailing(m.id)} 
                    >
                      {isDetailLoading && viewingMailing?.id === m.id ? "Loading..." : m.title}
                    </span>
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-[#4b5563] font-medium">
                   
                    {getFriendlyLabel(m.recipientLabel)}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-[#4b5563] font-medium whitespace-nowrap">
                    {formatDateTime(m.createdAt || m.date)}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-center">
                     <StatusBadge status={m.status || "DELIVERED"} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/${tenantId}/communication/mailings/edit/${m.id}`)}
                        className="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfig({ show: true, id: m.id, isBulk: false })}
                        className="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-[#1e266e] font-bold text-xl">No mailings found</p>
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

    {deleteConfig.show && (
      <DeleteConfirmModal 
        title={deleteConfig.isBulk ? "Delete Mailings" : "Delete Email"}
        message={deleteConfig.isBulk 
          ? `Are you sure you want to delete ${selectedIds.length} mailings?` 
          : "Are you sure you want to delete this email?"
        }
        onClose={() => setDeleteConfig({ show: false, id: null, isBulk: false })}
        onConfirm={confirmDelete}
      />
    )}
  </div>
);
}


