import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAssociation } from "../associationApi";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AssociationTable({ data = [], onRefresh }) {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteAssociation(id);

     
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card shadow="md" padding="none">
      <Card.Header className="px-6 pt-6">

      </Card.Header>

      <Card.Content>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Association Name</th>
                <th className="px-6 py-4">Units Count</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No associations found.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.name}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {item.unitCount}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/associations/edit/${item.id}`)
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