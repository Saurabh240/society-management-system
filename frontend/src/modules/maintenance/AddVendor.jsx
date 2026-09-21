import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import StateSelect, { isValidZipCode } from "@/shared/components/StateSelect";
import { 
  createVendor, 
  getVendorById, 
  updateVendor 
} from "@/modules/maintenance/api/maintenanceApi";
import { getCoaList } from "@/modules/accounting/api/accountingApi";

const CATEGORIES = [
  "Landscaping", "Plumbing", "Electrical", "HVAC", "Cleaning", 
  "Security", "Maintenance", "Construction", "Legal", "Accounting", "Insurance", "Other"
];

export default function AddVendorPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  
  const [formData, setFormData] = useState({
    isCompany: true,
    firstName: "", 
    lastName: "", 
    companyName: "", 
    category: "",
    defaultExpenseAccountId: "",
    primaryEmail: "", 
    altEmail: "", 
    mobilePhone: "", 
    workPhone: "", 
    homePhone: "", 
    website: "", 
    street: "", 
    city: "", 
    state: "", 
    zipCode: "", 
    country: "United States", 
    taxIdentityType: "", 
    taxPayerId: "", 
    insuranceProvider: "", 
    policyNumber: "", 
    insuranceExpiry: "", 
    notes: "" 
  });

  // Load Expense Accounts dropdown
  useEffect(() => {
    getCoaList("", "", 0, 100).then(res => {
      const coaList = res.data?.content || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const expenses = coaList.filter(c => 
        (c.accountType && c.accountType.toUpperCase() === "EXPENSES") || 
        (c.type && c.type.toUpperCase() === "EXPENSES")
      );
      setExpenseAccounts(expenses.map(c => ({ value: String(c.id), label: `${c.accountCode} - ${c.accountName}` })));
    }).catch(err => console.error("Failed to load COA accounts", err));
  }, []);

  // Fetch Data for Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const loadVendor = async () => {
        try {
          const res = await getVendorById(id);
          const data = res.data?.data || res.data;
          
          setFormData({
            isCompany: data.isCompany !== undefined ? Boolean(data.isCompany) : Boolean(data.companyName),
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            companyName: data.companyName || "",
            category: data.serviceCategory || "",
            defaultExpenseAccountId: data.defaultExpenseAccountId ? String(data.defaultExpenseAccountId) : "",
            primaryEmail: data.email || "",
            altEmail: data.altEmail || "",
            mobilePhone: data.mobilePhone || "",
            workPhone: data.workPhone || "",
            homePhone: data.homePhone || "",
            website: data.website || "",
            street: data.street || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zipCode || "",
            country: data.country || "United States",
            taxIdentityType: data.taxIdentityType || "",
            taxPayerId: data.taxPayerId || "",
            insuranceProvider: data.insuranceProvider || "",
            policyNumber: data.policyNumber || "",
            insuranceExpiry: data.insuranceExpiry || "",
            notes: data.notes || ""
          });
        } catch {
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
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.isCompany && !formData.companyName) {
      return toast.error("Company Name is required for company vendors");
    }
    if (!formData.isCompany && (!formData.firstName || !formData.lastName)) {
      return toast.error("First Name and Last Name are required for individual vendors");
    }
    if (formData.zipCode && !isValidZipCode(formData.zipCode)) {
      return toast.error("Invalid ZIP code format (e.g. 12345 or 12345-6789)");
    }

    setLoading(true);

    const payload = {
      isCompany: formData.isCompany,
      firstName: formData.firstName.trim() || (formData.companyName.trim() || "Company"),
      lastName: formData.lastName.trim() || "Vendor",
      companyName: formData.companyName.trim() || `${formData.firstName} ${formData.lastName}`.trim() || "Vendor Co",
      serviceCategory: formData.category || "Maintenance",
      defaultExpenseAccountId: formData.defaultExpenseAccountId ? Number(formData.defaultExpenseAccountId) : null,
      email: formData.primaryEmail,
      altEmail: formData.altEmail || null,
      mobilePhone: formData.mobilePhone || null,
      workPhone: formData.workPhone || null,
      homePhone: formData.homePhone || null,
      website: formData.website || null,
      street: formData.street.trim() || "N/A",
      city: formData.city.trim() || "N/A",
      state: formData.state || "CA",
      zipCode: formData.zipCode.trim() || "00000",
      country: formData.country || "United States",
      taxIdentityType: formData.taxIdentityType || null,
      taxPayerId: formData.taxPayerId || null,
      insuranceProvider: formData.insuranceProvider || null,
      policyNumber: formData.policyNumber || null,
      insuranceExpiry: formData.insuranceExpiry || null,
      notes: formData.notes || null,
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
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to save vendor");
    } finally {
      setLoading(false);
    }
  };

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

      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        {isEditMode ? "Edit Vendor" : "Add Vendor"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-2 border-b">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="isCompany"
                checked={formData.isCompany}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-900 focus:ring-blue-900"
              />
              This vendor is a Company
            </label>
          </div>

          {formData.isCompany ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input 
                label="Company Name" 
                name="companyName" 
                required 
                value={formData.companyName} 
                onChange={handleChange}
                placeholder="Enter company name" 
              />
              <Select
                label="Category"
                name="category"
                required
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                value={formData.category}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input 
                label="First Name" 
                name="firstName" 
                required 
                value={formData.firstName} 
                onChange={handleChange} 
                placeholder="Enter first name"
              />
              <Input 
                label="Last Name" 
                name="lastName" 
                required 
                value={formData.lastName} 
                onChange={handleChange} 
                placeholder="Enter last name"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!formData.isCompany && (
              <Input 
                label="Company Name (Optional)" 
                name="companyName" 
                value={formData.companyName} 
                onChange={handleChange} 
                placeholder="Optional company name"
              />
            )}
            {formData.isCompany && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Contact First Name (Optional)" name="firstName" value={formData.firstName} onChange={handleChange} />
                <Input label="Contact Last Name (Optional)" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
            )}
            <Select
              label="Default Expense Account (Optional)"
              name="defaultExpenseAccountId"
              options={[{ value: "", label: "-- Select Default Expense Account --" }, ...expenseAccounts]}
              value={formData.defaultExpenseAccountId}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Primary Email" type="email" name="primaryEmail" required value={formData.primaryEmail} onChange={handleChange} />
            <Input label="Alternative Email" type="email" name="altEmail" value={formData.altEmail} onChange={handleChange} />
            <Input label="Mobile Phone" name="mobilePhone" value={formData.mobilePhone} onChange={handleChange} />
            <Input label="Work Phone" name="workPhone" value={formData.workPhone} onChange={handleChange} />
            <Input label="Home Phone" name="homePhone" value={formData.homePhone} onChange={handleChange} />
            <Input label="Website" name="website" placeholder="www.example.com" value={formData.website} onChange={handleChange} />
          </div>
        </section>

        {/* Address Information (FE-03, FE-09) */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="Street Address" name="street" required value={formData.street} onChange={handleChange} placeholder="Enter street address" />
            <Input label="City" name="city" required value={formData.city} onChange={handleChange} placeholder="Enter city" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StateSelect
              label="State"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
            />
            <Input label="ZIP Code" name="zipCode" required value={formData.zipCode} onChange={handleChange} placeholder="e.g. 12345 or 12345-6789" />
            <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
          </div>
        </section>

        {/* Tax Info */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Tax Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Tax Identity Type"
              name="taxIdentityType"
              options={[
                { value: "", label: "-- Select Type --" },
                { value: "EIN", label: "EIN" },
                { value: "SSN", label: "SSN" },
                { value: "TID", label: "Taxpayer ID" }
              ]}
              value={formData.taxIdentityType}
              onChange={handleChange}
            />
            <Input label="Taxpayer ID" name="taxPayerId" value={formData.taxPayerId} onChange={handleChange} placeholder="XX-XXXXXXX" />
          </div>
        </section>

        {/* Insurance */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Insurance Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="Insurance Provider" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} />
            <Input label="Policy Number" name="policyNumber" value={formData.policyNumber} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Expiration Date" type="date" name="insuranceExpiry" value={formData.insuranceExpiry} onChange={handleChange} />
          </div>
        </section>

        {/* Notes */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 pb-2">Additional Notes</h3>
          <textarea
            name="notes"
            rows="4"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-blue-900 outline-none"
            value={formData.notes}
            onChange={handleChange}
          />
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



