import express from "express";
import budgetController from "../controllers/BudgetController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, budgetController.createBudget);
router.get("/", authenticate, budgetController.getBudgets);
router.get("/:id", authenticate, budgetController.getBudgetById);
router.patch("/:id", authenticate, budgetController.updateBudget);
router.patch("/:id/approve", authenticate, budgetController.approveBudget);
router.patch("/:id/close", authenticate, budgetController.closeBudget);
router.get("/:id/vs-actual", authenticate, budgetController.getBudgetVsActual);

export default router;
