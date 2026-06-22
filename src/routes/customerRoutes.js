import express from "express";

import customerController from "../controllers/CustomerController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

import rbacMiddleware from "../middlewares/rbacMiddleware.js";

import validate from "../middlewares/validateMiddleware.js";

import {
  createCustomerSchema,
  updateCustomerSchema
} from "../validators/customerValidator.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  rbacMiddleware("customers:create"),
  validate(createCustomerSchema),
  customerController.createCustomer.bind(customerController)
);

router.get(
  "/",
  authMiddleware,
  rbacMiddleware("customers:view"),
  customerController.getCustomers.bind(customerController)
);

router.get(
  "/:id",
  authMiddleware,
  rbacMiddleware("customers:view"),
  customerController.getCustomerById.bind(customerController)
);

router.put(
  "/:id",
  authMiddleware,
  rbacMiddleware("customers:update"),
  validate(updateCustomerSchema),
  customerController.updateCustomer.bind(customerController)
);

router.delete(
  "/:id",
  authMiddleware,
  rbacMiddleware("customers:delete"),
  customerController.deleteCustomer.bind(customerController)
);

router.patch(
  "/:id/block",
  authMiddleware,
  rbacMiddleware("customers:update"),
  customerController.blockCustomer.bind(customerController)
);

router.patch(
  "/:id/activate",
  authMiddleware,
  rbacMiddleware("customers:update"),
  customerController.activateCustomer.bind(customerController)
);

export default router;