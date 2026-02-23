

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTenant } from "../tenant/tenantApi";

export default function TenantForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTenant(formData);

      // Go back to tenant list
      navigate("..", { replace: true });

    } catch (err) {
      setError(err.message || "Failed to create tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">

   
      <h2 className="text-2xl font-semibold mb-6">
        Create Tenant
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="block mb-2 font-medium">
            Tenant Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

      
        <div>
          <label className="block mb-2 font-medium">
            Subdomain
          </label>
          <input
            type="text"
            name="subdomain"
            value={formData.subdomain}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

   
        <div>
          <label className="block mb-2 font-medium">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

      
        {error && (
          <p className="text-red-600 text-sm">
            {error}
          </p>
        )}

    
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Tenant"}
          </button>
        </div>

      </form>
    </div>
  );
}