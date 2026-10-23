import axios from "axios";
import { getAccessToken, setToken, clearStorage } from "../shared/utils/storage";

const httpClient = axios.create({
  // Empty string = same origin (production behind nginx, which proxies the API).
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request Interceptor
httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.url.includes("/login") && !config.url.includes("/register")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // A 401 from login/register/refresh is a real answer ("wrong password", "refresh
      // expired"), not an expired access token — don't try to refresh or hard-redirect,
      // otherwise the login page reloads before it can show the error.
      const url = originalRequest?.url || "";
      const isAuthCall = ["/users/login", "/users/register", "/users/refresh"].some((p) => url.includes(p));

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthCall) {
        originalRequest._retry = true;

        try {

          const res = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL ?? ""}/users/refresh`,
              {},
              { withCredentials: true }
          );

          const { accessToken } = res.data;
          setToken(accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return httpClient(originalRequest);
        } catch (refreshError) {
          console.log("REFRESH FAILED:", refreshError.response);
          clearStorage();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
);

export default httpClient;