import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  getOverview,
  getUsers,
  getUserDetail,
  updateUserPlan,
  toggleSuspendUser,
  resetUserQuota,
  deleteUser,
  toggleAdminRole,
  getSubscriptions,
  extendUserPlan,
  getWorkspaces,
  deleteWorkspaceAdmin,
  getAnalytics,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
  getSystemHealth,
} from "../controllers/adminController.js";

const router = express.Router();

// ── Public endpoint (used by the main app to show banners) ──
router.get("/announcements/active", getActiveAnnouncements);

// ── All routes below require admin JWT ──
router.use(adminAuth);

// Overview
router.get("/overview", getOverview);

// Users
router.get("/users", getUsers);
router.get("/users/:id", getUserDetail);
router.patch("/users/:id/plan", updateUserPlan);
router.patch("/users/:id/suspend", toggleSuspendUser);
router.patch("/users/:id/reset-quota", resetUserQuota);
router.patch("/users/:id/toggle-admin", toggleAdminRole);
router.delete("/users/:id", deleteUser);

// Subscriptions & Revenue
router.get("/subscriptions", getSubscriptions);
router.patch("/subscriptions/:id/extend", extendUserPlan);

// Workspaces
router.get("/workspaces", getWorkspaces);
router.delete("/workspaces/:id", deleteWorkspaceAdmin);

// Analytics
router.get("/analytics", getAnalytics);

// Announcements (admin CRUD)
router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);
router.patch("/announcements/:id", updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

// System Health
router.get("/system", getSystemHealth);

export default router;
