import httpClient from "../../api/httpClient";



//  list mailing
export const getMailings = (tenantId, page = 0, size = 20) =>
  httpClient.get("/api/v1/communications/mailings", {
    params: { tenantId, page, size },
  });

//  get mailing by id
export const getMailingById = (id) =>
  httpClient.get(`/api/v1/communications/mailings/${id}`);

// create mailing
export const createMailing = (data) =>
  httpClient.post("/api/v1/communications/mailings", data);

//  update mailing
export const updateMailing = (id, data) =>
  httpClient.put(`/api/v1/communications/mailings/${id}`, data);

// delete single mailing
export const deleteMailing = (id) =>
  httpClient.delete(`/api/v1/communications/mailings/${id}`);

// delte batch mailing
export const deleteMailingsBulk = (ids) =>
  httpClient.delete("/api/v1/communications/mailings/batch", {
    data: ids,
  });

//  get owners by association

export const getAssociationOwners = (associationId) =>
  httpClient.get("/api/v1/communications/owners", {
    params: { associationId },
  });