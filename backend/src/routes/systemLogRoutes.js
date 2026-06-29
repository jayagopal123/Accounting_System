import express from "express";
import systemLogController from "../controllers/SystemLogController.js";
import authenticate from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  rbacMiddleware("audit_logs:view"),
  systemLogController.getLogs,
);

export default router;
