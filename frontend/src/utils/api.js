import axios from "axios";
import { BACKEND_URL } from "../config/apiConfig";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true, 
});

// Automatically attach Bearer token to all requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized responses to clear expired credentials and trigger auth sync
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/auth/login") && !url.includes("/auth/refresh-token")) {
        const hadToken = !!localStorage.getItem("accessToken");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (hadToken) {
          window.dispatchEvent(
            new CustomEvent("vocode-auth-sync", {
              detail: { user: null, accessToken: null },
            })
          );
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;