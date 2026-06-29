import ActivityLogRepository from "../repositories/ActivityLogRepository.js";

const activityLogRepository = new ActivityLogRepository();

class ActivityLogService {
  async logActivity({ action, entity, entityId, entityName, description, category = "business", performedBy = null, performedByName = "", metadata = {} }) {
    return activityLogRepository.create({
      action,
      entity,
      entityId,
      entityName,
      description,
      category,
      performedBy,
      performedByName,
      metadata,
    });
  }

  async getRecentBusinessActivities(limit = 10) {
    return activityLogRepository.findRecentByCategory("business", limit);
  }

  async getSystemLogs(page = 1, limit = 20, search = "") {
    return activityLogRepository.searchByCategory("security", page, limit, search);
  }

  async getRecentSystemLogs(limit = 10) {
    return activityLogRepository.findRecentByCategory("security", limit);
  }
}

export default new ActivityLogService();
