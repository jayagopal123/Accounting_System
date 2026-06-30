import express from "express";
import bankReconciliationController from "../controllers/BankReconciliationController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, bankReconciliationController.createReconciliation);
router.get("/", authenticate, bankReconciliationController.getReconciliations);
router.get("/:id", authenticate, bankReconciliationController.getReconciliationById);
router.patch("/:id/match", authenticate, bankReconciliationController.matchTransactions);
router.patch("/:id/complete", authenticate, bankReconciliationController.completeReconciliation);
router.patch("/:id/verify", authenticate, bankReconciliationController.verifyReconciliation);

export default router;
