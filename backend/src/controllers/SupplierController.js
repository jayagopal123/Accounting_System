import supplierService from "../services/SupplierService.js";

class SupplierController {
  async createSupplier(req, res, next) {
    try {
      const supplier = await supplierService.createSupplier({
        ...req.body,
        createdBy: req.user?._id,
      });

      res.status(201).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }

  async getSuppliers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = ""
      } = req.query;

      const suppliers = await supplierService.getSuppliers(
        Number(page),
        Number(limit),
        search
      );

      res.status(200).json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      next(error);
    }
  }

  async getSupplierById(req, res, next) {
    try {
      const supplier =
        await supplierService.getSupplierById(
          req.params.id
        );

      res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSupplier(req, res, next) {
    try {
      const supplier =
        await supplierService.updateSupplier(
          req.params.id,
          { ...req.body, updatedBy: req.user?._id }
        );

      res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSupplier(req, res, next) {
    try {
      const supplier =
        await supplierService.deleteSupplier(
          req.params.id,
          req.user?._id
        );

      res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }

  async blockSupplier(req, res, next) {
    try {
      const supplier =
        await supplierService.blockSupplier(
          req.params.id,
          req.user?._id
        );

      res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }

  async activateSupplier(req, res, next) {
    try {
      const supplier =
        await supplierService.activateSupplier(
          req.params.id,
          req.user?._id
        );

      res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SupplierController();