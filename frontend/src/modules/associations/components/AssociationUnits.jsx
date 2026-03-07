
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";

import { MoreVertical, Eye, Edit, Trash2, Loader2 } from "lucide-react";

const DUMMY_UNITS = [
  {
    id: 1,
    unitNumber: "301",
    owner: "Jessica Williams",
    occupancy: "Owner Occupied",
    balance: "$150.00",
  },
  {
    id: 2,
    unitNumber: "302",
    owner: "Robert Taylor",
    occupancy: "Rented",
    balance: "$0.00",
  },
];

export default function AssociationUnits({ associationId }) {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteExecute = async () => {
    try {
      setDeletingId(confirmDeleteId);

      // replace with API later
      await new Promise((r) => setTimeout(r, 800));

      toast.success("Unit deleted successfully");

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
                {deletingId && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>

            </div>

          </div>
        </div>
      )}

     
      <div className="flex justify-end mb-4">
        <button
          onClick={() =>
            navigate(`/dashboard/associations/${associationId}/units/add`)
          }
          className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-800"
        >
          + Add Unit
        </button>
      </div>

      <Card className="p-0 border-none shadow-none bg-transparent">
        <Card.Content className="p-0">

          <div className="relative overflow-visible">

            <table className="w-full border-collapse bg-white">

              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="border p-3 text-sm font-semibold">
                    Unit Number
                  </th>

                  <th className="border p-3 text-sm font-semibold">
                    Owner
                  </th>

                  <th className="border p-3 text-sm font-semibold">
                    Occupancy
                  </th>

                  <th className="border p-3 text-sm font-semibold">
                    Balance
                  </th>

                  <th className="border p-3 text-sm font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {DUMMY_UNITS.map((unit) => (

                  <tr key={unit.id} className="hover:bg-gray-50">

                    <td className="border p-3 font-medium">
                      {unit.unitNumber}
                    </td>

                    <td className="border p-3">
                      {unit.owner}
                    </td>

                    <td className="border p-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {unit.occupancy}
                      </span>
                    </td>

                    <td className="border p-3">
                      {unit.balance}
                    </td>

                    <td className="border p-3 text-right relative">

                      <button
                        onClick={() =>
                          setActiveMenu(activeMenu === unit.id ? null : unit.id)
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

                          <div className="absolute right-2 top-10 w-36 bg-white border rounded-md shadow-xl z-40 py-1">

                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/associations/${associationId}/units/view/${unit.id}`
                                )
                              }
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 w-full"
                            >
                              <Eye size={14} className="text-blue-500" />
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
                              <Edit size={14} className="text-amber-500" />
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

                ))}

              </tbody>

            </table>

          </div>

        </Card.Content>
      </Card>
    </>
  );
}

