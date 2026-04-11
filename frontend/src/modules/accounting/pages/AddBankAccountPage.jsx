

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBankAccount, updateBankAccount } from "../api/accountingApi";
import { getAssociations } from "@/modules/associations/associationApi";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const ACCOUNT_TYPES = [
  { value: "CHECKING", label: "Checking" },
  { value: "SAVINGS", label: "Savings" },
  { value: "MONEY_MARKET", label: "Money Market" },
];

export default function AddBankAccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    associationId: "",
    accountName: "",
    accountType: "CHECKING",
    country: "United States",
    routingNumber: "",
    accountNumber: "",
    confirmAccountNumber: "",
    notes: "",
    enableCheckPrinting: false,
  });

  // Load associations
  useEffect(() => {
    const loadAssociations = async () => {
      try {
        const res = await getAssociations();
        const raw =
          res.data?.data?.content ||
          res.data?.data ||
          res.data?.content ||
          [];

        setAssociations(
          raw.map((a) => ({
            value: String(a.id || a.associationId),
            label: a.name || a.associationName,
          }))
        );
      } catch (err) {
        toast.error("Failed to load associations");
      }
    };

    loadAssociations();
  }, []);

  // Handle change
  const handleChange = (e) => {
    const val = e?.target?.value || e;
    const name = e?.target?.name;

    if (!name) return;

    setFormData((prev) => ({
      ...prev,
      [name]:
        e?.target?.type === "checkbox" ? e.target.checked : val,
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{9}$/.test(formData.routingNumber)) {
      return toast.error("Routing number must be exactly 9 digits.");
    }

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      return toast.error("Account numbers do not match.");
    }

    try {
      setLoading(true);

      const { confirmAccountNumber, ...payload } = formData;

      if (isEdit) {
        await updateBankAccount(id, payload);
        toast.success("Bank account updated");
      } else {
        await createBankAccount(payload);
        toast.success("Bank account registered");
      }

      navigate("/dashboard/accounting/banking");
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-8">
        {isEdit ? "Edit Bank Account" : "Add Bank Account"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Section  */}
        <Card className="p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6 border-b pb-2">
            Bank Account Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Select
              label="Association"
              name="associationId"
              required
              options={associations}
              value={formData.associationId}
              onChange={handleChange}
            />

            <Input
              label="Bank Account Name"
              name="accountName"
              required
              placeholder="e.g. Operating Checking"
              value={formData.accountName}
              onChange={handleChange}
            />

            <Select
              label="Account Type"
              name="accountType"
              required
              options={ACCOUNT_TYPES}
              value={formData.accountType}
              onChange={handleChange}
            />

            <Input
              label="Country"
              required
              name="country"
              disabled
              value={formData.country}
            />

            
            <Input
              label="Routing Number"
              name="routingNumber"
              required
              className="md:col-span-2"
              placeholder="Enter 9-digit routing number"
              value={formData.routingNumber}
              onChange={handleChange}
            />

            <Input
              label="Account Number"
              type="password"
              name="accountNumber"
              required
              className="md:col-span-2"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={handleChange}
            />

           
<div className="md:col-span-2">
  <Input
  label="Confirm Account Number"
  name="confirmAccountNumber"
  required
  
  placeholder="Re-enter account number"
  value={formData.confirmAccountNumber}
  onChange={handleChange}
/>
</div>
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Account Notes
  </label>
  <textarea
    name="notes"
    rows="3"
    className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-blue-900 border-gray-300"
    value={formData.notes}
    onChange={handleChange}
  />
</div>
          </div>
        </Card>

       
        <Card className="p-8">
  <div className="flex items-center justify-between">
    
    {/* Left: Title */}
    <h3 className="text-lg font-medium text-gray-900">
      Check Printing Setup
    </h3>

    {/* Right: Toggle */}
    <div className="flex items-center gap-3">
      <label
        htmlFor="enableCheckPrinting"
        className="text-gray-700"
      >
        Enable Check Printing
      </label>

      <input
        type="checkbox"
        id="enableCheckPrinting"
        name="enableCheckPrinting"
        className="w-5 h-5 accent-blue-900"
        checked={formData.enableCheckPrinting}
        onChange={handleChange}
      />
    </div>

  </div>
</Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? "Update Bank Account" : "Add Bank Account"}
          </Button>
        </div>

      </form>
    </div>
  );
}