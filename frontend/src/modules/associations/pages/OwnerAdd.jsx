

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";


import { createOwner } from "../../ownership/ownershipApi";
import  {getAssociations}  from "../associationApi"; 
import  {getUnitsByAssociation}  from "../unitApi";

export default function OwnerAdd() {
  const navigate = useNavigate();
  const { associationId: urlAssociationId } = useParams();

  const [associations, setAssociations] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    association: urlAssociationId || "",
    unit: "",
    firstName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    altStreetAddress: "",
    altCity: "",
    altState: "",
    altZipCode: "",
    email: "",
    altEmail: "",
    phone: "",
    altPhone: "",
    isBoardMember: false,
    termStartDate: "",
    termEndDate: "",
    designation: "",
  });

 

useEffect(() => {
  const fetchAssociations = async () => {
    try {
      const res = await getAssociations(); 
      
     
      const list = res?.data?.data || res?.data || [];
      
      const formattedList = list.map(a => ({ 
        label: a.name, 
        value: String(a.id) 
      }));
      
      setAssociations(formattedList);
    } catch (err) {
      console.error("Failed to fetch associations", err);
    }
  };
  fetchAssociations();
}, []);


  useEffect(() => {
    if (formData.association) {
      const fetchUnits = async () => {
        try {
          const res = await getUnitsByAssociation(formData.association);
          const list = res?.data?.data || [];
          setUnits(list.map(u => ({ label: `Unit ${u.unitNumber}`, value: String(u.id) })));
        } catch (err) {
          console.error("Failed to fetch units", err);
          setUnits([]);
        }
      };
      fetchUnits();
    } else {
      setUnits([]);
    }
  }, [formData.association]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
   
    if (name === "association") {
      setFormData(prev => ({ ...prev, association: value, unit: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

   const payload = {
  unitId: Number(formData.unit),
  associationId: Number(formData.association),
  firstName: formData.firstName,
  lastName: formData.lastName,
  primaryStreet: formData.streetAddress,
  primaryCity: formData.city,
  primaryState: formData.state,
  primaryZip: formData.zipCode,
  altStreet: formData.altStreetAddress || null,
  altCity: formData.altCity || null,
  altState: formData.altState || null,
  altZip: formData.altZipCode || null,
  email: formData.email,
  altEmail: formData.altEmail || null,
  phone: formData.phone,
  altPhone: formData.altPhone || null,
  isBoardMember: formData.isBoardMember,
  ...(formData.isBoardMember && {
    designation: formData.designation,
termStartDate: formData.termStartDate
  ? new Date(formData.termStartDate).toISOString()
  : null,
termEndDate: formData.termEndDate
  ? new Date(formData.termEndDate).toISOString()
  : null,
  }),
};

    try {
      const res = await createOwner(payload);
      if (res.data?.success) {
        navigate("/dashboard/associations/accounts");
      }
    } catch (error) {
      console.error("Error creating owner:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      <button
        onClick={handleGoBack}
        className="flex items-center text-blue-900 hover:text-blue-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Ownership Accounts</span>
      </button>

      <h1 className="text-3xl font-bold mb-8">Add Owner</h1>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm">
          <Card.Content className="p-8 space-y-10">
            {/* Association + Unit Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Association"
                name="association"
                value={formData.association}
                onChange={handleChange}
                required
                options={[
                  { label: "Select Association", value: "", disabled: true },
                  ...associations
                ]}
              />

              <Select
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                disabled={!formData.association}
                options={[
                  { label: "Select Unit", value: "", disabled: true },
                  ...units
                ]}
              />
            </div>

            {/* Owner Info */}
            <section className="space-y-6">
              <h4 className="text-lg font-semibold">Owner Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </section>

            {/* Primary Address */}
            <section className="space-y-6">
              <h4 className="text-lg font-semibold">Primary Address</h4>
              <Input label="Street Address" name="streetAddress" value={formData.streetAddress} onChange={handleChange} required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
                <Input label="State" name="state" value={formData.state} onChange={handleChange} required />
                <Input label="ZIP Code" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
              </div>
            </section>

            {/* Alternative Address */}
            <section className="space-y-6">
              <h4 className="text-lg font-semibold">Alternative Address (Optional)</h4>
              <Input label="Street Address" name="altStreetAddress" value={formData.altStreetAddress} onChange={handleChange} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="City" name="altCity" value={formData.altCity} onChange={handleChange} />
                <Input label="State" name="altState" value={formData.altState} onChange={handleChange} />
                <Input label="ZIP Code" name="altZipCode" value={formData.altZipCode} onChange={handleChange} />
              </div>
            </section>

            {/* Contact Information */}
            <section className="space-y-6">
              <h4 className="text-lg font-semibold">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                <Input label="Alternative Email" type="email" name="altEmail" value={formData.altEmail} onChange={handleChange} />
                <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
                <Input label="Alternative Phone" name="altPhone" value={formData.altPhone} onChange={handleChange} />
              </div>
            </section>

            {/* Board Member Status */}
            <section className="space-y-6 pt-4">
              <h4 className="text-lg font-semibold border-b border-gray-100 pb-2 text-gray-900">Board Member Status</h4>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isBoardMember"
                    checked={formData.isBoardMember}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Owner is a Board Member</span>
                </label>
              </div>

              {formData.isBoardMember && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50/50 rounded-xl border border-gray-200">
                  <Input label="Term Start Date" type="date" name="termStartDate" value={formData.termStartDate} onChange={handleChange} required />
                  <Input label="Term End Date" type="date" name="termEndDate" value={formData.termEndDate} onChange={handleChange} required />
                  <Select
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    options={[
                      { label: "Select Designation", value: "", disabled: true },
                      { label: "Chairman", value: "CHAIRMAN" },
                      { label: "President", value: "President" },
                      { label: "Vice President", value: "Vice President" },
                      { label: "Secretary", value: "Secretary" },
                      { label: "Director", value: "Director" },
                    ]}
                  />
                </div>
              )}
            </section>
          </Card.Content>

          <Card.Footer className="px-8 py-6 flex gap-4 border-none">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Owner"}
            </Button>
            <Button variant="outline" type="button" onClick={handleGoBack}>
              Cancel
            </Button>
          </Card.Footer>
        </Card>
      </form>
    </div>
  );
}

