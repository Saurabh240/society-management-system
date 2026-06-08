import { useEffect, useState } from "react";
import {
  getUsers,
  updateUserStatus,
  deleteUser,
} from "@/modules/settings/api/settingsApi";
import InviteUserModal from "./InviteUserModal";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

// Human-readable role labels (view-only, matches Figma exactly)
const ROLE_LABELS = {
  TENANT_ADMIN: "Admin",
  MANAGER:      "Manager",
  VIEWER:       "Viewer",
};

const UsersTab = () => {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  // Current user — disable actions on own row
  const currentUserId = Number(localStorage.getItem("userId") || 0);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      // Unwrap ApiResponse — data at res.data.data
      const list = res.data?.data ?? [];
      // Filter out any PLATFORM_ADMIN rows that leaked through (defence in depth)
      setUsers(list.filter((u) => u.role !== "PLATFORM_ADMIN"));
    } catch {
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Activate / Deactivate ────────────────────────────────────────────────

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
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
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
                const isSelf     = user.id === currentUserId;
                const isActioning = actioningId === user.id;
                const isActive   = user.status === "ACTIVE";

                return (
                  <tr key={user.id}
                      className={`hover:bg-gray-50 transition-colors ${isActioning ? "opacity-60" : ""}`}>

                    {/* Name */}
                    <td className="border-r border-gray-200 p-4 text-sm font-semibold text-gray-900">
                      {user.name}
                      {isSelf && <span className="ml-1.5 text-xs text-gray-400 font-normal">(you)</span>}
                    </td>

                    {/* Email */}
                    <td className="border-r border-gray-200 p-4 text-sm text-gray-700">{user.email}</td>

                    {/* Role — READ ONLY (matches Figma) */}
                    <td className="border-r border-gray-200 p-4 text-sm text-gray-700">
                      {ROLE_LABELS[user.role] ?? user.role}
                    </td>

                    {/* Status badge */}
                    <td className="border-r border-gray-200 p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        isActive
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50   border-red-200   text-red-700"
                      }`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions — hidden for own row */}
                    <td className="p-4">
                      {isSelf ? (
                        <span className="text-xs text-gray-400 italic">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusToggle(user)}
                            disabled={isActioning}
                            className={`px-3 py-1 text-xs font-medium rounded border transition disabled:opacity-50 ${
                              isActive
                                ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                                : "border-green-300 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={isActioning}
                            className="px-3 py-1 text-xs font-medium border border-red-200 text-red-600 rounded hover:bg-red-50 transition disabled:opacity-50"
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

      <InviteUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UsersTab;