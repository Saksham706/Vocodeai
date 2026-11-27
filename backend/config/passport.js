import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const GEMINI_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/generative-language.retriever",
].join(" ");

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:8000/api/auth/google/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, params, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase().trim();
          const expiresAt = Number(params?.expires_in)
            ? new Date(Date.now() + Number(params.expires_in) * 1000)
            : undefined;
          const grantedScopes = params?.scope || "profile email";

          if (!email) {
            return done(new Error("No email found in Google profile"), null);
          }

          // Safely unlink any existing document that might have this googleId with a different email
          await User.updateMany(
            { googleId: profile.id, email: { $ne: email } },
            {
              $unset: {
                googleId: 1,
                googleAccessToken: 1,
                googleRefreshToken: 1,
                googleAccessTokenExpiresAt: 1,
                googleOAuthScopes: 1,
              },
            }
          );

          // 1️⃣ PRIMARY TRUTH: Match user by Google account email
          let user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            user.googleAccessToken = accessToken;
            if (refreshToken) user.googleRefreshToken = refreshToken;
            if (expiresAt) user.googleAccessTokenExpiresAt = expiresAt;
            user.googleOAuthScopes = grantedScopes;
            if (!user.isVerified) user.isVerified = true;
            await user.save();
            return done(null, user);
          }

          // 2️⃣ If no user with this email, check if another user has this googleId and unlink if email mismatch
          const existingWithGoogleId = await User.findOne({ googleId: profile.id });
          if (existingWithGoogleId) {
            if (existingWithGoogleId.email.toLowerCase() !== email) {
              existingWithGoogleId.googleId = undefined;
              existingWithGoogleId.googleAccessToken = undefined;
              existingWithGoogleId.googleRefreshToken = undefined;
              existingWithGoogleId.googleAccessTokenExpiresAt = undefined;
              existingWithGoogleId.googleOAuthScopes = undefined;
              await existingWithGoogleId.save();
            } else {
              existingWithGoogleId.googleAccessToken = accessToken;
              if (refreshToken) existingWithGoogleId.googleRefreshToken = refreshToken;
              if (expiresAt) existingWithGoogleId.googleAccessTokenExpiresAt = expiresAt;
              existingWithGoogleId.googleOAuthScopes = grantedScopes;
              await existingWithGoogleId.save();
              return done(null, existingWithGoogleId);
            }
          }

          // 3️⃣ Create completely new user for this Google account (e.g. sakshamagarwal706@gmail.com)
          user = await User.create({
            googleId: profile.id,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken || "",
            googleAccessTokenExpiresAt: expiresAt,
            googleOAuthScopes: grantedScopes,
            email,
            firstName: profile.name?.givenName || email.split("@")[0],
            lastName: profile.name?.familyName || "",
            isVerified: true,
          });

          return done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
} else {
  console.log("ℹ️ Google OAuth not configured; skipping GoogleStrategy registration.");
}

export default passport;
