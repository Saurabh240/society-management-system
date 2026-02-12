import axios from "axios";
import { getToken } from "../shared/utils/storage";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});



httpClient.interceptors.request.use(config => {
  const token = getToken();

  const isAuthRoute =
    config.url.includes("/login") ||
    config.url.includes("/register");

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default httpClient;


