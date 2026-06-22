import BaseRepository from "./BaseRepository.js";
import Customer from "../models/Customer.js";

class CustomerRepository extends BaseRepository {
  constructor() {
    super(Customer);
  }

  async findByCustomerCode(customerCode) {
    return this.model.findOne({ customerCode });
  }

  async findByEmail(email) {
    return this.model.findOne({ "contacts.email": email });
  }

  async search(search, page = 1, limit = 10) {
    const query = {
      $or: [
        { customerName: { $regex: search, $options: "i" } },
        { customerCode: { $regex: search, $options: "i" } },
        { gstNumber: { $regex: search, $options: "i" } },
        { "contacts.email": { $regex: search, $options: "i" } }
      ]
    };

    const skip = (page - 1) * limit;

    const customers = await this.model
      .find(query)
      .skip(skip)
      .limit(limit);

    const total = await this.model.countDocuments(query);

    return {
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export default new CustomerRepository();