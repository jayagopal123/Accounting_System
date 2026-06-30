import BaseRepository from "./BaseRepository.js";
import Notification from "../models/Notification.js";

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findByRecipient(recipientId, page = 1, limit = 20) {
    const total = await this.model.countDocuments({ recipient: recipientId });
    const data = await this.model
      .find({ recipient: recipientId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findUnreadByRecipient(recipientId) {
    return this.model
      .find({ recipient: recipientId, isRead: false })
      .sort({ createdAt: -1 })
      .lean();
  }

  async countUnread(recipientId) {
    return this.model.countDocuments({ recipient: recipientId, isRead: false });
  }

  async markAsRead(notificationId) {
    return this.model.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllAsRead(recipientId) {
    return this.model.updateMany(
      { recipient: recipientId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }
}

export default new NotificationRepository();
