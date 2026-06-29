import api from "./api";

export const getSystemLogs = (page = 1, limit = 20, search = "") => {
  const params = { page, limit };
  if (search) params.search = search;
  return api.get("/system-logs", { params });
};
