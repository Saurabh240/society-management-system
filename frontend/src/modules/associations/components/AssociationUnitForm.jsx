

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { getAssociations } from "../associationApi";

export default function AssociationUnitForm({ onSubmit, initialData = {} }) {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [loadingAssoc, setLoadingAssoc] = useState(true);

  const [form, setForm] = useState({
    associationId: initialData.associationId || "", 
    unitNumber: initialData.unitNumber || "",
    street: initialData.street || "",
    city: initialData.city || "",
    state: initialData.state || "",
    zipCode: initialData.zipCode || "",
    occupancyStatus: initialData.occupancyStatus || "", 
    balance: initialData.balance || 0,
  });

  useEffect(() => {
    async function fetchAssociations() {
      try {
        const res = await getAssociations();
        const data = res.data?.data || res.data || [];
        setAssociations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch associations:", err);
      } finally {
        setLoadingAssoc(false);
      }
    }
    fetchAssociations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

 
  const associationOptions = [
    { value: "", label: loadingAssoc ? "Loading..." : "Select Association" },
    ...associations.map(a => ({ label: a.name, value: a.id }))
  ];


  const occupancyOptions = [
    { value: "", label: "Select Occupancy" },
 { label: "Owner Occupied", value: "OWNER_OCCUPIED" },
    { label: "Vacant", value: "VACANT" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-sm border border-gray-200">
        <Card.Content className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Association"
                name="associationId"
                value={form.associationId}
                onChange={handleChange}
                options={associationOptions} 
                required
              />
              
              <Input 
                label="Unit Number" 
                name="unitNumber" 
                value={form.unitNumber} 
                onChange={handleChange} 
                placeholder="Enter unit number"
                required 
              />
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-4 pb-2 ">Unit Address</h4>
              <div className="space-y-4">
                <Input 
                  label="Street Address" 
                  name="street" 
                  value={form.street} 
                  onChange={handleChange} 
                  placeholder="Enter street address"
                  required 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="City" name="city" value={form.city} onChange={handleChange} placeholder="City" required />
                  <Input label="State" name="state" value={form.state} onChange={handleChange} placeholder="State" required />
                  <Input label="ZIP" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="ZIP" required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Occupancy Status"
                name="occupancyStatus"
                value={form.occupancyStatus}
                onChange={handleChange}
                options={occupancyOptions} 
                required
              />
              <Input
                label="Opening Balance"
                name="balance"
                type="number"
                value={form.balance}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="flex gap-3 pt-4 ">
              <Button type="submit" variant="primary">Save Unit</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard/associations/units")}>
                Cancel
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}