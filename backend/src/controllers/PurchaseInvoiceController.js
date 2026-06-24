import purchaseInvoiceService from "../services/PurchaseInvoiceService.js";

class PurchaseInvoiceController {
  async createPurchaseInvoice(req, res, next) {
    try {
      const purchaseInvoice =
        await purchaseInvoiceService.createPurchaseInvoice({
          ...req.body,
          createdBy: req.user._id,
        });

      res.status(201).json({
        success: true,
        data: purchaseInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseInvoices(req, res, next) {
    try {
      const purchaseInvoices =
        await purchaseInvoiceService.getPurchaseInvoices();

      res.status(200).json({
        success: true,
        data: purchaseInvoices,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseInvoiceById(req, res, next) {
    try {
      const purchaseInvoice =
        await purchaseInvoiceService.getPurchaseInvoiceById(
          req.params.id
        );

      res.status(200).json({
        success: true,
        data: purchaseInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePurchaseInvoice(req, res, next) {
    try {
      const purchaseInvoice =
        await purchaseInvoiceService.updatePurchaseInvoice(
          req.params.id,
          req.body
        );

      res.status(200).json({
        success: true,
        data: purchaseInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitPurchaseInvoice(req, res, next) {
    try {
      const purchaseInvoice =
        await purchaseInvoiceService.submitPurchaseInvoice(
          req.params.id
        );

      res.status(200).json({
        success: true,
        data: purchaseInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelPurchaseInvoice(req, res, next) {
    try {
      const purchaseInvoice =
        await purchaseInvoiceService.cancelPurchaseInvoice(
          req.params.id
        );

      res.status(200).json({
        success: true,
        data: purchaseInvoice,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PurchaseInvoiceController();