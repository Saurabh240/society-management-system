import { useEffect, useState } from "react";
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "@/modules/settings/api/settingsApi";
import InviteUserModal from "./InviteUserModal";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

// Role display labels
const ROLE_LABELS = {
  TENANT_ADMIN: "Admin",
  MANAGER:      "Manager",
  VIEWER:       "Viewer",
};

const ROLE_OPTIONS = [
  { value: "TENANT_ADMIN", label: "Admin"   },
  { value: "MANAGER",      label: "Manager" },
  { value: "VIEWER",       label: "Viewer"  },
];

const UsersTab = () => {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track which row is currently being actioned to show inline loading
  const [actioningId, setActioningId] = useState(null);

  // Get current user ID from JWT (stored in localStorage as userId)
  const currentUserId = Number(localStorage.getItem("userId") || 0);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      // UserController now wraps in ApiResponse — payload at res.data.data
      setUsers(res.data.data || []);
    } catch {
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Role change ───────────────────────────────────────────────────────────

  const handleRoleChange = async (userId, newRole) => {
    setActioningId(userId);
    try {
      await updateUserRole(userId, newRole);
      toast.success("Role updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update role");
    } finally {
      setActioningId(null);
    }
  };

  // ── Status toggle (Activate / Deactivate) ─────────────────────────────────

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setActioningId(user.id);
    try {
      await updateUserStatus(user.id, newStatus);
      toast.success(`User ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setActioningId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setActioningId(userId);
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete user");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          + Invite User
        </Button>
      </div>

      {/* Table */}
      <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Email</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Role</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-500">No users found.</td></tr>
            ) : (
              users.map((user) => {
                const isSelf    = user.id === currentUserId;
                const isActioning = actioningId === user.id;

                return (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${isActioning ? "opacity-60" : ""}`}>

                    {/* Name */}
                    <td className="border-r border-gray-200 p-4 text-sm font-semibold text-gray-900">
                      {user.name}
                      {isSelf && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">(you)</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="border-r border-gray-200 p-4 text-sm text-gray-700">
                      {user.email}
                    </td>

                    {/* Role — inline dropdown for non-self users */}
                    <td className="border-r border-gray-200 p-4 text-sm text-gray-700">
                      {isSelf ? (
                        <span className="text-sm text-gray-700">
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={isActioning}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="border-r border-gray-200 p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                        user.status === "ACTIVE"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}>
                        {user.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      {isSelf ? (
                        <span className="text-xs text-gray-400 italic">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* Activate / Deactivate */}
                          <button
                            onClick={() => handleStatusToggle(user)}
                            disabled={isActioning}
                            className={`px-2.5 py-1 text-xs font-medium rounded border transition disabled:opacity-50 ${
                              user.status === "ACTIVE"
                                ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                                : "border-green-300 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={isActioning}
                            className="px-2.5 py-1 text-xs font-medium border border-red-200 text-red-600 rounded hover:bg-red-50 transition disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      <InviteUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UsersTab;