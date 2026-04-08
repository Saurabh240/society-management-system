import httpClient from "@/api/httpClient";

export const getOverview = () => httpClient.get("/api/v1/accounting/overview");

export const createAccount = (data) => 
  httpClient.post("/api/v1/accounting/coa", data);

export const updateAccount = (id, data) => 
  httpClient.put(`/api/v1/accounting/accounts/${id}`, data);

export const getAccountById = (id) => 
  httpClient.get(`/api/v1/accounting/accounts/${id}`);

export const getCoaList = () => 
  httpClient.get("/api/v1/accounting/accounts");

export const deleteAccount = (id) => 
  httpClient.delete(`/api/v1/accounting/accounts/${id}`);
