import { useState } from "react";
import { useNavigate } from "react-router-dom";
/*import AssociationUnitTable from "../components/AssociationUnitTable";*/

export default function AssociationUnitList() {
  const navigate = useNavigate();

  const [units] = useState([
    {
      id: 1,
      unitNumber: "201",
      association: "Sunset Village",
      address: "456 Sunset Blvd, Los Angeles, CA 90028",
      occupancy: "Owner Occupied",
      owner: "Emily Martinez",
      balance: "$0.00",
    },
    {
      id: 2,
      unitNumber: "202",
      association: "Sunset Village",
      address: "456 Sunset Blvd, Los Angeles, CA 90028",
      occupancy: "Rented",
      owner: "David Chen",
      balance: "$250.00",
    },
  ]);

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Association Units</h1>

        <button
          onClick={() => navigate("/dashboard/associations/units/create")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Unit
        </button>
      </div>

      <div className="flex gap-4 mb-4">

        <input
          type="text"
          placeholder="Search by unit number, address, or association..."
          className="border p-2 w-full rounded"
        />

        <select className="border p-2 rounded w-60">
          <option>All Associations</option>
        </select>

      </div>

      <AssociationUnitTable units={units} />

    </div>
  );
}