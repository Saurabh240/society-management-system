import React, { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

export default function OwnerAdd() {
  const navigate = useNavigate();
  const { associationId } = useParams();
  
  const [formData, setFormData] = useState({
    association: 'Riverside Community',
    unit: '',
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    altStreetAddress: '',
    altCity: '',
    altState: '',
    altZipCode: '',
    email: '',
    altEmail: '',
    phone: '',
    altPhone: '',
    isBoardMember: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const inputClass = "block w-full px-4 py-3 text-base rounded-lg border border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400";
 

  const handleGoBack = () => {
  navigate("/dashboard/associations/accounts");
};
  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      {/* Breadcrumb */}
      <button
        onClick={handleGoBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Ownership Accounts</span>
      </button>

      <h1 className="text-3xl font-bold mb-8">Add Owner</h1>

      <Card padding="none" shadow="sm">
        <Card.Content className="p-8 space-y-10">
          
          {/* Top Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Association"
              name="association"
              required
              value={formData.association}
              onChange={handleChange}
              options={[{ label: 'Riverside Community', value: 'Riverside Community' }]}
            />
            <Select
              label="Unit"
              name="unit"
              required
              placeholder="Select Unit"
              value={formData.unit}
              onChange={handleChange}
              options={[
                { label: 'Unit 301', value: '301' },
                { label: 'Unit 302', value: '302' }
              ]}
            />
          </div>

          {/* Owner Information */}
          <section className="space-y-6">
            <h4 className="text-gray-900 font-semibold text-lg border-b border-gray-100 pb-2">Owner Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">First Name *</label>
                <input type="text" name="firstName" placeholder="Enter first name" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Last Name *</label>
                <input type="text" name="lastName" placeholder="Enter last name" className={inputClass} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Primary Address */}
          <section className="space-y-6">
            <h4 className="text-gray-900 font-semibold text-lg">Primary Address</h4>
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Street Address *</label>
                <input type="text" name="streetAddress" placeholder="Enter street address" className={inputClass} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">City *</label>
                  <input type="text" name="city" placeholder="Enter city" className={inputClass} onChange={handleChange} />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">State *</label>
                  <input type="text" name="state" placeholder="Enter state" className={inputClass} onChange={handleChange} />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">ZIP Code *</label>
                  <input type="text" name="zipCode" placeholder="Enter ZIP code" className={inputClass} onChange={handleChange} />
                </div>
              </div>
            </div>
          </section>

          {/* Alternative Address */}
          <section className="space-y-6">
            <h4 className="text-gray-900 font-semibold text-lg">Alternative Address (Optional)</h4>
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Street Address</label>
                <input type="text" name="altStreetAddress" placeholder="Enter street address" className={inputClass} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">City</label>
                  <input type="text" name="altCity" placeholder="Enter city" className={inputClass} onChange={handleChange} />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">State</label>
                  <input type="text" name="altState" placeholder="Enter state" className={inputClass} onChange={handleChange} />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">ZIP Code</label>
                  <input type="text" name="altZipCode" placeholder="Enter ZIP code" className={inputClass} onChange={handleChange} />
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="space-y-6">
            <h4 className="text-gray-900 font-semibold text-lg">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Email Address *</label>
                <input type="email" name="email" placeholder="Enter email address" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Alternative Email Address</label>
                <input type="email" name="altEmail" placeholder="Enter alternative email" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number *</label>
                <input type="text" name="phone" placeholder="(555) 123-4567" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Alternative Phone Number</label>
                <input type="text" name="altPhone" placeholder="(555) 123-4567" className={inputClass} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Board Member Status */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-gray-900 font-semibold text-lg">Board Member Status</h4>
            <div className="flex items-center space-x-3">
              <input
                id="isBoardMember"
                name="isBoardMember"
                type="checkbox"
                checked={formData.isBoardMember}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isBoardMember" className="text-gray-700 font-medium">
                Owner is a Board Member
              </label>
            </div>
          </section>
        </Card.Content>

        <Card.Footer className="px-8 pb-8 flex flex-col sm:flex-row gap-4 border-none">
          <Button variant="primary" size="md" type="submit">
            Add Owner
          </Button>
          <Button variant="outline" size="md" onClick={handleGoBack}>
            Cancel
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}