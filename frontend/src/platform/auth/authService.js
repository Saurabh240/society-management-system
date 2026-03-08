


import httpClient from "../../api/httpClient";
import { setToken, clearToken } from "../../shared/utils/storage";

export const login = async (email, password) => {
  const res = await httpClient.post("/users/login", { email, password });

  const { accessToken, role } = res.data;

  setToken(accessToken);
  localStorage.setItem("role", role);

  return res.data;
};

export const signup = async (data) => {
  const res = await httpClient.post("/users/register", data);
  return res.data;
};

export const logout = () => {
  clearToken();
  localStorage.removeItem("role");
};