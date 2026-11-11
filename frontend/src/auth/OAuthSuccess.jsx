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
        const googleConnected = params.get("googleConnected");
        const googleEmail = params.get("googleEmail");

        if (token && userParam) {
          const user = JSON.parse(decodeURIComponent(userParam));
          login(token, user);

          const email = googleEmail || user?.email || "Google Account";

          if (googleConnected) {
            const provider = params.get("provider") || "gemini";
            const model = params.get("model") || "gemini-1.5-pro";
            const modelLabel =
              model.includes("flash")
                ? `Google Gemini Flash (${email.split("@")[0]})`
                : `Google Gemini Pro (${email.split("@")[0]})`;

            const aiConfig = {
              provider,
              model,
              authMethod: "google",
              accountEmail: email,
              label: modelLabel,
              connectedAt: new Date().toISOString(),
            };

            // Save globally and user-scoped
            localStorage.setItem(
              "vocode_ai_provider_config",
              JSON.stringify(aiConfig)
            );
            localStorage.setItem(
              `vocode_ai_provider_config_${email}`,
              JSON.stringify(aiConfig)
            );

            // Also record in saved keys for instant re-selection
            try {
              const currentSaved = JSON.parse(
                localStorage.getItem(`vocode_ai_saved_keys_${email}`) ||
                localStorage.getItem("vocode_ai_saved_keys") ||
                "{}"
              );
              currentSaved[provider] = {
                authMethod: "google",
                accountEmail: email,
                model,
                updatedAt: new Date().toISOString(),
              };
              localStorage.setItem(
                "vocode_ai_saved_keys",
                JSON.stringify(currentSaved)
              );
              localStorage.setItem(
                `vocode_ai_saved_keys_${email}`,
                JSON.stringify(currentSaved)
              );
            } catch {}

            window.dispatchEvent(
              new CustomEvent("vocode-ai-config-changed", {
                detail: { aiConfig },
              })
            );
          }

          if (returnTo) {
            navigate(returnTo, { replace: true });
            return;
          }

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
