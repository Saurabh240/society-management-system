


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import { MoreVertical, Eye, Edit, Trash2, Loader2,Plus } from "lucide-react";

import {
  getUnitsByAssociation,
  deleteUnit,
} from "../unitApi";

export default function AssociationUnits({ associationId }) {
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeMenu, setActiveMenu] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchUnits();
  }, [associationId]);

  const fetchUnits = async () => {
    try {
      setLoading(true);

      const res = await getUnitsByAssociation(associationId);

      setUnits(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExecute = async () => {
    try {
      setDeletingId(confirmDeleteId);

      await deleteUnit(confirmDeleteId);

      toast.success("Unit deleted successfully");

      setUnits((prev) =>
        prev.filter((unit) => unit.id !== confirmDeleteId)
      );
    } catch (error) {
      toast.error("Failed to delete unit");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <>
      {/* DELETE MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold mb-2">
              Delete Unit
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this unit?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteExecute}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center gap-2"
              >
                {deletingId && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD UNIT BUTTON */}
      <div className="flex justify-end mb-4 px-2 sm:px-0">
        <button
          onClick={() =>
            navigate(`/dashboard/associations/${associationId}/units/add`)
          }
          className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
           <Plus size={16} strokeWidth={2.5} />
           Add Unit
        </button>
      </div>

      <Card className="p-0 border-none shadow-none bg-transparent">
        <Card.Content className="p-0">
          <div className="relative overflow-visible">
            
            <table className="w-full table-auto border-collapse bg-white">
            
              <thead className="bg-gray-100 text-left">
  <tr>
    <th className="border p-3 text-sm font-semibold text-center">Unit Number</th>
    <th className="border p-3 text-sm font-semibold text-center">Address</th>
    <th className="border p-3 text-sm font-semibold text-center">Occupancy</th>
    <th className="border p-3 text-sm font-semibold text-center">Owner</th>
    <th className="border p-3 text-sm font-semibold text-center">Balance</th>
    <th className="border p-3 text-sm font-semibold text-center">Actions</th>
  </tr>
</thead>

<tbody>
  {loading ? (
    <tr>
      <td colSpan="6" className="text-center py-6 text-gray-500">
        Loading units...
      </td>
    </tr>
  ) : units.length === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-6 text-gray-500">
        No units found
      </td>
    </tr>
  ) : (
    units.map((unit) => (
      <tr key={unit.id} className="hover:bg-gray-50">
        <td className="border p-3 font-medium text-center">{unit.unitNumber}</td>

        <td className="border p-3 text-center text-sm">
          {unit.street}, {unit.city}, {unit.state} {unit.zipCode}
        </td>

      
        <td className="border p-3 text-center">
  <span
    className={`px-2 py-1 text-xs font-medium rounded-full ${
      unit.occupancyStatus === "VACANT"
        ? "bg-red-100 text-red-700"
        : "bg-blue-100 text-blue-700"
    }`}
  >
    {unit.occupancyStatus}
  </span>
</td>

        
             
             <td className="border p-3 text-center text-sm">
               {Array.isArray(unit.unitOwners) && unit.unitOwners.length > 0 ? (
                unit.unitOwners.map((owner, i) => (
                  <div key={i}>{owner}</div>
                    ))
                  ) : (
                    "-"
                     )}
                   </td>
       

        <td className="border p-3 text-center">
          ${unit.balance}
        </td>

      
           <td className="border p-3 text-center relative">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === unit.id
                                ? null
                                : unit.id
                            )
                          }
                          className="p-1 hover:bg-gray-200 rounded-md"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {activeMenu === unit.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveMenu(null)}
                            />

                            <div className="absolute right-2 top-10 w-36 bg-white border border-gray-200 rounded-md shadow-xl z-100 py-1 text-left">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/associations/${associationId}/units/view/${unit.id}`
                                  )
                                }
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 w-full"
                              >
                                <Eye
                                  size={14}
                                  className="text-blue-500"
                                />
                                View
                              </button>

                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/associations/${associationId}/units/edit/${unit.id}`
                                  )
                                }
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 w-full"
                              >
                                <Edit
                                  size={14}
                                  className="text-amber-500"
                                />
                                Edit
                              </button>

                              <div className="border-t my-1" />

                              <button
                                onClick={() => {
                                  setConfirmDeleteId(unit.id);
                                  setActiveMenu(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600 w-full"
                              >
                                <Trash2 size={14} />
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
