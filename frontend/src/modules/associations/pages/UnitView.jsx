

import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MoreVertical, Plus, Pencil, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getUnitById } from "../unitApi";
import { toast } from "react-toastify";

export default function UnitView() {
  const { associationId, unitId } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setLoading(true);
        const res = await getUnitById(unitId);
        setUnit(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load unit details");
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [unitId]);

  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);
    window.addEventListener("click", closeMenu);

    return () => window.removeEventListener("click", closeMenu);
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-500">Loading unit details...</div>
    );
  }

  if (!unit) {
    return (
      <div className="p-6 text-gray-500">Unit not found</div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      {/* Back Button */}
      <button
        onClick={() =>
          navigate(`/dashboard/associations/${associationId}`, {
            state: { activeTab: "Units" },
          })
        }
        className="flex items-center text-blue-900 hover:text-gray-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        <span>Back to {unit.associationName}</span>
      </button>

      <h1 className="text-3xl font-bold mb-8">Unit {unit.unitNumber}</h1>

      {/* Unit Information */}
      <Card className="mb-8 overflow-hidden">
        <Card.Content className="p-0">
          <div className="p-6 flex justify-between items-start">
            <h2 className="text-lg font-semibold">Unit Information</h2>
            <Button 
              variant="outline"
              onClick={() =>
                navigate(`/dashboard/associations/${associationId}/units/edit/${unitId}`)
              }
              
            >
              Edit Unit
            </Button>
          </div>

          <div className="px-6 pb-8 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Number</label>
              <p className="mt-1 text-gray-900 font-medium">{unit.unitNumber}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Occupancy Status</label>
              <div className="mt-1">
                <span className="px-3 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  {unit.occupancyStatus}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Street Address</label>
              <p className="mt-1 text-gray-900">{unit.street}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</label>
              <p className="mt-1 text-gray-900">{unit.city}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">State</label>
              <p className="mt-1 text-gray-900">{unit.state}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ZIP Code</label>
              <p className="mt-1 text-gray-900">{unit.zipCode}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</label>
              <p className="mt-1 text-blue-600 font-bold">${unit.balance}</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Owners Table */}
      <Card className="p-0 overflow-visible">
        <div className="p-6 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-semibold">Owners</h2>
            <p className="text-sm text-gray-500">{unit.unitOwners?.length || 0} owner(s) assigned to this unit</p>
          </div>
          <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
           onClick={() =>
          navigate(`/dashboard/associations/${associationId}/units/${unitId}/owners/add`)
            }
            >
       Add Owner
        </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center border">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center border">Email</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center border">Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center border">Board Member</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center border">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {unit.unitOwners?.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-center">{owner.firstName} {owner.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 border text-center">{owner.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 border text-center">{owner.phone}</td>
                  <td className="px-6 py-4 border text-center">
                    <span className="px-3 py-1 border rounded text-xs font-medium bg-white text-gray-600">
                      {owner.isBoardMember ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center relative border">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(owner.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>

                    {openMenu === owner.id && (
                      <div
                        
                        className="absolute right-0 bottom-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            navigate(`/dashboard/associations/accounts/${owner.id}`)
                          }
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          <Eye size={16} className="text-gray-500" />
                          View
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/dashboard/associations/accounts/${owner.id}/edit`)
                          }
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          <Pencil size={16} className="text-gray-500" />
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!unit.unitOwners?.length && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500 ">
                    No owners assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}