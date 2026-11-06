import axios from "axios";
import User from "../models/User.js";

/**
 * Refreshes the user's Google OAuth access token if expired
 * @param {string} userId - User ID in MongoDB
 * @returns {Promise<string|null>} Fresh Google access token or null
 */
export async function getValidGoogleAccessToken(userId) {
  if (!userId) return null;

  try {
    const user = await User.findById(userId);
    if (!user) return null;

    let accessToken = user.googleAccessToken;
    const refreshToken = user.googleRefreshToken;

    // Test token validity with Google Userinfo / Tokeninfo
    if (accessToken) {
      try {
        const verifyRes = await axios.get(
          `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
          { timeout: 5000 }
        );
        if (verifyRes.data?.expires_in && verifyRes.data.expires_in > 60) {
          return accessToken;
        }
      } catch (tokenErr) {
        // Token expired or invalid, proceed to refresh
        console.info("Google access token expired, refreshing with refresh token...");
      }
    }

    // Refresh if refresh token exists
    if (refreshToken && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const refreshRes = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 10000,
        }
      );

      if (refreshRes.data?.access_token) {
        user.googleAccessToken = refreshRes.data.access_token;
        await user.save();
        return refreshRes.data.access_token;
      }
    }

    return accessToken || null;
  } catch (err) {
    console.warn("Failed to retrieve or refresh Google access token:", err.message);
    return null;
  }
}

