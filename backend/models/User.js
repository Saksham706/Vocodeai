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

    // Persistent Daily AI Quota (150 requests/day, resets at 12:00 AM midnight)
    aiDailyUsage: {
      date: { type: String, default: "" },
      count: { type: Number, default: 0 },
      lifetimeCount: { type: Number, default: 0 },
    },

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
