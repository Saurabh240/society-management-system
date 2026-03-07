

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAssociation } from "../associationApi";
import { toast } from "react-toastify";

import Card from "@/components/ui/Card";
import { MoreVertical, Eye, Edit, Trash2, Loader2 } from "lucide-react";

const DUMMY_DATA = [
  { id: 1, name: "Sunset Valley HOA", unitCount: 45, status: "Active" },
  { id: 2, name: "Greenwood Apartments", unitCount: 120, status: "Inactive" },
  { id: 3, name: "Oak Ridge Community", unitCount: 12, status: "Active" },
];

export default function AssociationTable({ data = [], onRefresh }) {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const displayData = data.length > 0 ? data : DUMMY_DATA;

  const handleDeleteExecute = async () => {
    try {
      setDeletingId(confirmDeleteId);

      await deleteAssociation(confirmDeleteId);

      toast.success("Association deleted successfully");

      if (onRefresh) onRefresh();

    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete association");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Delete Association
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this association? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteExecute}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
              >
                {deletingId ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Card className="p-0 border-none shadow-none bg-transparent">
        <Card.Content className="p-0">
          <div className="relative overflow-visible">
            <table className="w-full table-auto border-collapse bg-white">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="border p-3 text-sm font-semibold text-gray-700">
                    Association Name
                  </th>
                  <th className="border p-3 text-sm font-semibold text-gray-700">
                    Units Count
                  </th>
                  <th className="border p-3 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="border p-3 text-sm font-semibold text-gray-700 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {displayData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="border p-3 font-medium text-gray-900">
                      {item.name}
                    </td>

                    <td className="border p-3 text-gray-700">
                      {item.unitCount}
                    </td>

                    <td className="border p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="border p-3 text-right relative">
                      <button
                        onClick={() =>
                          setActiveMenu(activeMenu === item.id ? null : item.id)
                        }
                        className="p-1 hover:bg-gray-200 rounded-md"
                      >
                        <MoreVertical size={18} className="text-gray-500" />
                      </button>

                      {activeMenu === item.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveMenu(null)}
                          />

                          <div className="absolute right-2 top-10 w-36 bg-white border border-gray-200 rounded-md shadow-xl z-40 py-1">
                            
                            <button
                              onClick={() =>
                                navigate(`/dashboard/associations/view/${item.id}`)
                              }
                              className="flex items-center w-full px-4 py-2 text-sm hover:bg-blue-50 gap-2"
                            >
                              <Eye size={14} className="text-blue-500" />
                              View
                            </button>

                            <button
                              onClick={() =>
                                navigate(`/dashboard/associations/edit/${item.id}`)
                              }
                              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 gap-2"
                            >
                              <Edit size={14} className="text-amber-500" />
                              Edit
                            </button>

                            <div className="border-t my-1" />

                            <button
                              onClick={() => {
                                setConfirmDeleteId(item.id);
                                setActiveMenu(null);
                              }}
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
    </>
  );
}
