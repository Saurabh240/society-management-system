import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MoreVertical, Eye, Pencil, Loader2 } from "lucide-react";
import { getBoardMembersByAssociation } from "../associationApi";

export default function AssociationBoard({ associationId }) {
  const navigate = useNavigate();

  // State Management
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuStyle, setMenuStyle] = useState({});

  useEffect(() => {
    const fetchBoardMembers = async () => {
      try {
        setLoading(true);
        const res = await getBoardMembersByAssociation(associationId);
        setMembers(res.data.data || []);
      } catch (error) {
        toast.error("Failed to load board members");
      } finally {
        setLoading(false);
      }
    };

    if (associationId) {
      fetchBoardMembers();
    }
  }, [associationId]);

  // Handle Menu Positioning 
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

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => setActiveMenu(null);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);
  
  return (
    <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full table-auto border-collapse min-w-600px">
        <thead style={{ backgroundColor: "#a9c3f7" }}>
          <tr>
            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tl-xl">
              Name
            </th>
            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">
              Unit
            </th>
            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">
              Email
            </th>
            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">
              Phone
            </th>
            <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tr-xl">
              Actions
            </th>
          </tr>
        </thead>
          
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan="5" className="p-10 text-center text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin text-blue-900" />
                  <span>Loading board members...</span>
                </div>
              </td>
            </tr>
          ) : members.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-10 text-center text-gray-500 italic">
                No board members found.
              </td>
            </tr>
          ) : (
            members.map((member, index) => (
             
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className={`border-r border-gray-200 p-4 text-sm text-center font-semibold text-blue-900 ${index === members.length - 1 ? "rounded-bl-xl" : ""}`}>
                  {member.firstName} {member.lastName}
                </td>

                <td className="border-r border-gray-200 p-4 text-center text-sm font-medium text-gray-700">
                  {member.unitNumber || "—"}
                </td>

                <td className="border-r border-gray-200 p-4 text-center text-sm text-gray-600">
                  {member.email}
                </td>

                <td className="border-r border-gray-200 p-4 text-center text-sm text-gray-600">
                  {member.phone}
                </td>

                <td className={`p-4 text-center ${index === members.length - 1 ? "rounded-br-xl" : ""}`}>
                  <button
                    onClick={(e) => handleToggleMenu(e, member.id)}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <MoreVertical size={18} className="text-gray-500" />
                  </button>

                  {activeMenu === member.id && (
                    <>
                      <div className="fixed inset-0 z-9998" onClick={() => setActiveMenu(null)} />
                      <div
                        style={menuStyle}
                        className="w-36 bg-white border border-gray-200 rounded-md shadow-2xl py-1 text-left animate-in fade-in zoom-in duration-75"
                      >
<button 
onClick={() => 
  navigate(`/dashboard/associations/${associationId}/units/${member.unitId}/accounts/${member.id}` ) } 
className="flex items-center w-full px-4 py-2 text-sm hover:bg-blue-50 gap-2 text-gray-700" >
   <Eye size={14} className="text-blue-500" />
   View
    </button>
   <button onClick={() => 
   navigate( `/dashboard/associations/${associationId}/units/${member.unitId}/accounts/${member.id}/edit `) }
  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 gap-2 text-gray-700"
>
  <Pencil size={14} className="text-amber-500" /> Edit
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
  );
}