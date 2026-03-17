import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

import { createUnit } from "../unitApi";
import { getAssociationById } from "../associationApi";

const UnitAdd = () => {
  const navigate = useNavigate();
  const { associationId } = useParams();

  const [association, setAssociation] = useState(null);

  const [formData, setFormData] = useState({
    unitNumber: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    occupancyStatus: "VACANT",
    balance: 0,

    ownerName: "",
    

    renterFirstName: "",
    renterLastName: "",
    renterEmail: "",
    renterPhone: "",
  });

  useEffect(() => {
    const fetchAssociation = async () => {
      try {
        const res = await getAssociationById(associationId);
        setAssociation(res?.data?.data);
      } catch (error) {
        console.error("Failed to load association", error);
      }
    };

    fetchAssociation();
  }, [associationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBack = () => {
    navigate(`/dashboard/associations/${associationId}`, {
      state: { activeTab: "Units" },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createUnit({
        ...formData,
        associationId: Number(associationId),
      });

      navigate(`/dashboard/associations/${associationId}`, {
        state: { activeTab: "Units" },
      });
    } catch (error) {
      console.error("Failed to create unit", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-6 px-4">

      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="text-blue-900 hover:text-blue-800 flex items-center text-sm font-medium"
        >
          <span className="mr-2">‹</span>
          Back to {association?.name || "Association"}
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Unit</h2>

      <form onSubmit={handleSubmit}>
        <Card padding="none" shadow="sm">

          <Card.Content className="p-8 space-y-8 ">

            {/* Association Info */}
            <div className="pb-6 border-b border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Association</p>
              <p className="font-semibold text-gray-900">
                {association?.name}
              </p>
              <p className="text-gray-600">
                {association?.streetAddress}
              </p>
              <p className="text-gray-600">
                {association?.city}, {association?.state} {association?.zipCode}
              </p>
            </div>

            {/* Unit Number */}
            <Input
              label="Unit Number"
              name="unitNumber"
              value={formData.unitNumber}
              onChange={handleChange}
              placeholder="Enter unit number"
              required
            />

            {/* Address Section */}
            <section className="space-y-6">

              <h4 className="text-gray-900 font-semibold text-lg">
                Unit Address
              </h4>

              <Input
                label="Street Address"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />

                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />

                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                />

              </div>
            </section>

            {/* Occupancy */}
            <Select
              label="Occupancy Status"
              name="occupancyStatus"
              value={formData.occupancyStatus}
              onChange={handleChange}
              options={[
                { label: "Select Occupancy", value: "", disabled: true },
                { label: "Vacant", value: "VACANT" },
                { label: "Owner Occupied", value: "OWNER_OCCUPIED" },
                { label: "Rented", value: "RENTED" },
              ]}
            />

            {/* Owner Info */}
       
{formData.occupancyStatus === "OWNER_OCCUPIED" && (
  <section className="space-y-6 pt-6">
    <h4 className="text-gray-900 font-semibold text-lg">
      Owner Information
    </h4>

    <Input
      label="Owner Name"
      name="ownerName"
      value={formData.ownerName}
      onChange={handleChange}
      placeholder="Enter owner name"
    />

  </section>
)}

            {/* Renter Info */}
            {formData.occupancyStatus === "RENTED" && (
              <section className="space-y-6 pt-6">
                <h4 className="text-gray-900 font-semibold text-lg">
                  Renter Information
                </h4>

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

                  <Input
                    label="Email"
                    type="email"
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
              </section>
            )}

            {/* Balance */}
            <Input
              label="Balance"
              type="number"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              step="0.01"
              leftIcon="$"
            />

          </Card.Content>

      <Card.Footer className="px-8 pb-12 border-t-0">
  <div className="flex items-center gap-4">
    <Button variant="primary" type="submit">Add Unit</Button>
    <Button variant="outline" onClick={handleBack}>Cancel</Button>
  </div>
</Card.Footer>

        </Card>
      </form>

    </div>
  );
};

export default UnitAdd;