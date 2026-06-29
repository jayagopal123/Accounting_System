import customerService from "../services/CustomerService.js";

class CustomerController {
  async createCustomer(req, res, next) {
    try {
      const customer = await customerService.createCustomer({
        ...req.body,
        createdBy: req.user?._id,
      });

      res.status(201).json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req, res, next) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;

      const customers = await customerService.getCustomers(
        Number(page),
        Number(limit),
        search
      );

      res.status(200).json({
        success: true,
        data: customers
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const customer = await customerService.getCustomerById(
        req.params.id
      );

      res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const customer = await customerService.updateCustomer(
        req.params.id,
        { ...req.body, updatedBy: req.user?._id }
      );

      res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req, res, next) {
    try {
      const customer = await customerService.deleteCustomer(
        req.params.id,
        req.user?._id
      );

      res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async blockCustomer(req, res, next) {
    try {
      const customer = await customerService.blockCustomer(
        req.params.id,
        req.user?._id
      );

      res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async activateCustomer(req, res, next) {
    try {
      const customer = await customerService.activateCustomer(
        req.params.id,
        req.user?._id
      );

      res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();