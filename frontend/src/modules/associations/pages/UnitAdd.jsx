

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

const UnitAdd = () => {
  const navigate = useNavigate();
  const { associationId } = useParams();

  const [formData, setFormData] = useState({
    unitNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    occupancyStatus: "Owner Occupied",
    balance: "0.00",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    navigate(`/dashboard/associations/view/${associationId}`, {
      state: { activeTab: "Units" },
    });
  };

  const inputClass =
    "block w-full px-4 py-3 text-base rounded-lg border border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400";

  return (
    <div className="max-w-5xl mx-auto my-6 px-4">
      {/* Back Link */}
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-blue-600 flex items-center text-sm font-medium"
        >
          <span className="mr-2">‹</span> Back to Riverside Community
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Unit</h2>

      <Card padding="none" shadow="sm">
        <Card.Content className="p-8 space-y-8">
          {/* Read-only Association Info */}
          <div className="pb-6 border-b border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Association</p>
            <p className="font-semibold text-gray-900">Riverside Community</p>
            <p className="text-gray-600">789 River Road</p>
            <p className="text-gray-600">Portland, OR 97201</p>
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
            />
          </div>

          {/* Unit Address */}
          <section className="space-y-6">
            <h4 className="text-gray-900 font-semibold text-lg">
              Unit Address
            </h4>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Street Address *
              </label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                placeholder="Enter street address"
                className={inputClass}
              />
            </div>

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
            required
            value={formData.occupancyStatus}
            onChange={handleChange}
            options={[
              { label: "Owner Occupied", value: "Owner Occupied" },
              { label: "Tenant Occupied", value: "Tenant Occupied" },
              { label: "Vacant", value: "Vacant" },
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
    </div>
  );
};

export default UnitAdd;