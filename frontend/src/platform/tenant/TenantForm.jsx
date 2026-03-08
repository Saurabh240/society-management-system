

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTenant } from "../tenant/tenantApi";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import ErrorMessage from "../../shared/components/ErrorMessage";

export default function TenantForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await createTenant({
        name: formData.name.trim(),
        subdomain: formData.subdomain.trim(),
        status: formData.status,
      });

      navigate("/dashboard/tenants", { replace: true });

    } catch (err) {
      setError(err?.message || "Failed to create tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <Card>
        <Card.Header>
          <Card.Title>Create Tenant</Card.Title>
          <Card.Description>
            Add a new tenant to the platform
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-5">

            <Input
              label="Tenant Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <Input
              label="Subdomain"
              value={formData.subdomain}
              onChange={(e) =>
                setFormData({ ...formData, subdomain: e.target.value })
              }
              required
            />

          <Select
  label="Status"
  name="status"
  value={formData.status}
  onChange={(e) =>
    setFormData({ ...formData, status: e.target.value })
  }
  required
  options={[
    { label: "ACTIVE", value: "ACTIVE" },
    { label: "INACTIVE", value: "INACTIVE" },
  ]}
/>

            <ErrorMessage message={error} />

            <div className="flex gap-3 pt-4">

              <Button
                type="submit"
                loading={loading}
              >
                Save Tenant
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/tenants")}
                disabled={loading}
              >
                Cancel
              </Button>

            </div>

          </form>
        </Card.Content>
      </Card>
    </div>
  );
}