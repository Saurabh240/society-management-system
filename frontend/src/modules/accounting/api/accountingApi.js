import httpClient from "@/api/httpClient";

export const getOverview = () => httpClient.get("/api/v1/accounting/overview");

// COA APIs
export const getCoaList = ( search = "", type = "", page = 0, size = 20) => {
  const params = { page, size };
 
  if (search) params.search = search;
  if (type && type !== "All Types") params.type = type;
  return httpClient.get("/api/v1/accounting/coa", { params });
};

export const getAccountById = (id) =>
  httpClient.get(`/api/v1/accounting/coa/${id}`);

export const createAccount = (data) =>
  httpClient.post("/api/v1/accounting/coa", data);

export const updateAccount = (id, data) =>
  httpClient.put(`/api/v1/accounting/coa/${id}`, data);

export const deleteAccount = (id) =>
  httpClient.delete(`/api/v1/accounting/coa/${id}`);



export const getLedgerEntries = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
  return httpClient.get("/api/v1/accounting/ledger", { params: clean });
};


export const createJournalEntry = (data) =>
  httpClient.post("/api/v1/accounting/journal-entries", data);


// Banking APIs

export const getBankAccounts = (associationId) =>
  httpClient.get("/api/v1/accounting/banking", {
    params: associationId ? { associationId } : {},
  });
 


export const getBankAccountById = (id) =>
  httpClient.get(`/api/v1/accounting/banking/${id}`);

export const createBankAccount = (data) =>
  httpClient.post("/api/v1/accounting/banking", data);

export const updateBankAccount = (id, data) =>
  httpClient.put(`/api/v1/accounting/banking/${id}`, data);

export const deleteBankAccount = (id) =>
  httpClient.delete(`/api/v1/accounting/banking/${id}`);

export const updateBankBalance = (id, balance) =>
  httpClient.patch(`/api/v1/accounting/banking/${id}/balance`, { balance });