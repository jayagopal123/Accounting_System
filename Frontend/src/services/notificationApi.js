import api from "./api";

export const getNotifications = (page = 1, limit = 20) => {
  return api.get(`/notifications?page=${page}&limit=${limit}`);
};

export const getUnreadCount = () => {
  return api.get("/notifications/unread-count");
};

export const getUnreadNotifications = () => {
  return api.get("/notifications/unread");
};

export const markAsRead = (id) => {
  return api.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return api.patch("/notifications/read-all");
};
