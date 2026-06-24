import express from "express";

import supplierController from "../controllers/SupplierController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  rbacMiddleware("suppliers:create"),
  supplierController.createSupplier.bind(supplierController)
);

router.get(
  "/",
  authMiddleware,
  rbacMiddleware("suppliers:view"),
  supplierController.getSuppliers.bind(supplierController)
);

router.get(
  "/:id",
  authMiddleware,
  rbacMiddleware("suppliers:view"),
  supplierController.getSupplierById.bind(supplierController)
);

router.put(
  "/:id",
  authMiddleware,
  rbacMiddleware("suppliers:update"),
  supplierController.updateSupplier.bind(supplierController)
);

router.delete(
  "/:id",
  authMiddleware,
  rbacMiddleware("suppliers:delete"),
  supplierController.deleteSupplier.bind(supplierController)
);

router.patch(
  "/:id/block",
  authMiddleware,
  rbacMiddleware("suppliers:update"),
  supplierController.blockSupplier.bind(supplierController)
);

router.patch(
  "/:id/activate",
  authMiddleware,
  rbacMiddleware("suppliers:update"),
  supplierController.activateSupplier.bind(supplierController)
);

export default router;