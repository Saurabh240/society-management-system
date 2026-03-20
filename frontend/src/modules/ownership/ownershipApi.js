import httpClient from "../../api/httpClient";

export const getAllAssociations = () => httpClient.get("/association/all");
export const getAllUnits        = () => httpClient.get("/units");

export const getAllOwners  = () => httpClient.get("/owner/all");
export const createOwner  = (data) => httpClient.post("/owner", data);
export const getOwnerById = (id, unitId, associationId) => httpClient.get(`/owner/${id}/unit/${unitId}/association/${associationId}`);
export const updateOwner  = (id, data) => httpClient.patch(`/owner/${id}`, data);
export const deleteOwner  = (id)   => httpClient.delete(`/owner/${id}`);