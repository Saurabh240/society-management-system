export default function AssociationUnitTable({ units = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="border p-2">Unit Number</th>
            <th className="border p-2">Association</th>
            <th className="border p-2">Address</th>
            <th className="border p-2">Occupancy</th>
            <th className="border p-2">Owner</th>
            <th className="border p-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {units.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-4 text-gray-500">
                No units found.
              </td>
            </tr>
          ) : (
            units.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="border p-2">{u.unitNumber}</td>
                <td className="border p-2">{u.association}</td>
                <td className="border p-2">{u.address}</td>
                <td className="border p-2">{u.occupancy}</td>
                <td className="border p-2">{u.owner || "—"}</td>
                <td className="border p-2">{u.balance}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}