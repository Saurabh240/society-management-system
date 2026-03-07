import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";

// Mock data
const UNIT_DETAILS = {
  unitNumber: "301",
  streetAddress: "789 River Road",
  city: "Portland",
  state: "OR",
  zipCode: "97201",
  occupancyStatus: "Owner Occupied",
  ownerName: "Jessica Williams",
  balance: "150.00",
};

export default function UnitEdit() {
  const { associationId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(UNIT_DETAILS);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 
  const handleBackToUnitsTab = () => {
    navigate(`/dashboard/associations/view/${associationId}`, { 
      state: { activeTab: "Units" } 
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Saving Unit Changes:", formData);
  
    handleBackToUnitsTab();
  };

  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";
  const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white";

  return (
    <div className="p-6 max-w-5xl mx-auto text-gray-800">
      
    
      <button
        onClick={handleBackToUnitsTab}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        <span className="italic">Back to Riverside Community</span>
      </button>

      <h1 className="text-3xl font-bold mb-8 text-gray-900">Edit Unit</h1>

      <Card className="p-10 border border-gray-100 shadow-sm bg-white">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Association Information */}
          <div className="border-b border-gray-100 pb-6">
            <label className={labelClass}>Association</label>
            <div className="text-gray-900 font-medium leading-relaxed">
              <p>Riverside Community</p>
              <p>789 River Road</p>
              <p>Portland, OR 97201</p>
            </div>
          </div>

          {/* Unit Number Section */}
          <div>
            <label className={labelClass}>Unit Number *</label>
            <input
              type="text"
              name="unitNumber"
              value={formData.unitNumber}
              onChange={handleChange}
              placeholder="e.g. 301"
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
                  placeholder="Street Address"
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
                    placeholder="City"
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
                    placeholder="State"
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
                    placeholder="ZIP Code"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

        
          <div className="space-y-6 pt-6 border-t border-gray-100">
            <div>
              <label className={labelClass}>Occupancy Status *</label>
              <select
                name="occupancyStatus"
                value={formData.occupancyStatus}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="" disabled>Select status</option>
                <option value="Owner Occupied">Owner Occupied</option>
                <option value="Rented">Rented</option>
                <option value="Vacant">Vacant</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Owner</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Enter owner name"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  name="balance"
                  step="0.01"
                  value={formData.balance}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>
          </div>

          {/* LEFT ALIGNED BUTTONS */}
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