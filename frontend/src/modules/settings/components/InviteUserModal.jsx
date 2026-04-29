import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { inviteUser } from "@/modules/settings/api/settingsApi";
import { toast } from "react-toastify";

const ROLE_OPTIONS = [
  { label: "Admin", value: "Admin" },
  { label: "Manager", value: "Manager" },
  { label: "Viewer", value: "Viewer" },
];

const InviteUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      await inviteUser(form);

      toast.success("User invited successfully");

      onSuccess?.(); // refresh list
      onClose();

      setForm({ name: "", email: "", role: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to invite user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-6">Invite User</h2>

        {/* Name */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Name</p>
          <Input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Email</p>
          <Input
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Role */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-1">Role</p>
          <Select
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={(val) => handleChange("role", val)}
          />
          {errors.role && (
            <p className="text-xs text-red-500 mt-1">{errors.role}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Inviting..." : "Invite"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InviteUserModal;