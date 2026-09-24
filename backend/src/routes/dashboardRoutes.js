import express from "express";
import dashboardController from "../controllers/DashboardController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/summary",
  authenticate,
  dashboardController.getSummary,
);

router.get(
  "/recent-activities",
  authenticate,
  dashboardController.getRecentActivities,
);

// Daily cash inflow/outflow series derived from submitted Payments.
// Query params: ?days=30 (default 30, capped at 365)
router.get(
  "/cash-flow-series",
  authenticate,
  dashboardController.getCashFlowSeries,
);

export default router;
