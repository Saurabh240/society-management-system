import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
{/*import { createVendor } from "../api/accountingApi";*/}

const CATEGORIES = [
  "Landscaping", "Plumbing", "Electrical", "HVAC", "Cleaning", 
  "Security", "Maintenance", "Construction", "Legal", "Accounting", "Insurance", "Other"
];

const STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "NY", "TX"]; // ... truncate for brevity

export default function AddVendorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", companyName: "", category: "",
    primaryEmail: "", alternativeEmail: "", mobilePhone: "", workPhone: "", website: "",
    streetAddress: "", city: "", state: "", zipCode: "", country: "USA",
    taxIdentityType: "", insuranceProvider: "", policyNumber: "", expirationDate: "",
    comments: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createVendor(formData);
      toast.success("Vendor created successfully!");
      navigate("/dashboard/maintenance");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} className="mr-1" /> Back to Vendors
      </button>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Vendor</h2>
        
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
   {/* Basic Information */}
<section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
  <h3 className="text-lg font-semibold mb-6 pb-2">
    Basic Information
  </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <Input
      label="First Name"
      name="firstName"
      required
      value={formData.firstName}
      onChange={handleChange}
    />
    <Input
      label="Last Name"
      name="lastName"
      required
      value={formData.lastName}
      onChange={handleChange}
    />
  </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Input
      label="Company Name"
      name="companyName"
      required
      value={formData.companyName}
      onChange={handleChange}
    />
     <Select
      label="Category"
      name="category"
      required
      options={CATEGORIES.map((c) => ({ value: c, label: c }))}
      value={formData.category}
      onChange={handleChange}
    />
    <div /> 
  </div>
</section>
      {/* Contact Information */}
<section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
  <h3 className="text-lg font-semibold mb-6 pb-2">
    Contact Information
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Input
      label="Primary Email"
      type="email"
      name="primaryEmail"
      required
      value={formData.primaryEmail}
      onChange={handleChange}
    />

    <Input
      label="Alternative Email"
      type="email"
      name="alternateEmail"
      value={formData.alternateEmail}
      onChange={handleChange}
    />

    <Input
      label="Mobile Phone"
      name="mobilePhone"
      value={formData.mobilePhone}
      onChange={handleChange}
    />

    <Input
      label="Work Phone"
      name="workPhone"
      value={formData.workPhone}
      onChange={handleChange}
    />

    <Input
      label="Home Phone"
      name="homePhone"
      value={formData.homePhone}
      onChange={handleChange}
    />

    <Input
      label="Website"
      name="website"
      placeholder="https://"
      value={formData.website}
      onChange={handleChange}
    />
  </div>
</section>
 {/* Address Information */}
<section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
  <h3 className="text-lg font-semibold mb-6 pb-2">
    Address Information
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <Input
      label="Street Address"
      name="streetAddress"
      value={formData.streetAddress}
      onChange={handleChange}
    />

    <Input
      label="City"
      name="city"
      placeholder="Enter city"
      value={formData.city}
      onChange={handleChange}
    />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Select
      label="State"
      name="state"
      options={[{ value: "", label: "-- Select State --" }, ...STATES.map(s => ({ value: s, label: s }))]}
      value={formData.state}
      onChange={handleChange}
    />

    <Input
      label="ZIP Code"
      name="zipCode"
      placeholder="12345"
      value={formData.zipCode}
      onChange={handleChange}
    />

    <Input
      label="Country"
      name="country"
      value={formData.country}
      onChange={handleChange}
    />
  </div>
</section>
         

        {/* Tax Information */}

  <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <h3 className="text-lg font-semibold mb-6 pb-2">
      Tax Information
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <Select
        label="Tax Identity Type"
        name="taxIdentityType"
        options={[
          { value: "", label: "-- Select Type --" },
          { value: "SSN", label: "SSN" },
          { value: "EIN", label: "EIN" },
          { value: "TID", label: "Taxpayer ID" }
        ]}
        value={formData.taxIdentityType}
        onChange={handleChange}
      />

      <Input
        label="Taxpayer ID"
        name="taxpayerId"
        placeholder="Enter Tax ID"
        value={formData.taxpayerId}
        onChange={handleChange}
      />
  
    </div>
  </section>
   
{/* Insurance Details */}
<section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
  <h3 className="text-lg font-semibold mb-6 pb-2">
    Insurance Details
  </h3>

 
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <Input
      label="Insurance Provider"
      name="insuranceProvider"
      placeholder="Enter insurance provider"
      value={formData.insuranceProvider}
      onChange={handleChange}
    />

    <Input
      label="Policy Number"
      name="policyNumber"
      placeholder="Enter policy number"
      value={formData.policyNumber}
      onChange={handleChange}
    />
  </div>

 
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Input
      label="Expiration Date"
      type="date"
      name="expirationDate"
      value={formData.expirationDate}
      onChange={handleChange}
    />

    
    <div />
  </div>
  
</section>

{/* Additional Notes */}
<section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
  <h3 className="text-lg font-semibold mb-6 pb-2">
    Additional Notes
  </h3>

  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">
      Comments
    </label>

    <textarea
      name="comments"
      rows="4"
      placeholder="Add any additional information or notes..."
      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-blue-900 outline-none"
      value={formData.comments}
      onChange={handleChange}
    />
  </div>
</section>

        <div className="flex justify-end gap-4 pb-10">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading} className="px-10">
            <Save size={18} className="mr-2" /> Save Vendor
          </Button>
        </div>
      </form>
    </div>
  );
}