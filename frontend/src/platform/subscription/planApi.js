import httpClient from "../../api/httpClient";

export const selectPlan = (plan) =>
  httpClient.post("/api/v1/plan/select", { plan });

export const getPlanStatus = () =>
  httpClient.get("/api/v1/plan/status");

export const getSubscription = () =>
  httpClient.get("/api/v1/plan");