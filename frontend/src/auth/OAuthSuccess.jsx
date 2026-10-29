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

        if (token && userParam) {
          const user = JSON.parse(decodeURIComponent(userParam));
          login(token, user);
          navigate("/dashboard", { replace: true });
          return;
        }

        // Fallback: try refresh-token endpoint with cookie
        const { data } = await api.post("/auth/refresh-token");
        login(data.accessToken, data.user);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("OAuth completion error:", err);
        navigate("/login", { replace: true });
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
