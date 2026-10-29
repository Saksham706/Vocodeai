import express from "express";
import passport from "../config/passport.js";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
} from "../controllers/authController.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/google", (req, res, next) => {
  const origin =
    req.query.origin ||
    req.headers.referer ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";
  const state = Buffer.from(JSON.stringify({ origin })).toString("base64");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
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
      if (req.query.state) {
        try {
          const parsed = JSON.parse(
            Buffer.from(req.query.state, "base64").toString("utf-8")
          );
          if (parsed.origin) {
            targetOrigin = parsed.origin.replace(/\/+$/, "");
          }
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
        })
      );

      res.redirect(
        `${targetOrigin}/oauth-success?token=${accessToken}&refreshToken=${refreshToken}&user=${userJson}`
      );
    } catch (err) {
      console.error("Google OAuth callback error:", err);
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth_failed`
      );
    }
  }
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;
