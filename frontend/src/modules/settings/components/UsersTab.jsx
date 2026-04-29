import { useEffect, useState } from "react";
import { getUsers } from "@/modules/settings/api/settingsApi";
import InviteUserModal from "./InviteUserModal";
import Button from "@/components/ui/Button";

const UsersTab = () => {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch {
      setUsers([
        { id: 1, name: "John Doe",    email: "john@example.com", role: "Admin",   status: "Active" },
        { id: 2, name: "Jane Smith",  email: "jane@example.com", role: "Manager", status: "Active" },
        { id: 3, name: "Bob Johnson", email: "bob@example.com",  role: "Viewer",  status: "Active" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          + Invite User
        </Button>
      </div>

      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Email</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Role</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-500">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border-r border-gray-300 p-4 text-sm font-semibold text-gray-900">{user.name}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{user.email}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{user.role}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      user.status === "Active"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <InviteUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UsersTab;