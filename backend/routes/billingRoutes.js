import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getPlans,
  getBillingStatus,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/billingController.js";

const router = express.Router();

router.get("/plans", getPlans);
router.get("/status", auth, getBillingStatus);
router.post("/create-order", auth, createRazorpayOrder);
router.post("/verify-payment", auth, verifyRazorpayPayment);

export default router;
