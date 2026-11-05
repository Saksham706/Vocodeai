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

    // GitHub Integration
    githubId: String,
    githubUsername: String,
    githubAccessToken: String,
    githubAvatar: String,

    isVerified: { type: Boolean, default: false },

    refreshToken: String,

    resetOTP: String,
    resetOTPExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
