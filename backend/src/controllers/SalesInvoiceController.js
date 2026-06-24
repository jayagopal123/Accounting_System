import salesInvoiceService from "../services/SalesInvoiceService.js";

class SalesInvoiceController {
  async createSalesInvoice(req, res, next) {
    try {
      const salesInvoice = await salesInvoiceService.createSalesInvoice({
        ...req.body,
        createdBy: req.user._id,
      });

      res.status(201).json({
        success: true,
        data: salesInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesInvoices(req, res, next) {
    try {
      const salesInvoices = await salesInvoiceService.getSalesInvoices();

      res.status(200).json({
        success: true,
        data: salesInvoices,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesInvoiceById(req, res, next) {
    try {
      const salesInvoice = await salesInvoiceService.getSalesInvoiceById(
        req.params.id
      );

      res.status(200).json({
        success: true,
        data: salesInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSalesInvoice(req, res, next) {
    try {
      const salesInvoice = await salesInvoiceService.updateSalesInvoice(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        data: salesInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitSalesInvoice(req, res, next) {
    try {
      const salesInvoice = await salesInvoiceService.submitSalesInvoice(
        req.params.id
      );

      res.status(200).json({
        success: true,
        data: salesInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSalesInvoice(req, res, next) {
    try {
      const salesInvoice = await salesInvoiceService.cancelSalesInvoice(
        req.params.id
      );

      res.status(200).json({
        success: true,
        data: salesInvoice,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SalesInvoiceController();