import notificationRepository from "../repositories/NotificationRepository.js";
import ApiError from "../utils/ApiError.js";

class NotificationService {
  async createNotification({ recipient, type, title, message, entityType = "", entityId = null, link = "" }) {
    return notificationRepository.create({
      recipient,
      type,
      title,
      message,
      entityType,
      entityId,
      link,
    });
  }

  async getNotifications(recipientId, page = 1, limit = 20) {
    return notificationRepository.findByRecipient(recipientId, page, limit);
  }

  async getUnreadCount(recipientId) {
    return notificationRepository.countUnread(recipientId);
  }

  async getUnreadNotifications(recipientId) {
    return notificationRepository.findUnreadByRecipient(recipientId);
  }

  async markAsRead(notificationId, recipientId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new ApiError(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
    }
    if (notification.recipient.toString() !== recipientId.toString()) {
      throw new ApiError(403, "Access denied to this notification", "FORBIDDEN");
    }
    return notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(recipientId) {
    return notificationRepository.markAllAsRead(recipientId);
  }
}

export default new NotificationService();
