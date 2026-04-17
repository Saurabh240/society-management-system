import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { createBankAccount, updateBankAccount, getBankAccountById } from "../api/accountingApi";
import { getAssociations } from "@/modules/associations/associationApi";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

//  Constants 
const ACCOUNT_TYPE_OPTIONS = [
  { value: "CHECKING", label: "Checking" },
  { value: "SAVINGS",  label: "Savings"  },
  
];

const COUNTRY_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada"        },
  { value: "GB", label: "United Kingdom"},
];

const CHECK_STYLE_OPTIONS = [
  { value: "STANDARD_TOP", label: "Standard (Top)"  },
  { value: "MIDDLE",       label: "Middle"          },
  { value: "BOTTOM",       label: "Bottom"          },
  { value: "VOUCHER",      label: "Voucher (3-Part)" },
];

// Main Page 
export default function AddBankingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
 
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading]           = useState(false);

  const [form, setForm] = useState({
    associationId:      "",
    name:               "",
    accountType:        "CHECKING",
    country:            "US",
    routingNumber:      "",
    accountNumber:      "",
    confirmAccountNumber: "",
    notes:              "",
    // Check printing
    enableCheckPrinting:      false,
    checkStyle:               "STANDARD_TOP",
    startingCheckNumber:      "1001",
    printAssociationName:     true,
    printAssociationAddress:  true,
    printBankNameAndAddress:  true,
  });

  const [errors, setErrors] = useState({});
 

  // Load associations
  useEffect(() => {
    getAssociations()
      .then((res) => setAssociations(res.data?.data ?? []))
      .catch(() => toast.error("Failed to load associations"));
  }, []);

  // Prefill on edit

  useEffect(() => {
  if (!isEdit) return;

  const fetch = async () => {
    try {
      setLoading(true);

      const res = await getBankAccountById(id);
      const d = res.data?.data; 

   setForm((prev) => ({
  ...prev,
  associationId: d.associationId ? String(d.associationId) : "",
  name: d.bankAccountName || "",
  accountType: d.accountType || "",
  country: d.country || "",
  routingNumber: d.routingNumber || "",

 
  accountNumber: d.accountNumberMasked || "",
  confirmAccountNumber: "",

 
  notes: d.accountNotes ?? "",


  enableCheckPrinting: d.checkPrintingEnabled ?? false,

  checkStyle: d.checkStyle || "",
  startingCheckNumber: d.startingCheckNumber || "",

  printAssociationName: d.printAssociationName ?? true,
  printAssociationAddress: d.printAssociationAddress ?? true,
  printBankNameAndAddress: d.printBankNameAndAddress ?? true,
}));

    } catch (err) {
      toast.error("Failed to load bank account");
      navigate("/dashboard/accounting/banking");
    } finally {
      setLoading(false);
    }
  };

  fetch();
}, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.associationId)   e.associationId   = "Association is required";
    if (!form.name)            e.name            = "Bank account name is required";
    if (!form.accountType)     e.accountType     = "Account type is required";
    if (!form.country)         e.country         = "Country is required";
    if (!form.routingNumber)   e.routingNumber   = "Routing number is required";
    if (form.routingNumber && form.routingNumber.length !== 9)
                               e.routingNumber   = "Routing number must be 9 digits";
      if (!isEdit ) {
    if (!form.accountNumber) {
      e.accountNumber = "Account number is required";
    }

    if (form.accountNumber !== form.confirmAccountNumber) {
      e.confirmAccountNumber = "Account numbers do not match";
    }
  }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
   
    if (!validate()) return;
    try {
      setLoading(true);
      const payload = {
        associationId:     Number(form.associationId),
        bankAccountName:              form.name,
        accountType:       form.accountType,
        country:           form.country,
        routingNumber:     form.routingNumber,
        accountNumber:     form.accountNumber,
        accountNotes:             form.notes,
        enableCheckPrinting:     form.enableCheckPrinting,
        checkStyle:              form.checkStyle,
        startingCheckNumber:     form.startingCheckNumber,
        printAssociationName:    form.printAssociationName,
        printAssociationAddress: form.printAssociationAddress,
        printBankNameAndAddress: form.printBankNameAndAddress,
      };
      if (isEdit) {
        await updateBankAccount(id, payload);
        toast.success("Bank account updated successfully");
      } else {
        await createBankAccount(payload);
        toast.success("Bank account added successfully");
      }
      navigate("/dashboard/accounting/banking");
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const assocOptions = [
    { value: "", label: "Select Association" },
    ...associations.map((a) => ({ value: String(a.id), label: a.name })),
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEdit ? "Edit Bank Account" : "Add Bank Account"}
      </h2>

      {/* ── Bank Account Information ── */}
      <Card className="mb-4">
        <p className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-4">
          Bank Account Information
        </p>

        {loading && isEdit ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Select
              label="Association"
              name="associationId"
              required
              value={form.associationId}
              onChange={handleChange}
              options={assocOptions}
              error={errors.associationId}
            />

            <Input
              label="Bank Account Name"
              name="name"
              required
              placeholder="e.g., Operating Account, Reserve Account"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Select
              label="Account Type"
              name="accountType"
              required
              value={form.accountType}
              onChange={handleChange}
              options={ACCOUNT_TYPE_OPTIONS}
              error={errors.accountType}
            />

            <Select
              label="Country"
              name="country"
              required
              value={form.country}
              onChange={handleChange}
              options={COUNTRY_OPTIONS}
              error={errors.country}
            />

            <Input
              label="Routing Number"
              name="routingNumber"
              required
              placeholder="9 digits"
              maxLength={9}
              value={form.routingNumber}
              onChange={handleChange}
              error={errors.routingNumber}
            />

            <Input
              label="Account Number"
              name="accountNumber"
              required
              placeholder="Account Number"
              value={form.accountNumber}
              onChange={handleChange}
              error={errors.accountNumber}
            />

            <div className="md:col-span-2">
              <Input
                label="Confirm Account Number"
                name="confirmAccountNumber"
                required
                placeholder="Re-enter Account Number"
                value={form.confirmAccountNumber}
                onChange={handleChange}
                error={errors.confirmAccountNumber}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 text-sm text-(--color-primary)">Account Notes</label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Enter any additional notes about this account..."
                value={form.notes}
                onChange={handleChange}
                className="block w-full px-4 py-2.5 text-base rounded-lg border border-var(--color-primary-light) bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-var(--color-primary) focus:ring-var(--color-primary) resize-none transition-all duration-200"
              />
            </div>

          </div>
        )}
      </Card>

      {/* ── Check Printing Setup ── */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase text-gray-500 tracking-widest">
            Check Printing Setup
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="enableCheckPrinting"
              checked={form.enableCheckPrinting}
              onChange={handleChange}
              className="w-4 h-4 accent-var(--color-primary)"
            />
            <span className="text-sm text-gray-700">Enable Check Printing</span>
          </label>
        </div>

        {form.enableCheckPrinting && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Check Style"
                name="checkStyle"
                value={form.checkStyle}
                onChange={handleChange}
                options={CHECK_STYLE_OPTIONS}
              />
              <Input
                label="Starting Check Number"
                name="startingCheckNumber"
                placeholder="1001"
                value={form.startingCheckNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Print Options</p>
              <div className="space-y-2">
                {[
                  { name: "printAssociationName",    label: "Print Association Name"            },
                  { name: "printAssociationAddress", label: "Print Association Address"         },
                  { name: "printBankNameAndAddress", label: "Print Bank Name and Address on Check" },
                ].map((opt) => (
                  <label key={opt.name} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={opt.name}
                      checked={form[opt.name]}
                      onChange={handleChange}
                      className="w-4 h-4 accent-var(--color-primary)"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Printer setup instructions */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-3">
                Printer Setup Instructions
              </p>
              <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Load check stock into your local printer</li>
                <li>Configure your printer's paper size to match your check stock</li>
                <li>Print a test check to ensure proper alignment</li>
                <li>Adjust margins if needed in your printer settings</li>
              </ol>
            </div>
          </div>
        )}
      </Card>

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
          {isEdit ? "Update Bank Account" : "Add Bank Account"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/dashboard/accounting/banking")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}