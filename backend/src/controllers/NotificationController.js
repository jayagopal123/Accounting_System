import notificationService from "../services/NotificationService.js";
import catchAsync from "../utils/catchAsync.js";

class NotificationController {
  getNotifications = catchAsync(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await notificationService.getNotifications(
      req.user._id,
      Number(page),
      Number(limit),
    );

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully.",
      data: result,
    });
  });

  getUnreadCount = catchAsync(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  });

  getUnreadNotifications = catchAsync(async (req, res) => {
    const notifications = await notificationService.getUnreadNotifications(req.user._id);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  });

  markAsRead = catchAsync(async (req, res) => {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  });

  markAllAsRead = catchAsync(async (req, res) => {
    await notificationService.markAllAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  });
}

export default new NotificationController();
