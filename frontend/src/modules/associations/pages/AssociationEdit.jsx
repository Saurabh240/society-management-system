import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

import { getAssociationById, updateAssociation } from "../associationApi";

export default function AssociationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    taxType: "",
    taxId: "",
    status: "",
  });

  const [errors, setErrors] = useState({});

  const taxOptions = [
    { value: "", label: "Select tax type" },
    { value: "SSN", label: "SSN" },
    { value: "EIN", label: "EIN" },
  ];

  const statusOptions = [
    { value: "", label: "Select status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  useEffect(() => {
    fetchAssociation();
  }, []);

 const fetchAssociation = async () => {
  try {
    const res = await getAssociationById(id);

    const data = res?.data?.data;  

    setForm({
      name: data?.name || "",
      street: data?.streetAddress || "",
      city: data?.city || "",
      state: data?.state || "",
      zip: data?.zipCode || "",
      taxType: data?.taxIdentityType || "",
      taxId: data?.taxPayerID || "", 
      status: data?.status || "",
    });

  } catch (error) {
    console.error("Fetch association failed", error);
    toast.error("Failed to load association");
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
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

    if (!form.name) newErrors.name = "Association name is required";
    if (!form.street) newErrors.street = "Street address is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.zip) newErrors.zip = "ZIP code is required";
    if (!form.taxType) newErrors.taxType = "Tax identity type is required";
    if (!form.taxId) newErrors.taxId = "Tax ID is required";
    if (!form.status) newErrors.status = "Status is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      await updateAssociation(id, {
        name: form.name,
        status: form.status,
        streetAddress: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zip,
        taxIdentityType: form.taxType,
        taxPayerId: form.taxId,
      });

      toast.success("Association updated successfully");

      navigate("/dashboard/associations");
    } catch (error) {
      console.error("Update failed", error);

      const message =
        error?.response?.data?.error || "Failed to update association";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Card className="max-w-5xl mx-auto">
        <Card.Header>
          <Card.Title>Edit Association</Card.Title>
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

                  <Input
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    error={errors.state}
                    required
                  />

                  <Input
                    label="ZIP Code"
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    placeholder="Enter ZIP code"
                    error={errors.zip}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tax */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Tax Information
              </h4>

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

                <Input
                  label="Tax Payer ID"
                  name="taxId"
                  value={form.taxId}
                  onChange={handleChange}
                  placeholder="Enter SSN or EIN"
                  error={errors.taxId}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" variant="primary" loading={loading}>
                Update Association
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