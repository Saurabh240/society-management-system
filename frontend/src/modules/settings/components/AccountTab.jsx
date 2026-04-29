import { useEffect, useState } from "react";
import { getAccountInfo, updateAccountInfo } from "@/modules/settings/api/settingsApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "react-toastify";

const AccountTab = () => {
  const [account, setAccount]   = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    const tenantId = localStorage.getItem("tenantId");
    getAccountInfo(tenantId)
      .then((data) => { setAccount(data); setFormData(data); })
      .catch(() => {
        const dummy = {
          companyName: "Acme Property Management",
          address:     "123 Main Street, Suite 100",
          city:        "Los Angeles",
          state:       "CA",
          zipCode:     "90012",
          phone:       "(555) 123-4567",
          email:       "contact@acmepm.com",
          ownerName:   "John Doe",
          url:         "acmepm.example.com",
          status:      "Active",
        };
        setAccount(dummy); setFormData(dummy);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCancel = () => { setFormData(account); setIsEditing(false); };

  const handleSave = async () => {
    try {
      setSaving(true);
      const tenantId = localStorage.getItem("tenantId");
      await updateAccountInfo(tenantId, formData);
      setAccount(formData);
      setIsEditing(false);
      toast.success("Account updated successfully");
    } catch {
      toast.error("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-400 text-sm py-4">Loading...</div>;

  // ── View mode rows ────────────────────────────────────────────────────────
  const rows = [
    { label: "Company Name",           value: account.companyName },
    { label: "Company Street Address", value: account.address     },
    { label: "City",                   value: account.city        },
    { label: "State",                  value: account.state       },
    { label: "ZIP Code",               value: account.zipCode     },
    { label: "Company Phone Number",   value: account.phone       },
    { label: "Company Email",          value: account.email       },
    { label: "Account Owner",          value: account.ownerName   },
    { label: "Account URL",            value: account.url         },
    { label: "Account Status",         value: account.status      },
  ];

  return (
    <div>
      {/* ── View Mode ── */}
      {!isEditing ? (
        <>
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </div>

          <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead style={{ backgroundColor: "#a9c3f7" }}>
                <tr>
                  <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left w-1/3">
                    Account Information
                  </th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row) => (
                  <tr key={row.label} className="hover:bg-gray-50 transition-colors">
                    <td className="border-r border-gray-300 p-4 text-sm font-semibold text-gray-700 w-1/3">
                      {row.label}
                    </td>
                    <td className="p-4 text-sm text-gray-900">
                      {row.label === "Account Status" ? (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          row.value === "Active"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}>
                          {row.value}
                        </span>
                      ) : (
                        row.value || "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ── Edit Mode ── */
        <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
          {/* Edit header */}
          <div className="px-6 py-4" style={{ backgroundColor: "#a9c3f7" }}>
            <span className="text-xs font-bold uppercase text-gray-800">Edit Account Information</span>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Company Name"
                name="companyName"
                value={formData.companyName || ""}
                onChange={handleChange}
              />
              <Input
                label="Company Email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Company Street Address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
            />

            <div className="grid grid-cols-3 gap-5">
              <Input
                label="City"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
              />
              <Input
                label="State"
                name="state"
                value={formData.state || ""}
                onChange={handleChange}
              />
              <Input
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode || ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Company Phone Number"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
              <Input
                label="Account Owner"
                name="ownerName"
                value={formData.ownerName || ""}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Account URL"
              name="url"
              value={formData.url || ""}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountTab;