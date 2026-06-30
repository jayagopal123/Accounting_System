import express from "express";
import bankAccountController from "../controllers/BankAccountController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, bankAccountController.createBankAccount);
router.get("/", authenticate, bankAccountController.getBankAccounts);
router.get("/:id", authenticate, bankAccountController.getBankAccountById);
router.patch("/:id", authenticate, bankAccountController.updateBankAccount);
router.patch("/:id/toggle-status", authenticate, bankAccountController.toggleBankAccountStatus);

export default router;
