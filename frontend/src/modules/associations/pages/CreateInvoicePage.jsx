import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getUnitById } from "../unitApi";
import { createUnitInvoice, getCoaAccounts } from "../unitLedgerApi";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const blankLineItem = () => ({
  _key: crypto.randomUUID(),
  description: "",
  incomeAccountId: "",
  amount: "",
});

const extractError = (err) =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  "An unexpected error occurred";

export default function CreateInvoicePage() {
  const { associationId, unitId } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit]               = useState(null);
  const [unitLoading, setUnitLoading] = useState(true);
  const [unitError, setUnitError]     = useState(false);

  const [incomeAccounts, setIncomeAccounts]     = useState([]);
  const [accountsLoading, setAccountsLoading]   = useState(true);

  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [dueDate, setDueDate]         = useState("");
  const [lineItems, setLineItems]     = useState([blankLineItem()]);
  const [notes, setNotes]             = useState("");
  const [submitting, setSubmitting]   = useState(false);

  const ledgerPath = `/dashboard/associations/${associationId}/units/${unitId}/ledger`;

  // Fetch unit details
  useEffect(() => {
    if (!unitId) return;
    let cancelled = false;
    (async () => {
      setUnitLoading(true);
      setUnitError(false);
      try {
        const res = await getUnitById(unitId);
        if (!cancelled) setUnit(res.data?.data || res.data);
      } catch (err) {
        if (!cancelled) {
          setUnitError(true);
          toast.error(extractError(err));
        }
      } finally {
        if (!cancelled) setUnitLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [unitId]);

  // Fetch CoA accounts, filter INCOME client-side
  // GET /api/v1/accounting/coa → raw Spring Page: res.data.content
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAccountsLoading(true);
      try {
        const res = await getCoaAccounts();
        const all = res.data?.content ?? [];
        if (!cancelled) setIncomeAccounts(all.filter((a) => a.accountType === "INCOME"));
      } catch {
        if (!cancelled) toast.error("Failed to load income accounts");
      } finally {
        if (!cancelled) setAccountsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const addLineItem = () => setLineItems((prev) => [...prev, blankLineItem()]);

  const removeLineItem = (key) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((item) => item._key !== key));
  };

  const updateLineItem = (key, field, value) =>
    setLineItems((prev) =>
      prev.map((item) => (item._key === key ? { ...item, [field]: value } : item))
    );

  const totalAmount = lineItems.reduce((sum, item) => {
    const n = parseFloat(item.amount);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const validate = () => {
    if (!invoiceDate.trim()) { toast.error("Invoice date is required"); return false; }
    if (!dueDate.trim())     { toast.error("Due date is required");     return false; }

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      const label = `Line item ${i + 1}`;
      if (!item.description.trim())  { toast.error(`${label}: description is required`);  return false; }
      if (!item.incomeAccountId)     { toast.error(`${label}: income account is required`); return false; }
      const amt = parseFloat(item.amount);
      if (!Number.isFinite(amt) || amt <= 0) { toast.error(`${label}: amount must be greater than zero`); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      invoiceDate: invoiceDate.trim(),
      dueDate: dueDate.trim(),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      lineItems: lineItems.map(({ description, incomeAccountId, amount }) => ({
        description: description.trim(),
        incomeAccountId: Number(incomeAccountId),
        amount: parseFloat(parseFloat(amount).toFixed(2)),
      })),
    };

    setSubmitting(true);
    try {
      const res = await createUnitInvoice(unitId, payload);
      const created = res.data?.data;
      toast.success(
        `Invoice${created?.id ? ` #${created.id}` : ""} created — $${Number(created?.totalAmount ?? totalAmount).toFixed(2)}`
      );
      navigate(ledgerPath);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(ledgerPath);

  const fullAddress = unit
    ? [unit.street, unit.city, unit.state, unit.zipCode].filter(Boolean).join(", ")
    : "—";
  const associationName = unit?.associationName ?? unit?.association?.name ?? "—";

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">

      <button
        onClick={handleCancel}
        className="flex items-center text-blue-900 hover:text-gray-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Unit {unit?.unitNumber || unitId}
      </button>

      <h1 className="text-3xl font-bold mb-8">
        Create Invoice{unit ? ` - Unit ${unit.unitNumber}` : ""}
      </h1>

      {/* Unit Information */}
      <Card className="mb-6 overflow-hidden">
        <Card.Content className="p-6">
          <h2 className="text-base font-semibold mb-4">Unit Information</h2>
          <hr className="mb-4 border-gray-200" />
          {unitLoading ? (
            <p className="text-sm text-gray-500 italic">Loading unit info…</p>
          ) : unitError ? (
            <p className="text-sm text-red-500">Could not load unit information.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Association</label>
                <p className="text-gray-900 text-sm">{associationName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Unit Number</label>
                <p className="text-gray-900 text-sm">{unit?.unitNumber || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Address</label>
                <p className="text-gray-900 text-sm">{fullAddress}</p>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Invoice Form */}
      <Card className="overflow-hidden">
        <Card.Content className="p-6">

          <h2 className="text-base font-semibold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                min={invoiceDate || undefined}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold">Line Items</h2>
            <Button variant="outline" leftIcon={<Plus size={15} />} onClick={addLineItem} disabled={submitting}>
              Add Line Item
            </Button>
          </div>

          <div className="grid grid-cols-12 gap-3 mb-2 px-1">
            <div className="col-span-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description <span className="text-red-500">*</span></span>
            </div>
            <div className="col-span-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Income Account <span className="text-red-500">*</span></span>
            </div>
            <div className="col-span-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount <span className="text-red-500">*</span></span>
            </div>
            <div className="col-span-1" />
          </div>

          <div className="space-y-3 mb-2">
            {lineItems.map((item) => (
              <div key={item._key} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(item._key, "description", e.target.value)}
                    placeholder="Enter description"
                    disabled={submitting}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
                <div className="col-span-4">
                  <select
                    value={item.incomeAccountId}
                    onChange={(e) => updateLineItem(item._key, "incomeAccountId", e.target.value)}
                    disabled={accountsLoading || submitting}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 disabled:bg-gray-50"
                  >
                    <option value="">{accountsLoading ? "Loading accounts…" : "Select account"}</option>
                    {incomeAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountCode ? `${acc.accountCode} - ${acc.accountName}` : acc.accountName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => updateLineItem(item._key, "amount", e.target.value)}
                    placeholder="0.00"
                    disabled={submitting}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeLineItem(item._key)}
                    disabled={lineItems.length === 1 || submitting}
                    title={lineItems.length === 1 ? "At least one line item is required" : "Remove line item"}
                    className={`p-1.5 rounded-md transition-colors ${
                      lineItems.length === 1 || submitting
                        ? "text-gray-200 cursor-not-allowed"
                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end mt-4 mb-8">
            <div className="w-full md:w-80 border-t border-gray-300 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                <span className="text-base font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              placeholder="Enter any additional notes for this invoice"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y disabled:bg-gray-50"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <Button variant="outline" onClick={handleCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting || accountsLoading}>
              {submitting ? "Creating…" : "Create Invoice"}
            </Button>
          </div>

        </Card.Content>
      </Card>
    </div>
  );
}