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

export const getCoaAccounts = () =>
  httpClient.get("/api/v1/accounting/coa");