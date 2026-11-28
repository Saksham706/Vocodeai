import React, { useEffect, useState } from "react";
import { Cpu, ShieldCheck, Terminal, Layers, Mic, MessageSquare, Sparkles } from "lucide-react";
import AntigravityLogo from "../common/AntigravityLogo";
import { useAuth } from "../../context/AuthContext";
import { getAIUsageApi } from "../../services/aiApi";
import { openRazorpayCheckout } from "../../services/billingApi";

export default function GeminiSettingsPanel() {
  const { accessToken, user } = useAuth();
  const [usage, setUsage] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState(null);

  const loadUsage = async () => {
    if (!accessToken) return;
    try {
      const data = await getAIUsageApi(accessToken);
      setUsage(data);
    } catch {}
  };

  useEffect(() => {
    loadUsage();
  }, [accessToken]);

  const planId = usage?.planId || user?.plan || "free";
  const planName = usage?.planName || (planId === "ultra" ? "Ultra" : planId === "pro" ? "Pro" : "Free");
  const aiUsed = usage?.todayRequests ?? 0;
  const aiLimit = usage?.dailyLimit ?? (planId === "ultra" ? 750 : planId === "pro" ? 250 : 50);
  const aiPct = aiLimit > 0 ? Math.min(100, Math.round((aiUsed / aiLimit) * 100)) : 0;

  const vocaUsed = usage?.vocaTodayRequests ?? 0;
  const vocaLimit = usage?.vocaDailyLimit ?? (planId === "ultra" ? -1 : planId === "pro" ? 200 : 40);
  const vocaPct = vocaLimit > 0 ? Math.min(100, Math.round((vocaUsed / vocaLimit) * 100)) : 0;

  const handleUpgrade = async (targetPlanId) => {
    if (!accessToken) return;
    setUpgradeMsg(null);
    setUpgrading(true);
    await openRazorpayCheckout({
      token: accessToken,
      planId: targetPlanId,
      user,
      onSuccess: (res) => {
        setUpgrading(false);
        setUpgradeMsg({ type: "success", text: res?.message || `Upgraded to ${targetPlanId}!` });
        loadUsage();
      },
      onError: (err) => {
        setUpgrading(false);
        setUpgradeMsg({ type: "error", text: err?.message || "Payment cancelled or failed." });
      },
    });
  };

  return (
    <section className="settings-live-preview-box" style={{ marginBottom: 20 }}>
      {/* Header Bar */}
      <div className="preview-top-bar" style={{ gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <AntigravityLogo size={20} />
          <span className="preview-title" style={{ color: "#38bdf8", fontWeight: 600 }}>
            VocodeAI Core Engine &amp; Voco Voice
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "2px 8px",
              borderRadius: 999,
              background: planId === "free" ? "rgba(148,163,184,0.18)" : "rgba(67,230,92,0.18)",
              color: planId === "free" ? "#cbd5e1" : "#43E65C",
              border: `1px solid ${planId === "free" ? "rgba(148,163,184,0.35)" : "rgba(67,230,92,0.45)"}`,
            }}
          >
            {planName} Plan
          </span>
          <span className="preview-indicator" style={{ color: "#4ade80" }}>
            <span className="live-pulse-dot" style={{ backgroundColor: "#22c55e" }} />
            Online &amp; Ready
          </span>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Engine Status Banner */}
        <div
          style={{
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: 10,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 220 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "rgba(56, 189, 248, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38bdf8",
                flexShrink: 0,
              }}
            >
              <Cpu size={22} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#f8fafc" }}>
                VocodeAI Autonomous Pair Programmer
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                Multi-file generation, terminal execution, and Voco voice commands powered by your{" "}
                <strong style={{ color: "#e2e8f0" }}>{planName}</strong> plan.
              </div>
            </div>
          </div>

          {planId === "free" && accessToken && (
            <button
              type="button"
              disabled={upgrading}
              onClick={() => handleUpgrade("pro")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: "#43E65C",
                color: "#020B08",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Sparkles size={13} />
              {upgrading ? "Opening Razorpay..." : "Upgrade to Pro (250 AI + 200 Voco/day)"}
            </button>
          )}
        </div>

        {upgradeMsg && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12,
              background: upgradeMsg.type === "error" ? "rgba(239,68,68,0.14)" : "rgba(67,230,92,0.14)",
              color: upgradeMsg.type === "error" ? "#fca5a5" : "#86efac",
              border: `1px solid ${upgradeMsg.type === "error" ? "rgba(239,68,68,0.35)" : "rgba(67,230,92,0.35)"}`,
            }}
          >
            {upgradeMsg.text}
          </div>
        )}

        {/* Daily AI Chat & Voco Voice Quotas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
            marginTop: 14,
          }}
        >
          <div style={featureBoxStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#f8fafc" }}>
                <MessageSquare size={14} style={{ color: "#38bdf8" }} />
                AI Assistant Chat
              </span>
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                {aiUsed} / {aiLimit === -1 ? "Unlimited" : aiLimit} today
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "rgba(148,163,184,0.18)", overflow: "hidden" }}>
              <div style={{ width: `${aiPct}%`, height: "100%", background: "#38bdf8", borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 11, color: "#64748b", marginTop: 5, display: "block" }}>
              Unlimited with your own API key (BYOK) • Resets in {usage?.resetIn || "24h"}
            </span>
          </div>

          <div style={featureBoxStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#f8fafc" }}>
                <Mic size={14} style={{ color: "#43E65C" }} />
                Voco AI Voice Commands
              </span>
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                {vocaUsed} / {vocaLimit === -1 ? "Unlimited" : vocaLimit} today
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "rgba(148,163,184,0.18)", overflow: "hidden" }}>
              <div style={{ width: `${vocaLimit === -1 ? 10 : vocaPct}%`, height: "100%", background: "#43E65C", borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 11, color: "#64748b", marginTop: 5, display: "block" }}>
              {planId === "free" ? "40/day on Free • 200/day on Pro • Unlimited on Ultra" : "Voice coding & workspace actions active"}
            </span>
          </div>
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
            marginTop: 10,
          }}
        >
          <div style={featureBoxStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#38bdf8" }}>
              <Terminal size={15} />
              <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>Terminal Execution</strong>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>
              Compiles &amp; runs code in isolated Docker runner
            </span>
          </div>

          <div style={featureBoxStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4ade80" }}>
              <Layers size={15} />
              <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>Multi-File Edits</strong>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>
              Directly generates and writes files into workspace
            </span>
          </div>

          <div style={featureBoxStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a855f7" }}>
              <ShieldCheck size={15} />
              <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>Safe Mode</strong>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>
              Pre-flight validation for file modifications
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const featureBoxStyle = {
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(4, 16, 28, 0.45)",
  borderRadius: 8,
  padding: "10px 12px",
};
