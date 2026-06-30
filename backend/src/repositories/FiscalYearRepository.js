import BaseRepository from "./BaseRepository.js";
import FiscalYear from "../models/FiscalYear.js";

class FiscalYearRepository extends BaseRepository {
  constructor() {
    super(FiscalYear);
  }

  async findActive() {
    return this.model.findOne({ status: "Active" });
  }

  async findDefault() {
    return this.model.findOne({ isDefault: true });
  }

  async updateMany(filter, updateData) {
    return this.model.updateMany(filter, updateData);
  }
}

export default new FiscalYearRepository();
