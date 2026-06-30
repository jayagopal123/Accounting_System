import express from "express";
import paymentController from "../controllers/PaymentController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, paymentController.createPayment);

router.get("/", authenticate, paymentController.getPayments);

router.get("/:id", authenticate, paymentController.getPaymentById);

router.patch("/:id/submit", authenticate, paymentController.submitPayment);

router.patch("/:id/cancel", authenticate, paymentController.cancelPayment);

export default router;
