
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReactSelect from "react-select";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { getAssociations } from "@/modules/associations/associationApi";
import { 
  getBankAccountById, 
  getCoaList, 
  createJournalEntry, 
  updateBankBalance 
} from "../api/accountingApi";

const customStyles = {
  control: (base) => ({
    ...base,
    minHeight: "42px",
    borderColor: "#d1d5db",
    borderRadius: "0.5rem",
    boxShadow: "none",
    "&:hover": { borderColor: "#9ca3af" },
  }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};

export default function RecordTransactionPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [associations, setAssociations] = useState([]);
  const [groupedAccounts, setGroupedAccounts] = useState([]); // Grouped for ReactSelect
  const [bankCoaId, setBankCoaId] = useState(null); 
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    associationId: "",
    bankAccountDisplay: "", 
    bankAccountId: id || "",
    transactionType: "WITHDRAWAL", 
    amount: "",
    categoryAccountId: "", // Will store the selected CoA ID
    description: "",
    memo: "",
  });

  useEffect(() => {
    const loadData = async () => {
    
      try {
        setLoading(true);

        const [assocRes, coaRes, bankRes] = await Promise.all([
          getAssociations(),
          getCoaList("", "", 0, 1000), 
          getBankAccountById(id),
        ]);

        //  Set Associations
        const assocData = assocRes.data?.data || assocRes.data?.content || [];
        setAssociations([
          { label: "Select Association", value: "" }, 
          ...assocData.map((a) => ({ label: a.name, value: String(a.id) })),
        ]);

        //  CoA List into Groups 
        const rawCoa = coaRes.data?.content || coaRes.data || [];
        const groupMap = {};
        rawCoa.forEach((acc) => {
          const groupName = acc.accountType || "Other";
          if (!groupMap[groupName]) groupMap[groupName] = [];
          groupMap[groupName].push({ 
            value: acc.id, 
            label: `${acc.accountCode} - ${acc.accountName}` 
          });
        });

        const grouped = Object.keys(groupMap).map(group => ({
          label: group.toUpperCase(),
          options: groupMap[group]
        }));
        setGroupedAccounts(grouped);

        //  Link Bank to its Chart of Accounts ID
        const bank = bankRes.data?.data || bankRes.data;
        if (bank) {
          setForm((prev) => ({
            ...prev,
            associationId: String(bank.associationId),
            bankAccountDisplay: `${bank.bankAccountName} (${bank.accountNumberMasked}) - Balance: $${bank.balance || 0}`,
          }));

          const linkedId = bank.coaAccountId || bank.chartOfAccountId;
          if (linkedId) {
            setBankCoaId(linkedId);
          } else {
            // Every bank account must carry its own GL account. Don't fall back to
            // "some other ASSETS account" — the entry would post to an arbitrary
            // account and never show in this bank's own Transactions tab.
            setBankCoaId(null);
            toast.error(
                "This bank account has no linked GL account, so transactions can't be " +
                "posted safely. Re-save the bank account (Edit → Save) to link one, then try again."
            );
          }
          }
      } catch {
        toast.error("Failed to load account details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildLines = () => {
    const amount = parseFloat(form.amount);
    const coaBankId = Number(bankCoaId);
    const coaCategoryId = Number(form.categoryAccountId);
    // Without a per-line description the Transactions tab showed "—" for every row.
    const description = form.description;

    if (form.transactionType === "DEPOSIT") {
      return [
        { accountId: coaBankId, description, debit: amount, credit: 0 },
        { accountId: coaCategoryId, description, debit: 0, credit: amount },
      ];
    }
    return [
      { accountId: coaCategoryId, description, debit: amount, credit: 0 },
      { accountId: coaBankId, description, debit: 0, credit: amount },
    ];
  };

  const handleSubmit = async () => {
    if (!bankCoaId) {
      toast.error("No valid GL account found for this transaction — please ensure Chart of Accounts is configured");
      return;
    }

    if (!form.amount || !form.categoryAccountId || !form.description) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        associationId: Number(form.associationId),
        date: form.date,
        memo: `${form.description}${form.memo ? ' - ' + form.memo : ''}`,
        lines: buildLines(),
      };
    await createJournalEntry(payload);

    // Update Bank Balance
    
      const bankRes = await getBankAccountById(form.bankAccountId);
      const currentBalance = bankRes.data?.data?.balance || bankRes.data?.balance || 0;
      const amount = parseFloat(form.amount);
      const newBalance = form.transactionType === "DEPOSIT" ? currentBalance + amount : currentBalance - amount;

      await updateBankBalance(form.bankAccountId, newBalance);

      toast.success("Transaction recorded successfully");
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record transaction");
    } finally {
      setLoading(false);
    }
  };

  // Find the current selected option for ReactSelect display
  const selectedCategoryOption = groupedAccounts
    .flatMap(g => g.options)
    .find(opt => opt.value === form.categoryAccountId);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Record Banking Transaction</h2>

      <Card className="p-8 shadow-sm border-gray-200 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Input label="Date" name="date" type="date" required value={form.date} onChange={handleChange} />
          <Select label="Association" name="associationId" required options={associations} value={form.associationId} onChange={handleChange} />
          <Input label="Bank Account" name="bankAccountDisplay" required disabled value={form.bankAccountDisplay} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Select
            label="Transaction Type"
            name="transactionType"
            options={[
              { label: "Withdrawal", value: "WITHDRAWAL" },
              { label: "Deposit", value: "DEPOSIT" },
            ]}
            value={form.transactionType}
            onChange={handleChange}
          />

          <Input label="Amount" name="amount" type="number" placeholder="0.00" required value={form.amount} onChange={handleChange} />
          
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-slate-700 mb-1">Category Account</label>
            <ReactSelect
              options={groupedAccounts}
              placeholder="Search all accounts..."
              styles={customStyles}
              value={selectedCategoryOption}
              onChange={(opt) => setForm({ ...form, categoryAccountId: opt ? opt.value : "" })}
              isSearchable
            />
          </div>
        </div>

        <div className="mb-6">
          <Input label="Description" name="description" required placeholder="Enter transaction description..." value={form.description} onChange={handleChange} />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Memo</label>
          <textarea
            name="memo"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
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

        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <Button variant="primary" onClick={handleSubmit} loading={loading} className="px-8">
             Record Banking Transaction
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} className="px-8">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
