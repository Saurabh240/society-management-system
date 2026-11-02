export const VENDOR_CATEGORIES = [
  "Landscaping", "Plumbing", "Electrical", "HVAC", "Cleaning",
  "Security", "Maintenance", "Construction", "Legal", "Accounting", "Insurance", "Other"
];

export const EMPTY_VENDOR_FORM = {
  isCompany: true, firstName: "", lastName: "", companyName: "", category: "",
  defaultExpenseAccountId: "", primaryEmail: "", altEmail: "", mobilePhone: "",
  workPhone: "", homePhone: "", website: "", street: "", city: "", state: "",
  zipCode: "", country: "United States", taxIdentityType: "", taxPayerId: "",
  insuranceProvider: "", policyNumber: "", insuranceExpiry: "", notes: ""
};

export function vendorToForm(data) {
  return {
    isCompany: data.isCompany !== undefined ? Boolean(data.isCompany) : Boolean(data.companyName),
    firstName: data.firstName || "", lastName: data.lastName || "", companyName: data.companyName || "",
    category: data.serviceCategory || "",
    defaultExpenseAccountId: data.defaultExpenseAccountId ? String(data.defaultExpenseAccountId) : "",
    primaryEmail: data.email || "", altEmail: data.altEmail || "",
    mobilePhone: data.mobilePhone || "", workPhone: data.workPhone || "", homePhone: data.homePhone || "",
    website: data.website || "", street: data.street || "", city: data.city || "", state: data.state || "",
    zipCode: data.zipCode || "", country: data.country || "United States",
    taxIdentityType: data.taxIdentityType || "", taxPayerId: data.taxPayerId || "",
    insuranceProvider: data.insuranceProvider || "", policyNumber: data.policyNumber || "",
    insuranceExpiry: data.insuranceExpiry || "", notes: data.notes || ""
  };
}

