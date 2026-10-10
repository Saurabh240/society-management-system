import httpClient from "../../api/httpClient";

export const getUnitLedgerSummary = (unitId) =>
  httpClient.get(`/api/v1/units/${unitId}/ledger/summary`);

export const getUnitLedgerTransactions = (unitId, params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
  return httpClient.get(`/api/v1/units/${unitId}/ledger`, { params: clean });
};

export const createUnitInvoice = (unitId, data) =>
  httpClient.post(`/api/v1/units/${unitId}/invoices`, data);

export const getUnitInvoices = (unitId) =>
  httpClient.get(`/api/v1/units/${unitId}/invoices`);

// Record payment against an invoice: POST /api/v1/units/{unitId}/invoices/{invoiceId}/payments
export const recordInvoicePayment = (unitId, invoiceId, data) =>
  httpClient.post(`/api/v1/units/${unitId}/invoices/${invoiceId}/payments`, data);

// Get payment history for an invoice: GET /api/v1/units/{unitId}/invoices/{invoiceId}/payments
export const getInvoicePayments = (unitId, invoiceId) =>
  httpClient.get(`/api/v1/units/${unitId}/invoices/${invoiceId}/payments`);

// Helper: supports recordUnitPayment(unitId, invoiceId, data) or recordUnitPayment(unitId, { invoiceId, ...data })
// If invoiceId is omitted, automatically finds the unit's unpaid/latest invoice
export const recordUnitPayment = async (unitId, invoiceIdOrData, maybeData) => {
  if (maybeData !== undefined) {
    return recordInvoicePayment(unitId, invoiceIdOrData, maybeData);
  }
  let invoiceId = invoiceIdOrData?.invoiceId;
  const payload = { ...invoiceIdOrData };
  delete payload.invoiceId;

  if (!invoiceId) {
    try {
      const res = await getUnitInvoices(unitId);
      const invoices = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const targetInvoice = invoices.find(inv => inv.status === "UNPAID" || inv.status === "PARTIAL") || invoices[0];
      if (targetInvoice?.id) {
        invoiceId = targetInvoice.id;
      }
    } catch (err) {
      console.warn("Could not auto-fetch invoices for unit payment:", err);
    }
  }

  if (!invoiceId) {
    throw new Error("No invoice found for this unit to apply payment against. Please create an invoice first.");
  }

  return recordInvoicePayment(unitId, invoiceId, payload);
};

export const getCoaAccounts = () =>
  httpClient.get("/api/v1/accounting/coa");