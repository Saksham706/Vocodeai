import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: { type: String, default: "default" },
    email: { type: String, unique: true, required: true },

    passwordHash: String,

    googleId: String,
    googleAccessToken: String,
    googleRefreshToken: String,
    googleAccessTokenExpiresAt: Date,
    googleOAuthScopes: String,

    // GitHub Integration
    githubId: String,
    githubUsername: String,
    githubAccessToken: String,
    githubAvatar: String,

    isVerified: { type: Boolean, default: false },

    refreshToken: String,

    resetOTP: String,
    resetOTPExpiry: Date,

    // Subscription Plan & Razorpay Billing
    plan: {
      type: String,
      enum: ["free", "pro", "ultra"],
      default: "free",
    },
    planStartedAt: { type: Date, default: null },
    planExpiresAt: { type: Date, default: null },
    billingProvider: { type: String, default: null },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },

    // Persistent Daily AI Chat Quota (resets at 12:00 AM midnight)
    aiDailyUsage: {
      date: { type: String, default: "" },
      count: { type: Number, default: 0 },
      lifetimeCount: { type: Number, default: 0 },
    },

    // Persistent Daily Voco Voice AI Quota (resets at 12:00 AM midnight)
    vocaDailyUsage: {
      date: { type: String, default: "" },
      count: { type: Number, default: 0 },
      lifetimeCount: { type: Number, default: 0 },
    },

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
