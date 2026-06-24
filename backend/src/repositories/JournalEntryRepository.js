import BaseRepository from "./BaseRepository.js";
import JournalEntry from "../models/JournalEntry.js";

class JournalEntryRepository extends BaseRepository {
  constructor() {
    super(JournalEntry);
  }

  async findByVoucherNumber(voucherNumber) {
    return this.model.findOne({ voucherNumber });
  }

  async getLatestVoucher() {
    return this.model
      .findOne()
      .sort({ createdAt: -1 });
  }

  async getByStatus(status) {
    return this.model.find({ status });
  }

  async submit(id) {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: "Submitted"
      },
      {
        new: true
      }
    );
  }

  async cancel(id) {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: "Cancelled"
      },
      {
        new: true
      }
    );
  }
}

export default new JournalEntryRepository();