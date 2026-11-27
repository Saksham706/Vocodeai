import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  Mail,
  Lock,
  LockKeyhole,
  UserRound,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { BACKEND_URL } from "../config/apiConfig";
import "../styles/auth.css";

const backendUrl = BACKEND_URL;

export default function AuthPopupModal({
  isOpen,
  initialMode = "login",
  onClose,
  theme = "dark",
}) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const [isClosing, setIsClosing] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setIsClosing(false);
      setLoginError("");
      setSignupError("");
      setSignupSuccess("");
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 1800);
  };

  const flipTo = (nextMode) => {
    setLoginError("");
    setSignupError("");
    setSignupSuccess("");
    setMode(nextMode);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    if (!loginEmail || !loginPassword) {
      setLoginError("Email and password are required");
      setLoginLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      login(data.accessToken, data.user);
      onClose?.();
      navigate("/dashboard");
    } catch (err) {
      setLoginError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoginLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const pwdStrength = getPasswordStrength(signupForm.password);

  const handleSignupChange = (e) =>
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess("");
    setSignupLoading(true);

    if (
      !signupForm.firstName.trim() ||
      !signupForm.lastName.trim() ||
      !signupForm.email.trim() ||
      !signupForm.password
    ) {
      setSignupError("Please fill in all required fields");
      setSignupLoading(false);
      return;
    }

    if (!agreeTerms) {
      setSignupError("Please accept the Terms of Service and Privacy Policy");
      setSignupLoading(false);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setSignupError(data.error || "Signup failed. Please try again.");
        return;
      }

      // Smoothly flip back to login with email pre-filled
      setLoginEmail(signupForm.email);
      setSignupSuccess("Account created! Flipping to login...");
      setTimeout(() => {
        flipTo("login");
      }, 900);
    } catch {
      setSignupError("Server connection failed. Please check your network.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const origin = encodeURIComponent(window.location.origin);
    window.location.href = `${backendUrl}/api/auth/google?origin=${origin}&prompt=select_account%20consent`;
  };

  return (
    <div
      className={`auth-popup-backdrop ${theme} ${isClosing ? "is-closing" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Log in to VocodeAI" : "Create VocodeAI account"}
    >
      <div className={`auth-popup-shell ${isClosing ? "is-closing" : ""}`}>
        <div className="auth-flip-perspective">
          <div className={`auth-flip-inner ${mode === "signup" ? "is-flipped" : ""}`}>
            {/* ================= FRONT FACE: LOGIN ================= */}
            <div className="auth-flip-face auth-flip-front">
              <div className="auth-card-panel auth-popup-card">
                <button
                  type="button"
                  className="auth-popup-close-btn"
                  onClick={handleClose}
                  aria-label="Close authentication modal"
                >
                  <X size={16} />
                </button>
                <div className="auth-popup-brand">
                  <img
                    src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
                    alt="Vocodeai Logo"
                    className="auth-popup-logo"
                  />
                </div>

                {loginError && (
                  <div className="auth-alert-error" role="alert">
                    <AlertCircle size={16} className="auth-alert-icon" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
                  <div className="auth-field-group">
                    <label className="auth-field-label">Email Address</label>
                    <div className="auth-input-wrapper">
                      <Mail size={17} className="auth-field-icon" />
                      <input
                        type="email"
                        className="auth-text-input"
                        placeholder="name@company.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
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
                        onClick={() => {
                          onClose?.();
                          navigate("/forgot");
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="auth-input-wrapper">
                      <Lock size={17} className="auth-field-icon" />
                      <input
                        type={showLoginPwd ? "text" : "password"}
                        className="auth-text-input"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-toggle"
                        onClick={() => setShowLoginPwd(!showLoginPwd)}
                        aria-label={showLoginPwd ? "Hide password" : "Show password"}
                      >
                        {showLoginPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-button"
                    disabled={loginLoading}
                  >
                    <span>{loginLoading ? "Signing in to Cloud..." : "Log In to VocodeAI"}</span>
                    <ArrowRight size={16} className="btn-arrow" />
                  </button>
                </form>

                <div className="auth-divider">
                  <span className="auth-divider-line" />
                  <span className="auth-divider-text">or</span>
                  <span className="auth-divider-line" />
                </div>

                <button
                  type="button"
                  className="auth-google-button"
                  onClick={handleGoogleSignIn}
                >
                  <img src="/google.png" alt="Google" className="auth-google-icon" />
                  <span>Continue with Google</span>
                </button>

                <p className="auth-switch-footer">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => flipTo("signup")}
                  >
                    Sign up free
                  </button>
                </p>
              </div>
            </div>

            {/* ================= BACK FACE: SIGNUP ================= */}
            <div className="auth-flip-face auth-flip-back">
              <div className="auth-card-panel auth-popup-card">
                <button
                  type="button"
                  className="auth-popup-close-btn"
                  onClick={handleClose}
                  aria-label="Close authentication modal"
                >
                  <X size={16} />
                </button>
                <div className="auth-popup-brand">
                  <img
                    src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
                    alt="Vocodeai Logo"
                    className="auth-popup-logo"
                  />
                </div>
                {signupError && (
                  <div className="auth-alert-error" role="alert">
                    <AlertCircle size={16} className="auth-alert-icon" />
                    <span>{signupError}</span>
                  </div>
                )}

                {signupSuccess && (
                  <div
                    className="auth-alert-error"
                    style={{
                      background: "rgba(0, 240, 152, 0.14)",
                      borderColor: "rgba(0, 240, 152, 0.35)",
                      color: "#00f098",
                    }}
                    role="status"
                  >
                    <Check size={16} />
                    <span>{signupSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} className="auth-form" noValidate>
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
                          value={signupForm.firstName}
                          onChange={handleSignupChange}
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
                          value={signupForm.lastName}
                          onChange={handleSignupChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-field-label">Work or Personal Email</label>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="auth-field-icon" />
                      <input
                        type="email"
                        name="email"
                        className="auth-text-input"
                        placeholder="jane@example.com"
                        value={signupForm.email}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-field-label">
                      Phone Number <span className="label-sub">(optional)</span>
                    </label>
                    <div className="auth-input-wrapper">
                      <Phone size={16} className="auth-field-icon" />
                      <input
                        type="tel"
                        name="phone"
                        className="auth-text-input"
                        placeholder="+1 (555) 000-0000"
                        value={signupForm.phone}
                        onChange={handleSignupChange}
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-field-label">Password</label>
                    <div className="auth-input-wrapper">
                      <LockKeyhole size={16} className="auth-field-icon" />
                      <input
                        type={showSignupPwd ? "text" : "password"}
                        name="password"
                        className="auth-text-input"
                        placeholder="Min. 8 characters"
                        value={signupForm.password}
                        onChange={handleSignupChange}
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-toggle"
                        onClick={() => setShowSignupPwd(!showSignupPwd)}
                        aria-label={showSignupPwd ? "Hide password" : "Show password"}
                      >
                        {showSignupPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {signupForm.password && (
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
                      I agree to the{" "}
                      <a href="/docs" target="_blank" rel="noreferrer">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/docs" target="_blank" rel="noreferrer">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="auth-submit-button"
                    disabled={signupLoading}
                  >
                    <span>
                      {signupLoading ? "Creating your workspace..." : "Create Free Account"}
                    </span>
                    <ArrowRight size={16} className="btn-arrow" />
                  </button>
                </form>

                <div className="auth-divider">
                  <span className="auth-divider-line" />
                  <span className="auth-divider-text">or</span>
                  <span className="auth-divider-line" />
                </div>

                <button
                  type="button"
                  className="auth-google-button"
                  onClick={handleGoogleSignIn}
                >
                  <img src="/google.png" alt="Google" className="auth-google-icon" />
                  <span>Continue with Google</span>
                </button>

                <p className="auth-switch-footer">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => flipTo("login")}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
