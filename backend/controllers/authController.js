import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { generateOTP, hashOTP } from "../utils/otp.js";
import { sendEmail } from "../utils/sendEmail.js";

export async function signup(req, res) {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All required fields must be filled" });
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

  } catch {
    res.status(500).json({ error: "Signup failed" });
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
      secure: true,
      sameSite: "none",
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

  } catch {
    res.status(500).json({ error: "Login failed" });
  }
}

/* ================= FORGOT PASSWORD ================= */

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    user.resetOTP = hashedOTP;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

   await sendEmail(
  email,
  "Password Reset OTP - Vocodeai",
  `
  <div style="margin:0;padding:0;background-color:#0b1f1a;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#0f2e25,#092019);border-radius:12px;padding:40px;text-align:center;color:#e6f4ef;">

      <!-- Logo -->
      <h1 style="color:#00ff9c;margin-bottom:10px;">Vocodeai</h1>

      <!-- Title -->
      <h2 style="margin-top:0;color:#ffffff;">Password Reset Request</h2>

      <p style="color:#b5d8cc;font-size:15px;line-height:1.6;">
        We received a request to reset your password for your Vocodeai account.
      </p>

      <!-- OTP Box -->
      <div style="margin:30px 0;">
        <div style="
          display:inline-block;
          background:#001f17;
          padding:18px 40px;
          border-radius:10px;
          border:1px solid #00ff9c;
          font-size:28px;
          font-weight:bold;
          letter-spacing:6px;
          color:#00ff9c;">
          ${otp}
        </div>
      </div>

      <p style="color:#b5d8cc;font-size:14px;">
        This OTP is valid for <strong style="color:#00ff9c;">10 minutes</strong>.
      </p>

      <p style="color:#7fa89a;font-size:13px;margin-top:30px;">
        If you did not request this, you can safely ignore this email.
      </p>

      <hr style="border:none;border-top:1px solid #123c31;margin:30px 0;">

      <p style="font-size:12px;color:#6f9488;">
        © ${new Date().getFullYear()} Vocodeai — The AI Workspace Built for Modern Developers
      </p>

    </div>
  </div>
  `
);

    res.json({ message: "OTP sent successfully" });

  } catch {
    res.status(500).json({ error: "Failed to send OTP" });
  }
}

/* ================= RESET PASSWORD ================= */

export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid request" });

    const hashedOTP = hashOTP(otp);

    if (
      user.resetOTP !== hashedOTP ||
      user.resetOTPExpiry < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetOTP = null;
    user.resetOTPExpiry = null;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch {
    res.status(500).json({ error: "Reset failed" });
  }
}

/* ================= REFRESH TOKEN ================= */

export async function refreshToken(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ error: "Invalid refresh token" });
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

  } catch {
    res.status(403).json({ error: "Token expired or invalid" });
  }
}

/* ================= LOGOUT ================= */

export async function logout(req, res) {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });

  } catch {
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  }
}