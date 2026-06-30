import BaseRepository from "./BaseRepository.js";
import CreditNote from "../models/CreditNote.js";

class CreditNoteRepository extends BaseRepository {
  constructor() {
    super(CreditNote);
  }

  async findByCreditNoteNumber(creditNoteNumber) {
    return this.model.findOne({ creditNoteNumber });
  }

  async getLatestCreditNote() {
    return this.model.findOne().sort({ createdAt: -1 });
  }

  async getByStatus(status) {
    return this.model.find({ status });
  }

  async submit(id) {
    return this.model.findByIdAndUpdate(
      id,
      { status: "Submitted" },
      { new: true },
    );
  }

  async cancel(id) {
    return this.model.findByIdAndUpdate(
      id,
      { status: "Cancelled" },
      { new: true },
    );
  }
}

export default new CreditNoteRepository();
