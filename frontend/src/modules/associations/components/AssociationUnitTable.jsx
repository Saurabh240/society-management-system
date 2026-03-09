

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import { MoreVertical, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { deleteUnit } from "../unitApi";

export default function AssociationUnitTable({ units = [], onRefresh }) {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteExecute = async () => {
    try {
      setDeletingId(confirmDeleteId);
      await deleteUnit(confirmDeleteId);
      toast.success("Unit deleted successfully");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete unit");
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
                  <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                    Unit Number
                  </th>
                  <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                    Association
                  </th>
                  <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                    Address
                  </th>
                  <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                    Occupancy
                  </th>
                  <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                    Owner
                  </th>
                  <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                    Balance
                  </th>
                  <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {units.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-gray-500">
                      No units found
                    </td>
                  </tr>
                ) : (
                  units.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="border p-3 font-medium text-gray-900 text-center">
                        {u.unitNumber}
                      </td>

                      <td className="border p-3 text-gray-700 text-center">
                        {u.associationName || "N/A"}
                      </td>

                      <td className="border p-3 text-gray-700 text-center text-xs">
                        {u.street}, {u.city}
                      </td>

                      <td className="border p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.occupancyStatus === "VACANT"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.occupancyStatus}
                        </span>
                      </td>

                      {/* Added Owner Column */}
                      <td className="border p-3 text-gray-900 text-center text-sm">
                        {u.unitOwners && u.unitOwners.length > 0
                          ? u.unitOwners.map((o) => `${o.firstName} ${o.lastName}`).join(", ")
                          : "—"}
                      </td>

                      <td className="border p-3 text-center font-mono text-sm">
                        <span className={(u.balance || 0) < 0 ? "text-red-600" : "text-gray-900"}>
                          ${Number(u.balance || 0).toFixed(2)}
                        </span>
                      </td>

                      <td className="border p-3 text-center relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)}
                          className="p-1 hover:bg-gray-200 rounded-md"
                        >
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>

                        {activeMenu === u.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)} />
                            <div className="absolute right-2 top-10 w-36 bg-white border border-gray-200 rounded-md shadow-xl z-40 py-1 text-left">
                              <button
                                onClick={() => navigate(`/dashboard/associations/units/view/${u.id}`)}
                                className="flex items-center w-full px-4 py-2 text-sm hover:bg-blue-50 gap-2"
                              >
                                <Eye size={14} className="text-blue-500" /> View
                              </button>
                              <button
                                onClick={() => navigate(`/dashboard/associations/units/edit/${u.id}`)}
                                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 gap-2"
                              >
                                <Edit size={14} className="text-amber-500" /> Edit
                              </button>
                              <div className="border-t my-1" />
                              <button
                                onClick={() => {
                                  setConfirmDeleteId(u.id);
                                  setActiveMenu(null);
                                }}
                                disabled={deletingId === u.id}
                                className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600 gap-2"
                              >
                                {deletingId === u.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                Delete
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
        </Card.Content>
      </Card>
    </>
  );
}