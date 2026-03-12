import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { toast } from "react-toastify";
import { getUnitById, updateUnit } from "../unitApi";

export default function UnitEdit() {
  const { associationId, unitId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    unitNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    occupancyStatus: "",
    ownerName: "",
    balance: "",
    associationName: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setLoading(true);

        const res = await getUnitById(unitId);
        const unit = res.data.data;

        setFormData({
          unitNumber: unit.unitNumber || "",
          streetAddress: unit.street || "",
          city: unit.city || "",
          state: unit.state || "",
          zipCode: unit.zipCode || "",
          occupancyStatus: unit.occupancyStatus || "",
          ownerName:
            unit.unitOwners?.[0]
              ? `${unit.unitOwners[0].firstName} ${unit.unitOwners[0].lastName}`
              : "",
          balance: unit.balance || 0,
          associationName: unit.associationName || "",
        });
      } catch (error) {
        toast.error("Failed to load unit data");
        console.error(error);
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
    }));
  };

  const handleBackToUnitsTab = () => {
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
      handleBackToUnitsTab();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update unit");
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  const occupancyOptions = [
    { label: "Occupied", value: "OCCUPIED" },
    { label: "Vacant", value: "VACANT" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto text-gray-800">
      {/* Back Button */}
      <button
        onClick={handleBackToUnitsTab}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft
          size={18}
          className="mr-1 group-hover:-translate-x-1 transition-transform"
        />
        <span className="italic">
          Back to {formData.associationName || "Association"}
        </span>
      </button>

      <h1 className="text-3xl font-bold mb-8 text-gray-900">Edit Unit</h1>

      <Card className="p-10 border border-gray-100 shadow-sm bg-white">
        <form onSubmit={handleSave} className="space-y-8">

          {/* Association Info */}
          <div className="border-b border-gray-100 pb-6">
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

          {/* Address Section */}
          <div className="pt-4 border-t border-gray-100">
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

          {/* Occupancy */}
          <div className="space-y-6 pt-6 border-t border-gray-100">
            <Select
              label="Occupancy Status"
              name="occupancyStatus"
              value={formData.occupancyStatus}
              onChange={handleChange}
              options={occupancyOptions}
              required
            />

            {/* Owner */}
            <Input
              label="Owner"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Enter owner name"
            />

            {/* Balance */}
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
          <div className="flex justify-start items-center gap-4 pt-8 border-t border-gray-100">
            <Button
              type="submit"
              className="bg-gray-900 text-white px-8 py-2.5 rounded-md hover:bg-black transition-colors"
            >
              Save Changes
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleBackToUnitsTab}
              className="px-8 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors bg-white"
            >
              Cancel
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
}