
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, Trash2, Upload, X, FileText } from "lucide-react";
import dayjs from "dayjs";

// UI Components
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

// APIs
import { 
  createBill, 
  updateBill, 
  getBillById, 
  getCoaList, 
  getVendors,
  uploadBillAttachment,
} from "../api/accountingApi";
import { getAssociations } from "@/modules/associations/associationApi";
import { createVendor } from "@/modules/maintenance/api/maintenanceApi";

export default function CreateBillPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [rawVendors, setRawVendors] = useState([]);
  const [associationOptions, setAssociationOptions] = useState([]);
  const [coaOptions, setCoaOptions] = useState([]);

  // Inline Quick Add Vendor state (FE-11)
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    category: "Maintenance",
    primaryEmail: "",
    isCompany: true,
  });
  const [savingVendor, setSavingVendor] = useState(false);

  const [formData, setFormData] = useState({
    vendorId: "",
    associationId: "",
    billNumber: "", 
    issueDate: dayjs().format("YYYY-MM-DD"),
    dueDate: "",
    memo: "",
    lineItems: [{ description: "", expenseAccountId: "", amount: 0 }],
  });

  const [attachments, setAttachments] = useState([]);

  const loadVendorsList = async () => {
    const vRes = await getVendors();
    const vendorList = vRes.data?.data || vRes.data?.content || (Array.isArray(vRes.data) ? vRes.data : []);
    setRawVendors(vendorList);
    setVendorOptions(vendorList.map(v => {
      const displayName = v.firstName && v.lastName 
        ? `${v.firstName} ${v.lastName}` 
        : "No Contact";

      return { 
        value: String(v.id), 
        label: v.companyName 
          ? `${v.companyName} (${displayName})` 
          : displayName
      };
    }));
    return vendorList;
  };

  // Load dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [, aRes, cRes] = await Promise.all([
          loadVendorsList(),
          getAssociations(),
          getCoaList("", "", 0, 100)
        ]);

        const associationList = aRes.data?.data || aRes.data?.content || []; 
        setAssociationOptions(associationList.map(a => ({ value: String(a.id), label: a.name })));

        // FE-10: Expense Account dropdown must show EXPENSES only
        const coaList = cRes.data?.content || cRes.data?.data || (Array.isArray(cRes.data) ? cRes.data : []);
        const expenseAccounts = coaList.filter(c => {
          const typeStr = (c.accountType || c.type || c.category || "").toUpperCase();
          return typeStr === "EXPENSES" || typeStr === "EXPENSE";
        });
        const optionsToUse = expenseAccounts.length > 0 ? expenseAccounts : coaList;
        setCoaOptions(optionsToUse.map(c => ({ 
          value: String(c.id), 
          label: `${c.accountCode ? c.accountCode + " - " : ""}${c.accountName}` 
        })));
      } catch {
        toast.error("Error loading form dependencies");
      }
    };
    fetchDropdownData();
  }, [isEdit]);

  // FE-08: Auto-fill Expense Account on vendor select
  const handleVendorSelect = (selectedVendorId) => {
    setFormData(prev => {
      const selectedVendor = rawVendors.find(v => String(v.id) === String(selectedVendorId));
      const savedExpenseId = typeof window !== "undefined" ? localStorage.getItem(`vendor_expense_account_${selectedVendorId}`) : null;

      const defaultCoaId = selectedVendor?.defaultExpenseAccountId || 
                           selectedVendor?.defaultExpenseAccount?.id || 
                           selectedVendor?.expenseAccountId || 
                           savedExpenseId || 
                           (coaOptions.length > 0 ? coaOptions[0]?.value : "");

      let updatedLineItems = [...prev.lineItems];
      if (defaultCoaId && updatedLineItems.length > 0) {
        updatedLineItems[0] = {
          ...updatedLineItems[0],
          expenseAccountId: String(defaultCoaId)
        };
      }
      return {
        ...prev,
        vendorId: selectedVendorId,
        lineItems: updatedLineItems
      };
    });
  };

  // FE-11: Quick Add Vendor Handler
  const handleCreateQuickVendor = async (e) => {
    e.preventDefault();
    if (vendorForm.isCompany && !vendorForm.companyName.trim()) {
      return toast.error("Company Name is required for company vendor");
    }
    if (!vendorForm.isCompany && (!vendorForm.firstName.trim() || !vendorForm.lastName.trim())) {
      return toast.error("First Name & Last Name are required for individual vendor");
    }

    try {
      setSavingVendor(true);
      const payload = {
        isCompany: vendorForm.isCompany,
        companyName: vendorForm.isCompany ? vendorForm.companyName.trim() : (vendorForm.companyName?.trim() || null),
        firstName: vendorForm.firstName?.trim() || null,
        lastName: vendorForm.lastName?.trim() || null,
        serviceCategory: vendorForm.category || "Maintenance",
        defaultExpenseAccountId: vendorForm.defaultExpenseAccountId ? Number(vendorForm.defaultExpenseAccountId) : null,
        email: vendorForm.primaryEmail?.trim() || `vendor-${Date.now()}@example.com`,
        street: "N/A",
        city: "N/A",
        state: "CA",
        zipCode: "00000",
        status: "ACTIVE"
      };

      const res = await createVendor(payload);
      const newVendor = res.data?.data || res.data;
      toast.success("Vendor created successfully!");

      const updatedList = await loadVendorsList();
      const newId = String(newVendor.id || updatedList[updatedList.length - 1]?.id || "");
      if (newId) {
        if (vendorForm.defaultExpenseAccountId) {
          localStorage.setItem(`vendor_expense_account_${newId}`, String(vendorForm.defaultExpenseAccountId));
        }
        handleVendorSelect(newId);
      }

      setShowAddVendorModal(false);
      setVendorForm({
        firstName: "", lastName: "", companyName: "", category: "Maintenance", defaultExpenseAccountId: "", primaryEmail: "", isCompany: true
      });
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to create vendor");
    } finally {
      setSavingVendor(false);
    }
  };

  // Load Bill for Edit
  useEffect(() => {
    if (!isEdit) return;
    const fetchBillDetail = async () => {
      try {
        setLoading(true);
        const res = await getBillById(id);
        const bill = res.data?.data || res.data; 

        console.log("EDIT BILL RESPONSE:", bill);
        
        setFormData({
          vendorId: String(bill.vendorId || ""),
          associationId: String(bill.associationId || ""),
          billNumber: bill.billNumber || "",
          issueDate: bill.issueDate?.split("T")[0] || "",
          dueDate: bill.dueDate?.split("T")[0] || "",
          memo: bill.memo || "",
          lineItems: bill.lineItems || [{ description: "", expenseAccountId: "", amount: 0 }],
        });
      } catch {
        toast.error("Failed to load bill");
        navigate("/dashboard/accounting/bills");
      } finally {
        setLoading(false);
      }
    };
    fetchBillDetail();
  }, [id, isEdit, navigate]);

  const _totalAmount = formData.lineItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  
  const handleLineChange = (index, field, value) => {
    const updated = [...formData.lineItems];
    updated[index][field] = value;
    setFormData(p => ({ ...p, lineItems: updated }));
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 5) return toast.error("Max 5 files allowed");
    setAttachments(prev => [...prev, ...files]);
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  //validation
  for (const item of formData.lineItems) {
    const amt = Number(item.amount);

    if (isNaN(amt)) {
      toast.error("Invalid amount");
      return;
    }

    if (amt < 0) {
      toast.error("Amount cannot be negative");
      return;
    }

    if (amt === 0) {
      toast.error("Amount cannot be zero");
      return;
    }
  }
   setLoading(true);
   try {
    const payload = {
      vendorId: Number(formData.vendorId),
      associationId: Number(formData.associationId),
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      memo: formData.memo || "",
   
      lineItems: formData.lineItems.map(item => ({
        description: item.description,
        expenseAccountId: Number(item.expenseAccountId),
        amount: Number(item.amount)
      }))
    };

    console.log("Sending Payload:", payload); 

    let response;
    if (isEdit) {
      response = await updateBill(id, payload);
      toast.success("Bill updated successfully");
    } else {
      response = await createBill(payload);
      toast.success("Bill created successfully");
    }

  
    const newBillId = isEdit ? id : response.data?.id;
    
    if (attachments.length > 0 && newBillId) {
      for (const file of attachments) {
        try {
          await uploadBillAttachment(newBillId, file);
        } catch (attachErr) {
          console.error("Failed to upload attachment:", file.name, attachErr);
          toast.error(`Failed to upload file ${file.name}`);
        }
      }
    }

    navigate("/dashboard/accounting/bills");
  } catch (err) {
    console.error("Submission Error:", err.response?.data);
    toast.error(err.response?.data?.message || "Operation failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Bill" : "Create Bill"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Vendor <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(true)}
                  className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-0.5"
                >
                  <Plus size={12} /> Add Vendor
                </button>
              </div>
              <Select
                name="vendorId"
                required
                options={[
                  { value: "", label: "-- Select Vendor --" },
                  { value: "__ADD_NEW__", label: "+ Add New Vendor..." },
                  ...vendorOptions
                ]}
                value={formData.vendorId}
                onChange={(e) => {
                  if (e.target.value === "__ADD_NEW__") {
                    setShowAddVendorModal(true);
                  } else {
                    handleVendorSelect(e.target.value);
                  }
                }}
              />
            </div>
            <Select
              label="Association"
              name="associationId"
              required
              options={associationOptions}
              value={formData.associationId}
              onChange={(e) => setFormData(p => ({...p, associationId: e.target.value}))}
            />
            <Input
              label="Bill Number"
              name="billNumber"
              required
             value={isEdit ? formData.billNumber : "Auto-Generated"}
              disabled
            />
            <Input label="Issue Date" name="issueDate" type="date" required value={formData.issueDate} onChange={handleInputChange} />
            <Input label="Due Date" name="dueDate" type="date" required value={formData.dueDate} onChange={handleInputChange} />
          </div>

          {/* Line Items Table */}
          <div className="border border-gray-200 rounded-xl overflow-visible mb-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase">Description</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase w-64">Expense Account</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase text-right w-40">Amount</th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formData.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-3">
                      <input
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-900 outline-none"
                        placeholder="Description of expense"
                        value={item.description}
                        onChange={(e) => handleLineChange(index, "description", e.target.value)}
                        required
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        options={[{ value: "", label: "-- Expense Account --" }, ...coaOptions]}
                        value={String(item.expenseAccountId)}
                        onChange={(e) => handleLineChange(index, "expenseAccountId", e.target.value)}
                        required
                      />
                    </td>
                   
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full p-2 text-sm border border-gray-300 rounded text-right focus:ring-1 focus:ring-blue-900 outline-none"
                        value={item.amount}
                        onChange={(e) => handleLineChange(index, "amount", e.target.value)}
                        required
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => setFormData(p => ({ ...p, lineItems: p.lineItems.filter((_, i) => i !== index) }))}
                        disabled={formData.lineItems.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-gray-50/50">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setFormData(p => ({ ...p, lineItems: [...p.lineItems, { description: "", expenseAccountId: "", amount: 0 }] }))}
              >
                <Plus size={16} className="mr-2" /> Add Line Item
              </Button>
            </div>
          </div>

          {/* Notes & Attachments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Memo / Internal Notes</label>
              <textarea
                name="memo"
                rows="4"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-1 focus:ring-blue-900 outline-none"
                placeholder="Add any additional details here..."
                value={formData.memo}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Attachments</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition relative">
                <input 
                  type="file" multiple 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={onFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <Upload className="text-blue-900 mb-2" size={24} />
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
              </div>

              <div className="mt-4 space-y-2">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 px-3 shadow-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={16} className="text-blue-700 shrink-0" />
                      <span className="text-xs text-gray-600 truncate">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}>
                      <X size={14} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
            <Button variant="outline" onClick={() => navigate("/dashboard/accounting/bills")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="min-w-140px" loading={loading}>
              {isEdit ? "Update Bill" : "Create Bill"}
            </Button>
          </div>
        </Card>
      </form>

      {/* FE-11 Inline Quick Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-xl border-none">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-900">Add New Vendor</h3>
              <button onClick={() => setShowAddVendorModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateQuickVendor} className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="isCompanyQuick"
                  checked={vendorForm.isCompany}
                  onChange={(e) => setVendorForm(p => ({ ...p, isCompany: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                />
                <label htmlFor="isCompanyQuick" className="text-sm font-semibold text-gray-700">
                  This vendor is a Company
                </label>
              </div>

              {vendorForm.isCompany ? (
                <Input
                  label="Company Name"
                  required
                  value={vendorForm.companyName}
                  onChange={(e) => setVendorForm(p => ({ ...p, companyName: e.target.value }))}
                  placeholder="Enter company name"
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    required
                    value={vendorForm.firstName}
                    onChange={(e) => setVendorForm(p => ({ ...p, firstName: e.target.value }))}
                    placeholder="First name"
                  />
                  <Input
                    label="Last Name"
                    required
                    value={vendorForm.lastName}
                    onChange={(e) => setVendorForm(p => ({ ...p, lastName: e.target.value }))}
                    placeholder="Last name"
                  />
                </div>
              )}

              <Input
                label="Primary Email"
                type="email"
                value={vendorForm.primaryEmail}
                onChange={(e) => setVendorForm(p => ({ ...p, primaryEmail: e.target.value }))}
                placeholder="vendor@example.com"
              />

              <div className="p-4 bg-gray-50 flex gap-3 justify-end rounded-b-xl border-t mt-6">
                <Button variant="outline" type="button" onClick={() => setShowAddVendorModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={savingVendor}>
                  Save Vendor
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
