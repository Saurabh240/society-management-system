

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { getUnitById, updateUnit } from "../unitApi";

export default function AssociationUnitEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    unitNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    occupancyStatus: "",
    ownerName: "",

  renterFirstName: "",
  renterLastName: "",
  renterEmail: "",
  renterPhone: "",
    balance: 0,
    associationName: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnit() {
      try {
        setLoading(true);
        const res = await getUnitById(id);
        const unit = res.data?.data || res.data;

       setFormData({
  unitNumber: unit.unitNumber || "",
  streetAddress: unit.street || "",
  city: unit.city || "",
  state: unit.state || "",
  zipCode: unit.zipCode || "",
  occupancyStatus: unit.occupancyStatus || "",

  ownerName: unit.unitOwners?.[0]
    ? `${unit.unitOwners[0].firstName} ${unit.unitOwners[0].lastName}`
    : "",

  renterFirstName: unit.renter?.firstName || "",
  renterLastName: unit.renter?.lastName || "",
  renterEmail: unit.renter?.email || "",
  renterPhone: unit.renter?.phone || "",

  balance: unit.balance || 0,
  associationName: unit.associationName || "Association",
});
      } catch (err) {
        toast.error("Failed to load unit details");
        navigate("/dashboard/associations/units");
      } finally {
        setLoading(false);
      }
    }

    fetchUnit();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await updateUnit(id, {
        unitNumber: formData.unitNumber,
        street: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        occupancyStatus: formData.occupancyStatus,
        balance: formData.balance,
      });

      toast.success("Unit updated successfully");
      navigate("/dashboard/associations/units");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update unit");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

 const occupancyOptions = [
  { label: "Owner Occupied", value: "OWNER_OCCUPIED" },
  { label: "Vacant", value: "VACANT" },
  { label: "Rented", value: "RENTED" },
];

  return (
    <div className="p-6 max-w-5xl mx-auto text-gray-800">
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard/associations/units")}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft
          size={18}
          className="mr-1 group-hover:-translate-x-1 transition-transform"
        />
        <span className="italic">Back to Association Units</span>
      </button>

      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Edit Association Unit
      </h1>

      <Card className="p-10 border border-gray-100 shadow-sm bg-white">
        <form onSubmit={handleSave} className="space-y-8">

          {/* Association Name */}
          <div className="pb-6">
            <label className="block mb-2 text-sm text-gray-700">
              Association
            </label>
            <p className="text-lg font-medium text-gray-900">
              {formData.associationName}
            </p>
          </div>

          {/* Unit Number */}
          <Input
            label="Unit Number"
            name="unitNumber"
            value={formData.unitNumber}
            onChange={handleChange}
            required
          />

          {/* Unit Address */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Unit Address
            </h3>

            <div className="space-y-6">

              <Input
                label="Street Address"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Status + Financials */}
          <div className="space-y-6 pt-6">
            

              <Select
                label="Occupancy Status"
                name="occupancyStatus"
                value={formData.occupancyStatus}
                onChange={handleChange}
                options={occupancyOptions}
                required
              />
              {/* Owner */}
{["OWNER_OCCUPIED", "RENTED"].includes(formData.occupancyStatus) && (
  <Input
    label="Owner Name"
    name="ownerName"
    value={formData.ownerName}
    onChange={handleChange}
  />
)}

{formData.occupancyStatus === "RENTED" && (
  <div className="space-y-6 pt-4 border-t border-gray-100">

    <h3 className="text-lg font-semibold text-gray-900">
      Renter Information
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <Input
        label="First Name"
        name="renterFirstName"
        value={formData.renterFirstName}
        onChange={handleChange}
      />

      <Input
        label="Last Name"
        name="renterLastName"
        value={formData.renterLastName}
        onChange={handleChange}
      />

    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <Input
        label="Email"
        name="renterEmail"
        value={formData.renterEmail}
        onChange={handleChange}
      />

      <Input
        label="Phone"
        name="renterPhone"
        value={formData.renterPhone}
        onChange={handleChange}
      />

    </div>

  </div>
)}
              <Input
                label="Opening Balance"
                type="number"
                name="balance"
                step="0.01"
                value={formData.balance}
                onChange={handleChange}
                leftIcon="$"
              />

            </div>
        

          {/* Buttons */}
          <div className="flex gap-4 pt-8">
  <Button type="submit">
    Save Changes
  </Button>

  <Button
    type="button"
    variant="outline"
    onClick={() => navigate("/dashboard/associations/units")}
  >
    Cancel
  </Button>
</div>

        </form>
      </Card>
    </div>
  );
}