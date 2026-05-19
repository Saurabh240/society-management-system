import httpClient from "@/api/httpClient";

export const submitSupportTicket = (data) =>
  httpClient.post("/api/v1/help/support", data);

export const submitFeatureSuggestion = (data) =>
  httpClient.post("/api/v1/help/suggestion", data);