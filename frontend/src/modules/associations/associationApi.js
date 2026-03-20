import httpClient from "../../api/httpClient";

export const getAssociations         = ()         => httpClient.get("/api/v1/associations");
export const getAssociationById      = (id)       => httpClient.get(`/api/v1/associations/${id}`);
export const createAssociation       = (data)     => httpClient.post("/api/v1/associations", data);
export const updateAssociation       = (id, data) => httpClient.patch(`/api/v1/associations/${id}`, data);
export const deleteAssociation       = (id)       => httpClient.delete(`/api/v1/associations/${id}`);
export const getBoardMembersByAssociation = (associationId) =>
  httpClient.get(`/api/v1/owners/board-members/${associationId}`);