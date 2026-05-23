import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import httpClient from "@/api/httpClient";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const ROLE_OPTIONS = [
  { value: "TENANT_ADMIN", label: "Tenant Admin" },
  { value: "MANAGER",      label: "Manager"      },
  { value: "VIEWER",       label: "Viewer"       },
];

const STATUS_BADGE = {
  ACTIVE:   "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100  text-gray-500",
  PENDING:  "bg-yellow-100 text-yellow-700",
};

export default function UserManagementPage() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm]             = useState({ name: "", email: "", role: "TENANT_ADMIN" });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await httpClient.get("/users");
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim())  errors.name  = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    if (!form.role)         errors.role  = "Role is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      await httpClient.post("/users/invite", form);
      toast.success("User invited successfully");
      setShowInvite(false);
      setForm({ name: "", email: "", role: "TENANT_ADMIN" });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to invite user";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await httpClient.put(`/users/${user.id}/status`, { status: newStatus });
      toast.success(`User ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
      fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await httpClient.delete(`/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
        <Button variant="primary" size="sm" onClick={() => setShowInvite(true)}>
          + Invite User
        </Button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Invite New User</h3>
          <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
              error={formErrors.name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              required
              error={formErrors.email}
            />
            <Select
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              options={ROLE_OPTIONS}
              required
              error={formErrors.role}
            />
            <div className="md:col-span-3 flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Inviting..." : "Send Invite"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Email</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Role</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-500">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border-r border-gray-300 p-4 text-sm font-semibold text-gray-900">{user.name}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{user.email}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{user.role}</td>
                  <td className="border-r border-gray-300 p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[user.status] || "bg-gray-100 text-gray-500"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                      >
                        {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
