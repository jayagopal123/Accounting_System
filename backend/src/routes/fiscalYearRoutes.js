import express from "express";
import fiscalYearController from "../controllers/FiscalYearController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, fiscalYearController.createFiscalYear);
router.get("/", authenticate, fiscalYearController.getFiscalYears);
router.get("/:id", authenticate, fiscalYearController.getFiscalYearById);
router.patch("/:id", authenticate, fiscalYearController.updateFiscalYear);
router.patch("/:id/close", authenticate, fiscalYearController.closeFiscalYear);

export default router;
