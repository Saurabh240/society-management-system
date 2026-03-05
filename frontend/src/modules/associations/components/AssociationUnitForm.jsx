import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export default function AssociationUnitForm({ onSubmit, onCancel, initialData = {}, associations = [] }) {
   const navigate = useNavigate();
  const [form, setForm] = useState({
    association: initialData.association || "",
    unitNumber: initialData.unitNumber || "",
    streetAddress: initialData.streetAddress || "",
    city: initialData.city || "",
    state: initialData.state || "",
    zipCode: initialData.zipCode || "",
    occupancyStatus: initialData.occupancyStatus || "",
    balance: initialData.balance || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const occupancyOptions = [
    { label: "Owner Occupied", value: "owner" },
    { label: "Vacant", value: "vacant" },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">


      <Card className="max-w-4xl mx-auto">
      

        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-6">

           
            <Select
              label="Select Association*"
              name="association"
              value={form.association}
              onChange={handleChange}
              options={associations.map(a => ({ label: a.name, value: a.id }))}
              placeholder="Select an association..."
              required
            />

          
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Unit Information
              </h4>
              <div className="space-y-4">
                <Input
                  label="Unit Number*"
                  name="unitNumber"
                  value={form.unitNumber}
                  onChange={handleChange}
                  placeholder="Enter unit number"
                  required
                />

                <Input
                  label="Street Address*"
                  name="streetAddress"
                  value={form.streetAddress}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City*"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />

                  <Input
                    label="State*"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                  />

                  <Input
                    label="ZIP Code*"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    placeholder="Enter ZIP code"
                    required
                  />
                </div>
              </div>
            </div>

        
<div>
  <h4 className="text-lg font-semibold text-gray-800 mb-4">
    Occupancy & Balance
  </h4>
  <div className="space-y-4">
  
    <Select
      label="Occupancy Status*"
      name="occupancyStatus"
      value={form.occupancyStatus}
      onChange={handleChange}
      options={occupancyOptions}
      placeholder="Select occupancy status"
      required
    />


    <Input
      label="Balance"
      name="balance"
      type="number"
      value={form.balance}
      onChange={handleChange}
      placeholder="$0.00"
    />
  </div>
</div>

            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" variant="primary">
                Add Unit
              </Button>
              <Button type="button" variant="outline" 
              onClick={() => navigate("/dashboard/associations/units")}>
                Cancel
              </Button>
            </div>

          </form>
        </Card.Content>
      </Card>
    </div>
  );
}

