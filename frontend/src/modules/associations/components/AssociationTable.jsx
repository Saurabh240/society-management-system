

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAssociation } from "../associationApi";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function AssociationTable({ data = [], onRefresh }) {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteAssociation(id);

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="p-0">
      <Card.Content>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border p-2">Association Name</th>
                <th className="border p-2">Units Count</th>
                <th className="border p-2">Status</th>
                <th className="border p-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    No associations found.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="border p-2 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="border p-2 text-gray-700">{item.unitCount}</td>
                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="border p-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/dashboard/associations/edit/${item.id}`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={deletingId === item.id}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
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