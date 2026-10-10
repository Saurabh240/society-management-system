import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import dayjs from "dayjs";

import { getUnitById } from "../unitApi";
import { getUnitLedgerSummary, recordUnitPayment, getUnitInvoices, recordInvoicePayment } from "../unitLedgerApi";
import { getAssociationById } from "../associationApi";
import { getBankAccounts, getCoaList } from "@/modules/accounting/api/accountingApi";

export default function ReceivePaymentPage() {
  const { associationId, unitId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unit, setUnit] = useState(null);
  const [association, setAssociation] = useState(null);
  const [summary, setSummary] = useState({ currentBalance: 0 });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [incomeAccounts, setIncomeAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: "",
    paymentDate: dayjs().format("YYYY-MM-DD"),
    amount: "",
    paymentMethod: "Check",
    referenceNumber: "",
    bankAccountId: "",
    incomeAccountId: "",
    memo: ""
  });

  useEffect(() => {
    if (!unitId || !associationId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [unitRes, summaryRes, assocRes, bankRes, coaRes, invRes] = await Promise.all([
          getUnitById(unitId),
          getUnitLedgerSummary(unitId).catch(() => ({ data: { currentBalance: 0 } })),
          getAssociationById(associationId).catch(() => ({ data: null })),
          getBankAccounts(associationId).catch(() => ({ data: [] })),
          getCoaList("", "INCOME", 0, 100).catch(() => ({ data: [] })),
          getUnitInvoices(unitId).catch(() => ({ data: [] }))
        ]);

        const uData = unitRes.data?.data || unitRes.data;
        const sData = summaryRes.data?.data || summaryRes.data || { currentBalance: 0 };
        const aData = assocRes.data?.data || assocRes.data;
        const bList = bankRes.data?.data || bankRes.data?.content || (Array.isArray(bankRes.data) ? bankRes.data : []);
        const invList = invRes.data?.data || (Array.isArray(invRes.data) ? invRes.data : []);

        const coaList = coaRes.data?.content || coaRes.data?.data || (Array.isArray(coaRes.data) ? coaRes.data : []);
        const filteredIncome = coaList.filter(c => {
          const typeStr = (c.accountType || c.type || c.category || "").toUpperCase();
          return typeStr === "INCOME" || typeStr === "REVENUE";
        });
        const incomeListToUse = filteredIncome.length > 0 ? filteredIncome : coaList;

        setUnit(uData);
        setSummary(sData);
        setAssociation(aData);
        setBankAccounts(bList);
        setIncomeAccounts(incomeListToUse);
        setInvoices(invList);

        const defaultInvoice = invList.find(i => i.status === "UNPAID" || i.status === "PARTIAL") || invList[0];
        const bal = Number(sData.currentBalance || uData?.balance || 0);
        setPaymentForm(prev => ({
          ...prev,
          invoiceId: defaultInvoice ? String(defaultInvoice.id) : "",
          amount: defaultInvoice?.totalAmount ? String(defaultInvoice.totalAmount) : (bal > 0 ? String(bal) : ""),
          bankAccountId: bList.length > 0 ? String(bList[0].id) : "",
          incomeAccountId: incomeListToUse.length > 0 ? String(incomeListToUse[0].id) : ""
        }));
      } catch (err) {
        console.error("Failed to load unit details for payment:", err);
        toast.error("Failed to load unit details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [unitId, associationId]);

  if (loading) {
    return <div className="p-6 max-w-5xl mx-auto text-gray-500 italic">Loading payment details...</div>;
  }

  const currentBalance = Number(summary?.currentBalance ?? unit?.balance ?? 0);
  const enteredAmount = Number(paymentForm.amount || 0);
  const isSplitPayment = enteredAmount > 0 && currentBalance > 0 && enteredAmount < currentBalance;
  const remainingBalanceAfter = Math.max(0, currentBalance - enteredAmount);

  const ownersList = Array.isArray(unit?.owners) && unit.owners.length > 0
    ? unit.owners.map(o => `${o.firstName || ""} ${o.lastName || ""}`.trim()).filter(Boolean).join(", ")
    : "—";

  const streetAddress = unit?.street || "—";
  const city = unit?.city || "";
  const state = unit?.state || "";
  const zipCode = unit?.zipCode || "";
  const fullAddress = streetAddress !== "—"
    ? `${streetAddress}, ${city}, ${state} ${zipCode}`.replace(/,\s*,/g, ",").trim()
    : "—";

  const associationName = association?.name || unit?.associationName || "Association";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      return toast.error("Please enter a valid positive payment amount");
    }

    if (currentBalance > 0 && enteredAmount > currentBalance) {
      return toast.error(`Payment amount cannot exceed remaining balance of $${currentBalance.toFixed(2)}`);
    }

    if (!paymentForm.bankAccountId) {
      return toast.error("Please select a deposit bank/cash account");
    }

    try {
      setSubmitting(true);
      const memoParts = [
        paymentForm.paymentMethod ? `Method: ${paymentForm.paymentMethod}` : "",
        paymentForm.referenceNumber ? `Ref: ${paymentForm.referenceNumber}` : "",
        paymentForm.memo || ""
      ].filter(Boolean);

      const payload = {
        amount: enteredAmount,
        paymentDate: paymentForm.paymentDate,
        bankAccountId: Number(paymentForm.bankAccountId),
        cashAccountId: paymentForm.incomeAccountId ? Number(paymentForm.incomeAccountId) : undefined,
        memo: memoParts.length > 0 ? memoParts.join(" | ") : undefined
      };

      if (paymentForm.invoiceId) {
        await recordInvoicePayment(unitId, Number(paymentForm.invoiceId), payload);
      } else {
        await recordUnitPayment(unitId, payload);
      }

      if (isSplitPayment) {
        toast.success(`Partial payment of $${enteredAmount.toFixed(2)} recorded! Remaining balance: $${remainingBalanceAfter.toFixed(2)}`);
      } else {
        toast.success(`Payment of $${enteredAmount.toFixed(2)} recorded successfully!`);
      }

      navigate(`/dashboard/associations/${associationId}/units/${unitId}`);
    } catch (err) {
      console.error("Error recording payment:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-gray-800">
      {/* Back Link */}
      <Link
        to={`/dashboard/associations/${associationId}/units/${unitId}`}
        className="flex items-center text-blue-900 hover:text-gray-800 text-sm font-medium mb-4 transition-colors group"
      >
        <ChevronLeft size={18} className="mr-0.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Unit {unit?.unitNumber || unitId}</span>
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Receive Payment</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CARD 1: UNIT INFORMATION */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            UNIT INFORMATION
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Association</label>
              <p className="mt-1 font-semibold text-gray-900">{associationName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Unit Number</label>
              <p className="mt-1 font-semibold text-gray-900">{unit?.unitNumber || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Address</label>
              <p className="mt-1 font-semibold text-gray-900 truncate" title={fullAddress}>{fullAddress}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Owner(s)</label>
              <p className="mt-1 font-semibold text-gray-900">{ownersList}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div>
              <label className="text-xs font-medium text-gray-500">Current Balance</label>
              <p className="mt-0.5 text-xl font-bold text-gray-900">
                ${currentBalance.toFixed(2)}
              </p>
            </div>
            {isSplitPayment && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-bold">
                Split / Partial Payment
              </span>
            )}
          </div>
        </Card>

        {/* CARD 2: PAYMENT DETAILS */}
        <Card className="p-6 shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            PAYMENT DETAILS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Invoice to Pay"
              required
              value={paymentForm.invoiceId}
              onChange={(e) => {
                const invId = e.target.value;
                const selectedInv = invoices.find(i => String(i.id) === invId);
                setPaymentForm(p => ({
                  ...p,
                  invoiceId: invId,
                  amount: selectedInv ? String(selectedInv.totalAmount || "") : p.amount
                }));
              }}
              options={[
                { value: "", label: invoices.length > 0 ? "-- Select Invoice --" : "-- No invoices found --" },
                ...invoices.map(inv => ({
                  value: String(inv.id),
                  label: `Invoice #${inv.id} - ${inv.invoiceDate || ""} ($${Number(inv.totalAmount || 0).toFixed(2)})${inv.status ? ` [${inv.status}]` : ""}`
                }))
              ]}
            />

            <Input
              label="Payment Date"
              type="date"
              required
              value={paymentForm.paymentDate}
              onChange={(e) => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
            />

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                {currentBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaymentForm(p => ({ ...p, amount: String(currentBalance) }))}
                    className="text-xs text-blue-700 hover:underline font-semibold"
                  >
                    Receive Full Balance (${currentBalance.toFixed(2)})
                  </button>
                )}
              </div>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
              />
              {enteredAmount > 0 && currentBalance > 0 && (
                <div className="mt-1 text-xs flex justify-between px-1">
                  <span className="text-gray-500">Balance remaining after payment:</span>
                  <span className={`font-semibold ${enteredAmount > currentBalance ? "text-red-600" : "text-gray-900"}`}>
                    {enteredAmount > currentBalance
                      ? `Exceeds balance by $${(enteredAmount - currentBalance).toFixed(2)}`
                      : `$${remainingBalanceAfter.toFixed(2)}`}
                  </span>
                </div>
              )}
            </div>

            <Select
              label="Payment Method"
              required
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm(p => ({ ...p, paymentMethod: e.target.value }))}
              options={[
                { value: "Check", label: "Check" },
                { value: "Cash", label: "Cash" },
                { value: "Bank Transfer", label: "Bank Transfer / EFT" },
                { value: "Credit Card", label: "Credit Card" },
                { value: "Other", label: "Other" }
              ]}
            />

            <Input
              label="Check Number"
              placeholder="e.g. 1042"
              value={paymentForm.referenceNumber}
              onChange={(e) => setPaymentForm(p => ({ ...p, referenceNumber: e.target.value }))}
            />
          </div>
        </Card>

        {/* CARD 3: ACCOUNT ALLOCATION (PER FIGMA) */}
        <Card className="p-6 shadow-sm border border-gray-200 space-y-4">
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              ACCOUNT ALLOCATION
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Select the accounts to use for the journal entry generated by this payment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <Select
              label="Deposit To (Debit)"
              required
              value={paymentForm.bankAccountId}
              onChange={(e) => setPaymentForm(p => ({ ...p, bankAccountId: e.target.value }))}
              options={[
                { value: "", label: "— Select bank / deposit account —" },
                ...bankAccounts.map(b => ({
                  value: String(b.id),
                  label: b.bankAccountName || b.accountName || b.name || `Account ${b.id}`
                }))
              ]}
            />

            <Select
              label="Income Account (Credit)"
              required
              value={paymentForm.incomeAccountId}
              onChange={(e) => setPaymentForm(p => ({ ...p, incomeAccountId: e.target.value }))}
              options={[
                { value: "", label: "— Select income account —" },
                ...incomeAccounts.map(c => ({
                  value: String(c.id),
                  label: `${c.accountCode ? c.accountCode + " - " : ""}${c.accountName}`
                }))
              ]}
            />
          </div>
        </Card>

        {/* CARD 4: MEMO / NOTES */}
        <Card className="p-6 shadow-sm border border-gray-200 space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Memo / Notes
          </h2>
          <textarea
            rows="3"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-blue-900 outline-none"
            placeholder="Optional notes about this payment..."
            value={paymentForm.memo}
            onChange={(e) => setPaymentForm(p => ({ ...p, memo: e.target.value }))}
          />
        </Card>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/dashboard/associations/${associationId}/units/${unitId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
          >
            Record Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
