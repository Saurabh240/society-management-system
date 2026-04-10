import httpClient from "@/api/httpClient";

export const getOverview = () => httpClient.get("/api/v1/accounting/overview");

// COA APIs
export const getCoaList = (search = "", type = "", page = 0, size = 20) => {
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

export const getLedgerEntries = (params = {}) =>
  httpClient.get("/api/v1/accounting/ledger", { params });

export const createJournalEntry = (data) =>
  httpClient.post("/api/v1/accounting/journal-entries", data);