import { useEffect, useState } from "react";
import { getRoles } from "@/modules/settings/api/settingsApi";

const RolesTab = () => {
  const [roles, setRoles]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoles()
      .then((data) => setRoles(data || []))
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead style={{ backgroundColor: "#a9c3f7" }}>
          <tr>
            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Role</th>
            <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Permissions</th>
            <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left">Users</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr><td colSpan={3} className="p-10 text-center text-gray-400">Loading...</td></tr>
          ) : roles.length === 0 ? (
            <tr><td colSpan={3} className="p-10 text-center text-gray-500">No roles found.</td></tr>
          ) : (
            roles.map((item) => (
              <tr key={item.role} className="hover:bg-gray-50 transition-colors">
                <td className="border-r border-gray-300 p-4 text-sm font-semibold text-gray-900">
                  {item.role ?? item.name}
                </td>
                <td className="border-r border-gray-300 p-4 text-sm text-gray-700">
                  {item.permissionLabel ?? item.permissions}
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {item.userCount ?? 0}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RolesTab;