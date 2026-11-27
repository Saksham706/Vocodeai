/**
 * VocodeAI Backend URL Configuration
 * Resolves the active backend API URL with fallback to port 8000
 * Guarded against port 5000 conflicts with Docker Desktop.
 */

export const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  
  // When running on localhost / 127.0.0.1, prioritize local backend unless env specifies localhost
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    if (envUrl && envUrl.includes("localhost")) {
      return envUrl.replace(/\/+$/, "");
    }
    return "http://localhost:8000";
  }

  if (envUrl && !envUrl.includes(":5000") && envUrl !== "undefined") {
    return envUrl.replace(/\/+$/, "");
  }
  // Production fallback for vocodeai.com
  if (typeof window !== "undefined" && window.location.hostname.includes("vocodeai.com")) {
    return "https://api.vocodeai.com";
  }
  return "http://localhost:8000";
};

export const BACKEND_URL = getBackendUrl();
export default BACKEND_URL;

