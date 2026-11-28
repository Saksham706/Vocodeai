export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    badge: "Starter",
    tagline: "Everything you need to code in the cloud with full Git access.",
    priceMonthlyINR: 0,
    priceMonthlyUSD: 0,
    popular: false,
    limits: {
      aiDailyLimit: 50,
      vocaDailyLimit: 40,
      maxWorkspaces: 10,
      storageBytes: 2 * 1024 * 1024 * 1024, // 2 GB
      storageLabel: "2.0 GB",
      containerMemoryBytes: 1024 * 1024 * 1024, // 1 GB
      containerMemoryLabel: "1,024 MB RAM / Container",
      containerCpuShares: 512,
      containerIdleTimeoutMs: 10 * 60 * 1000, // 10 mins
      containerIdleLabel: "10 minutes",
      concurrentServers: 1,
      fullGitAccess: true,
    },
    features: [
      "Full Git & GitHub access (public & private repos)",
      "10 active cloud workspaces",
      "2 GB persistent Cloudflare R2 storage",
      "50 AI Assistant chats / day (+ unlimited BYOK)",
      "40 Voco AI voice commands / day",
      "1 GB RAM sandbox • 10 min idle timeout",
      "1 concurrent running project server",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    tagline: "Built for daily developers who ship fast with AI & voice.",
    priceMonthlyINR: 999,
    priceMonthlyUSD: 15,
    popular: true,
    limits: {
      aiDailyLimit: 250,
      vocaDailyLimit: 200,
      maxWorkspaces: 50,
      storageBytes: 15 * 1024 * 1024 * 1024, // 15 GB
      storageLabel: "15.0 GB",
      containerMemoryBytes: 2 * 1024 * 1024 * 1024, // 2 GB
      containerMemoryLabel: "2,048 MB RAM / Container",
      containerCpuShares: 1024,
      containerIdleTimeoutMs: 45 * 60 * 1000, // 45 mins
      containerIdleLabel: "45 minutes",
      concurrentServers: 3,
      fullGitAccess: true,
    },
    features: [
      "Full Git & GitHub access + auto-sync",
      "50 active cloud workspaces",
      "15 GB persistent Cloudflare R2 storage",
      "250 AI Assistant chats / day (+ unlimited BYOK)",
      "200 Voco AI voice commands / day",
      "2 GB RAM sandbox • 45 min idle timeout",
      "3 concurrent running project servers",
      "All AI models + priority execution queue",
    ],
  },
  ultra: {
    id: "ultra",
    name: "Ultra",
    badge: "Power",
    tagline: "Maximum compute, unlimited workspaces, and priority AI.",
    priceMonthlyINR: 2999,
    priceMonthlyUSD: 39,
    popular: false,
    limits: {
      aiDailyLimit: 750,
      vocaDailyLimit: -1, // Unlimited
      maxWorkspaces: -1, // Unlimited
      storageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
      storageLabel: "50.0 GB",
      containerMemoryBytes: 4 * 1024 * 1024 * 1024, // 4 GB
      containerMemoryLabel: "4,096 MB RAM / Container",
      containerCpuShares: 2048,
      containerIdleTimeoutMs: 3 * 60 * 60 * 1000, // 3 hours
      containerIdleLabel: "3 hours",
      concurrentServers: 6,
      fullGitAccess: true,
    },
    features: [
      "Full Git & GitHub access + org/team repos",
      "Unlimited cloud workspaces",
      "50 GB persistent Cloudflare R2 storage",
      "750 AI Assistant chats / day (+ unlimited BYOK)",
      "Unlimited Voco AI voice commands",
      "4 GB RAM sandbox • 3 hr idle timeout",
      "6+ concurrent running servers (Flutter/Java/Full-Stack)",
      "Priority AI models & dedicated fast queue",
    ],
  },
};

export function getEffectivePlanId(user) {
  const raw = (user?.plan || "free").toLowerCase();
  if (!PLANS[raw]) return "free";
  if (raw !== "free" && user?.planExpiresAt) {
    const expiry = new Date(user.planExpiresAt);
    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return "free";
    }
  }
  return raw;
}

export function getPlanConfig(planOrUser) {
  if (typeof planOrUser === "string") {
    return PLANS[planOrUser.toLowerCase()] || PLANS.free;
  }
  return PLANS[getEffectivePlanId(planOrUser)] || PLANS.free;
}
