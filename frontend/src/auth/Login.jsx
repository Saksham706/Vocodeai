import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Cloud,
  Mic,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  AlertCircle,
  HardDrive,
  Laptop,
} from "lucide-react";
import AuthBackground from "./AuthBackground";
import "../styles/auth.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Theme state synced with landing page
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vocode_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vocode_theme", nextTheme);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleGoogleSignIn = () => {
    const origin = encodeURIComponent(window.location.origin);
    window.location.href = `${backendUrl}/api/auth/google?origin=${origin}`;
  };

  return (
    <div className={`auth-page-wrapper ${theme}`}>
      {/* Floating Theme Switcher Button */}
      <button
        type="button"
        className="auth-theme-switch-btn"
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-label="Toggle dark and light mode"
      >
        {theme === "dark" ? (
          <Sun size={18} className="theme-icon-sun" />
        ) : (
          <Moon size={18} className="theme-icon-moon" />
        )}
      </button>

      {/* Background SVG Curves & Atmospheric Lighting */}
      <AuthBackground theme={theme} />

      <div className="auth-container-fullscreen">
        {/* ================= LEFT COLUMN ================= */}
        <div className="auth-left-column">
          {/* Brand Logo */}
          <div
            className="auth-brand-logo"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            title="Vocodeai — Back to Home"
          >
            <img
              src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
              alt="Vocodeai Logo"
              className="auth-logo-img"
            />
            <span className="auth-version-pill">v2.0</span>
          </div>

          {/* Heading */}
          <h1 className="auth-hero-title">
            Welcome back to <br />
            Vocode<span className="auth-title-accent">ai</span>
          </h1>

          <p className="auth-hero-subtitle">
            Your voice-native, cloud developer studio. Code on any device with zero local installation.
          </p>

          {/* 3 Feature Benefit Badges */}
          <div className="auth-benefits-row">
            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <Mic size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Voice-to-code</span>
                <span>intelligence</span>
              </div>
            </div>

            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <Laptop size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>0 MB local setup</span>
                <span>runs in browser</span>
              </div>
            </div>

            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <HardDrive size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Continuous cloud</span>
                <span>auto-saving</span>
              </div>
            </div>
          </div>

          {/* Terminal Illustration Card */}
          <div className="auth-terminal-card">
            <div className="auth-terminal-header">
              <span className="auth-dot red" />
              <span className="auth-dot yellow" />
              <span className="auth-dot green" />
              <span className="auth-term-title">vocode-cloud: session_active</span>
            </div>
            <div className="auth-terminal-inner">
              <div className="auth-terminal-content">
                <div className="auth-terminal-line-cmd">
                  <span className="auth-cmd-prompt">&gt;_ $</span> vocode session restore --cloud
                </div>
                <div className="auth-terminal-line-status">
                  ✓ Reconnecting to cloud micro-VM container...
                </div>
                <div className="auth-terminal-line-ready">
                  <Sparkles size={14} className="auth-terminal-star" />
                  <span>Workspace state 100% synchronized</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="auth-right-column">
          <div className="auth-card-panel">
            <h2 className="auth-card-title">Log in to your workspace</h2>
            <p className="auth-card-subtitle">
              Welcome back! Access your cloud projects from any device.
            </p>

            {/* Google Sign-in */}
            <button
              type="button"
              className="auth-google-button"
              onClick={handleGoogleSignIn}
            >
              <img src="/google.png" alt="Google" className="auth-google-icon" />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">or continue with email</span>
              <span className="auth-divider-line" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-alert-error" role="alert">
                <AlertCircle size={16} className="auth-alert-icon" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-field-group">
                <label className="auth-field-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={17} className="auth-field-icon" />
                  <input
                    type="email"
                    className="auth-text-input"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <div className="auth-label-between">
                  <label className="auth-field-label">Password</label>
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => navigate("/forgot")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={17} className="auth-field-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-text-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                <span>{loading ? "Signing in to Cloud..." : "Log In to VocodeAI"}</span>
                <ArrowRight size={16} className="btn-arrow" />
              </button>
            </form>

            <p className="auth-switch-footer">
              Don’t have an account?{" "}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => navigate("/signup")}
              >
                Sign up free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
