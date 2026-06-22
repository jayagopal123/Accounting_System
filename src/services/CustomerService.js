import customerRepository from "../repositories/CustomerRepository.js";
import ApiError from "../utils/ApiError.js";

class CustomerService {
  async createCustomer(customerData) {
    const existingCustomer =
      await customerRepository.findByCustomerCode(
        customerData.customerCode
      );

    if (existingCustomer) {
      throw new ApiError(
        409,
        "Customer code already exists",
        "CUSTOMER_ALREADY_EXISTS"
      );
    }

    return customerRepository.create(customerData);
  }

  async getCustomers(page, limit, search) {
    if (search) {
      return customerRepository.search(search, page, limit);
    }

    return customerRepository.findAll({}, page, limit);
  }

  async getCustomerById(id) {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new ApiError(
        404,
        "Customer not found",
        "CUSTOMER_NOT_FOUND"
      );
    }

    return customer;
  }

  async updateCustomer(id, data) {
    await this.getCustomerById(id);

    return customerRepository.update(id, data);
  }

  async deleteCustomer(id) {
    await this.getCustomerById(id);

    return customerRepository.update(id, {
      status: "Inactive"
    });
  }

  async blockCustomer(id) {
    await this.getCustomerById(id);

    return customerRepository.update(id, {
      status: "Blocked"
    });
  }

  async activateCustomer(id) {
    await this.getCustomerById(id);

    return customerRepository.update(id, {
      status: "Active"
    });
  }
}

export default new CustomerService();