

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { getUnitById, updateUnit } from "../unitApi";

export default function UnitEdit() {
  const { associationId, unitId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

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
    balance: "",
    associationName: "",
  });

  const occupancyOptions = [
    { label: "Owner Occupied", value: "OWNER_OCCUPIED" },
    { label: "Vacant", value: "VACANT" },
    { label: "Rented", value: "RENTED" },
  ];

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await getUnitById(unitId);
        const unit = res.data.data;

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
  associationName: unit.associationName || "",
});

      } catch (error) {
        console.error(error);
        toast.error("Failed to load unit data");
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [unitId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "occupancyStatus" && value === "VACANT" ? { ownerName: "" } : {}),
    }));
  };

  const handleBack = () => {
    navigate(`/dashboard/associations/${associationId}`, {
      state: { activeTab: "Units" },
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await updateUnit(unitId, {
        unitNumber: formData.unitNumber,
        street: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        occupancyStatus: formData.occupancyStatus,
        balance: Number(formData.balance),
      });

      toast.success("Unit updated successfully");
      handleBack();

    } catch (error) {
      console.error(error);
      toast.error("Failed to update unit");
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-gray-800">

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center text-blue-900 hover:text-blue-800 mb-4 font-medium text-sm group"
      >
        <ChevronLeft
          size={18}
          className="mr-1 group-hover:-translate-x-1 transition-transform"
        />
        <span className="italic">
          Back to {formData.associationName || "Association"}
        </span>
      </button>

      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Edit Unit
      </h1>

      <Card className="p-10 border border-gray-100 shadow-sm bg-white">

        <form onSubmit={handleSave} className="space-y-8">

          {/* Association Info */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Association
            </p>

            <div className="text-gray-900 font-medium leading-relaxed">
              <p>{formData.associationName}</p>
              <p>{formData.streetAddress}</p>
              <p>
                {formData.city}, {formData.state} {formData.zipCode}
              </p>
            </div>
          </div>

          {/* Unit Number */}
          <Input
            label="Unit Number"
            name="unitNumber"
            value={formData.unitNumber}
            onChange={handleChange}
            required
          />

          {/* Address */}
          <div className="pt-4 border-t border-gray-100">

            <h3 className="text-lg font-semibold mb-6">
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

          {/* Occupancy */}
          <div className="space-y-6 pt-6">

            <Select
              label="Occupancy Status"
              name="occupancyStatus"
              value={formData.occupancyStatus}
              onChange={handleChange}
              options={occupancyOptions}
              required
            />

            {["OWNER_OCCUPIED", "RENTED"].includes(formData.occupancyStatus) && (
              <Input
                label="Owner"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Enter owner name"
              />
            )}
           {/*renter info*/}
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
              label="Balance"
              type="number"
              name="balance"
              step="0.01"
              value={formData.balance}
              onChange={handleChange}
              placeholder="0.00"
              leftIcon="$"
            />

          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-8">

            <Button
              type="submit"
              variant="primary"
              size="md"
            >
              Save Changes
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBack}
            >
              Cancel
            </Button>

          </div>

        </form>
      </Card>
    </div>
  );
}