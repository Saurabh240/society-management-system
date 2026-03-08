


import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

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

  const inputClass =
    "block w-full px-4 py-3 text-base rounded-lg border border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400";

  return (
    <div className="max-w-5xl mx-auto my-6 px-4">

      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-blue-600 flex items-center text-sm font-medium"
        >
          <span className="mr-2">‹</span>
          Back to {association?.name || "Association"}
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Unit</h2>

      <form onSubmit={handleSubmit}>
        <Card padding="none" shadow="sm">

          <Card.Content className="p-8 space-y-8">

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
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Unit Number *
              </label>

              <input
                type="text"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                placeholder="Enter unit number"
                className={inputClass}
                required
              />
            </div>

            {/* Address Section */}
            <section className="space-y-6">

              <h4 className="text-gray-900 font-semibold text-lg">
                Unit Address
              </h4>

              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street Address"
                className={inputClass}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={inputClass}
                />

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={inputClass}
                />

                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="ZIP Code"
                  className={inputClass}
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
                { label: "Occupied", value: "OCCUPIED" },
                { label: "Vacant", value: "VACANT" },
              ]}
            />

            {/* Balance */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Balance
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                  $
                </span>

                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  className={`${inputClass} pl-8`}
                  step="0.01"
                />
              </div>
            </div>

          </Card.Content>

          <Card.Footer className="px-8 pb-8 flex flex-col sm:flex-row gap-4 border-none">

            <Button variant="primary" size="md" type="submit">
              Add Unit
            </Button>

            <Button variant="outline" size="md" onClick={handleBack}>
              Cancel
            </Button>

          </Card.Footer>

        </Card>
      </form>

    </div>
  );
};

export default UnitAdd;