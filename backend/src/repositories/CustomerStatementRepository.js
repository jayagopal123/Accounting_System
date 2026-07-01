import BaseRepository from "./BaseRepository.js";
import CustomerStatement from "../models/CustomerStatement.js";

class CustomerStatementRepository extends BaseRepository {
  constructor() {
    super(CustomerStatement);
  }

  async findByCustomer(customerId, sort = { date: 1 }) {
    return this.model.find({ customer: customerId }).sort(sort);
  }

  async findLatestByCustomer(customerId) {
    return this.model
      .findOne({ customer: customerId })
      .sort({ date: -1, createdAt: -1 });
  }
}

export default new CustomerStatementRepository();
