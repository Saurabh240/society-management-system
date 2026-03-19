
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
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuStyle, setMenuStyle] = useState({});

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

  // Handle Menu Positioning (Fixed to viewport to prevent clipping)
 const handleToggleMenu = (e, id) => {
  e.stopPropagation();

  if (activeMenu === id) {
    setActiveMenu(null);
    return;
  }

  const rect = e.currentTarget.getBoundingClientRect();

  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpwards = spaceBelow < 120; 

  setMenuStyle({
    position: "fixed",
    top: openUpwards
      ? rect.top - 10   
      : rect.bottom + 5,
    left: rect.right - 144,
    zIndex: 9999,
  });

  setActiveMenu(id);
};

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("click", closeMenu);
    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("click", closeMenu);
    };
  }, []);

  if (loading) return <div className="p-6 text-gray-500 italic">Loading unit details...</div>;
  if (!unit) return <div className="p-6 text-gray-500 text-center">Unit not found</div>;
 const owners = unit?.owners || [];
  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard/associations/units")}
        className="flex items-center text-blue-900 hover:text-gray-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Association Units</span>
      </button>

      <h1 className="text-3xl font-bold mb-8">Unit {unit.unitNumber}</h1>

      {/* --- Unit Information Card --- */}
      <Card className="mb-8 overflow-hidden">
        <Card.Content className="p-0">
          <div className="p-6 flex justify-between items-start">
            <h2 className="text-lg font-semibold">Unit Information</h2>
            <Button 
              variant="outline"
              onClick={() => navigate(`/dashboard/associations/units/edit/${id}`)}
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

      {/* Owners Section */}
      <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="p-6 flex justify-between items-center bg-white border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold">Owners</h2>
            <p className="text-sm text-gray-500">{owners.length} owner(s) assigned to this unit </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate(`/dashboard/associations/${unit.associationId}/units/${id}/owners/add`)}
          >
            Add Owner
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead style={{ backgroundColor: "#a9c3f7" }}>
              <tr>
                <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Name</th>
                <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Email</th>
                <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Phone</th>
                <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Board Member</th>
                <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center">Actions</th>
              </tr>
            </thead>

          <tbody className="divide-y divide-gray-200">
  {owners.length === 0 ? (
    <tr>
      <td colSpan="5" className="p-10 text-center text-gray-500 italic">
        No owners assigned.
      </td>
    </tr>
  ) : (
    owners.map((owner) => (
      <tr key={owner.id}>
                      <td className="border-r border-gray-200 p-4 text-sm text-center text-gray-600">
          {owner.firstName} {owner.lastName}</td>
   

                    <td className="border-r border-gray-200 p-4 text-sm text-center text-gray-600">
                      {owner.email || "—"}
                    </td>
                    <td className="border-r border-gray-200 p-4 text-sm text-center text-gray-600">
                      {owner.phone || "—"}
                    </td>
                    <td className="border-r border-gray-200 p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${owner.isBoardMember ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {owner.isBoardMember ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={(e) => handleToggleMenu(e, owner.id)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <MoreVertical size={18} className="text-gray-500" />
                      </button>

                      {activeMenu === owner.id && (
                        <div
                          style={menuStyle}
                          className="w-36 bg-white border border-gray-200 rounded-md shadow-2xl py-1 text-left animate-in fade-in zoom-in duration-75 ring-1 ring-black/5"
                        >
                {/*  owner path */}
               <button
               onClick={() => 
                navigate(`/dashboard/associations/${unit.associationId}/units/${id}/accounts/${owner.id}`)
                  }
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-blue-50 text-gray-700"
                 >
                <Eye size={14} className="text-blue-500" /> View
                </button>

                  <button
                  onClick={() => 
                  navigate(`/dashboard/associations/${unit.associationId}/units/${id}/accounts/${owner.id}/edit`)
                    }
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                  >
                <Pencil size={14} className="text-amber-500" /> Edit
                 </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}