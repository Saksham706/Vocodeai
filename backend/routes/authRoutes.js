import express from "express";
import passport from "../config/passport.js";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  githubAuth,
  githubCallback,
  getGithubStatus,
  disconnectGithub,
  connectGithubToken,
  getProfile,
  updateProfile,
  changePassword,
  getStorageUsage,
} from "../controllers/authController.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

/* ================= GOOGLE OAUTH ================= */
router.get("/google", (req, res, next) => {
  const origin =
    req.query.origin ||
    req.headers.referer ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";
  const action = req.query.action || "login";
  const returnTo = req.query.returnTo || "";
  const provider = req.query.provider || "gemini";
  const model = req.query.model || "gemini-1.5-pro";
  const state = Buffer.from(
    JSON.stringify({ origin, action, returnTo, provider, model })
  ).toString("base64");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: req.query.prompt || "select_account consent",
    accessType: "offline",
    state,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      let targetOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
      let action = "login";
      let returnTo = "";
      let provider = "gemini";
      let model = "gemini-1.5-pro";

      if (req.query.state) {
        try {
          const parsed = JSON.parse(
            Buffer.from(req.query.state, "base64").toString("utf-8")
          );
          if (parsed.origin) {
            targetOrigin = parsed.origin.replace(/\/+$/, "");
          }
          if (parsed.action) action = parsed.action;
          if (parsed.returnTo) returnTo = parsed.returnTo;
          if (parsed.provider) provider = parsed.provider;
          if (parsed.model) model = parsed.model;
        } catch {}
      }

      const accessToken = generateAccessToken(req.user);
      const refreshToken = generateRefreshToken(req.user);

      req.user.refreshToken = refreshToken;
      await req.user.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });

      const userJson = encodeURIComponent(
        JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          hasGoogleAuth: Boolean(req.user.googleAccessToken || req.user.googleId),
        })
      );

      const googleParam = action === "ai_connect" ? "&googleConnected=true" : "";
      const googleEmailParam = `&googleEmail=${encodeURIComponent(req.user.email)}`;
      const returnParam = returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : "";
      const modelParam = `&provider=${encodeURIComponent(provider)}&model=${encodeURIComponent(model)}`;

      res.redirect(
        `${targetOrigin}/oauth-success?token=${accessToken}&refreshToken=${refreshToken}&user=${userJson}${googleParam}${googleEmailParam}${returnParam}${modelParam}`
      );
    } catch (err) {
      console.error("Google OAuth callback error:", err);
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth_failed`
      );
    }
  }
);

/* ================= GITHUB OAUTH (VS CODE STYLE) ================= */
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);
router.get("/github/status", auth, getGithubStatus);
router.post("/github/disconnect", auth, disconnectGithub);
router.post("/github/connect-token", auth, connectGithubToken);

/* ================= ACCOUNT MANAGEMENT ================= */
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);
router.get("/storage-usage", auth, getStorageUsage);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;
