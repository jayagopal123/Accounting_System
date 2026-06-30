import assetCategoryRepository from "../repositories/AssetCategoryRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class AssetCategoryService {
  async createCategory(data) {
    const existing = await assetCategoryRepository.findByCode(data.categoryCode);
    if (existing) {
      throw new ApiError(409, "Asset category with this code already exists", "DUPLICATE_CATEGORY_CODE");
    }

    const category = await assetCategoryRepository.create(data);

    await activityLogService.logActivity({
      action: "Created",
      entity: "AssetCategory",
      entityId: category._id,
      entityName: category.categoryName,
      description: `Asset category ${category.categoryName} (${category.categoryCode}) was created`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return category;
  }

  async getCategories() {
    return assetCategoryRepository.findAll();
  }

  async getCategoryById(id) {
    const category = await assetCategoryRepository.findById(id);
    if (!category) {
      throw new ApiError(404, "Asset category not found", "CATEGORY_NOT_FOUND");
    }
    return category;
  }

  async updateCategory(id, data) {
    const category = await assetCategoryRepository.findById(id);
    if (!category) {
      throw new ApiError(404, "Asset category not found", "CATEGORY_NOT_FOUND");
    }

    if (data.categoryCode && data.categoryCode !== category.categoryCode) {
      const existing = await assetCategoryRepository.findByCode(data.categoryCode);
      if (existing) {
        throw new ApiError(409, "Asset category with this code already exists", "DUPLICATE_CATEGORY_CODE");
      }
    }

    const updated = await assetCategoryRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "AssetCategory",
      entityId: updated._id,
      entityName: updated.categoryName,
      description: `Asset category ${updated.categoryName} was updated`,
      category: "business",
      performedBy: data.updatedBy || category.createdBy,
      performedByName: "",
    });

    return updated;
  }

  async toggleCategoryStatus(id, userId) {
    const category = await assetCategoryRepository.findById(id);
    if (!category) {
      throw new ApiError(404, "Asset category not found", "CATEGORY_NOT_FOUND");
    }

    const updated = await assetCategoryRepository.update(id, {
      isActive: !category.isActive,
      updatedBy: userId,
    });

    const action = updated.isActive ? "Activated" : "Deactivated";

    await activityLogService.logActivity({
      action,
      entity: "AssetCategory",
      entityId: updated._id,
      entityName: updated.categoryName,
      description: `Asset category ${updated.categoryName} was ${action.toLowerCase()}`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }
}

export default new AssetCategoryService();
