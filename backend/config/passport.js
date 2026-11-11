import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

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
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase().trim();

          if (!email) {
            return done(new Error("No email found in Google profile"), null);
          }

          // 1️⃣ PRIMARY TRUTH: Match user by Google account email
          let user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            user.googleAccessToken = accessToken;
            if (refreshToken) user.googleRefreshToken = refreshToken;
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
              await existingWithGoogleId.save();
            } else {
              existingWithGoogleId.googleAccessToken = accessToken;
              if (refreshToken) existingWithGoogleId.googleRefreshToken = refreshToken;
              await existingWithGoogleId.save();
              return done(null, existingWithGoogleId);
            }
          }

          // 3️⃣ Create completely new user for this Google account (e.g. sakshamagarwal706@gmail.com)
          user = await User.create({
            googleId: profile.id,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken || "",
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
