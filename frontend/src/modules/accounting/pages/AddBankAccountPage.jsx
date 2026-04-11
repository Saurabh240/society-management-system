import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { createBankAccount, updateBankAccount } from "../accountingApi";
import { getAssociations } from "../../associations/associationApi";

const ACCOUNT_TYPES = [
  { value: "CHECKING",     label: "Checking"      },
  { value: "SAVINGS",      label: "Savings"       },
  { value: "MONEY_MARKET", label: "Money Market"  },
];

const inputCls  = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const selectCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls  = "block text-sm font-medium text-gray-700 mb-1";

const SectionCard = ({ title, children, right }) => (
  <div className="bg-white border border-gray-200 rounded-xl mb-5 overflow-hidden shadow-sm">
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</p>
      {right}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export default function AddBankAccountPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { state }   = useLocation();
  const isEdit      = !!id;

  const [associations, setAssociations] = useState([]);
  const [submitting,   setSubmitting]   = useState(false);

  const [form, setForm] = useState({
    associationId:         "",
    bankAccountName:       "",
    accountType:           "CHECKING",
    country:               "United States",
    routingNumber:         "",
    accountNumber:         "",
    confirmAccountNumber:  "",
    accountNotes:          "",
    checkPrintingEnabled:  false,
    balance:               "",
  });

  // Load associations
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAssociations();
        setAssociations(res.data.data || res.data || []);
      } catch {
        toast.error("Failed to load associations");
      }
    };
    load();
  }, []);

  // Pre-fill from route state if editing
  useEffect(() => {
    if (isEdit && state?.account) {
      const a = state.account;
      setForm({
        associationId:        String(a.associationId  || ""),
        bankAccountName:      a.bankAccountName       || "",
        accountType:          a.accountType           || "CHECKING",
        country:              a.country               || "United States",
        routingNumber:        a.routingNumber         || "",
        accountNumber:        "",   // never pre-fill — masked on server
        confirmAccountNumber: "",
        accountNotes:         a.accountNotes          || "",
        checkPrintingEnabled: a.checkPrintingEnabled  || false,
        balance:              a.balance != null ? String(a.balance) : "",
      });
    }
  }, [id, state, isEdit]);

  const set = (key) => (e) =>
    setForm((p) => ({
      ...p,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    if (!form.associationId)   { toast.error("Association is required"); return false; }
    if (!form.bankAccountName.trim()) { toast.error("Bank account name is required"); return false; }
    if (!form.accountType)     { toast.error("Account type is required"); return false; }
    if (!/^\d{9}$/.test(form.routingNumber)) {
      toast.error("Routing number must be exactly 9 digits"); return false;
    }
    if (!isEdit || form.accountNumber) {
      // On create, account number is always required
      // On edit, only validate if a new number is entered
      if (!isEdit && !form.accountNumber.trim()) {
        toast.error("Account number is required"); return false;
      }
      if (form.accountNumber && form.accountNumber !== form.confirmAccountNumber) {
        toast.error("Account numbers do not match"); return false;
      }
    }
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        associationId:        Number(form.associationId),
        bankAccountName:      form.bankAccountName.trim(),
        accountType:          form.accountType,
        country:              form.country.trim() || "United States",
        routingNumber:        form.routingNumber,
        accountNotes:         form.accountNotes.trim() || null,
        checkPrintingEnabled: form.checkPrintingEnabled,
        balance:              form.balance ? parseFloat(form.balance) : 0,
      };

      // Only include accountNumber if provided (required on create, optional on edit)
      if (form.accountNumber.trim()) {
        payload.accountNumber = form.accountNumber.trim();
      }

      if (isEdit) {
        await updateBankAccount(id, payload);
        toast.success("Bank account updated successfully");
      } else {
        await createBankAccount(payload);
        toast.success("Bank account added successfully");
      }

      navigate("/dashboard/accounting/banking");
    } catch (err) {
      const msg = err.response?.data?.error
               || err.response?.data?.message
               || "Failed to save bank account";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">

      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard/accounting/banking")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Banking
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEdit ? "Edit Bank Account" : "Add Bank Account"}
      </h1>

      <form onSubmit={handleSubmit}>

        {/* Section 1 — Bank Account Information */}
        <SectionCard title="Bank Account Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className={labelCls}>Association <span className="text-red-500">*</span></label>
              <select value={form.associationId} onChange={set("associationId")} required className={selectCls}>
                <option value="">Select Association</option>
                {associations.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Bank Account Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.bankAccountName}
                onChange={set("bankAccountName")}
                placeholder="e.g., Operating Account, Reserve Account"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Account Type <span className="text-red-500">*</span></label>
              <select value={form.accountType} onChange={set("accountType")} required className={selectCls}>
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Country <span className="text-red-500">*</span></label>
              <select value={form.country} onChange={set("country")} className={selectCls}>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Routing Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.routingNumber}
                onChange={set("routingNumber")}
                placeholder="9 digits"
                maxLength={9}
                pattern="\d{9}"
                required
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">Must be exactly 9 digits</p>
            </div>

            <div>
              <label className={labelCls}>
                Account Number <span className="text-red-500">*</span>
                {isEdit && <span className="text-gray-400 font-normal ml-1">(leave blank to keep existing)</span>}
              </label>
              <input
                type="password"
                value={form.accountNumber}
                onChange={set("accountNumber")}
                placeholder={isEdit ? "Enter new account number or leave blank" : "Account Number"}
                required={!isEdit}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Confirm Account Number
                {!isEdit && <span className="text-red-500"> *</span>}
              </label>
              <input
                type="password"
                value={form.confirmAccountNumber}
                onChange={set("confirmAccountNumber")}
                placeholder="Re-enter Account Number"
                required={!isEdit}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Current Balance</label>
              <input
                type="number"
                value={form.balance}
                onChange={set("balance")}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Account Notes</label>
              <textarea
                value={form.accountNotes}
                onChange={set("accountNotes")}
                placeholder="Enter any additional notes about this account..."
                rows={3}
                className={`${inputCls} resize-y`}
              />
            </div>
          </div>
        </SectionCard>

        {/* Section 2 — Check Printing Setup */}
        <SectionCard
          title="Check Printing Setup"
          right={
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.checkPrintingEnabled}
                onChange={set("checkPrintingEnabled")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">Enable Check Printing</span>
            </label>
          }
        >
          <p className="text-sm text-gray-500">
            {form.checkPrintingEnabled
              ? "Check printing is enabled for this account."
              : "Check printing is disabled. Enable it above to print checks from this account."}
          </p>
        </SectionCard>

        {/* Form actions */}
        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Update Bank Account" : "Add Bank Account"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/accounting/banking")}
            className="px-5 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
