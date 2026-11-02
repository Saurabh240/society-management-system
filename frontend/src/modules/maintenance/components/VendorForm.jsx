import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Save } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import StateSelect, { isValidZipCode } from "@/shared/components/StateSelect";
import { getCoaList } from "@/modules/accounting/api/accountingApi";

import { VENDOR_CATEGORIES, EMPTY_VENDOR_FORM } from "./vendorFormUtils";

const CATEGORIES = VENDOR_CATEGORIES;

/**
 * Shared vendor form (used by the Add/Edit Vendor page and the Create Bill popup).
 * onSubmit(payload, formData) must return a promise; the form shows its own loading state.
 */
export default function VendorForm({ initialData, onSubmit, onCancel, submitLabel = "Save Vendor", compact = false }) {
  const [loading, setLoading] = useState(false);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [formData, setFormData] = useState(initialData || EMPTY_VENDOR_FORM);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (formData.isCompany && !formData.companyName.trim()) {
      return toast.error("Company Name is required for company vendors");
    }
    if (!formData.isCompany && (!formData.firstName.trim() || !formData.lastName.trim())) {
      return toast.error("First Name and Last Name are required for individual vendors");
    }
    if (!formData.street.trim()) return toast.error("Street Address is required");
    if (!formData.city.trim()) return toast.error("City is required");
    if (!formData.state) return toast.error("State is required");
    if (!formData.zipCode.trim()) return toast.error("ZIP Code is required");
    if (!isValidZipCode(formData.zipCode)) {
      return toast.error("Invalid ZIP code format (e.g. 12345 or 12345-6789)");
    }

    const payload = {
      isCompany: formData.isCompany,
      companyName: formData.companyName.trim() || (formData.isCompany ? "Vendor Co" : null),
      firstName: formData.firstName.trim() || null,
      lastName: formData.lastName.trim() || null,
      serviceCategory: formData.category || "Maintenance",
      defaultExpenseAccountId: formData.defaultExpenseAccountId ? Number(formData.defaultExpenseAccountId) : null,
      email: formData.primaryEmail,
      altEmail: formData.altEmail || null,
      mobilePhone: formData.mobilePhone || null,
      workPhone: formData.workPhone || null,
      homePhone: formData.homePhone || null,
      website: formData.website || null,
      street: formData.street.trim(),
      city: formData.city.trim(),
      state: formData.state,
      zipCode: formData.zipCode.trim(),
      country: formData.country || "United States",
      taxIdentityType: formData.taxIdentityType || null,
      taxPayerId: formData.taxPayerId || null,
      insuranceProvider: formData.insuranceProvider || null,
      policyNumber: formData.policyNumber || null,
      insuranceExpiry: formData.insuranceExpiry || null,
      notes: formData.notes || null,
      status: "ACTIVE"
    };

    setLoading(true);
    try {
      await onSubmit(payload, formData);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to save vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
              />
              This vendor is a Company
            </label>
          </div>

          {formData.isCompany ? (
            <>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Contact First Name (Optional)" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" />
                <Input label="Contact Last Name (Optional)" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" />
                <Select
                  label="Default Expense Account (Optional)"
                  name="defaultExpenseAccountId"
                  options={[{ value: "", label: "-- Select Default Expense Account --" }, ...expenseAccounts]}
                  value={formData.defaultExpenseAccountId}
                  onChange={handleChange}
                />
              </div>
            </>
          ) : (
            <>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input 
                  label="Company Name (Optional)" 
                  name="companyName" 
                  value={formData.companyName} 
                  onChange={handleChange} 
                  placeholder="Optional company name"
                />
                <Select
                  label="Category"
                  name="category"
                  required
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                  value={formData.category}
                  onChange={handleChange}
                />
                <Select
                  label="Default Expense Account (Optional)"
                  name="defaultExpenseAccountId"
                  options={[{ value: "", label: "-- Select Default Expense Account --" }, ...expenseAccounts]}
                  value={formData.defaultExpenseAccountId}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
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

      <div className={`flex justify-end gap-4 ${compact ? "pt-2" : "pb-10"}`}>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading} className="px-10">
          <Save size={18} className="mr-2" /> {submitLabel}
        </Button>
      </div>
    </form>
  );
}
