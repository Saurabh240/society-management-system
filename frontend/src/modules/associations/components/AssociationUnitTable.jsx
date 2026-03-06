

import React from "react";


const DUMMY_UNITS = [
  {
    id: 101,
    unitNumber: "A-101",
    association: "Sunset Village",
    address: "456 Sunset Blvd, Apt 101",
    occupancy: "Owner Occupied",
    owner: "John Doe",
    balance: "$0.00",
  },
  {
    id: 102,
    unitNumber: "A-102",
    association: "Sunset Village",
    address: "456 Sunset Blvd, Apt 102",
    occupancy: "Rented",
    owner: "Jane Smith",
    balance: "$150.00",
  },
  {
    id: 205,
    unitNumber: "B-205",
    association: "Greenwood Apartments",
    address: "789 Pine St, Unit 205",
    occupancy: "Vacant",
    owner: "Alice Johnson",
    balance: "-$50.00",
  },
  {
    id: 301,
    unitNumber: "C-301",
    association: "Oak Ridge Community",
    address: "123 Oak Ln, Suite 301",
    occupancy: "Owner Occupied",
    owner: null, // Testing the fallback "—"
    balance: "$1,200.00",
  },
];

export default function AssociationUnitTable({ units = [] }) {
  // Use dummy data if the passed units array is empty
  const displayUnits = units.length > 0 ? units : DUMMY_UNITS;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse bg-white text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="border p-3 font-semibold text-gray-700">Unit Number</th>
            <th className="border p-3 font-semibold text-gray-700">Association</th>
            <th className="border p-3 font-semibold text-gray-700">Address</th>
            <th className="border p-3 font-semibold text-gray-700">Occupancy</th>
            <th className="border p-3 font-semibold text-gray-700">Owner</th>
            <th className="border p-3 font-semibold text-gray-700 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {displayUnits.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
              <td className="border p-3 font-medium text-blue-600">{u.unitNumber}</td>
              <td className="border p-3 text-gray-600">{u.association}</td>
              <td className="border p-3 text-gray-600">{u.address}</td>
              <td className="border p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  u.occupancy === "Vacant" 
                    ? "bg-red-100 text-red-700" 
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {u.occupancy}
                </span>
              </td>
              <td className="border p-3 text-gray-900">{u.owner || "—"}</td>
              <td className="border p-3 text-right font-mono">
                <span className={u.balance.startsWith('-') ? "text-red-600" : "text-gray-900"}>
                  {u.balance}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}