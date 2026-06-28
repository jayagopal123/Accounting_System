import express from "express";
import dashboardController from "../controllers/DashboardController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/summary",
  authenticate,
  dashboardController.getSummary,
);

export default router;
