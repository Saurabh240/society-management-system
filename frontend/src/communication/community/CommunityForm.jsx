import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { createCommunity, updateCommunity } from "./communityApi";

export default function CommunityForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // present only on edit route
  const { state } = useLocation();

  const isEdit = Boolean(id);
  const existing = state?.community || {};

  const [formData, setFormData] = useState({
    name: existing.name || "",
    status: existing.status || "ACTIVE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        // PATCH /community/{id} — body: { name, status }
        await updateCommunity(id, {
          name: formData.name,
          status: formData.status,
        });
      } else {
        // POST /community — body: { name }
        await createCommunity({ name: formData.name });
      }
      navigate("/dashboard/settings/communities", { replace: true });
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? "update" : "create"} community`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">

      <h2 className="text-2xl font-semibold mb-6">
        {isEdit ? "Edit Community" : "Create Community"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Name */}
        <div>
          <label className="block mb-2 font-medium">
            Community Name <span className="text-red-500">*</span>
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

        {/* Status — only shown on edit since POST /community doesn't accept status */}
        {isEdit && (
          <div>
            <label className="block mb-2 font-medium">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? isEdit ? "Saving..." : "Creating..."
              : isEdit ? "Save Changes" : "Create Community"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/settings/communities", { replace: true })
            }
            className="border px-6 py-2 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}