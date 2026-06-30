import BaseRepository from "./BaseRepository.js";
import AssetCategory from "../models/AssetCategory.js";

class AssetCategoryRepository extends BaseRepository {
  constructor() {
    super(AssetCategory);
  }

  async findByCode(categoryCode) {
    return this.model.findOne({ categoryCode });
  }

  async findActive() {
    return this.model.find({ isActive: true }).sort({ categoryName: 1 });
  }
}

export default new AssetCategoryRepository();
