/**
 * VocodeAI Backend URL Configuration
 * Resolves the active backend API URL with fallback to port 8000
 * Guarded against port 5000 conflicts with Docker Desktop.
 */

export const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (!envUrl || envUrl.includes(":5000") || envUrl === "undefined") {
    return "http://localhost:8000";
  }
  return envUrl.replace(/\/+$/, "");
};

export const BACKEND_URL = getBackendUrl();
export default BACKEND_URL;

