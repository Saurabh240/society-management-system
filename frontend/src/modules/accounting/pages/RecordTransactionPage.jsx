import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";


import { getAssociations } from "@/modules/associations/associationApi";
import { getBankAccountById, getCoaList, createJournalEntry } from "../api/accountingApi";

export default function RecordTransactionPage() {
  const { id } = useParams(); // Bank Account ID from the URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [associations, setAssociations] = useState([]);
  const [coaAccounts, setCoaAccounts] = useState([]);


  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    associationId: "",
    bankAccountDisplay: "", // To show the Name/Number on UI
    bankAccountId: id || "",
    transactionType: "",
    amount: "",
    categoryAccountId: "",
    description: "",
    memo: "",
    attachments: null
  });
  // Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [assocRes, coaRes, bankRes] = await Promise.all([
          getAssociations(),
          getCoaList(),
          getBankAccountById(id),
        ]);

        // Associations
        const assocData = assocRes.data?.data || [];
setAssociations([
  { label: "Select Association", value: "" }, 
  ...assocData.map((a) => ({
    label: a.name,
    value: String(a.id),
  })),
]);

        // COA
        const coaData =
  coaRes.data?.data?.content ||
  coaRes.data?.content ||
  coaRes.data?.data ||
  [];

setCoaAccounts(Array.isArray(coaData) ? coaData : []);

        // Bank
        const bank = bankRes.data?.data;
        if (bank) {
          setForm((prev) => ({
            ...prev,
            associationId: String(bank.associationId),
            bankAccountDisplay: `${bank.bankAccountName} (${bank.accountNumberMasked})`,
          }));
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };



   // Build journal lines (core logic)
 const buildLines = () => {
  const amount = parseFloat(form.amount);

  // Bank account comes from selected bank (backend mapped OR fixed)
  const bankAccountId = Number(form.bankAccountId);

  if (form.transactionType === "DEPOSIT") {
    return [
      {
        accountId: bankAccountId, // Bank
        debit: amount,
        credit: 0,
      },
      {
        accountId: Number(form.categoryAccountId), // Selected
        debit: 0,
        credit: amount,
      },
    ];
  }

  return [
    {
      accountId: Number(form.categoryAccountId),
      debit: amount,
      credit: 0,
    },
    {
      accountId: bankAccountId,
      debit: 0,
      credit: amount,
    },
  ];
};
  const handleSubmit = async () => {
   if (!form.amount || !form.description || !form.categoryAccountId)  {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        associationId: Number(form.associationId),
        date: form.date,
        memo: form.memo || null,
        lines: buildLines(),
      };

      await createJournalEntry(payload);

      toast.success("Transaction recorded successfully");
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record transaction");
    } finally {
      setLoading(false);
    }
  };

   // Filters
  const incomeAccounts = Array.isArray(coaAccounts)
  ? coaAccounts.filter((a) => a.accountType === "INCOME") : [];
  const expenseAccounts =  Array.isArray(coaAccounts)
  ?  coaAccounts.filter((a) => a.accountType === "EXPENSES") : [];
  const assetAccounts = Array.isArray(coaAccounts)
  ?  coaAccounts.filter((a) => a.accountType === "ASSETS") : [];

  const categoryOptions =
    form.transactionType === "DEPOSIT" ? incomeAccounts : expenseAccounts;



  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Record Banking Transaction</h2>

      <Card className="p-8 shadow-sm border-gray-200 bg-white">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Input 
            label="Date" 
            name="date" 
            type="date" 
            required 
            value={form.date} 
            onChange={handleChange} 
          />
          <Select 
            label="Association" 
            name="associationId" 
            required 
            options={associations} 
            value={form.associationId} 
            onChange={handleChange} 
          />
          <Input 
            label="Bank Account" 
            name="bankAccountDisplay" 
            required 
            disabled // Disabled because it's specific to the account we came from
            value={form.bankAccountDisplay} 
            placeholder="Loading account..."
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Select
            label="Transaction Type"
            name="transactionType"
            options={[
              { label: "Deposit", value: "DEPOSIT" },
              { label: "Withdrawal", value: "WITHDRAWAL" },
            ]}
            value={form.transactionType}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                transactionType: e.target.value,
                categoryAccountId: "",
              }))
            }
          />

          <Input 
            label="Amount" 
            name="amount" 
            type="number" 
            placeholder="0.00" 
            required 
            value={form.amount} 
            onChange={handleChange} 
          />
          <Select
  label="Category Account"
  value={form.categoryAccountId}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      categoryAccountId: e.target.value,
    }))
  }
options={coaAccounts.map((a) => ({
    label: `${a.accountCode || ""} ${a.accountName}`,
    value: String(a.id),
  }))}
/>
        </div>

        {/* Description Row */}
        <div className="mb-6">
          <Input 
            label="Description" 
            name="description" 
            required 
            placeholder="Enter transaction description..." 
            value={form.description} 
            onChange={handleChange} 
          />
        </div>

        {/* Memo Row */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Memo</label>
          <textarea
            name="memo"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 focus:outline-none text-slate-700 placeholder:text-gray-400"
            placeholder="Enter additional notes..."
            value={form.memo}
            onChange={handleChange}
          />
        </div>

        {/* Attachments Row */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">Attachments</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
              Choose Files
              <input type="file" className="hidden" onChange={(e) => setForm({...form, attachments: e.target.files[0]})} />
            </label>
            <span className="text-sm text-gray-500">
              {form.attachments ? form.attachments.name : "No file chosen"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            loading={loading}
            className="px-8"
          >
            Record Banking Transaction
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="px-8 border-gray-300 text-slate-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
