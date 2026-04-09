import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createAccount, updateAccount, getAccountById } from "../api/accountingApi";
import { toast } from "react-toastify";


import Button from "@/components/ui/Button"; 
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const ACCOUNT_TYPES = [
  { value: "ASSETS", label: "Assets" },
  { value: "LIABILITIES", label: "Liabilities" },
  { value: "EQUITY", label: "Equity" },
  { value: "INCOME", label: "Income" },
  { value: "EXPENSES", label: "Expenses" },
];

export default function AddAccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    accountNumber: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const res = await getAccountById(id);
        
           setFormData({
            accountName: account.accountName || "",
            accountType: account.accountType || "",
            accountCode: account.accountCode || "",
            notes:       account.notes       || "",
          });

        } catch (err) {
          console.error(err);
          toast.error("Failed to load account details");
          navigate("/dashboard/accounting/chart-of-accounts");
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateAccount(id, formData);
        toast.success("Account updated successfully");
      } else {
        await createAccount(formData);
        toast.success("Account created successfully");
      }
      navigate("/dashboard/accounting/chart-of-accounts");
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header  */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isEdit ? "Edit Account" : "Add Account"}
        </h2>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Name */}
            <Input
              label="Account Name*"
              required
              placeholder="Enter account name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            {/* Account Type */}
            <Select
              label="Account Type*"
              required
              options={ACCOUNT_TYPES}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="Select Type"
            />

            {/* Account Number */}
            <div className="md:col-span-2">
              <Input
                label="Account Number (Optional)"
                placeholder="e.g. 1001-00"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>

            {/* Notes  Standard Textarea */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-900 outline-none transition"
                rows="4"
                placeholder="Enter notes about this account"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/accounting/chart-of-accounts")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              style={{ backgroundColor: "#122b61", color: "white" }}
            >
              {isEdit ? "Update Account" : "Save Account"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}