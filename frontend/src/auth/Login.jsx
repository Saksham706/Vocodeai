import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "../styles/auth.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.accessToken, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT SIDE */}
      <div className="auth-left">
        <div className="logo">
          <img src="/icon.png" alt="logo" />
          <span>VocodeAI</span>
        </div>

        <h1>Welcome to VocodeAI</h1>
        <p>Your AI-powered coding workspace</p>

        <div className="terminal-box">
          <div className="dots">
            <span className="red"></span>
            <span className="yellow"></span>
            <span className="green"></span>
          </div>
          <pre>
{`>_ $ vocode init
Initializing AI workspace...

✨ Ready to code smarter`}
          </pre>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Login to your account</h2>
          <p className="sub-text">Welcome back! Please enter your details.</p>

          <button
            className="google-btn"
            onClick={() =>
              (window.location.href = `${backendUrl}/api/auth/google`)
            }
          >
            <img src="/google.png" alt="google" />
            Continue with Google
          </button>

          <div className="divider">
            <span>or continue with email</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="forgot">
              <span onClick={() => navigate("/forgot")}>
                Forgot Password?
              </span>
            </div>

            <button className="primary-btn" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="switch">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/signup")}>Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
}