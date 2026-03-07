


import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MoreVertical, Plus, Pencil, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// Mock data
const UNIT_DETAILS = {
  id: 1,
  unitNumber: "301",
  streetAddress: "789 River Road",
  city: "Portland",
  state: "OR",
  zipCode: "97201",
  occupancyStatus: "Owner Occupied",
  balance: "$150.00",
  owners: [
    {
      id: 101,
      name: "Jessica Williams",
      email: "jessica.williams@example.com",
      phone: "(555) 333-4444",
      isBoardMember: false,
    },
  ],
};

export default function UnitView() {
  const { associationId, unitId } = useParams();
  const navigate = useNavigate();
  
  const unit = UNIT_DETAILS; 


const [openMenu, setOpenMenu] = useState(null);

const toggleMenu = (id) => {
  setOpenMenu(openMenu === id ? null : id);
};

useEffect(() => {
  const closeMenu = () => setOpenMenu(null);
  window.addEventListener("click", closeMenu);

  return () => window.removeEventListener("click", closeMenu);
}, []);
  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      
    
        <button
  onClick={() => navigate(`/dashboard/associations/view/${associationId}`, { 
    state: { activeTab: "Units" } 
  })}
  className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors font-medium text-sm group"
>
  <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
  <span>Back to Riverside Community</span>
</button>
    

      <h1 className="text-3xl font-bold mb-8">Unit {unit.unitNumber}</h1>

   
      <Card className="mb-8 overflow-hidden">
        <Card.Content className="p-0">
          <div className="p-6 flex justify-between items-start">
            <h2 className="text-lg font-semibold">Unit Information</h2>
            <Button 
              variant="outline"
              onClick={() => navigate(`/dashboard/associations/${associationId}/units/edit/${unitId}`)}
              className="border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
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
              <p className="mt-1 text-gray-900">{unit.streetAddress}</p>
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
              <p className="mt-1 text-blue-600 font-bold">{unit.balance}</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card className="p-0 overflow-visible">
        <div className="p-6 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-semibold">Owners</h2>
            <p className="text-sm text-gray-500">{unit.owners.length} owner assigned to this unit</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          onClick={() => navigate(`/dashboard/associations/${associationId}/units/${unitId}/owners/add`)}
          >
            <Plus size={16} />
            Add Owner
          </Button>
        </div>

        <div className="relative overflow-visible">
         <table className="w-full text-left border border-gray-900">
            <thead>
             <tr className="bg-gray-100 border-b border-gray-900">
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-900">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-900">Email</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-900">Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-900">Board Member</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {unit.owners.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{owner.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 border border-gray-900">{owner.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 border border-gray-900">{owner.phone}</td>
                  <td className="px-6 py-4 border border-gray-900">
                    <span className="px-3 py-1 border border-gray-900 rounded text-xs font-medium bg-white text-gray-600">
                      {owner.isBoardMember ? "Yes" : "No"}
                    </span>
                  </td>
               
                  <td className="px-6 py-4 text-right relative border border-gray-900">
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
      className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-999"
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
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


