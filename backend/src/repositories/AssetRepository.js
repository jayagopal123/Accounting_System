import BaseRepository from "./BaseRepository.js";
import Asset from "../models/Asset.js";

class AssetRepository extends BaseRepository {
  constructor() {
    super(Asset);
  }

  async findByCode(assetCode) {
    return this.model.findOne({ assetCode });
  }

  async findByCategory(categoryId) {
    return this.model
      .find({ category: categoryId })
      .sort({ purchaseDate: -1 });
  }

  async findByStatus(status) {
    return this.model
      .find({ status })
      .populate("category", "categoryName categoryCode")
      .sort({ purchaseDate: -1 });
  }

  async findActive() {
    return this.model
      .find({ status: { $in: ["Active", "Depreciated"] } })
      .populate("category", "categoryName categoryCode")
      .sort({ purchaseDate: -1 });
  }

  async findDueForDepreciation() {
    const now = new Date();
    return this.model
      .find({
        status: "Active",
        nextDepreciationDate: { $lte: now },
        depreciationMethod: { $ne: "None" },
      })
      .populate("category", "categoryName defaultDepreciationMethod defaultUsefulLife");
  }

  async getTotalAssetValue() {
    const result = await this.model.aggregate([
      { $match: { status: { $in: ["Active", "Depreciated"] } } },
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$purchaseCost" },
          totalDepreciation: { $sum: "$accumulatedDepreciation" },
          totalCurrentValue: { $sum: "$currentValue" },
        },
      },
    ]);
    return result[0] || { totalCost: 0, totalDepreciation: 0, totalCurrentValue: 0 };
  }

  async getDepreciationSummaryByCategory() {
    return this.model.aggregate([
      { $match: { status: { $in: ["Active", "Depreciated"] } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalCost: { $sum: "$purchaseCost" },
          totalDepreciation: { $sum: "$accumulatedDepreciation" },
          totalCurrentValue: { $sum: "$currentValue" },
        },
      },
    ]);
  }

  async activate(id) {
    return this.model.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true },
    );
  }

  async dispose(id, data) {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: "Disposed",
        disposalDate: data.disposalDate || new Date(),
        disposalAmount: data.disposalAmount || 0,
        disposalRemarks: data.disposalRemarks || "",
        updatedBy: data.updatedBy,
      },
      { new: true },
    );
  }
}

export default new AssetRepository();
