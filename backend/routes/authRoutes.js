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
  const returnTo = req.query.returnTo || "";
  const state = Buffer.from(JSON.stringify({ origin, action: "login", returnTo })).toString("base64");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: req.query.prompt || "select_account",
    accessType: "offline",
    includeGrantedScopes: true,
    state,
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user, info) => {
    let targetOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
    let returnTo = "";

    if (req.query.state) {
      try {
        const parsed = JSON.parse(Buffer.from(req.query.state, "base64").toString("utf-8"));
        if (parsed.origin) {
          targetOrigin = parsed.origin.replace(/\/+$/, "");
        }
        if (parsed.returnTo) returnTo = parsed.returnTo;
      } catch {}
    }

    if (err || !user) {
      console.error("Google OAuth authentication error:", err || info);
      const errMsg = encodeURIComponent(err?.message || (typeof info === "string" ? info : info?.message) || "oauth_failed");
      return res.redirect(`${targetOrigin}/?auth=login&error=${errMsg}`);
    }

    try {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });

      const userJson = encodeURIComponent(
        JSON.stringify({
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          hasGoogleAuth: Boolean(user.googleAccessToken || user.googleId),
        })
      );

      const returnParam = returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : "";

      return res.redirect(
        `${targetOrigin}/oauth-success?token=${accessToken}&refreshToken=${refreshToken}&user=${userJson}${returnParam}`
      );
    } catch (saveErr) {
      console.error("Google OAuth token generation error:", saveErr);
      return res.redirect(`${targetOrigin}/?auth=login&error=oauth_failed`);
    }
  })(req, res, next);
});

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
