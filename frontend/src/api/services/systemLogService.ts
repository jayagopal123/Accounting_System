import { apiClient } from "../client";
import { normalizePaged, type Paged } from "../normalize";

export interface SystemLogItem {
  _id: string;
  action: string;
  entity: string;
  entityName: string;
  performedByName: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

export const systemLogService = {
  getLogs: async (params?: { page?: number; limit?: number; search?: string }): Promise<Paged<SystemLogItem>> => {
    const res = await apiClient.get("/system-logs", { params });
    return normalizePaged<SystemLogItem>(res);
  },
};
