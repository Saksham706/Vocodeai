import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAI } from "../../context/AIContext";
import { getGoogleAIStatus } from "../../services/aiApi";
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
  ExternalLink,
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
    badge: "Recommended",
    badgeColor: "#38bdf8",
    desc: "Google flagship reasoning model for deep code analysis & architecture.",
    color: "#4285F4",
    iconType: "google",
  },
  {
    id: "gemini-2.0-flash",
    provider: "gemini",
    name: "Google Gemini Flash",
    company: "Google",
    badge: "Ultra Fast",
    badgeColor: "#34D399",
    desc: "Next-gen lightning speed model with sub-second response times.",
    color: "#38bdf8",
    iconType: "gemini",
  },
  {
    id: "gpt-4o",
    provider: "openai",
    name: "ChatGPT (GPT-4o)",
    company: "OpenAI",
    badge: "Popular",
    badgeColor: "#10b981",
    desc: "OpenAI flagship model with strong multimodal vision and logic.",
    color: "#10a37f",
    iconType: "openai",
  },
  {
    id: "grok-2-latest",
    provider: "xai",
    name: "Grok-2",
    company: "xAI",
    badge: "Next Gen",
    badgeColor: "#F59E0B",
    desc: "Real-time reasoning and architectural decomposition by xAI.",
    color: "#FFFFFF",
    iconType: "xai",
  },
  {
    id: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    name: "Claude 3.5 Sonnet",
    company: "Anthropic",
    badge: "Top Coding",
    badgeColor: "#EC4899",
    desc: "Nuanced code refactoring, clean architecture, and debugging.",
    color: "#F59E0B",
    iconType: "anthropic",
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
  const { aiConfig, connectProvider } = useAI();

  // Step 1 = Select Model, Step 2 = Sign In with Google
  const [currentStep, setCurrentStep] = useState(1);

  // Default to Google Gemini Pro
  const [selectedModelId, setSelectedModelId] = useState(
    aiConfig?.model || "gemini-1.5-pro"
  );

  const selectedModelObj =
    COMPACT_MODELS.find((m) => m.id === selectedModelId) || COMPACT_MODELS[0];

  const isGoogle = selectedModelObj.provider === "gemini";

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

  const handleSelectModel = (model) => {
    setSelectedModelId(model.id);
    setErrorMsg("");
    setSuccessMsg("");
    setCurrentStep(2);
  };

  // Direct Google OAuth authorization (VS Code extension model)
  const handleGoogleSignIn = () => {
    setLoading(true);
    setErrorMsg("");

    const origin = window.location.origin;
    const returnTo = window.location.pathname;
    const userId = user?.id || user?._id || "";

    const oauthUrl = `${BACKEND_URL}/api/auth/google?action=ai_connect&provider=${encodeURIComponent(
      selectedModelObj.provider
    )}&model=${encodeURIComponent(
      selectedModelObj.id
    )}&origin=${encodeURIComponent(origin)}&returnTo=${encodeURIComponent(
      returnTo
    )}&userId=${encodeURIComponent(userId)}`;

    window.location.href = oauthUrl;
  };

  // When already linked, activate immediately
  const handleActivateLinked = () => {
    const email = googleStatus.email || user?.email || "Google Account";

    connectProvider({
      provider: selectedModelObj.provider,
      model: selectedModelObj.id,
      authMethod: "google",
      accountEmail: email,
      label: `${selectedModelObj.name} (${email.split("@")[0]})`,
      connectedAt: new Date().toISOString(),
    });

    setSuccessMsg(`Activated ${selectedModelObj.name} with ${email}!`);
    setTimeout(() => {
      onCancel?.();
    }, 400);
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
              Step {currentStep} of 2: {currentStep === 1 ? "Select AI Model" : "Sign In with Google"}
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
          <span className="step-label">Sign In (Google)</span>
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

        {/* ================= STEP 2: SIGN IN WITH GOOGLE ================= */}
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
              </div>
              <button
                type="button"
                className="ai-change-model-btn"
                onClick={() => setCurrentStep(1)}
              >
                Change
              </button>
            </div>

            {/* Google Sign-In Card */}
            <div className="ai-google-signin-box" style={{ marginTop: "8px" }}>
              {googleStatus.hasGoogleToken ? (
                // Already authenticated with Google
                <>
                  <div className="ai-user-account-badge" style={{ marginBottom: "14px" }}>
                    <div className="ai-user-account-avatar">
                      <GoogleGLogo size={16} />
                    </div>
                    <div className="ai-user-account-details">
                      <span className="ai-user-account-label">Google Account Linked</span>
                      <span className="ai-user-account-email">
                        {googleStatus.email || user?.email}
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
                    <Zap size={16} color="#10b981" />
                    <span>Start Using {selectedModelObj.name}</span>
                  </button>

                  <button
                    type="button"
                    className="ai-google-switch-btn"
                    onClick={handleGoogleSignIn}
                    style={{ marginTop: "8px" }}
                  >
                    Switch Google Account
                  </button>
                </>
              ) : (
                // Not authenticated yet: 1-click Sign in with Google
                <>
                  <div style={{ fontSize: "13px", color: "#e2e8f0", marginBottom: "12px", lineHeight: "1.5" }}>
                    Sign in directly with your <strong>Google Account</strong> to use your personal{" "}
                    <strong>{selectedModelObj.name}</strong> quota (same as VS Code extension):
                  </div>

                  {user?.email && (
                    <div className="ai-user-account-badge" style={{ marginBottom: "12px" }}>
                      <div className="ai-user-account-avatar">
                        <GoogleGLogo size={15} />
                      </div>
                      <div className="ai-user-account-details">
                        <span className="ai-user-account-label">Logged in as</span>
                        <span className="ai-user-account-email">{user.email}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="ai-google-login-btn"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RotateCcw size={16} className="spin-icon" />
                        <span>Opening Google Sign-In...</span>
                      </>
                    ) : (
                      <>
                        <GoogleGLogo size={18} />
                        <span>Sign In with Google Account</span>
                      </>
                    )}
                  </button>
                </>
              )}

              <div className="ai-google-benefits" style={{ marginTop: "14px" }}>
                <div className="ai-benefit-item">
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Runs directly on your personal Google Gemini account</span>
                </div>
                <div className="ai-benefit-item">
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Zero API key setup needed</span>
                </div>
                <div className="ai-benefit-item">
                  <ShieldCheck size={13} color="#10b981" />
                  <span>Secure Google OAuth authentication</span>
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
            <div className="ai-wizard-bottom-actions" style={{ marginTop: "14px" }}>
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
