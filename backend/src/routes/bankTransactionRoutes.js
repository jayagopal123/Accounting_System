import express from "express";
import bankTransactionController from "../controllers/BankTransactionController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, bankTransactionController.createTransaction);
router.get("/", authenticate, bankTransactionController.getTransactions);
router.get("/:id", authenticate, bankTransactionController.getTransactionById);
router.get("/by-account/:bankAccountId", authenticate, bankTransactionController.getTransactionsByBankAccount);
router.get("/unreconciled/:bankAccountId", authenticate, bankTransactionController.getUnreconciledTransactions);
router.patch("/:id/status", authenticate, bankTransactionController.updateTransactionStatus);
router.patch("/:id/cancel", authenticate, bankTransactionController.cancelTransaction);

export default router;
