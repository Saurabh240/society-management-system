

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from '@/components/ui/Select';
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

  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";
  const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }


  //occupancy status
  const occupancyOptions = [
   
 { label: "Occupied", value: "OCCUPIED" },
    { label: "Vacant", value: "VACANT" },
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

      <h1 className="text-3xl font-bold mb-8 text-gray-900">Edit Association Unit</h1>

      <Card className="p-10 border border-gray-100 shadow-sm bg-white">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Read-only Association Info */}
          <div className="border-b border-gray-100 pb-6">
            <label className={labelClass}>Association</label>
            <div className="text-gray-900 font-medium leading-relaxed">
              <p className="text-lg">{formData.associationName}</p>
            </div>
          </div>

          {/* Unit Number */}
          <div>
            <label className={labelClass}>Unit Number *</label>
            <input
              type="text"
              name="unitNumber"
              value={formData.unitNumber}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* Unit Address Section */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Unit Address</h3>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Street Address *</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status and Financials */}
          <div className="space-y-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
              
                <Select
                label="Occupancy Status"
                name="occupancyStatus"
                value={formData.occupancyStatus}
                onChange={handleChange}
                options={occupancyOptions}
                  required
                  />
              </div>

              <div>
                <label className={labelClass}>Opening Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    name="balance"
                    step="0.01"
                    value={formData.balance}
                    onChange={handleChange}
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              onClick={() => navigate("/dashboard/associations/units")}
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