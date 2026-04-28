

import React, { useEffect, useState } from "react";
import { getAccountInfo } from "@/modules/settings/api/settingsApi";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const AccountTab = () => {
  const [account, setAccount] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const tenantId = localStorage.getItem("tenantId");

    getAccountInfo(tenantId)
      .then((data) => {
        setAccount(data);
        setFormData(data);
        setLoading(false);
      })
      .catch(() => {
        // TEMP fallback 
        const dummy = {
          companyName: "Acme Property Management",
          address: "123 Main Street, Suite 100",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90012",
          phone: "(555) 123-4567",
          email: "contact@acmepm.com",
          ownerName: "John Doe",
          url: "acmepm.example.com",
          status: "Active",
        };
        setAccount(dummy);
        setFormData(dummy);
        setLoading(false);
      });
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setFormData(account); // reset
    setIsEditing(false);
  };

  const handleSave = () => {
    console.log("Saving:", formData);

    // TODO: call API here later
    // await updateAccountInfo(formData)

    setAccount(formData);
    setIsEditing(false);
  };

  if (loading) return <div>Loading...</div>;

  const Field = ({ label, value }) => (
    <div className="mb-6">
      <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-gray-700">{value || "—"}</p>
    </div>
  );

  const InputField = ({ label, value, onChange }) => (
    <div className="mb-6">
      <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );

  return (
    <Card className="p-8 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Account Information
        </h2>
      {!isEditing && (
    <Button variant="outline" onClick={() => setIsEditing(true)}>
      Edit
    </Button>
  )}
        
      </div>

      {/* VIEW MODE */}
      {!isEditing ? (
        <>
          <Field label="Company Name" value={account.companyName} />
          <Field label="Company Street Address" value={account.address} />

          <div className="grid grid-cols-3 gap-12 mb-6">
            <Field label="City" value={account.city} />
            <Field label="State" value={account.state} />
            <Field label="ZIP Code" value={account.zipCode} />
          </div>

          <Field label="Company Phone Number" value={account.phone} />
          <Field label="Company Email" value={account.email} />
          <Field label="Account Owner" value={account.ownerName} />
          <Field label="Account URL" value={account.url} />

          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Account Status
            </p>
            <span className="px-3 py-1 border rounded text-sm bg-gray-100">
              {account.status}
            </span>
          </div>
        </>
      ) : (
        <>
          {/* EDIT MODE */}
          <InputField
            label="Company Name"
            value={formData.companyName}
            onChange={(val) => handleChange("companyName", val)}
          />

          <InputField
            label="Company Street Address"
            value={formData.address}
            onChange={(val) => handleChange("address", val)}
          />

          <div className="grid grid-cols-3 gap-12 mb-6">
            <InputField
              label="City"
              value={formData.city}
              onChange={(val) => handleChange("city", val)}
            />
            <InputField
              label="State"
              value={formData.state}
              onChange={(val) => handleChange("state", val)}
            />
            <InputField
              label="ZIP Code"
              value={formData.zipCode}
              onChange={(val) => handleChange("zipCode", val)}
            />
          </div>

          <InputField
            label="Company Phone Number"
            value={formData.phone}
            onChange={(val) => handleChange("phone", val)}
          />

          <InputField
            label="Company Email"
            value={formData.email}
            onChange={(val) => handleChange("email", val)}
          />

          <InputField
            label="Account Owner"
            value={formData.ownerName}
            onChange={(val) => handleChange("ownerName", val)}
          />

          <InputField
            label="Account URL"
            value={formData.url}
            onChange={(val) => handleChange("url", val)}
          />
        </>
      )}

    {isEditing && (
  <div className="flex justify-end gap-3 mt-8 pt-6">
    <Button variant="outline" onClick={handleCancel}>
      Cancel
    </Button>
    <Button onClick={handleSave}>
      Save Changes
    </Button>
  </div>
)}

    </Card>
  );
};

export default AccountTab;