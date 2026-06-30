import fiscalYearRepository from "../repositories/FiscalYearRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class FiscalYearService {
  async createFiscalYear(data) {
    // If this is set as default, unset any existing default
    if (data.isDefault) {
      await fiscalYearRepository.updateMany(
        { isDefault: true },
        { isDefault: false },
      );
    }

    // Validate date range
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new ApiError(
        400,
        "End date must be after start date",
        "INVALID_DATE_RANGE",
      );
    }

    const fiscalYear = await fiscalYearRepository.create(data);

    await activityLogService.logActivity({
      action: "Created",
      entity: "FiscalYear",
      entityId: fiscalYear._id,
      entityName: fiscalYear.yearName,
      description: `Fiscal Year ${fiscalYear.yearName} was created`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return fiscalYear;
  }

  async getFiscalYears() {
    return fiscalYearRepository.findAll();
  }

  async getFiscalYearById(id) {
    const fiscalYear = await fiscalYearRepository.findById(id);
    if (!fiscalYear) {
      throw new ApiError(404, "Fiscal year not found", "FISCAL_YEAR_NOT_FOUND");
    }
    return fiscalYear;
  }

  async updateFiscalYear(id, data) {
    const fiscalYear = await fiscalYearRepository.findById(id);
    if (!fiscalYear) {
      throw new ApiError(404, "Fiscal year not found", "FISCAL_YEAR_NOT_FOUND");
    }

    // If setting as default, unset any existing default
    if (data.isDefault) {
      await fiscalYearRepository.updateMany(
        { isDefault: true, _id: { $ne: id } },
        { isDefault: false },
      );
    }

    // Validate date range if both dates provided
    const startDate = data.startDate || fiscalYear.startDate;
    const endDate = data.endDate || fiscalYear.endDate;
    if (new Date(startDate) >= new Date(endDate)) {
      throw new ApiError(
        400,
        "End date must be after start date",
        "INVALID_DATE_RANGE",
      );
    }

    const updated = await fiscalYearRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "FiscalYear",
      entityId: updated._id,
      entityName: updated.yearName,
      description: `Fiscal Year ${updated.yearName} was updated`,
      category: "business",
      performedBy: data.updatedBy || fiscalYear.createdBy,
      performedByName: "",
    });

    return updated;
  }

  async closeFiscalYear(id, userId) {
    const fiscalYear = await fiscalYearRepository.findById(id);
    if (!fiscalYear) {
      throw new ApiError(404, "Fiscal year not found", "FISCAL_YEAR_NOT_FOUND");
    }
    if (fiscalYear.status === "Closed") {
      throw new ApiError(400, "Fiscal year already closed", "ALREADY_CLOSED");
    }

    const closed = await fiscalYearRepository.update(id, { status: "Closed", updatedBy: userId });

    await activityLogService.logActivity({
      action: "Closed",
      entity: "FiscalYear",
      entityId: closed._id,
      entityName: closed.yearName,
      description: `Fiscal Year ${closed.yearName} was closed`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return closed;
  }
}

export default new FiscalYearService();
