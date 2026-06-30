import BaseRepository from "./BaseRepository.js";
import Budget from "../models/Budget.js";

class BudgetRepository extends BaseRepository {
  constructor() {
    super(Budget);
  }

  async findByFiscalYear(fiscalYearId) {
    return this.model.find({ fiscalYear: fiscalYearId }).sort({ createdAt: -1 });
  }

  async findApproved() {
    return this.model.find({ status: "Approved" });
  }

  async approve(id) {
    return this.model.findByIdAndUpdate(
      id,
      { status: "Approved" },
      { new: true },
    );
  }

  async close(id) {
    return this.model.findByIdAndUpdate(
      id,
      { status: "Closed" },
      { new: true },
    );
  }
}

export default new BudgetRepository();
