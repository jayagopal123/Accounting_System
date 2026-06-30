import express from "express";
import financialReportController from "../controllers/FinancialReportController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/general-ledger",
  authenticate,
  financialReportController.getGeneralLedger,
);

router.get(
  "/trial-balance",
  authenticate,
  financialReportController.getTrialBalance,
);

router.get(
  "/profit-loss",
  authenticate,
  financialReportController.getProfitAndLoss,
);

router.get(
  "/balance-sheet",
  authenticate,
  financialReportController.getBalanceSheet,
);

router.get(
  "/cash-flow",
  authenticate,
  financialReportController.getCashFlow,
);

router.get(
  "/export",
  authenticate,
  financialReportController.exportReport,
);

export default router;
