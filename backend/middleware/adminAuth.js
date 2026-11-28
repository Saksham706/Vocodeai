import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Admin-only middleware.
 * Verifies JWT, then checks that the user has isAdmin = true in DB.
 */
export async function adminAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Admin token required." });
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Session expired or invalid. Please re-login." });
  }

  try {
    const user = await User.findById(decoded.id || decoded._id).select("isAdmin isSuspended email").lean();

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    req.user = decoded;
    req.adminUser = user;
    next();
  } catch (err) {
    console.error("ADMIN AUTH ERROR:", err.message);
    return res.status(500).json({ error: "Internal auth error." });
  }
}
