import httpClient from "../../api/httpClient";

export const getAllAssociations = () => httpClient.get("/association/all");
export const getAllUnits = () => httpClient.get("/units");

export const getAllOwners = () => httpClient.get("/owner");
export const createOwner = (data) => httpClient.post("/owner", data);
export const getOwnerById = (id) => httpClient.get(`/owner/${id}`);
export const getOwnersByUnit = (unitId) => httpClient.get(`/owner/unit/${unitId}`);
export const updateOwner = (id, data) => httpClient.patch(`/owner/${id}`, data);
export const deleteOwner = (id) => httpClient.delete(`/owner/${id}`);