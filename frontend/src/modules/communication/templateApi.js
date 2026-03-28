import httpClient from "../../api/httpClient";

// CREATE
export const createTemplate = (data) =>
  httpClient.post("/api/v1/communications/templates", data);

// UPDATE
export const updateTemplate = (id, data) =>
  httpClient.put(`/api/v1/communications/templates/${id}`, data);

// GET ALL
export const getTemplates = (level , associationId , IndividualId , Vendors ) =>
  httpClient.get("/api/v1/communications/templates", {
    params: { level, associationId , IndividualId , Vendors },
  });

// DELETE ONE
export const deleteTemplate = (id) =>
  httpClient.delete(`/api/v1/communications/templates/${id}`);

// DELETE BULK
export const deleteTemplatesBulk = (ids) =>
  httpClient.delete("/api/v1/communications/templates/batch", {
    data: ids,
  });

//  RESOLVE TEMPLATE
export const resolveTemplate = (data) =>
  httpClient.post("/api/v1/communications/templates/resolve", data);