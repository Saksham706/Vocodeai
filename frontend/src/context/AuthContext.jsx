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

  /* ================= AUTO REFRESH & PROFILE SYNC ON APP LOAD ================= */
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");

      try {
        // If stored token exists, attempt to verify it with /auth/profile
        if (storedToken) {
          try {
            const { data } = await api.get("/auth/profile", {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (isMounted && data?.user) {
              setUser(data.user);
              localStorage.setItem("user", JSON.stringify(data.user));
              setLoading(false);
              return;
            }
          } catch {
            // Profile call failed, try refresh token cookie
          }
        }

        // Try refresh token endpoint
        const { data } = await api.post("/auth/refresh-token");
        if (isMounted && data?.user) {
          setAccessToken(data.accessToken);
          setUser(data.user);
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch {
        // If both failed, clear stale local session
        if (isMounted) {
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

  /* ================= SYNC ACROSS TABS / WINDOWS ================= */
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {}
      }
      if (e.key === "accessToken") {
        setAccessToken(e.newValue || null);
      }
    };

    const handleCustomSync = (e) => {
      if (e.detail?.user !== undefined) {
        setUser(e.detail.user);
      }
      if (e.detail?.accessToken !== undefined) {
        setAccessToken(e.detail.accessToken);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("vocode-auth-sync", handleCustomSync);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("vocode-auth-sync", handleCustomSync);
    };
  }, []);

  /* ================= LOGIN ================= */
  const login = useCallback((token, userData) => {
    setAccessToken(token);
    setUser(userData);
    if (token) localStorage.setItem("accessToken", token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      window.dispatchEvent(
        new CustomEvent("vocode-auth-sync", {
          detail: { user: userData, accessToken: token },
        })
      );
    }
  }, []);

  /* ================= LOGOUT ================= */
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("vocode_ai_provider_config");
      sessionStorage.clear();
      window.dispatchEvent(
        new CustomEvent("vocode-auth-sync", {
          detail: { user: null, accessToken: null },
        })
      );
    }
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
