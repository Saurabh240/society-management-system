import httpClient from "../../api/httpClient";

export const getAssociations = () =>
  httpClient.get("/associations");

export const getAssociationById = (id) =>
  httpClient.get(`/associations/${id}`);

export const createAssociation = (data) =>
  httpClient.post("/associations", data);

export const updateAssociation = (id, data) =>
  httpClient.put(`/associations/${id}`, data);

export const deleteAssociation = (id) =>
  httpClient.delete(`/associations/${id}`);
export const getTaxIdentityTypes = () => {
  return api.get('/tax-identity-types');
};