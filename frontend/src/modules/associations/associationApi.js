import httpClient from "../../api/httpClient";

// Get all associations
export const getAssociations = () =>
  httpClient.get("/association/all");

// Get single association
export const getAssociationById = (id) =>
  httpClient.get(`/association/${id}`);

// Create association
export const createAssociation = (data) =>
  httpClient.post("/association", data);

// Update association
export const updateAssociation = (id, data) =>
  httpClient.patch(`/association/${id}`, data);

// Delete association
export const deleteAssociation = (id) =>
  httpClient.delete(`/association/${id}`);

// Get board members by association
export const getBoardMembersByAssociation = (associationId) =>
  httpClient.get(`/owner/board-members/${associationId}`);