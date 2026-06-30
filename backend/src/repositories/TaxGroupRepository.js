import TaxGroup from "../models/TaxGroup.js";

class TaxGroupRepository {
  async create(data) {
    return TaxGroup.create(data);
  }

  async findById(id) {
    return TaxGroup.findById(id);
  }

  async findOne(filter) {
    return TaxGroup.findOne(filter);
  }

  async findAll(filter = {}) {
    return TaxGroup.find(filter).sort({ groupCode: 1 }).populate("taxes.taxRate");
  }

  async find(filter = {}, populateFields = "") {
    return TaxGroup.find(filter).sort({ groupCode: 1 }).populate(populateFields);
  }

  async update(id, data) {
    return TaxGroup.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return TaxGroup.findByIdAndDelete(id);
  }

  async findActiveGroups() {
    return TaxGroup.find({ isActive: true })
      .sort({ groupCode: 1 })
      .populate({
        path: "taxes.taxRate",
        match: { isActive: true },
      });
  }
}

export default new TaxGroupRepository();
