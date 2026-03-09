import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBoardMembersByAssociation } from "../associationApi";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import { MoreVertical, Eye, Pencil } from "lucide-react";

export default function AssociationBoard({ associationId }) {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

console.log("AssociationBoard ID:", associationId);
   
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

  return (
    <Card className="p-0 border-none shadow-none bg-transparent">
      <Card.Content className="p-0">
        <div className="relative overflow-visible">
          <table className="w-full table-auto border-collapse bg-white border border-gray-200">
            
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border p-3 text-sm font-semibold text-center">Name</th>
                <th className="border p-3 text-sm font-semibold text-center">Unit</th>
                <th className="border p-3 text-sm font-semibold text-center">Email</th>
                <th className="border p-3 text-sm font-semibold text-center">Phone</th>
                <th className="border p-3 text-sm font-semibold text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">
                    Loading board members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">
                    No board members found
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="border p-3 text-center font-medium">
                      {member.firstName} {member.lastName}
                    </td>

                    <td className="border p-3 text-center">
                      {member.unitNumber || "-"}
                    </td>

                    <td className="border p-3 text-center text-sm">
                      {member.email}
                    </td>

                    <td className="border p-3 text-center text-sm">
                      {member.phone}
                    </td>

                    <td className="border p-3 text-center relative">
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === member.id ? null : member.id
                          )
                        }
                        className="p-1 hover:bg-gray-200 rounded-md"
                      >
                        <MoreVertical size={18} className="text-gray-500" />
                      </button>

                      {activeMenu === member.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveMenu(null)}
                          />

                          <div className="absolute right-2 top-10 w-36 bg-white border border-gray-200 rounded-md shadow-xl z-40 py-1">
                            <button
                              onClick={() =>
                                navigate(`/dashboard/associations/accounts/${member.id}`)
                              }
                              className="flex items-center w-full px-4 py-2 text-sm hover:bg-blue-50 gap-2"
                            >
                              <Eye size={14} className="text-blue-500" />
                              View
                            </button>

                            <button
                              onClick={() =>
                                navigate(`/dashboard/associations/accounts/${member.id}/edit`)
                              }
                              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 gap-2"
                            >
                              <Pencil size={14} className="text-amber-500" />
                              Edit
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
  );
}