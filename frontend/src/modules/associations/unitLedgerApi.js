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

// Record a payment. Two call shapes:
//   recordUnitPayment(unitId, invoiceId, data)       -> pays that one invoice
//   recordUnitPayment(unitId, { invoiceId?, ...data }) -> with invoiceId pays that invoice;
//     without it, POSTs to /api/v1/units/{unitId}/payments, where the backend applies
//     the amount FIFO across the unit's unpaid invoices (oldest first).
// (This used to guess an invoice client-side, comparing status to "PARTIAL" — the
// backend value is PARTIALLY_PAID — and could pick an already-PAID invoice.)
export const recordUnitPayment = async (unitId, invoiceIdOrData, maybeData) => {
  if (maybeData !== undefined) {
    return recordInvoicePayment(unitId, invoiceIdOrData, maybeData);
  }
  const { invoiceId, ...payload } = invoiceIdOrData || {};
  if (invoiceId) {
    return recordInvoicePayment(unitId, invoiceId, payload);
  }
  return httpClient.post(`/api/v1/units/${unitId}/payments`, payload);
};

export const getCoaAccounts = () =>
    httpClient.get("/api/v1/accounting/coa");