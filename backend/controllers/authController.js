import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { getWorkspacesRoot } from "../config/paths.js";
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
        lastName: user.lastName,
        avatar: user.avatar || "default",
        phone: user.phone || "",
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

/**
 * Fetch current user profile
 */
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select(
      "-passwordHash -refreshToken -resetOTP -resetOTPExpiry"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile: " + err.message });
  }
}

/**
 * Update user profile details
 */
export async function updateProfile(req, res) {
  try {
    const { firstName, lastName, phone, avatar } = req.body;
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName.trim();
    if (lastName !== undefined) updates.lastName = lastName.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (avatar !== undefined) updates.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-passwordHash -refreshToken -resetOTP -resetOTPExpiry");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile: " + err.message });
  }
}

/**
 * Change account password
 */
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.passwordHash) {
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return res.status(400).json({ error: "Incorrect current password" });
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = passwordHash;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password: " + err.message });
  }
}

function calculateDirSize(dirPath) {
  let total = 0;
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      try {
        if (entry.isDirectory()) {
          total += calculateDirSize(fullPath);
        } else if (entry.isFile()) {
          const stats = fs.statSync(fullPath);
          total += stats.size;
        }
      } catch {}
    }
  } catch {}
  return total;
}

/**
 * Real-time storage quota and cloud sandbox usage calculation
 */
export async function getStorageUsage(req, res) {
  try {
    const userId = req.user.id;
    const userDir = path.join(getWorkspacesRoot(), String(userId));
    const usedBytes = calculateDirSize(userDir);

    const workspaceCount = await Workspace.countDocuments({
      userId,
    });

    const maxBytes = 10 * 1024 * 1024 * 1024; // 10 GB limit
    const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
    const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
    const percent = Math.min(100, Math.round((usedBytes / maxBytes) * 100));

    res.json({
      success: true,
      usedBytes,
      usedFormatted:
        usedBytes > 1024 * 1024 * 1024 ? `${usedGB} GB` : `${usedMB} MB`,
      maxFormatted: "10.0 GB",
      percentUtilized: percent,
      availableFormatted: `${(10 - Number(usedGB)).toFixed(1)} GB`,
      workspaceCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate storage quota: " + err.message });
  }
}
