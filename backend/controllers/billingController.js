import crypto from "crypto";
import axios from "axios";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { PLANS, getEffectivePlanId, getPlanConfig } from "../config/plans.js";

function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/**
 * GET /api/billing/plans
 * Public endpoint returning all 3 plans and Razorpay readiness
 */
export async function getPlans(req, res) {
  return res.json({
    success: true,
    razorpayEnabled: isRazorpayConfigured(),
    currency: "INR",
    plans: [PLANS.free, PLANS.pro, PLANS.ultra],
  });
}

/**
 * GET /api/billing/status
 * Authenticated endpoint returning current user's plan and usage
 */
export async function getBillingStatus(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    const user = await User.findById(userId)
      .select("-passwordHash -refreshToken -resetOTP -resetOTPExpiry")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const planId = getEffectivePlanId(user);
    const plan = getPlanConfig(planId);
    const todayKey = new Date().toISOString().slice(0, 10);

    const aiToday =
      user.aiDailyUsage?.date === todayKey ? user.aiDailyUsage.count || 0 : 0;
    const vocaToday =
      user.vocaDailyUsage?.date === todayKey
        ? user.vocaDailyUsage.count || 0
        : 0;
    const workspaceCount = await Workspace.countDocuments({ userId });

    return res.json({
      success: true,
      razorpayEnabled: isRazorpayConfigured(),
      planId,
      plan,
      planStartedAt: user.planStartedAt || null,
      planExpiresAt: user.planExpiresAt || null,
      usage: {
        aiToday,
        aiLimit: plan.limits.aiDailyLimit,
        vocaToday,
        vocaLimit: plan.limits.vocaDailyLimit,
        workspaceCount,
        maxWorkspaces: plan.limits.maxWorkspaces,
      },
    });
  } catch (err) {
    console.error("BILLING STATUS ERROR:", err.message);
    return res.status(500).json({ error: "Failed to fetch billing status" });
  }
}

/**
 * POST /api/billing/create-order
 * Creates a Razorpay order for upgrading to 'pro' or 'ultra'
 */
export async function createRazorpayOrder(req, res) {
  try {
    const { planId } = req.body;
    const targetPlan = PLANS[String(planId || "").toLowerCase()];

    if (!targetPlan || targetPlan.id === "free") {
      return res
        .status(400)
        .json({ error: "Please select a valid paid plan (pro or ultra)." });
    }

    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        error:
          "Razorpay is not configured on the server yet. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.",
      });
    }

    const userId = String(req.user.id || req.user._id);
    const amountPaise = Math.round(targetPlan.priceMonthlyINR * 100);

    const authHeader = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const receipt = `vocode_${targetPlan.id}_${userId.slice(-6)}_${Date.now()}`.slice(0, 40);

    const { data: order } = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: amountPaise,
        currency: "INR",
        receipt,
        notes: {
          userId,
          planId: targetPlan.id,
          planName: targetPlan.name,
        },
      },
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: targetPlan,
    });
  } catch (err) {
    console.error(
      "RAZORPAY CREATE ORDER ERROR:",
      err.response?.data || err.message
    );
    return res.status(500).json({
      error:
        err.response?.data?.error?.description ||
        "Failed to create Razorpay order",
    });
  }
}

/**
 * POST /api/billing/verify-payment
 * Verifies Razorpay HMAC-SHA256 payment signature and activates the user's plan
 */
export async function verifyRazorpayPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ error: "Missing Razorpay payment verification fields." });
    }

    const targetPlan = PLANS[String(planId || "").toLowerCase()];
    if (!targetPlan || targetPlan.id === "free") {
      return res.status(400).json({ error: "Invalid planId." });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ error: "Razorpay secret not configured." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ error: "Invalid Razorpay payment signature." });
    }

    const userId = String(req.user.id || req.user._id);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        plan: targetPlan.id,
        planStartedAt: now,
        planExpiresAt: expiresAt,
        billingProvider: "razorpay",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    )
      .select("-passwordHash -refreshToken -resetOTP -resetOTPExpiry")
      .lean();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({
      success: true,
      message: `Upgraded to VocodeAI ${targetPlan.name}!`,
      planId: targetPlan.id,
      plan: targetPlan,
      user: updatedUser,
    });
  } catch (err) {
    console.error("RAZORPAY VERIFY ERROR:", err.message);
    return res.status(500).json({ error: "Payment verification failed." });
  }
}
