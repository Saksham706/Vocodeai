import axios from "axios";
import User from "../models/User.js";

/**
 * Returns a usable Google OAuth access token for Gemini without asking the user
 * to sign in again. OAuth tokens and refresh tokens stay on the server.
 */
export async function getValidGoogleAccessToken(userId) {
  const user = await User.findById(userId).select(
    "googleAccessToken googleRefreshToken googleAccessTokenExpiresAt"
  );

  if (!user || (!user.googleAccessToken && !user.googleRefreshToken)) {
    throw new Error("Sign in to VocodeAI with Google to use Gemini with your Google account.");
  }

  const expiresAt = user.googleAccessTokenExpiresAt
    ? new Date(user.googleAccessTokenExpiresAt).getTime()
    : 0;
  const needsRefresh = Boolean(
    user.googleRefreshToken &&
    (!user.googleAccessToken || !expiresAt || expiresAt <= Date.now() + 120000)
  );

  if (!needsRefresh) {
    if (user.googleAccessToken && expiresAt > Date.now()) {
      return user.googleAccessToken;
    }
    throw new Error("Your Google sign-in has expired. Sign in with Google again once to reconnect Gemini.");
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google Gemini sign-in is not configured on this server.");
  }

  try {
    const body = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.googleRefreshToken,
      grant_type: "refresh_token",
    });
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      body.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      }
    );

    if (!response.data?.access_token) {
      throw new Error("Google did not return an access token.");
    }

    user.googleAccessToken = response.data.access_token;
    if (response.data.refresh_token) {
      user.googleRefreshToken = response.data.refresh_token;
    }
    if (Number(response.data.expires_in)) {
      user.googleAccessTokenExpiresAt = new Date(
        Date.now() + Number(response.data.expires_in) * 1000
      );
    }
    await user.save();
    return user.googleAccessToken;
  } catch (error) {
    // Do not log or expose Axios request details, which may contain credentials.
    const providerMessage =
      error.response?.data?.error_description ||
      error.response?.data?.error ||
      error.message;
    throw new Error(
      `Could not refresh your Google sign-in for Gemini. Sign in with Google again once to reconnect. ${providerMessage}`
    );
  }
}

export async function getGoogleAIAccountStatus(userId) {
  const user = await User.findById(userId)
    .select("googleId googleAccessToken googleRefreshToken googleOAuthScopes email")
    .lean();

  const connected = Boolean(
    user?.googleId && (user.googleRefreshToken || user.googleAccessToken)
  );
  return {
    connected,
    geminiAuthorized: Boolean(
      user?.googleOAuthScopes?.split(/\s+/).includes("https://www.googleapis.com/auth/cloud-platform") &&
      user?.googleOAuthScopes?.split(/\s+/).includes("https://www.googleapis.com/auth/generative-language.retriever")
    ),
    email: connected ? user.email || null : null,
  };
}
