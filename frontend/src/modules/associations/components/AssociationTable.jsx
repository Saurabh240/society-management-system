
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAssociation } from "../associationApi";
import { toast } from "react-toastify";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";

export default function AssociationTable({ data = [], onRefresh }) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuStyle, setMenuStyle] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

 
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
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener("scroll", closeMenu, true);
    return () => window.removeEventListener("scroll", closeMenu, true);
  }, []);

  const handleDeleteExecute = async () => {
    try {
      await deleteAssociation(confirmDeleteId);
      toast.success("Deleted successfully");
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
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

     
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse min-w-175">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 rounded-tl-xl">Association Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800">Units</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 rounded-tr-xl">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="border-r border-gray-200 p-4 text-sm text-center font-medium">
                  <button onClick={() => navigate(`/dashboard/associations/${item.id}`)} className="text-blue-900 hover:underline">
                    {item.name}
                  </button>
                </td>
                <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{item.totalUnits}</td>
                <td className="border-r border-gray-200 p-4 text-sm text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {item.status}
                  </span>
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={(e) => handleToggleMenu(e, item.id)}
                    className="p-1.5 hover:bg-gray-200 rounded-md"
                  >
                    <MoreVertical size={18} className="text-gray-500" />
                  </button>

                  {activeMenu === item.id && (
                    <>
                      <div className="fixed inset-0 z-9998" onClick={() => setActiveMenu(null)} />
                      <div 
                        style={menuStyle} 
                        className="w-36 bg-white border border-gray-200 rounded-md shadow-2xl py-1 animate-in fade-in zoom-in duration-75"
                      >
                        <button onClick={() => navigate(`/dashboard/associations/${item.id}`)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-blue-50 gap-2">
                          <Eye size={14} className="text-blue-500" /> View
                        </button>
                        <button onClick={() => navigate(`/dashboard/associations/edit/${item.id}`)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 gap-2">
                          <Edit size={14} className="text-amber-500" /> Edit
                        </button>
                        <div className="border-t my-1" />
                        <button onClick={() => setConfirmDeleteId(item.id)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600 gap-2">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}