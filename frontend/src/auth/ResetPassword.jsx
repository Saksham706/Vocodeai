import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import {
  LockKeyhole,
  KeyRound,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  HardDrive,
  Sparkles,
} from "lucide-react";
import AuthBackground from "./AuthBackground";
import "../styles/auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

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

  const [form, setForm] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot");
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.otp || !form.newPassword || !form.confirmPassword) {
      setError("Please complete all required fields");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email,
        otp: form.otp.trim(),
        newPassword: form.newPassword,
      });

      setSuccess("Password updated successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP code or expired token");
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

      {/* Background SVG Artwork & Glowing Atmosphere */}
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
            Secure Your <br />
            Vocode<span className="auth-title-accent">ai</span> Workspace
          </h1>

          <p className="auth-hero-subtitle">
            Create a new, strong password to protect your cloud containers, repositories, and API credentials.
          </p>

          {/* 3 Security Benefit Badges */}
          <div className="auth-benefits-row">
            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <ShieldCheck size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>AES-256</span>
                <span>encrypted session</span>
              </div>
            </div>

            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <HardDrive size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Cloud projects</span>
                <span>fully preserved</span>
              </div>
            </div>

            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <Sparkles size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Instant token</span>
                <span>session renewal</span>
              </div>
            </div>
          </div>

          {/* Terminal Illustration Card */}
          <div className="auth-terminal-card">
            <div className="auth-terminal-header">
              <span className="auth-dot red" />
              <span className="auth-dot yellow" />
              <span className="auth-dot green" />
              <span className="auth-term-title">vocode-security: update_credentials</span>
            </div>
            <div className="auth-terminal-inner">
              <div className="auth-terminal-content">
                <div className="auth-terminal-line-cmd">
                  <span className="auth-cmd-prompt">&gt;_ $</span> vocode auth apply-new-password
                </div>
                <div className="auth-terminal-line-status">
                  Rotating authentication keys across active cloud sessions...
                </div>
                <div className="auth-terminal-line-ready">
                  <Sparkles size={14} className="auth-terminal-star" />
                  <span>Ready to reconnect to your dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="auth-right-column">
          <div className="auth-card-panel">
            {/* Mobile-only brand header */}
            <div
              className="auth-mobile-brand"
              onClick={() => navigate("/")}
              role="button"
              tabIndex={0}
              title="Vocodeai — Back to Home"
            >
              <img
                src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
                alt="Vocodeai Logo"
                className="auth-mobile-logo"
              />
              <span className="auth-version-pill">v2.0</span>
            </div>

            <button
              type="button"
              className="auth-back-link"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft size={15} />
              <span>Back to Login</span>
            </button>

            <h2 className="auth-card-title mt-2">Set new password</h2>
            <p className="auth-card-subtitle">
              Enter the verification code sent to your email and choose your new password.
            </p>

            {email && (
              <div className="auth-email-target-pill">
                <span>Code sent to: <strong>{email}</strong></span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="auth-alert-error" role="alert">
                <AlertCircle size={16} className="auth-alert-icon" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="auth-alert-success" role="status">
                <CheckCircle2 size={16} className="auth-alert-icon" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={submit} className="auth-form" noValidate>
              {/* Verification OTP Code */}
              <div className="auth-field-group">
                <label className="auth-field-label">One-Time Verification Code (OTP)</label>
                <div className="auth-input-wrapper">
                  <KeyRound size={17} className="auth-field-icon" />
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit code"
                    className="auth-text-input auth-otp-input"
                    value={form.otp}
                    onChange={handleChange}
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="auth-field-group">
                <label className="auth-field-label">New Password</label>
                <div className="auth-input-wrapper">
                  <LockKeyhole size={17} className="auth-field-icon" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    className="auth-text-input"
                    placeholder="Min. 8 characters"
                    value={form.newPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="auth-field-group">
                <label className="auth-field-label">Confirm New Password</label>
                <div className="auth-input-wrapper">
                  <LockKeyhole size={17} className="auth-field-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="auth-text-input"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                <span>{loading ? "Updating credentials..." : "Reset Password & Log In"}</span>
                <ArrowRight size={16} className="btn-arrow" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
