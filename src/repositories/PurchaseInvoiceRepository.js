import BaseRepository from "./BaseRepository.js";
import PurchaseInvoice from "../models/PurchaseInvoice.js";

class PurchaseInvoiceRepository extends BaseRepository {
  constructor() {
    super(PurchaseInvoice);
  }

  async findByInvoiceNumber(invoiceNumber) {
    return this.model.findOne({ invoiceNumber });
  }

  async getLatestInvoice() {
    return this.model.findOne().sort({ createdAt: -1 });
  }

  async getByStatus(status) {
    return this.model.find({ status });
  }

  async submit(id) {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: "Submitted",
      },
      {
        new: true,
      }
    );
  }

  async cancel(id) {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: "Cancelled",
      },
      {
        new: true,
      }
    );
  }
}

export default new PurchaseInvoiceRepository();