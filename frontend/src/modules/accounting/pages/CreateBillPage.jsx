import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, Trash2, Upload, X, FileText } from "lucide-react";

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
  getVendors 
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
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    memo: "",
    lineItems: [{ description: "", expenseAccountId: "", amount: 0 }],
  });

  const [attachments, setAttachments] = useState([]);

 const handleSelectChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

  //  dropdown data loading 
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [vRes, aRes, cRes] = await Promise.all([
          getVendors(),
          getAssociations(),
          getCoaList("", "", 0, 100)
        ]);

        // Debug: log raw responses to verify shape
        console.log("Vendors raw:", vRes.data);
        console.log("Associations raw:", aRes.data);
        console.log("CoA raw:", cRes.data);

        // Associations 
        const associationList = aRes.data?.data || aRes.data?.content || []; 
        setAssociationOptions(associationList.map(a => ({ 
          value: String(a.id), 
          label: a.name 
        })));

        // Vendors 
        const vendorList = vRes.data?.data || vRes.data?.content || (Array.isArray(vRes.data) ? vRes.data : []);
        setVendorOptions(vendorList.map(v => ({ value: String(v.id), label: v.vendorName || v.name })));

        // CoA 
        const coaList = cRes.data?.content || cRes.data?.data || (Array.isArray(cRes.data) ? cRes.data : []);
        setCoaOptions(coaList.map(c => ({ value: String(c.id), label: `${c.accountCode} - ${c.accountName}` })));

       

        if (!isEdit) {
          setFormData(prev => ({ ...prev, billNumber: `BILL-${Math.floor(100000 + Math.random() * 900000)}` }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading form dependencies");
      }
    };

    fetchDropdownData();
  }, [isEdit]);

  // Load Bill for Edit Mode
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

    const data = new FormData();
    data.append("vendorId", formData.vendorId);
    data.append("associationId", formData.associationId);
    data.append("billNumber", formData.billNumber);
    data.append("issueDate", formData.issueDate);
    data.append("dueDate", formData.dueDate);
    data.append("memo", formData.memo);
    data.append("totalAmount", totalAmount);
    data.append("lineItems", JSON.stringify(formData.lineItems));
    
    attachments.forEach(file => data.append("attachments", file));

    try {
      if (isEdit) {
        await updateBill(id, data);
        toast.success("Bill updated");
      } else {
        await createBill(data);
        toast.success("Bill created");
      }
      navigate("/dashboard/accounting/bills");
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEdit ? "Edit Bill" : "Create Bill"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-8">
          {/* Header Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <Select
              label="Vendor"
              name="vendorId"
              required
              options={vendorOptions}
              value={formData.vendorId}
           onChange={handleSelectChange}
            />

            <Select
              label="Association"
              name="associationId"
              required
              options={associationOptions}
              value={formData.associationId}
             onChange={handleSelectChange}
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
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expense Account</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formData.lineItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition">
                    <td className="p-3">
                      <input
                        className="w-full p-2 text-sm bg-transparent border border-gray-300 
                 focus:border-blue-900 focus:ring-2 focus:ring-blue-900
                 focus:bg-white rounded outline-none transition"
                        placeholder="What is this for?"
                        value={item.description}
                        onChange={(e) => handleLineChange(index, "description", e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        name={`expense-${index}`}
                        options={coaOptions}
                        value={String(item.expenseAccountId)}
                        onChange={(e) =>
                    handleLineChange(index, "expenseAccountId", e.target.value)
                         }
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full p-2 text-sm bg-transparent border border-gray-300 
                 focus:border-blue-900 focus:ring-2 focus:ring-blue-900
                 focus:bg-white rounded outline-none transition"
                        value={item.amount}
                        onChange={(e) => handleLineChange(index, "amount", e.target.value)}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => setFormData(p => ({ ...p, lineItems: p.lineItems.filter((_, i) => i !== index) }))}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-gray-50/50 flex justify-between items-center border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setFormData(p => ({ ...p, lineItems: [...p.lineItems, { description: "", expenseAccountId: "", amount: 0 }] }))}
              >
                <Plus size={16} className="mr-2" /> Add Line
              </Button>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-900">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Memo / Notes</label>
              <textarea
                name="memo"
                rows="5"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-1 focus:ring-blue-900 outline-none transition"
                value={formData.memo}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Up to 5)</label>
              <div className="relative group border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                <input 
                  type="file" 
                  multiple 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={onFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <Upload className="text-blue-900 mb-2" size={24} />
                <p className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
              </div>

              {/* Uploaded Files List */}
              <div className="mt-4 space-y-2">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-lg p-2 px-4">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-blue-900" />
                      <span className="text-sm font-medium text-gray-700 truncate max-w-250px">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}>
                      <X size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-12 pt-8">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard/accounting/bills")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="px-12" loading={loading}>
              {isEdit ? "Update Bill" : "Save Bill"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

