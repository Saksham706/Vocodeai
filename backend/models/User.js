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

    // GitHub Integration
    githubId: String,
    githubUsername: String,
    githubAccessToken: String,
    githubAvatar: String,

    isVerified: { type: Boolean, default: false },

    refreshToken: String,

    resetOTP: String,
    resetOTPExpiry: Date,

    // AI Integration credentials (per-user / per-model)
    aiCredentials: {
      type: Map,
      of: new mongoose.Schema(
        {
          provider: String,
          model: String,
          accountEmail: String,
          apiKey: String,
          authMethod: String,
          connectedAt: Date,
        },
        { _id: false }
      ),
      default: {},
    },
    activeAiConfig: {
      provider: String,
      model: String,
      accountEmail: String,
      apiKey: String,
      authMethod: String,
      label: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
