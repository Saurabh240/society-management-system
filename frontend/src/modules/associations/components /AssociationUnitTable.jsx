import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AssociationUnitTable({ units }) {

  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  return (
    <table className="w-full border">

      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Unit Number</th>
          <th className="p-3 text-left">Association</th>
          <th className="p-3 text-left">Address</th>
          <th className="p-3 text-left">Occupancy</th>
          <th className="p-3 text-left">Owner</th>
          <th className="p-3 text-left">Balance</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {units.map((unit) => (
          <tr key={unit.id} className="border-t">

            <td className="p-3">{unit.unitNumber}</td>

            <td className="p-3">{unit.association}</td>

            <td className="p-3">{unit.address}</td>

            <td className="p-3">
              <span className="bg-gray-200 px-2 py-1 text-sm rounded">
                {unit.occupancy}
              </span>
            </td>

            <td className="p-3">{unit.owner}</td>

            <td className="p-3">{unit.balance}</td>

            <td className="p-3 relative">

              <button
                onClick={() =>
                  setOpenMenu(openMenu === unit.id ? null : unit.id)
                }
              >
                <MoreVertical size={18} />
              </button>

              {openMenu === unit.id && (
                <div className="absolute right-0 mt-2 w-40 bg-white border shadow">

                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    View Details
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/dashboard/associations/units/edit/${unit.id}`)
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Edit
                  </button>

                  <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                    Delete
                  </button>

                </div>
              )}
            </td>

          </tr>
        ))}
      </tbody>

    </table>
  );
}