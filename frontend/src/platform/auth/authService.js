

import httpClient from "../../api/httpClient";
import { setToken } from "../../shared/utils/storage";

export const login = async (email, password) => {
  const res = await httpClient.post("/users/login", { email, password });
  setToken(res.data.token);
  return res.data;
};

export const signup = async (data) => {
  const res = await httpClient.post("/users/register", data);
  return res.data;
};

