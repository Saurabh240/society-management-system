import { useEffect, useState } from "react";
import { getAccountInfo, updateAccountInfo } from "@/modules/settings/api/settingsApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "react-toastify";

const AccountTab = () => {
  const [account,   setAccount]   = useState(null);
  const [formData,  setFormData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    // No tenantId param needed — /api/v1/tenant/me resolves tenant from JWT
    getAccountInfo()
      .then((data) => { setAccount(data); setFormData(data); })
      .catch(() => { setAccount(null); setFormData(null); })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCancel = () => { setFormData(account); setIsEditing(false); };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Map frontend form fields → backend UpdateTenantRequest fields
      const payload = {
        name:          formData.name         ?? "",
        streetAddress: formData.streetAddress ?? "",
        city:          formData.city          ?? "",
        state:         formData.state         ?? "",
        zipCode:       formData.zipCode       ?? "",
        phone:         formData.phone         ?? "",
        email:         formData.email         ?? "",
        accountOwner:  formData.accountOwner  ?? "",
        accountUrl:    formData.accountUrl    ?? "",
        status:        formData.status,
      };
      const updated = await updateAccountInfo(payload);
      setAccount(updated ?? formData);
      setIsEditing(false);
      toast.success("Account updated successfully");
    } catch {
      toast.error("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-400 text-sm py-4">Loading...</div>;

  // Backend TenantResponse fields:
  // { id, name, subdomain, status, streetAddress, city, state, zipCode, phone, email, accountOwner, accountUrl }
  const rows = account ? [
    { label: "Company Name",           value: account.name          },
    { label: "Company Street Address", value: account.streetAddress },
    { label: "City",                   value: account.city          },
    { label: "State",                  value: account.state         },
    { label: "ZIP Code",               value: account.zipCode       },
    { label: "Company Phone Number",   value: account.phone         },
    { label: "Company Email",          value: account.email         },
    { label: "Account Owner",          value: account.accountOwner  },
    { label: "Account URL",            value: account.accountUrl    },
    { label: "Account Status",         value: account.status        },
  ] : [];

  return (
    <div>
      {/* ── View Mode ───────────────────────────────────────────────────────── */}
      {!isEditing ? (
        <>
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </div>

          {account === null ? (
            <p className="text-gray-500 text-sm py-4">No account information available.</p>
          ) : (
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
                      <td className="border-r border-gray-300 p-4 text-sm text-gray-600">{row.label}</td>
                      <td className="p-4 text-sm font-medium text-gray-900">{row.value || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* ── Edit Mode ─────────────────────────────────────────────────────── */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Company Name"
                name="name"
                value={formData?.name ?? ""}
                onChange={handleChange}
              />
              <Input
                label="Company Email"
                name="email"
                value={formData?.email ?? ""}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Company Street Address"
              name="streetAddress"
              value={formData?.streetAddress ?? ""}
              onChange={handleChange}
            />

            <div className="grid grid-cols-3 gap-5">
              <Input label="City"     name="city"    value={formData?.city    ?? ""} onChange={handleChange} />
              <Input label="State"    name="state"   value={formData?.state   ?? ""} onChange={handleChange} />
              <Input label="ZIP Code" name="zipCode" value={formData?.zipCode ?? ""} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Company Phone Number"
                name="phone"
                value={formData?.phone ?? ""}
                onChange={handleChange}
              />
              <Input
                label="Account Owner"
                name="accountOwner"
                value={formData?.accountOwner ?? ""}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Account URL"
              name="accountUrl"
              value={formData?.accountUrl ?? ""}
              onChange={handleChange}
            />
          </div>

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