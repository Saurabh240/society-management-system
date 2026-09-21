

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import StateSelect, { isValidZipCode } from "@/shared/components/StateSelect";

import { createAssociation } from "../associationApi";

export default function AddAssociation() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    taxType: "EIN",
    taxId: "",
    taxPending: false,
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const taxOptions = [
    { value: "EIN", label: "EIN (Employer Identification Number)" },
  ];

  const statusOptions = [
    { value: "", label: "Select status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name) newErrors.name = "Association name must not be blank";
    if (!form.street) newErrors.street = "Street address is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.zip) {
      newErrors.zip = "ZIP code is required";
    } else if (!isValidZipCode(form.zip)) {
      newErrors.zip = "Invalid ZIP code format (e.g. 12345 or 12345-6789)";
    }

    if (!form.taxPending) {
      if (!form.taxType) newErrors.taxType = "Tax identity type is required";
      if (!form.taxId) {
        newErrors.taxId = "Tax ID (EIN) is required";
      } else if (!/^\d{2}-\d{7}$/.test(form.taxId)) {
        newErrors.taxId = "Invalid EIN format. Format must be XX-XXXXXXX (e.g., 12-3456789)";
      }
    }

    if (!form.status) newErrors.status = "Status is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      await createAssociation({
        name: form.name,
        status: form.status,
        streetAddress: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zip,
        taxIdentityType: form.taxPending ? null : form.taxType,
        taxPayerId: form.taxPending ? null : form.taxId,
        taxPending: form.taxPending,
      });

      toast.success("Association created successfully");

      navigate("/dashboard/associations");

    } catch (error) {
      console.error("Create association failed", error);

      const message =
        error?.response?.data?.message || error?.response?.data?.error || "Failed to create association";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Card className="max-w-5xl mx-auto">
       <Card.Header>
          <Card.Title>Add Association</Card.Title>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Association Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter association name"
              error={errors.name}
              required
            />

            {/* Status */}
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={statusOptions}
              error={errors.status}
              required
            />
             </div>
            {/* Address */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Full Address
              </h4>

              <div className="space-y-4">
                <Input
                  label="Street Address"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  error={errors.street}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    error={errors.city}
                    required
                  />

                  <StateSelect
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    error={errors.state}
                    required
                  />

                  <Input
                    label="ZIP Code"
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    placeholder="e.g. 12345 or 12345-6789"
                    error={errors.zip}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tax */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Tax Information
                </h4>
                <label className="flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    name="taxPending"
                    checked={form.taxPending}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                  />
                  Fill in tax info later
                </label>
              </div>

              {!form.taxPending && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Tax Identity Type"
                    name="taxType"
                    value={form.taxType}
                    onChange={handleChange}
                    options={taxOptions}
                    error={errors.taxType}
                    required
                  />

                  <div className="space-y-1">
                    <Input
                      label="EIN (Employer Identification Number)"
                      name="taxId"
                      value={form.taxId}
                      onChange={handleChange}
                      placeholder="XX-XXXXXXX (e.g. 12-3456789)"
                      error={errors.taxId}
                      required
                    />
                    <p className="text-xs text-gray-500">Format: XX-XXXXXXX (e.g. 12-3456789)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" variant="primary" loading={loading}>
                Create Association
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/associations")}
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