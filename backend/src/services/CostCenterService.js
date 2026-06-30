import costCenterRepository from "../repositories/CostCenterRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class CostCenterService {
  async createCostCenter(data) {
    const existing = await costCenterRepository.findByCode(data.code);
    if (existing) {
      throw new ApiError(409, "Cost center code already exists", "DUPLICATE_CODE");
    }

    const costCenter = await costCenterRepository.create(data);

    await activityLogService.logActivity({
      action: "Created",
      entity: "CostCenter",
      entityId: costCenter._id,
      entityName: costCenter.name,
      description: `Cost Center ${costCenter.name} (${costCenter.code}) was created`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return costCenter;
  }

  async getCostCenters() {
    return costCenterRepository.findAll();
  }

  async getCostCenterById(id) {
    const costCenter = await costCenterRepository.findById(id);
    if (!costCenter) {
      throw new ApiError(404, "Cost center not found", "COST_CENTER_NOT_FOUND");
    }
    return costCenter;
  }

  async updateCostCenter(id, data) {
    const costCenter = await costCenterRepository.findById(id);
    if (!costCenter) {
      throw new ApiError(404, "Cost center not found", "COST_CENTER_NOT_FOUND");
    }

    // If code is being changed, check for duplicates
    if (data.code && data.code !== costCenter.code) {
      const existing = await costCenterRepository.findByCode(data.code);
      if (existing) {
        throw new ApiError(409, "Cost center code already exists", "DUPLICATE_CODE");
      }
    }

    const updated = await costCenterRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "CostCenter",
      entityId: updated._id,
      entityName: updated.name,
      description: `Cost Center ${updated.name} was updated`,
      category: "business",
      performedBy: data.updatedBy || costCenter.createdBy,
      performedByName: "",
    });

    return updated;
  }
}

export default new CostCenterService();
