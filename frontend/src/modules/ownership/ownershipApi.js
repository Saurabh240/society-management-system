import httpClient from "../../api/httpClient";

export const getAllAssociations = () => httpClient.get("/api/v1/associations");
export const getAllUnits        = () => httpClient.get("/api/v1/units");

export const getAllOwners  = () => httpClient.get("/api/v1/owners");
export const createOwner  = (data) => httpClient.post("/api/v1/owners", data);
export const getOwnerById = (id, unitId, associationId) => httpClient.get(`/api/v1/owners/${id}/unit/${unitId}/association/${associationId}`);
export const updateOwner  = (id, data) => httpClient.patch(`/api/v1/owners/${id}`, data);
export const deleteOwner  = (id)   => httpClient.delete(`/api/v1/owners/${id}`);