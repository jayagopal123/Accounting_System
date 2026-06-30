import BaseRepository from "./BaseRepository.js";
import DebitNote from "../models/DebitNote.js";

class DebitNoteRepository extends BaseRepository {
  constructor() {
    super(DebitNote);
  }

  async findByDebitNoteNumber(debitNoteNumber) {
    return this.model.findOne({ debitNoteNumber });
  }

  async getLatestDebitNote() {
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

export default new DebitNoteRepository();
