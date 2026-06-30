import numberingSeriesRepository from "../repositories/NumberingSeriesRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class NumberingSeriesService {
  async createNumberingSeries(data) {
    // Validate that startingNumber is set when creating
    if (!data.startingNumber || data.startingNumber < 1) {
      data.startingNumber = 1;
    }

    const series = await numberingSeriesRepository.create(data);

    await activityLogService.logActivity({
      action: "Created",
      entity: "NumberingSeries",
      entityId: series._id,
      entityName: series.documentType,
      description: `Numbering series for ${series.documentType} was created with prefix "${series.prefix}"`,
      category: "business",
      performedBy: data.createdBy,
      performedByName: "",
    });

    return series;
  }

  async getNumberingSeries() {
    return numberingSeriesRepository.findAll();
  }

  async getNumberingSeriesById(id) {
    const series = await numberingSeriesRepository.findById(id);
    if (!series) {
      throw new ApiError(404, "Numbering series not found", "SERIES_NOT_FOUND");
    }
    return series;
  }

  async updateNumberingSeries(id, data) {
    const series = await numberingSeriesRepository.findById(id);
    if (!series) {
      throw new ApiError(404, "Numbering series not found", "SERIES_NOT_FOUND");
    }

    const updated = await numberingSeriesRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "NumberingSeries",
      entityId: updated._id,
      entityName: updated.documentType,
      description: `Numbering series for ${updated.documentType} was updated`,
      category: "business",
      performedBy: data.updatedBy || series.createdBy,
      performedByName: "",
    });

    return updated;
  }

  async generateNextNumber(documentType) {
    const series = await numberingSeriesRepository.getNextNumber(documentType);
    if (!series) {
      throw new ApiError(
        404,
        `No active numbering series found for ${documentType}`,
        "SERIES_NOT_FOUND",
      );
    }

    // If this is the first use, set currentNumber to startingNumber
    if (series.currentNumber === 0) {
      series.currentNumber = series.startingNumber - 1;
      await numberingSeriesRepository.update(series._id, {
        currentNumber: series.startingNumber - 1,
      });
      // Re-increment
      return this.generateNextNumber(documentType);
    }

    return `${series.prefix}-${String(series.currentNumber).padStart(series.padLength, "0")}`;
  }
}

export default new NumberingSeriesService();
