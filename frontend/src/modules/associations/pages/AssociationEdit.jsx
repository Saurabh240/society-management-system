import React, { useState } from 'react';
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";


const AssociationEdit = () => {
  const [formData, setFormData] = useState({
    associationName: 'Riverside Community',
    streetAddress: '789 River Road',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    taxIdentityType: 'EIN',
    taxPayerId: '45-6789012'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper for consistent input styling
  const inputClass = "block w-full px-4 py-3 text-base rounded-lg border border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="max-w-5xl mx-auto my-10 px-4">
      <Card padding="none" shadow="lg">
        <Card.Header className="px-8 pt-8 border-b border-gray-100 pb-6">
          <Card.Title className="text-2xl">Edit Association</Card.Title>
        </Card.Header>

        <Card.Content className="p-8 space-y-10">
          {/* Association Name */}
          <div className="max-w-full">
            <label className="block mb-2 text-sm text-gray-700">Association Name *</label>
            <input
              type="text"
              name="associationName"
              value={formData.associationName}
              onChange={handleChange}
              placeholder="Riverside Community"
              className={inputClass}
            />
          </div>

          {/* Address Section */}
          <section>
            <h4 className="text-gray-900 font-semibold mb-6 text-lg">Full Address</h4>
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm text-gray-700">Street Address *</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="789 River Road"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 text-sm text-gray-700">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Portland"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-700">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="OR"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-700">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="97201"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Tax Information Section */}
          <section>
            <h4 className="text-gray-900 font-semibold mb-6 text-lg">Tax Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Tax Identity Type"
                name="taxIdentityType"
                required
                value={formData.taxIdentityType}
                onChange={handleChange}
                options={[
                  { label: 'EIN', value: 'EIN' },
                  { label: 'SSN', value: 'SSN' },
                  { label: 'ITIN', value: 'ITIN' }
                ]}
              />
              <div>
                <label className="block mb-2 text-sm text-gray-700">Tax Payer ID *</label>
                <input
                  type="text"
                  name="taxPayerId"
                  value={formData.taxPayerId}
                  onChange={handleChange}
                  placeholder="45-6789012"
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        </Card.Content>

        <Card.Footer className="px-8 pb-8 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
          <Button 
            variant="primary" 
            size="md" 
            type="submit"
            onClick={() => console.log('Updating...', formData)}
          >
            Update Association
          </Button>
          <Button 
            variant="outline" 
            size="md"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default AssociationEdit;