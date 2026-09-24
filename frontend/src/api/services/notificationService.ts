import { apiClient } from "../client";
import { normalizePaged, unwrap, type Paged } from "../normalize";

export type NotificationType =
  | "invoice_created"
  | "invoice_submitted"
  | "invoice_cancelled"
  | "payment_received"
  | "payment_made"
  | "journal_submitted"
  | "budget_approved"
  | "budget_exceeded"
  | "credit_note_issued"
  | "debit_note_issued"
  | "system_alert";

export interface NotificationItem {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (params?: { page?: number; limit?: number; isRead?: boolean }): Promise<Paged<NotificationItem>> => {
    const res = await apiClient.get("/notifications", { params });
    const page = normalizePaged<NotificationItem>(res);
    // Backend paged envelope nests items under `data`
    return { ...page, items: (page.items ?? []) as NotificationItem[] };
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get("/notifications/unread-count");
    const data = unwrap<{ unreadCount?: number; count?: number }>(res);
    return data?.unreadCount ?? data?.count ?? 0;
  },

  getUnread: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get("/notifications/unread");
    return unwrap<NotificationItem[]>(res);
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return unwrap<NotificationItem>(res);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read-all");
  },
};
