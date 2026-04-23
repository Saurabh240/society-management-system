
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

} from "../api/accountingApi";
import { getAssociations } from "@/modules/associations/associationApi";

export default function CreateBillPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [associationOptions, setAssociationOptions] = useState([]);
  const [coaOptions, setCoaOptions] = useState([]);

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

  // Load dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [vRes, aRes, cRes] = await Promise.all([
          getVendors(),
          getAssociations(),
          getCoaList("", "", 0, 100)
        ]);

        const associationList = aRes.data?.data || aRes.data?.content || []; 
        setAssociationOptions(associationList.map(a => ({ value: String(a.id), label: a.name })));

        const vendorList = vRes.data?.data || vRes.data?.content || (Array.isArray(vRes.data) ? vRes.data : []);
        setVendorOptions(vendorList.map(v => ({ 
          value: String(v.id), 
          label: `${v.companyName} (${v.contactName})` 
        })));

        const coaList = cRes.data?.content || cRes.data?.data || (Array.isArray(cRes.data) ? cRes.data : []);
        setCoaOptions(coaList.map(c => ({ value: String(c.id), label: `${c.accountCode} - ${c.accountName}` })));

        if (!isEdit) {
          setFormData(prev => ({ ...prev, billNumber: `BILL-${Math.floor(100000 + Math.random() * 900000)}` }));
        }
      } catch (err) {
        toast.error("Error loading form dependencies");
      }
    };
    fetchDropdownData();
  }, [isEdit]);

  // Load Bill for Edit
  useEffect(() => {
    if (!isEdit) return;
    const fetchBillDetail = async () => {
      try {
        setLoading(true);
        const res = await getBillById(id);
        const bill = res.data?.data || res.data; 
        setFormData({
          vendorId: String(bill.vendorId || ""),
          associationId: String(bill.associationId || ""),
          billNumber: bill.billNumber || "",
          issueDate: bill.issueDate?.split("T")[0] || "",
          dueDate: bill.dueDate?.split("T")[0] || "",
          memo: bill.memo || "",
          lineItems: bill.lineItems || [{ description: "", expenseAccountId: "", amount: 0 }],
        });
      } catch (err) {
        toast.error("Failed to load bill");
        navigate("/dashboard/accounting/bills");
      } finally {
        setLoading(false);
      }
    };
    fetchBillDetail();
  }, [id, isEdit, navigate]);

  const totalAmount = formData.lineItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

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
  setLoading(true);

  try {

    const payload = {
      billNumber: formData.billNumber,
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
    
      console.log("Ready to upload to bill ID:", newBillId);
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
            <Select
              label="Vendor"
              name="vendorId"
              required
              options={vendorOptions}
              value={formData.vendorId}
              onChange={(e) => setFormData(p => ({...p, vendorId: e.target.value}))}
            />
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
              value={formData.billNumber}
              onChange={handleInputChange}
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
                        options={coaOptions}
                        value={String(item.expenseAccountId)}
                        onChange={(e) => handleLineChange(index, "expenseAccountId", e.target.value)}
                        required
                      />
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        step="0.01"
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
    </div>
  );
}
