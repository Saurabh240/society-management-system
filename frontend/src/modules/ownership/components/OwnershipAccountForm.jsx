import { useState } from "react";

const DUMMY_ASSOCIATIONS = [
  { id: "1", name: "Sunset Village" },
  { id: "2", name: "Riverside Community" },
  { id: "3", name: "Green Valley" },
];

const DUMMY_UNITS = {
  "1": [{ id: "201", unitNumber: "201" }, { id: "202", unitNumber: "202" }, { id: "203", unitNumber: "203" }],
  "2": [{ id: "301", unitNumber: "301" }, { id: "302", unitNumber: "302" }, { id: "303", unitNumber: "303" }],
  "3": [{ id: "401", unitNumber: "401" }, { id: "402", unitNumber: "402" }, { id: "403", unitNumber: "403" }, { id: "404", unitNumber: "404" }],
};

const OwnershipAccountForm = ({ initialData = {}, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", associationId: "", unitId: "",
    ...initialData,
  });

  const units = DUMMY_UNITS[formData.associationId] || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value, ...(name === "associationId" ? { unitId: "" } : {}) }));
  };

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First + Last name side by side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name</label>
          <input name="firstName" value={formData.firstName} onChange={handleChange} required className={inputClass} placeholder="First name" />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <input name="lastName" value={formData.lastName} onChange={handleChange} required className={inputClass} placeholder="Last name" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="email@example.com" />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="(555) 000-0000" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Association</label>
          <select name="associationId" value={formData.associationId} onChange={handleChange} required className={inputClass}>
            <option value="">Select Association</option>
            {DUMMY_ASSOCIATIONS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Unit</label>
          <select name="unitId" value={formData.unitId} onChange={handleChange} required disabled={!formData.associationId} className={inputClass}>
            <option value="">Select Unit</option>
            {units.map((u) => <option key={u.id} value={u.id}>{u.unitNumber}</option>)}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={loading} className="w-full sm:w-auto bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition">
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default OwnershipAccountForm;