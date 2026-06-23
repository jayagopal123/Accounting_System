import BaseRepository from "./BaseRepository.js";
import SalesInvoice from "../models/SalesInvoice.js";

class SalesInvoiceRepository extends BaseRepository {
  constructor() {
    super(SalesInvoice);
  }

  async findByInvoiceNumber(invoiceNumber) {
    return this.model.findOne({ invoiceNumber });
  }

  async getLatestInvoice() {
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

export default new SalesInvoiceRepository();