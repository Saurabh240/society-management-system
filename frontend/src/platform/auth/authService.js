import { httpClient } from "../../api/httpClient";

export const login = async (request) => {
  const response = await httpClient.post("/auth/login", request);
  return response.data.data;
};