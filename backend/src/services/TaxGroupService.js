import taxGroupRepository from "../repositories/TaxGroupRepository.js";
import taxRateRepository from "../repositories/TaxRateRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class TaxGroupService {
  async createTaxGroup(data) {
    const existing = await taxGroupRepository.findOne({ groupCode: data.groupCode });
    if (existing) {
      throw new ApiError(409, `Tax group code ${data.groupCode} already exists`, "GROUP_CODE_EXISTS");
    }

    // Validate all referenced tax rates exist
    if (data.taxes && data.taxes.length > 0) {
      for (const item of data.taxes) {
        const rate = await taxRateRepository.findById(item.taxRate);
        if (!rate) {
          throw new ApiError(404, `Tax rate with ID ${item.taxRate} not found`, "TAX_RATE_NOT_FOUND");
        }
      }
    }

    const group = await taxGroupRepository.create(data);

    await activityLogService.logActivity({
      action: "Created",
      entity: "TaxGroup",
      entityId: group._id,
      entityName: group.groupCode,
      description: `Tax group ${group.groupCode} (${group.groupName}) was created`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return group;
  }

  async getTaxGroups() {
    return taxGroupRepository.findAll();
  }

  async getActiveTaxGroups() {
    return taxGroupRepository.findActiveGroups();
  }

  async getTaxGroupById(id) {
    const group = await taxGroupRepository.findById(id);
    if (!group) {
      throw new ApiError(404, "Tax group not found", "TAX_GROUP_NOT_FOUND");
    }
    return group;
  }

  async updateTaxGroup(id, data) {
    const group = await this.getTaxGroupById(id);

    if (data.groupCode && data.groupCode !== group.groupCode) {
      const existing = await taxGroupRepository.findOne({ groupCode: data.groupCode });
      if (existing && String(existing._id) !== String(id)) {
        throw new ApiError(409, `Tax group code ${data.groupCode} already exists`, "GROUP_CODE_EXISTS");
      }
    }

    // Validate all referenced tax rates exist
    if (data.taxes && data.taxes.length > 0) {
      for (const item of data.taxes) {
        const rate = await taxRateRepository.findById(item.taxRate);
        if (!rate) {
          throw new ApiError(404, `Tax rate with ID ${item.taxRate} not found`, "TAX_RATE_NOT_FOUND");
        }
      }
    }

    const updated = await taxGroupRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "TaxGroup",
      entityId: updated._id,
      entityName: updated.groupCode,
      description: `Tax group ${updated.groupCode} was updated`,
      category: "business",
      performedBy: data.updatedBy || group.createdBy,
      performedByName: "",
    });

    return updated;
  }

  /**
   * Calculate the tax breakdown for a given subtotal using a tax group.
   * Returns { taxBreakdown: [{taxName, taxCode, taxType, rate, amount}], totalTax: number }
   */
  async calculateTax(groupId, subtotal) {
    const group = await taxGroupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(404, "Tax group not found", "TAX_GROUP_NOT_FOUND");
    }

    // Populate tax rates manually
    const populatedGroup = await taxGroupRepository.findById(groupId);
    await populatedGroup.populate("taxes.taxRate");

    const taxBreakdown = [];
    let totalTax = 0;

    for (const item of populatedGroup.taxes) {
      const rate = item.taxRate;
      if (!rate || !rate.isActive) continue;

      const taxAmount = (subtotal * rate.rate) / 100;
      taxBreakdown.push({
        taxName: rate.taxName,
        taxCode: rate.taxCode,
        taxType: rate.taxType,
        rate: rate.rate,
        amount: Math.round(taxAmount * 100) / 100,
      });
      totalTax += taxAmount;
    }

    return {
      taxBreakdown,
      totalTax: Math.round(totalTax * 100) / 100,
    };
  }
}

export default new TaxGroupService();
