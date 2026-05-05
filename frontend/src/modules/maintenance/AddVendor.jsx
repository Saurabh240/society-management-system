import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { 
  createVendor, 
  getVendorById, 
  updateVendor 
} from "@/modules/maintenance/api/maintenanceApi";

const CATEGORIES = [
  "Landscaping", "Plumbing", "Electrical", "HVAC", "Cleaning", 
  "Security", "Maintenance", "Construction", "Legal", "Accounting", "Insurance", "Other"
];

const STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "NY", "TX"];

export default function AddVendorPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", companyName: "", category: "",
    primaryEmail: "", alternativeEmail: "", mobilePhone: "", workPhone: "", 
    homePhone: "", website: "", streetAddress: "", city: "", state: "", 
    zipCode: "", country: "USA", taxIdentityType: "", taxpayerId: "",
    insuranceProvider: "", policyNumber: "", expirationDate: "", comments: ""
  });

  //  Fetch Data for Edit Mode 
  useEffect(() => {
    if (isEditMode) {
      const loadVendor = async () => {
        try {
          const res = await getVendorById(id);
          const data = res.data;
          
         
          const nameParts = (data.contactName || "").split(" ");
          const fName = nameParts[0] || "";
          const lName = nameParts.slice(1).join(" ") || "";

          setFormData({
            firstName: fName,
            lastName: lName,
            companyName: data.companyName || "",
            category: data.serviceCategory || "",
            primaryEmail: data.email || "",
            alternateEmail: data.altEmail || "",
            mobilePhone: data.phone || "",
            workPhone: data.altPhone || "",
            homePhone: data.homePhone || "",
            website: data.website || "",
            streetAddress: data.street || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zipCode || "",
            country: "",
            taxIdentityType: data.taxIdentityType || "",
            taxpayerId: data.taxpayerId || "",
            insuranceProvider: data.insuranceProvider || "",
            policyNumber: data.policyNumber || "",
            expirationDate: data.expirationDate || "",
            comments: data.comments || ""
          });
        } catch (err) {
          toast.error("Failed to load vendor data");
          navigate("/dashboard/maintenance");
        } finally {
          setFetching(false);
        }
      };
      loadVendor();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      companyName: formData.companyName,
      contactName: `${formData.firstName} ${formData.lastName}`.trim(), 
      email: formData.primaryEmail,
      phone: formData.mobilePhone,
      altEmail: formData.alternateEmail,
      altPhone: formData.workPhone,
      street: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      zipCode: formData.zipCode,
      serviceCategory: formData.category,
      status: "ACTIVE" 
    };

    try {
      if (isEditMode) {
        await updateVendor(id, payload);
        toast.success("Vendor updated successfully!");
      } else {
        await createVendor(payload); 
        toast.success("Vendor created successfully!");
      }
      navigate("/dashboard/maintenance");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save vendor");
    } finally {
      setLoading(false);
    }
  };

  // Show a loader if we are still fetching existing data for edit
  if (fetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-900" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} className="mr-1" /> Back to Vendors
      </button>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Vendor" : "Add Vendor"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="First Name" name="firstName" required value={formData.firstName} onChange={handleChange} />
            <Input label="Last Name" name="lastName" required value={formData.lastName} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Company Name" name="companyName" required value={formData.companyName} onChange={handleChange} />
            <Select
              label="Category"
              name="category"
              required
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={formData.category}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Primary Email" type="email" name="primaryEmail" required value={formData.primaryEmail} onChange={handleChange} />
            <Input label="Alternative Email" type="email" name="alternateEmail" value={formData.alternateEmail} onChange={handleChange} />
            <Input label="Mobile Phone" name="mobilePhone" value={formData.mobilePhone} onChange={handleChange} />
            <Input label="Work Phone" name="workPhone" value={formData.workPhone} onChange={handleChange} />
            <Input label="Home Phone" name="homePhone" value={formData.homePhone} onChange={handleChange} />
            <Input label="Website" name="website" placeholder="https://" value={formData.website} onChange={handleChange} />
          </div>
        </section>

        {/* Address Information */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="Street Address" name="streetAddress" value={formData.streetAddress} onChange={handleChange} />
            <Input label="City" name="city" placeholder="Enter city" value={formData.city} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label="State"
              name="state"
              options={[{ value: "", label: "-- Select State --" }, ...STATES.map(s => ({ value: s, label: s }))]}
              value={formData.state}
              onChange={handleChange}
            />
            <Input label="ZIP Code" name="zipCode" placeholder="12345" value={formData.zipCode} onChange={handleChange} />
            <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
          </div>
        </section>

        {/* Tax Information */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Tax Information</h3>
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
            <Input label="Taxpayer ID" name="taxpayerId" placeholder="Enter Tax ID" value={formData.taxpayerId} onChange={handleChange} />
          </div>
        </section>

        {/* Insurance Details */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Insurance Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="Insurance Provider" name="insuranceProvider" placeholder="Enter insurance provider" value={formData.insuranceProvider} onChange={handleChange} />
            <Input label="Policy Number" name="policyNumber" placeholder="Enter policy number" value={formData.policyNumber} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Expiration Date" type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} />
          </div>
        </section>

        {/* Additional Notes */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Additional Notes</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Comments</label>
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
            <Save size={18} className="mr-2" /> {isEditMode ? "Update Vendor" : "Save Vendor"}
          </Button>
        </div>
      </form>
    </div>
  );
}



