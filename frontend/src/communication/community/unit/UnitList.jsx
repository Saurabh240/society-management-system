

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUnitsByTenant } from "./unitApi";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export default function UnitList() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const loadUnits = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUnitsByTenant();
      setUnits(data || []);
    } catch (err) {
      setError(err.message || "Failed to load units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  return (
    <div className="p-6">
      <Card className="w-full">

        <Card.Header className="flex justify-between items-center">
          <div>
            <Card.Title>Units</Card.Title>
            <Card.Description>
              Manage all registered units
            </Card.Description>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={loadUnits}
              loading={loading}
            >
              Refresh
            </Button>

            <Button onClick={() => navigate("create")}>
              + Add Unit
            </Button>
          </div>
        </Card.Header>

        <Card.Content>

          {loading && (
            <p className="text-gray-500 text-center py-6">
              Loading units...
            </p>
          )}

          {error && (
            <p className="text-red-600 text-center py-6">
              {error}
            </p>
          )}

          {!loading && !error && units.length === 0 && (
            <p className="text-gray-500 text-center py-6">
              No units found.
            </p>
          )}

          {!loading && !error && units.length > 0 && (
            <div className="mt-4 overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="hidden md:table-header-group bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Unit Number</th>
                    <th className="text-left px-4 py-3">Street</th>
                    <th className="text-left px-4 py-3">City</th>
                    <th className="text-left px-4 py-3">State</th>
                    <th className="text-left px-4 py-3">Zip</th>
                    <th className="text-center px-4 py-3">Status</th>
                    <th className="text-center px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="space-y-4 md:space-y-0">
                  {units.map((unit) => (
                    <tr
                      key={unit.id}
                      className="block md:table-row border md:border-t rounded-lg md:rounded-none p-4 md:p-0 bg-white hover:bg-gray-50 transition"
                    >
                      <td className="block md:table-cell px-4 py-2 font-semibold text-lg md:text-base">
                        {unit.unitNumber}
                      </td>

                      <td className="block md:table-cell px-4 py-2 text-gray-600">
                        {unit.street}
                      </td>

                      <td className="block md:table-cell px-4 py-2 text-gray-600">
                        {unit.city}
                      </td>

                      <td className="block md:table-cell px-4 py-2 text-gray-600">
                        {unit.state}
                      </td>

                      <td className="block md:table-cell px-4 py-2 text-gray-600">
                        {unit.zipCode}
                      </td>

                      <td className="block md:table-cell px-4 py-2 md:text-center">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            unit.occupancyStatus === "OCCUPIED"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {unit.occupancyStatus || "VACANT"}
                        </span>
                      </td>
                       
                         <td className="block md:table-cell px-4 py-3">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                         <Button
                       size="sm"
                     variant="outline"
                     onClick={() =>
                  navigate(`${unit.id}`, {
                  state: { unit },
                         })
              }
                     >
                     Edit
                  </Button>

                          <Button
  size="sm"
  variant="danger"
  className="whitespace-nowrap"
  onClick={() =>
    
    navigate(`delete/${unit.id}`, {
      state: { unit },
    })
  }
>
  Delete
</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </Card.Content>
      </Card>
    </div>
  );
}
