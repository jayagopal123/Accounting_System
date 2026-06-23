import express from "express";

import purchaseInvoiceController from "../controllers/PurchaseInvoiceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  rbacMiddleware("purchase_invoices:create"),
  purchaseInvoiceController.createPurchaseInvoice.bind(
    purchaseInvoiceController
  )
);

router.get(
  "/",
  authMiddleware,
  rbacMiddleware("purchase_invoices:view"),
  purchaseInvoiceController.getPurchaseInvoices.bind(
    purchaseInvoiceController
  )
);

router.get(
  "/:id",
  authMiddleware,
  rbacMiddleware("purchase_invoices:view"),
  purchaseInvoiceController.getPurchaseInvoiceById.bind(
    purchaseInvoiceController
  )
);

router.put(
  "/:id",
  authMiddleware,
  rbacMiddleware("purchase_invoices:update"),
  purchaseInvoiceController.updatePurchaseInvoice.bind(
    purchaseInvoiceController
  )
);

router.patch(
  "/:id/submit",
  authMiddleware,
  rbacMiddleware("purchase_invoices:submit"),
  purchaseInvoiceController.submitPurchaseInvoice.bind(
    purchaseInvoiceController
  )
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  rbacMiddleware("purchase_invoices:cancel"),
  purchaseInvoiceController.cancelPurchaseInvoice.bind(
    purchaseInvoiceController
  )
);

export default router;