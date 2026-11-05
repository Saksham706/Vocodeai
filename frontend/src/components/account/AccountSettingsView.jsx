import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  KeyRound,
  Globe,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowLeft,
  Save,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Cpu,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  Layers,
  Camera,
  Upload,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function GithubIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
import {
  updateProfile,
  changePassword,
  fetchGithubStatus,
  connectGithubToken,
  disconnectGithub,
  fetchStorageUsage,
} from "../../services/authApi";
import {
  getUserSettings,
  saveUserSettings,
  setNestedValue,
  getEffectiveSettings,
} from "../../utils/settingsStorage";
import "../../styles/account.css";

const AVATAR_OPTIONS = [
  { id: "default", label: "Initial Badge", type: "initial" },
  { id: "owl", label: "Voca Robot Owl", icon: "🦉" },
  { id: "cyber", label: "Cyber Coder", icon: "⚡" },
  { id: "terminal", label: "Matrix Terminal", icon: "💻" },
  { id: "rocket", label: "Rocket Pioneer", icon: "🚀" },
  { id: "shield", label: "Code Guardian", icon: "🛡️" },
];

export default function AccountSettingsView({ onBack, onSignOut }) {
  const { user, accessToken, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [displayName, setDisplayName] = useState(() => {
    return (
      getEffectiveSettings()?.account?.displayName ||
      (user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : user?.name || "")
    );
  });
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(() => {
    return (
      localStorage.getItem("vocode_user_bio") ||
      "Cloud Developer • Building intelligent full-stack applications with voice"
    );
  });
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem("vocode_user_avatar") || "default";
  });

  // Profile Save Status
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // GitHub State
  const [githubStatus, setGithubStatus] = useState({
    connected: Boolean(user?.githubId || user?.githubUsername),
    username: user?.githubUsername || null,
    avatar: user?.githubAvatar || null,
  });
  const [githubTokenInput, setGithubTokenInput] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubMessage, setGithubMessage] = useState(null);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return getEffectiveSettings()?.account?.twoFactorEnabled ?? false;
  });

  // Dynamic Cloud Storage Calculation State
  const [storageData, setStorageData] = useState({
    usedFormatted: "Calculating...",
    maxFormatted: "10.0 GB",
    percentUtilized: 1,
    availableFormatted: "10.0 GB",
    workspaceCount: 0,
    loading: true,
  });

  // Load real storage quota and calculation from server
  useEffect(() => {
    if (!accessToken) return;
    fetchStorageUsage(accessToken)
      .then((data) => {
        if (data) {
          setStorageData({
            usedFormatted: data.usedFormatted,
            maxFormatted: data.maxFormatted,
            percentUtilized: data.percentUtilized,
            availableFormatted: data.availableFormatted,
            workspaceCount: data.workspaceCount,
            loading: false,
          });
        }
      })
      .catch(() => {
        setStorageData((prev) => ({
          ...prev,
          usedFormatted: "0.0 MB",
          loading: false,
        }));
      });
  }, [accessToken]);

  // Reactive Avatar Switcher: Updates local state, localStorage, dispatches event to bottom sidebar & syncs backend
  const handleSelectAvatar = (newAvatar) => {
    setSelectedAvatar(newAvatar);
    localStorage.setItem("vocode_user_avatar", newAvatar);

    // Dispatch event for real-time reactivity in DashboardSidebar and anywhere else
    window.dispatchEvent(
      new CustomEvent("vocode-avatar-changed", { detail: { avatar: newAvatar } })
    );

    // Update cached user object
    try {
      const cached = localStorage.getItem("user");
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.avatar = newAvatar;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
    } catch {}

    // Auto-persist avatar directly to backend database
    if (accessToken) {
      updateProfile(accessToken, { avatar: newAvatar }).catch((err) => {
        console.warn("Avatar auto-save warning:", err);
      });
    }
  };

  // Custom Photo File Upload with Canvas Compression
  const handleCustomPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select an image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Photo size must be under 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const imgData = uploadEvent.target?.result;
      if (imgData) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 256;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.88);
          handleSelectAvatar(compressed);
        };
        img.src = imgData;
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      if (accessToken) {
        await updateProfile(accessToken, {
          firstName,
          lastName,
          phone,
          avatar: selectedAvatar,
        });
      }

      // Update global display name in settings storage
      const currentSettings = getUserSettings();
      const updated = setNestedValue(currentSettings, "account.displayName", displayName);
      saveUserSettings(updated);

      localStorage.setItem("vocode_user_bio", bio);
      localStorage.setItem("vocode_user_avatar", selectedAvatar);

      // Dispatch settings changed event for sidebar name
      window.dispatchEvent(
        new CustomEvent("vocode-settings-changed", { detail: { settings: updated } })
      );

      // Dispatch avatar changed event for sidebar photo
      window.dispatchEvent(
        new CustomEvent("vocode-avatar-changed", { detail: { avatar: selectedAvatar } })
      );

      // Update cached user object in localStorage if user exists
      const cached = localStorage.getItem("user");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          parsed.firstName = firstName;
          parsed.lastName = lastName;
          parsed.phone = phone;
          parsed.avatar = selectedAvatar;
          parsed.name = displayName;
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch {}
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message || "Failed to save profile changes");
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Update
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(accessToken, { currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle GitHub Token Connect
  const handleConnectGithub = async () => {
    if (!githubTokenInput.trim()) return;
    setGithubLoading(true);
    setGithubMessage(null);

    try {
      const res = await connectGithubToken(accessToken, githubTokenInput.trim());
      setGithubStatus({
        connected: true,
        username: res.username,
        avatar: res.avatar,
      });
      setGithubMessage({ type: "success", text: `Connected to @${res.username}` });
      setGithubTokenInput("");
    } catch (err) {
      setGithubMessage({ type: "error", text: err.message || "Connection failed" });
    } finally {
      setGithubLoading(false);
    }
  };

  // Handle GitHub Disconnect
  const handleDisconnectGithub = async () => {
    setGithubLoading(true);
    try {
      await disconnectGithub(accessToken);
      setGithubStatus({ connected: false, username: null, avatar: null });
      setGithubMessage({ type: "success", text: "GitHub disconnected successfully" });
    } catch (err) {
      setGithubMessage({ type: "error", text: err.message || "Disconnect failed" });
    } finally {
      setGithubLoading(false);
    }
  };

  // Handle 2FA Toggle
  const handleToggle2FA = (val) => {
    setTwoFactorEnabled(val);
    const curr = getUserSettings();
    const updated = setNestedValue(curr, "account.twoFactorEnabled", val);
    saveUserSettings(updated);
  };

  // User initial calculation
  const userInitial = (displayName || firstName || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="account-settings-container animate-fade-in">
      {/* ===== TOP NAVIGATION / HEADER ===== */}
      <header className="account-header">
        <div className="account-header-left">
          {onBack && (
            <button
              type="button"
              className="dash-back-arrow-btn account-back-btn"
              onClick={onBack}
              title="Back to Workspaces"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <nav className="account-breadcrumbs">
              <span>VocodeAI</span>
              <ChevronRight size={12} />
              <span>Account</span>
              <ChevronRight size={12} />
              <span className="current">Settings & Profile</span>
            </nav>
            <h1 className="account-title">
              <User size={22} className="text-accent" />
              <span>Account Settings</span>
            </h1>
          </div>
        </div>

        <div className="account-header-actions">
          <span className="account-plan-badge">
            <Sparkles size={13} />
            <span>Developer Cloud Pro</span>
          </span>
        </div>
      </header>

      {/* ===== MAIN BODY ===== */}
      <div className="account-body">
        {/* Left Navigation Sidebar */}
        <nav className="account-sidebar">
          <button
            type="button"
            className={`account-nav-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={16} />
            <span>Profile & Identity</span>
          </button>
          <button
            type="button"
            className={`account-nav-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Shield size={16} />
            <span>Security & Passwords</span>
          </button>
          <button
            type="button"
            className={`account-nav-btn ${activeTab === "connections" ? "active" : ""}`}
            onClick={() => setActiveTab("connections")}
          >
            <GithubIcon size={16} />
            <span>Connected Accounts</span>
          </button>
          <button
            type="button"
            className={`account-nav-btn ${activeTab === "cloud" ? "active" : ""}`}
            onClick={() => setActiveTab("cloud")}
          >
            <HardDrive size={16} />
            <span>Cloud Sandbox & Quota</span>
          </button>

          <div className="account-sidebar-divider" />

          <button
            type="button"
            className="account-nav-btn danger-nav"
            onClick={onSignOut || logout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* Right Tab Content */}
        <main className="account-content">
          {/* ================= TAB 1: PROFILE & IDENTITY ================= */}
          {activeTab === "profile" && (
            <div className="account-tab-section animate-fade-in">
              <div className="section-intro">
                <h2>Developer Profile</h2>
                <p>
                  Manage how your developer identity appears across shared workspaces,
                  collaborative sessions, and AI coding companion interactions.
                </p>
              </div>

              {/* Avatar Selector Card */}
              <div className="account-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h3 className="card-title" style={{ margin: 0 }}>Avatar & Visual Identity</h3>
                  <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>
                    Instant live preview on bottom sidebar
                  </span>
                </div>

                <div className="avatar-selection-row">
                  <div className="current-avatar-preview">
                    {selectedAvatar?.startsWith("data:image/") || selectedAvatar?.startsWith("http") ? (
                      <img
                        src={selectedAvatar}
                        alt="Profile Preview"
                        className="avatar-custom-img-preview"
                      />
                    ) : selectedAvatar === "default" || selectedAvatar === "initial" ? (
                      <span className="avatar-initial-large">{userInitial}</span>
                    ) : (
                      <span className="avatar-emoji-large">
                        {AVATAR_OPTIONS.find((a) => a.id === selectedAvatar)?.icon || "🦉"}
                      </span>
                    )}
                    <span className="avatar-online-dot" />
                  </div>

                  <div className="avatar-options-grid">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`avatar-option-chip ${
                          selectedAvatar === opt.id ? "selected" : ""
                        }`}
                        onClick={() => handleSelectAvatar(opt.id)}
                      >
                        <span className="opt-icon">
                          {opt.type === "initial" ? userInitial : opt.icon}
                        </span>
                        <span className="opt-label">{opt.label}</span>
                        {selectedAvatar === opt.id && <Check size={12} className="opt-check" />}
                      </button>
                    ))}

                    {/* Custom Image Upload Chip */}
                    <label className="avatar-upload-chip" title="Upload custom profile photo">
                      <Camera size={14} style={{ color: "#43e65c" }} />
                      <span>{selectedAvatar?.startsWith("data:image/") ? "Change Photo" : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        style={{ display: "none" }}
                        onChange={handleCustomPhotoUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile} className="account-card">
                <h3 className="card-title">Personal Details</h3>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>First Name</label>
                    <input
                      type="text"
                      className="account-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Saksham"
                    />
                  </div>
                  <div className="form-field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="account-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Agarwal"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Display Name / Public Handle</label>
                  <input
                    type="text"
                    className="account-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Saksham Agarwal"
                  />
                  <span className="field-hint">
                    Shown in the workspace dashboard, AI companion chats, and commit signatures.
                  </span>
                </div>

                <div className="form-field">
                  <label>Email Address</label>
                  <div className="input-with-badge">
                    <input
                      type="email"
                      className="account-input read-only"
                      value={user?.email || "developer@vocodeai.com"}
                      disabled
                    />
                    <span className="verified-badge">
                      <ShieldCheck size={13} />
                      <span>Verified</span>
                    </span>
                  </div>
                  <span className="field-hint">
                    Primary login identity for Application Default Credentials (ADC) and cloud backups.
                  </span>
                </div>

                <div className="form-field">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="account-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="form-field">
                  <label>Developer Bio & Status</label>
                  <textarea
                    rows={3}
                    className="account-textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief developer summary..."
                  />
                </div>

                {profileError && (
                  <div className="account-alert error">
                    <AlertCircle size={15} />
                    <span>{profileError}</span>
                  </div>
                )}

                {profileSuccess && (
                  <div className="account-alert success">
                    <CheckCircle2 size={15} />
                    <span>Profile saved and synchronized successfully!</span>
                  </div>
                )}

                <div className="card-actions-right">
                  <button
                    type="submit"
                    className="account-btn primary"
                    disabled={profileSaving}
                  >
                    {profileSaving ? (
                      <>
                        <RefreshCw size={14} className="spin-slow" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 2: SECURITY & PASSWORDS ================= */}
          {activeTab === "security" && (
            <div className="account-tab-section animate-fade-in">
              <div className="section-intro">
                <h2>Security & Authentication</h2>
                <p>
                  Ensure your account is protected with strong credentials, multi-factor
                  authentication, and review active developer sessions.
                </p>
              </div>

              {/* Change Password Card */}
              <form onSubmit={handleChangePassword} className="account-card">
                <h3 className="card-title">
                  <KeyRound size={17} className="text-accent" />
                  <span>Change Password</span>
                </h3>

                <div className="form-field">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="account-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className="account-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      className="account-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                </div>

                {newPassword && (
                  <div className="password-strength-bar">
                    <div
                      className={`strength-meter ${
                        newPassword.length < 6
                          ? "weak"
                          : newPassword.length < 10
                          ? "medium"
                          : "strong"
                      }`}
                    />
                    <span className="strength-text">
                      Strength:{" "}
                      {newPassword.length < 6
                        ? "Too short"
                        : newPassword.length < 10
                        ? "Good"
                        : "Very Strong"}
                    </span>
                  </div>
                )}

                {passwordError && (
                  <div className="account-alert error">
                    <AlertCircle size={15} />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="account-alert success">
                    <CheckCircle2 size={15} />
                    <span>Password updated successfully!</span>
                  </div>
                )}

                <div className="card-actions-right">
                  <button
                    type="submit"
                    className="account-btn primary"
                    disabled={passwordSaving || !currentPassword || !newPassword}
                  >
                    {passwordSaving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>

              {/* Two-Factor Authentication Card */}
              <div className="account-card">
                <div className="card-split-header">
                  <div>
                    <h3 className="card-title">Two-Factor Authentication (2FA)</h3>
                    <p className="card-desc">
                      Add an extra layer of security when logging in from new devices or
                      suspicious networks.
                    </p>
                  </div>
                  <label className="account-switch">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => handleToggle2FA(e.target.checked)}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>
                <div className="security-status-strip">
                  <ShieldCheck size={16} className="text-accent" />
                  <span>
                    Status:{" "}
                    <strong>{twoFactorEnabled ? "Active & Enforced" : "Disabled (Optional)"}</strong>
                  </span>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="account-card">
                <h3 className="card-title">Active Devices & Sessions</h3>
                <div className="session-item active">
                  <div className="session-icon">
                    <Cpu size={18} />
                  </div>
                  <div className="session-info">
                    <div className="session-name">
                      Windows PC • Chrome Web Sandbox
                      <span className="current-badge">Current Session</span>
                    </div>
                    <div className="session-meta">
                      IP: 127.0.0.1 • Connected to Docker Cloud Micro-VM • Active Now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: CONNECTED ACCOUNTS ================= */}
          {activeTab === "connections" && (
            <div className="account-tab-section animate-fade-in">
              <div className="section-intro">
                <h2>Connected Developer Accounts</h2>
                <p>
                  Link external Git providers for instantaneous repository cloning, branch
                  pulls, and seamless single sign-on (SSO).
                </p>
              </div>

              {/* GitHub Integration Card */}
              <div className="account-card">
                <div className="card-split-header">
                  <div className="provider-info-group">
                    <div className="provider-icon github">
                      <GithubIcon size={24} />
                    </div>
                    <div>
                      <h3 className="card-title">GitHub Integration</h3>
                      <p className="card-desc">
                        Clone repositories directly into cloud sandboxes, commit, and push hands-free.
                      </p>
                    </div>
                  </div>

                  <div>
                    {githubStatus.connected ? (
                      <span className="status-chip connected">
                        <CheckCircle2 size={13} /> Connected
                      </span>
                    ) : (
                      <span className="status-chip disconnected">Disconnected</span>
                    )}
                  </div>
                </div>

                {githubStatus.connected ? (
                  <div className="connected-profile-box">
                    <div className="gh-user-row">
                      {githubStatus.avatar && (
                        <img
                          src={githubStatus.avatar}
                          alt="GitHub Avatar"
                          className="gh-avatar"
                        />
                      )}
                      <div>
                        <strong>@{githubStatus.username}</strong>
                        <p>Linked for Git pushes and Cloud PTY sync</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="account-btn outline-danger"
                      onClick={handleDisconnectGithub}
                      disabled={githubLoading}
                    >
                      Disconnect GitHub
                    </button>
                  </div>
                ) : (
                  <div className="connect-form-box">
                    <p className="hint-text">
                      Connect instantly with a GitHub Personal Access Token (with `repo` permissions):
                    </p>
                    <div className="token-input-row">
                      <input
                        type="password"
                        className="account-input"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        value={githubTokenInput}
                        onChange={(e) => setGithubTokenInput(e.target.value)}
                      />
                      <button
                        type="button"
                        className="account-btn primary"
                        onClick={handleConnectGithub}
                        disabled={githubLoading || !githubTokenInput.trim()}
                      >
                        {githubLoading ? "Verifying..." : "Connect GitHub"}
                      </button>
                    </div>
                  </div>
                )}

                {githubMessage && (
                  <div className={`account-alert ${githubMessage.type}`}>
                    {githubMessage.type === "success" ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <AlertCircle size={15} />
                    )}
                    <span>{githubMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Google OAuth Card */}
              <div className="account-card">
                <div className="card-split-header">
                  <div className="provider-info-group">
                    <div className="provider-icon google">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="card-title">Google Account</h3>
                      <p className="card-desc">
                        Single Sign-On (SSO) and Application Default Credentials verification.
                      </p>
                    </div>
                  </div>

                  <span className="status-chip connected">
                    <CheckCircle2 size={13} /> Active SSO
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: CLOUD SANDBOX & QUOTA ================= */}
          {activeTab === "cloud" && (
            <div className="account-tab-section animate-fade-in">
              <div className="section-intro">
                <h2>Cloud Sandbox & Storage Quota</h2>
                <p>
                  Real-time status of your dedicated Docker container runners, memory
                  allocation, and persistent cloud filesystem storage.
                </p>
              </div>

              <div className="account-card">
                <div className="card-split-header">
                  <h3 className="card-title">Real-Time Storage Allocation</h3>
                  <span className="field-hint">
                    Calculated from your active cloud workspace files
                  </span>
                </div>
                <div className="quota-bar-wrapper">
                  <div
                    className="quota-bar-fill"
                    style={{ width: `${Math.max(2, storageData.percentUtilized)}%` }}
                  />
                </div>
                <div className="quota-meta-row">
                  <span>
                    Used: <strong>{storageData.usedFormatted}</strong> of {storageData.maxFormatted}
                  </span>
                  <span>
                    {storageData.percentUtilized}% utilized • {storageData.availableFormatted} Available ({storageData.workspaceCount} Workspaces)
                  </span>
                </div>
              </div>

              <div className="account-card">
                <h3 className="card-title">Cloud Micro-VM Environment</h3>
                <div className="env-grid">
                  <div className="env-item">
                    <span className="env-label">Runner Image</span>
                    <span className="env-val">Ubuntu 22.04 LTS (Docker PTY)</span>
                  </div>
                  <div className="env-item">
                    <span className="env-label">Node.js Runtime</span>
                    <span className="env-val">v20.18.0 LTS</span>
                  </div>
                  <div className="env-item">
                    <span className="env-label">Python Environment</span>
                    <span className="env-val">Python 3.10+ (pip / venv)</span>
                  </div>
                  <div className="env-item">
                    <span className="env-label">Memory Limit</span>
                    <span className="env-val">2,048 MB RAM / Container</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="account-card danger-card">
                <h3 className="card-title text-danger">Danger Zone</h3>
                <p className="card-desc">
                  Irreversible actions concerning your account data and saved workspaces.
                </p>
                <div className="danger-actions-row">
                  <button
                    type="button"
                    className="account-btn outline-danger"
                    onClick={onSignOut || logout}
                  >
                    <LogOut size={14} />
                    <span>Sign Out of VocodeAI</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
