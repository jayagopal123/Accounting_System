import BaseRepository from "./BaseRepository.js";
import CustomerAging from "../models/CustomerAging.js";

class CustomerAgingRepository extends BaseRepository {
  constructor() {
    super(CustomerAging);
  }

  async findByCustomer(customerId) {
    return this.model.find({ customer: customerId });
  }

  async findByInvoice(invoiceId) {
    return this.model.findOne({ invoice: invoiceId });
  }
}

export default new CustomerAgingRepository();
