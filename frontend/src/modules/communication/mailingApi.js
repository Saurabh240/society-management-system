import httpClient from "../../api/httpClient";



//  list mailing
export const getMailings = (page = 0, size = 10) =>
  httpClient.get("/api/v1/communications/mailings", {
    params: { page, size },
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

export const getMailingPdf = (mailingId, ownerId, download = false) =>
   httpClient.get(`/api/v1/communications/mailings/${mailingId}/pdf/${ownerId}`, {
     params: { download },
     responseType: "blob",
   });

export const getAllMailingPdfs = (mailingId) =>
   httpClient.get(`/api/v1/communications/mailings/${mailingId}/pdf/all`, {
     responseType: "blob",
   });