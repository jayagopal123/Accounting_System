import TaxRate from "../models/TaxRate.js";

class TaxRateRepository {
  async create(data) {
    return TaxRate.create(data);
  }

  async findById(id) {
    return TaxRate.findById(id);
  }

  async findOne(filter) {
    return TaxRate.findOne(filter);
  }

  async findAll(filter = {}) {
    return TaxRate.find(filter).sort({ taxCode: 1 });
  }

  async find(filter = {}, populateFields = "") {
    return TaxRate.find(filter).sort({ taxCode: 1 }).populate(populateFields);
  }

  async update(id, data) {
    return TaxRate.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return TaxRate.findByIdAndDelete(id);
  }

  async findActiveRates() {
    const now = new Date();
    return TaxRate.find({
      isActive: true,
      $or: [
        { effectiveTo: null },
        { effectiveTo: { $gte: now } },
      ],
      effectiveFrom: { $lte: now },
    }).sort({ taxType: 1, rate: 1 });
  }
}

export default new TaxRateRepository();
