


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAssociation } from "../associationApi";

import Card from "@/components/ui/Card";
import { MoreVertical, Eye, Edit, Trash2, Loader2 } from "lucide-react";

const DUMMY_DATA = [
  { id: 1, name: "Sunset Valley HOA", unitCount: 45, status: "Active" },
  { id: 2, name: "Greenwood Apartments", unitCount: 120, status: "Inactive" },
  { id: 3, name: "Oak Ridge Community", unitCount: 12, status: "Active" },
];

export default function AssociationTable({ data = [], onRefresh }) {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const displayData = data.length > 0 ? data : DUMMY_DATA;

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    try {
      setDeletingId(id);
      await deleteAssociation(id);
      if (onRefresh) onRefresh();
      setActiveMenu(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (

    <Card className="p-0 border-none shadow-none bg-transparent">
      <Card.Content className="p-0">
   
        <div className="relative overflow-visible">
          <table className="w-full table-auto border-collapse bg-white">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border p-3 text-sm font-semibold text-gray-700">Association Name</th>
                <th className="border p-3 text-sm font-semibold text-gray-700">Units Count</th>
                <th className="border p-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="border p-3 text-sm font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {displayData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border p-3 font-medium text-gray-900">{item.name}</td>
                  <td className="border p-3 text-gray-700">{item.unitCount}</td>
                  <td className="border p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="border p-3 text-right relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                      className="p-1 hover:bg-gray-200 rounded-md transition-colors inline-block"
                    >
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>

                    {activeMenu === item.id && (
                      <>
                        {/* Backdrop to close menu */}
                        <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)} />
                        
                        {/* Dropdown Menu - Positioned absolute to the TD */}
                        <div className="absolute right-2 top-10 w-36 bg-white border border-gray-200 rounded-md shadow-xl z-40 py-1 text-left ring-1 ring-black ring-opacity-5">
                          <button
                            onClick={() => navigate(`/dashboard/associations/view/${item.id}`)}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-blue-50 text-gray-700 gap-2"
                          >
                            <Eye size={14} className="text-blue-500" /> View
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/associations/edit/${item.id}`)}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 gap-2"
                          >
                            <Edit size={14} className="text-amber-500" /> Edit
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600 gap-2"
                          >
                            {deletingId === item.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Delete
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
      </Card.Content>
    </Card>
  );
}