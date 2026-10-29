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
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error("No email found in Google profile"), null);
          }

          // 1️⃣ Check if user already linked with Google
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // 2️⃣ Check if email already exists (manual signup user)
          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          // 3️⃣ Create completely new user
          user = await User.create({
            googleId: profile.id,
            email,
            firstName: profile.name?.givenName || "User",
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
