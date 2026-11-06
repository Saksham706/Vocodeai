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
  ArrowRight,
  AlertCircle,
  HardDrive,
  Laptop,
  Check,
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

  // Compute password strength (0 to 3)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const pwdStrength = getPasswordStrength(form.password);

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
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
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
        setError(data.error || "Signup failed. Please try again.");
        return;
      }

      navigate("/login");
    } catch {
      setError("Server connection failed. Please check your network.");
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
            Start Building <br />
            with Vocode<span className="auth-title-accent">ai</span>
          </h1>

          <p className="auth-hero-subtitle">
            Create your account in seconds. Zero local setup, persistent cloud storage, and AI pair programming.
          </p>

          {/* 3 Feature Benefit Badges */}
          <div className="auth-benefits-row">
            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <Mic size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Code with voice</span>
                <span>natural speech</span>
              </div>
            </div>

            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <Laptop size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Zero installation</span>
                <span>Mac, PC, iPad, Phone</span>
              </div>
            </div>

            <div className="auth-benefit-item">
              <div className="auth-benefit-icon-circle">
                <HardDrive size={17} className="auth-benefit-icon" />
              </div>
              <div className="auth-benefit-label">
                <span>Continuous backup</span>
                <span>100% cloud storage</span>
              </div>
            </div>
          </div>

          {/* Terminal Illustration Card */}
          <div className="auth-terminal-card">
            <div className="auth-terminal-header">
              <span className="auth-dot red" />
              <span className="auth-dot yellow" />
              <span className="auth-dot green" />
              <span className="auth-term-title">vocode-cloud: provision_workspace</span>
            </div>
            <div className="auth-terminal-inner">
              <div className="auth-terminal-content">
                <div className="auth-terminal-line-cmd">
                  <span className="auth-cmd-prompt">&gt;_ $</span> vocode workspace create --template fullstack
                </div>
                <div className="auth-terminal-line-status">
                  ✓ Isolated Linux container initialized in 118ms
                </div>
                <div className="auth-terminal-line-ready">
                  <Sparkles size={14} className="auth-terminal-star" />
                  <span>Free Forever Plan activated • Ready to code</span>
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

            <h2 className="auth-card-title">Create your free account</h2>
            <p className="auth-card-subtitle">
              Join developers building the future of software with VocodeAI.
            </p>

            {/* Google Sign-in */}
            <button
              type="button"
              className="auth-google-button"
              onClick={handleGoogleSignIn}
            >
              <img src="/google.png" alt="Google" className="auth-google-icon" />
              <span>Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">or register with email</span>
              <span className="auth-divider-line" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-alert-error" role="alert">
                <AlertCircle size={16} className="auth-alert-icon" />
                <span>{error}</span>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={submit} className="auth-form" noValidate>
              {/* First & Last Name row */}
              <div className="auth-row-two-col">
                <div className="auth-field-group">
                  <label className="auth-field-label">First Name</label>
                  <div className="auth-input-wrapper">
                    <UserRound size={16} className="auth-field-icon" />
                    <input
                      type="text"
                      name="firstName"
                      className="auth-text-input"
                      placeholder="Jane"
                      value={form.firstName}
                      onChange={change}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-group">
                  <label className="auth-field-label">Last Name</label>
                  <div className="auth-input-wrapper">
                    <UserRound size={16} className="auth-field-icon" />
                    <input
                      type="text"
                      name="lastName"
                      className="auth-text-input"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={change}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="auth-field-group">
                <label className="auth-field-label">Work or Personal Email</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-field-icon" />
                  <input
                    type="email"
                    name="email"
                    className="auth-text-input"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={change}
                    required
                  />
                </div>
              </div>

              {/* Phone (Optional) */}
              <div className="auth-field-group">
                <label className="auth-field-label">Phone Number <span className="label-sub">(optional)</span></label>
                <div className="auth-input-wrapper">
                  <Phone size={16} className="auth-field-icon" />
                  <input
                    type="tel"
                    name="phone"
                    className="auth-text-input"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={change}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field-group">
                <label className="auth-field-label">Password</label>
                <div className="auth-input-wrapper">
                  <LockKeyhole size={16} className="auth-field-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="auth-text-input"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={change}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {form.password && (
                  <div className="password-meter-wrap">
                    <div className="meter-bars">
                      <span className={`meter-bar ${pwdStrength >= 1 ? "active lvl-1" : ""}`} />
                      <span className={`meter-bar ${pwdStrength >= 2 ? "active lvl-2" : ""}`} />
                      <span className={`meter-bar ${pwdStrength >= 3 ? "active lvl-3" : ""}`} />
                    </div>
                    <span className="meter-label">
                      {pwdStrength === 0 && "Too short"}
                      {pwdStrength === 1 && "Weak password"}
                      {pwdStrength === 2 && "Good password"}
                      {pwdStrength >= 3 && "Strong password"}
                    </span>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="auth-checkbox"
                />
                <span className="checkbox-custom">
                  {agreeTerms && <Check size={12} strokeWidth={3} />}
                </span>
                <span className="checkbox-text">
                  I agree to the <a href="/docs" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="/docs" target="_blank" rel="noreferrer">Privacy Policy</a>.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                <span>{loading ? "Creating your workspace..." : "Create Free Account"}</span>
                <ArrowRight size={16} className="btn-arrow" />
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
