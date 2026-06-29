import customerRepository from "../repositories/CustomerRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

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

    const customer = await customerRepository.create(customerData);

    await activityLogService.logActivity({
      action: "Created",
      entity: "Customer",
      entityId: customer._id,
      entityName: customer.customerName,
      description: `Customer "${customer.customerName}" was created`,
      category: "business",
      performedBy: customerData.createdBy,
      performedByName: customerData.createdByName || "",
    });

    return customer;
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
    const customer = await this.getCustomerById(id);

    const updated = await customerRepository.update(id, data);

    await activityLogService.logActivity({
      action: "Updated",
      entity: "Customer",
      entityId: customer._id,
      entityName: customer.customerName,
      description: `Customer "${customer.customerName}" was updated`,
      category: "business",
      performedBy: data.updatedBy,
      performedByName: data.updatedByName || "",
    });

    return updated;
  }

  async deleteCustomer(id, userId) {
    const customer = await this.getCustomerById(id);

    const updated = await customerRepository.update(id, {
      status: "Inactive"
    });

    await activityLogService.logActivity({
      action: "Deleted",
      entity: "Customer",
      entityId: customer._id,
      entityName: customer.customerName,
      description: `Customer "${customer.customerName}" was deactivated`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }

  async blockCustomer(id, userId) {
    const customer = await this.getCustomerById(id);

    const updated = await customerRepository.update(id, {
      status: "Blocked"
    });

    await activityLogService.logActivity({
      action: "Blocked",
      entity: "Customer",
      entityId: customer._id,
      entityName: customer.customerName,
      description: `Customer "${customer.customerName}" was blocked`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }

  async activateCustomer(id, userId) {
    const customer = await this.getCustomerById(id);

    const updated = await customerRepository.update(id, {
      status: "Active"
    });

    await activityLogService.logActivity({
      action: "Activated",
      entity: "Customer",
      entityId: customer._id,
      entityName: customer.customerName,
      description: `Customer "${customer.customerName}" was activated`,
      category: "business",
      performedBy: userId,
      performedByName: "",
    });

    return updated;
  }
}

export default new CustomerService();