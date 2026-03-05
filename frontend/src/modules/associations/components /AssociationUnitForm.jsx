
import { useState, useEffect } from "react";

export default function AssociationUnitForm({ onSubmit, initialData = {} }) {

  const [form, setForm] = useState({
    unitNumber: "",
    address: "",
    owner: "",
  });

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        unitNumber: initialData.unitNumber || "",
        address: initialData.address || "",
        owner: initialData.owner || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

      <div>
        <label className="block mb-1 text-sm font-medium">
          Unit Number
        </label>
        <input
          name="unitNumber"
          placeholder="Enter unit number"
          value={form.unitNumber}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">
          Address
        </label>
        <input
          name="address"
          placeholder="Enter address"
          value={form.address}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">
          Owner
        </label>
        <input
          name="owner"
          placeholder="Owner name"
          value={form.owner}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Unit
      </button>

    </form>
  );
}