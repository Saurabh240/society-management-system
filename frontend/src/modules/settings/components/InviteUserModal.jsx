import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { inviteUser } from "@/modules/settings/api/settingsApi";
import { toast } from "react-toastify";

// Role values MUST match the backend Role enum exactly
// (TENANT_ADMIN | MANAGER | VIEWER) — NOT the display strings "Admin"/"Manager"/"Viewer"
const ROLE_OPTIONS = [
  { label: "Admin",   value: "TENANT_ADMIN" },
  { label: "Manager", value: "MANAGER"      },
  { label: "Viewer",  value: "VIEWER"       },
];

const InviteUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm]       = useState({ name: "", email: "", role: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name  = "Name is required";
    if (!form.email.trim())  e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.role)          e.role  = "Role is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      // role is sent as "TENANT_ADMIN" | "MANAGER" | "VIEWER" — matches InviteUserRequest.role enum
      await inviteUser({
        name:  form.name.trim(),
        email: form.email.trim(),
        role:  form.role,
      });
      toast.success("User invited successfully. They will receive an email with login instructions.");
      onSuccess?.();
      onClose();
      setForm({ name: "", email: "", role: "" });
      setErrors({});
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to invite user";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <Card className="w-full max-w-md p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Invite User</h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select
              options={ROLE_OPTIONS}
              value={form.role}
              onChange={(val) => handleChange("role", val)}
            />
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
            <p className="text-xs text-gray-400 mt-1">
              The user will receive an email with a temporary password valid for 24 hours.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Send Invite
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InviteUserModal;