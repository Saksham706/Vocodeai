import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Chat from "../models/Chat.js";
import Announcement from "../models/Announcement.js";
import { PLANS } from "../config/plans.js";
import { isR2Configured } from "../config/r2.js";
import { broadcastAnnouncements } from "../services/announcementSocket.js";

const serverStartTime = Date.now();

/* ─────────────────────────────────────────────
   OVERVIEW DASHBOARD
───────────────────────────────────────────── */

export async function getOverview(req, res) {
  try {
    const { date, startDate, endDate } = req.query;
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let rangeStart = null;
    let rangeEnd = null;
    let usageDateKey = todayKey;

    if (date) {
      rangeStart = new Date(`${date}T00:00:00.000Z`);
      rangeEnd = new Date(`${date}T23:59:59.999Z`);
      usageDateKey = date;
    } else if (startDate || endDate) {
      if (startDate) rangeStart = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) rangeEnd = new Date(`${endDate}T23:59:59.999Z`);
    }

    const isFiltered = Boolean(rangeStart || rangeEnd);
    const createdFilter = isFiltered
      ? {
          createdAt: {
            ...(rangeStart ? { $gte: rangeStart } : {}),
            ...(rangeEnd ? { $lte: rangeEnd } : {}),
          },
        }
      : {};

    const trendMatch = isFiltered
      ? createdFilter
      : { createdAt: { $gte: startOfMonth } };

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalWorkspaces,
      verifiedUsers,
      suspendedUsers,
      planBreakdown,
      aiUsageToday,
      vocaUsageToday,
      topAiUsers,
    ] = await Promise.all([
      User.countDocuments(createdFilter),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Workspace.countDocuments(createdFilter),
      User.countDocuments({ ...createdFilter, isVerified: true }),
      User.countDocuments({ ...createdFilter, isSuspended: true }),

      // Plan distribution
      User.aggregate([
        ...(isFiltered ? [{ $match: createdFilter }] : []),
        { $group: { _id: "$plan", count: { $sum: 1 } } },
      ]),

      // Total AI usage for selected date (or today)
      User.aggregate([
        { $match: { "aiDailyUsage.date": usageDateKey } },
        { $group: { _id: null, total: { $sum: "$aiDailyUsage.count" } } },
      ]),

      // Total Voca usage for selected date (or today)
      User.aggregate([
        { $match: { "vocaDailyUsage.date": usageDateKey } },
        { $group: { _id: null, total: { $sum: "$vocaDailyUsage.count" } } },
      ]),

      // Top 10 AI users for selected date (or today)
      User.find({ "aiDailyUsage.date": usageDateKey })
        .select("firstName lastName email plan aiDailyUsage")
        .sort({ "aiDailyUsage.count": -1 })
        .limit(10)
        .lean(),
    ]);

    const planMap = { free: 0, pro: 0, ultra: 0 };
    planBreakdown.forEach((p) => {
      if (p._id && planMap.hasOwnProperty(p._id)) planMap[p._id] = p.count;
    });

    // Signups trend (daily buckets)
    const signupTrend = await User.aggregate([
      { $match: trendMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      overview: {
        isFiltered,
        usageDateKey,
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        totalWorkspaces,
        verifiedUsers,
        suspendedUsers,
        planBreakdown: planMap,
        aiUsageToday: aiUsageToday[0]?.total || 0,
        vocaUsageToday: vocaUsageToday[0]?.total || 0,
        topAiUsers,
        signupTrend,
        serverUptime: Math.floor((Date.now() - serverStartTime) / 1000),
      },
    });
  } catch (err) {
    console.error("ADMIN OVERVIEW ERROR:", err.message);
    res.status(500).json({ error: "Failed to load overview" });
  }
}

/* ─────────────────────────────────────────────
   USER MANAGEMENT
───────────────────────────────────────────── */

export async function getUsers(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      plan = "",
      verified = "",
      suspended = "",
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }
    if (plan) filter.plan = plan;
    if (verified === "true") filter.isVerified = true;
    if (verified === "false") filter.isVerified = false;
    if (suspended === "true") filter.isSuspended = true;
    if (suspended === "false") filter.isSuspended = false;

    const sortObj = { [sort]: order === "asc" ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash -refreshToken -resetOTP -resetOTPExpiry -googleAccessToken -googleRefreshToken -githubAccessToken")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    // Enrich with workspace count per user
    const userIds = users.map((u) => u._id);
    const wsCounts = await Workspace.aggregate([
      { $match: { userId: { $in: userIds.map(String) } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);
    const wsMap = {};
    wsCounts.forEach((w) => (wsMap[String(w._id)] = w.count));
    const enriched = users.map((u) => ({
      ...u,
      workspaceCount: wsMap[String(u._id)] || 0,
    }));

    res.json({ success: true, users: enriched, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error("ADMIN GET USERS ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function getUserDetail(req, res) {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash -refreshToken -resetOTP -resetOTPExpiry -googleAccessToken -googleRefreshToken -githubAccessToken")
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const [workspaces, chatCount] = await Promise.all([
      Workspace.find({ userId: String(user._id) }).lean(),
      Chat.countDocuments({ userId: String(user._id) }),
    ]);

    res.json({ success: true, user: { ...user, workspaces, chatCount } });
  } catch (err) {
    console.error("ADMIN GET USER DETAIL ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch user detail" });
  }
}

export async function updateUserPlan(req, res) {
  try {
    const { plan, planExpiresAt } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ error: "Invalid plan" });

    const now = new Date();
    const expiry = planExpiresAt
      ? new Date(planExpiresAt)
      : plan === "free"
      ? null
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        plan,
        planStartedAt: plan !== "free" ? now : null,
        planExpiresAt: expiry,
        billingProvider: plan !== "free" ? "admin" : null,
      },
      { new: true }
    )
      .select("-passwordHash -refreshToken")
      .lean();

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("ADMIN UPDATE PLAN ERROR:", err.message);
    res.status(500).json({ error: "Failed to update plan" });
  }
}

export async function toggleSuspendUser(req, res) {
  try {
    const user = await User.findById(req.params.id).select("isSuspended email").lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: !user.isSuspended },
      { new: true }
    )
      .select("isSuspended email firstName lastName")
      .lean();

    res.json({ success: true, isSuspended: updated.isSuspended, user: updated });
  } catch (err) {
    console.error("ADMIN SUSPEND ERROR:", err.message);
    res.status(500).json({ error: "Failed to toggle suspend" });
  }
}

export async function resetUserQuota(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        "aiDailyUsage.count": 0,
        "aiDailyUsage.date": "",
        "vocaDailyUsage.count": 0,
        "vocaDailyUsage.date": "",
      },
      { new: true }
    )
      .select("email aiDailyUsage vocaDailyUsage")
      .lean();

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("ADMIN RESET QUOTA ERROR:", err.message);
    res.status(500).json({ error: "Failed to reset quota" });
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    // Delete all workspaces, chats
    await Promise.all([
      Workspace.deleteMany({ userId: String(user._id) }),
      Chat.deleteMany({ userId: String(user._id) }),
      User.findByIdAndDelete(req.params.id),
    ]);

    res.json({ success: true, message: "User and all associated data deleted." });
  } catch (err) {
    console.error("ADMIN DELETE USER ERROR:", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

export async function toggleAdminRole(req, res) {
  try {
    const user = await User.findById(req.params.id).select("isAdmin email").lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: !user.isAdmin },
      { new: true }
    )
      .select("isAdmin email firstName lastName")
      .lean();

    res.json({ success: true, isAdmin: updated.isAdmin, user: updated });
  } catch (err) {
    console.error("ADMIN TOGGLE ADMIN ROLE ERROR:", err.message);
    res.status(500).json({ error: "Failed to toggle admin role" });
  }
}

/* ─────────────────────────────────────────────
   SUBSCRIPTIONS & REVENUE
───────────────────────────────────────────── */

export async function getSubscriptions(req, res) {
  try {
    const { page = 1, limit = 20, plan = "", expiringSoon = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { plan: { $ne: "free" } };
    if (plan) filter.plan = plan;
    if (expiringSoon === "true") {
      const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      filter.planExpiresAt = { $lte: sevenDays, $gt: new Date() };
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("firstName lastName email plan planStartedAt planExpiresAt billingProvider razorpayOrderId razorpayPaymentId createdAt")
        .sort({ planStartedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    // Revenue summary
    const proCount = await User.countDocuments({ plan: "pro" });
    const ultraCount = await User.countDocuments({ plan: "ultra" });
    const expiredCount = await User.countDocuments({
      plan: { $ne: "free" },
      planExpiresAt: { $lt: new Date() },
    });

    const mrrINR =
      proCount * PLANS.pro.priceMonthlyINR +
      ultraCount * PLANS.ultra.priceMonthlyINR;

    res.json({
      success: true,
      subscriptions: users,
      total,
      revenue: {
        mrrINR,
        mrrUSD: proCount * PLANS.pro.priceMonthlyUSD + ultraCount * PLANS.ultra.priceMonthlyUSD,
        proCount,
        ultraCount,
        expiredCount,
      },
    });
  } catch (err) {
    console.error("ADMIN SUBSCRIPTIONS ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
}

export async function extendUserPlan(req, res) {
  try {
    const { days } = req.body;
    if (!days || isNaN(days)) return res.status(400).json({ error: "Invalid days value" });

    const user = await User.findById(req.params.id).select("plan planExpiresAt").lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const base = user.planExpiresAt && new Date(user.planExpiresAt) > new Date()
      ? new Date(user.planExpiresAt)
      : new Date();
    const newExpiry = new Date(base.getTime() + parseInt(days) * 24 * 60 * 60 * 1000);

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { planExpiresAt: newExpiry },
      { new: true }
    ).select("email plan planExpiresAt").lean();

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error("ADMIN EXTEND PLAN ERROR:", err.message);
    res.status(500).json({ error: "Failed to extend plan" });
  }
}

/* ─────────────────────────────────────────────
   WORKSPACE MANAGEMENT
───────────────────────────────────────────── */

export async function getWorkspaces(req, res) {
  try {
    const { page = 1, limit = 20, search = "", userId = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (userId) filter.userId = userId;

    const [workspaces, total] = await Promise.all([
      Workspace.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Workspace.countDocuments(filter),
    ]);

    // Enrich with owner info
    const userIds = [...new Set(workspaces.map((w) => w.userId))];
    const owners = await User.find({ _id: { $in: userIds } })
      .select("email firstName lastName plan")
      .lean();
    const ownerMap = {};
    owners.forEach((o) => (ownerMap[String(o._id)] = o));

    const enriched = workspaces.map((w) => ({
      ...w,
      owner: ownerMap[String(w.userId)] || null,
    }));

    res.json({ success: true, workspaces: enriched, total });
  } catch (err) {
    console.error("ADMIN GET WORKSPACES ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
}

export async function deleteWorkspaceAdmin(req, res) {
  try {
    const ws = await Workspace.findByIdAndDelete(req.params.id);
    if (!ws) return res.status(404).json({ error: "Workspace not found" });
    res.json({ success: true, message: "Workspace deleted." });
  } catch (err) {
    console.error("ADMIN DELETE WORKSPACE ERROR:", err.message);
    res.status(500).json({ error: "Failed to delete workspace" });
  }
}

/* ─────────────────────────────────────────────
   AI & VOCA ANALYTICS
───────────────────────────────────────────── */

export async function getAnalytics(req, res) {
  try {
    const todayKey = new Date().toISOString().slice(0, 10);
    const startOfMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalAiLifetime,
      totalVocaLifetime,
      aiUsageToday,
      vocaUsageToday,
      topAiUsersLifetime,
      topVocaUsersToday,
      usersHitAiLimit,
      planUsageBreakdown,
    ] = await Promise.all([
      // Total lifetime AI calls across all users
      User.aggregate([
        { $group: { _id: null, total: { $sum: "$aiDailyUsage.lifetimeCount" } } },
      ]),

      // Total lifetime Voca calls
      User.aggregate([
        { $group: { _id: null, total: { $sum: "$vocaDailyUsage.lifetimeCount" } } },
      ]),

      // AI usage today
      User.aggregate([
        { $match: { "aiDailyUsage.date": todayKey } },
        { $group: { _id: null, total: { $sum: "$aiDailyUsage.count" } } },
      ]),

      // Voca usage today
      User.aggregate([
        { $match: { "vocaDailyUsage.date": todayKey } },
        { $group: { _id: null, total: { $sum: "$vocaDailyUsage.count" } } },
      ]),

      // Top 10 AI users by lifetime
      User.find({ "aiDailyUsage.lifetimeCount": { $gt: 0 } })
        .select("firstName lastName email plan aiDailyUsage")
        .sort({ "aiDailyUsage.lifetimeCount": -1 })
        .limit(10)
        .lean(),

      // Top 10 Voca users today
      User.find({ "vocaDailyUsage.date": todayKey })
        .select("firstName lastName email plan vocaDailyUsage")
        .sort({ "vocaDailyUsage.count": -1 })
        .limit(10)
        .lean(),

      // Count users who hit AI limit today (by plan)
      User.aggregate([
        { $match: { "aiDailyUsage.date": todayKey } },
        {
          $group: {
            _id: "$plan",
            hitLimit: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$aiDailyUsage.count",
                      {
                        $switch: {
                          branches: [
                            { case: { $eq: ["$plan", "pro"] }, then: 250 },
                            { case: { $eq: ["$plan", "ultra"] }, then: 750 },
                          ],
                          default: 50,
                        },
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      // Per-plan breakdown of AI usage today
      User.aggregate([
        { $match: { "aiDailyUsage.date": todayKey } },
        {
          $group: {
            _id: "$plan",
            totalAi: { $sum: "$aiDailyUsage.count" },
            users: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      analytics: {
        totalAiLifetime: totalAiLifetime[0]?.total || 0,
        totalVocaLifetime: totalVocaLifetime[0]?.total || 0,
        aiUsageToday: aiUsageToday[0]?.total || 0,
        vocaUsageToday: vocaUsageToday[0]?.total || 0,
        topAiUsersLifetime,
        topVocaUsersToday,
        usersHitAiLimit,
        planUsageBreakdown,
      },
    });
  } catch (err) {
    console.error("ADMIN ANALYTICS ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
}

/* ─────────────────────────────────────────────
   ANNOUNCEMENTS
───────────────────────────────────────────── */

export async function getAnnouncements(req, res) {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "email firstName lastName")
      .lean();
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
}

export async function createAnnouncement(req, res) {
  try {
    const { title, message, type, targetPlan, expiresAt } = req.body;
    if (!title || !message) return res.status(400).json({ error: "Title and message required" });

    const ann = await Announcement.create({
      title,
      message,
      type: type || "info",
      targetPlan: targetPlan || "all",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user.id || req.user._id,
    });

    broadcastAnnouncements();
    res.status(201).json({ success: true, announcement: ann });
  } catch (err) {
    console.error("ADMIN CREATE ANNOUNCEMENT ERROR:", err.message);
    res.status(500).json({ error: "Failed to create announcement" });
  }
}

export async function updateAnnouncement(req, res) {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ann) return res.status(404).json({ error: "Announcement not found" });
    broadcastAnnouncements();
    res.json({ success: true, announcement: ann });
  } catch (err) {
    res.status(500).json({ error: "Failed to update announcement" });
  }
}

export async function deleteAnnouncement(req, res) {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    broadcastAnnouncements();
    res.json({ success: true, message: "Announcement deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
}

// Public endpoint – called by user-facing app to show banners
export async function getActiveAnnouncements(req, res) {
  try {
    const now = new Date();
    const filter = {
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };
    const announcements = await Announcement.find(filter)
      .select("title message type targetPlan")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
}

/* ─────────────────────────────────────────────
   SYSTEM HEALTH
───────────────────────────────────────────── */

export async function getSystemHealth(req, res) {
  try {
    const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);

    // Check DB connectivity
    let dbStatus = "connected";
    try {
      await User.findOne().select("_id").lean();
    } catch {
      dbStatus = "error";
    }

    const env = {
      razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      r2: isR2Configured,
      redis: !!process.env.REDIS_URL,
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      jwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV || "development",
    };

    res.json({
      success: true,
      health: {
        uptimeSeconds,
        dbStatus,
        env,
        serverTime: new Date().toISOString(),
        nodeVersion: process.version,
        memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get system health" });
  }
}
