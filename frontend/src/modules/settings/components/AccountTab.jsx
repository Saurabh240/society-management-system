import { useEffect, useState } from "react";
import { getAccountInfo, updateAccountInfo } from "@/modules/settings/api/settingsApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "react-toastify";

const AccountTab = () => {
  const [account,    setAccount]    = useState(null);
  const [formData,   setFormData]   = useState({});
  const [loading,    setLoading]    = useState(true);
  const [isEditing,  setIsEditing]  = useState(false);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    // Uses /tenant/admin/account — returns ApiResponse<TenantResponse>
    getAccountInfo()
      .then((res) => {
        const data = res.data.data; // ApiResponse wrapper
        setAccount(data);
        setFormData(data);
      })
      .catch(() => toast.error("Failed to load account information"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCancel = () => {
    setFormData(account);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Payload must match UpdateTenantRequest field names
      const payload = {
        name:          formData.name,
        streetAddress: formData.streetAddress,
        city:          formData.city,
        state:         formData.state,
        zipCode:       formData.zipCode,
        phone:         formData.phone,
        email:         formData.email,
        accountOwner:  formData.accountOwner,
        accountUrl:    formData.accountUrl,
      };
      const res = await updateAccountInfo(payload);
      const updated = res.data.data;
      setAccount(updated);
      setFormData(updated);
      setIsEditing(false);
      toast.success("Account updated successfully");
    } catch {
      toast.error("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        Account information unavailable.
      </div>
    );
  }

  // ── View mode rows — mapped to TenantResponse field names ─────────────────
  const rows = [
    { label: "Company Name",           value: account.name          },
    { label: "Company Street Address", value: account.streetAddress  },
    { label: "City",                   value: account.city           },
    { label: "State",                  value: account.state          },
    { label: "ZIP Code",               value: account.zipCode        },
    { label: "Company Phone Number",   value: account.phone          },
    { label: "Company Email",          value: account.email          },
    { label: "Account Owner",          value: account.accountOwner   },
    { label: "Account URL",            value: account.accountUrl     },
    { label: "Account Status",         value: account.status         },
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

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div style={{ backgroundColor: "#a9c3f7" }} className="px-5 py-3">
              <span className="text-xs font-bold uppercase text-gray-800 tracking-wide">
                Account Information
              </span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
              {rows.map((row) => (
                <div key={row.label} className="flex items-start px-5 py-4 hover:bg-gray-50">
                  <span className="w-1/3 text-sm font-semibold text-gray-700 flex-shrink-0">
                    {row.label}
                  </span>
                  <span className="flex-1 text-sm text-gray-900">
                    {row.label === "Account Status" ? (
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          String(row.value).toUpperCase() === "ACTIVE"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {row.value
                          ? String(row.value).charAt(0).toUpperCase() + String(row.value).slice(1).toLowerCase()
                          : "—"}
                      </span>
                    ) : (
                      row.value || "—"
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ── Edit Mode ── */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3" style={{ backgroundColor: "#a9c3f7" }}>
            <span className="text-xs font-bold uppercase text-gray-800 tracking-wide">
              Edit Account Information
            </span>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Company Name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
              />
              <Input
                label="Company Email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Company Street Address"
              name="streetAddress"
              value={formData.streetAddress || ""}
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
                name="accountOwner"
                value={formData.accountOwner || ""}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Account URL"
              name="accountUrl"
              value={formData.accountUrl || ""}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountTab;