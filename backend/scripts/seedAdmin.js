

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

// ─── CONFIGURE YOUR ADMIN CREDENTIALS HERE ───────────────────────
const ADMIN_EMAIL     = "sakshamagarwal004@gmail.com";   // change this
const ADMIN_PASSWORD  = "S1@2k3s4";             // change this (min 8 chars)
const ADMIN_FIRSTNAME = "Saksham";
const ADMIN_LASTNAME  = "Agarwal";
// ─────────────────────────────────────────────────────────────────

async function seedAdmin() {
  if (!process.env.MONGO_URI) {
    console.error("❌  MONGO_URI not found in backend/.env");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  Connected.");

  // Dynamically import the User model (ES module)
  const { default: User } = await import("../models/User.js");

  const escapedEmail = ADMIN_EMAIL.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existing = await User.findOne({
    email: { $regex: new RegExp(`^${escapedEmail}$`, "i") },
  });

  if (existing) {
    // Update existing user → make admin + update password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.updateOne(
      { _id: existing._id },
      {
        $set: {
          passwordHash,
          isAdmin: true,
          isVerified: true,
          isSuspended: false,
          firstName: ADMIN_FIRSTNAME,
          lastName:  ADMIN_LASTNAME,
        },
      }
    );
    console.log(`✅  Existing user updated → isAdmin: true`);
    console.log(`    Email   : ${ADMIN_EMAIL}`);
  } else {
    // Create brand-new admin user
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      email:        ADMIN_EMAIL,
      passwordHash,
      firstName:    ADMIN_FIRSTNAME,
      lastName:     ADMIN_LASTNAME,
      isAdmin:      true,
      isVerified:   true,
      isSuspended:  false,
      plan:         "ultra",
      planStartedAt: new Date(),
      planExpiresAt: new Date("2099-12-31"),
    });
    console.log(`✅  Admin user created!`);
    console.log(`    Email   : ${ADMIN_EMAIL}`);
  }

  console.log(`    Password: ${ADMIN_PASSWORD}`);
  console.log("\n🚀  You can now log in at /admin\n");
  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
