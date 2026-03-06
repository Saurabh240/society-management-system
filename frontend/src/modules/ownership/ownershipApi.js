import httpClient from "../../api/httpClient";

const BASE = "/ownership-accounts";

export const getOwnershipAccounts = (params) =>
  httpClient.get(BASE, { params });

export const getOwnershipAccount = (id) => httpClient.get(`${BASE}/${id}`);

export const createOwnershipAccount = (data) => httpClient.post(BASE, data);

export const updateOwnershipAccount = (id, data) =>
  httpClient.put(`${BASE}/${id}`, data);

export const deleteOwnershipAccount = (id) =>
  httpClient.delete(`${BASE}/${id}`);