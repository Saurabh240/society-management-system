import { useState } from "react";
import { createTenant } from "./tenantApi";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

export default function TenantForm() {
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const handleChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tenant name is required";
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = "Subdomain is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain =
        "Only lowercase letters, numbers, and hyphens allowed";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      await createTenant(formData);

      setSuccess("Tenant created successfully 🎉");
      setFormData({ name: "", subdomain: "" });
    } catch (err) {
      setErrors({
        general: err.message || "Failed to create tenant",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg">

        <Card.Header>
          <Card.Title>Create Tenant</Card.Title>
          <Card.Description>
            Add a new tenant to the platform
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-5">

            {errors.general && (
              <p className="text-red-600 text-sm text-center">
                {errors.general}
              </p>
            )}

            {success && (
              <p className="text-green-600 text-sm text-center">
                {success}
              </p>
            )}

            <Input
              label="Tenant Name"
              value={formData.name}
              onChange={handleChange("name")}
              error={errors.name}
              required
            />

            <Input
              label="Subdomain"
              value={formData.subdomain}
              onChange={handleChange("subdomain")}
              error={errors.subdomain}
              helperText="Example: my-society"
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              Create Tenant
            </Button>

          </form>
        </Card.Content>

      </Card>
    </div>
  );
}