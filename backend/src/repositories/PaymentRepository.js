import BaseRepository from "./BaseRepository.js";
import Payment from "../models/Payment.js";

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  async getLatestPayment() {
    return this.model.findOne().sort({ createdAt: -1 });
  }

  async findByStatus(status) {
    return this.model.find({ status });
  }

  async findByInvoice(invoiceType, invoiceId) {
    return this.model.find({ invoiceType, invoice }).sort({ createdAt: -1 });
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

export default new PaymentRepository();
