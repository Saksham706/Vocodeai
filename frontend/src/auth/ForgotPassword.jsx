import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Mail,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  HardDrive,
  Sparkles,
} from "lucide-react";
import AuthBackground from "./AuthBackground";
import "../styles/auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!email) {
      setError("Please enter your registered email address.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("A one-time verification code (OTP) has been sent to your email.");
      setTimeout(() => {
        navigate("/reset", { state: { email } });
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not send reset code. Please check the email and try again."
      );
    } finally {
      setLoading(false);
    }
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
            Recover Your <br />
            Vocode<span className="auth-title-accent">ai</span> Account
          </h1>

          <p className="auth-hero-subtitle">
            Zero-lockout security. We'll send an encrypted verification code to your email to verify your identity.
          </p>

          {/* 3 Security Benefit Badges */}
          <div className="auth-benefits-row">
            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <ShieldCheck size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>End-to-end</span>
                <span>encrypted reset</span>
              </div>
            </div>

            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <HardDrive size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Zero data loss</span>
                <span>workspaces intact</span>
              </div>
            </div>

            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <KeyRound size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Instant OTP</span>
                <span>sent to inbox</span>
              </div>
            </div>
          </div>

          {/* Terminal Illustration Card */}
          <div className="auth-terminal-card">
            <div className="auth-terminal-header">
              <span className="auth-dot red" />
              <span className="auth-dot yellow" />
              <span className="auth-dot green" />
              <span className="auth-term-title">vocode-security: auth_verify</span>
            </div>
            <div className="auth-terminal-inner">
              <div className="auth-terminal-content">
                <div className="auth-terminal-line-cmd">
                  <span className="auth-cmd-prompt">&gt;_ $</span> vocode auth request-password-reset
                </div>
                <div className="auth-terminal-line-status">
                  Generating secure single-use verification token...
                </div>
                <div className="auth-terminal-line-ready">
                  <Sparkles size={14} className="auth-terminal-star" />
                  <span>Your cloud workspaces remain encrypted and safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="auth-right-column">
          <div className="auth-card-panel">
            <button
              type="button"
              className="auth-back-link"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft size={15} />
              <span>Back to Login</span>
            </button>

            <h2 className="auth-card-title mt-2">Reset your password</h2>
            <p className="auth-card-subtitle">
              Enter your registered email and we'll send you a 6-digit verification code.
            </p>

            {/* Error Message */}
            {error && (
              <div className="auth-alert-error" role="alert">
                <AlertCircle size={16} className="auth-alert-icon" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="auth-alert-success" role="status">
                <CheckCircle2 size={16} className="auth-alert-icon" />
                <span>{message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={submit} className="auth-form" noValidate>
              <div className="auth-field-group">
                <label className="auth-field-label">Account Email Address</label>
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

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                <span>{loading ? "Sending verification code..." : "Send Verification Code"}</span>
                <ArrowRight size={16} className="btn-arrow" />
              </button>
            </form>

            <p className="auth-switch-footer">
              Remembered your password?{" "}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
