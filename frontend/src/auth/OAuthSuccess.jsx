import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "../styles/auth.css";

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    const completeLogin = async () => {
      try {
        const token = params.get("token");
        const userParam = params.get("user");
        const returnTo = params.get("returnTo");

        if (token) {
          let user = null;
          if (userParam) {
            try {
              user = JSON.parse(userParam);
            } catch {
              try {
                user = JSON.parse(decodeURIComponent(userParam));
              } catch (e) {
                console.warn("Could not parse user param:", e);
              }
            }
          }

          // If user object not provided in URL, fetch it using token
          if (!user) {
            try {
              const profileRes = await api.get("/auth/profile", {
                headers: { Authorization: `Bearer ${token}` },
              });
              user = profileRes.data?.user;
            } catch (pErr) {
              console.warn("Profile fetch error in OAuthSuccess:", pErr);
            }
          }

          // Write synchronously to localStorage before state transitions
          localStorage.setItem("accessToken", token);
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
          }

          login(token, user);

          const dest = returnTo && !returnTo.startsWith("/login") ? returnTo : "/dashboard";
          navigate(dest, { replace: true });
          return;
        }

        // Fallback: try refresh-token endpoint with cookie
        const { data } = await api.post("/auth/refresh-token");
        if (data?.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          login(data.accessToken, data.user);
          navigate("/dashboard", { replace: true });
          return;
        }

        throw new Error("No token returned from Google OAuth");
      } catch (err) {
        console.error("OAuth completion error:", err);
        navigate("/?auth=login&error=oauth_failed", { replace: true });
      }
    };

    completeLogin();
  }, []); // Run exactly once on mount

  return (
    <div
      className="auth-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#0c141b",
      }}
    >
      <div style={{ textAlign: "center", color: "#00ff9c" }}>
        <h2>Authenticating with Google...</h2>
        <p style={{ color: "#8aa4b8", marginTop: "8px" }}>
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
