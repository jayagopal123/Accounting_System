import BaseRepository from "./BaseRepository.js";
import Payment from "../models/Payment.js";

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  async getLatestByPrefix(prefix) {
    // Find latest payment/receipt by prefix (PMT- or RCT-), sort numerically
    return this.model.findOne({
      paymentNumber: { $regex: `^${prefix}-` }
    })
      .sort({ paymentNumber: -1 }); // Sorting lexicographically works because of fixed-length padding
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
