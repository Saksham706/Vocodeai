import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { generateOTP, hashOTP } from "../utils/otp.js";
import { sendEmail } from "../utils/sendEmail.js";

export async function signup(req, res) {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      firstName,
      lastName,
      phone,
      email,
      passwordHash,
    });

    res.json({ message: "Account created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed: " + err.message });
  }
}

/* ================= LOGIN ================= */

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

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

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
}

/* ================= FORGOT PASSWORD ================= */

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If email exists, OTP sent" });
    }

    const otp = generateOTP();
    const hash = await hashOTP(otp);

    user.resetOTP = hash;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendEmail(
        email,
        "VocodeAI Password Reset OTP",
        `Your reset OTP is: ${otp}`
      );
    } catch (mailErr) {
      console.error("Nodemailer failed:", mailErr.message);
      return res.status(500).json({
        error: "Failed to send email. Check SMTP settings.",
      });
    }

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ================= RESET PASSWORD ================= */

export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.resetOTP) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const match = await bcrypt.compare(otp, user.resetOTP);
    if (!match) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ================= REFRESH TOKEN ================= */

export async function refreshToken(req, res) {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(403).json({ error: "Invalid or reuse detected" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
      },
    });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    res.status(403).json({ error: "Token expired or invalid: " + err.message });
  }
}

/* ================= LOGOUT ================= */

export async function logout(req, res) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
        }
      } catch (err) {
        console.warn("Logout token verification warning:", err.message);
      }
    }

    res.clearCookie("refreshToken", cookieOptions);
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.clearCookie("refreshToken", cookieOptions);
    return res.json({ message: "Logged out" });
  }
}

/* ================= GITHUB OAUTH & INTEGRATION ================= */

/**
 * Initiates GitHub OAuth authorization (VS Code Style)
 */
export async function githubAuth(req, res) {
  try {
    const { token, workspaceId } = req.query;
    const origin = req.query.origin || process.env.FRONTEND_URL || "http://localhost:5173";

    if (!process.env.GITHUB_CLIENT_ID) {
      return res.redirect(
        `${origin}/workspace/${workspaceId || ""}?github_error=missing_client_id`
      );
    }

    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn("Invalid JWT in githubAuth query:", err.message);
      }
    }

    const stateObj = {
      userId,
      workspaceId: workspaceId || "",
      origin,
    };
    const state = Buffer.from(JSON.stringify(stateObj)).toString("base64");

    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user:email,workflow&state=${state}`;
    res.redirect(githubUrl);
  } catch (err) {
    console.error("githubAuth error:", err);
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}?github_error=${encodeURIComponent(err.message)}`);
  }
}

/**
 * Handles callback from GitHub OAuth
 */
export async function githubCallback(req, res) {
  try {
    const { code, state, error, error_description } = req.query;

    let parsedState = { origin: process.env.FRONTEND_URL || "http://localhost:5173", workspaceId: "", userId: null };
    if (state) {
      try {
        parsedState = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
      } catch {}
    }

    const targetOrigin = parsedState.origin.replace(/\/+$/, "");
    const wsTarget = parsedState.workspaceId ? `/workspace/${parsedState.workspaceId}` : "";

    if (error) {
      console.error("GitHub returned OAuth error:", error, error_description);
      return res.redirect(`${targetOrigin}${wsTarget}?github_error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code) {
      return res.redirect(`${targetOrigin}${wsTarget}?github_error=missing_code`);
    }

    // 1. Exchange code for GitHub access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
        timeout: 15000,
      }
    );

    const ghAccessToken = tokenRes.data.access_token;
    if (!ghAccessToken) {
      const errMsg = tokenRes.data.error_description || tokenRes.data.error || "Failed to acquire GitHub token";
      return res.redirect(`${targetOrigin}${wsTarget}?github_error=${encodeURIComponent(errMsg)}`);
    }

    // 2. Fetch user profile from GitHub API
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${ghAccessToken}`,
        "User-Agent": "VocodeAI-App",
      },
      timeout: 10000,
    });

    const ghUser = userRes.data;

    // 3. Update MongoDB user record
    if (parsedState.userId) {
      await User.findByIdAndUpdate(parsedState.userId, {
        githubId: String(ghUser.id),
        githubUsername: ghUser.login,
        githubAccessToken: ghAccessToken,
        githubAvatar: ghUser.avatar_url,
      });
    }

    // 4. Redirect seamlessly back to project workspace
    res.redirect(
      `${targetOrigin}${wsTarget}?github=connected&username=${encodeURIComponent(ghUser.login)}&avatar=${encodeURIComponent(ghUser.avatar_url || "")}`
    );
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}?github_error=${encodeURIComponent(err.message)}`
    );
  }
}

/**
 * Returns current user's GitHub connection status
 */
export async function getGithubStatus(req, res) {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      connected: !!user.githubAccessToken,
      username: user.githubUsername || null,
      avatar: user.githubAvatar || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Disconnects GitHub from user account
 */
export async function disconnectGithub(req, res) {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      githubId: null,
      githubUsername: null,
      githubAccessToken: null,
      githubAvatar: null,
    });
    res.json({ success: true, message: "GitHub account disconnected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Connects GitHub using a Personal Access Token directly (Instant 1-click fallback)
 */
export async function connectGithubToken(req, res) {
  try {
    const { token } = req.body;
    if (!token || !token.trim()) {
      return res.status(400).json({ error: "GitHub token is required" });
    }

    const cleanToken = token.trim();

    // Verify token with GitHub
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "User-Agent": "VocodeAI-App",
      },
      timeout: 10000,
    });

    const ghUser = userRes.data;

    await User.findByIdAndUpdate(req.user.id, {
      githubId: String(ghUser.id),
      githubUsername: ghUser.login,
      githubAccessToken: cleanToken,
      githubAvatar: ghUser.avatar_url,
    });

    res.json({
      success: true,
      message: `Connected successfully to @${ghUser.login}`,
      username: ghUser.login,
      avatar: ghUser.avatar_url,
    });
  } catch (err) {
    console.error("connectGithubToken error:", err.message);
    const msg = err.response?.data?.message || err.message || "Invalid GitHub token";
    res.status(400).json({ error: `GitHub Verification Failed: ${msg}` });
  }
}
