import api from "./api";

export const getDashboardSummary = () => {
  return api.get("/dashboard/summary");
};

export const getRecentActivities = (limit = 10) => {
  return api.get(`/dashboard/recent-activities?limit=${limit}`);
};
