import httpClient from "../../api/httpClient";

// create email
export const createEmail = (data) =>
  httpClient.post("/api/v1/communications/emails", data);

// list email
export const getEmails = (tenantId, page = 0, size = 10) =>
  httpClient.get("/api/v1/communications/emails", {
    params: { tenantId, page, size },
  });

// view email 
export const getEmailById = (id) =>
  httpClient.get(`/api/v1/communications/emails/${id}`);

// update email
export const updateEmail = (id, data) =>
  httpClient.put(`/api/v1/communications/emails/${id}`, data);

// delete email
export const deleteEmail = (id) =>
  httpClient.delete(`/api/v1/communications/emails/${id}`);

// resend email
export const resendEmail = (id) =>
  httpClient.post(`/api/v1/communications/emails/${id}/resend`);

// reschedule email
export const rescheduleEmail = (id, data) =>
  httpClient.put(`/api/v1/communications/emails/${id}/reschedule`, data);