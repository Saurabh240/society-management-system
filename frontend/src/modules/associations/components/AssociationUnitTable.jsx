import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MoreVertical, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { deleteUnit } from "../unitApi";

export default function AssociationUnitTable({ units = [], onRefresh }) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuStyle, setMenuStyle] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleToggleMenu = (e, id) => {
    if (activeMenu === id) {
      setActiveMenu(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 5,
        left: rect.right - 144,
        zIndex: 9999,
      });
      setActiveMenu(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => setActiveMenu(null);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  const handleDeleteExecute = async () => {
    try {
      setDeletingId(confirmDeleteId);
      await deleteUnit(confirmDeleteId);
      toast.success("Unit deleted successfully");
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to delete unit");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <>
      
        {confirmDeleteId && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="font-bold mb-2">Delete Association</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleDeleteExecute} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}


      {/* Main Wrapper */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse min-w-175">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tl-xl">Unit Number</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Association</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Address</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Occupancy</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Owner</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Balance</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {units.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-10 text-center text-gray-500 italic">No units found.</td>
              </tr>
            ) : (
              units.map((u, index) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  {/* Unit Number with Hyperlink */}
                  <td className={`border-r border-gray-200 p-4 text-sm text-center font-semibold ${index === units.length - 1 ? "rounded-bl-xl" : ""}`}>
                    <button 
                      onClick={() => navigate(`/dashboard/associations/units/view/${u.id}`)} 
                      className="text-blue-900 hover:underline hover:text-blue-700 transition-colors"
                    >
                      {u.unitNumber}
                    </button>
                  </td>
                  
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{u.associationName || "—"}</td>
                  <td className="border-r border-gray-200 p-4 text-center text-xs text-gray-600">{u.street}, {u.city}</td>
                  <td className="border-r border-gray-200 p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${u.occupancyStatus === "VACANT" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                      {u.occupancyStatus}
                    </span>
                  </td>
                  <td className="border-r border-gray-200 p-4 text-gray-900 text-center text-sm">
                   {Array.isArray(u.ownerNames) && u.ownerNames.length > 0 ? (
                     u.ownerNames.map((owner, i) => <div key={i}>{owner}</div>)
                      ) : "—"}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-center font-mono text-sm">
                    <span className={(u.balance || 0) < 0 ? "text-red-600 font-bold" : "text-gray-900"}>
                      ${Number(u.balance || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className={`p-4 text-center ${index === units.length - 1 ? "rounded-br-xl" : ""}`}>
                    <button onClick={(e) => handleToggleMenu(e, u.id)} className="p-1.5 hover:bg-gray-200 rounded-md transition-colors">
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>

                    {activeMenu === u.id && (
                      <>
                        <div className="fixed inset-0 z-9998" onClick={() => setActiveMenu(null)} />
                        <div style={menuStyle} className="w-36 bg-white border border-gray-200 rounded-md shadow-2xl py-1 text-left animate-in fade-in zoom-in duration-75">
                          <button onClick={() => navigate(`/dashboard/associations/units/view/${u.id}`)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-blue-50 gap-2 text-gray-700">
                            <Eye size={14} className="text-blue-500" /> View
                          </button>
                          <button onClick={() => navigate(`/dashboard/associations/units/edit/${u.id}`)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 gap-2 text-gray-700">
                            <Edit size={14} className="text-amber-500" /> Edit
                          </button>
                          <div className="border-t my-1" />
                          <button onClick={() => { setConfirmDeleteId(u.id); setActiveMenu(null); }} className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600 gap-2">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}