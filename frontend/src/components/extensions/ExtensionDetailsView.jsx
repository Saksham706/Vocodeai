import React, { useState } from "react";
import { useAI } from "../../context/AIContext";
import {
  CheckCircle2,
  Download,
  Star,
  ExternalLink,
  Settings,
  Layers,
  Sparkles,
  Bot,
  RotateCcw,
  Check,
  X,
  Code2,
} from "lucide-react";
import AntigravityLogo from "../common/AntigravityLogo";
import AIModelSelector, { GoogleGLogo } from "../ai/AIModelSelector";

export default function ExtensionDetailsView({
  extension,
  isInstalled,
  onInstall,
  onUninstall,
  onOpenAI,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("details");
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [showAISetup, setShowAISetup] = useState(false);
  const { aiConfig } = useAI();
  const isAIExtension = extension?.category === "ai";
  const aiIsConnected = Boolean(
    (aiConfig?.authMethod === "google" && aiConfig?.projectId) &&
      (extension?.aiProvider ? aiConfig.provider === extension.aiProvider : true)
  );

  if (!extension) return null;

  if (showAISetup) {
    return (
      <div className="ext-ai-setup-view">
        <AIModelSelector
          key={`${extension.id}-${extension.defaultModel || "choose-model"}`}
          initialModelId={extension.defaultModel || null}
          initialStep={extension.defaultModel ? 2 : 1}
          isDismissible
          onCancel={() => setShowAISetup(false)}
        />
      </div>
    );
  }

  const handleInstallClick = () => {
    setInstalling(true);
    setTimeout(() => {
      onInstall(extension);
      setInstalling(false);
    }, 600);
  };

  const handleUninstallClick = () => {
    onUninstall(extension);
  };

  return (
    <div className="ext-details-view-container">
      {/* Top Banner Header */}
      <div className="ext-details-header">
        <div className="ext-details-header-main">
          {/* Extension Icon */}
          <div className="ext-details-icon-wrapper">
            {extension.iconType === "antigravity" ? (
              <AntigravityLogo size={58} />
            ) : extension.iconType === "google" ? (
              <GoogleGLogo size={48} />
            ) : (
              <Code2 size={48} color="#38BDF8" />
            )}
          </div>

          {/* Title & Metadata */}
          <div className="ext-details-meta">
            <h1 className="ext-details-title">{extension.name}</h1>

            <div className="ext-details-subline">
              <span className="ext-details-publisher">
                {extension.publisher}
                {extension.verified && (
                  <CheckCircle2
                    size={14}
                    className="ext-verified-icon"
                    title="Verified Publisher"
                  />
                )}
              </span>

              {extension.publisherUrl && (
                <>
                  <span className="ext-bullet-dot">•</span>
                  <a
                    href={extension.publisherUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ext-link"
                  >
                    google.com
                  </a>
                </>
              )}

              <span className="ext-bullet-dot">•</span>
              <span className="ext-downloads-count">
                <Download size={13} style={{ display: "inline", marginRight: 4 }} />
                {extension.downloads}
              </span>

              <span className="ext-bullet-dot">•</span>
              <span className="ext-rating-stars">
                <span style={{ color: "#F59E0B" }}>★★★☆☆</span>
                <span className="ext-rating-count">({extension.ratingCount || 140})</span>
              </span>
            </div>

            <p className="ext-details-desc">{extension.description}</p>

            {/* Action Bar: Install / Uninstall + Auto Update */}
            <div className="ext-details-actions-bar">
              {isInstalled ? (
                <button
                  type="button"
                  className="ext-btn-uninstall"
                  onClick={handleUninstallClick}
                >
                  Uninstall
                </button>
              ) : (
                <button
                  type="button"
                  className="ext-btn-primary-install"
                  onClick={handleInstallClick}
                  disabled={installing}
                >
                  {installing ? (
                    <>
                      <RotateCcw size={14} className="spin-icon" style={{ marginRight: 6 }} />
                      Installing...
                    </>
                  ) : (
                    "Install"
                  )}
                </button>
              )}

              {isAIExtension && (
                <button
                  type="button"
                  className="ext-btn-primary-install"
                  onClick={() => setShowAISetup(true)}
                >
                  {aiIsConnected ? "Manage Gemini account" : "Connect Google account"}
                </button>
              )}

              {isAIExtension && aiIsConnected && (
                <button
                  type="button"
                  className="ext-btn-uninstall"
                  onClick={onOpenAI}
                >
                  Open AI Assistant
                </button>
              )}

              <label className="ext-checkbox-label">
                <input
                  type="checkbox"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                />
                <span>Auto Update</span>
              </label>

              <button
                type="button"
                className="ext-btn-gear"
                title="Manage extension settings"
              >
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="ext-details-tabs-bar">
          <button
            className={`ext-tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            DETAILS
          </button>
          <button
            className={`ext-tab-btn ${activeTab === "features" ? "active" : ""}`}
            onClick={() => setActiveTab("features")}
          >
            FEATURES
          </button>
          <button
            className={`ext-tab-btn ${activeTab === "changelog" ? "active" : ""}`}
            onClick={() => setActiveTab("changelog")}
          >
            CHANGELOG
          </button>
        </div>
      </div>

      {/* Main Body: Content & Sidebar */}
      <div className="ext-details-body">
        {/* Left Column: Markdown Details */}
        <div className="ext-details-content-column">
          {activeTab === "details" && (
            <div className="ext-details-markdown">
              <h2>{extension.detailsTitle || extension.name}</h2>
              <p>
                {extension.description || "An extension for the VocodeAI workspace."}
              </p>
              {isAIExtension && (
                <p>
                  This listing connects Google Gemini to VocodeAI's built-in coding assistant through the Google account already linked to your VocodeAI sign-in. No API key is needed. Gemini usage, limits, and any charges are managed by Google for your selected Cloud project.
                </p>
              )}

              <h3>{isAIExtension ? "How it works" : "Key features"}</h3>
              <ul>
                {isAIExtension ? (
                  <>
                    <li>Connect the Google account already linked to VocodeAI.</li>
                    <li>Use the selected model in the built-in AI assistant for workspace questions and code changes.</li>
                    <li>Manage the Gemini project and view usage from Google AI Studio settings.</li>
                  </>
                ) : extension.keyFeatures ? (
                  extension.keyFeatures.map((kf, i) => (
                    <li key={i}>
                      <strong>{kf.title}:</strong> {kf.desc}
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <strong>Autonomous agent orchestration:</strong> Delegate
                      complex engineering tasks to a hierarchy of specialized
                      subagents that run in secure, ephemeral sandboxes.
                    </li>
                    <li>
                      <strong>Implementation plans:</strong> Ask Antigravity to
                      generate a plan before it makes multi-file changes, so you
                      can review the approach before any code is written.
                    </li>
                    <li>
                      <strong>Agent Manager:</strong> Manage and monitor your
                      agents and subagents, and review their artifacts before
                      changes land.
                    </li>
                    <li>
                      <strong>Model Context Protocol (MCP) integration:</strong>{" "}
                      Connect external databases and third-party tools by
                      configuring MCP servers including curated Build with Google
                      bundles.
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}

          {activeTab === "features" && (
            <div className="ext-details-markdown">
              <h2>{isAIExtension ? "AI connection details" : "Features & Capabilities"}</h2>
              {isAIExtension ? (
                <ul>
                  <li>Model: {extension.defaultModel || aiConfig?.model || "Choose a model during setup"}</li>
                  <li>Authentication: Google account sign-in; no manual API key.</li>
                  <li>Use the built-in AI Assistant button after connecting.</li>
                </ul>
              ) : (
                <ul>
                  <li>Workspace integration: {extension.description}</li>
                  <li>Manage this extension from the marketplace panel.</li>
                </ul>
              )}
            </div>
          )}

          {activeTab === "changelog" && (
            <div className="ext-details-markdown">
              <h2>Changelog</h2>
              <h4>v{extension.version || "1.0.0"}</h4>
              {isAIExtension ? (
                <ul>
                  <li>Uses the Google account already connected to VocodeAI.</li>
                  <li>Google manages project quotas, plan details, and any Gemini API billing.</li>
                </ul>
              ) : (
                <ul><li>{extension.description}</li></ul>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Marketplace Metadata */}
        <div className="ext-details-side-column">
          <div className="ext-side-section">
            <h4 className="ext-side-heading">Marketplace</h4>
            <div className="ext-side-entry">
              <span className="ext-side-label">Identifier</span>
              <span className="ext-side-val">{extension.id}</span>
            </div>
            <div className="ext-side-entry">
              <span className="ext-side-label">Version</span>
              <span className="ext-side-val">{extension.version}</span>
            </div>
            {isAIExtension && (
              <div className="ext-ai-connection-status" role="status">
                <span className={`ext-ai-status-dot ${aiIsConnected ? "connected" : "disconnected"}`} />
                {aiIsConnected
                  ? `Using ${aiConfig.label || aiConfig.model} with your Google account`
                  : "Connect your Google account to use Gemini"}
              </div>
            )}
            <div className="ext-side-entry">
              <span className="ext-side-label">Published</span>
              <span className="ext-side-val">{extension.published || "3 months ago"}</span>
            </div>
            <div className="ext-side-entry">
              <span className="ext-side-label">Last Released</span>
              <span className="ext-side-val">{extension.lastReleased || "18 hours ago"}</span>
            </div>
          </div>

          <div className="ext-side-section">
            <h4 className="ext-side-heading">Categories</h4>
            <div className="ext-categories-wrap">
              {(extension.categories || ["Programming Languages", "Machine Learning", "AI", "Chat"]).map(
                (cat, idx) => (
                  <span key={idx} className="ext-cat-chip">
                    {cat}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="ext-side-section">
            <h4 className="ext-side-heading">Resources</h4>
            <div className="ext-resources-links">
              <a href="#license" className="ext-resource-link">License</a>
              <a href="https://google.com" target="_blank" rel="noreferrer" className="ext-resource-link">
                Google
              </a>
              <a href="#marketplace" className="ext-resource-link">Marketplace</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

