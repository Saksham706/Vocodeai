import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAI } from "../../context/AIContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getEffectiveSettings, getNestedValue } from "../../utils/settingsStorage";
import { verifyAIKeyApi } from "../../services/aiApi";
import {
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Key,
  ShieldCheck,
  RotateCcw,
  Bot,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import AntigravityLogo from "../common/AntigravityLogo";

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
    id: "gemini-3.8-flash",
    provider: "gemini",
    name: "Gemini 3.8 Flash Medium",
    company: "Google Antigravity",
    badge: "DEFAULT",
    badgeColor: "#38bdf8",
    desc: "Google's premier agent-first coding model with deep reasoning and file creation.",
    color: "#38bdf8",
    iconType: "antigravity",
  },
  {
    id: "gemini-1.5-pro",
    provider: "gemini",
    name: "Gemini 1.5 Pro",
    company: "Google",
    badge: "HIGH REASONING",
    badgeColor: "#818cf8",
    desc: "Extensive context window with deep architectural and multi-file reasoning.",
    color: "#4285F4",
    iconType: "gemini",
  },
  {
    id: "gpt-4o",
    provider: "openai",
    name: "ChatGPT (GPT-4o)",
    company: "OpenAI",
    badge: "FLAGSHIP",
    badgeColor: "#10a37f",
    desc: "OpenAI's flagship omni model for high precision logic, coding, and debugging.",
    color: "#10a37f",
    iconType: "openai",
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    name: "ChatGPT (GPT-4o Mini)",
    company: "OpenAI",
    badge: "FAST",
    badgeColor: "#34d399",
    desc: "Fast, efficient model for rapid prototyping, explanations, and quick edits.",
    color: "#10a37f",
    iconType: "openai",
  },
];

export const AI_PROVIDERS = COMPACT_MODELS;

export function CompactModelIcon({ iconType, color, size = 18 }) {
  if (iconType === "antigravity") {
    return <AntigravityLogo size={size} />;
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
  return <Bot size={size} />;
}

export default function AIModelSelector({
  onCancel,
  isDismissible = false,
  initialModelId = null,
  initialStep = 1,
}) {
  const { accessToken } = useAuth();
  const { aiConfig, connectProvider } = useAI();
  const { currentProject } = useWorkspace();
  const preferredModelId = getNestedValue(
    getEffectiveSettings(currentProject),
    "vocode.ai.defaultModel"
  );
  const validPreferredModelId = COMPACT_MODELS.some((model) => model.id === preferredModelId)
    ? preferredModelId
    : "gemini-3.8-flash";
  const validActiveModelId = COMPACT_MODELS.some((model) => model.id === aiConfig?.model)
    ? aiConfig.model
    : validPreferredModelId;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedModelId, setSelectedModelId] = useState(
    COMPACT_MODELS.some((model) => model.id === initialModelId)
      ? initialModelId
      : validActiveModelId
  );
  const selectedModelObj = COMPACT_MODELS.find((m) => m.id === selectedModelId) || COMPACT_MODELS[0];

  const [apiKeyInput, setApiKeyInput] = useState(() => {
    if (aiConfig?.provider === selectedModelObj.provider && aiConfig?.apiKey) {
      return aiConfig.apiKey;
    }
    return "";
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSelectModel = (model) => {
    setSelectedModelId(model.id);
    connectProvider({
      provider: model.provider,
      model: model.id,
      label: model.name,
      apiKey: aiConfig?.provider === model.provider ? (aiConfig?.apiKey || "") : "",
    });
    setSuccessMsg(`Switched to ${model.name}`);
    setTimeout(() => onCancel?.(), 300);
  };

  const handleOpenKeyConfig = (model, e) => {
    e.stopPropagation();
    setSelectedModelId(model.id);
    setErrorMsg("");
    setSuccessMsg("");
    if (aiConfig?.provider === model.provider && aiConfig?.apiKey) {
      setApiKeyInput(aiConfig.apiKey);
    } else {
      setApiKeyInput("");
    }
    setCurrentStep(2);
  };

  const handleConnect = async (e) => {
    e?.preventDefault?.();
    const cleanKey = apiKeyInput.trim();

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (cleanKey) {
        // Verify key against first-party endpoint
        const token = accessToken || localStorage.getItem("accessToken") || "";
        await verifyAIKeyApi(token, {
          provider: selectedModelObj.provider,
          apiKey: cleanKey,
        });
      }

      connectProvider({
        provider: selectedModelObj.provider,
        model: selectedModelObj.id,
        label: selectedModelObj.name,
        apiKey: cleanKey,
      });

      setSuccessMsg(
        cleanKey
          ? `${selectedModelObj.name} key verified & activated!`
          : `${selectedModelObj.name} activated with server credentials!`
      );
      setTimeout(() => onCancel?.(), 500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to verify API key. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-compact-wizard-panel">
      {/* Header */}
      <div className="ai-wizard-header">
        <div className="ai-wizard-brand">
          <CompactModelIcon iconType={selectedModelObj.iconType} color={selectedModelObj.color} size={22} />
          <div className="ai-wizard-titles">
            <h4 className="ai-wizard-title">VocodeAI Assistant - Select Engine</h4>
            <span className="ai-wizard-step-tag">
              Step {currentStep} of 2: {currentStep === 1 ? "Select Engine" : `Configure Key`}
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

      {/* Stepper Progress Bar */}
      <div className="ai-wizard-progress-bar">
        <div
          className={`ai-step-indicator ${currentStep >= 1 ? "active" : ""}`}
          onClick={() => setCurrentStep(1)}
          title="Click to switch models"
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
            API Key ({selectedModelObj.company})
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
                Choose your AI engine (runs directly on backend/.env keys):
              </span>
            </div>

            <div className="ai-compact-model-list">
              {COMPACT_MODELS.map((model) => {
                const isSelected = model.id === selectedModelId;
                const isActive = aiConfig?.model === model.id;
                return (
                  <div
                    key={model.id}
                    className={`ai-compact-model-card ${isSelected ? "selected" : ""} ${isActive ? "active-model" : ""}`}
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
                          {isActive && (
                            <span
                              className="ai-compact-badge"
                              style={{
                                color: "#10b981",
                                borderColor: "#10b98140",
                                backgroundColor: "#10b98115",
                              }}
                            >
                              ACTIVE
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

        {/* ================= STEP 2: CONFIGURE API KEY ================= */}
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

            {/* API Key Form */}
            <div className="ai-google-signin-box" style={{ marginTop: "10px" }}>
              <div className="ai-step-subdesc">
                Direct official API key for <strong>{selectedModelObj.company}</strong>. No third-party proxies.
              </div>

              <form onSubmit={handleConnect} className="ai-auth-credentials-form">
                <div className="ai-auth-field-group" style={{ marginTop: "10px" }}>
                  <div className="ai-auth-label-row">
                    <label className="ai-auth-label" htmlFor="model-api-key">
                      <Key size={14} style={{ marginRight: 5 }} />
                      <span>{selectedModelObj.provider === "openai" ? "OpenAI API Key" : "Gemini API Key"}</span>
                    </label>
                    <a
                      href={
                        selectedModelObj.provider === "openai"
                          ? "https://platform.openai.com/api-keys"
                          : "https://aistudio.google.com/app/apikey"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ai-token-get-link"
                      style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
                    >
                      <span>Get API Key</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <input
                    id="model-api-key"
                    type="password"
                    className="ai-auth-input"
                    placeholder={
                      selectedModelObj.provider === "openai"
                        ? "sk-proj-... (leave empty to use server .env)"
                        : "AIzaSy... (leave empty to use server .env)"
                    }
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    autoComplete="off"
                  />
                  <span className="ai-auth-hint" style={{ marginTop: "6px", display: "block" }}>
                    {apiKeyInput.trim()
                      ? "Your personal API key will be verified and used for this session."
                      : "Leaving this empty will automatically use the server's preconfigured environment key."}
                  </span>
                </div>

                {errorMsg && (
                  <div className="ai-wizard-alert error" style={{ marginTop: "10px" }}>
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="ai-wizard-alert success" style={{ marginTop: "10px" }}>
                    <CheckCircle2 size={14} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="ai-model-connect-btn"
                  disabled={loading}
                  style={{
                    marginTop: "14px",
                    background:
                      selectedModelObj.provider === "openai"
                        ? "linear-gradient(135deg, #10a37f, #059669)"
                        : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  }}
                >
                  {loading ? (
                    <>
                      <RotateCcw size={15} className="spin-icon" />
                      <span>Verifying & Connecting...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      <span>
                        {apiKeyInput.trim()
                          ? `Verify & Activate ${selectedModelObj.name}`
                          : `Activate ${selectedModelObj.name}`}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
