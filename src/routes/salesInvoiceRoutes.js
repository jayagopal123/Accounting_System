import express from "express";

import salesInvoiceController from "../controllers/SalesInvoiceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  rbacMiddleware("sales_invoices:create"),
  salesInvoiceController.createSalesInvoice.bind(
    salesInvoiceController
  )
);

router.get(
  "/",
  authMiddleware,
  rbacMiddleware("sales_invoices:view"),
  salesInvoiceController.getSalesInvoices.bind(
    salesInvoiceController
  )
);

router.get(
  "/:id",
  authMiddleware,
  rbacMiddleware("sales_invoices:view"),
  salesInvoiceController.getSalesInvoiceById.bind(
    salesInvoiceController
  )
);

router.put(
  "/:id",
  authMiddleware,
  rbacMiddleware("sales_invoices:update"),
  salesInvoiceController.updateSalesInvoice.bind(
    salesInvoiceController
  )
);

router.patch(
  "/:id/submit",
  authMiddleware,
  rbacMiddleware("sales_invoices:submit"),
  salesInvoiceController.submitSalesInvoice.bind(
    salesInvoiceController
  )
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  rbacMiddleware("sales_invoices:cancel"),
  salesInvoiceController.cancelSalesInvoice.bind(
    salesInvoiceController
  )
);

export default router;