import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  Zap,
  Cloud,
  Mic,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import AuthBackground from "./AuthBackground";
import "../styles/auth.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Signup() {
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

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      navigate("/login");
    } catch {
      setError("Server error. Please try again.");
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
      {/* Floating Theme Switcher Button (Just like Landing Page) */}
      <button
        type="button"
        className="auth-theme-switch-btn"
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-label="Toggle dark and light mode"
      >
        {theme === "dark" ? (
          <Sun size={19} className="theme-icon-sun" />
        ) : (
          <Moon size={19} className="theme-icon-moon" />
        )}
      </button>

      {/* Background SVG Artwork & Glowing Curves */}
      <AuthBackground theme={theme} />

      <div className="auth-container-fullscreen">
        {/* ================= LEFT COLUMN ================= */}
        <div className="auth-left-column">
          {/* Official Vocodeai Logo */}
          <div
            className="auth-brand-logo"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            title="Go to Vocodeai Home"
          >
            <img
              src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
              alt="Vocodeai Logo"
              className="auth-logo-img"
            />
          </div>

          {/* Heading */}
          <h1 className="auth-hero-title">
            Start Building <br />
            with Vocode<span className="auth-title-accent">ai</span>
          </h1>

          <p className="auth-hero-subtitle">
            Create your account and get started with your AI coding workspace.
          </p>

          {/* 3 Feature Benefit Badges */}
          <div className="auth-benefits-row">
            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <Zap size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Code smarter</span>
                <span>with AI</span>
              </div>
            </div>

            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <Cloud size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Run anywhere</span>
                <span>in the cloud</span>
              </div>
            </div>

            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <Mic size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Use voice</span>
                <span>commands</span>
              </div>
            </div>
          </div>

          {/* Terminal Illustration Card */}
          <div className="auth-terminal-card">
            <div className="auth-terminal-header">
              <span className="auth-dot red" />
              <span className="auth-dot yellow" />
              <span className="auth-dot green" />
            </div>
            <div className="auth-terminal-inner">
              <div className="auth-terminal-content">
                <div className="auth-terminal-line-cmd">
                  <span className="auth-cmd-prompt">&gt;_ $</span> create account
                </div>
                <div className="auth-terminal-line-status">
                  Setting up your workspace...
                </div>
                <div className="auth-terminal-line-ready">
                  <Sparkles size={14} className="auth-terminal-star" />
                  <span>Almost there!</span>
                </div>
              </div>
              <div className="auth-terminal-divider" />
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="auth-right-column">
          <div className="auth-card-panel">
            <h2 className="auth-card-title">Create your account</h2>
            <p className="auth-card-subtitle">
              Get started with your AI coding workspace.
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
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={submit} className="auth-form" noValidate>
              <div className="auth-field-group">
                <div className="auth-input-wrapper">
                  <UserRound size={17} className="auth-field-icon" />
                  <input
                    type="text"
                    name="firstName"
                    className="auth-text-input"
                    placeholder="First name *"
                    value={form.firstName}
                    onChange={change}
                    autoComplete="given-name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <div className="auth-input-wrapper">
                  <UserRound size={17} className="auth-field-icon" />
                  <input
                    type="text"
                    name="lastName"
                    className="auth-text-input"
                    placeholder="Last name *"
                    value={form.lastName}
                    onChange={change}
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <div className="auth-input-wrapper">
                  <Mail size={17} className="auth-field-icon" />
                  <input
                    type="email"
                    name="email"
                    className="auth-text-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={change}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <div className="auth-input-wrapper">
                  <Phone size={17} className="auth-field-icon" />
                  <input
                    type="tel"
                    name="phone"
                    className="auth-text-input"
                    placeholder="Phone (optional)"
                    value={form.phone}
                    onChange={change}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <div className="auth-input-wrapper">
                  <LockKeyhole size={17} className="auth-field-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="auth-text-input"
                    placeholder="Create password *"
                    value={form.password}
                    onChange={change}
                    autoComplete="new-password"
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

              {/* Terms Checkbox */}
              <div className="auth-terms-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    className="auth-checkbox-input"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span className={`auth-custom-checkbox ${agreeTerms ? "checked" : ""}`}>
                    {agreeTerms && (
                      <svg viewBox="0 0 12 10" className="auth-check-icon">
                        <path
                          d="M1.5 5L4.5 8L10.5 2"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="auth-terms-text">
                    I agree to the{" "}
                    <span
                      className="auth-terms-link"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span
                      className="auth-terms-link"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      Privacy Policy
                    </span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                <span>{loading ? "Creating account..." : "Sign Up →"}</span>
              </button>
            </form>

            <p className="auth-switch-footer">
              Already have an account?{" "}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
