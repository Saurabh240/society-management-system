
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MoreVertical, Plus, Pencil, Eye, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getUnitById } from "../unitApi";

export default function AssociationUnitView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (ownerId) => {
    setOpenMenu(openMenu === ownerId ? null : ownerId);
  };

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setLoading(true);
        const res = await getUnitById(id);
        const data = res.data?.data || res.data;
        setUnit(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load unit details");
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [id]);

  // Close dropdown menu on outside click
  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!unit) {
    return <div className="p-10 text-center text-red-500 font-medium">Unit not found</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      {/* Navigation Header */}
      <button
        onClick={() => navigate("/dashboard/associations/units")}
        className="flex items-center text-blue-900 hover:text-blue-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Association Units</span>
      </button>

      <h1 className="text-3xl font-bold mb-8 text-gray-900">Unit {unit.unitNumber}</h1>

      {/* Unit Information Card */}
      <Card className="mb-8 overflow-hidden">
        <Card.Content className="p-0">
          <div className="p-6 flex justify-between items-start">
            <h2 className="text-lg font-semibold">Unit Information</h2>
            <Button 
          variant="outline"
          onClick={() =>
           navigate(`/dashboard/associations/units/edit/${id}`)
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

   
      {/* Owners Table Card */}
<Card className="p-0 overflow-visible border border-gray-100 shadow-sm">
  <div className="p-6 flex justify-between items-center bg-white rounded-t-lg">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Owners</h2>
      <p className="text-sm text-gray-500">
        {unit.unitOwners?.length || 0} owner(s) assigned to this unit
      </p>
    </div>
   <Button
  variant="primary"
  leftIcon={<Plus size={16} />}
  onClick={() =>
    navigate(`/dashboard/associations/${unit.associationId}/units/${id}/owners/add`)
  }
>
  Add Owner
</Button>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-left border-t border-gray-200">
      <thead className="bg-gray-50">
        <tr>
        
          <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border">Name</th>
          <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border">Email</th>
          <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border">Phone</th>
          <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border text-center">Board</th>
          <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right border">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {unit.unitOwners?.map((owner) => (
          <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
           
            <td className="px-6 py-4 text-sm font-medium text-gray-900 border">
              {owner.firstName} {owner.lastName}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 border">
              {owner.email || "N/A"}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 border">
              {owner.phone || "N/A"}
            </td>
            <td className="px-6 py-4 border text-center">
              <span className={`px-3 py-1 border rounded text-xs font-medium ${
                owner.isBoardMember 
                  ? "bg-amber-50 text-amber-700 border-amber-100" 
                  : "bg-gray-50 text-gray-500 border-gray-100"
              }`}>
                {owner.isBoardMember ? "YES" : "NO"}
              </span>
            </td>
            <td className="px-6 py-4 text-right relative border">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(owner.id);
                }}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <MoreVertical size={18} className="text-gray-500" />
              </button>

              {openMenu === owner.id && (
                <div
                  className="absolute right-6 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => navigate(`/dashboard/ownership/accounts/${owner.id}`)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <Eye size={14} /> View Account
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/ownership/accounts/${owner.id}/edit`)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Pencil size={14} /> Edit Owner
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
        {!unit.unitOwners?.length && (
          <tr>
            <td colSpan="5" className="text-center py-12 text-gray-400 italic border">
              No owners assigned to this unit yet.
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