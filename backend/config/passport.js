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
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error("No email found in Google profile"), null);
          }

          let stateData = {};
          if (req.query?.state) {
            try {
              stateData = JSON.parse(
                Buffer.from(req.query.state, "base64").toString("utf-8")
              );
            } catch {}
          }

          // 0️⃣ If userId provided in state, link directly to this user
          if (stateData.userId) {
            let user = await User.findById(stateData.userId);
            if (user) {
              user.googleId = profile.id;
              user.googleAccessToken = accessToken;
              if (refreshToken) user.googleRefreshToken = refreshToken;
              await user.save();
              return done(null, user);
            }
          }

          // 1️⃣ Check if user already linked with Google
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            user.googleAccessToken = accessToken;
            if (refreshToken) user.googleRefreshToken = refreshToken;
            await user.save();
            return done(null, user);
          }

          // 2️⃣ Check if email already exists (manual signup user)
          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            user.googleAccessToken = accessToken;
            if (refreshToken) user.googleRefreshToken = refreshToken;
            await user.save();
            return done(null, user);
          }

          // 3️⃣ Create completely new user
          user = await User.create({
            googleId: profile.id,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken || "",
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
