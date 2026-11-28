import React, { useState } from "react";
import { Check, ShieldCheck, Zap, Sparkles, Crown, ChevronRight } from "lucide-react";
import { openRazorpayCheckout } from "../../services/billingApi";
import "../../styles/pricingTradingCards.css";

export const PLAN_CARDS = [
  {
    id: "free",
    name: "Free Plan",
    shortName: "Free",
    badgeStat: "33%",
    tierFill: 34,
    priceINR: 0,
    priceUSD: 0,
    isFree: true,
    aiSummary: "50 AI • 40 Voco",
    tagline: "Full Git access, 10 workspaces & daily AI + Voco voice.",
    icon: Zap,
    accent: "#A855F7",
    themeClass: "theme-free",
    barGradient: "linear-gradient(90deg, #7C3AED 0%, #C084FC 100%)",
    popular: false,
    ctaLabel: "Start Free Project",
    features: [
      "Full Git & GitHub access (public & private)",
      "10 active cloud workspaces • 2 GB storage",
      "50 AI Assistant chats / day (+ BYOK)",
      "40 Voco AI voice commands / day",
      "1 GB RAM sandbox • 10 min idle timeout",
      "1 concurrent running server",
    ],
  },
  {
    id: "pro",
    name: "Pro Plan",
    shortName: "Pro EX",
    badgeStat: "PRO",
    tierFill: 68,
    priceINR: 999,
    priceUSD: 15,
    isFree: false,
    aiSummary: "250 AI • 200 Voco",
    tagline: "Orange-tier speed: 250 AI chats, 200 Voco commands & 2 GB sandboxes.",
    icon: Sparkles,
    accent: "#F95B1C",
    themeClass: "theme-pro",
    barGradient: "linear-gradient(90deg, #B4411A 0%, #F95B1C 100%)",
    popular: true,
    ctaLabel: "Upgrade to Pro with Vocodeai",
    features: [
      "Full Git & GitHub access + auto-sync",
      "50 active cloud workspaces • 15 GB storage",
      "250 AI Assistant chats / day (+ BYOK)",
      "200 Voco AI voice commands / day",
      "2 GB RAM sandbox • 45 min idle timeout",
      "3 concurrent running project servers",
    ],
  },
  {
    id: "ultra",
    name: "Ultra Plan",
    shortName: "Ultra",
    badgeStat: "MAX",
    tierFill: 100,
    priceINR: 2999,
    priceUSD: 39,
    isFree: false,
    aiSummary: "750 AI • ∞ Voco",
    tagline: "Unlimited workspaces, unlimited Voco voice & 4 GB compute power.",
    icon: Crown,
    accent: "#38BDF8",
    themeClass: "theme-ultra",
    barGradient: "linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)",
    popular: false,
    ctaLabel: "Upgrade to Ultra with Vocodeai",
    features: [
      "Full Git & GitHub access + org repos",
      "Unlimited workspaces • 50 GB storage",
      "750 AI Assistant chats / day (+ BYOK)",
      "Unlimited Voco AI voice commands",
      "4 GB RAM sandbox • 3 hr idle timeout",
      "6+ concurrent servers & priority queue",
    ],
  },
];

export default function PricingSection({
  currentPlanId = "free",
  accessToken = null,
  user = null,
  onRequireAuth = null,
  onPlanUpgraded = null,
  compact = false,
}) {
  const [activeIndex, setActiveIndex] = useState(1); // Pro Plan expanded by default
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currency, setCurrency] = useState("INR");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const total = PLAN_CARDS.length;
  const activePlan = PLAN_CARDS[activeIndex];
  const backPlanIndex = (activeIndex + 2) % total;
  const midPlanIndex = (activeIndex + 1) % total;
  const stackedPlans = [
    { plan: PLAN_CARDS[backPlanIndex], idx: backPlanIndex, tier: "tier-back" },
    { plan: PLAN_CARDS[midPlanIndex], idx: midPlanIndex, tier: "tier-mid" },
  ];

  const handleNextPlan = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handleSelect = async (plan) => {
    setFeedback(null);

    if (plan.id === "free") {
      if (!accessToken && onRequireAuth) {
        onRequireAuth("signup");
      } else {
        setFeedback({
          type: "info",
          text: "You are on the Free Plan (10 workspaces, 50 AI chats/day & 40 Voco commands/day).",
        });
      }
      return;
    }

    if (!accessToken) {
      if (onRequireAuth) {
        onRequireAuth("login");
      }
      return;
    }

    if (currentPlanId === plan.id) {
      setFeedback({
        type: "info",
        text: `You are already subscribed to VocodeAI ${plan.name}.`,
      });
      return;
    }

    setLoadingPlan(plan.id);
    await openRazorpayCheckout({
      token: accessToken,
      planId: plan.id,
      user,
      onSuccess: (res) => {
        setLoadingPlan(null);
        setFeedback({
          type: "success",
          text: res?.message || `Successfully upgraded to ${plan.name}!`,
        });
        onPlanUpgraded?.(res);
      },
      onError: (err) => {
        setLoadingPlan(null);
        setFeedback({
          type: "error",
          text: err?.message || "Payment could not be completed.",
        });
      },
    });
  };

  const formatPrice = (plan) => {
    if (plan.isFree) return "Free";
    const base = currency === "INR" ? plan.priceINR : plan.priceUSD;
    const finalVal = billingCycle === "yearly" ? Math.round(base * 0.8) : base;
    return currency === "INR"
      ? `₹${finalVal.toLocaleString("en-IN")}`
      : `$${finalVal}`;
  };

  const ActiveIcon = activePlan.icon;
  const isCurrent = accessToken && currentPlanId === activePlan.id;

  return (
    <div className={`tc-pricing-wrap ${compact ? "is-compact" : ""}`}>
      {/* Centered Header */}
      <div style={{ textAlign: "center", marginBottom: compact ? "10px" : "12px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: compact ? "26px" : "clamp(28px, 4vw, 48px)",
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.025em",
            lineHeight: 1.12,
          }}
        >
          <span>Find the Plan </span>
          <span
            style={{
              background: "linear-gradient(135deg, #38BDF8 0%, #60A5FA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            That Works for You
          </span>
        </h2>

        {/* Billing Cycle (Far Left) + Currency Switch (Far Right) with Dynamic Card Accent */}
        <div className="sd-toggles-row">
          <div
            className="sd-toggle-box"
            style={{
              border: `1px solid ${activePlan.accent}55`,
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              boxShadow: `0 4px 18px ${activePlan.accent}1A`,
            }}
          >
            <button
              type="button"
              className="sd-toggle-btn"
              onClick={() => setBillingCycle("monthly")}
              style={{
                background: billingCycle === "monthly" ? activePlan.accent : "transparent",
                color: billingCycle === "monthly" ? "#050507" : "#9CA3AF",
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              className="sd-toggle-btn"
              onClick={() => setBillingCycle("yearly")}
              style={{
                background: billingCycle === "yearly" ? activePlan.accent : "transparent",
                color: billingCycle === "yearly" ? "#050507" : "#9CA3AF",
              }}
            >
              <span>Yearly</span>
              <span
                className="sd-discount-tag"
                style={{
                  background: billingCycle === "yearly" ? "#050507" : activePlan.accent,
                  color: billingCycle === "yearly" ? activePlan.accent : "#050507",
                }}
              >
                -20%
              </span>
            </button>
          </div>

          <div
            className="sd-toggle-box"
            style={{
              border: `1px solid ${activePlan.accent}55`,
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              boxShadow: `0 4px 18px ${activePlan.accent}1A`,
            }}
          >
            {["INR", "USD"].map((curr) => (
              <button
                key={curr}
                type="button"
                className="sd-toggle-btn"
                onClick={() => setCurrency(curr)}
                style={{
                  background: currency === curr ? activePlan.accent : "transparent",
                  color: currency === curr ? "#050507" : "#9CA3AF",
                }}
              >
                {curr === "INR" ? "₹ INR" : "$ USD"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            marginBottom: "10px",
            padding: "8px 14px",
            borderRadius: "10px",
            fontSize: "12.5px",
            fontWeight: 500,
            textAlign: "center",
            background:
              feedback.type === "error"
                ? "rgba(239, 68, 68, 0.14)"
                : "rgba(249, 91, 28, 0.16)",
            border: `1px solid ${feedback.type === "error"
              ? "rgba(239, 68, 68, 0.4)"
              : "rgba(249, 91, 28, 0.45)"
              }`,
            color: feedback.type === "error" ? "#FCA5A5" : "#FDBA74",
          }}
        >
          {feedback.text}
        </div>
      )}

      {/* Stacked Card Deck */}
      <div className="sd-deck-container">
        {/* Top Stacked Inactive Plan Pills */}
        <div className="sd-stack-pills">
          {stackedPlans.map(({ plan, idx, tier }) => {
            const PillIcon = plan.icon;
            return (
              <button
                key={plan.id}
                type="button"
                className={`sd-top-pill ${tier}`}
                onClick={() => setActiveIndex(idx)}
                title={`Switch to ${plan.name}`}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: 600 }}>
                  <PillIcon size={14} style={{ color: plan.accent }} />
                  <span>{plan.name}</span>
                </span>
                <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>
                  {formatPrice(plan)}
                  {!plan.isFree ? "/mo" : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* Single Active Expanded Card */}
        <div
          key={activePlan.id}
          className={`sd-main-card ${activePlan.themeClass}`}
        >
          {/* Card Top Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ActiveIcon size={17} style={{ color: activePlan.accent }} />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                {activePlan.name}
              </span>
              {isCurrent && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: `${activePlan.accent}25`,
                    color: activePlan.accent,
                    border: `1px solid ${activePlan.accent}55`,
                  }}
                >
                  Current
                </span>
              )}
            </div>

            {/* Center Circle Stat Badge */}
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: `1.5px solid ${activePlan.accent}66`,
                background: "rgba(0, 0, 0, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 800,
                color: "#FFFFFF",
              }}
            >
              {activePlan.badgeStat}
            </div>

            {/* Next Plan Button */}
            <button
              type="button"
              onClick={handleNextPlan}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "5px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                background: "rgba(255, 255, 255, 0.06)",
                color: "#F4F4F5",
                fontSize: "11.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span>Next Plan</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Big Price + AI/Voco Summary Row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>
                Subscription
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span
                  style={{
                    fontSize: "clamp(28px, 3.2vw, 38px)",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {formatPrice(activePlan)}
                </span>
                {!activePlan.isFree && (
                  <span style={{ fontSize: "13px", color: "#A1A1AA" }}>/month</span>
                )}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>
                Daily AI + Voice Quota
              </div>
              <div
                style={{
                  fontSize: "clamp(18px, 2.2vw, 24px)",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {activePlan.aiSummary}
              </div>
            </div>
          </div>

          {/* Glowing Tier Progress Bar */}
          <div className="sd-tier-bar-track">
            <div
              className="sd-tier-bar-fill"
              style={{
                width: `${activePlan.tierFill}%`,
                background: activePlan.barGradient,
              }}
            >
              <span className="sd-tier-bar-knob" />
            </div>
          </div>

          {/* 2-Column Feature Grid */}
          <div className="sd-features-grid">
            {activePlan.features.map((feat) => (
              <div
                key={feat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "#E4E4E7",
                  lineHeight: 1.35,
                }}
              >
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: activePlan.popular ? "#F95B1C" : `${activePlan.accent}28`,
                    color: activePlan.popular ? "#0E0E11" : activePlan.accent,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Action CTA Button */}
          <button
            type="button"
            disabled={isCurrent || loadingPlan === activePlan.id}
            onClick={() => handleSelect(activePlan)}
            style={{
              width: "100%",
              padding: "12px 18px",
              borderRadius: "999px",
              border: activePlan.popular
                ? "1px solid rgba(255, 138, 76, 0.45)"
                : "1px solid rgba(255, 255, 255, 0.14)",
              background: isCurrent
                ? "rgba(255, 255, 255, 0.08)"
                : activePlan.popular
                  ? "linear-gradient(90deg, #472116 0%, #B4411A 48%, #F95B1C 100%)"
                  : "#1B1B22",
              color: isCurrent ? "#9CA3AF" : "#FFFFFF",
              fontSize: "13px",
              fontWeight: 700,
              cursor: isCurrent ? "default" : "pointer",
            }}
          >
            {loadingPlan === activePlan.id
              ? "Opening Razorpay..."
              : isCurrent
                ? "Active Plan"
                : activePlan.ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
