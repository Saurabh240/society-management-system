import httpClient from "../../api/httpClient";

// CREATE SMS
export const createSms = (data) =>
  httpClient.post("/api/v1/communications/sms", data);

// GET ALL SMS
export const getSmsList = (page = 0, size = 10) =>
  httpClient.get("/api/v1/communications/sms", {
    params: { page, size },
  });

// RESEND SMS
export const resendSms = (id) =>
  httpClient.post(`/api/v1/communications/sms/${id}/resend`);

// RESCHEDULE SMS
export const rescheduleSms = (id, scheduledAt) =>
  httpClient.post(`/api/v1/communications/sms/${id}/reschedule`, {
    scheduledAt,
  });

// DELETE SMS
export const deleteSms = (id) =>
  httpClient.delete(`/api/v1/communications/sms/${id}`);

// DELETE BULK
export const deleteSmsBulk = (ids) =>
  httpClient.delete("/api/v1/communications/sms/batch", {
    data: ids,
  });

//GET SMS BY ID
export const getSmsById = (id) =>
  httpClient.get(`/api/v1/communications/sms/${id}`);


// UPDATE SMS 
export const updateSms = (id, data) =>
  httpClient.put(`/api/v1/communications/sms/${id}`, data);


  