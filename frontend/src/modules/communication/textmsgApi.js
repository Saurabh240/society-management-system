import httpClient from "../../api/httpClient";

// CREATE SMS
export const createSms = (data) =>
  httpClient.post("/api/v1/communications/sms", data);

// GET ALL SMS
export const getSmsList = () =>
  httpClient.get("/api/v1/communications/sms");

// RESEND SMS
export const resendSms = (data) =>
  httpClient.post("/api/v1/communications/templates", null, {
    params: { level: "ASSOCIATION", ...data },
  });

// RESCHEDULE SMS
export const rescheduleSms = (id, scheduledAt) =>
  httpClient.post(`/api/v1/communications/sms/${id}/reschedule`, {
    scheduledAt,
  });

// DELETE SMS
export const deleteSms = (id) =>
  httpClient.delete(`/api/v1/communications/sms/${id}`);