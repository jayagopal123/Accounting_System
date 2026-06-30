import taxRateRepository from "../repositories/TaxRateRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class TaxRateService {
  async createTaxRate(data) {
    const existing = await taxRateRepository.findOne({ taxCode: data.taxCode });
    if (existing) {
      throw new ApiError(409, `Tax code ${data.taxCode} already exists`, "TAX_CODE_EXISTS");
    }

    const taxRate = await taxRateRepository.create(data);

    await activityLogService.logActivity({
      action: "Created",
      entity: "TaxRate",
      entityId: taxRate._id,
      entityName: taxRate.taxCode,
      description: `Tax rate ${taxRate.taxCode} (${taxRate.rate}% ${taxRate.taxType}) was created`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return taxRate;
  }

  async getTaxRates() {
    return taxRateRepository.findAll();
  }

  async getActiveTaxRates() {
    return taxRateRepository.findActiveRates();
  }

  async getTaxRateById(id) {
    const taxRate = await taxRateRepository.findById(id);
    if (!taxRate) {
      throw new ApiError(404, "Tax rate not found", "TAX_RATE_NOT_FOUND");
    }
    return taxRate;
  }

  async updateTaxRate(id, data) {
    const taxRate = await this.getTaxRateById(id);

    if (data.taxCode && data.taxCode !== taxRate.taxCode) {
      const existing = await taxRateRepository.findOne({ taxCode: data.taxCode });
      if (existing && String(existing._id) !== String(id)) {
        throw new ApiError(409, `Tax code ${data.taxCode} already exists`, "TAX_CODE_EXISTS");
      }
    }

    const updated = await taxRateRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "TaxRate",
      entityId: updated._id,
      entityName: updated.taxCode,
      description: `Tax rate ${updated.taxCode} was updated`,
      category: "business",
      performedBy: data.updatedBy || taxRate.createdBy,
      performedByName: "",
    });

    return updated;
  }
}

export default new TaxRateService();
