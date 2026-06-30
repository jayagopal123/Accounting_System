import express from "express";
import notificationController from "../controllers/NotificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  notificationController.getNotifications,
);

router.get(
  "/unread-count",
  authMiddleware,
  notificationController.getUnreadCount,
);

router.get(
  "/unread",
  authMiddleware,
  notificationController.getUnreadNotifications,
);

router.patch(
  "/:id/read",
  authMiddleware,
  notificationController.markAsRead,
);

router.patch(
  "/read-all",
  authMiddleware,
  notificationController.markAllAsRead,
);

export default router;
