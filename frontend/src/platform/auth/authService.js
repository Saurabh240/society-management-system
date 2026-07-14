import httpClient from "../../api/httpClient";
import { setToken, clearStorage } from "../../shared/utils/storage";

export const login = async (email, password) => {
  const res = await httpClient.post(
    "/users/login",
    { email, password },
    { withCredentials: true }
  );

  const { accessToken, role, planSelected } = res.data;
  setToken(accessToken);
  localStorage.setItem("role", role);
  localStorage.setItem("planSelected", String(planSelected));

  return res.data;
};

export const signup = async (data) => {
  const res = await httpClient.post("/users/register", data);
  return res.data;
};

export const checkCompanyName = async (name) => {
  const res = await httpClient.get("/users/check-company", { params: { name } });
  return res.data?.data?.available ?? true;
};

export const logout = () => {
  clearStorage();
  localStorage.removeItem("role");
  localStorage.removeItem("planSelected");
};