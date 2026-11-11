import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAI } from "../../context/AIContext";
import { getGoogleAIStatus, verifyAIKey } from "../../services/aiApi";
import { BACKEND_URL } from "../../config/apiConfig";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Bot,
  X,
  User,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { RobotAvatar } from "./RobotIllustration";

// Google 4-color SVG Logo
export function GoogleGLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.19 0 10.03 0 12c0 1.97.46 3.81 1.26 5.41l4.02-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
      />
    </svg>
  );
}

export const COMPACT_MODELS = [
  {
    id: "gemini-1.5-pro",
    provider: "gemini",
    name: "Google Gemini Pro",
    company: "Google",
    badge: "RECOMMENDED",
    badgeColor: "#38bdf8",
    desc: "Google flagship reasoning model for deep code analysis & architecture.",
    color: "#4285F4",
    iconType: "google",
    tokenPlaceholder: "AIzaSy... or personal Gemini API key",
    tokenHelpUrl: "https://aistudio.google.com/apikey",
    tokenHelpLabel: "Google AI Studio",
  },
  {
    id: "gemini-2.0-flash",
    provider: "gemini",
    name: "Google Gemini Flash",
    company: "Google",
    badge: "ULTRA FAST",
    badgeColor: "#34D399",
    desc: "Next-gen lightning speed model with sub-second response times.",
    color: "#38bdf8",
    iconType: "gemini",
    tokenPlaceholder: "AIzaSy... or personal Gemini API key",
    tokenHelpUrl: "https://aistudio.google.com/apikey",
    tokenHelpLabel: "Google AI Studio",
  },
  {
    id: "gpt-4o",
    provider: "openai",
    name: "ChatGPT (GPT-4o)",
    company: "OpenAI",
    badge: "POPULAR",
    badgeColor: "#10b981",
    desc: "OpenAI flagship model with strong multimodal vision and logic.",
    color: "#10a37f",
    iconType: "openai",
    tokenPlaceholder: "sk-proj-... or personal OpenAI token",
    tokenHelpUrl: "https://platform.openai.com/api-keys",
    tokenHelpLabel: "OpenAI Platform",
  },
  {
    id: "grok-2-latest",
    provider: "xai",
    name: "Grok-2",
    company: "xAI",
    badge: "NEXT GEN",
    badgeColor: "#F59E0B",
    desc: "Real-time reasoning and architectural decomposition by xAI.",
    color: "#FFFFFF",
    iconType: "xai",
    tokenPlaceholder: "xai-... or personal Grok token",
    tokenHelpUrl: "https://console.x.ai",
    tokenHelpLabel: "xAI Console",
  },
  {
    id: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    name: "Claude 3.5 Sonnet",
    company: "Anthropic",
    badge: "TOP CODING",
    badgeColor: "#EC4899",
    desc: "Nuanced code refactoring, clean architecture, and debugging.",
    color: "#F59E0B",
    iconType: "anthropic",
    tokenPlaceholder: "sk-ant-... or personal Claude token",
    tokenHelpUrl: "https://console.anthropic.com/settings/keys",
    tokenHelpLabel: "Anthropic Console",
  },
];

export const AI_PROVIDERS = COMPACT_MODELS;

export function CompactModelIcon({ iconType, color, size = 18 }) {
  if (iconType === "google") {
    return <GoogleGLogo size={size} />;
  }
  if (iconType === "gemini") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color || "#38bdf8"}>
        <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
      </svg>
    );
  }
  if (iconType === "openai") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color || "#10a37f"}>
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947z" />
      </svg>
    );
  }
  if (iconType === "xai") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#FFFFFF">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (iconType === "anthropic") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color || "#F59E0B"}>
        <path d="M14.053 2.5a1.2 1.2 0 0 0-1.106.74L6.2 18.5h3.14l1.37-3.4h5.58l1.37 3.4h3.14L15.16 3.24a1.2 1.2 0 0 0-1.107-.74zm-.053 4.35 1.95 4.95h-3.9z" />
      </svg>
    );
  }
  return <Bot size={size} />;
}

export default function AIModelSelector({ onCancel, isDismissible = false }) {
  const { user, accessToken } = useAuth();
  const { aiConfig, savedProviderKeys, connectProvider } = useAI();

  // Step 1 = Select Model, Step 2 = Sign In & Credential
  const [currentStep, setCurrentStep] = useState(1);

  // Default to Google Gemini Pro
  const [selectedModelId, setSelectedModelId] = useState(
    aiConfig?.model || "gemini-1.5-pro"
  );

  const selectedModelObj =
    COMPACT_MODELS.find((m) => m.id === selectedModelId) || COMPACT_MODELS[0];

  const isGoogle = selectedModelObj.provider === "gemini";

  // Account Email state - user can enter the required email they want to sign in with
  const [accountEmail, setAccountEmail] = useState(() => {
    return (
      user?.email ||
      aiConfig?.accountEmail ||
      savedProviderKeys?.[selectedModelObj.provider]?.accountEmail ||
      ""
    );
  });

  // Keep accountEmail in sync with the dynamically active user
  useEffect(() => {
    if (user?.email) {
      setAccountEmail(user.email);
    }
  }, [user?.email]);

  // Token / Credential input state
  const [tokenInput, setTokenInput] = useState(() => {
    return (
      savedProviderKeys?.[selectedModelObj.provider]?.apiKey ||
      aiConfig?.apiKey ||
      ""
    );
  });

  const [showToken, setShowToken] = useState(false);

  const [googleStatus, setGoogleStatus] = useState({
    hasGoogleToken: false,
    email: null,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check if current user already has Google OAuth linked on backend
  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const token = accessToken || localStorage.getItem("accessToken") || "";
        const res = await getGoogleAIStatus(token);
        if (mounted) {
          setGoogleStatus(res);
        }
      } catch {
        if (mounted) {
          setGoogleStatus({ hasGoogleToken: false, email: null });
        }
      }
    };
    fetchStatus();
    return () => {
      mounted = false;
    };
  }, [accessToken, currentStep]);

  // Sync email & token when selected model changes
  const handleSelectModel = (model) => {
    setSelectedModelId(model.id);
    setErrorMsg("");
    setSuccessMsg("");

    const saved = savedProviderKeys?.[model.provider];
    if (saved?.accountEmail) {
      setAccountEmail(saved.accountEmail);
    } else if (user?.email) {
      setAccountEmail(user.email);
    }

    if (saved?.apiKey) {
      setTokenInput(saved.apiKey);
    } else {
      setTokenInput("");
    }

    setCurrentStep(2);
  };

  // Direct Google OAuth authorization (VS Code extension model)
  const handleGoogleSignIn = (forceSwitch = false) => {
    setLoading(true);
    setErrorMsg("");

    const origin = window.location.origin;
    const returnTo = window.location.pathname;

    const oauthUrl = `${BACKEND_URL}/api/auth/google?action=ai_connect&provider=${encodeURIComponent(
      selectedModelObj.provider
    )}&model=${encodeURIComponent(
      selectedModelObj.id
    )}&origin=${encodeURIComponent(origin)}&returnTo=${encodeURIComponent(
      returnTo
    )}&prompt=select_account%20consent`;

    window.location.href = oauthUrl;
  };

  // When already linked with Google, activate immediately
  const handleActivateLinked = () => {
    const email = (accountEmail || googleStatus.email || user?.email || "Google Account").trim();

    connectProvider({
      provider: selectedModelObj.provider,
      model: selectedModelObj.id,
      authMethod: "google",
      accountEmail: email,
      apiKey: "",
      label: `${selectedModelObj.name} (${email.split("@")[0]})`,
      connectedAt: new Date().toISOString(),
    });

    setSuccessMsg(`Activated ${selectedModelObj.name} with ${email}!`);
    setTimeout(() => {
      onCancel?.();
    }, 400);
  };

  // Sign In with Email & Custom Model Credential / Token
  const handleConnectWithToken = async (e) => {
    e?.preventDefault?.();
    const email = accountEmail.trim();

    if (!email) {
      setErrorMsg("Please enter your account email to sign in.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = accessToken || localStorage.getItem("accessToken") || "";
      const trimmedKey = tokenInput.trim();

      const res = await verifyAIKey(token, {
        provider: selectedModelObj.provider,
        model: selectedModelObj.id,
        apiKey: trimmedKey,
        authMethod: trimmedKey ? "token" : "cloud",
        accountEmail: email,
      });

      const label = `${selectedModelObj.name} (${email.split("@")[0]})`;

      connectProvider({
        provider: selectedModelObj.provider,
        model: selectedModelObj.id,
        apiKey: trimmedKey,
        authMethod: trimmedKey ? "token" : "cloud",
        accountEmail: email,
        label,
        connectedAt: new Date().toISOString(),
      });

      setSuccessMsg(
        res.message || `Signed in as ${email}. ${selectedModelObj.name} activated!`
      );
      setTimeout(() => {
        onCancel?.();
      }, 500);
    } catch (err) {
      setErrorMsg(
        err.message || "Failed to verify credentials. Please verify your token."
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick Connect with Cloud Quota (Instant Workable Setup)
  const handleQuickConnectCloud = async () => {
    const email = (accountEmail || user?.email || "developer@vocode.ai").trim();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = accessToken || localStorage.getItem("accessToken") || "";
      const res = await verifyAIKey(token, {
        provider: selectedModelObj.provider,
        model: selectedModelObj.id,
        apiKey: "",
        authMethod: "cloud",
        accountEmail: email,
      });

      const label = `${selectedModelObj.name} (${email.split("@")[0]})`;

      connectProvider({
        provider: selectedModelObj.provider,
        model: selectedModelObj.id,
        apiKey: "",
        authMethod: "cloud",
        accountEmail: email,
        label,
        connectedAt: new Date().toISOString(),
      });

      setSuccessMsg(
        `Cloud Quota activated for ${email} with ${selectedModelObj.name}!`
      );
      setTimeout(() => {
        onCancel?.();
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || "Quick connect failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-compact-wizard-panel">
      {/* Header */}
      <div className="ai-wizard-header">
        <div className="ai-wizard-brand">
          <RobotAvatar size={28} />
          <div className="ai-wizard-titles">
            <h4 className="ai-wizard-title">AI Assistant Setup</h4>
            <span className="ai-wizard-step-tag">
              Step {currentStep} of 2:{" "}
              {currentStep === 1
                ? "Select AI Model"
                : `Sign In with ${selectedModelObj.company || selectedModelObj.name}`}
            </span>
          </div>
        </div>

        {isDismissible && onCancel && (
          <button
            type="button"
            className="ai-wizard-close-btn"
            onClick={onCancel}
            title="Back to Chat"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Sequential Stepper Progress Bar */}
      <div className="ai-wizard-progress-bar">
        <div
          className={`ai-step-indicator ${currentStep >= 1 ? "active" : ""}`}
          onClick={() => setCurrentStep(1)}
          title="Click to go back to Model Selection"
        >
          <span className="step-num">1</span>
          <span className="step-label">Select Model</span>
        </div>
        <div className="step-line" />
        <div
          className={`ai-step-indicator ${currentStep >= 2 ? "active" : ""}`}
          onClick={() => setCurrentStep(2)}
        >
          <span className="step-num">2</span>
          <span className="step-label">
            Sign In ({selectedModelObj.company || selectedModelObj.name.split(" ")[0]})
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="ai-wizard-content">
        {/* ================= STEP 1: CHOOSE MODEL ================= */}
        {currentStep === 1 && (
          <div className="ai-step-view">
            <div className="ai-step-heading">
              <span className="ai-step-instruction">
                Choose the AI model you want to work with:
              </span>
            </div>

            <div className="ai-compact-model-list">
              {COMPACT_MODELS.map((model) => {
                const isSelected = model.id === selectedModelId;
                return (
                  <div
                    key={model.id}
                    className={`ai-compact-model-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectModel(model)}
                  >
                    <div className="ai-compact-card-left">
                      <div
                        className="ai-compact-icon-wrap"
                        style={{ backgroundColor: `${model.color}15` }}
                      >
                        <CompactModelIcon
                          iconType={model.iconType}
                          color={model.color}
                          size={18}
                        />
                      </div>
                      <div className="ai-compact-info">
                        <div className="ai-compact-title-row">
                          <span className="ai-compact-name">{model.name}</span>
                          {model.badge && (
                            <span
                              className="ai-compact-badge"
                              style={{
                                color: model.badgeColor,
                                borderColor: `${model.badgeColor}40`,
                                backgroundColor: `${model.badgeColor}12`,
                              }}
                            >
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <span className="ai-compact-desc">{model.desc}</span>
                      </div>
                    </div>

                    <div className="ai-compact-card-arrow">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 2: SIGN IN & CREDENTIAL IMPLEMENTATION ================= */}
        {currentStep === 2 && (
          <div className="ai-step-view">
            {/* Selected Model Summary Badge */}
            <div className="ai-selected-model-pill">
              <div className="ai-selected-pill-left">
                <CompactModelIcon
                  iconType={selectedModelObj.iconType}
                  color={selectedModelObj.color}
                  size={16}
                />
                <span className="ai-selected-model-name">{selectedModelObj.name}</span>
                {selectedModelObj.badge && (
                  <span
                    className="ai-compact-badge mini"
                    style={{
                      color: selectedModelObj.badgeColor,
                      borderColor: `${selectedModelObj.badgeColor}40`,
                      backgroundColor: `${selectedModelObj.badgeColor}12`,
                    }}
                  >
                    {selectedModelObj.badge}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="ai-change-model-btn"
                onClick={() => setCurrentStep(1)}
              >
                Change Model
              </button>
            </div>

            {/* Sign-In & Model Credential Container */}
            <div className="ai-google-signin-box" style={{ marginTop: "10px" }}>
              <div className="ai-step-subdesc">
                Sign in with your <strong>{selectedModelObj.company} account email</strong> and
                implement your access token to activate <strong>{selectedModelObj.name}</strong>{" "}
                (VS Code style):
              </div>

              {/* 1-Click Google OAuth Option (If Gemini selected) */}
              {isGoogle && (() => {
                const isLinked = Boolean(googleStatus.hasGoogleToken && googleStatus.email);
                const isMatchingEmail =
                  isLinked &&
                  accountEmail &&
                  googleStatus.email.toLowerCase() === accountEmail.toLowerCase();

                return (
                  <div className="ai-google-oauth-section" style={{ marginBottom: "12px" }}>
                    {isMatchingEmail ? (
                      <>
                        <div className="ai-user-account-badge" style={{ marginBottom: "8px" }}>
                          <div className="ai-user-account-avatar">
                            <GoogleGLogo size={16} />
                          </div>
                          <div className="ai-user-account-details">
                            <span className="ai-user-account-label">Google Account Linked</span>
                            <span className="ai-user-account-email">
                              {googleStatus.email}
                            </span>
                          </div>
                          <CheckCircle2 size={16} color="#10b981" />
                        </div>

                        <button
                          type="button"
                          className="ai-google-login-btn"
                          onClick={handleActivateLinked}
                          disabled={loading}
                        >
                          <GoogleGLogo size={18} />
                          <span>Continue with {googleStatus.email}</span>
                        </button>

                        <button
                          type="button"
                          className="ai-google-switch-btn"
                          onClick={() => handleGoogleSignIn(true)}
                          disabled={loading}
                          style={{ marginTop: "6px" }}
                        >
                          Sign In with a different Google Account
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="ai-google-login-btn"
                        onClick={() => handleGoogleSignIn(true)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RotateCcw size={15} className="spin-icon" />
                            <span>Connecting with Google...</span>
                          </>
                        ) : (
                          <>
                            <GoogleGLogo size={18} />
                            <span>
                              {accountEmail
                                ? `Sign in with Google (${accountEmail})`
                                : "1-Click Sign In with Google Account"}
                            </span>
                          </>
                        )}
                      </button>
                    )}

                    <div className="ai-auth-divider">
                      <span>OR ENTER ACCOUNT CREDENTIALS</span>
                    </div>
                  </div>
                );
              })()}

              {/* Email & Token Sign-In Form */}
              <form onSubmit={handleConnectWithToken} className="ai-auth-credentials-form">
                {/* Email Field */}
                <div className="ai-auth-field-group">
                  <label className="ai-auth-label">
                    <Mail size={13} />
                    <span>Account Email (Sign-in Email)</span>
                    <span className="ai-auth-required">*</span>
                  </label>
                  <input
                    type="email"
                    className="ai-auth-input"
                    placeholder="e.g. developer@company.com"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    required
                  />
                  <span className="ai-auth-hint">
                    Enter the email you want to associate with this {selectedModelObj.company} session.
                  </span>
                </div>

                {/* Token / Credential Field */}
                <div className="ai-auth-field-group" style={{ marginTop: "10px" }}>
                  <div className="ai-auth-label-row">
                    <label className="ai-auth-label">
                      <KeyRound size={13} />
                      <span>{selectedModelObj.name} Access Token / API Key</span>
                    </label>
                    {selectedModelObj.tokenHelpUrl && (
                      <a
                        href={selectedModelObj.tokenHelpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ai-token-get-link"
                        title={`Open ${selectedModelObj.tokenHelpLabel} in new tab`}
                      >
                        <span>Get Token</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <div className="ai-auth-input-wrapper">
                    <input
                      type={showToken ? "text" : "password"}
                      className="ai-auth-input token-input"
                      placeholder={selectedModelObj.tokenPlaceholder}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="ai-pw-toggle-btn"
                      onClick={() => setShowToken(!showToken)}
                      title={showToken ? "Hide token" : "Show token"}
                    >
                      {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <span className="ai-auth-hint">
                    Token is securely implemented and linked to your {selectedModelObj.name} model.
                  </span>
                </div>

                {/* Primary Sign-In & Activate Button */}
                <button
                  type="submit"
                  className="ai-model-connect-btn"
                  disabled={loading}
                  style={{
                    marginTop: "14px",
                    background:
                      selectedModelObj.provider === "openai"
                        ? "linear-gradient(135deg, #10a37f, #059669)"
                        : selectedModelObj.provider === "xai"
                        ? "linear-gradient(135deg, #27272a, #09090b)"
                        : selectedModelObj.provider === "anthropic"
                        ? "linear-gradient(135deg, #d97706, #b45309)"
                        : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    border:
                      selectedModelObj.provider === "xai"
                        ? "1px solid rgba(255, 255, 255, 0.25)"
                        : "none",
                  }}
                >
                  {loading ? (
                    <>
                      <RotateCcw size={15} className="spin-icon" />
                      <span>Verifying & Connecting...</span>
                    </>
                  ) : (
                    <>
                      <CompactModelIcon
                        iconType={selectedModelObj.iconType}
                        color="#ffffff"
                        size={15}
                      />
                      <span>Sign In & Activate {selectedModelObj.name}</span>
                    </>
                  )}
                </button>

                {/* Quick Connect / Cloud Quota Option */}
                <button
                  type="button"
                  className="ai-quick-connect-btn"
                  onClick={handleQuickConnectCloud}
                  disabled={loading}
                  title="Connect instantly using VocodeAI Cloud Quota without needing a personal token"
                >
                  <Zap size={13} color="#10b981" />
                  <span>Instant Connect with Cloud Quota</span>
                </button>
              </form>

              {/* Benefits Checklist */}
              <div className="ai-google-benefits" style={{ marginTop: "12px" }}>
                <div className="ai-benefit-item">
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Connected with your required email & personal quota</span>
                </div>
                <div className="ai-benefit-item">
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Model credential implemented directly for code generation & pair programming</span>
                </div>
                <div className="ai-benefit-item">
                  <ShieldCheck size={13} color="#10b981" />
                  <span>VS Code extension architecture with encrypted local persistence</span>
                </div>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {errorMsg && (
              <div className="ai-compact-alert error" style={{ marginTop: "10px" }}>
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="ai-compact-alert success" style={{ marginTop: "10px" }}>
                <CheckCircle2 size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Bottom Stepper Back Button */}
            <div className="ai-wizard-bottom-actions" style={{ marginTop: "12px" }}>
              <button
                type="button"
                className="ai-wizard-back-btn"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={13} />
                <span>Back to Models</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
