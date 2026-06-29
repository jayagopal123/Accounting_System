import BaseRepository from "./BaseRepository.js";
import ActivityLog from "../models/ActivityLog.js";

class ActivityLogRepository extends BaseRepository {
  constructor() {
    super(ActivityLog);
  }

  async findRecentByCategory(category, limit = 10) {
    return this.model
      .find({ category })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("performedBy", "name email")
      .lean();
  }

  async findByEntity(entity, entityId) {
    return this.model
      .find({ entity, entityId })
      .sort({ createdAt: -1 })
      .populate("performedBy", "name email")
      .lean();
  }

  async searchByCategory(category, page = 1, limit = 20, search = "") {
    const filter = { category };

    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: "i" } },
        { entity: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { performedByName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await this.model.countDocuments(filter);
    const data = await this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("performedBy", "name email")
      .lean();

    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }
}

export default ActivityLogRepository;
