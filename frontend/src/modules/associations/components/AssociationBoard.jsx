import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import { MoreVertical, Eye, Pencil } from "lucide-react";

export default function AssociationBoard({ data = [] }) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <Card className="p-0 border-none shadow-none bg-transparent">
      <Card.Content className="p-0">
        <div className="relative overflow-visible">
          <table className="w-full table-auto border-collapse bg-white">
            
            {/* HEADER */}
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                  Name
                </th>
                <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                  Unit
                </th>
                <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                  Email
                </th>
                <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                  Phone
                </th>
                <th className="border p-3 text-sm font-semibold text-gray-700 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">
                    No board members found
                  </td>
                </tr>
              ) : (
                data.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="border p-3 font-medium text-gray-900 text-center">
                      {member.firstName} {member.lastName}
                    </td>

                    <td className="border p-3 text-gray-700 text-center">
                      {member.unitNumber || "-"}
                    </td>

                    <td className="border p-3 text-gray-700 text-center text-sm">
                      {member.email}
                    </td>

                    <td className="border p-3 text-gray-700 text-center text-sm">
                      {member.phone}
                    </td>

                    {/* ACTIONS */}
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