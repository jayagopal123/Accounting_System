import BaseRepository from "./BaseRepository.js";
import VendorStatement from "../models/VendorStatement.js";

class VendorStatementRepository extends BaseRepository {
  constructor() {
    super(VendorStatement);
  }

  async findBySupplier(supplierId, sort = { date: 1 }) {
    return this.model.find({ supplier: supplierId }).sort(sort);
  }

  async findLatestBySupplier(supplierId) {
    return this.model
      .findOne({ supplier: supplierId })
      .sort({ date: -1, createdAt: -1 });
  }
}

export default new VendorStatementRepository();
