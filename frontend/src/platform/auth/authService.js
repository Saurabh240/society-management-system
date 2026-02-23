

import httpClient from "../../api/httpClient";
import { setToken, clearToken } from "../../shared/utils/storage";

export const login = async (email, password) => {
  const res = await httpClient.post("/users/login", { email, password });

  /*console.log("Login Response:", res.data);*/
  setToken(res.data.accessToken);
  return res.data;
};

export const signup = async (data) => {
  const res = await httpClient.post("/users/register", data);
  return res.data;
};


//logout frontend only
export const logout = () => {
  clearToken();
};