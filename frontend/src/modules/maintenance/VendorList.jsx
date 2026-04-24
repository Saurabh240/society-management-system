import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Loader2, MoreVertical, Eye } from "lucide-react";
import { toast } from "react-toastify";

// UI & API
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
/*import { getVendors, deleteVendor } from "@/modules/api/maintenanceApi";*/

export default function MaintenancePage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  // Selection & Modal States
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // id or 'multiple'

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await getVendors();
      setVendors(res.data?.data || res.data || []);
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // --- Checkbox Logic ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(vendors.map((v) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // --- Delete Logic ---
  const handleDeleteExecute = async () => {
    setDeleting(true);
    try {
      if (confirmDeleteId === "multiple") {
        await Promise.all(selectedIds.map((id) => deleteVendor(id)));
        toast.success(`${selectedIds.length} vendors deleted`);
      } else {
        await deleteVendor(confirmDeleteId);
        toast.success("Vendor deleted");
      }
      setSelectedIds([]);
      fetchVendors();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
        
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setConfirmDeleteId("multiple")}
            >
              <Trash2 size={18} className="mr-2" /> Delete ({selectedIds.length})
            </Button>
          )}
          <Button onClick={() => navigate("add")} variant="primary">
            <Plus size={18} className="mr-2" /> Add Vendor
          </Button>
        </div>
      </div>

     <Card className="overflow-hidden border border-gray-200  rounded-xl p-0!">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#B4C7F0] border-b border-gray-300">
            
              <th className="px-4 py-4 rounded-tl-xl">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-400 text-blue-900 focus:ring-blue-900"
                  onChange={handleSelectAll}
                  checked={vendors.length > 0 && selectedIds.length === vendors.length}
                />
              </th>
              <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider border-r border-gray-300/50">
                Vendor Name
              </th>
              <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider border-r border-gray-300/50">
                Category
              </th>
              <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider border-r border-gray-300/50">
                Contact
              </th>
              <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider border-r border-gray-300/50">
                Status
              </th>
              <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider text-center rounded-tr-xl">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="p-10 text-center text-gray-400">Loading vendors...</td></tr>
            ) : vendors.length === 0 ? (
              <tr><td colSpan="6" className="p-10 text-center text-gray-400">No vendors found.</td></tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor.id} className={`hover:bg-gray-50 transition ${selectedIds.includes(vendor.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="p-4 border-r border-gray-100">
                    <input 
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                      checked={selectedIds.includes(vendor.id)}
                      onChange={() => handleSelectRow(vendor.id)}
                    />
                  </td>
                  <td className="p-4 font-medium text-gray-900 border-r border-gray-100">
                    {vendor.companyName || `${vendor.firstName} ${vendor.lastName}`}
                  </td>
                  <td className="p-4 border-r border-gray-100">
                    <span className="px-2 py-1 bg-white border border-blue-100 text-blue-700 rounded text-xs font-semibold uppercase">
                      {vendor.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm border-r border-gray-100">
                    <div className="font-medium">{vendor.primaryEmail}</div>
                    <div className="text-gray-400">{vendor.mobilePhone}</div>
                  </td>
                  <td className="p-4 border-r border-gray-100">
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span> Active
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => navigate(`view/${vendor.id}`)} className="text-gray-400 hover:text-blue-900" title="View">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => navigate(`edit/${vendor.id}`)} className="text-gray-400 hover:text-blue-900" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(vendor.id)} className="text-gray-400 hover:text-red-500" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
  

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirmDeleteId === "multiple" 
                ? `Are you sure you want to delete ${selectedIds.length} selected vendors?` 
                : "Are you sure you want to delete this vendor? This action cannot be undone."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)} 
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteExecute} 
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                disabled={deleting}
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}