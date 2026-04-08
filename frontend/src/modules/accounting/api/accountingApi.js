


import httpClient from "@/api/httpClient";

export const getOverview = () => httpClient.get("/api/v1/accounting/overview");

export const createAccount = (data) => 
  httpClient.post("/api/v1/accounting/accounts", data);

export const updateAccount = (id, data) => 
  httpClient.put(`/api/v1/accounting/accounts/${id}`, data);

export const getAccountById = (id) => 
  httpClient.get(`/api/v1/accounting/accounts/${id}`);