


import httpClient from "@/api/httpClient";

export const getOverview = () => httpClient.get("/api/v1/accounting/overview");

export const createAccount = (data) => 
  httpClient.post("/api/v1/accounting/accounts", data);

export const updateAccount = (id, data) => 
  httpClient.put(`/api/v1/accounting/accounts/${id}`, data);

export const getAccountById = (id) => 
  httpClient.get(`/api/v1/accounting/accounts/${id}`);

export const getCoaList = (search = "", type = "", page = 0, size = 100) => {
  const params = { page, size };
  if (search) params.search = search;
  if (type && type !== "All Types") params.type = type;
  return httpClient.get("/api/v1/accounting/accounts", { params });
};

export const deleteAccount = (id) =>
  httpClient.delete(`/api/v1/accounting/accounts/${id}`);