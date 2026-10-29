import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken") || null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  /* ================= AUTO REFRESH ON APP LOAD ================= */
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data } = await api.post("/auth/refresh-token");
        if (isMounted) {
          setAccessToken(data.accessToken);
          setUser(data.user);
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch {
        // If refresh fails and we have no stored valid token, clear session
        if (isMounted && !localStorage.getItem("accessToken")) {
          setAccessToken(null);
          setUser(null);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ================= LOGIN ================= */
  const login = useCallback((token, userData) => {
    setAccessToken(token);
    setUser(userData);
    if (token) localStorage.setItem("accessToken", token);
    if (userData) localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  /* ================= LOGOUT ================= */
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}

    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
